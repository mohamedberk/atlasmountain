import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Secret to protect the revalidation endpoint
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || process.env.PAYLOAD_SECRET

// Map collections/globals to paths that need revalidation
const REVALIDATION_MAP: Record<string, string[]> = {
  // Collections
  activities: [
    '/en',
    '/fr',
    '/de',
    '/en/activities',
    '/fr/activities',
    '/de/activities',
  ],
  'blog-posts': [
    '/en/blog',
    '/fr/blog',
    '/de/blog',
  ],
  categories: [
    '/en',
    '/fr',
    '/de',
    '/en/activities',
    '/fr/activities',
    '/de/activities',
  ],
  locations: [
    '/en',
    '/fr',
    '/de',
  ],
  // Globals
  'home-page': [
    '/en',
    '/fr',
    '/de',
  ],
  'about-page': [
    '/en/about',
    '/fr/about',
    '/de/about',
  ],
  'contact-page': [
    '/en/contact',
    '/fr/contact',
    '/de/contact',
  ],
}

// Tags for cache invalidation
const COLLECTION_TAGS: Record<string, string[]> = {
  activities: ['activities', 'homepage'],
  'blog-posts': ['blog-posts', 'blog'],
  categories: ['categories', 'activities'],
  locations: ['locations'],
  'home-page': ['homepage', 'home-page'],
  'about-page': ['about-page'],
  'contact-page': ['contact-page'],
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { collection, global, slug, secret } = body

    // Verify secret (optional but recommended)
    if (secret && secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    const targetSlug = collection || global

    if (!targetSlug) {
      return NextResponse.json(
        { error: 'Missing collection or global slug' },
        { status: 400 }
      )
    }

    // Revalidate paths
    const paths = REVALIDATION_MAP[targetSlug] || []
    const revalidatedPaths: string[] = []

    for (const path of paths) {
      try {
        revalidatePath(path)
        revalidatedPaths.push(path)
      } catch (e) {
        console.error(`Failed to revalidate path ${path}:`, e)
      }
    }

    // If it's a specific document with a slug, revalidate that too
    if (slug) {
      const specificPaths = [
        `/en/${collection === 'blog-posts' ? 'blog' : 'activities'}/${slug}`,
        `/fr/${collection === 'blog-posts' ? 'blog' : 'activities'}/${slug}`,
        `/de/${collection === 'blog-posts' ? 'blog' : 'activities'}/${slug}`,
      ]

      for (const path of specificPaths) {
        try {
          revalidatePath(path)
          revalidatedPaths.push(path)
        } catch (e) {
          console.error(`Failed to revalidate specific path ${path}:`, e)
        }
      }
    }

    // Revalidate tags
    const tags = COLLECTION_TAGS[targetSlug] || []
    const revalidatedTags: string[] = []

    for (const tag of tags) {
      try {
        revalidateTag(tag)
        revalidatedTags.push(tag)
      } catch (e) {
        console.error(`Failed to revalidate tag ${tag}:`, e)
      }
    }

    console.log(`[Revalidate] Collection/Global: ${targetSlug}`)
    console.log(`[Revalidate] Paths: ${revalidatedPaths.join(', ')}`)
    console.log(`[Revalidate] Tags: ${revalidatedTags.join(', ')}`)

    return NextResponse.json({
      success: true,
      revalidated: {
        paths: revalidatedPaths,
        tags: revalidatedTags,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: error.message || 'Revalidation failed' },
      { status: 500 }
    )
  }
}

// Also support GET for manual revalidation (with secret)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get('path')
  const tag = searchParams.get('tag')
  const secret = searchParams.get('secret')

  // Verify secret
  if (secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const results: { paths: string[]; tags: string[] } = { paths: [], tags: [] }

  if (path) {
    try {
      revalidatePath(path)
      results.paths.push(path)
    } catch (e) {
      console.error(`Failed to revalidate path ${path}:`, e)
    }
  }

  if (tag) {
    try {
      revalidateTag(tag)
      results.tags.push(tag)
    } catch (e) {
      console.error(`Failed to revalidate tag ${tag}:`, e)
    }
  }

  // If no specific path/tag, revalidate all main paths
  if (!path && !tag) {
    const allPaths = [
      '/en', '/fr', '/de',
      '/en/activities', '/fr/activities', '/de/activities',
      '/en/blog', '/fr/blog', '/de/blog',
      '/en/about', '/fr/about', '/de/about',
      '/en/contact', '/fr/contact', '/de/contact',
    ]

    for (const p of allPaths) {
      try {
        revalidatePath(p)
        results.paths.push(p)
      } catch (e) {
        console.error(`Failed to revalidate path ${p}:`, e)
      }
    }
  }

  return NextResponse.json({
    success: true,
    revalidated: results,
    timestamp: new Date().toISOString(),
  })
}
