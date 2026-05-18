'use client'

import { memo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Calendar, Shield, Loader2, Clock } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { format } from 'date-fns'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import type { CartItem, ActivityCartItem } from '@/context/CartContext'
import { NavLink } from '@/components/ui/nav-link'
import { getItemTitle, getItemPrice } from './checkout-types'
import { StripePaymentForm } from './stripe-payment-form'
import { PayPalPaymentForm } from './paypal-payment-form'

// Lazy load Stripe only when needed (not for Pay Later)
let stripePromise: Promise<Stripe | null> | null = null
const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (key) {
      stripePromise = loadStripe(key)
    }
  }
  return stripePromise
}

type PaymentMethod = 'stripe' | 'paypal' | 'pay_later'

// Stripe Icon SVG
function StripeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M60 12.8C60 8.5 57.9 5 53.7 5C49.5 5 47 8.5 47 12.8C47 17.8 50 20.5 54.2 20.5C56.3 20.5 57.9 20 59.1 19.3V15.8C57.9 16.5 56.5 16.9 54.8 16.9C53.1 16.9 51.6 16.3 51.4 14.3H59.9C59.9 14.1 60 13.3 60 12.8ZM51.3 11.3C51.3 9.4 52.5 8.5 53.7 8.5C54.9 8.5 56 9.4 56 11.3H51.3ZM40.7 5C39 5 37.9 5.8 37.3 6.4L37.1 5.2H33.3V25L37.6 24.1V19.5C38.2 19.9 39.1 20.5 40.6 20.5C43.7 20.5 46.5 18 46.5 12.6C46.5 7.7 43.6 5 40.7 5ZM39.7 16.7C38.6 16.7 38 16.3 37.6 15.8V9.8C38 9.2 38.7 8.8 39.7 8.8C41.4 8.8 42.5 10.6 42.5 12.7C42.5 14.9 41.4 16.7 39.7 16.7ZM27.8 4.1L32.1 3.2V0L27.8 0.9V4.1ZM32.1 5.2H27.8V20.2H32.1V5.2ZM23.5 6.5L23.2 5.2H19.5V20.2H23.8V10C24.7 8.8 26.3 9.1 26.8 9.2V5.2C26.2 5 24.4 4.7 23.5 6.5ZM15 1.8L10.8 2.7L10.8 16.1C10.8 18.7 12.7 20.5 15.3 20.5C16.7 20.5 17.8 20.3 18.4 19.9V16.4C17.9 16.6 15 17.4 15 14.8V9H18.4V5.2H15V1.8ZM4.3 9.9C4.3 9.2 4.9 8.9 5.8 8.9C7.1 8.9 8.7 9.3 10 10V5.9C8.6 5.3 7.2 5.1 5.8 5.1C2.3 5.1 0 6.9 0 10.1C0 15.1 6.9 14.3 6.9 16.5C6.9 17.3 6.2 17.6 5.2 17.6C3.8 17.6 2 17 0.6 16.2V20.4C2.2 21.1 3.8 21.4 5.2 21.4C8.8 21.4 11.3 19.7 11.3 16.4C11.3 11 4.3 12 4.3 9.9Z" fill="currentColor"/>
    </svg>
  )
}

// PayPal Icon SVG - Official double P logo
function PayPalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.217a.775.775 0 0 1 .765-.654h6.14c2.04 0 3.596.491 4.625 1.46.962.903 1.375 2.176 1.226 3.783-.016.168-.038.339-.066.513-.432 2.793-2.307 4.527-5.093 4.71h-1.638a.771.771 0 0 0-.762.654l-.776 4.916-.212 1.345a.641.641 0 0 1-.633.74l-.444.001z" fill="#003087"/>
      <path d="M19.66 7.953c-.018.156-.04.316-.066.479-.784 4.046-3.466 5.448-6.893 5.448H11.02a.85.85 0 0 0-.839.72l-.88 5.58-.25 1.58a.446.446 0 0 0 .44.518h3.09a.745.745 0 0 0 .736-.63l.03-.157.583-3.694.037-.204a.745.745 0 0 1 .736-.63h.464c3.002 0 5.353-1.22 6.04-4.748.287-1.474.138-2.705-.62-3.57a2.96 2.96 0 0 0-.927-.692z" fill="#0070E0"/>
      <path d="M18.627 7.527a5.58 5.58 0 0 0-.687-.152 8.67 8.67 0 0 0-1.38-.101h-4.188a.745.745 0 0 0-.736.63l-.889 5.636-.026.165a.85.85 0 0 1 .84-.72h1.682c3.427 0 6.11-1.402 6.893-5.448.023-.12.044-.238.062-.354a3.694 3.694 0 0 0-1.571-.656z" fill="#003087"/>
    </svg>
  )
}

