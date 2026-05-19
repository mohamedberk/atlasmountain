import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getActivityBySlug, getActivitiesByCategory } from '@/lib/payload'
import { CheckoutFlowClient } from './checkout-flow-client'
import type { Activity, Category } from '@/payload-types'

// Revalidate every hour
export const revalidate = 0

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'

  const activity = await getActivityBySlug(slug, typedLocale)

  if (!activity) {
    return {
      title: 'Book Activity | Atlas Mountain Visit',
    }
  }

  return {
    title: `Book ${activity.title} | Atlas Mountain Visit`,
    description: `Complete your booking for ${activity.title} in Morocco`,
    robots: {
      index: false, // Don't index checkout pages
      follow: false,
    },
  }
}

export default async function CheckoutActivityPage({ params }: Props) {
  const { locale, slug } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'

  setRequestLocale(locale)

  // Fetch the activity
  const activity = await getActivityBySlug(slug, typedLocale)

  if (!activity) {
    notFound()
  }

  // Get the category slug to fetch related activities
  const category = activity.category as Category | null
  const categorySlug = category?.slug || null

  // Fetch related activities from the same category
  let relatedActivities: Activity[] = []
  if (categorySlug) {
    const result = await getActivitiesByCategory(categorySlug, typedLocale)
    // Filter out the current activity and limit to 4
    relatedActivities = (result.docs as Activity[])
      .filter(a => a.id !== activity.id)
      .slice(0, 4)
  }

  return (
    <CheckoutFlowClient
      activity={activity as Activity}
      relatedActivities={relatedActivities}
      locale={typedLocale}
    />
  )
}
