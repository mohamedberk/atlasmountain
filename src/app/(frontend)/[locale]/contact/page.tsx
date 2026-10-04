import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ContactPageClient } from './contact-page-client'
import { getContactPage } from '@/lib/payload'
import { defaultLocale, type Locale } from '@/i18n/config'

// Revalidate every hour as fallback (on-demand revalidation is primary)
export const revalidate = 3600

interface Props {
  params: Promise<{ locale: string }>
}

// Fallback content if CMS is not configured yet
const fallbackContent: Record<string, { title: string; subtitle: string; description: string }> = {
  en: {
    title: 'Contact Us',
    subtitle: 'Get in Touch',
    description: 'Have questions about your Morocco adventure? We\'re here to help 24/7. Reach out and let\'s plan your perfect trip.',
  },
  fr: {
    title: 'Contactez-Nous',
    subtitle: 'Prenez Contact',
    description: 'Des questions sur votre aventure au Maroc? Nous sommes là pour vous aider 24h/24.',
  },
  es: {
    title: 'Contáctanos',
    subtitle: 'Ponte en Contacto',
    description: '¿Tienes preguntas sobre tu aventura en Marruecos? Estamos aquí para ayudarte 24/7.',
  },
  cs: {
    title: 'Kontaktujte Nás',
    subtitle: 'Spojte se s Námi',
    description: 'Máte otázky ohledně svého marockého dobrodružství? Jsme tu pro vás 24/7.',
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = (locale as Locale) || defaultLocale

  // Try to get from CMS
  let metaTitle = fallbackContent[typedLocale]?.title || 'Contact Us'
  let metaDescription = fallbackContent[typedLocale]?.description || ''

  try {
    const pageData = await getContactPage(typedLocale)
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
      url: `https://atlasmountainsvisit.com/${locale}/contact`,
      siteName: 'Atlas Mountain Visit',
      locale: locale,
      type: 'website',
    },
  }
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  const typedLocale = (locale as Locale) || defaultLocale
  setRequestLocale(locale)

  // Try to fetch from CMS
  let pageData = null
  try {
    pageData = await getContactPage(typedLocale)
  } catch (e) {
    console.log('Contact page not configured in CMS, using fallback')
  }

  const content = fallbackContent[typedLocale] || fallbackContent.en

  return (
    <main className="min-h-screen bg-[#f9f9fb]">
      <Navbar />
      <ContactPageClient content={content} cmsData={pageData} locale={typedLocale} />
      <Footer />
    </main>
  )
}
