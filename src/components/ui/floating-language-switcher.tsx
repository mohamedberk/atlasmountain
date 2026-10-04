'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname as useNextPathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import type { Locale } from '@/i18n/config'

const localeLabels: Record<string, { flag: string; label: string }> = {
  en: { flag: '🇬🇧', label: 'EN' },
  fr: { flag: '🇫🇷', label: 'FR' },
  es: { flag: '🇪🇸', label: 'ES' },
  cs: { flag: '🇨🇿', label: 'CS' },
}

// Hidden from the switcher for now (not launched yet) — the locale itself stays fully functional,
// so a direct link to /cs still works and still shows the correct flag as the current locale.
const HIDDEN_LOCALES = new Set(['cs'])
const visibleLocaleEntries = Object.entries(localeLabels).filter(([code]) => !HIDDEN_LOCALES.has(code))

export function FloatingLanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const rawPathname = useNextPathname()

  const hasStickyBottomBar = /^\/(([a-z]{2})\/)?(activities|checkout)\/[^/]+$/.test(rawPathname)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as Locale })
    setIsOpen(false)
  }

  const current = localeLabels[locale] ?? localeLabels.en

  return (
    <div
      ref={containerRef}
      className={`fixed left-6 z-50 ${hasStickyBottomBar ? 'bottom-24 lg:bottom-6' : 'bottom-6'}`}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-3 w-36 bg-white rounded-2xl shadow-md border border-neutral-100 overflow-hidden p-2"
          >
            {visibleLocaleEntries.map(([code, { flag, label }]) => (
              <button
                type="button"
                key={code}
                onClick={() => switchLocale(code)}
                className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm rounded-xl transition-all ${
                  locale === code
                    ? 'bg-[#ff2828]/10 text-[#ff2828] font-semibold'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span>{flag}</span>
                <span>{label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow border border-neutral-100"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        aria-label="Change language"
      >
        <span className="text-2xl leading-none">{current.flag}</span>
      </motion.button>
    </div>
  )
}
