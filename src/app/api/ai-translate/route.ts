import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath, revalidateTag } from 'next/cache'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'
import {
  applyTranslatedContent,
  extractTranslatableContent,
  getLocalizedFieldPaths,
  translateContent,
} from '@/lib/groq-translator'

type CollectionSlug =
  | 'users'
  | 'media'
  | 'categories'
  | 'locations'
  | 'activities'
  | 'bookings'
  | 'blog-posts'
  | 'contact-submissions'
type GlobalSlug = 'home-page' | 'about-page' | 'contact-page'

interface TranslateRequest {
  type: 'collection' | 'global'
  slug: string
  documentId?: string
  sourceLocale: string
  targetLocales: string[]
}

const REVALIDATION_MAP: Record<string, string[]> = {
  activities: ['/en', '/fr', '/de', '/en/activities', '/fr/activities', '/de/activities'],
  'blog-posts': ['/en/blog', '/fr/blog', '/de/blog'],
  categories: ['/en', '/fr', '/de', '/en/activities', '/fr/activities', '/de/activities'],
  locations: ['/en', '/fr', '/de'],
  'home-page': ['/en', '/fr', '/de'],
  'about-page': ['/en/about', '/fr/about', '/de/about'],
  'contact-page': ['/en/contact', '/fr/contact', '/de/contact'],
}

const COLLECTION_TAGS: Record<string, string[]> = {
  activities: ['activities', 'homepage'],
  'blog-posts': ['blog-posts', 'blog'],
  categories: ['categories', 'activities'],
  locations: ['locations'],
  'home-page': ['homepage', 'home-page'],
  'about-page': ['about-page'],
  'contact-page': ['contact-page'],
}

function getPathsForRevalidation(
  type: 'collection' | 'global',
  collectionSlug: string,
  documentSlug?: string,
): string[] {
  const paths = [...(REVALIDATION_MAP[collectionSlug] || [])]
  if (type === 'collection' && documentSlug) {
    const collectionPath = collectionSlug === 'blog-posts' ? 'blog' : 'activities'
    paths.push(
      `/en/${collectionPath}/${documentSlug}`,
      `/fr/${collectionPath}/${documentSlug}`,
      `/de/${collectionPath}/${documentSlug}`,
    )
  }
  return paths
}

