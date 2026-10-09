import dynamicImport from 'next/dynamic'
import { Suspense } from 'react'
import { setRequestLocale } from 'next-intl/server'
import { Metadata } from 'next'
import { ErrorBoundary } from '@/components/error-boundary'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ModernHero } from '@/components/sections/modern-hero'
import { GoogleReviews } from '@/components/sections/google-reviews'
import {
  getActivities,
  getCategories,
  getHomePage,
  getBlogPosts,
  getSiteSettings,
} from '@/lib/payload'
import type { Activity, Category, BlogPost } from '@/payload-types'
import { defaultLocale, type Locale } from '@/i18n/config'
import { SITE_URL } from '@/lib/site-url'

// Revalidate every hour as fallback (on-demand revalidation via tags is primary)
export const revalidate = 3600

// Dynamically import below-the-fold components with loading states
const PremiumActivityCards = dynamicImport(
  () => import('@/components/activities/premium-activity-cards').then(mod => mod.PremiumActivityCards),
  { loading: () => <div className="h-96 bg-surface/5 animate-pulse" /> }
)

const AboutSection = dynamicImport(
  () => import('@/components/sections/about-section').then(mod => mod.AboutSection),
  { loading: () => <div className="h-96 bg-surface/5 animate-pulse" /> }
)

const DetailedActivitiesSection = dynamicImport(
  () => import('@/components/sections/detailed-activities-section').then(mod => mod.DetailedActivitiesSection),
  { loading: () => <div className="h-96 bg-surface/5 animate-pulse" /> }
)

const ExperiencesDiscovery = dynamicImport(
  () => import('@/components/sections/experiences-discovery').then(mod => mod.ExperiencesDiscovery),
  { loading: () => <div className="h-96 bg-surface/5 animate-pulse" /> }
)

const FAQSection = dynamicImport(
  () => import('@/components/sections/faq-section').then(mod => mod.FAQSection),
  { loading: () => <div className="h-96 bg-surface/5 animate-pulse" /> }
)

const BlogSection = dynamicImport(
  () => import('@/components/sections/blog-section').then(mod => mod.BlogSection),
  { loading: () => <div className="h-96 bg-surface/5 animate-pulse" /> }
)

// services section hidden — keep import commented in case it gets re-enabled
// const ServicesSection = dynamicImport(
//   () => import('@/components/sections/services-section').then(mod => mod.ServicesSection),
//   { loading: () => <div className="h-96 bg-surface/5 animate-pulse" /> }
// )

const DestinationsSection = dynamicImport(
  () => import('@/components/sections/destinations-section').then(mod => mod.DestinationsSection),
  { loading: () => <div className="h-96 bg-surface/5 animate-pulse" /> }
)

