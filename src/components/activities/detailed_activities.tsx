"use client"

import { motion } from "framer-motion"
import { Star, MapPin, Clock, CalendarDays, ArrowUpRight, Check } from "lucide-react"
import { NavLink } from "@/components/ui/nav-link"
import { useTranslations } from "next-intl"
import type { Activity, Media, Category, Location } from "@/payload-types"
import { ImageGalleryCarousel } from "@/components/ui/image-gallery-carousel"
import { extractPlainText } from "@/lib/utils"

// Helper to get price
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

// Helper to get category name
function getCategoryName(category: string | number | Category | null | undefined): string {
  if (!category) return 'Experience'
  if (typeof category === 'string') return category
  if (typeof category === 'number') return 'Experience'
  return category.name || 'Experience'
}

// Helper to get location name
function getLocationName(location: string | number | Location | null | undefined): string {
  if (!location) return 'Morocco'
  if (typeof location === 'string') return location
  if (typeof location === 'number') return 'Morocco'
  return location.name || 'Morocco'
}

// Helper to get plain text description
function getPlainText(description: Activity['description'] | null | undefined): string {
  if (!description?.root?.children) return ''
  const extractText = (node: any): string => {
    if (node.text) return node.text
    if (node.children) return node.children.map(extractText).join('')
    return ''
  }
  return description.root.children.map(extractText).join(' ').slice(0, 250)
}

// Helper to get highlights
function getHighlights(highlights: Activity['highlights']): string[] {
  if (!highlights || !Array.isArray(highlights)) return []
  return highlights.map((h: any) => {
    if (typeof h.highlight === 'string') return h.highlight
    return extractPlainText(h.highlight)
  }).filter(Boolean)
}

interface PremiumActivityCardsProps {
  activities: Activity[]
}

export function PremiumActivityCards({ activities }: PremiumActivityCardsProps) {
  const t = useTranslations('activities')
  const tCommon = useTranslations('common')

  // Don't render if no activities
  if (!activities || activities.length === 0) return null

  return (
    <section className="py-24 bg-[#f9f9fb] relative" id="premium-activities">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 will-change-transform"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Our best <span className="text-primary">trips</span>
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            These are the spots that even have us locals taking pictures. Each one&apos;s special in its own way - we think you&apos;ll dig them.
          </p>
        </motion.div>

        <div className="space-y-16">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group will-change-transform"
            >
              <div className={`bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/40 shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_14px_-10px_rgba(0,0,0,0.04)] transition-all duration-500 flex flex-col md:flex-row ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                {/* Image container with gallery carousel */}
                <div className="relative h-80 md:h-auto md:w-1/2 overflow-hidden">
                  <ImageGalleryCarousel
                    featuredImage={activity.featuredImage}
                    gallery={activity.gallery as any}
                    alt={activity.title}
                    className="h-full w-full !aspect-auto"
                    aspectRatio="wide"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index === 0}
                    showDots={true}
                    overlay={
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-[5]" />
                        {/* Category badge */}
                        <div className="absolute top-6 left-6 z-10">
                          <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-primary rounded-xl text-sm font-medium shadow-sm">
                            {getCategoryName(activity.category)}
                          </span>
                        </div>
                        {/* Rating */}
                        <div className="absolute top-6 right-6 z-10 flex items-center gap-1 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-xl">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white text-sm font-medium">4.9</span>
                        </div>
                      </>
                    }
                    bottomOverlay={
                      <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2 pointer-events-none">
                        <div className="flex items-center gap-1.5 text-white">
                          <MapPin className="w-4 h-4 text-primary-light" />
                          <span className="text-sm">{getLocationName(activity.location)}</span>
                        </div>
                      </div>
                    }
                  />
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 flex flex-col md:w-1/2">
                  <NavLink href={`/activities/${activity.slug}`}>
                    <h3 className="font-display text-2xl md:text-3xl font-bold mb-3 text-neutral-900 hover:text-primary transition-colors">
                      {activity.title}
                    </h3>
                  </NavLink>

                  <p className="text-neutral-600 mb-6">
                    {activity.shortDescription || getPlainText(activity.description)}
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">{t('duration')}</p>
                        <p className="text-sm font-medium">{activity.duration || 'Full Day'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CalendarDays className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">{t('available')}</p>
                        <p className="text-sm font-medium">{t('yearRound')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  {getHighlights(activity.highlights).length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-lg font-medium text-neutral-900 mb-3">{t('experienceHighlights')}</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {getHighlights(activity.highlights).slice(0, 3).map((highlight, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-xl bg-primary/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                            <p className="text-sm text-neutral-600">{highlight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price and CTA */}
                  <div className="mt-auto border-t border-neutral-200 pt-6 flex items-end justify-between">
                    {activity.pricingType !== 'custom_note' ? (
                      <div>
                        <p className="text-sm text-neutral-500">{t('startingFrom')}</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-display font-bold text-neutral-900">€{getPrice(activity)}</span>
                          <span className="text-xs sm:text-sm text-neutral-600">/{t('perPerson')}</span>
                        </div>
                      </div>
                    ) : <div />}

                    <div className="flex items-center gap-3">
                      <NavLink
                        href={`/activities/${activity.slug}`}
                        className="h-12 px-6 rounded-xl bg-white/80 backdrop-blur-sm text-neutral-800 flex items-center gap-2 font-medium border border-neutral-200 shadow-sm hover:shadow hover:bg-white transition-all duration-300"
                      >
                        <span>{tCommon('details')}</span>
                      </NavLink>

                      <NavLink
                        href={`/activities/${activity.slug}`}
                        className="h-12 px-6 rounded-xl bg-primary text-white flex items-center gap-2 font-medium shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <span>{tCommon('book')}</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </NavLink>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
