import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import Anthropic from '@anthropic-ai/sdk'
import { revalidatePath, revalidateTag } from 'next/cache'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

// Collection and Global slug types from the config
type CollectionSlug = 'users' | 'media' | 'categories' | 'locations' | 'activities' | 'bookings' | 'blog-posts' | 'contact-submissions'
type GlobalSlug = 'home-page' | 'about-page' | 'contact-page'

// AI Model - Using Claude Haiku 4.5 for cost efficiency
// Haiku is excellent for translation tasks and much cheaper than Sonnet
const AI_MODEL = 'claude-haiku-4-5-20251001'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Supported locales configuration
const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  ar: 'Arabic',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  zh: 'Chinese',
  ja: 'Japanese',
}

// Types for the translation request
interface TranslateRequest {
  type: 'collection' | 'global'
  slug: string
  documentId?: string // Required for collections, not for globals
  sourceLocale: string
  targetLocales: string[]
}

// Extract localized fields from a Payload field configuration
function getLocalizedFieldPaths(
  fields: any[],
  parentPath: string = ''
): string[] {
  const localizedPaths: string[] = []

  if (!fields || !Array.isArray(fields)) {
    console.log('[AI-Translate] No fields array provided')
    return localizedPaths
  }

  for (const field of fields) {
    // Handle fields without names first (tabs, row, collapsible)
    // These are structural fields that contain other fields
    if (!field.name) {
      // Handle tabs type - tabs don't have a name but contain fields
      if (field.type === 'tabs' && field.tabs) {
        for (const tab of field.tabs) {
          if (tab.fields) {
            localizedPaths.push(
              ...getLocalizedFieldPaths(tab.fields, parentPath)
            )
          }
        }
        continue
      }

      // Handle row/collapsible without names
      if (field.fields) {
        localizedPaths.push(...getLocalizedFieldPaths(field.fields, parentPath))
        continue
      }

      // Skip UI fields and other fields without names
      continue
    }

    const fieldPath = parentPath ? `${parentPath}.${field.name}` : field.name

    // Handle different field types
    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'richText':
        if (field.localized) {
          localizedPaths.push(fieldPath)
        }
        break

      case 'group':
        if (field.fields) {
          localizedPaths.push(...getLocalizedFieldPaths(field.fields, fieldPath))
        }
        break

      case 'array':
        // For arrays, we mark the path - will be handled specially during translation
        if (field.localized) {
          // The entire array is localized
          localizedPaths.push(fieldPath)
        } else if (field.fields) {
          // Check for localized fields within array items
          const arrayFieldPaths = getLocalizedFieldPaths(field.fields, '')
          if (arrayFieldPaths.length > 0) {
            localizedPaths.push(
              ...arrayFieldPaths.map((p) => `${fieldPath}[].${p}`)
            )
          }
        }
        break

      case 'tabs':
        // Tabs with a name (rare but possible)
        if (field.tabs) {
          for (const tab of field.tabs) {
            if (tab.fields) {
              localizedPaths.push(
                ...getLocalizedFieldPaths(tab.fields, parentPath)
              )
            }
          }
        }
        break

      case 'row':
      case 'collapsible':
        if (field.fields) {
          localizedPaths.push(
            ...getLocalizedFieldPaths(field.fields, parentPath)
          )
        }
        break
    }
  }

  return localizedPaths
}

// Get value at a nested path
function getValueAtPath(obj: any, path: string): any {
  const parts = path.split('.')
  let current = obj

  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    current = current[part]
  }

  return current
}

// Set value at a nested path
function setValueAtPath(obj: any, path: string, value: any): void {
  const parts = path.split('.')
  let current = obj

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!(part in current)) {
      current[part] = {}
    }
    current = current[part]
  }

  current[parts[parts.length - 1]] = value
}

