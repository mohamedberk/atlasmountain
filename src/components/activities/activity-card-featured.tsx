'use client'

import { motion } from 'framer-motion'
import { MapPin, Clock, Check, Star, Users, Award } from 'lucide-react'
import { NavLink } from '@/components/ui/nav-link'
import { ImageGalleryCarousel } from '@/components/ui/image-gallery-carousel'
import type { Activity, Media, Category, Location } from '@/payload-types'
import { extractPlainText } from '@/lib/utils'

// Helper functions
function getImageUrl(image: string | number | Media | null | undefined): string {
  if (!image) return '/placeholder-activity.jpg'
  if (typeof image === 'string') return image
  if (typeof image === 'number') return '/placeholder-activity.jpg'
  return image.url || '/placeholder-activity.jpg'
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

function getPlainText(description: Activity['description'] | null | undefined): string {
  if (!description?.root?.children) return ''
  const extractText = (node: any): string => {
    if (node.text) return node.text
    if (node.children) return node.children.map(extractText).join('')
    return ''
  }
  return description.root.children.map(extractText).join(' ').slice(0, 200)
}

function getHighlights(highlights: Activity['highlights']): string[] {
  if (!highlights || !Array.isArray(highlights)) return []
  return highlights.map((h: any) => {
    if (typeof h.highlight === 'string') return h.highlight
    return extractPlainText(h.highlight)
  }).filter(Boolean)
}

interface ActivityCardFeaturedProps {
  activity: Activity
  index?: number
  onBookNow?: (activity: Activity) => void
  size?: 'large' | 'hero'
}

export function ActivityCardFeatured({
  activity,
  index = 0,
  onBookNow,
  size = 'large'
}: ActivityCardFeaturedProps) {
  const categoryInfo = getCategoryInfo(activity.category)
  const highlights = getHighlights(activity.highlights)
  const price = getPrice(activity)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative"
    >
      <div className={`relative bg-white rounded-3xl overflow-hidden border border-neutral-200 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_6px_14px_-10px_rgba(0,0,0,0.04)] ${
        size === 'hero' ? 'min-h-[500px]' : 'min-h-[400px]'
      }`}>
        {/* Featured Badge */}
        {activity.isFeatured && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-[#ff2828] text-white rounded-full text-xs font-semibold shadow-sm">
            <Award className="w-3 h-3" />
            <span>Featured</span>
          </div>
        )}

        {/* Image Section - Full Width */}
        <div className="relative aspect-[4/3]">
          <ImageGalleryCarousel
            featuredImage={activity.featuredImage}
            gallery={activity.gallery as any}
            alt={activity.title}
            className="h-full w-full !aspect-auto"
            aspectRatio="wide"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={index < 2}
            showDots={true}
            overlay={
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/5 pointer-events-none" />
            }
            bottomOverlay={
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
                <div className="flex flex-col gap-2">
                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-white drop-shadow-md">
                    <MapPin className="w-4 h-4 drop-shadow-sm" />
                    <span className="text-sm font-semibold drop-shadow-sm">{getLocationName(activity.location)}</span>
                  </div>
                  {/* Category Badge */}
                  <div className="inline-flex px-3 py-1.5 bg-white/25 backdrop-blur-sm rounded-full border border-white/20">
                    <span className="text-xs font-semibold text-white drop-shadow-sm">{categoryInfo.name}</span>
                  </div>
                </div>
                {/* Duration - Elegant branded badge */}
                {activity.duration && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md border border-white/50 shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-[#ff2828]" />
                    <span className="text-xs font-semibold text-neutral-900 tracking-tight">{activity.duration}</span>
                  </div>
                )}
              </div>
            }
          />
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Title */}
          <NavLink href={`/activities/${activity.slug}`}>
            <h3 className={`font-display font-bold text-neutral-900 mb-3 line-clamp-2 hover:text-primary transition-colors ${
              size === 'hero' ? 'text-2xl' : 'text-xl'
            }`}>
              {activity.title}
            </h3>
          </NavLink>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-neutral-900">{activity.overallRating ?? 4.9}</span>
            {activity.totalReviews ? (
              <span className="text-xs text-neutral-400">({activity.totalReviews} reviews)</span>
            ) : null}
          </div>

          {/* Description */}
          <p className="text-neutral-500 mb-4 line-clamp-2 text-sm leading-relaxed">
            {activity.shortDescription || getPlainText(activity.description)}
          </p>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {highlights.slice(0, 3).map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 rounded-lg">
                  <Check className="w-3 h-3 text-red-600" strokeWidth={2.5} />
                  <span className="text-xs text-red-700 font-medium">{highlight}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Row - Price and Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-neutral-900">€{price}</span>
                <span className="text-sm text-neutral-400">/person</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NavLink
                href={`/activities/${activity.slug}`}
                className="h-10 px-4 rounded-xl bg-primary/10 text-primary text-sm font-semibold flex items-center hover:bg-primary/20 transition-colors"
              >
                Details
              </NavLink>
              {onBookNow && (
                <button
                  onClick={() => onBookNow(activity)}
                  className="h-10 px-5 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 transition-all shadow-sm shadow-secondary/20"
                >
                  Book Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
