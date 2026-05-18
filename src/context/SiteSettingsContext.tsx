'use client'

import { createContext, useContext, ReactNode } from 'react'

export interface SiteSettingsData {
  contact: {
    phone: {
      countryCode: string
      number: string
      display: string
    }
    email: string
    address: {
      line1: string
      line2: string
      full: string
    }
    availability: string
  }
  social: {
    facebook?: string
    instagram?: string
    youtube?: string
    tiktok?: string
    twitter?: string
  }
  company: {
    name: string
    shortName: string
    tagline?: string
  }
}

interface SiteSettingsContextType {
  settings: SiteSettingsData
  getWhatsAppLink: (message?: string) => string
  getPhoneLink: () => string
  getEmailLink: () => string
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined)

export function SiteSettingsProvider({
  children,
  settings,
}: {
  children: ReactNode
  settings: SiteSettingsData
}) {
  const getWhatsAppLink = (message?: string) => {
    const { countryCode, number } = settings.contact.phone
    const digits = `${countryCode}${number}`.replace(/\D/g, '')
    const baseUrl = `https://wa.me/${digits}`
    if (message) {
      return `${baseUrl}?text=${encodeURIComponent(message)}`
    }
    return baseUrl
  }

  const getPhoneLink = () => {
    const { countryCode, number } = settings.contact.phone
    return `tel:${countryCode}${number}`
  }

  const getEmailLink = () => {
    return `mailto:${settings.contact.email}`
  }

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        getWhatsAppLink,
        getPhoneLink,
        getEmailLink,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider')
  }
  return context
}
