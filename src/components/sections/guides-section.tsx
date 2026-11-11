'use client'

import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import { useTranslations } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import { GuideCard } from '@/components/guides/guide-card'
import type { Guide } from '@/payload-types'

const ACCENT_GREEN = '#ff2828'

interface Props {
  guides: Guide[]
}

export function GuidesSection({ guides }: Props) {
  const t = useTranslations('guidesSection')

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (!guides || guides.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-[#fafaf9]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-neutral-900 mb-3">
              {t('title')} <span style={{ color: ACCENT_GREEN }}>{t('titleHighlight')}</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-xl">{t('description')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:block"
          >
            <NavLink
              href="/guides"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-all group"
              style={{ backgroundColor: ACCENT_GREEN }}
            >
              {t('seeAll')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </NavLink>
          </motion.div>
        </div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative group/nav"
        >
          <button
            onClick={scrollPrev}
            className="absolute left-0 sm:-left-4 top-[35%] -translate-y-1/2 z-10 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full border border-neutral-200 flex items-center justify-center hover:bg-white hover:scale-105 transition-all opacity-0 group-hover/nav:opacity-100"
            aria-label={t('prev')}
          >
            <ChevronLeft className="w-5 h-5 text-neutral-900" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 sm:-right-4 top-[35%] -translate-y-1/2 z-10 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full border border-neutral-200 flex items-center justify-center hover:bg-white hover:scale-105 transition-all opacity-0 group-hover/nav:opacity-100"
            aria-label={t('next')}
          >
            <ChevronRight className="w-5 h-5 text-neutral-900" />
          </button>

          <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="flex -mx-3">
              {guides.map((guide, index) => (
                <div
                  key={guide.id}
                  className="flex-[0_0_100%] sm:flex-[0_0_55%] md:flex-[0_0_50%] lg:flex-[0_0_33.3333%] min-w-0 px-3"
                >
                  <GuideCard guide={guide} index={index} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="mt-8 flex justify-center md:hidden">
          <NavLink
            href="/guides"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-all group"
            style={{ backgroundColor: ACCENT_GREEN }}
          >
            {t('seeAll')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </NavLink>
        </div>
      </div>
    </section>
  )
}
