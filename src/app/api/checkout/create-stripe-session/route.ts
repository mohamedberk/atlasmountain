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

interface CartItem {
  type: 'activity' | 'transport'
  id: string
  title?: string
  vehicleName?: string
  price?: number
  pricePerCar?: number
  adults?: number
  children?: number
  childPrice?: number
  date?: string
  pickupDate?: string
  pickupTime?: string
  pickupLocationName?: string
  dropoffLocationName?: string
}

interface GuestDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  pickupLocation: string
  specialRequests: string
}

interface CheckoutRequest {
  items: CartItem[]
  guestDetails: GuestDetails
  locale: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json()
    const { items, guestDetails, locale } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      )
    }

    if (!guestDetails.email || !guestDetails.firstName) {
      return NextResponse.json(
        { error: 'Missing guest details' },
        { status: 400 }
      )
    }

    // Calculate line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
      if (item.type === 'activity') {
        const adultTotal = (item.price || 0) * (item.adults || 0)
        const childTotal = (item.childPrice || 0) * (item.children || 0)
        const total = adultTotal + childTotal

        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.title || 'Activity',
              description: `${item.adults || 0} adults, ${item.children || 0} children - ${item.date}`,
            },
            unit_amount: Math.round(total * 100), // Stripe uses cents
          },
          quantity: 1,
        }
      } else {
        // Transport
        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.vehicleName || 'Transport',
              description: `${item.pickupLocationName} to ${item.dropoffLocationName} - ${item.pickupDate} at ${item.pickupTime}`,
            },
            unit_amount: Math.round((item.pricePerCar || 0) * 100),
          },
          quantity: 1,
        }
      }
    })

    // Calculate total for booking
    const totalAmount = items.reduce((total, item) => {
      if (item.type === 'activity') {
        const adultTotal = (item.price || 0) * (item.adults || 0)
        const childTotal = (item.childPrice || 0) * (item.children || 0)
        return total + adultTotal + childTotal
      }
      return total + (item.pricePerCar || 0)
    }, 0)

    // Create booking in Payload CMS
    const payload = await getPayload({ config })

    const bookingReference = `MTS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const booking = await payload.create({
      collection: 'bookings',
      data: {
        bookingReference,
        guestName: `${guestDetails.firstName} ${guestDetails.lastName}`,
        guestEmail: guestDetails.email,
        guestPhone: guestDetails.phone,
        guestCountry: guestDetails.country,
        customPickupAddress: guestDetails.pickupLocation,
        specialRequests: guestDetails.specialRequests,
        bookingDate: items[0]?.date || items[0]?.pickupDate || new Date().toISOString(),
        bookingType: items.some(i => i.type === 'activity') && items.some(i => i.type === 'transport')
          ? 'combined'
          : items.some(i => i.type === 'transport') ? 'transport' : 'activities',
        status: 'pending',
        pricing: {
          subtotal: totalAmount,
          totalAmount,
          currency: 'EUR',
        },
        payment: {
          status: 'pending',
          method: 'stripe',
        },
        activities: items
          .filter((item) => item.type === 'activity')
          .map((item) => ({
            activity: item.id,
            activityTitle: item.title || '',
            date: item.date || undefined,
            quantity: 1,
            pricePerAdult: item.price || 0,
            pricePerChild: item.childPrice || 0,
            subtotal: ((item.price || 0) * (item.adults || 0)) + ((item.childPrice || 0) * (item.children || 0)),
          })),
        // Note: Transport bookings are not yet supported in this route
        guests: {
          adults: items.find(i => i.type === 'activity')?.adults || 1,
          children: items.find(i => i.type === 'activity')?.children || 0,
        },
        source: 'website',
        language: locale as 'en' | 'fr',
      },
    })

    // Get the app URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create Stripe Checkout Session
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/${locale}/confirmation?ref=${bookingReference}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/${locale}/checkout?canceled=true`,
      customer_email: guestDetails.email,
      metadata: {
        bookingId: booking.id,
        bookingReference,
      },
      locale: locale === 'fr' ? 'fr' : 'en',
    })

    // Update booking with Stripe session ID
    await payload.update({
      collection: 'bookings',
      id: booking.id,
      data: {
        payment: {
          status: 'pending',
          method: 'stripe',
          stripeSessionId: session.id,
        },
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      bookingReference,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
