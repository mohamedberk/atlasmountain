'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, Star, Clock, Users } from 'lucide-react'
import { NavLink } from '@/components/ui/nav-link'
import Image from 'next/image'
import type { Activity, Media } from '@/payload-types'
import { getOptimizedImageUrl } from '@/lib/image-utils'
import { useTranslations } from 'next-intl'

const ACCENT_GREEN = '#49b540'

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
}

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      delay,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
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

interface ReviewStats {
  totalReviews: number
  averageRating: number
  happyTravelers: string
}

interface HeroData {
  backgroundImage?: string | Media | null
  backgroundImages?: { image: string | Media; id?: string | null }[] | null
  badgeText?: string | null
  title?: string | null
  titleHighlight?: string | null
  description?: string | null
  ctaButtonText?: string | null
  secondaryCtaText?: string | null
  viewAllExperiencesText?: string | null
  scrollText?: string | null
  credibility?: {
    travelersCount?: string | null
    travelersLabel?: string | null
    ratingLabel?: string | null
  }
}

interface Props {
  featuredActivities: Activity[]
  activities?: Activity[]
  heroData?: HeroData | null
  reviewStats?: ReviewStats | null
}

const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?q=80&w=2940&auto=format&fit=crop'

interface HeroSlideshowProps {
  slides: string[]
  currentSlide: number
  onFirstLoad: () => void
  firstLoaded: boolean
}

function HeroSlideshow({ slides, currentSlide, onFirstLoad, firstLoaded }: HeroSlideshowProps) {
  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={currentSlide}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: firstLoaded || currentSlide > 0 ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      >
        <Image
          src={slides[currentSlide]}
          alt="Morocco"
          fill
          sizes="100vw"
          className="object-cover"
          priority={currentSlide === 0}
          onLoad={currentSlide === 0 ? onFirstLoad : undefined}
        />
      </motion.div>
    </AnimatePresence>
  )
}

