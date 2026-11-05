'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface GuideImageCarouselProps {
  images: string[]
  alt: string
  variant?: 'card' | 'detail'
  className?: string
  priority?: boolean
}

export function GuideImageCarousel({ images, alt, variant = 'card', className = '', priority = false }: GuideImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const hasMultiple = images.length > 1

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const arrowSize = variant === 'detail' ? 'w-10 h-10' : 'w-8 h-8'
  const chevronSize = variant === 'detail' ? 'w-5 h-5' : 'w-4 h-4'
  const arrowVisibility = variant === 'card' ? 'opacity-0 group-hover:opacity-100' : ''

  return (
    <div className={`overflow-hidden ${className || 'relative'}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        {images[activeIndex] && (
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex]}
              alt={alt}
              fill
              priority={priority}
              sizes={variant === 'detail' ? '(max-width: 768px) 100vw, 600px' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
              className={variant === 'card' ? 'object-cover transition-transform duration-700 group-hover:scale-105' : 'object-cover'}
              unoptimized={images[activeIndex].includes('utfs.io') || images[activeIndex].includes('uploadthing')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              prev()
            }}
            className={`absolute left-2 top-1/2 -translate-y-1/2 ${arrowSize} ${arrowVisibility} rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all z-10`}
            aria-label="Previous photo"
          >
            <ChevronLeft className={`${chevronSize} text-neutral-900`} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              next()
            }}
            className={`absolute right-2 top-1/2 -translate-y-1/2 ${arrowSize} ${arrowVisibility} rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all z-10`}
            aria-label="Next photo"
          >
            <ChevronRight className={`${chevronSize} text-neutral-900`} />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  setActiveIndex(idx)
                }}
                className={`h-1.5 rounded-full transition-all ${
                  idx === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/80'
                }`}
                aria-label={`Go to photo ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
