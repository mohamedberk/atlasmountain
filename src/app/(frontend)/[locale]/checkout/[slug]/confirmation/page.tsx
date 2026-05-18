import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { ConfirmationPageClient } from './confirmation-page-client'

export const revalidate = 0

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Booking Confirmed | Green Atlas Travel',
    description: 'Your booking has been confirmed. Thank you for choosing Green Atlas Travel.',
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