export function ModernHero({ featuredActivities, activities = [], heroData, reviewStats }: Props) {
  const t = useTranslations('hero')
  const [heroImageLoaded, setHeroImageLoaded] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  const experiences = featuredActivities.length > 0
    ? featuredActivities.slice(0, 2)
    : activities.slice(0, 2)

  const heroSlides = useMemo(() => {
    const slides: string[] = []
    if (heroData?.backgroundImage) {
      slides.push(getOptimizedImageUrl(heroData.backgroundImage as Media, 'hero'))
    }
    if (heroData?.backgroundImages?.length) {
      for (const slide of heroData.backgroundImages) {
        if (slide?.image) {
          slides.push(getOptimizedImageUrl(slide.image as Media, 'hero'))
        }
      }
    }
    return slides.length > 0 ? slides : [DEFAULT_HERO_IMAGE]
  }, [heroData?.backgroundImage, heroData?.backgroundImages])

  useEffect(() => {
    if (heroSlides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroSlides.length])
  const badgeText = heroData?.badgeText || t('yearsOfExcellence')
  const title = heroData?.title || t('defaultTitle')
  const titleHighlight = heroData?.titleHighlight || t('defaultTitleHighlight')
  const description = heroData?.description || t('defaultDescription')
  const ctaText = heroData?.ctaButtonText || t('exploreExperiences')
  const secondaryCtaText = heroData?.secondaryCtaText || t('planYourTrip')
  const viewAllExperiencesText = heroData?.viewAllExperiencesText || t('viewAllExperiences')
  const scrollText = heroData?.scrollText || t('scroll')

  const travelersCount = heroData?.credibility?.travelersCount || reviewStats?.happyTravelers || '500+'
  const travelersLabel = heroData?.credibility?.travelersLabel || t('happyTravelers')
  const ratingLabel = heroData?.credibility?.ratingLabel || t('googleRating')
  const rating = reviewStats ? reviewStats.averageRating.toFixed(1) : '5.0'

  const scrollToPremiumActivities = () => {
    const premiumSection = document.getElementById('premium-activities')
    if (premiumSection) {
      premiumSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Empty state - no activities
  if (!experiences.length) {
    return (
      <section className="relative w-full min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <HeroSlideshow
            slides={heroSlides}
            currentSlide={currentSlide}
            onFirstLoad={() => setHeroImageLoaded(true)}
            firstLoaded={heroImageLoaded}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display text-white leading-tight mb-6">
            {title} <span style={{ color: ACCENT_GREEN }}>{titleHighlight}</span>
          </h1>
          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">{description}</p>
          <button
            onClick={scrollToPremiumActivities}
            className="inline-flex items-center gap-2 text-white font-medium rounded-full px-8 py-4 transition-all hover:brightness-110"
            style={{ backgroundColor: ACCENT_GREEN }}
          >
            {ctaText}
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <HeroSlideshow
          slides={heroSlides}
          currentSlide={currentSlide}
          onFirstLoad={() => setHeroImageLoaded(true)}
          firstLoaded={heroImageLoaded}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/10"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="flex flex-col items-start gap-6 lg:grid lg:grid-cols-2 lg:gap-20 lg:items-center">

          {/* Left Side — contents on mobile so children flow into parent flex with order-*, block on desktop */}
          <div className="contents lg:block">
            {/* Badge */}
            <motion.div
              variants={fadeInUp}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit lg:mb-6 order-1 lg:order-none"
              style={{ backgroundColor: `${ACCENT_GREEN}15` }}
            >
              <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
              <span className="text-sm font-medium uppercase tracking-wider" style={{ color: ACCENT_GREEN }}>
                {badgeText}
              </span>
              <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
            </motion.div>

            {/* Headline - rendered immediately for fast LCP */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-white leading-[1.1] lg:mb-6 order-2 lg:order-none">
              {title}{' '}
              <span style={{ color: ACCENT_GREEN }}>
                {titleHighlight}
              </span>
            </h1>

            {/* Description - rendered immediately for fast LCP */}
            <p className="text-lg text-white/70 max-w-lg lg:mb-8 order-3 lg:order-none">
              {description}
            </p>

            {/* CTAs */}
            <motion.div
              variants={fadeInUp}
              custom={0.3}
              className="hidden lg:flex flex-wrap items-center gap-4 lg:mb-10 order-5 lg:order-none"
            >
              <motion.button
                onClick={scrollToPremiumActivities}
                className="inline-flex items-center gap-2 text-white font-semibold rounded-full px-8 py-4 shadow-sm"
                style={{ backgroundColor: ACCENT_GREEN }}
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(73, 181, 64, 0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                {ctaText}
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <NavLink
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-4 border border-white/30 text-white font-medium rounded-full hover:bg-white/10 hover:border-white/50 transition-all"
                >
                  {secondaryCtaText}
                </NavLink>
              </motion.div>
            </motion.div>

            {/* Trust Stats — Google + TripAdvisor ratings */}
            <motion.div
              variants={fadeInUp}
              custom={0.4}
              className="flex flex-nowrap items-center gap-x-4 sm:gap-x-10 order-6 lg:order-none"
            >
              {/* Google rating */}
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none">
                  <path d="M21.8055 10.0415H12V14.0415H17.6515C16.827 16.3275 14.6115 17.9555 12 17.9555C8.8385 17.9555 6.267 15.384 6.267 12.2225C6.267 9.06097 8.8385 6.48947 12 6.48947C13.5255 6.48947 14.9155 7.06447 15.9585 8.01747L18.873 5.10297C17.085 3.42747 14.6715 2.39697 12 2.39697C6.4785 2.39697 2 6.87547 2 12.397C2 17.9185 6.4785 22.397 12 22.397C18.24 22.397 22.5 17.0655 22.5 11.147C22.5 10.787 22.473 10.4125 22.41 10.0415H21.8055Z" fill="#4285F4"/>
                  <path d="M3.15454 7.45574L6.43704 9.87724C7.32754 7.89424 9.48004 6.48949 12 6.48949C13.5255 6.48949 14.9155 7.06449 15.9585 8.01749L18.873 5.10299C17.085 3.42749 14.6715 2.39699 12 2.39699C8.1585 2.39699 4.82704 4.49999 3.15454 7.45574Z" fill="#EA4335"/>
                  <path d="M12 22.397C14.6115 22.397 16.9695 21.4145 18.74 19.8115L15.5115 17.1975C14.5717 17.8679 13.3654 18.255 12 18.255C9.39904 18.255 7.19054 16.6415 6.35404 14.3695L3.09754 16.8925C4.75204 20.1555 8.13754 22.397 12 22.397Z" fill="#34A853"/>
                  <path d="M22.5 11.147C22.5 10.787 22.473 10.4125 22.41 10.0415H12V14.0415H17.6515C17.2635 15.1185 16.437 16.0175 15.51 16.6305L15.5115 16.6305L18.7415 19.2425C18.4845 19.476 22.5 16.5 22.5 11.147Z" fill="#FBBC05"/>
                </svg>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.0 + i * 0.06 }}
                    >
                      <Star className="w-4 h-4 sm:w-5 sm:h-5" fill={ACCENT_GREEN} color={ACCENT_GREEN} />
                    </motion.div>
                  ))}
                </div>
                <span className="font-bold text-base sm:text-lg text-white ml-1">4.8</span>
              </div>

              <motion.div
                className="h-8 w-px bg-white/30"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 1, duration: 0.4 }}
              />

              {/* TripAdvisor rating */}
              <div className="flex items-center gap-2">
                <Image src="/tripadvisor.png" alt="TripAdvisor" width={28} height={28} className="w-7 h-7 sm:w-8 sm:h-8" />
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.3 + i * 0.06 }}
                      className="w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full bg-[#00AA6C]"
                    />
                  ))}
                </div>
                <span className="font-bold text-base sm:text-lg text-white ml-1">5.0</span>
              </div>
            </motion.div>
          </div>

          {/* Right Side - 2 Cards */}
          <div className="space-y-4 order-4 lg:order-none w-full">
            {experiences.map((activity, index) => (
              <motion.div
                key={activity.id}
                variants={fadeInRight}
                initial="hidden"
                animate="visible"
                custom={0.3 + index * 0.15}
              >
                <NavLink
                  href={`/activities/${activity.slug}`}
                  className="group block bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all duration-500"
                >
                  <motion.div
                    className="flex h-[130px] sm:h-40"
                    whileHover={{
                      y: -4,
                      boxShadow: '0 6px 14px -10px rgba(0, 0, 0, 0.04)',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Image */}
                    <div className="relative w-28 sm:w-44 flex-shrink-0 overflow-hidden">
                      <motion.div
                        className="absolute inset-0"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Image
                          src={getOptimizedImageUrl(activity.featuredImage, 'card')}
                          alt={activity.title}
                          fill
                          sizes="(max-width: 640px) 112px, 176px"
                          className="object-cover"
                        />
                      </motion.div>
                      {/* Duration */}
                      <motion.div
                        className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-1 sm:px-3 sm:py-1.5 bg-black/60 backdrop-blur-sm rounded-full"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                          <span className="text-[10px] sm:text-xs text-white font-medium">{activity.duration}</span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-3 sm:p-5 flex flex-col justify-between min-w-0">
                      <div className="min-w-0">
                        <h3 className="font-bold text-neutral-900 text-sm sm:text-lg leading-tight sm:leading-snug line-clamp-2 group-hover:text-green-600 transition-colors duration-300">
                          {activity.title}
                        </h3>
                        <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-2 text-xs sm:text-sm text-neutral-500">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4" fill={ACCENT_GREEN} color={ACCENT_GREEN} />
                            <span className="font-medium text-neutral-700">5.0</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="truncate">{t('privateAndGroup')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-neutral-100">
                        <div>
                          <span className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wide">{t('from')}</span>
                          <p className="text-base sm:text-xl font-bold" style={{ color: ACCENT_GREEN }}>€{getPrice(activity)}</p>
                        </div>
                        <motion.div
                          className="w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: ACCENT_GREEN }}
                          whileHover={{ scale: 1.15, rotate: 0 }}
                          initial={{ rotate: 0 }}
                        >
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </NavLink>
              </motion.div>
            ))}

            {/* View All */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="pt-2"
            >
              <NavLink
                href="/activities"
                className="group inline-flex items-center gap-2 text-white/70 hover:text-white font-medium transition-colors"
              >
                {viewAllExperiencesText}
                <motion.div
                  className="group-hover:translate-x-2 transition-transform duration-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              </NavLink>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Slideshow indicators */}
      {heroSlides.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 hidden lg:flex gap-2 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentSlide ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block"
      >
        <motion.button
          onClick={scrollToPremiumActivities}
          className="flex flex-col items-center gap-2 text-white/40 hover:text-white/70 transition-colors"
          whileHover={{ scale: 1.1 }}
        >
          <span className="text-xs uppercase tracking-widest">{scrollText}</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Decorative gradient orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${ACCENT_GREEN}15` }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${ACCENT_GREEN}10` }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
    </section>
  )
}
