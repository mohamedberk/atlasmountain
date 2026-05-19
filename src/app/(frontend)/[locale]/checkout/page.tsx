import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getActivities, getCategories } from '@/lib/payload'
import { CheckoutBrowseClient } from './checkout-browse-client'
import type { Activity, Category, Media } from '@/payload-types'

export const revalidate = 0

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Book Your Experience | Atlas Mountain Visit',
    description: 'Browse and book amazing Morocco experiences',
  }
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'

  setRequestLocale(locale)

  // Fetch all activities and categories
  const [activitiesResult, categoriesResult] = await Promise.all([
    getActivities(typedLocale),
    getCategories('activity', typedLocale),
  ])

  const activities = activitiesResult.docs as Activity[]
  const categories = categoriesResult.docs as Category[]

  // Group activities by category
  const activitiesByCategory = categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: typeof category.image === 'object' ? (category.image as Media)?.url ?? null : null,
      activities: activities.filter((activity) => {
        const activityCategory = activity.category
        if (typeof activityCategory === 'object' && activityCategory !== null) {
          return activityCategory.id === category.id
        }
        return activityCategory === category.id
      }),
    }))
    .filter((cat) => cat.activities.length > 0)

  return (
    <CheckoutBrowseClient
      categorizedActivities={activitiesByCategory}
      locale={typedLocale}
    />
  )
}
