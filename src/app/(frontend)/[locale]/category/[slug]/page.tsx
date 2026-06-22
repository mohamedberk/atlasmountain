import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getCategoryBySlug, getActivitiesByCategory, getCategories } from '@/lib/payload'
import { CategoryPageClient } from './category-page-client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import type { Category, Activity } from '@/payload-types'

// Revalidate every hour as fallback (on-demand revalidation is primary)
export const revalidate = 3600

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

// Generate static params for all activity categories
export async function generateStaticParams() {
  const categories = await getCategories('activity', 'en')
  return categories.docs.map((category) => ({
    slug: category.slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'

  const category = await getCategoryBySlug(slug, typedLocale) as Category | null
  const tCategory = await getTranslations({ locale: typedLocale, namespace: 'categoryPage' })

  if (!category) {
    return {
      title: `${tCategory('notFoundTitle')} | Atlas Mountain Visit`,
    }
  }

  const imageUrl = typeof category.image === 'string'
    ? category.image
    : typeof category.image === 'number'
    ? '/og-image.jpg'
    : category.image?.url || '/og-image.jpg'

  return {
    title: `${category.name} | Atlas Mountain Visit`,
    description: category.description || tCategory('defaultMetaDescription', { name: category.name }),
    openGraph: {
      title: `${category.name} | Atlas Mountain Visit`,
      description: category.description || tCategory('defaultOgDescription', { name: category.name }),
      images: [imageUrl],
      locale: locale,
      type: 'website',
    },
    alternates: {
      canonical: `https://atlasmountainsvisit.com/${locale}/category/${slug}`,
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'

  setRequestLocale(locale)

  // Fetch category and its activities in parallel
  const [category, activitiesResult] = await Promise.all([
    getCategoryBySlug(slug, typedLocale),
    getActivitiesByCategory(slug, typedLocale),
  ])

  if (!category) {
    notFound()
  }

  const activities = activitiesResult.docs as Activity[]

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    image: typeof category.image === 'string'
      ? category.image
      : typeof category.image === 'number'
      ? undefined
      : category.image?.url,
    numberOfItems: activities.length,
    itemListElement: activities.map((activity, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'TouristTrip',
        name: activity.title,
        description: activity.shortDescription,
        image: typeof activity.featuredImage === 'string'
          ? activity.featuredImage
          : typeof activity.featuredImage === 'number'
          ? undefined
          : activity.featuredImage?.url,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-[#f9f9fb]">
        <Navbar />
        <CategoryPageClient
          category={category as Category}
          activities={activities}
          locale={typedLocale}
        />
        <Footer />
      </main>
    </>
  )
}
