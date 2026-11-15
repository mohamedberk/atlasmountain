'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, Users, ChevronRight, Check, Star, Search, X } from 'lucide-react'
import { NavLink } from '@/components/ui/nav-link'
import type { Category, Activity, Media, Location } from '@/payload-types'
import { getResponsiveSizes } from '@/lib/image-utils'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const ACCENT_GREEN = '#ff2828'
const STAR_COLOR = '#F59E0B'

// Helper function to extract plain text from Payload richText (Lexical format)
function extractPlainText(richText: any): string {
  if (!richText) return ''

  // If it's already a string, return it
  if (typeof richText === 'string') return richText

  // Handle Lexical format
  if (richText.root?.children) {
    const extractFromNodes = (nodes: any[]): string => {
      return nodes.map((node: any) => {
        if (node.type === 'text') return node.text || ''
        if (node.children) return extractFromNodes(node.children)
        return ''
      }).join(' ')
    }
    return extractFromNodes(richText.root.children).trim()
  }

  // Handle Slate format (array of blocks)
  if (Array.isArray(richText)) {
    return richText.map((block: any) => {
      if (block.children) {
        return block.children.map((child: any) => child.text || '').join('')
      }
      return ''
    }).join(' ').trim()
  }

  return ''
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: index * 0.08,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
}

// Helper function to get image URL
function getImageUrl(image: string | number | Media | null | undefined): string {
  if (!image) return '/placeholder-activity.jpg'
  if (typeof image === 'string') return image
  if (typeof image === 'number') return '/placeholder-activity.jpg'
  return image.externalUrl || image.url || '/placeholder-activity.jpg'
}

function getLocationName(location: string | number | Location | null | undefined, defaultLocation: string): string {
  if (!location) return defaultLocation
  if (typeof location === 'string') return location
  if (typeof location === 'number') return defaultLocation
  return location.name || defaultLocation
}

// Helper to get price from activity
function getActivityPrice(activity: Activity): number | null {
  if (activity.pricingType === 'tiered' && activity.tieredPricing?.tiers && activity.tieredPricing.tiers.length > 0) {
    // Get the LOWEST price from all tiers
    const lowestPrice = Math.min(...activity.tieredPricing.tiers.map(tier => tier.pricePerPerson || 0))
    return lowestPrice
  }
  if (activity.pricingType === 'fixed' && activity.privatePricing?.basePrice) {
    return activity.privatePricing.basePrice
  }
  if (activity.pricingType === 'custom_note') {
    return null
  }
  return null
}

interface Props {
  category: Category
  activities: Activity[]
  locale?: string
  /** Maps activity id -> lowercased title text across every locale, so the search box can match a query typed in a different language than the page is currently showing. */
  searchIndex?: Record<string, string>
}

