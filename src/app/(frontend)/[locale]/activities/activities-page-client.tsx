'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Clock, Star, Search, ChevronDown, X,
  Grid3X3, LayoutList
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import { useCart, ActivityCartItem } from '@/context/CartContext'
import Image from 'next/image'
import { getOptimizedImageUrl, getResponsiveSizes } from '@/lib/image-utils'
import type { Activity, Media, Category, Location } from '@/payload-types'

const ACCENT_GREEN = '#ff2828'
const STAR_COLOR = '#F59E0B'

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
      staggerChildren: 0.08,
      delayChildren: 0.1,
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
      delay: index * 0.06,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
}

// Helper functions
function getImageUrl(image: string | number | Media | null | undefined): string {
  return getOptimizedImageUrl(image, 'card')
}

function getLocationName(location: string | number | Location | null | undefined): string {
  if (!location) return 'Morocco'
  if (typeof location === 'string') return location
  if (typeof location === 'number') return 'Morocco'
  return location.name || 'Morocco'
}

function getCategoryInfo(category: string | number | Category | null | undefined): { name: string; slug: string } {
  if (!category) return { name: 'Experience', slug: 'all' }
  if (typeof category === 'string') return { name: category, slug: 'all' }
  if (typeof category === 'number') return { name: 'Experience', slug: 'all' }
  return { name: category.name || 'Experience', slug: category.slug || 'all' }
}

function getPrice(activity: Activity): number {
  if (activity.pricingType === 'tiered' && activity.tieredPricing?.tiers && activity.tieredPricing.tiers.length > 0) {
    // Get the LOWEST price from all tiers
    const lowestPrice = Math.min(...activity.tieredPricing.tiers.map(tier => tier.pricePerPerson || 0))
    return lowestPrice
  }
  if (activity.pricingType === 'fixed' && activity.privatePricing?.basePrice) {
    return activity.privatePricing.basePrice
  }
  return 0
}

function getChildPrice(activity: Activity): number {
  if (activity.pricingType === 'tiered' && activity.tieredPricing?.childPrice) {
    return activity.tieredPricing.childPrice
  }
  return 0
}

interface Props {
  activities: Activity[]
  categories: Category[]
}

type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating'
type ViewMode = 'grid' | 'list'

