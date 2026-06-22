'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Activity, Media } from '@/payload-types'

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

const HERO_IMAGES = [
  'https://ec0m9cwfe1.ufs.sh/f/qpHeSXPP9BvacKoFMZiniwrV1eIAgDFJahN6SHpqbUkmlosc',
  'https://ec0m9cwfe1.ufs.sh/f/qpHeSXPP9Bva6DPFRb1btGgQ3vUr0qs7iIH8Pl5yfAKB1oNW',
  'https://ec0m9cwfe1.ufs.sh/f/qpHeSXPP9Bvamy7ZfOVd5V87Q94vOn6jRWrNZbGfUAFa1iBx',
  'https://ec0m9cwfe1.ufs.sh/f/qpHeSXPP9BvaGjde9KbR0znfPyMjT7lS3gqOVeQpi2EdcCDk',
  'https://ec0m9cwfe1.ufs.sh/f/qpHeSXPP9Bva4N936N5NMwEHOp0fIKuxjgFT7s2ZlDV8rqyn',
  'https://ec0m9cwfe1.ufs.sh/f/qpHeSXPP9Bvaw5KC684WjDZrhputvofXTKq94msL5iJHBy1z',
  'https://ec0m9cwfe1.ufs.sh/f/qpHeSXPP9Bva4F7ocGf5NMwEHOp0fIKuxjgFT7s2ZlDV8rqy',
  'https://ec0m9cwfe1.ufs.sh/f/qpHeSXPP9BvaXNndpD9FNgxRrCKZUz6tJn7is39IoP0S51Xp',
]

interface HeroSlideshowProps {
  slides: string[]
  currentSlide: number
  onFirstLoad: () => void
  firstLoaded: boolean
  alt: string
}

function HeroSlideshow({ slides, currentSlide, onFirstLoad, firstLoaded, alt }: HeroSlideshowProps) {
  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="sync">
        <m.div
          key={currentSlide}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: firstLoaded || currentSlide > 0 ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          <Image
            src={slides[currentSlide]}
            alt={alt}
            fill
            sizes="100vw"
            className="object-cover"
            priority={currentSlide === 0}
            onLoad={currentSlide === 0 ? onFirstLoad : undefined}
          />
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  )
}

export function ModernHero(_props: Props) {
  const [heroImageLoaded, setHeroImageLoaded] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const t = useTranslations('home')

  const scrollToNext = useCallback(() => {
    const next = sectionRef.current?.nextElementSibling as HTMLElement | null
    if (next) {
      next.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
    }
  }, [])

  const heroSlides = useMemo(() => {
    return HERO_IMAGES
  }, [])

  useEffect(() => {
    if (heroSlides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [heroSlides.length])

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }, [heroSlides.length])

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }, [heroSlides.length])

  return (
    <section ref={sectionRef} className="relative w-full h-[50vh] md:h-auto md:min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <HeroSlideshow
          slides={heroSlides}
          currentSlide={currentSlide}
          onFirstLoad={() => setHeroImageLoaded(true)}
          firstLoaded={heroImageLoaded}
          alt={t('heroImageAlt')}
        />
      </div>

      {heroSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label={t('heroPrevSlide')}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white flex items-center justify-center transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={t('heroNextSlide')}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white flex items-center justify-center transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 hidden lg:flex gap-2 z-20">
            {heroSlides.map((slide, i) => (
              <button
                key={slide}
                type="button"
                onClick={() => {
                  setCurrentSlide(i)
                }}
                aria-label={t('heroGoToSlide', { number: i + 1 })}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === currentSlide ? 'w-8 bg-[#ff2828]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Scroll indicator */}
      <LazyMotion features={domAnimation}>
        <m.button
          type="button"
          onClick={scrollToNext}
          aria-label={t('heroScrollToNext')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-white/90 hover:text-white transition-colors group"
        >
          <span className="text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase pl-[0.2em]">
            {t('heroScrollLabel')}
          </span>
          <m.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 group-hover:bg-white/25 transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </m.span>
        </m.button>
      </LazyMotion>
    </section>
  )
}
