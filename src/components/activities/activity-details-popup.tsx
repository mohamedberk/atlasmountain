"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Star, MapPin, Clock, Calendar, Check, ArrowUpRight, ChevronRight, ChevronLeft, Users } from "lucide-react"
import { Activity } from "@/types/activity"
import { NavLink } from "@/components/ui/nav-link"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useTranslations } from "next-intl"
import { extractPlainText } from "@/lib/utils"

interface ActivityDetailsPopupProps {
  activity: Activity | null
  isOpen: boolean
  onClose: () => void
}

export function ActivityDetailsPopup({ activity, isOpen, onClose }: ActivityDetailsPopupProps) {
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null)
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())

  const t = useTranslations('activities')
  const tCommon = useTranslations('common')

  // Memoize all image URLs for instant access
  const allImages = useMemo(() => {
    if (!activity) return []
    const images = [activity.image]
    if (activity.gallery) {
      images.push(...activity.gallery.map(item => item.url))
    }
    return images.filter(Boolean)
  }, [activity])

  // Preload all images when popup opens
  useEffect(() => {
    if (!isOpen || !activity || allImages.length === 0) return

    const preloadImage = (src: string) => {
      return new Promise<void>((resolve) => {
        const img = new window.Image()
        img.onload = () => {
          setPreloadedImages(prev => new Set([...prev, src]))
          resolve()
        }
        img.onerror = () => resolve() // Continue even if image fails
        img.src = src
      })
    }

    // Preload all images simultaneously
    Promise.all(allImages.map(preloadImage))
  }, [isOpen, activity, allImages])

  // Reset when popup closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedGalleryImage(null)
      setPreloadedImages(new Set())
    }
  }, [isOpen])

  // Ultra-fast navigation functions with no delays
  const goToPrevImage = useCallback(() => {
    if (!activity?.gallery) return

    if (!selectedGalleryImage) {
      // Go to last gallery image
      setSelectedGalleryImage(activity.gallery[activity.gallery.length - 1].url)
    } else {
      const currentIndex = activity.gallery.findIndex(item => item.url === selectedGalleryImage)
      if (currentIndex <= 0) {
        // Go to main image
        setSelectedGalleryImage(null)
      } else {
        // Go to previous gallery image
        setSelectedGalleryImage(activity.gallery[currentIndex - 1].url)
      }
    }
  }, [activity, selectedGalleryImage])

  const goToNextImage = useCallback(() => {
    if (!activity?.gallery) return

    if (!selectedGalleryImage) {
      // Go to first gallery image
      setSelectedGalleryImage(activity.gallery[0].url)
    } else {
      const currentIndex = activity.gallery.findIndex(item => item.url === selectedGalleryImage)
      if (currentIndex === -1 || currentIndex === activity.gallery.length - 1) {
        // Go to main image
        setSelectedGalleryImage(null)
      } else {
        // Go to next gallery image
        setSelectedGalleryImage(activity.gallery[currentIndex + 1].url)
      }
    }
  }, [activity, selectedGalleryImage])

  if (!activity) return null

  const displayImage = activity.image || ''
  const currentImage = selectedGalleryImage || displayImage
  const hasGallery = activity.gallery && activity.gallery.length > 0



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden backdrop-blur-md bg-white/95 max-w-5xl max-h-[90vh] rounded-3xl border border-white/20 shadow-glass">
        <DialogTitle className="sr-only">
          {activity.title}
        </DialogTitle>

        <div className="relative flex flex-col lg:flex-row max-h-[90vh] will-change-transform">
          {/* Image section - Takes up half the width on desktop, third of height on mobile */}
          <div className="w-full lg:w-1/2 h-60 sm:h-72 lg:h-[90vh] relative flex-shrink-0 bg-neutral-100 overflow-hidden">
            {/* Preload all images in the background */}
            <div className="absolute inset-0 opacity-0 pointer-events-none">
              {allImages.map((imgSrc, index) => (
                <Image
                  key={`preload-${index}`}
                  src={imgSrc}
                  alt=""
                  fill
                  className="object-cover"
                  priority={index < 3} // Priority for first 3 images
                  loading={index < 3 ? "eager" : "lazy"}
                />
              ))}
            </div>

            {/* Main visible image with instant transitions */}
            <div className="absolute inset-0 z-10">
              <Image
                src={currentImage}
                alt={activity.title}
                fill
                className="object-cover"
                priority
                loading="eager"
                style={{
                  transition: 'none', // Remove all transitions for instant switching
                  transform: 'translateZ(0)', // Force GPU acceleration
                  willChange: 'transform'
                }}
              />
            </div>

            {/* Navigation buttons - desktop only, bottom right */}
            {hasGallery && (
              <div className="absolute bottom-4 right-4 hidden lg:flex gap-2 z-20">
                <button
                  onClick={goToPrevImage}
                  className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 active:scale-95 transform transition-transform duration-75"
                  style={{ transition: 'transform 75ms ease-out, background-color 75ms ease-out' }}
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                <button
                  onClick={goToNextImage}
                  className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 active:scale-95 transform transition-transform duration-75"
                  style={{ transition: 'transform 75ms ease-out, background-color 75ms ease-out' }}
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>
            )}
          </div>

          {/* Content section - Takes up half the width on desktop, two-thirds of height on mobile */}
          <div className="w-full lg:w-1/2 flex flex-col h-[calc(100%-240px)] sm:h-[calc(100%-288px)] lg:h-[90vh]">
            {/* Scrollable content container */}
            <div className="flex-grow overflow-y-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8 scrollbar-hide">
              {/* Location with navigation buttons for mobile */}
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-xs sm:text-sm">{activity.location}</span>
                </div>

                {/* Navigation buttons - mobile only */}
                {hasGallery && (
                  <div className="flex lg:hidden gap-2">
                    <button
                      onClick={goToPrevImage}
                      className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 active:scale-95 transform transition-transform duration-75"
                      style={{ transition: 'transform 75ms ease-out, background-color 75ms ease-out' }}
                    >
                      <ChevronLeft className="w-4 h-4 text-neutral-600" />
                    </button>

                    <button
                      onClick={goToNextImage}
                      className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 active:scale-95 transform transition-transform duration-75"
                      style={{ transition: 'transform 75ms ease-out, background-color 75ms ease-out' }}
                    >
                      <ChevronRight className="w-4 h-4 text-neutral-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* Title */}
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 mb-3 sm:mb-4">
                {activity.title}
              </h2>

              {/* Key details bar */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-primary/5 rounded-lg border border-primary/10">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium">{activity.duration}</span>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-primary/5 rounded-lg border border-primary/10">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium">{t('yearRound')}</span>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-primary/5 rounded-lg border border-primary/10">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium">{t('groupAndPrivate')}</span>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-yellow-50 rounded-lg border border-yellow-100">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs sm:text-sm font-medium">{activity.rating} ({activity.reviewCount})</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4 sm:mb-6">
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {activity.description}
                </p>
              </div>

              {/* Pricing */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-medium text-neutral-900 mb-2 sm:mb-3">{t('pricing')}</h3>

                <div className="bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)] rounded-xl border border-neutral-100 p-4 sm:p-6 hover:shadow-[0_6px_14px_-10px_rgba(0,0,0,0.04)] transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-neutral-900 text-sm sm:text-base">{t('groupExperience')}</h4>
                    <div className="bg-primary/10 text-primary text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full">
                      {t('bestValue')}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-500 mb-3">{t('groupDescription')}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl font-bold text-neutral-900">€{activity.price}</span>
                        <span className="text-xs sm:text-sm text-neutral-500">{t('perAdult')}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl font-bold text-neutral-900">€{activity.childPrice}</span>
                        <span className="text-xs sm:text-sm text-neutral-500">{t('perChild')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Highlights section */}
              {activity.highlights && activity.highlights.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-neutral-900 mb-2 sm:mb-3">{tCommon('highlights')}</h3>

                  <div className="grid grid-cols-1 gap-2">
                    {activity.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-0.5 sm:mt-1">
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-600">{extractPlainText((highlight as any)?.highlight ?? highlight)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Included section - if available */}
              {activity.included && activity.included.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-neutral-900 mb-2 sm:mb-3">{t('whatsIncluded')}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activity.included.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-0.5 sm:mt-1">
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-600">{extractPlainText((item as any)?.item ?? item)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spacer to ensure content doesn't get hidden under the footer */}
              <div className="h-4 sm:h-6"></div>
            </div>

            {/* Footer with book now button - always visible */}
            <div className="p-4 sm:p-6 border-t border-neutral-100 bg-white/50 backdrop-blur-sm mt-auto">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-neutral-500">{t('startingFrom')}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-display font-bold text-primary">€{activity.price}</span>
                    <span className="text-xs sm:text-sm text-neutral-600">{t('perPerson')}</span>
                  </div>
                </div>

                <NavLink
                  href={`/checkout?activity=${activity.id}`}
                  className="h-10 sm:h-12 px-4 sm:px-6 rounded-full bg-primary text-white flex items-center gap-2 text-sm sm:text-base font-medium shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span>{t('bookNow')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>


    </Dialog>
  )
}