// Extract all translatable text from a document based on field paths
function extractTranslatableContent(
  doc: any,
  fieldPaths: string[]
): Record<string, any> {
  const content: Record<string, any> = {}

  for (const path of fieldPaths) {
    // Handle array notation (e.g., "highlights[].highlight")
    if (path.includes('[]')) {
      const [arrayPath, ...rest] = path.split('[].')
      const arrayValue = getValueAtPath(doc, arrayPath)

      if (Array.isArray(arrayValue)) {
        content[path] = arrayValue.map((item) => {
          if (rest.length === 0) {
            return item
          }
          const subPath = rest.join('.')
          return getValueAtPath(item, subPath)
        })
      }
    } else {
      const value = getValueAtPath(doc, path)
      if (value !== undefined && value !== null && value !== '') {
        content[path] = value
      }
    }
  }

  return content
}

// Convert rich text (Lexical) to plain text for translation
function richTextToPlainText(richText: any): string {
  if (!richText || !richText.root) return ''

  function extractText(node: any): string {
    if (node.type === 'text') {
      return node.text || ''
    }

    if (node.children && Array.isArray(node.children)) {
      return node.children.map(extractText).join('')
    }

    return ''
  }

  return extractText(richText.root)
}

// Slugify a string for URL-safe slugs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (é → e, ü → u, etc.)
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/(^-|-$)/g, '') // Remove leading/trailing hyphens
}

// Convert plain text back to rich text (Lexical) format
function plainTextToRichText(text: string): any {
  // Split by paragraphs
  const paragraphs = text.split('\n\n').filter((p) => p.trim())

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map((paragraph) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            format: 0,
            style: '',
            mode: 'normal',
            text: paragraph.trim(),
            detail: 0,
            version: 1,
          },
        ],
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
      })),
      direction: 'ltr',
    },
  }
}

// Translate content using Claude
async function translateContent(
  content: Record<string, any>,
  sourceLocale: string,
  targetLocale: string
): Promise<Record<string, any>> {
  const sourceLang = LOCALE_NAMES[sourceLocale] || sourceLocale
  const targetLang = LOCALE_NAMES[targetLocale] || targetLocale

  // Prepare content for translation - handle rich text specially
  const preparedContent: Record<string, any> = {}
  const richTextFields: string[] = []

  for (const [key, value] of Object.entries(content)) {
    if (value && typeof value === 'object' && value.root) {
      // This is a rich text field (Lexical format)
      preparedContent[key] = richTextToPlainText(value)
      richTextFields.push(key)
    } else {
      preparedContent[key] = value
    }
  }

  const prompt = `You are a professional translator. Translate the following JSON content from ${sourceLang} to ${targetLang}.

IMPORTANT RULES:
1. Maintain the exact same JSON structure
2. Only translate string values that are actual text content
3. Do NOT translate:
   - URLs
   - Email addresses
   - Proper nouns (brand names, etc.) - unless they have official translations
   - Technical terms that should remain in English
4. Preserve any HTML tags or markdown formatting within strings
5. For arrays, translate each item in the array
6. Keep the translation natural and culturally appropriate for ${targetLang} speakers
7. If a value is empty string "", keep it as empty string

Return ONLY the valid JSON with translated content, no explanations or markdown formatting.

Content to translate:
${JSON.stringify(preparedContent, null, 2)}`

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  // Extract the text content from the response
  const textBlock = response.content.find((block) => block.type === 'text')
  const translatedText = textBlock?.type === 'text' ? textBlock.text : '{}'

  let translated: Record<string, any>
  try {
    // Clean up potential markdown code blocks
    const cleanedText = translatedText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    translated = JSON.parse(cleanedText)
  } catch (e) {
    console.error('Failed to parse translation response:', translatedText)
    throw new Error('Failed to parse translation response from AI')
  }

  // Convert rich text fields back to Lexical format
  for (const key of richTextFields) {
    if (translated[key] && typeof translated[key] === 'string') {
      translated[key] = plainTextToRichText(translated[key])
    }
  }

  // Slugify any slug fields to ensure URL-safe values
  for (const [key, value] of Object.entries(translated)) {
    if (key.toLowerCase().includes('slug') && typeof value === 'string') {
      translated[key] = slugify(value)
    }
  }

  return translated
}