function getTagsForRevalidation(_type: 'collection' | 'global', slug: string): string[] {
  return COLLECTION_TAGS[slug] || []
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    let user = null
    try {
      const { user: verifiedUser } = await payload.auth({ headers: request.headers })
      user = verifiedUser
    } catch (authError) {
      console.log('[AI-Translate] Auth check failed:', authError)
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to the admin panel.' },
        { status: 401 },
      )
    }

    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'ai-translate', RATE_LIMITS.aiTranslate)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Please try again in ${rateLimitResult.resetIn} seconds.`,
          retryAfter: rateLimitResult.resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.resetIn),
            'X-RateLimit-Remaining': '0',
          },
        },
      )
    }

    const body: TranslateRequest = await request.json()
    const { type, slug, documentId, sourceLocale, targetLocales } = body

    if (!type || !slug || !sourceLocale || !targetLocales?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: type, slug, sourceLocale, targetLocales' },
        { status: 400 },
      )
    }

    if (type === 'collection' && !documentId) {
      return NextResponse.json(
        { error: 'documentId is required for collection translations' },
        { status: 400 },
      )
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured. Add it to your environment variables.' },
        { status: 500 },
      )
    }

    let fields: any[]
    let sourceDocument: any

    if (type === 'collection') {
      const collectionConfig = payload.config.collections.find((c) => c.slug === slug)
      if (!collectionConfig) {
        return NextResponse.json({ error: `Collection "${slug}" not found` }, { status: 404 })
      }
      fields = collectionConfig.fields
      sourceDocument = await payload.findByID({
        collection: slug as CollectionSlug,
        id: documentId!,
        locale: sourceLocale as any,
        depth: 0,
      })
    } else {
      const globalConfig = payload.config.globals.find((g) => g.slug === slug)
      if (!globalConfig) {
        return NextResponse.json({ error: `Global "${slug}" not found` }, { status: 404 })
      }
      fields = globalConfig.fields
      sourceDocument = await payload.findGlobal({
        slug: slug as GlobalSlug,
        locale: sourceLocale as any,
        depth: 0,
      })
    }

    const localizedPaths = getLocalizedFieldPaths(fields)
    if (localizedPaths.length === 0) {
      return NextResponse.json(
        { error: 'No localized fields found in this document' },
        { status: 400 },
      )
    }

    const sourceContent = extractTranslatableContent(sourceDocument, localizedPaths)
    const results: Record<string, { success: boolean; error?: string }> = {}

    for (const targetLocale of targetLocales) {
      if (targetLocale === sourceLocale) continue
      try {
        const translatedContent = await translateContent(sourceContent, sourceLocale, targetLocale)
        const updateData = applyTranslatedContent(sourceDocument, translatedContent, localizedPaths)

        if (type === 'collection') {
          await payload.update({
            collection: slug as CollectionSlug,
            id: documentId!,
            locale: targetLocale as any,
            data: updateData,
          })
        } else {
          await payload.updateGlobal({
            slug: slug as GlobalSlug,
            locale: targetLocale as any,
            data: updateData,
          })
        }

        results[targetLocale] = { success: true }
      } catch (error: any) {
        console.error(`Error translating to ${targetLocale}:`, error)
        results[targetLocale] = { success: false, error: error.message || 'Translation failed' }
      }
    }

    const docSlug = sourceDocument?.slug || undefined
    const pathsToRevalidate = getPathsForRevalidation(type, slug, docSlug)
    const revalidatedPaths: string[] = []
    const revalidatedTags: string[] = []

    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path)
        revalidatedPaths.push(path)
      } catch (e) {
        console.error(`[AI-Translate] Failed to revalidate path ${path}:`, e)
      }
    }

    const tagsToRevalidate = getTagsForRevalidation(type, slug)
    for (const tag of tagsToRevalidate) {
      try {
        revalidateTag(tag)
        revalidatedTags.push(tag)
      } catch (e) {
        console.error(`[AI-Translate] Failed to revalidate tag ${tag}:`, e)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Translation completed',
      results,
      translatedFields: localizedPaths,
      revalidated: { paths: revalidatedPaths, tags: revalidatedTags },
    })
  } catch (error: any) {
    console.error('AI Translation error:', error)
    return NextResponse.json({ error: error.message || 'Translation failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as 'collection' | 'global'
    const slug = searchParams.get('slug')

    if (!type || !slug) {
      return NextResponse.json({ error: 'Missing required params: type, slug' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    let fields: any[]
    if (type === 'collection') {
      const collectionConfig = payload.config.collections.find((c) => c.slug === slug)
      if (!collectionConfig) {
        return NextResponse.json({ error: `Collection "${slug}" not found` }, { status: 404 })
      }
      fields = collectionConfig.fields
    } else {
      const globalConfig = payload.config.globals.find((g) => g.slug === slug)
      if (!globalConfig) {
        return NextResponse.json({ error: `Global "${slug}" not found` }, { status: 404 })
      }
      fields = globalConfig.fields
    }

    const localizedPaths = getLocalizedFieldPaths(fields)
    const locales = payload.config.localization
      ? (payload.config.localization as any).locales.map((l: any) =>
          typeof l === 'string' ? l : l.code,
        )
      : []

    return NextResponse.json({
      localizedFields: localizedPaths,
      availableLocales: locales,
      defaultLocale: payload.config.localization
        ? (payload.config.localization as any).defaultLocale
        : 'en',
    })
  } catch (error: any) {
    console.error('Error getting translatable fields:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get translatable fields' },
      { status: 500 },
    )
  }
}
