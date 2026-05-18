'use client'

import { useState } from 'react'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { Loader2, Shield } from 'lucide-react'

interface PayPalPaymentFormProps {
  items: any[]
  date: string
  guestDetails: {
    firstName: string
    lastName: string
    email: string
    phone: string
    country?: string
    pickupLocation?: string
    specialRequests?: string
  }
  totals: {
    activities: number
    transport: number
    total: number
  }
  locale: string
  onSuccess: (bookingReference: string) => void
  onError: (error: string) => void
}

export function PayPalPaymentForm({
  items,
  date,
  guestDetails,
  totals,
  locale,
  onSuccess,
  onError,
}: PayPalPaymentFormProps) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer()
  const [isProcessing, setIsProcessing] = useState(false)

  const createOrder = async (): Promise<string> => {
    try {
      const response = await fetch('/api/checkout/create-paypal-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          guestDetails,
          locale,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create PayPal order')
      }

      const data = await response.json()
      return data.orderId
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create order'
      onError(message)
      throw error
    }
  }

  const onApprove = async (data: { orderID: string }): Promise<void> => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/checkout/capture-paypal-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.orderID }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to capture payment')
      }

      const captureData = await response.json()

      if (captureData.status === 'COMPLETED') {
        onSuccess(captureData.bookingNumber)
      } else {
        throw new Error('Payment was not completed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed'
      onError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleError = (err: Record<string, unknown>) => {
    console.error('PayPal error:', err)
    onError('PayPal payment failed. Please try again.')
  }

  const handleCancel = () => {
    onError('Payment was cancelled')
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (isRejected) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        Failed to load PayPal. Please refresh the page or try a different payment method.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {isProcessing && (
        <div className="flex items-center justify-center py-4 bg-neutral-50 rounded-lg">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-600 mr-2" />
          <span className="text-neutral-600">Processing payment...</span>
        </div>
      )}

      <div className={isProcessing ? 'opacity-50 pointer-events-none' : ''}>
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'black',
            shape: 'rect',
            label: 'pay',
            height: 50,
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={handleError}
          onCancel={handleCancel}
          disabled={isProcessing}
        />
      </div>

      <p className="text-center text-xs text-neutral-500 flex items-center justify-center gap-1">
        <Shield className="w-3.5 h-3.5" />
        Secured by PayPal - Buyer Protection
      </p>
    </div>
  )
}
