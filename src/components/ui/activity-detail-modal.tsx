'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, Star, Check, Shield, Plus, Minus, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import Image from 'next/image'
import { NavLink } from '@/components/ui/nav-link'
import { FullscreenGallery } from './fullscreen-gallery'
import { extractPlainText } from '@/lib/utils'

export interface ActivityInfo {
  id: string
  title: string
  price: number
  childPrice: number
  image: string
  images?: string[] // Optional array for gallery support
  duration: string
  slug: string
  shortDescription?: string
  location?: string
  highlights?: string[]
  included?: string[]
  rating?: number
  reviewCount?: number
}

interface ActivityDetailModalProps {
  activity: ActivityInfo | null
  isOpen: boolean
  onClose: () => void
  onAdd?: (activity: ActivityInfo, adults: number, children: number) => void
  mode?: 'add' | 'view' // 'add' shows guest selection and add button, 'view' shows view details link
  locale?: string
}

export function ActivityDetailModal({
  activity,
  isOpen,
  onClose,
  onAdd,
  mode = 'add',
  locale = 'en',
}: ActivityDetailModalProps) {
  const [modalAdults, setModalAdults] = useState(1)
  const [modalChildren, setModalChildren] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Build gallery array from activity
  const images = activity?.images?.length ? activity.images : activity?.image ? [activity.image] : []

  // Mount check for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Block scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setModalAdults(1)
      setModalChildren(0)
      setCurrentImageIndex(0)
    }
  }, [isOpen])

  if (!mounted || !isOpen || !activity) return null

  const modalTotalPrice = (activity.price * modalAdults) + (activity.childPrice * modalChildren)

  const handleAdd = () => {
    if (onAdd) {
      onAdd(activity, modalAdults, modalChildren)
      setModalAdults(1)
      setModalChildren(0)
    }
  }

  const handleClose = () => {
    setModalAdults(1)
    setModalChildren(0)
    setCurrentImageIndex(0)
    onClose()
  }

  const goNextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const goPrevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header Image with Gallery */}
          <div className="relative h-48 sm:h-56">
            <Image
              src={images[currentImageIndex] || activity.image}
              alt={activity.title}
              fill
              sizes="(max-width: 512px) 100vw, 512px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors z-10"
            >
              <X className="w-4 h-4 text-neutral-700" />
            </button>

            {/* Fullscreen button */}
            {images.length > 0 && (
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors z-10"
              >
                <ZoomIn className="w-4 h-4 text-neutral-700" />
              </button>
            )}

            {/* Gallery navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goPrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors z-10"
                >
                  <ChevronLeft className="w-4 h-4 text-neutral-700" />
                </button>
                <button
                  onClick={goNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors z-10"
                >
                  <ChevronRight className="w-4 h-4 text-neutral-700" />
                </button>
              </>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs z-10">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Title overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-1">
                {activity.title}
              </h2>
              <div className="flex items-center gap-3 text-white/90 text-sm">
                {activity.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {activity.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {activity.duration}
                </span>
                {activity.rating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {activity.rating}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail dots */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? 'bg-white w-4'
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Modal Content */}
          <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(90vh-14rem)]">
            {activity.shortDescription && (
              <p className="text-neutral-600 text-sm leading-relaxed mb-4 whitespace-pre-line">
                {activity.shortDescription}
              </p>
            )}

            {activity.highlights && activity.highlights.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-neutral-900 mb-2 text-sm">Highlights</h3>
                <div className="space-y-1.5">
                  {activity.highlights.slice(0, 4).map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-neutral-600">
                      <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-primary" />
                      </div>
                      <span>{extractPlainText((highlight as any)?.highlight ?? highlight)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activity.included && activity.included.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-neutral-900 mb-2 text-sm">What&apos;s Included</h3>
                <div className="space-y-1.5">
                  {activity.included.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-neutral-600">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-red-600" />
                      </div>
                      <span>{extractPlainText((item as any)?.item ?? item)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === 'add' && onAdd ? (
              <>
                {/* Pricing & Guest Selection */}
                <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-display font-bold text-neutral-900">€{activity.price}</span>
                    <span className="text-neutral-500 text-sm">/person</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-neutral-200">
                    <div>
                      <p className="font-medium text-neutral-900 text-sm">Adults</p>
                      <p className="text-xs text-neutral-500">€{activity.price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalAdults(Math.max(1, modalAdults - 1))}
                        className="w-7 h-7 rounded-full bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{modalAdults}</span>
                      <button
                        onClick={() => setModalAdults(modalAdults + 1)}
                        className="w-7 h-7 rounded-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-neutral-900 text-sm">Children</p>
                      <p className="text-xs text-neutral-500">€{activity.childPrice} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalChildren(Math.max(0, modalChildren - 1))}
                        className="w-7 h-7 rounded-full bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{modalChildren}</span>
                      <button
                        onClick={() => setModalChildren(modalChildren + 1)}
                        className="w-7 h-7 rounded-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-neutral-200">
                    <span className="font-medium text-neutral-900">Total</span>
                    <span className="text-xl font-display font-bold text-secondary">€{modalTotalPrice}</span>
                  </div>
                </div>

                <button
                  onClick={handleAdd}
                  className="w-full h-12 bg-secondary text-white font-medium rounded-xl shadow-sm shadow-secondary/20 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add to Booking
                </button>
              </>
            ) : (
              <>
                {/* View Mode - Show price and link to activity page */}
                <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-display font-bold text-neutral-900">€{activity.price}</span>
                    <span className="text-neutral-500 text-sm">/person</span>
                  </div>
                  {activity.childPrice > 0 && (
                    <p className="text-sm text-neutral-500 mt-1">Children: €{activity.childPrice}/child</p>
                  )}
                </div>

                <NavLink
                  href={`/activities/${activity.slug}`}
                  className="w-full h-12 bg-secondary text-white font-medium rounded-xl shadow-sm shadow-secondary/20 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  View Full Details
                </NavLink>
              </>
            )}

            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-red-600" />
                Free cancellation
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-red-600" />
                Instant confirmation
              </span>
            </div>
          </div>
        </motion.div>

        {/* Fullscreen Gallery */}
        <FullscreenGallery
          images={images}
          initialIndex={currentImageIndex}
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          alt={activity.title}
        />
      </motion.div>
    </AnimatePresence>
  )

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body)
}