// Map collections/globals to paths that need revalidation
const REVALIDATION_MAP: Record<string, string[]> = {
  // Collections
  activities: ['/en', '/fr', '/de', '/en/activities', '/fr/activities', '/de/activities'],
  'blog-posts': ['/en/blog', '/fr/blog', '/de/blog'],
  categories: ['/en', '/fr', '/de', '/en/activities', '/fr/activities', '/de/activities'],
  locations: ['/en', '/fr', '/de'],
  // Globals
  'home-page': ['/en', '/fr', '/de'],
  'about-page': ['/en/about', '/fr/about', '/de/about'],
  'contact-page': ['/en/contact', '/fr/contact', '/de/contact'],
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

// Get paths to revalidate for a given collection/global
function getPathsForRevalidation(type: 'collection' | 'global', collectionSlug: string, documentSlug?: string): string[] {
  const paths = [...(REVALIDATION_MAP[collectionSlug] || [])]

  // Add specific document paths for collections with slugs
  if (type === 'collection' && documentSlug) {
    const collectionPath = collectionSlug === 'blog-posts' ? 'blog' : 'activities'
    paths.push(
      `/en/${collectionPath}/${documentSlug}`,
      `/fr/${collectionPath}/${documentSlug}`,
      `/de/${collectionPath}/${documentSlug}`
    )
  }

  return paths
}

// Get tags to revalidate for a given collection/global
function getTagsForRevalidation(type: 'collection' | 'global', slug: string): string[] {
  return COLLECTION_TAGS[slug] || []
}

// Remove system fields that shouldn't be updated
function removeSystemFields(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => removeSystemFields(item))
  }
  if (obj && typeof obj === 'object') {
    const cleaned: any = {}
    for (const [key, value] of Object.entries(obj)) {
      // Skip system fields that Payload doesn't allow updating
      if (key === 'id' || key === '_id' || key === 'createdAt' || key === 'updatedAt') {
        continue
      }
      cleaned[key] = removeSystemFields(value)
    }
    return cleaned
  }
  return obj
}

