import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getGuideBySlug, getGuides, getGuideReviews } from '@/lib/payload'
import { getOptimizedImageUrl } from '@/lib/image-utils'
import { GuideDetailClient } from './guide-detail-client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import type { Guide, GuideReview } from '@/payload-types'
import { defaultLocale, type Locale } from '@/i18n/config'
import { SITE_URL } from '@/lib/site-url'

export const revalidate = 3600

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  const guides = await getGuides('en')
  return guides.docs.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = (locale as Locale) || defaultLocale

  const guide = (await getGuideBySlug(slug, typedLocale)) as Guide | null

  if (!guide) {
    return { title: 'Guide Not Found | Atlas Mountain Visit' }
  }

  const imageUrl = getOptimizedImageUrl(guide.avatar, 'hero')
  const licensedPrefix = guide.isOfficiallyLicensed ? 'Licensed ' : ''
  const metaTitle = guide.seo?.metaTitle || `${guide.name} – ${licensedPrefix}Private Tour Guide in Marrakech | Atlas Mountain Visit`
  const bioSnippet = guide.tagline || ''
  const metaDescription =
    guide.seo?.metaDescription ||
    `${guide.name} is a ${guide.isOfficiallyLicensed ? 'licensed ' : ''}local guide in Marrakech leading private, personalized tours. ${bioSnippet} Contact ${guide.name} through Atlas Mountain Visit.`

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: guide.seo?.keywords || `${guide.name}, private tour guide marrakech, local guide morocco`,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: [imageUrl],
      locale,
      type: 'website',
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/guides/${slug}`,
      languages: {
        en: `/en/guides/${slug}`,
        fr: `/fr/guides/${slug}`,
        es: `/es/guides/${slug}`,
        cs: `/cs/guides/${slug}`,
      },
    },
  }
}

export default async function GuidePage({ params }: Props) {
  const { locale, slug } = await params
  const typedLocale = (locale as Locale) || defaultLocale

  setRequestLocale(locale)

  const guide = (await getGuideBySlug(slug, typedLocale)) as Guide | null

  if (!guide) {
    notFound()
  }

  const reviewsResult = await getGuideReviews(guide.id, typedLocale)
  const reviews = reviewsResult.docs as GuideReview[]

  const profileLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: guide.name,
      image: getOptimizedImageUrl(guide.avatar, 'hero'),
      description: guide.tagline || undefined,
      knowsLanguage: (guide.languagesSpoken || []).map((l) => l.language),
      ...(guide.isOfficiallyLicensed ? { jobTitle: 'Licensed Tour Guide' } : {}),
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/${locale}/guides` },
      { '@type': 'ListItem', position: 3, name: guide.name, item: `${SITE_URL}/${locale}/guides/${slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <main className="relative z-10 w-full bg-white">
        <Navbar />
        <GuideDetailClient guide={guide} reviews={reviews} />
        <Footer />
      </main>
    </>
  )
}
