import React from 'react'
import { DM_Serif_Text, Outfit } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale, getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { CartProvider } from '@/context/CartContext'
import { SiteSettingsProvider, type SiteSettingsData } from '@/context/SiteSettingsContext'
import { getSiteSettings } from '@/lib/payload'
import { FloatingWhatsApp } from '@/components/ui/floating-whatsapp'
import { NavigationLoadingWrapper } from '@/components/providers/navigation-loading-wrapper'
import '../globals.css'

// Body font - Outfit (self-hosted via next/font for performance)
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700', '800'],
})

// Display font for headlines - DM Serif Text (elegant serif)
const dmSerifText = DM_Serif_Text({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const titles: Record<string, string> = {
    en: 'Green Atlas Travel | Authentic Moroccan Adventures',
    fr: 'Green Atlas Travel | Aventures Authentiques au Maroc',
    de: 'Green Atlas Travel | Authentische Marokkanische Abenteuer',
  }

  const descriptions: Record<string, string> = {
    en: 'Experience the real Morocco with Green Atlas Travel. Desert escapes, mountain hikes, and authentic local experiences - no tourist traps, just the Morocco we love.',
    fr: 'Vivez le vrai Maroc avec Green Atlas Travel. Escapades dans le désert, randonnées en montagne et expériences locales authentiques - pas de pièges à touristes, juste le Maroc que nous aimons.',
    de: 'Erleben Sie das echte Marokko mit Green Atlas Travel. Wüstenausflüge, Bergwanderungen und authentische lokale Erlebnisse - keine Touristenfallen, nur das Marokko, das wir lieben.',
  }

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: '/',
      languages: {
        en: '/',
        fr: '/fr',
        de: '/de',
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Validate that the incoming locale is supported
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Get translations and site settings in parallel
  const [messages, siteSettingsRaw] = await Promise.all([
    getMessages({ locale }),
    getSiteSettings(locale as 'en' | 'fr'),
  ])

  // Transform the raw settings to match our context type
  const siteSettings: SiteSettingsData = {
    contact: siteSettingsRaw!.contact as SiteSettingsData['contact'],
    social: siteSettingsRaw!.social as SiteSettingsData['social'],
    company: siteSettingsRaw!.company as SiteSettingsData['company'],
  }

  return (
    <html lang={locale} className={`${outfit.variable} ${dmSerifText.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="dns-prefetch" href="https://utfs.io" />
        <link rel="dns-prefetch" href="https://0kswbexj9c.ufs.sh" />
      </head>
      <body className="bg-background text-foreground antialiased" style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SiteSettingsProvider settings={siteSettings}>
            <CartProvider>
              <NavigationLoadingWrapper>
                {children}
                <FloatingWhatsApp />
              </NavigationLoadingWrapper>
            </CartProvider>
          </SiteSettingsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
