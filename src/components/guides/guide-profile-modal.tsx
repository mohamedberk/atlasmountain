'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ShieldCheck, Award, Zap, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { StarRating } from '@/components/ui/star-rating'
import { Badge } from '@/components/ui/badge'
import { RichText } from '@/components/rich-text'
import { GuideImageCarousel } from './guide-image-carousel'
import { getOptimizedImageUrl } from '@/lib/image-utils'
import type { Guide } from '@/payload-types'

const ACCENT_GREEN = '#ff2828'

function getGuideImages(guide: Guide): string[] {
  const images = [getOptimizedImageUrl(guide.avatar, 'hero')]
  guide.gallery?.forEach((item) => {
    const url = getOptimizedImageUrl(item.media, 'hero')
    if (url && !images.includes(url)) images.push(url)
  })
  return images
}

interface GuideProfileModalProps {
  guide: Guide
  isOpen: boolean
  isSelected: boolean
  onClose: () => void
  onChoose: (guide: Guide) => void
}

export function GuideProfileModal({ guide, isOpen, isSelected, onClose, onChoose }: GuideProfileModalProps) {
  const tDetail = useTranslations('guideDetail')
  const tActivity = useTranslations('activityDetail')

  const languages = (guide.languagesSpoken || []).map((l) => l.language)

  // Lock background scroll while the modal is open
  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl my-auto"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center transition-colors z-20 shadow-sm"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-neutral-600" />
            </button>

            <div className="relative h-52 sm:h-60 rounded-t-2xl overflow-hidden">
              <GuideImageCarousel images={getGuideImages(guide)} alt={guide.name} variant="detail" className="absolute inset-0" />
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-5">
                <h2 className="font-display text-xl font-bold text-neutral-900">{guide.name}</h2>
                {guide.tagline && <p className="text-sm text-neutral-600 mt-0.5">{guide.tagline}</p>}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {Boolean(guide.totalReviews) && <StarRating rating={guide.overallRating || 0} reviewCount={guide.totalReviews || undefined} size="sm" />}
                  {guide.isOfficiallyLicensed && (
                    <Badge variant="solid" icon={<ShieldCheck className="w-3.5 h-3.5" />}>{tDetail('licensedBadge')}</Badge>
                  )}
                  {guide.isVerifiedLocal && <Badge variant="soft" icon={<Award className="w-3.5 h-3.5" />}>{tDetail('verifiedBadge')}</Badge>}
                  {guide.respondsQuickly && <Badge variant="soft" icon={<Zap className="w-3.5 h-3.5" />}>{tDetail('respondsQuicklyBadge')}</Badge>}
                </div>
              </div>

              {languages.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {languages.map((lang) => (
                    <Badge key={lang} variant="soft" className="!px-2.5 !py-1">{lang}</Badge>
                  ))}
                </div>
              )}

              {guide.bio && (
                <div className="text-sm text-neutral-700 [&_p]:mb-3 mb-5">
                  <RichText content={guide.bio} />
                </div>
              )}

              <button
                type="button"
                onClick={() => onChoose(guide)}
                disabled={isSelected}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: ACCENT_GREEN }}
              >
                {isSelected ? (
                  <>
                    <Check className="w-4 h-4" />
                    {tActivity('guideSelected')}
                  </>
                ) : (
                  tActivity('chooseThisGuideCta')
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
