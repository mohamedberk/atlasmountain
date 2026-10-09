import { Suspense } from 'react'
import { setRequestLocale } from 'next-intl/server'
import { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getActivities, getCategories } from '@/lib/payload'
import type { Activity, Category } from '@/payload-types'
import { ActivitiesPageClient } from './activities-page-client'
import { defaultLocale, type Locale } from '@/i18n/config'
import { SITE_URL } from '@/lib/site-url'

// Revalidate every hour as fallback (on-demand revalidation is primary)
export const revalidate = 3600

// SEO Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const titles: Record<string, string> = {
    en: 'All Activities | Atlas Mountain Visit',
    fr: 'Toutes les Activités | Atlas Mountain Visit',
    es: 'Todas las Actividades | Atlas Mountain Visit',
    cs: 'Všechny Aktivity | Atlas Mountain Visit',
  }

  const descriptions: Record<string, string> = {
    en: 'Explore our complete collection of authentic Moroccan experiences. Desert adventures, hot air balloons, quad biking, and more in Marrakech.',
    fr: 'Découvrez notre collection complète d\'expériences marocaines authentiques. Aventures dans le désert, montgolfières, quad et plus à Marrakech.',
    es: 'Explora nuestra colección completa de experiencias marroquíes auténticas. Aventuras en el desierto, globos aerostáticos, quads y más en Marrakech.',
    cs: 'Prozkoumejte naši kompletní sbírku autentických marockých zážitků. Pouštní dobrodružství, horkovzdušné balóny, čtyřkolky a další v Marrákeši.',
  }

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    keywords: 'Morocco activities, Marrakech tours, desert safari Morocco, quad biking Marrakech, hot air balloon Morocco, Agafay desert tours',
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: `${SITE_URL}/${locale}/activities`,
      siteName: 'Atlas Mountain Visit',
      locale: locale,
      type: 'website',
    },
  }
}

export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const typedLocale = (locale as Locale) || defaultLocale

  // Enable static rendering
  setRequestLocale(locale)

  // Fetch all data from CMS in parallel
  const [activitiesResult, categoriesResult] = await Promise.all([
    getActivities(typedLocale),
    getCategories('activity', typedLocale),
  ])

  // Extract docs from results
  const activities = activitiesResult.docs as Activity[]
  const categories = categoriesResult.docs as Category[]

  return (
    <>
      <main className="relative z-10 w-full overflow-hidden bg-[#f9f9fb]">
        {/* Navbar */}
        <Navbar />

        {/* Activities Page Content */}
        <Suspense fallback={<div className="min-h-screen bg-[#f9f9fb] animate-pulse" />}>
          <ActivitiesPageClient activities={activities} categories={categories} />
        </Suspense>

        {/* Footer */}
        <Footer />
      </main>
    </>
  )
}