// Apply translated content back to document structure
function applyTranslatedContent(
  originalDoc: any,
  translatedContent: Record<string, any>,
  fieldPaths: string[]
): any {
  const result: any = {}

  for (const path of fieldPaths) {
    if (path.includes('[]')) {
      // Handle array fields
      const [arrayPath, ...rest] = path.split('[].')
      const originalArray = getValueAtPath(originalDoc, arrayPath)
      const translatedArray = translatedContent[path]

      if (Array.isArray(originalArray) && Array.isArray(translatedArray)) {
        // Get or create the array in result
        let resultArray = getValueAtPath(result, arrayPath)
        if (!resultArray) {
          // Copy original array items but remove system fields like 'id'
          resultArray = originalArray.map((item: any) => {
            const { id, _id, createdAt, updatedAt, ...rest } = item
            return { ...rest }
          })
          setValueAtPath(result, arrayPath, resultArray)
        }

        // Apply translations to each item
        for (let i = 0; i < resultArray.length; i++) {
          if (translatedArray[i] !== undefined) {
            if (rest.length === 0) {
              resultArray[i] = translatedArray[i]
            } else {
              const subPath = rest.join('.')
              setValueAtPath(resultArray[i], subPath, translatedArray[i])
            }
          }
        }
      }
    } else {
      // Handle regular fields
      if (translatedContent[path] !== undefined) {
        setValueAtPath(result, path, translatedContent[path])
      }
    }
  }

  // Final cleanup to remove any remaining system fields
  return removeSystemFields(result)
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // ===== SECURITY: Check if user is authenticated =====
    // Get the user from the request headers (Payload sets this)
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')

    // Try to get user from Payload's auth
    let user = null
    try {
      // Parse cookies to get payload-token
      const cookies = cookieHeader?.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      }, {} as Record<string, string>)

      const token = cookies?.['payload-token'] || authHeader?.replace('Bearer ', '')

      if (token) {
        // Verify the token with Payload
        const { user: verifiedUser } = await payload.auth({
          headers: request.headers,
        })
        user = verifiedUser
      }
    } catch (authError) {
      console.log('[AI-Translate] Auth check failed:', authError)
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to the admin panel.' },
        { status: 401 }
      )
    }

    // ===== RATE LIMITING =====
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, 'ai-translate', RATE_LIMITS.aiTranslate)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Please try again in ${rateLimitResult.resetIn} seconds.`,
          retryAfter: rateLimitResult.resetIn
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.resetIn),
            'X-RateLimit-Remaining': '0',
          }
        }
      )
    }

    const body: TranslateRequest = await request.json()
    const { type, slug, documentId, sourceLocale, targetLocales } = body

    // Validate request
    if (!type || !slug || !sourceLocale || !targetLocales?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: type, slug, sourceLocale, targetLocales' },
        { status: 400 }
      )
    }

    if (type === 'collection' && !documentId) {
      return NextResponse.json(
        { error: 'documentId is required for collection translations' },
        { status: 400 }
      )
    }

    // Check for Anthropic API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }

    // Get collection or global configuration from payload.config
    let fields: any[]
    let sourceDocument: any

    if (type === 'collection') {
      // Find collection config from payload.config.collections
      const collectionConfig = payload.config.collections.find(c => c.slug === slug)
      if (!collectionConfig) {
        return NextResponse.json(
          { error: `Collection "${slug}" not found` },
          { status: 404 }
        )
      }
      fields = collectionConfig.fields

      // Fetch the document in source locale
      sourceDocument = await payload.findByID({
        collection: slug as CollectionSlug,
        id: documentId!,
        locale: sourceLocale as any,
        depth: 0,
      })
    } else {
      // Find global config from payload.config.globals
      const globalConfig = payload.config.globals.find(g => g.slug === slug)
      if (!globalConfig) {
        return NextResponse.json(
          { error: `Global "${slug}" not found` },
          { status: 404 }
        )
      }
      fields = globalConfig.fields

      // Fetch the global in source locale
      sourceDocument = await payload.findGlobal({
        slug: slug as GlobalSlug,
        locale: sourceLocale as any,
        depth: 0,
      })
    }

    // Get all localized field paths
    const localizedPaths = getLocalizedFieldPaths(fields)

    if (localizedPaths.length === 0) {
      return NextResponse.json(
        { error: 'No localized fields found in this document' },
        { status: 400 }
      )
    }

    // Extract translatable content from source document
    const sourceContent = extractTranslatableContent(sourceDocument, localizedPaths)

    const results: Record<string, { success: boolean; error?: string }> = {}

    // Translate to each target locale
    for (const targetLocale of targetLocales) {
      if (targetLocale === sourceLocale) continue

      try {
        // Translate content
        const translatedContent = await translateContent(
          sourceContent,
          sourceLocale,
          targetLocale
        )

        // Build the update data
        const updateData = applyTranslatedContent(
          sourceDocument,
          translatedContent,
          localizedPaths
        )

        // Update the document in target locale
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
        results[targetLocale] = {
          success: false,
          error: error.message || 'Translation failed',
        }
      }
    }

    // Revalidate paths after translation to bust Next.js cache
    // Use the document's slug for path revalidation, not the ID
    const docSlug = sourceDocument?.slug || undefined
    const pathsToRevalidate = getPathsForRevalidation(type, slug, docSlug)
    const revalidatedPaths: string[] = []
    const revalidatedTags: string[] = []

    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path)
        revalidatedPaths.push(path)
        console.log(`[AI-Translate] Revalidated path: ${path}`)
      } catch (e) {
        console.error(`[AI-Translate] Failed to revalidate path ${path}:`, e)
      }
    }

    // Revalidate tags
    const tagsToRevalidate = getTagsForRevalidation(type, slug)
    for (const tag of tagsToRevalidate) {
      try {
        revalidateTag(tag)
        revalidatedTags.push(tag)
        console.log(`[AI-Translate] Revalidated tag: ${tag}`)
      } catch (e) {
        console.error(`[AI-Translate] Failed to revalidate tag ${tag}:`, e)
      }
    }

    console.log(`[AI-Translate] Revalidation complete. Paths: ${revalidatedPaths.length}, Tags: ${revalidatedTags.length}`)

    return NextResponse.json({
      success: true,
      message: 'Translation completed',
      results,
      translatedFields: localizedPaths,
      revalidated: {
        paths: revalidatedPaths,
        tags: revalidatedTags,
      },
    })
  } catch (error: any) {
    console.error('AI Translation error:', error)
    return NextResponse.json(
      { error: error.message || 'Translation failed' },
      { status: 500 }
    )
  }
}

// GET endpoint to check which fields would be translated
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as 'collection' | 'global'
    const slug = searchParams.get('slug')

    if (!type || !slug) {
      return NextResponse.json(
        { error: 'Missing required params: type, slug' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    let fields: any[]

    if (type === 'collection') {
      // Find collection config from payload.config.collections
      const collectionConfig = payload.config.collections.find(c => c.slug === slug)
      console.log(`[AI-Translate GET] Collection: ${slug}, Found config: ${!!collectionConfig}`)
      console.log(`[AI-Translate GET] Available collections: ${payload.config.collections.map(c => c.slug).join(', ')}`)
      if (!collectionConfig) {
        return NextResponse.json(
          { error: `Collection "${slug}" not found` },
          { status: 404 }
        )
      }
      fields = collectionConfig.fields
      console.log(`[AI-Translate GET] Fields count: ${fields?.length || 0}`)
    } else {
      // Find global config from payload.config.globals
      const globalConfig = payload.config.globals.find(g => g.slug === slug)
      console.log(`[AI-Translate GET] Global: ${slug}, Found config: ${!!globalConfig}`)
      console.log(`[AI-Translate GET] Available globals: ${payload.config.globals.map(g => g.slug).join(', ')}`)
      if (!globalConfig) {
        return NextResponse.json(
          { error: `Global "${slug}" not found` },
          { status: 404 }
        )
      }
      fields = globalConfig.fields
      console.log(`[AI-Translate GET] Fields count: ${fields?.length || 0}`)
      // Debug: Log field types
      fields.forEach((f, i) => {
        console.log(`[AI-Translate GET] Field ${i}: type=${f.type}, name=${f.name || 'none'}, hasTabs=${!!f.tabs}`)
      })
    }

    const localizedPaths = getLocalizedFieldPaths(fields)
    console.log(`[AI-Translate GET] Found ${localizedPaths.length} localized paths:`, localizedPaths)

    // Get available locales from config
    const locales = payload.config.localization
      ? (payload.config.localization as any).locales.map((l: any) =>
          typeof l === 'string' ? l : l.code
        )
      : []

    return NextResponse.json({
      localizedFields: localizedPaths,
      availableLocales: locales,
      defaultLocale: payload.config.localization
        ? (payload.config.localization as any).defaultLocale
        : 'en',
      // Debug info
      debug: {
        fieldsCount: fields?.length || 0,
        fieldTypes: fields?.map(f => ({ type: f.type, name: f.name, hasTabs: !!f.tabs })) || [],
      }
    })
  } catch (error: any) {
    console.error('Error getting translatable fields:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get translatable fields' },
      { status: 500 }
    )
  }
}
