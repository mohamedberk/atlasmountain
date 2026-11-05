'use client'

import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import { StarRating } from '@/components/ui/star-rating'
import { GuideImageCarousel } from './guide-image-carousel'
import { getOptimizedImageUrl } from '@/lib/image-utils'
import type { Guide } from '@/payload-types'

const ACCENT_GREEN = '#ff2828'

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: index * 0.06,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  }),
}

function getGuideImages(guide: Guide): string[] {
  const images = [getOptimizedImageUrl(guide.avatar, 'card')]
  guide.gallery?.forEach((item) => {
    const url = getOptimizedImageUrl(item.media, 'card')
    if (url && !images.includes(url)) images.push(url)
  })
  return images
}

interface GuideCardProps {
  guide: Guide
  index?: number
}

export function GuideCard({ guide, index = 0 }: GuideCardProps) {
  const tCommon = useTranslations('common')
  const tPage = useTranslations('guidesPage')

  const languages = (guide.languagesSpoken || []).map((l) => l.language)

  return (
    <motion.div variants={cardVariants} custom={index} className="group">
      <motion.div
        className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-100 h-full flex flex-col shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
        whileHover={{ y: -6, boxShadow: '0 6px 14px -10px rgba(0, 0, 0, 0.04)' }}
        transition={{ duration: 0.3 }}
      >
        {/* Image */}
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <GuideImageCarousel
            images={getGuideImages(guide)}
            alt={guide.name}
            variant="card"
            priority={index < 6}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Licensed Badge */}
          {guide.isOfficiallyLicensed && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full z-10">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
              <span className="text-xs font-medium text-neutral-700">{tPage('licensedBadge')}</span>
            </div>
          )}

          {/* Featured Badge */}
          {guide.isFeatured && (
            <div
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold text-white z-10"
              style={{ backgroundColor: ACCENT_GREEN }}
            >
              {tCommon('featured')}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-grow">
          {/* Star Rating — only when there are real reviews */}
          {Boolean(guide.totalReviews) && (
            <div className="flex items-center gap-1.5 mb-2">
              <StarRating rating={guide.overallRating || 0} size="sm" />
              <span className="text-xs text-neutral-500">({guide.totalReviews})</span>
            </div>
          )}

          {/* Name */}
          <NavLink href={`/guides/${guide.slug}`}>
            <h3 className="font-helvetica text-lg sm:text-xl font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-[#ff2828] transition-colors duration-300">
              {guide.name}
            </h3>
          </NavLink>

          {/* Tagline */}
          {guide.tagline && (
            <p className="text-sm text-neutral-600 mb-4 line-clamp-2 flex-grow">{guide.tagline}</p>
          )}

          {/* Languages and CTA */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
            {languages.length > 0 ? (
              <div className="min-w-0">
                <span className="text-xs text-neutral-500 truncate block">{tPage('speaksLabel')} {languages.slice(0, 3).join(', ')}</span>
              </div>
            ) : <div />}

            <NavLink
              href={`/guides/${guide.slug}`}
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl border-2 text-sm font-semibold transition-all duration-300 flex-shrink-0 hover:bg-opacity-10"
              style={{ borderColor: ACCENT_GREEN, color: ACCENT_GREEN }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${ACCENT_GREEN}10`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {tPage('moreAboutMe')}
            </NavLink>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
