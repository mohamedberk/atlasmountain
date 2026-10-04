import { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { ConfirmationPageClient } from './confirmation-page-client'
import { defaultLocale, type Locale } from '@/i18n/config'

export const revalidate = 0

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const typedLocale = (locale as Locale) || defaultLocale
  const t = await getTranslations({ locale: typedLocale, namespace: 'checkout' })
  return {
    title: `${t('confirmationMetaTitle')} | Atlas Mountain Visit`,
    description: t('confirmationMetaDescription'),
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function ConfirmationPage({ params }: Props) {
  const { locale, slug } = await params
  const typedLocale = (locale as Locale) || defaultLocale

  setRequestLocale(locale)

  return <ConfirmationPageClient locale={typedLocale} slug={slug} />
}
