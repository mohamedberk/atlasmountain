'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Shield,
  CreditCard,
  Wallet,
  Mail,
  User,
  MessageSquare,
  X,
  Loader2,
} from 'lucide-react'
import { NavLink } from '@/components/ui/nav-link'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import type { Activity, Media } from '@/payload-types'
import { useCart, ActivityCartItem } from '@/context/CartContext'
import { PhoneInput } from '@/components/ui/phone-input'
import { LocationMapPicker } from '@/components/ui/location-map-picker'

const ACCENT_GREEN = '#ff2828'

// Types
interface BookingItem {
  activity: Activity
  adults: number
  children: number
  date: Date | null
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  pickupLocation: string
  specialRequests: string
}

interface Props {
  activity: Activity
  relatedActivities: Activity[]
  locale: string
}

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

// Note: ConfirmationModal has been moved to a separate page at /checkout/[slug]/confirmation

// Helper functions
function getImageUrl(image: string | number | Media | null | undefined): string {
  if (!image) return '/placeholder-activity.jpg'
  if (typeof image === 'string') return image
  if (typeof image === 'number') return '/placeholder-activity.jpg'
  return image.externalUrl || image.url || '/placeholder-activity.jpg'
}

function getActivityPrice(activity: Activity, adults: number): number {
  // Custom note mode - no pricing
  if (activity.pricingType === 'custom_note') {
    return 0
  }

  if (activity.pricingType === 'tiered' && activity.tieredPricing?.tiers) {
    // Find the applicable tier based on number of adults
    const applicableTier = activity.tieredPricing.tiers.find((tier: any) => {
      const minPeople = tier.numberOfPeople || tier.minPeople || 1
      const maxPeople = tier.maxPeople || minPeople
      return adults >= minPeople && adults <= maxPeople
    })

    if (applicableTier) {
      return applicableTier.pricePerPerson || 0
    }

    // Fallback to lowest price if no match found
    if (activity.tieredPricing.tiers.length > 0) {
      const lowestPrice = Math.min(...activity.tieredPricing.tiers.map((tier: any) => tier.pricePerPerson || 0))
      return lowestPrice
    }
    return 0
  }
  if (activity.pricingType === 'fixed' && activity.privatePricing?.basePrice) {
    return activity.privatePricing.basePrice
  }
  return 0
}

function getChildPrice(activity: Activity): number {
  if (activity.pricingType === 'tiered' && activity.tieredPricing?.childPrice) {
    return activity.tieredPricing.childPrice
  }
  return 0
}

function calculateItemTotal(item: BookingItem): number {
  const adultPrice = getActivityPrice(item.activity, item.adults)
  const childPrice = getChildPrice(item.activity)
  return (item.adults * adultPrice) + (item.children * childPrice)
}

