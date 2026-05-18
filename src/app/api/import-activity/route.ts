import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { ScrapedActivity } from '../scrape-activity/route'

// Increase timeout for image downloads (60 seconds)
export const maxDuration = 60

interface ImportRequest {
  activities: ScrapedActivity[]
  options?: {
    downloadImages?: boolean
    createCategories?: boolean
    defaultStatus?: boolean // isActive
  }
}

interface ImportResult {
  success: boolean
  activityId?: string
  activityName: string
  slug?: string
  error?: string
  mediaIds?: string[]
  slugConflict?: boolean
  suggestedSlug?: string
}

function getMimeType(url: string, contentType?: string | null): string {
  if (contentType && contentType.startsWith('image/')) return contentType
  const ext = url.split('.').pop()?.toLowerCase().split('?')[0]
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  }
  return mimeTypes[ext || ''] || 'image/jpeg'
}

async function downloadAndUploadImage(
  imageUrl: string,
  altText: string,
  payload: any
): Promise<string | null> {
  try {
    console.log(`[Import] Downloading image: ${imageUrl}`)

    // Add timeout to fetch (30 seconds)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'image/*',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`[Import] Failed to download image (${response.status}): ${imageUrl}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Skip if too small (likely placeholder)
    if (buffer.length < 5000) {
      console.log(`[Import] Skipping small image (${buffer.length} bytes): ${imageUrl}`)
      return null
    }

    const contentType = response.headers.get('content-type')
    const mimeType = getMimeType(imageUrl, contentType)

    // Generate filename from URL
    let fileName = 'image.jpg'
    try {
      const urlPath = new URL(imageUrl).pathname
      fileName = urlPath.split('/').pop() || 'image.jpg'
      // Clean filename
      fileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '-')
      if (!fileName.includes('.')) {
        const ext = mimeType.split('/')[1] || 'jpg'
        fileName = `${fileName}.${ext}`
      }
    } catch {
      fileName = `activity-${Date.now()}.jpg`
    }

    // Upload to Payload media collection (Vercel compatible - uses buffer)
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: altText,
      },
      file: {
        data: buffer,
        mimetype: mimeType,
        name: fileName,
        size: buffer.length,
      },
    })

    console.log(`[Import] Media created with ID: ${media.id}`)
    return media.id
  } catch (error) {
    console.error(`[Import] Error uploading image ${imageUrl}:`, error)
    return null
  }
}

