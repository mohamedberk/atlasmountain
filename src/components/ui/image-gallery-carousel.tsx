'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Media } from '@/payload-types'

// Helper to get image URL
function getImageUrl(image: string | number | Media | null | undefined): string | null {
  if (!image) return null
  if (typeof image === 'string') return image
  if (typeof image === 'number') return '/placeholder-activity.jpg'
  if (typeof image === 'number') return null
  return image.url || null
}

interface ImageGalleryCarouselProps {
  featuredImage: string | number | Media | null | undefined
  gallery?: Array<{ media?: string | number | Media | null }> | null
  alt: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall'
  sizes?: string
  priority?: boolean
  showDots?: boolean
  overlay?: React.ReactNode
  bottomOverlay?: React.ReactNode
}

export function ImageGalleryCarousel({
  featuredImage,
  gallery,
  alt,
  className,
  aspectRatio = 'video',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  showDots = true,
  overlay,
  bottomOverlay,
}: ImageGalleryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]))
  const [visiblyLoaded, setVisiblyLoaded] = useState<Set<number>>(new Set())

  // Build images array from featured + gallery - memoized for performance
  const images = useMemo(() => {
    return [
      getImageUrl(featuredImage),
      ...((gallery || []).map((g) => getImageUrl(g?.media)).filter(Boolean)),
    ].filter((url): url is string => url !== null && url !== '')
  }, [featuredImage, gallery])

  const hasMultipleImages = images.length > 1

  // Handle image load completion
  const handleImageLoad = useCallback((index: number) => {
    setVisiblyLoaded(prev => {
      const newSet = new Set(prev)
      newSet.add(index)
      return newSet
    })
  }, [])

  // Preload adjacent images when current index changes
  useEffect(() => {
    if (!hasMultipleImages) return

    const toPreload = new Set<number>()
    toPreload.add(currentIndex)
    toPreload.add((currentIndex + 1) % images.length)
    toPreload.add(currentIndex === 0 ? images.length - 1 : currentIndex - 1)
    toPreload.add((currentIndex + 2) % images.length)

    setLoadedImages(prev => {
      const newSet = new Set(prev)
      toPreload.forEach(idx => newSet.add(idx))
      return newSet
    })
  }, [currentIndex, images.length, hasMultipleImages])

  // Preload ALL images after initial render for instant switching
  useEffect(() => {
    if (!hasMultipleImages) return

    const timer = setTimeout(() => {
      setLoadedImages(new Set(images.map((_, i) => i)))
    }, 100)

    return () => clearTimeout(timer)
  }, [images, hasMultipleImages])

  const goToPrevious = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const goToNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  const goToIndex = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(index)
  }, [])

  // Fallback for no images
  if (images.length === 0) {
    return (
      <div className={cn('relative bg-neutral-200', className)}>
        <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
          No image
        </div>
        {overlay}
        {bottomOverlay}
      </div>
    )
  }

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[16/10]',
    tall: 'aspect-[3/4]',
  }

  // Check if current image is loaded
  const isCurrentLoaded = visiblyLoaded.has(currentIndex)

  return (
    <div className={cn('relative overflow-hidden group/gallery', aspectClasses[aspectRatio], className)}>
      {/* Skeleton loader - shows until current image loads */}
      {!isCurrentLoaded && (
        <div className="absolute inset-0 z-[5] bg-neutral-100 animate-pulse" />
      )}

      {/* Render ALL images stacked - instant switching via opacity */}
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={`${alt} - Image ${index + 1}`}
          fill
          sizes={sizes}
          className={cn(
            'object-cover transition-opacity duration-200',
            index === currentIndex && isCurrentLoaded ? 'opacity-100 z-10' : 'opacity-0 z-0'
          )}
          priority={priority && index === 0}
          loading={index === 0 ? 'eager' : 'lazy'}
          onLoad={() => handleImageLoad(index)}
          style={{
            display: loadedImages.has(index) || index === currentIndex ? 'block' : 'none'
          }}
        />
      ))}

      {/* Navigation Arrows - Only show if multiple images */}
      {hasMultipleImages && (
        <>
          {/* Previous Button - Always visible on mobile, hover on desktop */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center opacity-70 md:opacity-0 md:group-hover/gallery:opacity-100 transition-opacity duration-200 hover:bg-white hover:scale-105 active:scale-95"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-700" />
          </button>

          {/* Next Button - Always visible on mobile, hover on desktop */}
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center opacity-70 md:opacity-0 md:group-hover/gallery:opacity-100 transition-opacity duration-200 hover:bg-white hover:scale-105 active:scale-95"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-neutral-700" />
          </button>

          {/* Dots Indicator */}
          {showDots && images.length <= 6 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => goToIndex(e, index)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-200',
                    index === currentIndex
                      ? 'bg-white w-4'
                      : 'bg-white/60 hover:bg-white/80'
                  )}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Image Counter - Show if more than 6 images */}
          {showDots && images.length > 6 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </>
      )}

      {/* Custom overlays */}
      {overlay}
      {bottomOverlay}
    </div>
  )
}
