'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Award, Globe, MapPin, MessageCircle, ShieldCheck, Users, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import { StarRating } from '@/components/ui/star-rating'
import { Badge } from '@/components/ui/badge'
import { RichText } from '@/components/rich-text'
import { ReviewsList } from '@/components/ui/reviews-list'
import { GuideImageCarousel } from '@/components/guides/guide-image-carousel'
import { GuideToursTabs } from '@/components/guides/guide-tours-tabs'
import { useSiteSettings } from '@/context/SiteSettingsContext'
import { getOptimizedImageUrl } from '@/lib/image-utils'
import type { Guide, GuideReview, Activity, Category } from '@/payload-types'

const ACCENT_GREEN = '#ff2828'

function getGuideImages(guide: Guide): string[] {
  const images = [getOptimizedImageUrl(guide.avatar, 'hero')]
  guide.gallery?.forEach((item) => {
    const url = getOptimizedImageUrl(item.media, 'hero')
    if (url && !images.includes(url)) images.push(url)
  })
  return images
}

type Translate = (key: string, values?: Record<string, string | number>) => string

interface GuideCardHeaderProps {
  guide: Guide
  tours: Activity[]
  languages: string[]
  primaryRegion: Category | undefined
  tDetail: Translate
}

function GuideCardHeader({ guide, tours, languages, primaryRegion, tDetail }: GuideCardHeaderProps) {
  return (
    <>
      <div>
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
            <Image src={getOptimizedImageUrl(guide.avatar, 'thumbnail')} alt={guide.name} fill sizes="56px" className="object-cover" />
          </div>
          <div className="font-semibold text-neutral-900">{guide.name}</div>
        </div>

        {guide.tagline && <p className="text-xs text-neutral-500 mt-2">{guide.tagline}</p>}

        {Boolean(guide.totalReviews) && (
          <div className="mt-2">
            <StarRating rating={guide.overallRating || 0} reviewCount={guide.totalReviews || undefined} size="sm" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        {guide.hostingSince && (
          <div className="flex items-center gap-2.5 text-sm text-neutral-600">
            <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <span>
              {primaryRegion
                ? tDetail('hostingInSince', { location: primaryRegion.name, year: guide.hostingSince })
                : tDetail('hostingSince', { year: guide.hostingSince })}
            </span>
          </div>
        )}

        {languages.length > 0 && (
          <div className="flex items-center gap-2.5 text-sm text-neutral-600">
            <Globe className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <span>{tDetail('speaksLanguages', { languages: languages.join(', ') })}</span>
          </div>
        )}

        {tours.length > 0 && (
          <div className="flex items-center gap-2.5 text-sm text-neutral-600">
            <Users className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <span>{tDetail('privateTourCount', { count: tours.length })}</span>
          </div>
        )}
      </div>
    </>
  )
}

const MOBILE_TAB_SECTIONS = ['about', 'guide-tours', 'reviews-section'] as const
type MobileTabSection = (typeof MOBILE_TAB_SECTIONS)[number]

function GuideSectionTabs({ tDetail }: { tDetail: Translate }) {
  const [activeSection, setActiveSection] = useState<MobileTabSection>('about')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as MobileTabSection)
          }
        })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    )
    const elements = MOBILE_TAB_SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const tabs: { id: MobileTabSection; label: string }[] = [
    { id: 'about', label: tDetail('aboutTab') },
    { id: 'guide-tours', label: tDetail('toursTab') },
    { id: 'reviews-section', label: tDetail('reviewsTab') },
  ]

  return (
    <div className="lg:hidden sticky top-16 z-20 -mx-4 sm:-mx-6 mb-6 bg-white border-b border-neutral-100">
      <div className="flex items-center px-4 sm:px-6">
        {tabs.map((tab) => (
          <a
            key={tab.id}
            href={`#${tab.id}`}
            className="flex-1 text-center py-3 text-sm font-semibold border-b-2 transition-colors"
            style={
              activeSection === tab.id
                ? { color: ACCENT_GREEN, borderColor: ACCENT_GREEN }
                : { color: 'rgb(115 115 115)', borderColor: 'transparent' }
            }
          >
            {tab.label}
          </a>
        ))}
      </div>
    </div>
  )
}

interface Props {
  guide: Guide
  reviews: GuideReview[]
}