async function findOrCreateCategory(
  categoryName: string,
  createIfMissing: boolean,
  payload: any
): Promise<string | null> {
  try {
    const existing = await payload.find({
      collection: 'categories',
      where: {
        title: { equals: categoryName },
        type: { equals: 'activity' },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return existing.docs[0].id
    }

    if (createIfMissing) {
      const slug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const newCategory = await payload.create({
        collection: 'categories',
        data: {
          title: categoryName,
          slug,
          type: 'activity',
        },
      })
      return newCategory.id
    }

    return null
  } catch (error) {
    console.error(`Error finding/creating category ${categoryName}:`, error)
    return null
  }
}

async function getUniqueSlug(baseSlug: string, payload: any): Promise<{ slug: string; isOriginal: boolean }> {
  // Check if base slug exists
  const existing = await payload.find({
    collection: 'activities',
    where: {
      slug: { equals: baseSlug },
    },
    limit: 1,
  })

  if (existing.docs.length === 0) {
    return { slug: baseSlug, isOriginal: true }
  }

  // Find the next available slug
  let counter = 2
  while (counter < 100) {
    const newSlug = `${baseSlug}-${counter}`
    const check = await payload.find({
      collection: 'activities',
      where: {
        slug: { equals: newSlug },
      },
      limit: 1,
    })

    if (check.docs.length === 0) {
      return { slug: newSlug, isOriginal: false }
    }
    counter++
  }

  // Fallback with timestamp
  return { slug: `${baseSlug}-${Date.now()}`, isOriginal: false }
}

function textToLexical(text: string): any {
  if (!text) return null

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

async function importActivity(
  activity: ScrapedActivity,
  options: ImportRequest['options'] = {},
  payload: any
): Promise<ImportResult> {
  try {
    const mediaIds: string[] = []

    // 1. Check and get unique slug
    const { slug, isOriginal } = await getUniqueSlug(activity.slug, payload)

    // 2. Download and upload images if enabled
    let featuredImageId: string | null = null

    const imagesList = activity.images || []
    console.log(`[Import] Activity ${activity.title} has images array:`, JSON.stringify(imagesList))

    if (options.downloadImages !== false && imagesList.length > 0) {
      console.log(`[Import] Starting image download for ${activity.title}, ${imagesList.length} images found`)
      for (let i = 0; i < imagesList.length && i < 10; i++) {
        const imageUrl = imagesList[i]
        console.log(`[Import] Processing image ${i + 1}/${Math.min(imagesList.length, 10)}: ${imageUrl}`)

        try {
          const mediaId = await downloadAndUploadImage(imageUrl, activity.title, payload)

          if (mediaId) {
            mediaIds.push(mediaId)
            console.log(`[Import] Image ${i + 1} uploaded successfully, mediaId: ${mediaId}`)
            if (i === 0) {
              featuredImageId = mediaId
            }
          } else {
            console.log(`[Import] Image ${i + 1} failed to upload (returned null)`)
          }
        } catch (imgError) {
          console.error(`[Import] Image ${i + 1} error:`, imgError)
        }
      }
      console.log(`[Import] Finished image processing. Total uploaded: ${mediaIds.length}`)
    } else if (imagesList.length === 0) {
      console.log(`[Import] No images found for ${activity.title}`)
    } else {
      console.log(`[Import] Image download disabled for ${activity.title}`)
    }

    // 3. Find or create category
    const categoryId = activity.category
      ? await findOrCreateCategory(activity.category, options.createCategories ?? true, payload)
      : null

    // 4. Create the activity
    const activityData: Record<string, any> = {
      title: activity.title,
      slug: slug,
      description: textToLexical(activity.description),
      shortDescription: activity.shortDescription?.substring(0, 200),
      duration: activity.duration,
      category: categoryId,

      // Pricing
      pricingType: activity.pricingType || 'per_person',
      groupPricing: activity.groupPricing,
      privatePricing: activity.privatePricing,

      // Media
      featuredImage: featuredImageId,
      gallery: mediaIds.slice(1).map((id) => ({
        media: id,
        type: 'image',
      })),

      // Details
      highlights: activity.highlights.map((h) => ({ highlight: h })),
      included: activity.included.map((i) => ({ item: i })),
      notIncluded: activity.notIncluded.map((i) => ({ item: i })),
      recommendations: activity.recommendations.map((r) => ({ item: r })),
      itinerary: activity.itinerary.map((i) => ({
        time: i.time,
        activity: i.activity,
        description: i.description,
      })),

      // Languages
      languages: activity.languages?.map((lang) => ({ language: lang })) || [],

      // Coordinates (if available)
      ...(activity.coordinates && {
        coordinates: {
          latitude: activity.coordinates.latitude,
          longitude: activity.coordinates.longitude,
        },
      }),

      // Settings
      isActive: options.defaultStatus ?? false,
      isFeatured: false,
    }

    const newActivity = await payload.create({
      collection: 'activities',
      data: activityData,
      locale: 'en',
    })

    return {
      success: true,
      activityId: newActivity.id,
      activityName: activity.title,
      slug: slug,
      mediaIds,
      slugConflict: !isOriginal,
      suggestedSlug: !isOriginal ? slug : undefined,
    }
  } catch (error) {
    console.error(`Error importing activity ${activity.title}:`, error)
    return {
      success: false,
      activityName: activity.title,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Check authentication
    let user = null
    try {
      const { user: verifiedUser } = await payload.auth({
        headers: request.headers,
      })
      user = verifiedUser
    } catch (authError) {
      console.log('[Import Activity] Auth check failed:', authError)
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to the admin panel.' },
        { status: 401 }
      )
    }

    const body: ImportRequest = await request.json()
    const { activities, options = {} } = body

    if (!activities || !Array.isArray(activities) || activities.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of activities to import' },
        { status: 400 }
      )
    }

    const results: ImportResult[] = []

    for (const activity of activities) {
      console.log(`[Import Activity] Importing: ${activity.title}`)
      const result = await importActivity(activity, options, payload)
      results.push(result)
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length
    const slugConflicts = results.filter((r) => r.slugConflict).length

    return NextResponse.json({
      success: true,
      message: `Imported ${successCount} activities, ${failCount} failed${slugConflicts > 0 ? `, ${slugConflicts} with slug adjustments` : ''}`,
      results,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    )
  }
}
