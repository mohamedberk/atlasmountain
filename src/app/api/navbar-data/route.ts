import { NextResponse } from 'next/server'
import { getCategories, getActivities } from '@/lib/payload'
import { getOptimizedImageUrl } from '@/lib/image-utils'

export const revalidate = 3600

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = (searchParams.get('locale') as 'en' | 'fr') || 'en'

    // Fetch categories and activities in parallel
    const [categoriesResult, activitiesResult] = await Promise.all([
      getCategories('activity', locale),
      getActivities(locale),
    ])

    // Get image URL helper - use small thumbnail variant for navbar tiles
    const getImageUrl = (image: any): string | null => {
      if (!image) return null
      return getOptimizedImageUrl(image, 'thumbnail')
    }

    // Format categories with their image
    const categories = categoriesResult.docs.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image: getImageUrl(cat.image),
    }))

    // Format activities grouped by category
    const activitiesByCategory: Record<string, Array<{
      id: string
      title: string
      slug: string
      image: string | null
    }>> = {}

    activitiesResult.docs.forEach((activity) => {
      const categoryId = typeof activity.category === 'string'
        ? activity.category
        : typeof activity.category === 'number'
        ? String(activity.category)
        : activity.category?.id ? String(activity.category.id) : null

      if (!categoryId) return

      if (!activitiesByCategory[categoryId]) {
        activitiesByCategory[categoryId] = []
      }

      // Get the featured image or first gallery image
      let activityImage: string | null = null
      // Try featuredImage first
      if ((activity as any).featuredImage) {
        activityImage = getImageUrl((activity as any).featuredImage)
      }
      // Fallback to gallery
      if (!activityImage && (activity as any).gallery && Array.isArray((activity as any).gallery) && (activity as any).gallery.length > 0) {
        const firstGalleryItem = (activity as any).gallery[0]
        if (firstGalleryItem?.image) {
          activityImage = getImageUrl(firstGalleryItem.image)
        } else if (firstGalleryItem?.url) {
          activityImage = firstGalleryItem.url
        }
      }

      activitiesByCategory[categoryId].push({
        id: String(activity.id),
        title: activity.title,
        slug: activity.slug,
        image: activityImage,
      })
    })

    return NextResponse.json({
      categories,
      activitiesByCategory,
    })
  } catch (error) {
    console.error('Error fetching navbar data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch navbar data' },
      { status: 500 }
    )
  }
}