export function ActivitiesPageClient({ activities, categories }: Props) {
  const t = useTranslations('activities')
  const tCommon = useTranslations('common')
  const tPage = useTranslations('activitiesPage')
  const tNav = useTranslations('nav')

  const { addItem } = useCart()
  const router = useRouter()
  const locale = useLocale()
  const searchParams = useSearchParams()

  // Get initial category from URL
  const initialCategory = searchParams.get('category') || 'all'

  // Filter states
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Update active category when URL params change
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || 'all'
    setActiveCategory(categoryFromUrl)
  }, [searchParams])

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let result = [...activities]

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter((activity) => {
        const categoryInfo = getCategoryInfo(activity.category)
        return categoryInfo.slug === activeCategory
      })
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((activity) => {
        const title = activity.title?.toLowerCase() || ''
        const location = getLocationName(activity.location)?.toLowerCase() || ''
        return title.includes(query) || location.includes(query)
      })
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return getPrice(a) - getPrice(b)
        case 'price-desc':
          return getPrice(b) - getPrice(a)
        case 'rating':
        case 'popular':
        default:
          // Sort by featured first, then by displayOrder
          if (a.isFeatured && !b.isFeatured) return -1
          if (!a.isFeatured && b.isFeatured) return 1
          return (a.displayOrder || 99) - (b.displayOrder || 99)
      }
    })

    return result
  }, [activities, activeCategory, searchQuery, sortBy])

  const handleAddToCart = (activity: Activity) => {
    const cartItem: ActivityCartItem = {
      type: 'activity',
      id: String(activity.id),
      slug: activity.slug,
      title: activity.title,
      image: getImageUrl(activity.featuredImage),
      price: getPrice(activity),
      childPrice: getChildPrice(activity),
      duration: activity.duration || '',
      adults: 1,
      children: 0,
      date: '',
      pricingType: activity.pricingType === 'fixed' ? 'private' : 'per_person',
    }
    addItem(cartItem)
    router.push(`/${locale}/checkout`)
  }

  // Limited categories for cleaner UI (show max 6)
  const displayCategories = [
    { id: 'all', name: tCommon('all'), slug: 'all' },
    ...categories.slice(0, 5).map((cat) => ({ id: String(cat.id), name: cat.name, slug: cat.slug })),
  ]

  const sortOptions = [
    { value: 'popular', label: tPage('popular') },
    { value: 'price-asc', label: tPage('priceLowToHigh') },
    { value: 'price-desc', label: tPage('priceHighToLow') },
    { value: 'rating', label: tPage('topRated') },
  ]

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Hero Header Section */}
      <section className="relative pt-20 pb-6 md:pt-24 md:pb-8 bg-gradient-to-b from-white to-[#fafaf9]">
        {/* Decorative gradient orbs */}
        <motion.div
          className="absolute top-10 -left-32 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${ACCENT_GREEN}08` }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 -right-32 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${ACCENT_GREEN}06` }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-sm mb-3"
          >
            <NavLink href="/" className="text-neutral-500 hover:text-primary transition-colors">{tNav('home')}</NavLink>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900 font-medium">{tNav('activities')}</span>
          </motion.nav>

          {/* Header Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center mb-4"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <motion.div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-2"
                style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: ACCENT_GREEN }}>
                  {tPage('discoverMorocco')}
                </span>
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
              </motion.div>
              <h1 className="font-display text-2xl md:text-3xl lg:text-4xl text-neutral-900 mb-2">
                {tPage('exploreOur')} <span style={{ color: ACCENT_GREEN }}>{tNav('activities')}</span>
              </h1>
              <p className="text-neutral-600 text-base max-w-2xl mx-auto">
                {tPage('uniqueExperiences', { count: filteredActivities.length })}
              </p>
            </motion.div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder={tPage('searchActivities')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-11 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#ff2828] focus:ring-2 focus:ring-[#ff2828]/20 transition-all shadow-sm"
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

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              {displayCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === category.slug
                      ? 'text-white shadow-sm'
                      : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                  }`}
                  style={activeCategory === category.slug ? { backgroundColor: ACCENT_GREEN } : {}}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center justify-center gap-3">
              {/* View Toggle */}
              <div className="hidden sm:flex items-center bg-white rounded-xl p-1 border border-neutral-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-700 hover:border-neutral-300 transition-all"
                >
                  <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showSortDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowSortDropdown(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl border border-neutral-200 shadow-md z-20 overflow-hidden"
                      >
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value as SortOption)
                              setShowSortDropdown(false)
                            }}
                            className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                              sortBy === option.value
                                ? 'bg-neutral-100 text-neutral-900 font-medium'
                                : 'text-neutral-600 hover:bg-neutral-50'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Activities Grid Section */}
      <section className="py-8 md:py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {viewMode === 'grid' ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
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
                    className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-100 h-full flex flex-col shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
                    whileHover={{
                      y: -6,
                      boxShadow: '0 6px 14px -10px rgba(0, 0, 0, 0.04)',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Image */}
                    <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
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
                          priority={index < 6}
                        />
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      {/* Duration Badge */}
                      {activity.duration && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full z-10">
                          <Clock className="w-3.5 h-3.5 text-neutral-600" />
                          <span className="text-xs font-medium text-neutral-700">{activity.duration}</span>
                        </div>
                      )}

                      {/* Featured Badge */}
                      {activity.isFeatured && (
                        <div
                          className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold text-white z-10"
                          style={{ backgroundColor: ACCENT_GREEN }}
                        >
                          {tCommon('featured')}
                        </div>
                      )}

                      {/* Location */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white z-10">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">{getLocationName(activity.location)}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 flex flex-col flex-grow">
                      {/* 5 Star Rating */}
                      <div className="flex items-center gap-0.5 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4"
                            fill={STAR_COLOR}
                            color={STAR_COLOR}
                          />
                        ))}
                      </div>

                      {/* Title */}
                      <NavLink href={`/activities/${activity.slug}`}>
                        <h3 className="font-display text-lg sm:text-xl font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-[#ff2828] transition-colors duration-300">
                          {activity.title}
                        </h3>
                      </NavLink>

                      {/* Short Description */}
                      {activity.shortDescription && (
                        <p className="text-sm text-neutral-600 mb-4 line-clamp-2 flex-grow">
                          {activity.shortDescription}
                        </p>
                      )}

                      {/* Price and CTA */}
                      <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                        {activity.pricingType !== 'custom_note' ? (
                          <div>
                            <span className="text-2xl font-bold" style={{ color: ACCENT_GREEN }}>
                              €{getPrice(activity)}
                            </span>
                            <span className="text-sm text-neutral-500 ml-1">{tCommon('perPersonShort')}</span>
                          </div>
                        ) : <div />}

                        <NavLink
                          href={`/activities/${activity.slug}`}
                          className="inline-flex items-center justify-center h-11 px-6 rounded-xl border-2 text-sm font-semibold transition-all duration-300 hover:bg-opacity-10"
                          style={{
                            borderColor: ACCENT_GREEN,
                            color: ACCENT_GREEN,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${ACCENT_GREEN}10`
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          {tCommon('viewDetails')}
                        </NavLink>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* List View */
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-4"
            >
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  variants={cardVariants}
                  custom={index}
                  className="group"
                >
                  <motion.div
                    className="bg-white rounded-2xl overflow-hidden border border-neutral-100 flex flex-col md:flex-row shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
                    whileHover={{
                      y: -4,
                      boxShadow: '0 6px 14px -10px rgba(0, 0, 0, 0.04)',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Image */}
                    <div className="relative w-full md:w-80 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                      <motion.div
                        className="absolute inset-0"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Image
                          src={getImageUrl(activity.featuredImage)}
                          alt={activity.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 320px"
                          className="object-cover"
                        />
                      </motion.div>
                      {activity.duration && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full z-10">
                          <Clock className="w-3.5 h-3.5 text-neutral-600" />
                          <span className="text-xs font-medium text-neutral-700">{activity.duration}</span>
                        </div>
                      )}
                      {activity.isFeatured && (
                        <div
                          className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold text-white z-10"
                          style={{ backgroundColor: ACCENT_GREEN }}
                        >
                          {tCommon('featured')}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 text-sm text-neutral-500 mb-2">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {getLocationName(activity.location)}
                        </div>
                        {activity.duration && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {activity.duration}
                          </div>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-0.5 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4"
                            fill={STAR_COLOR}
                            color={STAR_COLOR}
                          />
                        ))}
                      </div>

                      <NavLink href={`/activities/${activity.slug}`}>
                        <h3 className="font-display text-xl font-bold text-neutral-900 mb-2 group-hover:text-[#ff2828] transition-colors">
                          {activity.title}
                        </h3>
                      </NavLink>

                      {activity.shortDescription && (
                        <p className="text-neutral-600 text-sm mb-4 line-clamp-2 flex-grow">
                          {activity.shortDescription}
                        </p>
                      )}

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                        {activity.pricingType !== 'custom_note' ? (
                          <div>
                            <span className="text-2xl font-bold" style={{ color: ACCENT_GREEN }}>
                              €{getPrice(activity)}
                            </span>
                            <span className="text-sm text-neutral-500 ml-1">{tCommon('perPersonShort')}</span>
                          </div>
                        ) : <div />}

                        <div className="flex items-center gap-3">
                          <NavLink
                            href={`/activities/${activity.slug}`}
                            className="h-11 px-6 rounded-xl border-2 font-semibold flex items-center transition-all duration-300 text-sm"
                            style={{
                              borderColor: ACCENT_GREEN,
                              color: ACCENT_GREEN,
                            }}
                          >
                            {tCommon('viewDetails')}
                          </NavLink>
                          <button
                            onClick={() => handleAddToCart(activity)}
                            className="h-11 px-6 rounded-xl text-white font-semibold transition-all text-sm"
                            style={{ backgroundColor: ACCENT_GREEN }}
                          >
                            {tCommon('bookNow')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {filteredActivities.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${ACCENT_GREEN}15` }}>
                <Search className="w-8 h-8" style={{ color: ACCENT_GREEN }} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{tPage('noActivitiesFound')}</h3>
              <p className="text-neutral-500 mb-6">{tPage('tryAdjustingFilters')}</p>
              <button
                onClick={() => {
                  setActiveCategory('all')
                  setSearchQuery('')
                  setSortBy('popular')
                }}
                className="px-6 py-3 rounded-xl text-white font-semibold transition-colors"
                style={{ backgroundColor: ACCENT_GREEN }}
              >
                {tCommon('clearFilters')}
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
