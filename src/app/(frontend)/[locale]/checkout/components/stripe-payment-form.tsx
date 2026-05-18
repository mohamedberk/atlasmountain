'use client'

import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Shield, Loader2 } from 'lucide-react'

interface StripePaymentFormProps {
  total: number
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
}

export function StripePaymentForm({
  total,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation`,
        },
        redirect: 'if_required',
      })

      if (error) {
        // Payment failed
        setErrorMessage(error.message || 'Payment failed. Please try again.')
        onError(error.message || 'Payment failed')
      } else if (paymentIntent) {
        // Payment succeeded
        if (paymentIntent.status === 'succeeded') {
          onSuccess(paymentIntent.id)
        } else if (paymentIntent.status === 'processing') {
          // Payment is processing
          onSuccess(paymentIntent.id)
        } else if (paymentIntent.status === 'requires_action') {
          // 3D Secure or other action required - Stripe handles this automatically
          setErrorMessage('Additional authentication required. Please follow the prompts.')
        } else {
          setErrorMessage('Payment status: ' + paymentIntent.status)
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setErrorMessage(message)
      onError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
          }}
        />
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 sm:h-14 bg-[#1a1a1a] text-white font-medium rounded-xl shadow-sm hover:shadow-md hover:bg-[#2d2d2d] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            Pay €{total.toFixed(2)}
          </>
        )}
      </button>

      <p className="text-center text-xs text-neutral-500 flex items-center justify-center gap-1">
        <Shield className="w-3.5 h-3.5" />
        Secured by Stripe - 256-bit SSL encryption
      </p>
    </form>
  )
}
