import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { ConfirmationPageClient } from './confirmation-page-client'

export const revalidate = 0

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Booking Confirmed | Atlas Mountain Visit',
    description: 'Your booking has been confirmed. Thank you for choosing Atlas Mountain Visit.',
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function ConfirmationPage({ params }: Props) {
  const { locale, slug } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'

  setRequestLocale(locale)

  return <ConfirmationPageClient locale={typedLocale} slug={slug} />
}
