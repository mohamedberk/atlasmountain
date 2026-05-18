'use client'

import { memo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Gift, Plus, Clock, MapPin, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { UpsellActivity } from './checkout-types'

interface UpsellStepProps {
  activities: UpsellActivity[]
  isLoading: boolean
  onSkip: () => void
  onOpenModal: (activity: UpsellActivity) => void
  onQuickAdd: (activity: UpsellActivity) => void
}

export const UpsellStep = memo(function UpsellStep({
  activities,
  isLoading,
  onSkip,
  onOpenModal,
  onQuickAdd,
}: UpsellStepProps) {
  const t = useTranslations('checkout')
  const tUpsell = useTranslations('upsellStep')

  return (
    <motion.div
      key="upsell"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h1 className="text-xl sm:text-2xl font-display font-bold text-neutral-900">
            {tUpsell('completeYourExperience')}
          </h1>
        </div>
        <button
          onClick={onSkip}
          className="text-sm text-neutral-500 hover:text-neutral-700 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          {t('crossSell.skip')} →
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {activities.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-medium text-neutral-900 mb-1 sm:mb-2">
                {tUpsell('addMoreExperiences')}
              </h2>
              <p className="text-sm text-neutral-600 mb-3 sm:mb-4">
                {tUpsell('clickToSeeDetails')}
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {activities.map((activity) => (
                  <UpsellCard
                    key={activity.id}
                    activity={activity}
                    onOpenModal={onOpenModal}
                    onQuickAdd={onQuickAdd}
                  />
                ))}
              </div>
            </div>
          )}

          {activities.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-medium text-neutral-900 mb-2">
                {tUpsell('youreAllSet')}
              </h2>
              <p className="text-neutral-600">
                {tUpsell('greatSelection')}
              </p>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
})

interface UpsellCardProps {
  activity: UpsellActivity
  onOpenModal: (activity: UpsellActivity) => void
  onQuickAdd: (activity: UpsellActivity) => void
}

const UpsellCard = memo(function UpsellCard({ activity, onOpenModal, onQuickAdd }: UpsellCardProps) {
  const tUpsell = useTranslations('upsellStep')

  return (
    <div
      className="p-2.5 sm:p-3 rounded-xl border-2 border-neutral-200 hover:border-primary/30 transition-all cursor-pointer group"
      onClick={() => onOpenModal(activity)}
    >
      <div className="w-full aspect-[4/3] rounded-lg bg-neutral-100 mb-2.5 sm:mb-3 overflow-hidden relative">
        <Image
          src={activity.image}
          alt={activity.title}
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {activity.location && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] sm:text-xs text-neutral-700 flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {activity.location}
          </div>
        )}
      </div>
      <h3 className="font-medium text-neutral-900 text-xs sm:text-sm line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] group-hover:text-primary transition-colors">
        {activity.title}
      </h3>
      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-neutral-500 mb-2">
        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        <span>{activity.duration}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-bold text-secondary text-sm sm:text-base">€{activity.price}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onQuickAdd(activity)
          }}
          className="text-[10px] sm:text-xs bg-secondary text-white px-2.5 sm:px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 hover:bg-secondary/90 transition-colors"
        >
          <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {tUpsell('add')}
        </button>
      </div>
    </div>
  )
})
