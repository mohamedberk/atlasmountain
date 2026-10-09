import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { AboutPageClient } from './about-page-client'
import { getAboutPage } from '@/lib/payload'
import { defaultLocale, type Locale } from '@/i18n/config'
import { SITE_URL } from '@/lib/site-url'

// Revalidate every hour as fallback (on-demand revalidation via tags is primary)
export const revalidate = 3600

interface Props {
  params: Promise<{ locale: string }>
}

// Fallback content if CMS is not configured yet
const fallbackContent: Record<string, { title: string; subtitle: string; description: string }> = {
  en: {
    title: 'About Us',
    subtitle: 'Your Trusted Morocco Travel Partner',
    description: 'Discover Atlas Mountain Visit - 20+ years of crafting authentic Moroccan experiences. Local expertise, personalized adventures, and unforgettable memories.',
  },
  fr: {
    title: 'À Propos',
    subtitle: 'Votre Partenaire de Voyage au Maroc',
    description: 'Découvrez Atlas Mountain Visit - Plus de 20 ans d\'expériences marocaines authentiques.',
  },
  es: {
    title: 'Sobre Nosotros',
    subtitle: 'Tu Socio de Confianza para Viajar a Marruecos',
    description: 'Descubre Atlas Mountain Visit - Más de 20 años creando experiencias marroquíes auténticas.',
  },
  cs: {
    title: 'O Nás',
    subtitle: 'Váš Důvěryhodný Partner pro Cesty do Maroka',
    description: 'Objevte Atlas Mountain Visit - Více než 20 let autentických marockých zážitků.',
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = (locale as Locale) || defaultLocale

  // Try to get from CMS
  let metaTitle = fallbackContent[typedLocale]?.title || 'About Us'
  let metaDescription = fallbackContent[typedLocale]?.description || ''

  try {
    const pageData = await getAboutPage(typedLocale)
    if (pageData?.seo?.metaTitle) metaTitle = pageData.seo.metaTitle
    if (pageData?.seo?.metaDescription) metaDescription = pageData.seo.metaDescription
  } catch (e) {
    // Use fallback
  }

  return {
    title: `${metaTitle} | Atlas Mountain Visit`,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `${SITE_URL}/${locale}/about`,
      siteName: 'Atlas Mountain Visit',
      locale: locale,
      type: 'website',
    },
  }
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const typedLocale = (locale as Locale) || defaultLocale
  setRequestLocale(locale)

  // Try to fetch from CMS
  let pageData = null
  try {
    pageData = await getAboutPage(typedLocale)
  } catch (e) {
    console.log('About page not configured in CMS, using fallback')
  }

  const content = fallbackContent[typedLocale] || fallbackContent.en

  return (
    <main className="min-h-screen bg-[#f9f9fb]">
      <Navbar />
      <AboutPageClient content={content} cmsData={pageData} />
      <Footer />
    </main>
  )
}