export function GuideDetailClient({ guide, reviews }: Props) {
  const tNav = useTranslations('nav')
  const tDetail = useTranslations('guideDetail')
  const { getWhatsAppLink } = useSiteSettings()

  const tours = (guide.tours || []).filter((t): t is Activity => typeof t === 'object')
  const languages = (guide.languagesSpoken || []).map((l) => l.language)
  const primaryRegion = (guide.regions || []).find((r): r is Category => typeof r === 'object')

  const handleSelectTour = (tour: Activity) => {
    window.open(
      getWhatsAppLink(tDetail('selectTourPrefill', { tour: tour.title, name: guide.name })),
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Mobile Bottom Action Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-neutral-200 shadow-md lg:hidden"
      >
        <div className="px-4 py-2.5 flex items-center gap-3">
          <a
            href={getWhatsAppLink(tDetail('whatsappMessage', { name: guide.name }))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all"
            style={{ borderColor: ACCENT_GREEN, color: ACCENT_GREEN }}
          >
            {tDetail('contactMeCta')}
          </a>
          <a
            href="#guide-tours"
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all"
            style={{ backgroundColor: ACCENT_GREEN }}
          >
            {tDetail('bookMeCta')}
          </a>
        </div>
      </motion.div>

      {/* Breadcrumb */}
      <div className="bg-neutral-50 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <NavLink href="/" className="text-neutral-500 hover:text-primary transition-colors">{tNav('home')}</NavLink>
            <span className="text-neutral-300">/</span>
            <NavLink href="/guides" className="text-neutral-500 hover:text-primary transition-colors">{tNav('guides') || 'Guides'}</NavLink>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900 font-medium truncate">{guide.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 lg:pt-8 pb-24 lg:pb-16">
        {/* Mobile: quick-glance guide summary + photo, both above the fold */}
        <div className="lg:hidden space-y-4 mb-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3">
            <GuideCardHeader guide={guide} tours={tours} languages={languages} primaryRegion={primaryRegion} tDetail={tDetail} />
          </div>

          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
            <GuideImageCarousel images={getGuideImages(guide)} alt={guide.name} variant="detail" className="absolute inset-0" />
          </div>
        </div>

        {/* Mobile: sticky About / Tours / Reviews section nav */}
        <GuideSectionTabs tDetail={tDetail} />

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div id="about" className="scroll-mt-28">
              <h1 className="sr-only">{guide.name}</h1>
              <div className="flex items-center gap-4 flex-wrap">
                {guide.isOfficiallyLicensed && (
                  <Badge variant="solid" icon={<ShieldCheck className="w-3.5 h-3.5" />}>{tDetail('licensedBadge')}</Badge>
                )}
                {guide.isVerifiedLocal && <Badge variant="soft" icon={<Award className="w-3.5 h-3.5" />}>{tDetail('verifiedBadge')}</Badge>}
                {guide.respondsQuickly && <Badge variant="soft" icon={<Zap className="w-3.5 h-3.5" />}>{tDetail('respondsQuicklyBadge')}</Badge>}
              </div>
            </div>

            {/* Image Carousel (desktop — mobile shows its own copy above the fold, near the summary card) */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden lg:block relative aspect-[16/9] rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
              <GuideImageCarousel images={getGuideImages(guide)} alt={guide.name} variant="detail" className="absolute inset-0" />
            </motion.div>

            {/* Bio */}
            {guide.bio && (
              <div>
                <h2 className="font-display text-xl font-bold text-neutral-900 mb-3">{tDetail('aboutHeading', { name: guide.name })}</h2>
                <div className="text-neutral-700 [&_p]:mb-3">
                  <RichText content={guide.bio} />
                </div>
              </div>
            )}

            {/* Tours */}
            <div>
              <h2 className="font-display text-xl font-bold text-neutral-900 mb-3">{tDetail('toursHeading', { name: guide.name })}</h2>
              <GuideToursTabs tours={tours} guideName={guide.name} guideSlug={guide.slug} onSelectTour={handleSelectTour} />
            </div>

            {/* Reviews */}
            <div id="reviews-section" className="scroll-mt-28">
              <h2 className="font-display text-xl font-bold text-neutral-900 mb-3">{tDetail('reviewsHeading', { name: guide.name })}</h2>
              <ReviewsList reviews={reviews} guideName={guide.name} />
            </div>

          </div>

          {/* Right Column - Sticky Guide Card (desktop only — mobile uses the summary card + fixed bottom bar) */}
          <div className="hidden lg:block">
            <div id="guide-contact-card" className="lg:sticky lg:top-24 scroll-mt-24">
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="hidden lg:block h-2" style={{ backgroundColor: ACCENT_GREEN }} />
                <div className="p-5 space-y-4">
                  <div className="hidden lg:block space-y-4">
                    <GuideCardHeader guide={guide} tours={tours} languages={languages} primaryRegion={primaryRegion} tDetail={tDetail} />
                  </div>

                  <div className="lg:border-t lg:border-neutral-100 lg:pt-4 space-y-2">
                    <a
                      href={getWhatsAppLink(tDetail('whatsappMessage', { name: guide.name }))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-white font-semibold text-sm transition-all"
                      style={{ backgroundColor: ACCENT_GREEN }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {tDetail('askAboutTouring', { name: guide.name })}
                    </a>

                    <a
                      href="#guide-tours"
                      className="w-full inline-flex items-center justify-center h-11 px-4 rounded-xl border-2 font-semibold text-sm transition-all"
                      style={{ borderColor: ACCENT_GREEN, color: ACCENT_GREEN }}
                    >
                      {tDetail('bookToursCta')}
                    </a>
                  </div>

                  {guide.cancellationNote && (
                    <p className="text-xs text-neutral-500 text-center">{guide.cancellationNote}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