export function CategoryPageClient({ category, activities, locale, searchIndex = {} }: Props) {
  const categoryImage = getImageUrl(category.image)
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')
  const tCategory = useTranslations('categoryPage')
  const tActivitiesPage = useTranslations('activitiesPage')

  const [searchQuery, setSearchQuery] = useState('')

  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities
    const query = searchQuery.toLowerCase()
    return activities.filter((activity) => {
      const title = activity.title?.toLowerCase() || ''
      const location = getLocationName(activity.location, tCommon('morocco')).toLowerCase()
      const allLocaleTitles = searchIndex[String(activity.id)] || ''
      return title.includes(query) || location.includes(query) || allLocaleTitles.includes(query)
    })
  }, [activities, searchQuery, searchIndex, tCommon])

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[460px] sm:min-h-[480px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={categoryImage}
            alt={category.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>

        {/* Decorative gradient orbs */}
        <motion.div
          className="absolute top-20 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${ACCENT_GREEN}15` }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Content */}
        <div className="relative flex items-center justify-center pt-28 pb-10 sm:pt-32 sm:pb-14">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Title */}
              <motion.h1
                variants={fadeInUp}
                custom={0.2}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold mb-3 sm:mb-4 px-2"
              >
                {category.name}
              </motion.h1>

              {/* Description */}
              {category.description && (
                <motion.p
                  variants={fadeInUp}
                  custom={0.3}
                  className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto px-4 whitespace-pre-line"
                >
                  {category.description}
                </motion.p>
              )}

              {/* Search Bar */}
              <motion.div
                variants={fadeInUp}
                custom={0.4}
                className="max-w-xl mx-auto mt-5 sm:mt-8 px-4"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder={tActivitiesPage('searchActivities')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 md:h-12 pl-11 pr-11 rounded-xl border border-white/20 bg-white/95 backdrop-blur-sm text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#ff2828] focus:ring-2 focus:ring-[#ff2828]/20 transition-all shadow-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeInUp}
                custom={0.5}
                className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-4 sm:mt-6 px-4"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 text-white">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill={STAR_COLOR}
                        color={STAR_COLOR}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-medium">5.0</span>
                </div>
                <div className="hidden sm:block w-px h-5 bg-white/30" />
                <div className="flex items-center gap-1 sm:gap-2 text-white">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{tCommon('morocco')}</span>
                </div>
                <div className="hidden sm:block w-px h-5 bg-white/30" />
                <div className="flex items-center gap-1 sm:gap-2 text-white">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{filteredActivities.length} {tCommon('experiences')}</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Activities Grid Section */}
      <section className="py-10 sm:py-16 md:py-24 bg-[#fafaf9] relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <motion.div
          className="absolute top-20 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${ACCENT_GREEN}08` }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Activities Grid */}
          {filteredActivities.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
            >
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  variants={cardVariants}
                  custom={index}
                  className="group"
                >
                  <motion.div
                    className="bg-white rounded-3xl overflow-hidden border border-neutral-100 h-full flex flex-col shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
                    whileHover={{
                      y: -8,
                      boxShadow: '0 6px 14px -10px rgba(0, 0, 0, 0.04)',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Image - Clickable to details */}
                    <NavLink href={`/activities/${activity.slug}`} className="block">
                      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden cursor-pointer">
                        <motion.div
                          className="absolute inset-0"
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Image
                            src={getImageUrl(activity.featuredImage)}
                            alt={activity.title}
                            fill
                            sizes={getResponsiveSizes('card')}
                            className="object-cover"
                            priority={index < 3}
                          />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                        {/* Price Badge */}
                        {getActivityPrice(activity) && (
                          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm">
                            <span className="text-sm font-bold" style={{ color: ACCENT_GREEN }}>
                              {tCommon('from')} €{getActivityPrice(activity)}
                            </span>
                          </div>
                        )}
                      </div>
                    </NavLink>

                      {/* Content */}
                      <div className="p-4 sm:p-5 flex flex-col flex-grow">
                        {/* Duration & Location Tags */}
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                          >
                            <Clock className="w-3 h-3" style={{ color: ACCENT_GREEN }} />
                            <span className="text-xs font-medium" style={{ color: ACCENT_GREEN }}>
                              {activity.duration || tCommon('oneDay')}
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                          >
                            <MapPin className="w-3 h-3" style={{ color: ACCENT_GREEN }} />
                            <span className="text-xs font-medium" style={{ color: ACCENT_GREEN }}>{tCommon('morocco')}</span>
                          </div>
                        </div>

                        {/* Activity Title */}
                        <h3 className="font-display text-lg font-bold text-neutral-900 mb-2 group-hover:text-red-600 transition-colors duration-300 line-clamp-1">
                          {activity.title}
                        </h3>

                        {/* Description from richText - 2 lines */}
                        <p className="text-sm text-neutral-500 mb-3 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                          {extractPlainText(activity.description) || tCategory('activityFallbackDescription', { title: activity.title })}
                        </p>

                        {/* Included Items - Show first 3 (fixed height for consistency) */}
                        <div className="mb-4 space-y-1 min-h-[4.5rem]">
                          {activity.included && activity.included.length > 0 ? (
                            activity.included.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: `${ACCENT_GREEN}20` }}
                                >
                                  <Check className="w-2.5 h-2.5" style={{ color: ACCENT_GREEN }} />
                                </div>
                                <span className="text-xs text-neutral-600 line-clamp-1">
                                  {extractPlainText(item.item)}
                                </span>
                              </div>
                            ))
                          ) : (
                            /* Placeholder items when no included items */
                            <>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${ACCENT_GREEN}20` }}>
                                  <Check className="w-2.5 h-2.5" style={{ color: ACCENT_GREEN }} />
                                </div>
                                <span className="text-xs text-neutral-600">{tCategory('professionalGuide')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${ACCENT_GREEN}20` }}>
                                  <Check className="w-2.5 h-2.5" style={{ color: ACCENT_GREEN }} />
                                </div>
                                <span className="text-xs text-neutral-600">{tCategory('hotelPickup')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${ACCENT_GREEN}20` }}>
                                  <Check className="w-2.5 h-2.5" style={{ color: ACCENT_GREEN }} />
                                </div>
                                <span className="text-xs text-neutral-600">{tCategory('transportIncluded')}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Spacer to push buttons to bottom */}
                        <div className="flex-grow min-h-[8px]" />

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {/* View Details Button */}
                          <NavLink
                            href={`/activities/${activity.slug}`}
                            className="flex-1 inline-flex items-center justify-center h-10 rounded-xl border-2 text-sm font-semibold transition-all duration-300 hover:bg-red-50"
                            style={{
                              borderColor: ACCENT_GREEN,
                              color: ACCENT_GREEN,
                            }}
                          >
                            {tCommon('viewDetails')}
                          </NavLink>
                          {/* Book Now Button */}
                          <NavLink
                            href={`/checkout/${activity.slug}`}
                            className="flex-1 inline-flex items-center justify-center h-10 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:opacity-90"
                            style={{ backgroundColor: ACCENT_GREEN }}
                          >
                            {tCommon('bookNow')}
                          </NavLink>
                        </div>
                      </div>
                    </motion.div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
                {searchQuery ? (
                  <Search className="w-10 h-10 text-neutral-400" />
                ) : (
                  <MapPin className="w-10 h-10 text-neutral-400" />
                )}
              </div>
              <h3 className="font-display text-2xl text-neutral-900 mb-3">
                {searchQuery ? tActivitiesPage('noActivitiesFound') : tCategory('noActivitiesYet')}
              </h3>
              <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                {searchQuery ? tActivitiesPage('tryAdjustingFilters') : tCategory('noActivitiesMessage')}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center justify-center h-12 px-8 rounded-lg text-white font-semibold transition-all duration-300 hover:opacity-90"
                  style={{ backgroundColor: ACCENT_GREEN }}
                >
                  {tCommon('clearFilters')}
                </button>
              ) : (
                <NavLink
                  href="/"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-lg text-white font-semibold transition-all duration-300 hover:opacity-90"
                  style={{ backgroundColor: ACCENT_GREEN }}
                >
                  {tCategory('exploreOtherCategories')}
                </NavLink>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
