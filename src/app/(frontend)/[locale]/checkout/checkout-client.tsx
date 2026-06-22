'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Shield } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import Image from 'next/image'
import { toast, Toaster } from 'sonner'
import { useCart, ActivityCartItem } from '@/context/CartContext'
import { ActivityDetailModal, ActivityInfo } from '@/components/ui/activity-detail-modal'
import {
  CheckoutStep,
  UpsellActivity,
  FormData,
  getItemTitle,
  getItemImage,
  getItemPrice,
  isValidEmail,
  CartStep,
  GuestsStep,
  ScheduleStep,
  DetailsStep,
  PaymentStep,
  UpsellStep,
  Sidebar,
  MobileSummary,
  EmptyCart,
  StepNavigation,
} from './components'

// Prefetch cache - starts loading immediately when module is imported
const prefetchCache = {
  activities: { data: null as any[] | null, promise: null as Promise<any[]> | null, locale: null as string | null },
}

// Start prefetching for a locale
function prefetchData(locale: string) {
  // Prefetch activities if not already fetching for this locale
  if (prefetchCache.activities.locale !== locale) {
    prefetchCache.activities.locale = locale
    prefetchCache.activities.data = null
    prefetchCache.activities.promise = fetch(`/api/frontend/activities?locale=${locale}&limit=50`)
      .then(res => res.ok ? res.json() : { docs: [] })
      .then(data => {
        const docs = data.docs || []
        prefetchCache.activities.data = docs
        return docs
      })
      .catch(() => {
        prefetchCache.activities.data = []
        return [] as any[]
      })
  }

}

