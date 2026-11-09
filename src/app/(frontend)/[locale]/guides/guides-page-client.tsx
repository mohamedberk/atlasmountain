'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Search, Users, MessageCircle, Wand2, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { GuidesGrid } from '@/components/guides/guides-grid'
import { FAQSection } from '@/components/sections/faq-section'
import type { Guide, Category } from '@/payload-types'

const ACCENT_GREEN = '#ff2828'
const HERO_IMAGE = 'https://images.unsplash.com/photo-1548018560-4cb48a8837c1?q=80&w=2400&auto=format&fit=crop'

const LANGUAGES = [
  'English', 'Francais', 'Espanol', 'German', 'Arabic', 'Italian',
  'Portuguese', 'Dutch', 'Russian', 'Chinese', 'Japanese',
]

const CTA_IMAGE = 'https://images.unsplash.com/photo-1560789590-ee4cc7125967?q=80&w=1600&auto=format&fit=crop'

interface Props {
  guides: Guide[]
  regions: Category[]
}

export function GuidesPageClient({ guides, regions }: Props) {
  const tCommon = useTranslations('common')
  const tPage = useTranslations('guidesPage')

  const [activeRegion, setActiveRegion] = useState('all')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  const languagesInUse = useMemo(() => {
    const set = new Set<string>()
    guides.forEach((g) => g.languagesSpoken?.forEach((l) => set.add(l.language)))
    return LANGUAGES.filter((lang) => set.has(lang))
  }, [guides])

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    )
  }

  const displayRegions = [
    { id: 'all', name: tPage('allGuides'), slug: 'all' },
    ...regions.map((r) => ({ id: String(r.id), name: r.name, slug: r.slug })),
  ]

  const filteredGuides = useMemo(() => {
    let result = [...guides]

    if (activeRegion !== 'all') {
      result = result.filter((g) =>
        g.regions?.some((r) => (typeof r === 'object' ? String(r.id) : String(r)) === activeRegion)
      )
    }

    if (selectedLanguages.length > 0) {
      result = result.filter((g) =>
        g.languagesSpoken?.some((l) => selectedLanguages.includes(l.language))
      )
    }

    result.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      return (a.displayOrder || 99) - (b.displayOrder || 99)
    })

    return result
  }, [guides, activeRegion, selectedLanguages])

  const trustPoints = [
    { icon: Users, title: tPage('trustPoint1Title'), text: tPage('trustPoint1Text') },
    { icon: MessageCircle, title: tPage('trustPoint2Title'), text: tPage('trustPoint2Text') },
    { icon: Wand2, title: tPage('trustPoint3Title'), text: tPage('trustPoint3Text') },
    { icon: ShieldCheck, title: tPage('trustPoint4Title'), text: tPage('trustPoint4Text') },
  ]

  const faqItems = [
    { question: tPage('faq1Question'), answer: tPage('faq1Answer') },
    { question: tPage('faq2Question'), answer: tPage('faq2Answer') },
    { question: tPage('faq3Question'), answer: tPage('faq3Answer') },
    { question: tPage('faq4Question'), answer: tPage('faq4Answer') },
    { question: tPage('faq5Question'), answer: tPage('faq5Answer') },
    { question: tPage('faq6Question'), answer: tPage('faq6Answer') },
    { question: tPage('faq7Question'), answer: tPage('faq7Answer') },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner — diagonal split, brand colors */}
      <section className="relative overflow-hidden" style={{ backgroundColor: ACCENT_GREEN }}>
        <div className="max-w-7xl mx-auto relative lg:min-h-[460px]">
          {/* Photo — desktop: absolutely fills the full band height, top to bottom */}
          <div
            className="absolute inset-y-0 right-0 w-1/2 hidden lg:block"
            style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 100%, 0 100%)' }}
          >
            <Image
              src={HERO_IMAGE}
              alt="Marrakech medina architecture"
              fill
              priority
              sizes="50vw"
              className="object-cover"
            />
          </div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-12 pt-24 sm:pt-28 lg:pt-28 pb-10 lg:pb-14 lg:min-h-[460px]"
          >
            <h1 className="font-helvetica text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-md">
              {tPage('heroTitle')}
            </h1>
            <p className="text-white/90 text-base sm:text-lg max-w-sm mb-8">
              {tPage('heroDescription')}
            </p>
            <a
              href="#guides-grid"
              className="inline-flex w-fit items-center justify-center px-8 py-3 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-[#ff2828] transition-colors duration-300"
            >
              {tPage('heroCta')}
            </a>
          </motion.div>

          {/* Photo — mobile, no clip, in normal flow below text */}
          <div className="relative h-56 sm:h-64 lg:hidden">
            <Image
              src={HERO_IMAGE}
              alt="Marrakech medina architecture"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section id="guides-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-10">
          {/* Sidebar Filters */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-6 bg-[#fafaf9] rounded-2xl p-5 border border-neutral-100">
            <div>
              <h2 className="font-helvetica text-lg font-bold text-neutral-900 mb-3">{tPage('filtersHeading')}</h2>
            </div>

            {languagesInUse.length > 0 && (
              <div className="border-t border-neutral-100 pt-5">
                <h3 className="font-helvetica font-semibold text-sm text-neutral-900 mb-3">{tPage('languageFilterHeading')}</h3>
                <div className="space-y-2.5">
                  {languagesInUse.map((lang) => {
                    const checked = selectedLanguages.includes(lang)
                    return (
                      <label key={lang} className="w-full flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLanguage(lang)}
                          className="w-4 h-4 rounded border-neutral-300 text-[#ff2828] focus:ring-[#ff2828]/20"
                        />
                        <span className="text-sm text-neutral-700">{lang}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </aside>

          {/* Grid */}
          <div>
            {/* Region Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {displayRegions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setActiveRegion(region.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeRegion === region.id
                      ? 'text-white shadow-sm'
                      : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                  }`}
                  style={activeRegion === region.id ? { backgroundColor: ACCENT_GREEN } : {}}
                >
                  {region.name}
                </button>
              ))}
            </div>

            <h2 className="font-helvetica text-xl sm:text-2xl text-neutral-900 mb-4">
              {tPage('guidesCount', { count: filteredGuides.length })}
            </h2>

            {filteredGuides.length > 0 ? (
              <GuidesGrid guides={filteredGuides} />
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-[#fafaf9] rounded-2xl">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${ACCENT_GREEN}15` }}>
                  <Search className="w-8 h-8" style={{ color: ACCENT_GREEN }} />
                </div>
                <h3 className="font-helvetica text-xl font-bold text-neutral-900 mb-2">{tPage('noGuidesFound')}</h3>
                <p className="text-neutral-500 mb-6">{tPage('tryAdjustingFilters')}</p>
                <button
                  onClick={() => {
                    setActiveRegion('all')
                    setSelectedLanguages([])
                  }}
                  className="px-6 py-3 rounded-xl text-white font-semibold transition-colors"
                  style={{ backgroundColor: ACCENT_GREEN }}
                >
                  {tCommon('clearFilters')}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Why licensing matters — honest trust content (SEO) */}
      <section className="py-14 md:py-20" style={{ backgroundColor: `${ACCENT_GREEN}08` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 md:mb-14">
            <div className="max-w-2xl">
              <h2 className="font-helvetica text-2xl sm:text-3xl text-neutral-900 mb-3">
                {tPage('trustHeading')}
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                {tPage('trustIntro')}
              </p>
            </div>
            <a
              href="#guides-grid"
              className="shrink-0 inline-flex w-fit items-center justify-center px-6 py-3 rounded-full text-white font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT_GREEN }}
            >
              {tPage('trustCta')}
            </a>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trustPoints.map((point) => (
              <div key={point.title} className="rounded-2xl p-6" style={{ backgroundColor: `${ACCENT_GREEN}0A` }}>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                >
                  <point.icon className="w-6 h-6" style={{ color: ACCENT_GREEN }} />
                </div>
                <h3 className="font-helvetica text-lg font-bold mb-2 text-neutral-900">{point.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{point.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-0 items-center p-8 sm:p-12 lg:p-14">
            <div>
              <h2 className="font-helvetica text-2xl sm:text-3xl font-bold text-white mb-4 max-w-md">
                {tPage('ctaHeading')}
              </h2>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-sm mb-8">
                {tPage('ctaDescription')}
              </p>
              <a
                href="#guides-grid"
                className="inline-flex w-fit items-center justify-center px-8 py-3 rounded-full text-white font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT_GREEN }}
              >
                {tPage('ctaButton')}
              </a>
            </div>
            <div className="relative h-56 sm:h-72 lg:h-80 rounded-2xl overflow-hidden">
              <Image
                src={CTA_IMAGE}
                alt="A mule trail through the Atlas Mountains near Imlil"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection
        faqData={{
          title: tPage('faqTitle'),
          titleHighlight: tPage('faqTitleHighlight'),
          description: tPage('faqDescription'),
          items: faqItems,
        }}
        headingFontClassName="font-helvetica"
      />
    </div>
  )
}
