'use client'

import { useTranslations } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import Image from 'next/image'
import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react'
import { useSiteSettings } from '@/context/SiteSettingsContext'

const ACCENT_GREEN = '#49b540'

// Social Media Icons as SVG components
const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const TikTokIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
)

const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

export function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const { settings, getPhoneLink, getEmailLink, getWhatsAppLink } = useSiteSettings()

  const quickLinks = [
    { name: tNav('home'), href: '/' },
    { name: tNav('about'), href: '/about' },
    { name: tNav('activities'), href: '/activities' },
    { name: tNav('blog') || 'Blog', href: '/blog' },
  ]

  const socialLinks = [
    { name: 'Instagram', href: settings.social.instagram || '#', icon: InstagramIcon },
    { name: 'Facebook', href: settings.social.facebook || '#', icon: FacebookIcon },
    { name: 'TikTok', href: settings.social.tiktok || '#', icon: TikTokIcon },
    { name: 'YouTube', href: settings.social.youtube || '#', icon: YouTubeIcon },
  ]

  return (
    <footer className="bg-[#fafaf9] relative overflow-hidden">
      {/* Decorative gradient */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ background: `radial-gradient(circle, ${ACCENT_GREEN} 0%, transparent 70%)` }}
      />

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Top Section - Logo, Links, Contact in one row on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Logo & Tagline */}
          <div className="sm:col-span-2 lg:col-span-1">
            <NavLink href="/" className="inline-block mb-4">
              <Image
                src="/greenatlaslogo.png"
                alt="Green Atlas Travel"
                width={180}
                height={56}
                className="h-11 sm:h-12 w-auto"
              />
            </NavLink>
            <p className="text-neutral-600 text-sm leading-relaxed mb-4 max-w-xs">
              {t('tagline')}
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-all hover:scale-110"
                  style={{ '--hover-color': ACCENT_GREEN } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = ACCENT_GREEN
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = ''
                    e.currentTarget.style.color = ''
                  }}
                  aria-label={social.name}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <NavLink
                    href={link.href}
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    onMouseEnter={(e) => e.currentTarget.style.color = ACCENT_GREEN}
                    onMouseLeave={(e) => e.currentTarget.style.color = ''}
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact - Harmonized with icon containers */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
              {t('contact')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-neutral-600">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#49b540]/10 flex items-center justify-center mt-0.5">
                  <MapPin className="w-4 h-4 text-[#49b540]" />
                </div>
                <span className="leading-relaxed pt-1">{settings.contact.address.full}</span>
              </li>
              <li>
                <a
                  href={getPhoneLink()}
                  className="flex items-center gap-3 text-sm text-neutral-600 hover:text-neutral-900 transition-colors group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#49b540]/10 flex items-center justify-center group-hover:bg-[#49b540]/20 transition-colors">
                    <Phone className="w-4 h-4 text-[#49b540]" />
                  </div>
                  <span className="pt-0.5">{settings.contact.phone.display}</span>
                </a>
              </li>
              <li>
                <a
                  href={getEmailLink()}
                  className="flex items-center gap-3 text-sm text-neutral-600 hover:text-neutral-900 transition-colors group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#49b540]/10 flex items-center justify-center group-hover:bg-[#49b540]/20 transition-colors">
                    <Mail className="w-4 h-4 text-[#49b540]" />
                  </div>
                  <span className="pt-0.5">{settings.contact.email}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
              {t('getInTouch') || 'Get in Touch'}
            </h4>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg font-medium text-sm transition-all group hover:shadow-md hover:-translate-y-0.5"
              style={{ backgroundColor: ACCENT_GREEN }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp Us
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
            <NavLink
              href="/activities"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-50 rounded-lg font-medium text-sm transition-all border border-neutral-200 text-neutral-700"
            >
              {t('viewActivities')}
            </NavLink>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-neutral-500 text-center sm:text-left">
              &copy; {new Date().getFullYear()} {settings.company.name}. {t('copyright')}.
            </p>
            <div className="flex items-center gap-4 sm:gap-6">
              <NavLink
                href="/terms"
                className="text-xs sm:text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.color = ACCENT_GREEN}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                {t('terms')}
              </NavLink>
              <NavLink
                href="/privacy"
                className="text-xs sm:text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.color = ACCENT_GREEN}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                {t('privacy')}
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
