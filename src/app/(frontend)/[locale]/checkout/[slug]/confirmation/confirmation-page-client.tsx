'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  Users,
  Check,
  Mail,
  Phone,
  User,
  Shield,
  Copy,
  Share2,
  Home,
  Star,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { NavLink } from '@/components/ui/nav-link'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'

const ACCENT_GREEN = '#49b540'

interface ConfirmationBookingData {
  ref: string
  items: {
    type: 'activity'
    title: string
    image: string
    price: number
    adults?: number
    children?: number
    duration?: string
  }[]
  date: string
  guestDetails: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  totals: {
    total: number
  }
  paymentMethod: string
  isCustomNote?: boolean
  customPricingNote?: string
}

interface Props {
  locale: string
  slug: string
}

export function ConfirmationPageClient({ locale }: Props) {
  const t = useTranslations('checkoutFlow')
  const intlLocale = useLocale()
  const [booking, setBooking] = useState<ConfirmationBookingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const storedData = localStorage.getItem('greenatlas_booking')
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData)
        setBooking(parsed)
      } catch (e) {
        console.error('Failed to parse booking data:', e)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [copied])

  const copyBookingRef = () => {
    if (booking?.ref) {
      navigator.clipboard
        .writeText(booking.ref)
        .then(() => setCopied(true))
        .catch((err) => console.error('Copy failed:', err))
    }
  }

  const shareBooking = async () => {
    if (navigator.share && booking) {
      try {
        await navigator.share({
          title: 'Green Atlas Travel Booking',
          text: `My Morocco adventure is booked! Reference: ${booking.ref}`,
          url: window.location.href,
        })
      } catch {
        copyBookingRef()
      }
    } else {
      copyBookingRef()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9fb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: ACCENT_GREEN }} />
          <p className="text-neutral-600">{t('confirmation.loadingBooking')}</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#f9f9fb]">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <NavLink href="/" className="flex-shrink-0">
                <Image
                  src="/greenatlaslogo.png"
                  alt="Green Atlas Travel"
                  width={140}
                  height={45}
                  className="h-10 w-auto"
                  priority
                />
              </NavLink>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl border border-neutral-200 p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-neutral-400" />
            </div>
            <h1 className="text-xl font-bold text-neutral-900 mb-2">{t('confirmation.noBookingFound')}</h1>
            <p className="text-neutral-600 mb-6">
              {t('confirmation.noBookingDescription')}
            </p>
            <NavLink
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: ACCENT_GREEN }}
            >
              <Home className="w-4 h-4" />
              {t('confirmation.backToHome')}
            </NavLink>
          </div>
        </main>
      </div>
    )
  }

  const bookingDate = booking.date ? new Date(booking.date) : null

  return (
    <div className="min-h-screen bg-[#f9f9fb]">
      {/* Header - Same as checkout page */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <NavLink href="/" className="flex-shrink-0">
              <Image
                src="/greenatlaslogo.png"
                alt="Green Atlas Travel"
                width={140}
                height={45}
                className="h-10 w-auto"
                priority
              />
            </NavLink>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Shield className="w-4 h-4" style={{ color: ACCENT_GREEN }} />
              <span className="hidden sm:inline">{t('confirmation.bookingConfirmed')}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 sm:p-8 text-center text-white mb-6"
          style={{ background: `linear-gradient(135deg, ${ACCENT_GREEN} 0%, #3da134 100%)` }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: ACCENT_GREEN }} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-bold mb-2"
          >
            {t('confirmation.bookingConfirmed')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/90 mb-4"
          >
            {t('confirmation.adventureAwaits')}
          </motion.p>

          {/* Booking Reference */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2"
          >
            <div className="text-left">
              <p className="text-xs text-white/70">{t('confirmation.bookingNumber')}</p>
              <p className="text-lg font-bold font-mono">{booking.ref}</p>
            </div>
            <button
              onClick={copyBookingRef}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Copy booking reference"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5"
        >
          {/* Email Notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 text-sm">{t('confirmation.confirmationEmailSent')}</p>
              <p className="text-xs text-blue-700 mt-0.5">
                {t('confirmation.checkInbox')}{' '}
                <span className="font-medium">{booking.guestDetails.email}</span>
              </p>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="space-y-3">
            <h4 className="font-semibold text-neutral-900">{t('confirmation.bookingSummary')}</h4>

            {/* Date */}
            {bookingDate && (
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                >
                  <Calendar className="w-5 h-5" style={{ color: ACCENT_GREEN }} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">{t('confirmation.date')}</p>
                  <p className="font-medium text-neutral-900">
                    {bookingDate.toLocaleDateString(intlLocale === 'fr' ? 'fr-FR' : 'en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Items */}
            {booking.items.map((item, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-neutral-50 rounded-xl">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0 relative">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-neutral-900 text-sm line-clamp-1">{item.title}</h5>
                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                    {item.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.duration}
                      </span>
                    )}
                    {item.adults && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {item.adults} Adult{item.adults > 1 ? 's' : ''}
                        {item.children
                          ? `, ${item.children} Child${item.children > 1 ? 'ren' : ''}`
                          : ''}
                      </span>
                    )}
                  </div>
                </div>
                {!booking.isCustomNote && (
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: ACCENT_GREEN }}>
                      &euro;{item.price}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Custom Note Display */}
            {booking.isCustomNote && booking.customPricingNote && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">{booking.customPricingNote}</p>
              </div>
            )}

            {/* Total */}
            {!booking.isCustomNote && (
              <div className="flex justify-between items-center pt-3 border-t border-neutral-200">
                <span className="font-semibold text-neutral-900">{t('total')}</span>
                <span className="text-xl font-bold" style={{ color: ACCENT_GREEN }}>
                  &euro;{booking.totals.total}
                </span>
              </div>
            )}

            {booking.paymentMethod === 'pay_later' && (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4" />
                {t('confirmation.payOnArrivalLabel')}
              </div>
            )}
          </div>

          {/* Guest Info */}
          <div className="p-4 bg-neutral-50 rounded-xl">
            <h4 className="font-semibold text-neutral-900 mb-2 text-sm">{t('confirmation.guestDetails')}</h4>
            <div className="space-y-1.5 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-neutral-400" />
                {booking.guestDetails.firstName} {booking.guestDetails.lastName}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-neutral-400" />
                {booking.guestDetails.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-400" />
                {booking.guestDetails.phone}
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: `${ACCENT_GREEN}08` }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4" style={{ color: ACCENT_GREEN }} />
              <span className="font-medium text-neutral-900 text-sm">{t('confirmation.youreProtected')}</span>
            </div>
            <div className="space-y-1 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3" style={{ color: ACCENT_GREEN }} />
                {t('confirmation.freeCancellation')}
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3" style={{ color: ACCENT_GREEN }} />
                {t('confirmation.support247')}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="text-center py-2">
            <div className="flex justify-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-xs text-neutral-500">
              {t('confirmation.ratedBy', { rating: '4.9/5', count: '500+' })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={shareBooking}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-neutral-200 rounded-xl text-neutral-700 hover:bg-neutral-50 transition-colors text-sm font-medium"
            >
              <Share2 className="w-4 h-4" />
              {t('confirmation.share')}
            </button>
            <NavLink
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: ACCENT_GREEN }}
            >
              <Home className="w-4 h-4" />
              {t('confirmation.backToHome')}
            </NavLink>
          </div>

          {/* Explore More */}
          <NavLink
            href={`/${locale}/activities`}
            className="flex items-center justify-center gap-2 text-sm font-medium hover:underline"
            style={{ color: ACCENT_GREEN }}
          >
            {t('confirmation.exploreMore')}
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </motion.div>
      </main>
    </div>
  )
}