export function CheckoutClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const tClient = useTranslations('checkoutClient')
  const tCommon = useTranslations('common')

  const {
    items, removeItem, updateItem, clearCart, getTotal,
    getActivityTotal, getTransportTotal, hasActivities, hasTransport,
    guestDetails, setGuestDetails, addItem,
  } = useCart()

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const STEPS: CheckoutStep[] = ['cart', 'upsell', 'guests', 'schedule', 'details', 'payment']

  // Data states
  const [allActivities, setAllActivities] = useState<UpsellActivity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)
  const [urlProcessed, setUrlProcessed] = useState(false)
  const urlProcessingRef = useRef(false)
  const isNavigatingAwayRef = useRef(false)
  const [upsellActivities, setUpsellActivities] = useState<UpsellActivity[]>([])
  const [selectedActivity, setSelectedActivity] = useState<UpsellActivity | null>(null)

  const [formData, setFormData] = useState<FormData>({
    firstName: guestDetails.firstName || '',
    lastName: guestDetails.lastName || '',
    email: guestDetails.email || '',
    phone: guestDetails.phone || '',
    country: guestDetails.country || '',
    pickupLocation: guestDetails.pickupLocation || '',
    specialRequests: guestDetails.specialRequests || '',
  })

  const currentStepIndex = STEPS.indexOf(currentStep)

  // Map activity data helper
  const mapActivityData = useCallback((a: any): UpsellActivity => ({
    id: String(a.id),
    title: a.title,
    price: (a.pricingType === 'tiered' && a.tieredPricing?.tiers && a.tieredPricing.tiers.length > 0)
      ? Math.min(...a.tieredPricing.tiers.map((tier: any) => tier.pricePerPerson || 0))
      : (a.privatePricing?.basePrice || 0),
    childPrice: (a.pricingType === 'tiered' && a.tieredPricing?.childPrice) ? a.tieredPricing.childPrice : 0,
    image: typeof a.featuredImage === 'string' ? a.featuredImage : a.featuredImage?.url || '/placeholder-activity.jpg',
    duration: a.duration || '',
    slug: a.slug,
    shortDescription: a.shortDescription || '',
    location: typeof a.location === 'string' ? a.location : a.location?.name || tCommon('morocco'),
    highlights: (a.highlights || []).map((h: any) => h.highlight || '').filter(Boolean),
    included: (a.included || []).map((i: any) => i.item || '').filter(Boolean),
    rating: a.rating || 4.8,
    reviewCount: a.reviewCount || 0,
    // Category info
    categoryId: typeof a.category === 'object' ? a.category?.id : a.category,
    categoryName: typeof a.category === 'object' ? a.category?.name : undefined,
    categorySlug: typeof a.category === 'object' ? a.category?.slug : undefined,
    // Pricing type info
    pricingType: a.pricingType || 'tiered',
    // Private pricing details
    privateBasePrice: a.privatePricing?.basePrice,
    privateMinGuests: a.privatePricing?.minGuests,
    privateMaxGuests: a.privatePricing?.maxGuests,
    privateAdditionalGuestPrice: a.privatePricing?.additionalGuestPrice,
  }), [tCommon])

  // Start prefetching immediately when locale is known
  useEffect(() => {
    prefetchData(locale)
  }, [locale])

  // Use prefetched data or wait for it
  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      // Start prefetch if not already started
      prefetchData(locale)

      try {
        // If data is already cached, use it immediately
        if (prefetchCache.activities.data && prefetchCache.activities.locale === locale) {
          setAllActivities(prefetchCache.activities.data.map(mapActivityData))
        } else if (prefetchCache.activities.promise) {
          // Wait for in-progress fetch
          const activitiesData = await prefetchCache.activities.promise
          if (!cancelled) {
            setAllActivities(activitiesData.map(mapActivityData))
          }
        }

      } catch (error) {
        console.error('Error loading prefetched data:', error)
      } finally {
        if (!cancelled) {
          setIsLoadingActivities(false)
        }
      }
    }

    loadData()

    return () => { cancelled = true }
  }, [locale, mapActivityData])

  // Process URL params
  useEffect(() => {
    if (urlProcessingRef.current || urlProcessed) return
    if (allActivities.length === 0) return

    const activitiesParam = searchParams.get('activities')

    if (activitiesParam && allActivities.length > 0) {
      urlProcessingRef.current = true
      activitiesParam.split(',').filter(Boolean).forEach(slug => {
        const activity = allActivities.find(a => a.slug === slug)
        if (activity && !items.some(i => i.type === 'activity' && (i as ActivityCartItem).slug === slug)) {
          // Determine default pricing type based on activity
          const defaultPricingType = activity.pricingType === 'fixed' ? 'private' : 'per_person'
          const isPrivate = defaultPricingType === 'private'
          addItem({
            type: 'activity',
            id: activity.id,
            slug: activity.slug,
            title: activity.title,
            image: activity.image,
            price: isPrivate ? (activity.privateBasePrice || activity.price) : activity.price,
            childPrice: isPrivate ? 0 : activity.childPrice,
            duration: activity.duration,
            adults: 1,
            children: 0,
            date: '',
            pricingType: defaultPricingType,
            // Include full pricing details
            privateBasePrice: activity.privateBasePrice,
            privateMinGuests: activity.privateMinGuests,
            privateMaxGuests: activity.privateMaxGuests,
            privateAdditionalGuestPrice: activity.privateAdditionalGuestPrice,
            groupMinSize: activity.groupMinSize,
            groupMaxSize: activity.groupMaxSize,
          })
        }
      })
      setUrlProcessed(true)
    } else if (!activitiesParam) {
      setUrlProcessed(true)
    }
  }, [searchParams, allActivities, items, addItem, urlProcessed])

  // Sync URL with cart
  useEffect(() => {
    if (!urlProcessed || isNavigatingAwayRef.current) return
    const activitySlugs = items.filter((i): i is ActivityCartItem => i.type === 'activity').map(i => i.slug).filter(Boolean)
    const params = new URLSearchParams()
    if (activitySlugs.length > 0) params.set('activities', activitySlugs.join(','))
    const hasParams = activitySlugs.length > 0
    const newUrl = hasParams ? `${pathname}?${params.toString()}` : pathname
    const currentActivities = searchParams.get('activities') || ''
    if (currentActivities !== activitySlugs.join(',')) {
      router.replace(newUrl, { scroll: false })
    }
  }, [items, urlProcessed, pathname, router, searchParams])

  // Update upsell activities
  useEffect(() => {
    if (allActivities.length === 0) return
    setUpsellActivities(allActivities.filter(a => !items.some(i => i.id === a.id)))
  }, [allActivities, items])

  // Navigation
  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Validation
  const canContinue = (): boolean => {
    switch (currentStep) {
      case 'cart': return items.length > 0
      case 'upsell': case 'guests': return true
      case 'schedule': return selectedDate !== null
      case 'details': return !!(formData.firstName && formData.email && formData.phone && isValidEmail(formData.email))
      case 'payment': return termsAccepted
      default: return false
    }
  }

  // Guest updates
  const updateActivityGuests = (id: string, field: 'adults' | 'children', delta: number) => {
    const item = items.find(i => i.id === id && i.type === 'activity') as ActivityCartItem
    if (item) updateItem(id, 'activity', { [field]: Math.max(field === 'adults' ? 1 : 0, item[field] + delta) })
  }
  // Activity modal handlers
  const handleAddFromModal = (activity: UpsellActivity, adults: number, children: number) => {
    const defaultPricingType = activity.pricingType === 'fixed' ? 'private' : 'per_person'
    const isPrivate = defaultPricingType === 'private'
    addItem({
      type: 'activity',
      id: activity.id,
      slug: activity.slug,
      title: activity.title,
      image: activity.image,
      price: isPrivate ? (activity.privateBasePrice || activity.price) : activity.price,
      childPrice: isPrivate ? 0 : activity.childPrice,
      duration: activity.duration,
      adults,
      children,
      date: '',
      pricingType: defaultPricingType,
      privateBasePrice: activity.privateBasePrice,
      privateMinGuests: activity.privateMinGuests,
      privateMaxGuests: activity.privateMaxGuests,
      privateAdditionalGuestPrice: activity.privateAdditionalGuestPrice,
      groupMinSize: activity.groupMinSize,
      groupMaxSize: activity.groupMaxSize,
    })
    toast.success(tClient('addedToBooking', { title: activity.title }))
    setSelectedActivity(null)
  }

  const addUpsellActivity = (activity: UpsellActivity) => {
    const defaultPricingType = activity.pricingType === 'fixed' ? 'private' : 'per_person'
    const isPrivate = defaultPricingType === 'private'
    addItem({
      type: 'activity',
      id: activity.id,
      slug: activity.slug,
      title: activity.title,
      image: activity.image,
      price: isPrivate ? (activity.privateBasePrice || activity.price) : activity.price,
      childPrice: isPrivate ? 0 : activity.childPrice,
      duration: activity.duration,
      adults: 1,
      children: 0,
      date: '',
      pricingType: defaultPricingType,
      privateBasePrice: activity.privateBasePrice,
      privateMinGuests: activity.privateMinGuests,
      privateMaxGuests: activity.privateMaxGuests,
      privateAdditionalGuestPrice: activity.privateAdditionalGuestPrice,
      groupMinSize: activity.groupMinSize,
      groupMaxSize: activity.groupMaxSize,
    })
    toast.success(tClient('addedToBooking', { title: activity.title }))
  }

  // Handle payment success
  const handlePaymentSuccess = (bookingRef: string, paymentMethod: string) => {
    // Store booking data for confirmation page
    const bookingData = {
      ref: bookingRef,
      items: items.map(item => ({
        type: item.type, id: item.id, title: getItemTitle(item), image: getItemImage(item), price: getItemPrice(item),
        ...(item.type === 'activity' ? { adults: (item as ActivityCartItem).adults, children: (item as ActivityCartItem).children, duration: (item as ActivityCartItem).duration } : {}),
      })),
      date: selectedDate?.toISOString(),
      guestDetails: formData,
      totals: { activities: getActivityTotal(), transport: getTransportTotal(), total: getTotal() },
      paymentMethod,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('atlasmountainsvisit_booking', JSON.stringify(bookingData))
    setGuestDetails({ ...formData, pickupLocation: formData.pickupLocation, specialRequests: formData.specialRequests })

    // Show appropriate toast based on payment method
    if (paymentMethod === 'pay_later') {
      toast.success(tClient('bookingReserved'))
    } else {
      toast.success(tClient('paymentSuccessful'))
    }
    setTimeout(() => {
      isNavigatingAwayRef.current = true
      clearCart()
      router.push(`/${locale}/confirmation?ref=${bookingRef}`)
    }, 1500)
  }

  // Handle payment error
  const handlePaymentError = (error: string) => {
    toast.error(error)
    setIsSubmitting(false)
  }

  // Empty cart view
  if (items.length === 0 && currentStep === 'cart') {
    return (
      <>
        <Toaster position="top-center" richColors />
        <ActivityDetailModal activity={selectedActivity} isOpen={!!selectedActivity} onClose={() => setSelectedActivity(null)} onAdd={handleAddFromModal} mode="add" locale={locale} />
        <EmptyCart activities={allActivities} isLoading={isLoadingActivities} onOpenActivityModal={setSelectedActivity} onAddActivity={addUpsellActivity} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f9fb]">
      <Toaster position="top-center" richColors />
      <ActivityDetailModal activity={selectedActivity} isOpen={!!selectedActivity} onClose={() => setSelectedActivity(null)} onAdd={handleAddFromModal} mode="add" locale={locale} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
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
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-500 hidden sm:inline">{tClient('secureCheckout')}</span>
              <Shield className="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 order-1">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 p-4 sm:p-6 md:p-8">
              <AnimatePresence mode="wait">
                {currentStep === 'cart' && <CartStep items={items} onRemoveItem={removeItem} />}
                {currentStep === 'upsell' && <UpsellStep activities={upsellActivities} isLoading={false} onSkip={nextStep} onOpenModal={setSelectedActivity} onQuickAdd={addUpsellActivity} />}
                {currentStep === 'guests' && <GuestsStep items={items} onUpdateActivityGuests={updateActivityGuests} />}
                {currentStep === 'schedule' && <ScheduleStep selectedDate={selectedDate} onDateSelect={setSelectedDate} />}
                {currentStep === 'details' && <DetailsStep formData={formData} onFormChange={setFormData} />}
                {currentStep === 'payment' && <PaymentStep items={items} selectedDate={selectedDate} total={getTotal()} termsAccepted={termsAccepted} isSubmitting={isSubmitting} guestDetails={formData} onTermsChange={setTermsAccepted} onSuccess={handlePaymentSuccess} onError={handlePaymentError} />}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="lg:col-span-1 order-2 hidden lg:block">
            <Sidebar items={items} selectedDate={selectedDate} hasActivities={hasActivities} hasTransport={hasTransport} activityTotal={getActivityTotal()} transportTotal={getTransportTotal()} total={getTotal()} />
          </div>

          {/* Mobile Summary */}
          <div className="order-2">
            <MobileSummary total={getTotal()} itemCount={items.length} selectedDate={selectedDate} />
          </div>
        </div>
      </main>

      <StepNavigation steps={STEPS} currentStep={currentStep} currentStepIndex={currentStepIndex} total={getTotal()} canContinue={canContinue()} onPrev={prevStep} onNext={nextStep} />
    </div>
  )
}
