'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { StarRating } from '@/components/ui/star-rating'
import { GuideImageCarousel } from './guide-image-carousel'
import { getOptimizedImageUrl } from '@/lib/image-utils'
import type { Guide } from '@/payload-types'

const ACCENT_GREEN = '#ff2828'

function getGuideImages(guide: Guide): string[] {
  const images = [getOptimizedImageUrl(guide.avatar, 'card')]
  guide.gallery?.forEach((item) => {
    const url = getOptimizedImageUrl(item.media, 'card')
    if (url && !images.includes(url)) images.push(url)
  })
  return images
}

interface GuideOptionCardProps {
  guide: Guide
  isSelected: boolean
  onOpenProfile: () => void
}

export function GuideOptionCard({ guide, isSelected, onOpenProfile }: GuideOptionCardProps) {
  const tPage = useTranslations('guidesPage')
  const tActivity = useTranslations('activityDetail')

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onOpenProfile}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenProfile()
        }
      }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group text-left cursor-pointer bg-white rounded-2xl overflow-hidden border h-full flex flex-col shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
      style={{ borderColor: isSelected ? ACCENT_GREEN : 'rgb(243 244 246)', borderWidth: isSelected ? 2 : 1 }}
    >
      <div className="relative h-40 overflow-hidden">
        <GuideImageCarousel images={getGuideImages(guide)} alt={guide.name} variant="card" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {guide.isOfficiallyLicensed && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full z-10">
            <ShieldCheck className="w-3 h-3 text-neutral-600" />
            <span className="text-[11px] font-medium text-neutral-700">{tPage('licensedBadge')}</span>
          </div>
        )}

        {isSelected && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white z-10"
            style={{ backgroundColor: ACCENT_GREEN }}
          >
            <Check className="w-3 h-3" />
            {tActivity('guideSelected')}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        {Boolean(guide.totalReviews) && (
          <div className="mb-1.5">
            <StarRating rating={guide.overallRating || 0} reviewCount={guide.totalReviews || undefined} size="sm" />
          </div>
        )}
        <h3 className="font-semibold text-sm text-neutral-900">{guide.name}</h3>
        {guide.tagline && <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5 flex-grow">{guide.tagline}</p>}

        <span
          className="mt-3 inline-flex w-full items-center justify-center h-9 rounded-lg border-2 text-xs font-semibold transition-colors"
          style={{ borderColor: ACCENT_GREEN, color: ACCENT_GREEN }}
        >
          {tActivity('viewGuideProfileCta')}
        </span>
      </div>
    </motion.div>
  )
}
