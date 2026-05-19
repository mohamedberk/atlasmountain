import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { AboutPageClient } from './about-page-client'
import { getAboutPage } from '@/lib/payload'

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
  de: {
    title: 'Über Uns',
    subtitle: 'Ihr Vertrauenswürdiger Marokko-Reisepartner',
    description: 'Entdecken Sie Atlas Mountain Visit - 20+ Jahre authentische marokkanische Erlebnisse.',
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'

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
      url: `https://atlasmountainsvisit.com/${locale}/about`,
      siteName: 'Atlas Mountain Visit',
      locale: locale,
      type: 'website',
    },
  }
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'
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
