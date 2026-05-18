import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getActivityBySlug, getActivities, getFeaturedActivities } from '@/lib/payload'
import { ActivityDetailClient } from './activity-detail-client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import type { Activity } from '@/payload-types'

// Revalidate every hour as fallback (on-demand revalidation is primary)
export const revalidate = 3600

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

// Generate static params for all activities
export async function generateStaticParams() {
  const activities = await getActivities('en')
  return activities.docs.map((activity) => ({
    slug: activity.slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'

  const activity = await getActivityBySlug(slug, typedLocale)

  if (!activity) {
    return {
      title: 'Activity Not Found | Green Atlas Travel',
    }
  }

  const imageUrl = typeof activity.featuredImage === 'string'
    ? activity.featuredImage
    : typeof activity.featuredImage === 'number'
    ? '/og-image.jpg'
    : activity.featuredImage?.url || '/og-image.jpg'

  return {
    title: `${activity.title} | Green Atlas Travel`,
    description: activity.shortDescription || activity.seo?.metaDescription || `Book ${activity.title} in Marrakech with Green Atlas Travel`,
    keywords: activity.seo?.keywords || `${activity.title}, Morocco tours, Marrakech activities`,
    openGraph: {
      title: activity.seo?.metaTitle || activity.title,
      description: activity.shortDescription || activity.seo?.metaDescription || `Book ${activity.title} in Marrakech with Green Atlas Travel`,
      images: [imageUrl],
      locale: locale,
      type: 'website',
    },
    alternates: {
      canonical: `https://greenatlastravel.com/${locale}/activities/${slug}`,
    },
  }
}

export default async function ActivityPage({ params }: Props) {
  const { locale, slug } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'

  setRequestLocale(locale)

  // Fetch activity and related activities in parallel
  const [activity, relatedResult] = await Promise.all([
    getActivityBySlug(slug, typedLocale),
    getFeaturedActivities(typedLocale),
  ])

  if (!activity) {
    notFound()
  }

  // Filter out current activity from related
  const relatedActivities = relatedResult.docs
    .filter((a) => a.id !== activity.id)
    .slice(0, 3) as Activity[]

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: activity.title,
    description: activity.shortDescription,
    image: typeof activity.featuredImage === 'string'
      ? activity.featuredImage
      : typeof activity.featuredImage === 'number'
      ? undefined
      : activity.featuredImage?.url,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Marrakech',
      addressCountry: 'Morocco',
    },
    offers: {
      '@type': 'Offer',
      price: (() => {
        if (activity.pricingType === 'tiered' && activity.tieredPricing?.tiers && activity.tieredPricing.tiers.length > 0) {
          // Get the LOWEST price from all tiers
          const lowestPrice = Math.min(...activity.tieredPricing.tiers.map(tier => tier.pricePerPerson || 0))
          return lowestPrice
        }
        if (activity.pricingType === 'fixed' && activity.privatePricing?.basePrice) {
          return activity.privatePricing.basePrice
        }
        return undefined
      })(),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-[#f9f9fb]">
        <Navbar />
        <ActivityDetailClient
          activity={activity}
          relatedActivities={relatedActivities}
        />
        <Footer />
      </main>
    </>
  )
}
