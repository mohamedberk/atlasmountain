'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Award, MessageCircle, ShieldCheck, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import { StarRating } from '@/components/ui/star-rating'
import { Badge } from '@/components/ui/badge'
import { RichText } from '@/components/rich-text'
import { ReviewsList } from '@/components/ui/reviews-list'
import { FAQSection } from '@/components/sections/faq-section'
import { GuideImageCarousel } from '@/components/guides/guide-image-carousel'
import { GuideToursTabs } from '@/components/guides/guide-tours-tabs'
import { GuideInquiryForm } from '@/components/guides/guide-inquiry-form'
import { useSiteSettings } from '@/context/SiteSettingsContext'
import { getOptimizedImageUrl } from '@/lib/image-utils'
import type { Guide, GuideReview, Activity } from '@/payload-types'

const ACCENT_GREEN = '#ff2828'

function getGuideImages(guide: Guide): string[] {
  const images = [getOptimizedImageUrl(guide.avatar, 'hero')]
  guide.gallery?.forEach((item) => {
    const url = getOptimizedImageUrl(item.media, 'hero')
    if (url && !images.includes(url)) images.push(url)
  })
  return images
}

interface Props {
  guide: Guide
  reviews: GuideReview[]
}

export function GuideDetailClient({ guide, reviews }: Props) {
  const tNav = useTranslations('nav')
  const tDetail = useTranslations('guideDetail')
  const { getWhatsAppLink } = useSiteSettings()

  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [prefilledMessage, setPrefilledMessage] = useState('')

  const tours = (guide.tours || []).filter((t): t is Activity => typeof t === 'object')
  const languages = (guide.languagesSpoken || []).map((l) => l.language)

  const handleSelectTour = (tour: Activity) => {
    setPrefilledMessage(tDetail('selectTourPrefill', { tour: tour.title, name: guide.name }))
    setShowInquiryForm(true)
    document.getElementById('guide-contact-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const miniFaqItems = [
    { question: tDetail('miniFaqLanguagesQuestion', { name: guide.name }), answer: tDetail('miniFaqLanguagesAnswer', { name: guide.name, languages: languages.join(', ') }) },
    ...(guide.isOfficiallyLicensed
      ? [{ question: tDetail('miniFaqLicensedQuestion', { name: guide.name }), answer: tDetail('miniFaqLicensedAnswer', { name: guide.name, license: guide.licenseNumber || '' }) }]
      : []),
    { question: tDetail('miniFaqBookingQuestion', { name: guide.name }), answer: tDetail('miniFaqBookingAnswer', { name: guide.name }) },
    { question: tDetail('miniFaqContactQuestion', { name: guide.name }), answer: tDetail('miniFaqContactAnswer', { name: guide.name }) },
  ]

  return (
    <div className="min-h-screen bg-white">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 lg:pt-8 pb-16">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-neutral-900 mb-2">{guide.name}</h1>
              {guide.tagline && <p className="text-neutral-600 mb-3">{guide.tagline}</p>}
              <div className="flex items-center gap-4 flex-wrap">
                {Boolean(guide.totalReviews) && (
                  <StarRating rating={guide.overallRating || 0} reviewCount={guide.totalReviews || undefined} />
                )}
                {guide.isOfficiallyLicensed && (
                  <Badge variant="solid" icon={<ShieldCheck className="w-3.5 h-3.5" />}>{tDetail('licensedBadge')}</Badge>
                )}
                {guide.isVerifiedLocal && <Badge variant="soft" icon={<Award className="w-3.5 h-3.5" />}>{tDetail('verifiedBadge')}</Badge>}
                {guide.respondsQuickly && <Badge variant="soft" icon={<Zap className="w-3.5 h-3.5" />}>{tDetail('respondsQuicklyBadge')}</Badge>}
              </div>
            </div>

            {/* Image Carousel */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
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
              <GuideToursTabs tours={tours} guideName={guide.name} onSelectTour={handleSelectTour} />
            </div>

            {/* Reviews */}
            <div>
              <h2 className="font-display text-xl font-bold text-neutral-900 mb-3">{tDetail('reviewsHeading', { name: guide.name })}</h2>
              <ReviewsList reviews={reviews} guideName={guide.name} />
            </div>

            {/* Mini FAQ */}
            <FAQSection
              faqData={{
                title: tDetail('faqTitle'),
                titleHighlight: guide.name,
                description: tDetail('faqDescription', { name: guide.name }),
                items: miniFaqItems,
              }}
            />
          </div>

          {/* Right Column - Sticky Guide Card */}
          <div>
            <div id="guide-contact-card" className="lg:sticky lg:top-24 scroll-mt-24">
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="h-2" style={{ backgroundColor: ACCENT_GREEN }} />
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                      <Image src={getOptimizedImageUrl(guide.avatar, 'thumbnail')} alt={guide.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">{guide.name}</div>
                      {guide.hostingSince && (
                        <div className="text-xs text-neutral-500">{tDetail('hostingSince', { year: guide.hostingSince })}</div>
                      )}
                    </div>
                  </div>

                  {tours.length > 0 && (
                    <div className="text-sm text-neutral-600">{tDetail('privateTourCount', { count: tours.length })}</div>
                  )}

                  {languages.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {languages.map((lang) => (
                        <Badge key={lang} variant="soft" className="!px-2.5 !py-1">{lang}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-neutral-100 pt-4 space-y-2">
                    {showInquiryForm ? (
                      <GuideInquiryForm guideName={guide.name} guideSlug={guide.slug} guideId={guide.id} initialMessage={prefilledMessage} />
                    ) : (
                      <button
                        onClick={() => setShowInquiryForm(true)}
                        className="w-full inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-white font-semibold text-sm transition-all"
                        style={{ backgroundColor: ACCENT_GREEN }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        {tDetail('askAboutTouring', { name: guide.name })}
                      </button>
                    )}

                    <a
                      href="#guide-tours"
                      className="w-full inline-flex items-center justify-center h-11 px-4 rounded-xl border-2 font-semibold text-sm transition-all"
                      style={{ borderColor: ACCENT_GREEN, color: ACCENT_GREEN }}
                    >
                      {tDetail('bookToursCta')}
                    </a>

                    <a
                      href={getWhatsAppLink(tDetail('whatsappMessage', { name: guide.name }))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-sm font-medium text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/5 transition-all"
                    >
                      {tDetail('whatsappCta')}
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
