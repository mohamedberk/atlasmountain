import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { RichText } from '@/components/rich-text'
import { getTermsPage } from '@/lib/payload'
import { format } from 'date-fns'

interface Props {
  params: Promise<{ locale: string }>
}

const fallbackContent: Record<string, { title: string }> = {
  en: { title: 'Terms & Conditions' },
  fr: { title: 'Conditions Générales' },
  de: { title: 'Allgemeine Geschäftsbedingungen' },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'

  let metaTitle = fallbackContent[typedLocale]?.title || 'Terms & Conditions'
  let metaDescription = ''

  try {
    const pageData = await getTermsPage(typedLocale)
    if (pageData?.seo?.metaTitle) metaTitle = pageData.seo.metaTitle
    if (pageData?.seo?.metaDescription) metaDescription = pageData.seo.metaDescription
  } catch (e) {
    // Use fallback
  }

  return {
    title: `${metaTitle} | Green Atlas Travel`,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `https://greenatlastravel.com/${locale}/terms`,
      siteName: 'Green Atlas Travel',
      locale: locale,
      type: 'website',
    },
  }
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'
  setRequestLocale(locale)

  let pageData = null
  try {
    pageData = await getTermsPage(typedLocale)
  } catch (e) {
    console.log('Terms page not configured in CMS, using fallback')
  }

  const title = pageData?.title || fallbackContent[typedLocale]?.title || 'Terms & Conditions'
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
                Last updated: {lastUpdated}
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
                Terms & Conditions content will appear here once configured in the CMS.
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
