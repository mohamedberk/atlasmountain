import { getLocale } from 'next-intl/server'
import { getCategories, getActivities } from '@/lib/payload'
import { getOptimizedImageUrl } from '@/lib/image-utils'
import { NavbarClient, type NavbarData } from './navbar-client'

const getImageUrl = (image: unknown): string | null => {
  if (!image) return null
  return getOptimizedImageUrl(image as any, 'thumbnail')
}

interface Props {
  hideUntilScrolled?: boolean
}

export async function Navbar({ hideUntilScrolled = false }: Props = {}) {
  const locale = ((await getLocale()) as 'en' | 'fr') || 'en'

  const [categoriesResult, activitiesResult] = await Promise.all([
    getCategories('activity', locale),
    getActivities(locale),
  ])

  const categories = categoriesResult.docs.map((cat: any) => ({
    id: String(cat.id),
    name: cat.name,
    slug: cat.slug,
    image: getImageUrl(cat.image),
  }))

  const activitiesByCategory: NavbarData['activitiesByCategory'] = {}

  activitiesResult.docs.forEach((activity: any) => {
    const categoryId =
      typeof activity.category === 'string'
        ? activity.category
        : typeof activity.category === 'number'
        ? String(activity.category)
        : activity.category?.id
        ? String(activity.category.id)
        : null

    if (!categoryId) return

    if (!activitiesByCategory[categoryId]) {
      activitiesByCategory[categoryId] = []
    }

    let activityImage: string | null = null
    if (activity.featuredImage) {
      activityImage = getImageUrl(activity.featuredImage)
    }
    if (
      !activityImage &&
      activity.gallery &&
      Array.isArray(activity.gallery) &&
      activity.gallery.length > 0
    ) {
      const firstGalleryItem = activity.gallery[0]
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

  return (
    <NavbarClient
      initialData={{ categories, activitiesByCategory }}
      hideUntilScrolled={hideUntilScrolled}
    />
  )
}
