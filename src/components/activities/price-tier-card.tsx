'use client'

import { motion } from 'framer-motion'
import { Check, Gem, TrendingUp, Star, Crown, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface PriceTierCardProps {
  tier: 'budget' | 'mid-range' | 'premium' | 'luxury'
  title: string
  priceRange: string
  description: string
  activityCount: number
  highlights?: string[]
  isPopular?: boolean
  onClick?: () => void
  isActive?: boolean
}

const tierConfigs = {
  budget: {
    gradient: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    icon: TrendingUp,
    iconBg: 'bg-emerald-100',
    badgeKey: 'bestValue' as const,
    badgeBg: 'bg-emerald-500',
  },
  'mid-range': {
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: Star,
    iconBg: 'bg-blue-100',
    badgeKey: 'mostPopular' as const,
    badgeBg: 'bg-blue-500',
  },
  premium: {
    gradient: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    icon: Gem,
    iconBg: 'bg-amber-100',
    badgeKey: 'premiumPick' as const,
    badgeBg: 'bg-amber-500',
  },
  luxury: {
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    icon: Crown,
    iconBg: 'bg-purple-100',
    badgeKey: 'luxury' as const,
    badgeBg: 'bg-purple-500',
  },
}

export function PriceTierCard({
  tier,
  title,
  priceRange,
  description,
  activityCount,
  highlights = [],
  isPopular = false,
  onClick,
  isActive = false,
}: PriceTierCardProps) {
  const config = tierConfigs[tier]
  const IconComponent = config.icon
  const tTier = useTranslations('priceTierCard')

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full text-left transition-all duration-300 ${
        isActive ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-6 h-full`}
      >
        {/* Popular Badge */}
        {isPopular && (
          <div className={`absolute top-0 right-0 ${config.badgeBg} text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl`}>
            {tTier(config.badgeKey)}
          </div>
        )}

        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center mb-4`}>
          <IconComponent className={`w-6 h-6 ${config.textColor}`} />
        </div>

        {/* Title & Price Range */}
        <h3 className="text-xl font-display font-bold text-neutral-900 mb-1">
          {title}
        </h3>
        <p className={`text-lg font-bold ${config.textColor} mb-2`}>
          {priceRange}
        </p>

        {/* Description */}
        <p className="text-sm text-neutral-600 mb-4">
          {description}
        </p>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="space-y-2 mb-4">
            {highlights.slice(0, 3).map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Check className={`w-4 h-4 ${config.textColor} flex-shrink-0 mt-0.5`} />
                <span className="text-xs text-neutral-600">{highlight}</span>
              </div>
            ))}
          </div>
        )}

        {/* Activity Count */}
        <div className="pt-4 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">
              {activityCount} {activityCount === 1 ? tTier('activity') : tTier('activities')}
            </span>
            <span className={`text-sm font-semibold ${config.textColor}`}>
              {tTier('explore')} →
            </span>
          </div>
        </div>

        {/* Decorative gradient bar at bottom */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />
      </div>
    </motion.button>
  )
}

// Best Value Badge Component
interface BestValueBadgeProps {
  savings: number
  className?: string
}

export function BestValueBadge({ savings, className = '' }: BestValueBadgeProps) {
  const tTier = useTranslations('priceTierCard')
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-sm ${className}`}>
      <TrendingUp className="w-3.5 h-3.5" />
      <span className="text-xs font-bold">{tTier('save')} €{savings}</span>
    </div>
  )
}

// Flash Deal Badge
interface FlashDealBadgeProps {
  discount: number
  expiresIn?: string
  className?: string
}

export function FlashDealBadge({ discount, expiresIn, className = '' }: FlashDealBadgeProps) {
  const tTier = useTranslations('priceTierCard')
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow-sm animate-pulse ${className}`}>
      <Zap className="w-3.5 h-3.5" />
      <span className="text-xs font-bold">{discount}% {tTier('off')}</span>
      {expiresIn && (
        <>
          <span className="w-px h-3 bg-white/30" />
          <span className="text-xs opacity-90">{expiresIn}</span>
        </>
      )}
    </div>
  )
}
