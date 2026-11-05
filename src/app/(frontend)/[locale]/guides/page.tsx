import { Suspense } from 'react'
import { setRequestLocale } from 'next-intl/server'
import { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getGuides, getCategories } from '@/lib/payload'
import { getOptimizedImageUrl } from '@/lib/image-utils'
import type { Guide, Category } from '@/payload-types'
import { GuidesPageClient } from './guides-page-client'
import { defaultLocale, type Locale } from '@/i18n/config'
import { SITE_URL } from '@/lib/site-url'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const titles: Record<string, string> = {
    en: 'Local Tour Guides in Morocco | Atlas Mountain Visit',
    fr: 'Guides Touristiques Locaux au Maroc | Atlas Mountain Visit',
    es: 'Guías Turísticos Locales en Marruecos | Atlas Mountain Visit',
    cs: 'Místní Průvodci v Maroku | Atlas Mountain Visit',
  }

  const descriptions: Record<string, string> = {
    en: 'Meet our local tour guides across Morocco. Browse real guides, message them directly, and build a private, personalized day trip — no agencies, no hidden fees.',
    fr: 'Découvrez nos guides touristiques locaux au Maroc. Contactez-les directement pour une visite privée et personnalisée.',
    es: 'Conoce a nuestros guías turísticos locales en Marruecos. Contáctalos directamente para un tour privado y personalizado.',
    cs: 'Poznejte naše místní průvodce po Maroku. Kontaktujte je přímo pro soukromý a individuální výlet.',
  }

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    keywords: 'local tour guide morocco, private guide marrakech, licensed tour guide morocco, mount toubkal guide, sahara desert guide, english speaking guide morocco',
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: `${SITE_URL}/${locale}/guides`,
      siteName: 'Atlas Mountain Visit',
      locale: locale,
      type: 'website',
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/guides`,
      languages: {
        en: '/en/guides',
        fr: '/fr/guides',
        es: '/es/guides',
        cs: '/cs/guides',
      },
    },
  }
}

export default async function GuidesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const typedLocale = (locale as Locale) || defaultLocale

  setRequestLocale(locale)

  const [guidesResult, regionsResult] = await Promise.all([
    getGuides(typedLocale),
    getCategories('guide-region', typedLocale),
  ])
  const guides = guidesResult.docs as Guide[]
  const regions = regionsResult.docs as Category[]

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/${locale}/guides` },
    ],
  }

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: guides.map((guide, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/${locale}/guides/${guide.slug}`,
      item: {
        '@type': 'ProfilePage',
        name: guide.name,
        image: getOptimizedImageUrl(guide.avatar, 'card'),
      },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <main className="relative z-10 w-full bg-white">
        <Navbar />
        <Suspense fallback={<div className="min-h-screen bg-[#fafaf9] animate-pulse" />}>
          <GuidesPageClient guides={guides} regions={regions} />
        </Suspense>
        <Footer />
      </main>
    </>
  )
}
