import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { RichText } from '@/components/rich-text'
import { getPrivacyPage } from '@/lib/payload'
import { format } from 'date-fns'

interface Props {
  params: Promise<{ locale: string }>
}

const fallbackContent: Record<string, { title: string }> = {
  en: { title: 'Privacy Policy' },
  fr: { title: 'Politique de Confidentialité' },
  de: { title: 'Datenschutzerklärung' },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'

  let metaTitle = fallbackContent[typedLocale]?.title || 'Privacy Policy'
  let metaDescription = ''

  try {
    const pageData = await getPrivacyPage(typedLocale)
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
      url: `https://atlasmountainsvisit.com/${locale}/privacy`,
      siteName: 'Atlas Mountain Visit',
      locale: locale,
      type: 'website',
    },
  }
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'privacyPage' })

  let pageData = null
  try {
    pageData = await getPrivacyPage(typedLocale)
  } catch (e) {
    console.log('Privacy page not configured in CMS, using fallback')
  }

  const title = pageData?.title || fallbackContent[typedLocale]?.title || t('fallbackTitle')
  const lastUpdated = pageData?.lastUpdated ? format(new Date(pageData.lastUpdated), 'MMMM d, yyyy') : null

  return (
    <main className="min-h-screen bg-[#f9f9fb]">
      <Navbar />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-neutral-500">
                {t('lastUpdated', { date: lastUpdated })}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 md:p-12">
            {pageData?.content ? (
              <div className="prose prose-lg prose-neutral max-w-none prose-headings:font-bold prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-a:text-primary prose-a:font-medium hover:prose-a:text-primary/80 prose-li:text-neutral-700">
                <RichText content={pageData.content} />
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-10">
                {t('fallbackContent')}
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