// SEO Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const titles: Record<string, string> = {
    en: 'Atlas Mountain Visit | Authentic Moroccan Adventures in Marrakech',
    fr: 'Atlas Mountain Visit | Aventures Marocaines Authentiques à Marrakech',
    es: 'Atlas Mountain Visit | Aventuras Marroquíes Auténticas en Marrakech',
    cs: 'Atlas Mountain Visit | Autentická Marocká Dobrodružství v Marrákeši',
  }

  const descriptions: Record<string, string> = {
    en: 'Book unforgettable experiences in Morocco. Desert tours, hot air balloons, quad biking, and luxury transport. 20+ years of excellence.',
    fr: 'Réservez des expériences inoubliables au Maroc. Tours du désert, montgolfières, quad et transport de luxe. Plus de 20 ans d\'excellence.',
    es: 'Reserva experiencias inolvidables en Marruecos. Tours por el desierto, globos aerostáticos, quads y transporte de lujo. Más de 20 años de excelencia.',
    cs: 'Rezervujte si nezapomenutelné zážitky v Maroku. Pouštní zájezdy, horkovzdušné balóny, čtyřkolky a luxusní doprava. Více než 20 let zkušeností.',
  }

  const homePageData = (await getHomePage(locale as Locale)) as any
  const title = homePageData?.seo?.metaTitle?.trim() || titles[locale] || titles.en
  const description = homePageData?.seo?.metaDescription?.trim() || descriptions[locale] || descriptions.en

  return {
    title,
    description,
    keywords: 'Morocco tours, Marrakech activities, desert safari, quad biking Morocco, hot air balloon Marrakech, Agafay desert, Ouzoud falls, transport Marrakech',
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}`,
      siteName: 'Atlas Mountain Visit',
      locale: locale,
      type: 'website',
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: '/en',
        fr: '/fr',
        es: '/es',
        cs: '/cs',
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const typedLocale = (locale as Locale) || defaultLocale

  // Enable static rendering
  setRequestLocale(locale)

  // Fetch all data from CMS in parallel
  const [
    activitiesResult,
    categoriesResult,
    homePageResult,
    blogPostsResult,
    siteSettingsResult,
  ] = await Promise.all([
    getActivities(typedLocale),
    getCategories('activity', typedLocale),
    getHomePage(typedLocale),
    getBlogPosts(typedLocale, 3),
    getSiteSettings(typedLocale),
  ])

  // Extract docs from results
  const activities = activitiesResult.docs as Activity[]
  const categories = categoriesResult.docs as Category[]
  const blogPosts = blogPostsResult.docs as BlogPost[]

  // Cast homePageData since types aren't regenerated yet
  const homePageData = homePageResult as any

  // Default review stats (used for JSON-LD aggregateRating)
  const reviewStats = {
    totalReviews: 8,
    averageRating: 5.0,
    happyTravelers: '500+',
    wouldRecommend: '98%',
  }

  // Structured Data for SEO (using site settings from DB)
  const siteSettings = siteSettingsResult as any
  const sameAsLinks = [
    siteSettings?.social?.facebook,
    siteSettings?.social?.instagram,
    siteSettings?.social?.youtube,
    siteSettings?.social?.tiktok,
    siteSettings?.social?.twitter,
  ].filter(Boolean)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: siteSettings?.company?.name,
    description: 'Authentic Moroccan adventures in Marrakech. Desert tours, hot air balloons, quad biking, and luxury transport.',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteSettings?.contact?.address?.line1,
      addressCountry: siteSettings?.contact?.address?.line2,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(reviewStats.averageRating),
      reviewCount: String(reviewStats.totalReviews),
      bestRating: '5',
    },
    sameAs: sameAsLinks,
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="relative z-10 w-full overflow-hidden bg-[#f9f9fb]">
        {/* Navbar */}
        <Navbar />

        {/* Hero Section - Static import for fast LCP (no dynamic import delay) */}
        <ModernHero heroData={homePageData?.hero} />

        {/* About Section */}
        <ErrorBoundary>
          <Suspense fallback={<div className="h-96 bg-surface/5 animate-pulse" />}>
            <AboutSection aboutData={homePageData?.about} />
          </Suspense>
        </ErrorBoundary>

        {/* Premium Activity Cards with Filtering */}
        <ErrorBoundary>
          <Suspense fallback={<div className="h-96 bg-surface/5 animate-pulse" />}>
            <PremiumActivityCards
              activities={activities}
              categories={categories}
              categoriesSectionData={homePageData?.categoriesSection}
              locale={typedLocale}
            />
          </Suspense>
        </ErrorBoundary>

        {/* Detailed Activities Section (Our Best Trips) */}
        <ErrorBoundary>
          <Suspense fallback={<div className="h-96 bg-surface/5 animate-pulse" />}>
            <DetailedActivitiesSection
              activities={activities}
              bestTripsData={homePageData?.bestTrips}
            />
          </Suspense>
        </ErrorBoundary>

        {/* services section hidden */}
        {/* <ErrorBoundary>
          <Suspense fallback={<div className="h-96 bg-surface/5 animate-pulse" />}>
            <ServicesSection />
          </Suspense>
        </ErrorBoundary> */}

        {/* Destinations Section */}
        <ErrorBoundary>
          <Suspense fallback={<div className="h-96 bg-surface/5 animate-pulse" />}>
            <DestinationsSection />
          </Suspense>
        </ErrorBoundary>

        {/* Blog Section */}
        {blogPosts.length > 0 && (
          <ErrorBoundary>
            <Suspense fallback={<div className="h-96 bg-surface/5 animate-pulse" />}>
              <BlogSection posts={blogPosts} blogSectionData={homePageData?.blogSection} />
            </Suspense>
          </ErrorBoundary>
        )}

        {/* Guest Reviews */}
        <ErrorBoundary>
          <Suspense fallback={<div className="h-96 bg-surface/5 animate-pulse" />}>
            <GoogleReviews reviewsData={homePageData?.reviewsSection} />
          </Suspense>
        </ErrorBoundary>

        {/* FAQ Section */}
        <ErrorBoundary>
          <Suspense fallback={<div className="h-96 bg-surface/5 animate-pulse" />}>
            <FAQSection faqData={homePageData?.faq} />
          </Suspense>
        </ErrorBoundary>

        {/* Footer */}
        <Footer />
      </main>
    </>
  )
}
