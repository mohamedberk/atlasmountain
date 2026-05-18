import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import config from '@payload-config'

// Lazy initialization to avoid build-time errors when env vars are not available
function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-12-15.clover',
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'STRIPE_WEBHOOK_SECRET is not configured' },
        { status: 500 }
      )
    }

    let event: Stripe.Event

    try {
      event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.payment_status === 'paid') {
          const bookingId = session.metadata?.bookingId

          if (bookingId) {
            // Update booking status
            await payload.update({
              collection: 'bookings',
              id: bookingId,
              data: {
                status: 'confirmed',
                payment: {
                  status: 'paid',
                  method: 'stripe',
                  stripePaymentIntentId: session.payment_intent as string,
                  paidAt: new Date().toISOString(),
                },
              },
            })

            console.log(`Booking ${bookingId} confirmed and paid`)
          }
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const bookingId = session.metadata?.bookingId

        if (bookingId) {
          // Update booking status to cancelled
          await payload.update({
            collection: 'bookings',
            id: bookingId,
            data: {
              status: 'cancelled',
              payment: {
                status: 'failed',
              },
            },
          })

          console.log(`Booking ${bookingId} cancelled due to expired session`)
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata?.bookingId

        if (bookingId) {
          await payload.update({
            collection: 'bookings',
            id: bookingId,
            data: {
              status: 'confirmed',
              payment: {
                status: 'paid',
                method: 'stripe',
                stripePaymentIntentId: paymentIntent.id,
                transactionId: paymentIntent.id,
                paidAt: new Date().toISOString(),
              },
            },
          })

          console.log(`Booking ${bookingId} confirmed via payment_intent.succeeded`)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata?.bookingId

        if (bookingId) {
          await payload.update({
            collection: 'bookings',
            id: bookingId,
            data: {
              status: 'pending',
              payment: {
                status: 'failed',
                method: 'stripe',
              },
            },
          })
          console.log(`Payment failed for booking ${bookingId}`)
        } else {
          console.log(`Payment failed for payment intent: ${paymentIntent.id}`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