interface PaymentStepProps {
  items: CartItem[]
  selectedDate: Date | null
  total: number
  termsAccepted: boolean
  isSubmitting: boolean
  guestDetails: {
    firstName: string
    lastName: string
    email: string
    phone: string
    country?: string
    pickupLocation?: string
    specialRequests?: string
  }
  onTermsChange: (accepted: boolean) => void
  onSuccess: (bookingReference: string, paymentMethod: string) => void
  onError: (error: string) => void
}

export const PaymentStep = memo(function PaymentStep({
  items,
  selectedDate,
  total,
  termsAccepted,
  isSubmitting,
  guestDetails,
  onTermsChange,
  onSuccess,
  onError,
}: PaymentStepProps) {
  const t = useTranslations('checkout')
  const tCommon = useTranslations('common')
  const tPayment = useTranslations('paymentStep')
  const tCheckoutFlow = useTranslations('checkoutFlow')
  const locale = useLocale()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  const [isLoadingIntent, setIsLoadingIntent] = useState(false)
  const [intentError, setIntentError] = useState<string | null>(null)
  const [isProcessingPayLater, setIsProcessingPayLater] = useState(false)

  // Get totals
  const activityTotal = items
    .filter((i): i is ActivityCartItem => i.type === 'activity')
    .reduce((sum, item) => sum + (item.price * item.adults + (item.childPrice || 0) * item.children), 0)
  const transportTotal = items
    .filter((i) => i.type === 'transport')
    .reduce((sum, item) => sum + getItemPrice(item), 0)

  // Create payment intent when user selects Stripe and accepts terms
  useEffect(() => {
    if (paymentMethod === 'stripe' && termsAccepted && !clientSecret && selectedDate) {
      createPaymentIntent()
    }
  }, [paymentMethod, termsAccepted, selectedDate])

  const createPaymentIntent = async () => {
    if (!selectedDate) return

    setIsLoadingIntent(true)
    setIntentError(null)

    try {
      const response = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            type: item.type,
            id: item.id,
            title: getItemTitle(item),
            price: getItemPrice(item),
            adults: 'adults' in item ? item.adults : undefined,
            children: 'children' in item ? item.children : undefined,
            duration: 'duration' in item ? item.duration : undefined,
          })),
          date: selectedDate.toISOString(),
          guestDetails,
          totals: {
            activities: activityTotal,
            transport: transportTotal,
            total,
          },
          locale,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to initialize payment')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
      setBookingReference(data.bookingReference)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize payment'
      setIntentError(message)
      onError(message)
    } finally {
      setIsLoadingIntent(false)
    }
  }

  const handleStripeSuccess = (paymentIntentId: string) => {
    if (bookingReference) {
      onSuccess(bookingReference, 'stripe')
    }
  }

  const handlePayPalSuccess = (ref: string) => {
    onSuccess(ref, 'paypal')
  }

  const handlePaymentError = (error: string) => {
    onError(error)
  }

  // Handle Pay Later - creates booking without payment
  const handlePayLater = async () => {
    if (!selectedDate) {
      onError('Please select a date')
      return
    }

    setIsProcessingPayLater(true)

    try {
      const response = await fetch('/api/checkout/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            type: item.type,
            id: item.id,
            title: getItemTitle(item),
            price: getItemPrice(item),
            adults: 'adults' in item ? item.adults : undefined,
            children: 'children' in item ? item.children : undefined,
            duration: 'duration' in item ? item.duration : undefined,
          })),
          date: selectedDate.toISOString(),
          guestDetails,
          totals: {
            activities: activityTotal,
            transport: transportTotal,
            total,
          },
          payLater: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create booking')
      }

      const data = await response.json()
      onSuccess(data.bookingReference, 'pay_later')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create booking'
      onError(message)
    } finally {
      setIsProcessingPayLater(false)
    }
  }

  // PayPal options
  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    currency: 'EUR',
    intent: 'capture' as const,
  }

  // Stripe appearance
  const stripeAppearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#1a1a1a',
      colorBackground: '#ffffff',
      colorText: '#1a1a1a',
      colorDanger: '#dc2626',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  }

  return (
    <motion.div
      key="payment"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        <h1 className="text-xl sm:text-2xl font-display font-bold text-neutral-900">
          {t('payment.title')}
        </h1>
      </div>

      {/* Order Summary */}
      <div className="bg-neutral-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="font-medium text-neutral-900 mb-4">{tPayment('orderSummary')}</h3>

        {selectedDate && (
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
            <Calendar className="w-4 h-4" />
            <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
          </div>
        )}

        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex justify-between text-sm">
              <span className="text-neutral-600">{getItemTitle(item)}</span>
              <span className="font-medium">{getItemPrice(item).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-200 pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>{tCommon('total')}</span>
            <span className="text-secondary">{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <h3 className="font-medium text-neutral-900 mb-3">{tPayment('selectPaymentMethod')}</h3>
        <div className="space-y-3">
          {/* Stripe Option */}
          <button
            type="button"
            onClick={() => setPaymentMethod('stripe')}
            className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
              paymentMethod === 'stripe'
                ? 'border-[#1a1a1a] bg-neutral-50'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className="w-14 h-9 bg-[#635bff] rounded-lg flex items-center justify-center flex-shrink-0 p-2">
              <StripeIcon className="w-full h-full text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-neutral-900">{t('payment.stripe')}</p>
              <p className="text-xs text-neutral-500">{t('payment.stripeDescription')}</p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                paymentMethod === 'stripe' ? 'border-[#1a1a1a] bg-[#1a1a1a]' : 'border-neutral-300'
              }`}
            >
              {paymentMethod === 'stripe' && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </button>

          {/* PayPal Option */}
          <button
            type="button"
            onClick={() => setPaymentMethod('paypal')}
            className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
              paymentMethod === 'paypal'
                ? 'border-[#1a1a1a] bg-neutral-50'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className="w-14 h-9 bg-white border border-neutral-200 rounded-lg flex items-center justify-center flex-shrink-0 p-1.5">
              <PayPalIcon className="w-full h-full" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-neutral-900">{t('payment.paypal')}</p>
              <p className="text-xs text-neutral-500">{t('payment.paypalDescription')}</p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                paymentMethod === 'paypal' ? 'border-[#1a1a1a] bg-[#1a1a1a]' : 'border-neutral-300'
              }`}
            >
              {paymentMethod === 'paypal' && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </button>

          {/* Pay Later Option */}
          <button
            type="button"
            onClick={() => setPaymentMethod('pay_later')}
            className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
              paymentMethod === 'pay_later'
                ? 'border-[#1a1a1a] bg-neutral-50'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className="w-14 h-9 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-neutral-600" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-neutral-900">{tPayment('payLater')}</p>
              <p className="text-xs text-neutral-500">{tPayment('payLaterDescription')}</p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                paymentMethod === 'pay_later' ? 'border-[#1a1a1a] bg-[#1a1a1a]' : 'border-neutral-300'
              }`}
            >
              {paymentMethod === 'pay_later' && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => onTermsChange(e.target.checked)}
          className="w-5 h-5 rounded border-neutral-300 text-[#1a1a1a] focus:ring-[#1a1a1a] mt-0.5 flex-shrink-0"
        />
        <span className="text-sm text-neutral-600">
          {tPayment('agreeToThe')}{' '}
          <NavLink href="/terms" className="text-[#1a1a1a] underline">
            {tCheckoutFlow('termsAndConditions')}
          </NavLink>{' '}
          {tCheckoutFlow('and')}{' '}
          <NavLink href="/privacy" className="text-[#1a1a1a] underline">
            {tCheckoutFlow('privacyPolicy')}
          </NavLink>
        </span>
      </label>

      {/* Payment Form */}
      {termsAccepted && (
        <div className="mt-6">
          {paymentMethod === 'stripe' && (
            <>
              {isLoadingIntent && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                  <span className="ml-3 text-neutral-600">{tPayment('initializingPayment')}</span>
                </div>
              )}

              {intentError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-700">{intentError}</p>
                  <button
                    onClick={createPaymentIntent}
                    className="mt-2 text-sm text-red-700 underline"
                  >
                    {tCommon('tryAgain')}
                  </button>
                </div>
              )}

              {clientSecret && getStripe() && (
                <Elements
                  stripe={getStripe()}
                  options={{
                    clientSecret,
                    appearance: stripeAppearance,
                  }}
                >
                  <StripePaymentForm
                    total={total}
                    onSuccess={handleStripeSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              )}
            </>
          )}

          {paymentMethod === 'paypal' && (
            <PayPalScriptProvider options={paypalOptions}>
              <PayPalPaymentForm
                items={items.map((item) => ({
                  type: item.type,
                  id: item.id,
                  title: getItemTitle(item),
                  price: getItemPrice(item),
                  adults: 'adults' in item ? item.adults : undefined,
                  children: 'children' in item ? item.children : undefined,
                }))}
                date={selectedDate?.toISOString() || ''}
                guestDetails={guestDetails}
                totals={{
                  activities: activityTotal,
                  transport: transportTotal,
                  total,
                }}
                locale={locale}
                onSuccess={handlePayPalSuccess}
                onError={handlePaymentError}
              />
            </PayPalScriptProvider>
          )}

          {paymentMethod === 'pay_later' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>{tPayment('payLater')}:</strong> {tPayment('payLaterInfo')}
                </p>
              </div>
              <button
                onClick={handlePayLater}
                disabled={isProcessingPayLater}
                className="w-full h-12 sm:h-14 bg-[#1a1a1a] text-white font-medium rounded-xl shadow-sm hover:shadow-md hover:bg-[#2d2d2d] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isProcessingPayLater ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {tCommon('processing')}
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5" />
                    {tPayment('reserveBookingPayLater')}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {!termsAccepted && (
        <div className="bg-neutral-100 rounded-xl p-6 text-center">
          <Shield className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-neutral-600 text-sm">
            {tPayment('acceptTerms')}
          </p>
        </div>
      )}
    </motion.div>
  )
})
