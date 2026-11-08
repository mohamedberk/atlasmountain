import { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getActivityBySlug, getActivities, getFeaturedActivities, getDocumentSlugsInAllLocales, findDocumentIdBySlug } from '@/lib/payload'
import { ActivityDetailClient } from './activity-detail-client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import type { Activity } from '@/payload-types'
import { defaultLocale, type Locale } from '@/i18n/config'
import { SITE_URL } from '@/lib/site-url'

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
  const typedLocale = (locale as Locale) || defaultLocale

  const activity = await getActivityBySlug(slug, typedLocale)

  if (!activity) {
    const tDetail = await getTranslations({ locale: typedLocale, namespace: 'activityDetail' })
    return {
      title: `${tDetail('notFoundTitle')} | Atlas Mountain Visit`,
    }
  }

  const imageUrl = typeof activity.featuredImage === 'string'
    ? activity.featuredImage
    : typeof activity.featuredImage === 'number'
    ? '/og-image.jpg'
    : activity.featuredImage?.url || '/og-image.jpg'

  const t = await getTranslations({ locale: typedLocale, namespace: 'activityMetadata' })
  const bookDescription = t('bookDescription', { title: activity.title })
  const defaultKeywords = t('defaultKeywords', { title: activity.title })

  const metaTitle = activity.seo?.metaTitle || `${activity.title} | Atlas Mountain Visit`
  const metaDescription = activity.seo?.metaDescription || activity.shortDescription || bookDescription

  // The slug is localized per-locale in the CMS, so each language can have a
  // different slug for the same activity. Build hreflang alternates from the
  // actual per-locale slugs instead of assuming they match the current one.
  const slugMap = await getDocumentSlugsInAllLocales('activities', activity.id)
  const languages: Record<string, string> = {}
  for (const [altLocale, altSlug] of Object.entries(slugMap)) {
    languages[altLocale] = `/${altLocale}/activities/${altSlug}`
  }

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: activity.seo?.keywords || defaultKeywords,
    openGraph: {
      title: activity.seo?.metaTitle || activity.title,
      description: metaDescription,
      images: [imageUrl],
      locale: locale,
      type: 'website',
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/activities/${slug}`,
      languages,
    },
  }
}

export default async function ActivityPage({ params }: Props) {
  const { locale, slug } = await params
  const typedLocale = (locale as Locale) || defaultLocale

  setRequestLocale(locale)

  // Fetch activity and related activities in parallel
  const [activity, relatedResult] = await Promise.all([
    getActivityBySlug(slug, typedLocale),
    getFeaturedActivities(typedLocale),
  ])

  if (!activity) {
    // The requested slug may be another locale's translated slug for an
    // activity that *does* exist in this locale (e.g. an old/mis-generated
    // link, or the language switcher carrying over the previous slug).
    // Redirect to the correct localized URL instead of a dead-end 404.
    const altId = await findDocumentIdBySlug('activities', slug)
    if (altId) {
      const slugMap = await getDocumentSlugsInAllLocales('activities', altId)
      const correctSlug = slugMap[typedLocale]
      if (correctSlug && correctSlug !== slug) {
        permanentRedirect(`/${locale}/activities/${correctSlug}`)
      }
    }
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