function formatDate(date: Date, locale: string = 'en'): string {
  return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Step indicator component
function StepIndicator({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                index < currentStep
                  ? 'text-white'
                  : index === currentStep
                  ? 'text-white'
                  : 'bg-neutral-200 text-neutral-500'
              }`}
              style={{
                backgroundColor: index <= currentStep ? ACCENT_GREEN : undefined,
              }}
            >
              {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
            </div>
            <span
              className={`text-xs mt-2 font-medium hidden sm:block ${
                index <= currentStep ? 'text-neutral-900' : 'text-neutral-400'
              }`}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 sm:w-20 h-1 mx-2 rounded-full transition-all duration-300 ${
                index < currentStep ? '' : 'bg-neutral-200'
              }`}
              style={{
                backgroundColor: index < currentStep ? ACCENT_GREEN : undefined,
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// Date picker component
function DatePicker({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date | null
  onSelect: (date: Date) => void
}) {
  const t = useTranslations('checkoutFlow')
  const locale = useLocale()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }, [currentMonth])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold text-neutral-900">
          {currentMonth.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {[t('days.sun'), t('days.mon'), t('days.tue'), t('days.wed'), t('days.thu'), t('days.fri'), t('days.sat')].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-neutral-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-10" />
          }

          const isPast = date < today
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
          const isToday = date.toDateString() === today.toDateString()

          return (
            <button
              key={date.toISOString()}
              onClick={() => !isPast && onSelect(date)}
              disabled={isPast}
              className={`h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                isPast
                  ? 'text-neutral-300 cursor-not-allowed'
                  : isSelected
                  ? 'text-white'
                  : isToday
                  ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
              style={{
                backgroundColor: isSelected ? ACCENT_GREEN : undefined,
              }}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Guest selector component
function GuestSelector({
  adults,
  childrenCount,
  onAdultsChange,
  onChildrenChange,
  compact = false,
}: {
  adults: number
  childrenCount: number
  onAdultsChange: (value: number) => void
  onChildrenChange: (value: number) => void
  compact?: boolean
}) {
  const t = useTranslations('checkoutFlow')
  return (
    <div className={`space-y-3 ${compact ? '' : 'bg-white rounded-2xl border border-neutral-200 p-4'}`}>
      {!compact && <h4 className="font-semibold text-neutral-900 mb-3">{t('guests')}</h4>}

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-neutral-900">{t('adults')}</p>
          {!compact && <p className="text-sm text-neutral-500">{t('age13Plus')}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onAdultsChange(Math.max(1, adults - 1))}
            className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-semibold">{adults}</span>
          <button
            onClick={() => onAdultsChange(adults + 1)}
            className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-neutral-900">{t('children')}</p>
          {!compact && <p className="text-sm text-neutral-500">{t('age2to12')}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onChildrenChange(Math.max(0, childrenCount - 1))}
            className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-semibold">{childrenCount}</span>
          <button
            onClick={() => onChildrenChange(childrenCount + 1)}
            className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Mini date picker for related activities
function MiniDatePicker({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date | null
  onSelect: (date: Date) => void
}) {
  const t = useTranslations('checkoutFlow')
  const locale = useLocale()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }, [currentMonth])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="bg-neutral-50 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-1 hover:bg-neutral-200 rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-medium text-neutral-700">
          {currentMonth.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })}
        </span>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-1 hover:bg-neutral-200 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-neutral-400 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {daysInMonth.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-6" />
          }

          const isPast = date < today
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

          return (
            <button
              key={date.toISOString()}
              onClick={() => !isPast && onSelect(date)}
              disabled={isPast}
              className={`h-6 rounded text-[10px] font-medium transition-all ${
                isPast
                  ? 'text-neutral-300 cursor-not-allowed'
                  : isSelected
                  ? 'text-white'
                  : 'text-neutral-600 hover:bg-neutral-200'
              }`}
              style={{
                backgroundColor: isSelected ? ACCENT_GREEN : undefined,
              }}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Related activity card for "You May Also Like" step
function RelatedActivityCard({
  activity,
  onAdd,
  isAdded,
}: {
  activity: Activity
  onAdd: (activity: Activity, adults: number, children: number, date: Date | null) => void
  isAdded: boolean
}) {
  const t = useTranslations('checkoutFlow')
  const [showSelector, setShowSelector] = useState(false)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const price = getActivityPrice(activity, adults)
  const isCustomNote = activity.pricingType === 'custom_note'

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <div className="relative h-32">
        <Image
          src={getImageUrl(activity.featuredImage)}
          alt={activity.title}
          fill
          className="object-cover"
        />
        {!isCustomNote && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-sm">
            <span className="text-xs font-bold" style={{ color: ACCENT_GREEN }}>
              €{price}
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
            style={{ backgroundColor: `${ACCENT_GREEN}15`, color: ACCENT_GREEN }}
          >
            <Clock className="w-2.5 h-2.5" />
            {activity.duration || '1 Day'}
          </div>
        </div>

        <h4 className="font-semibold text-neutral-900 text-sm mb-2 line-clamp-1">{activity.title}</h4>

        {isAdded ? (
          <div
            className="w-full py-2 rounded-lg text-xs font-semibold text-center text-white"
            style={{ backgroundColor: ACCENT_GREEN }}
          >
            <Check className="w-3 h-3 inline mr-1" />
            {t('added')}
          </div>
        ) : showSelector ? (
          <div className="space-y-2">
            {/* Guests */}
            <GuestSelector
              adults={adults}
              childrenCount={children}
              onAdultsChange={setAdults}
              onChildrenChange={setChildren}
              compact
            />

            {/* Mini Calendar */}
            <MiniDatePicker
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />

            {selectedDate && (
              <div className="flex items-center gap-1 text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                <Calendar className="w-3 h-3" />
                {formatDate(selectedDate)}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSelector(false)
                  setSelectedDate(null)
                }}
                className="flex-1 py-1.5 rounded-lg border border-neutral-300 text-xs font-medium hover:bg-neutral-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  if (selectedDate) {
                    onAdd(activity, adults, children, selectedDate)
                    setShowSelector(false)
                  }
                }}
                disabled={!selectedDate}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: ACCENT_GREEN }}
              >
                {t('add')}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowSelector(true)}
            className="w-full py-2 rounded-lg border-2 text-xs font-semibold transition-colors hover:bg-red-50"
            style={{ borderColor: ACCENT_GREEN, color: ACCENT_GREEN }}
          >
            <Plus className="w-3 h-3 inline mr-1" />
            {t('addToBooking')}
          </button>
        )}
      </div>
    </div>
  )
}

// Main component
export function CheckoutFlowClient({ activity, relatedActivities, locale }: Props) {
  const router = useRouter()
  const t = useTranslations('checkoutFlow')
  const intlLocale = useLocale()
  const [currentStep, setCurrentStep] = useState(0)
  const steps = [t('steps.yourBooking'), t('steps.yourDetails'), t('steps.youMayAlsoLike'), t('steps.reviewAndPay')]
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Get cart data
  const { items: cartItems } = useCart()

  // Main booking item - initialize from cart if available
  const [mainBooking, setMainBooking] = useState<BookingItem>(() => {
    // Default values
    return {
      activity,
      adults: 1,
      children: 0,
      date: null,
    }
  })

  // Initialize from cart data on mount
  useEffect(() => {
    const cartItem = cartItems.find(
      (item): item is ActivityCartItem =>
        item.type === 'activity' && item.slug === activity.slug
    )

    if (cartItem) {
      // Parse the date from cart if it exists
      let parsedDate: Date | null = null
      if (cartItem.date) {
        const dateObj = new Date(cartItem.date)
        if (!isNaN(dateObj.getTime())) {
          parsedDate = dateObj
        }
      }

      setMainBooking(prev => ({
        ...prev,
        adults: cartItem.adults || 1,
        children: cartItem.children || 0,
        date: parsedDate,
      }))
    }
  }, [cartItems, activity.slug])

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep)
    // Use both methods to ensure scroll works across all browsers/layouts
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }

  // Additional items from "You May Also Like"
  const [additionalItems, setAdditionalItems] = useState<BookingItem[]>([])

  // Form data
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    pickupLocation: '',
    specialRequests: '',
  })

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'later'>('later')

  // All booking items
  const allItems = [mainBooking, ...additionalItems]

  // Check if we're in custom note mode
  const isCustomNoteMode = activity.pricingType === 'custom_note'
  const customPricingNote = (activity as any).customPricingNote?.note || null

  // Calculate totals
  const total = useMemo(() => {
    return allItems.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }, [allItems])

  // Check if can proceed to next step
  const canProceed = () => {
    switch (currentStep) {
      case 0: // Your Booking - need a date selected
        return mainBooking.date !== null
      case 1: // Your Details - need contact info
        return formData.firstName && formData.email && formData.phone
      case 2: // You May Also Like - can skip
        return true
      case 3: // Review & Pay - need terms accepted
        return termsAccepted
      default:
        return false
    }
  }

  // Add activity from "You May Also Like"
  const addActivity = (activityToAdd: Activity, adults: number, children: number, date: Date | null) => {
    setAdditionalItems([
      ...additionalItems,
      {
        activity: activityToAdd,
        adults,
        children,
        date: date, // Use selected date from mini calendar
      },
    ])
  }

  // Remove additional item
  const removeAdditionalItem = (index: number) => {
    setAdditionalItems(additionalItems.filter((_, i) => i !== index))
  }

  // Check if activity is already added
  const isActivityAdded = (activityId: string | number) => {
    return additionalItems.some(item => String(item.activity.id) === String(activityId))
  }

  // Handle booking submission
  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // For card payment, we would integrate with Stripe here
      // For now, we only handle "pay later" (cash) flow
      if (paymentMethod === 'card') {
        // TODO: Integrate with Stripe checkout
        setSubmitError(t('onlinePaymentComingSoon'))
        setIsSubmitting(false)
        return
      }

      // Prepare items for the API
      const items = allItems.map((item) => ({
        type: 'activity' as const,
        id: item.activity.id,
        title: item.activity.title,
        image: getImageUrl(item.activity.featuredImage),
        price: calculateItemTotal(item),
        adults: item.adults,
        children: item.children,
        duration: item.activity.duration || undefined,
      }))

      // Get the primary booking date (from main booking)
      const bookingDate = mainBooking.date?.toISOString() || new Date().toISOString()

      // Call the create-booking API
      const requestBody = {
        items,
        date: bookingDate,
        guestDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          pickupLocation: formData.pickupLocation || undefined,
          specialRequests: formData.specialRequests || undefined,
        },
        totals: {
          activities: total,
          transport: 0,
          total: total,
        },
        payLater: true,
        locale,
      }

      const response = await fetch('/api/checkout/create-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      let data
      try {
        data = await response.json()
      } catch {
        console.error('Failed to parse response as JSON, status:', response.status)
        throw new Error(`Server error (${response.status}). Please try again.`)
      }

      if (!response.ok) {
        console.error('API error:', data)
        throw new Error(data.error || data.details || 'Failed to create booking')
      }

      // Prepare booking data for confirmation modal
      const bookingDataForConfirmation: ConfirmationBookingData = {
        ref: data.bookingReference,
        items: items.map((item) => ({
          type: item.type,
          title: item.title,
          image: item.image,
          price: item.price,
          adults: item.adults,
          children: item.children,
          duration: item.duration,
        })),
        date: bookingDate,
        guestDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        totals: {
          total: total,
        },
        paymentMethod: 'pay_later',
        isCustomNote: isCustomNoteMode,
        customPricingNote: isCustomNoteMode ? customPricingNote : undefined,
      }

      // Store in localStorage for the confirmation page
      localStorage.setItem('atlasmountainsvisit_booking', JSON.stringify(bookingDataForConfirmation))

      // Redirect to confirmation page
      router.push(`/${locale}/checkout/${activity.slug}/confirmation`)
    } catch (error) {
      console.error('Error creating booking:', error)
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9fb]">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <NavLink href="/" className="flex-shrink-0 flex items-center transition-opacity hover:opacity-80" aria-label="Atlas Mountain Visit">
              <Image
                src="https://ec0m9cwfe1.ufs.sh/f/qpHeSXPP9BvaKzrt0k7VSDfZeErsq601P9UkTjgm4NM57JQG"
                alt="Atlas Mountain Visit"
                width={160}
                height={48}
                priority
                className="h-10 w-auto object-contain"
              />
            </NavLink>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Shield className="w-4 h-4" style={{ color: ACCENT_GREEN }} />
              <span className="hidden sm:inline">{t('secureCheckout')}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-32">
        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} steps={steps} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Your Booking */}
              {currentStep === 0 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                    <h2 className="text-xl font-bold text-neutral-900 mb-6">{t('steps.yourBooking')}</h2>

                    {/* Activity Card */}
                    <div className="flex gap-4 mb-6 pb-6 border-b border-neutral-100">
                      <div className="relative w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={getImageUrl(activity.featuredImage)}
                          alt={activity.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${ACCENT_GREEN}15`, color: ACCENT_GREEN }}
                          >
                            {activity.duration || '1 Day'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-neutral-900 mb-1">{activity.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-neutral-500">
                          <MapPin className="w-3.5 h-3.5" />
                          {t('morocco')}
                        </div>
                      </div>
                      {!isCustomNoteMode && (
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color: ACCENT_GREEN }}>
                            €{getActivityPrice(activity, mainBooking.adults)}
                          </p>
                          <p className="text-xs text-neutral-500">{t('perPerson')}</p>
                        </div>
                      )}
                    </div>

                    {/* Guest Selector */}
                    <div className="mb-6">
                      <GuestSelector
                        adults={mainBooking.adults}
                        childrenCount={mainBooking.children}
                        onAdultsChange={(value) => setMainBooking({ ...mainBooking, adults: value })}
                        onChildrenChange={(value) => setMainBooking({ ...mainBooking, children: value })}
                      />
                    </div>

                    {/* Date Picker */}
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-3">{t('selectDate')}</h4>
                      <DatePicker
                        selectedDate={mainBooking.date}
                        onSelect={(date) => setMainBooking({ ...mainBooking, date })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: You May Also Like */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">{t('steps.youMayAlsoLike')}</h2>
                    <p className="text-neutral-600 mb-6">
                      {t('enhanceTrip')}
                    </p>

                    {relatedActivities.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {relatedActivities.map((relatedActivity) => (
                          <RelatedActivityCard
                            key={relatedActivity.id}
                            activity={relatedActivity}
                            onAdd={addActivity}
                            isAdded={isActivityAdded(relatedActivity.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-500">
                        <p>{t('noRelatedActivities')}</p>
                      </div>
                    )}

                    {additionalItems.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-neutral-100">
                        <h4 className="font-semibold text-neutral-900 mb-3">{t('addedToBooking')}</h4>
                        <div className="space-y-2">
                          {additionalItems.map((item, index) => (
                            <div
                              key={item.activity.id}
                              className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                  <Image
                                    src={getImageUrl(item.activity.featuredImage)}
                                    alt={item.activity.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-neutral-900 text-sm">{item.activity.title}</p>
                                  <p className="text-xs text-neutral-500">
                                    {item.adults} adult{item.adults > 1 ? 's' : ''}
                                    {item.children > 0 && `, ${item.children} child${item.children > 1 ? 'ren' : ''}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold" style={{ color: ACCENT_GREEN }}>
                                  €{calculateItemTotal(item)}
                                </span>
                                <button
                                  onClick={() => removeAdditionalItem(index)}
                                  className="p-1 hover:bg-neutral-200 rounded-full transition-colors"
                                >
                                  <X className="w-4 h-4 text-neutral-500" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Your Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                    <h2 className="text-xl font-bold text-neutral-900 mb-6">{t('steps.yourDetails')}</h2>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            {t('firstName')} *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                              placeholder="John"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            {t('lastName')} *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                              placeholder="Doe"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          {t('email')} *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          {t('phone')} *
                        </label>
                        <PhoneInput
                          value={formData.phone}
                          onChange={(value) => setFormData({ ...formData, phone: value })}
                          placeholder="600 000 000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          {t('pickupLocation')}
                        </label>
                        <LocationMapPicker
                          value={formData.pickupLocation}
                          onChange={(value) => setFormData({ ...formData, pickupLocation: value })}
                          placeholder={t('pickupLocationPlaceholder')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          {t('specialRequests')}
                        </label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
                          <textarea
                            value={formData.specialRequests}
                            onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                            rows={3}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none"
                            placeholder={t('specialRequestsPlaceholder')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review & Pay */}
              {currentStep === 3 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                    <h2 className="text-xl font-bold text-neutral-900 mb-6">{t('reviewBooking')}</h2>

                    {/* Booking Items */}
                    <div className="space-y-4 mb-6">
                      {allItems.map((item, index) => (
                        <div
                          key={`${item.activity.id}-${index}`}
                          className="flex gap-4 p-4 bg-neutral-50 rounded-xl"
                        >
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={getImageUrl(item.activity.featuredImage)}
                              alt={item.activity.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-neutral-900">{item.activity.title}</h4>
                            <p className="text-sm text-neutral-600">
                              {item.adults} adult{item.adults > 1 ? 's' : ''}
                              {item.children > 0 && `, ${item.children} child${item.children > 1 ? 'ren' : ''}`}
                            </p>
                            {item.date && (
                              <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(item.date)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold" style={{ color: ACCENT_GREEN }}>
                              €{calculateItemTotal(item)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Contact Info Summary */}
                    <div className="p-4 bg-neutral-50 rounded-xl mb-6">
                      <h4 className="font-semibold text-neutral-900 mb-2">{t('contactInfo')}</h4>
                      <p className="text-sm text-neutral-600">
                        {formData.firstName} {formData.lastName}
                      </p>
                      <p className="text-sm text-neutral-600">{formData.email}</p>
                      <p className="text-sm text-neutral-600">{formData.phone}</p>
                      {formData.pickupLocation && (
                        <p className="text-sm text-neutral-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {formData.pickupLocation}
                        </p>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-neutral-900 mb-3">{t('paymentMethod')}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={() => setPaymentMethod('later')}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            paymentMethod === 'later'
                              ? ''
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                          style={{
                            borderColor: paymentMethod === 'later' ? ACCENT_GREEN : undefined,
                            backgroundColor: paymentMethod === 'later' ? `${ACCENT_GREEN}08` : undefined,
                          }}
                        >
                          <Wallet className="w-6 h-6 mb-2" style={{ color: paymentMethod === 'later' ? ACCENT_GREEN : '#737373' }} />
                          <p className="font-semibold text-neutral-900">{t('payOnArrival')}</p>
                          <p className="text-sm text-neutral-500">{t('reserveNowPayLater')}</p>
                        </button>
                        <button
                          onClick={() => setPaymentMethod('card')}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            paymentMethod === 'card'
                              ? ''
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                          style={{
                            borderColor: paymentMethod === 'card' ? ACCENT_GREEN : undefined,
                            backgroundColor: paymentMethod === 'card' ? `${ACCENT_GREEN}08` : undefined,
                          }}
                        >
                          <CreditCard className="w-6 h-6 mb-2" style={{ color: paymentMethod === 'card' ? ACCENT_GREEN : '#737373' }} />
                          <p className="font-semibold text-neutral-900">{t('payNow')}</p>
                          <p className="text-sm text-neutral-500">{t('secureCardPayment')}</p>
                        </button>
                      </div>
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          termsAccepted ? 'border-transparent' : 'border-neutral-300'
                        }`}
                        style={{
                          backgroundColor: termsAccepted ? ACCENT_GREEN : undefined,
                        }}
                      >
                        {termsAccepted && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="sr-only"
                      />
                      <span className="text-sm text-neutral-600">
                        {t('termsAgreement')}{' '}
                        <NavLink href="/terms" className="underline" style={{ color: ACCENT_GREEN }}>
                          {t('termsAndConditions')}
                        </NavLink>{' '}
                        {t('and')}{' '}
                        <NavLink href="/privacy" className="underline" style={{ color: ACCENT_GREEN }}>
                          {t('privacyPolicy')}
                        </NavLink>
                      </span>
                    </label>

                    {/* Error message */}
                    {submitError && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-700">{submitError}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 sticky top-24">
              <h3 className="font-bold text-neutral-900 mb-4">{t('orderSummary')}</h3>

              {isCustomNoteMode && customPricingNote && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">{customPricingNote}</p>
                </div>
              )}

              <div className="space-y-4 mb-4 pb-4 border-b border-neutral-100">
                {allItems.map((item, index) => (
                  <div key={`summary-${item.activity.id}-${index}`} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-neutral-900 line-clamp-1 flex-1 mr-2">
                        {item.activity.title}
                      </span>
                      {!isCustomNoteMode && (
                        <span className="text-sm font-semibold" style={{ color: ACCENT_GREEN }}>€{calculateItemTotal(item)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span>{item.adults} {t('adult')}{item.adults > 1 ? 's' : ''}</span>
                      {item.children > 0 && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-neutral-300" />
                          <span>{item.children} {t('child')}{item.children > 1 ? 'ren' : ''}</span>
                        </>
                      )}
                      {item.date && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-neutral-300" />
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.date.toLocaleDateString(intlLocale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!isCustomNoteMode && (
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-neutral-900">{t('total')}</span>
                  <span className="text-2xl font-bold" style={{ color: ACCENT_GREEN }}>
                    €{total}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Navigation Bar - Both Mobile & Desktop */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {!isCustomNoteMode && (
            <div className="hidden sm:block">
              <p className="text-sm text-neutral-500">{t('total')}</p>
              <p className="text-xl font-bold" style={{ color: ACCENT_GREEN }}>€{total}</p>
            </div>
          )}
          <div className="flex gap-3 w-full sm:w-auto">
            {currentStep > 0 && (
              <button
                onClick={() => handleStepChange(currentStep - 1)}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-neutral-300 font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 inline mr-1" />
                {t('back')}
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => handleStepChange(currentStep + 1)}
                disabled={!canProceed()}
                className="flex-1 sm:flex-none px-8 py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ backgroundColor: ACCENT_GREEN }}
              >
                {t('continue')}
                <ChevronRight className="w-5 h-5 inline ml-1" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="flex-1 sm:flex-none px-8 py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ backgroundColor: ACCENT_GREEN }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                    {t('processing')}
                  </>
                ) : paymentMethod === 'later' ? (
                  t('completeBooking')
                ) : (
                  t('payNow')
                )}
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
