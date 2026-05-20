'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Activity, Media } from '@/payload-types'
import { getOptimizedImageUrl } from '@/lib/image-utils'

interface HeroData {
  backgroundImage?: string | Media | null
  backgroundImages?: { image: string | Media; id?: string | null }[] | null
}

interface Props {
  featuredActivities?: Activity[]
  activities?: Activity[]
  heroData?: HeroData | null
  reviewStats?: unknown
}

// 5 Morocco-themed default hero images (Atlas mountains, desert, Marrakech, kasbah, Berber village)
const DEFAULT_HERO_IMAGES = [
  // Atlas mountains
  'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?q=80&w=2940&auto=format&fit=crop',
  // Sahara desert dunes
  'https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=2940&auto=format&fit=crop',
  // Marrakech medina
  'https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2940&auto=format&fit=crop',
  // Aït Benhaddou kasbah
  'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2940&auto=format&fit=crop',
  // Berber village in the High Atlas
  'https://images.unsplash.com/photo-1531253450048-c81d7d3cdf01?q=80&w=2940&auto=format&fit=crop',
]

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

export function ModernHero({ heroData }: Props) {
  const [heroImageLoaded, setHeroImageLoaded] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
    return slides.length > 0 ? slides : DEFAULT_HERO_IMAGES
  }, [heroData?.backgroundImage, heroData?.backgroundImages])

  const startAutoRotate = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (heroSlides.length <= 1) return
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
  }, [heroSlides.length])

  useEffect(() => {
    startAutoRotate()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [startAutoRotate])

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
    startAutoRotate()
  }, [heroSlides.length, startAutoRotate])

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    startAutoRotate()
  }, [heroSlides.length, startAutoRotate])

  return (
    <section className="relative w-full h-[50vh] md:h-auto md:min-h-screen mt-16 md:mt-0 flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <HeroSlideshow
          slides={heroSlides}
          currentSlide={currentSlide}
          onFirstLoad={() => setHeroImageLoaded(true)}
          firstLoaded={heroImageLoaded}
        />
      </div>

      {heroSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous slide"
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white flex items-center justify-center transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next slide"
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white flex items-center justify-center transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 hidden lg:flex gap-2 z-20">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentSlide(i)
                  startAutoRotate()
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === currentSlide ? 'w-8 bg-[#ff2828]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
