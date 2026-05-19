import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import config from '@payload-config'

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
  title: string
  price: number
  adults?: number
  children?: number
  duration?: string
}

interface GuestDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  country?: string
  pickupLocation?: string
  specialRequests?: string
}

interface CreatePaymentIntentRequest {
  items: CartItem[]
  date: string
  guestDetails: GuestDetails
  totals: {
    activities: number
    transport: number
    total: number
  }
  locale: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentIntentRequest = await request.json()
    const { items, date, guestDetails, totals, locale } = body

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }
    if (!guestDetails?.email || !guestDetails?.firstName || !guestDetails?.phone) {
      return NextResponse.json({ error: 'Missing required guest details' }, { status: 400 })
    }
    if (!date) {
      return NextResponse.json({ error: 'Booking date is required' }, { status: 400 })
    }
    if (totals.total <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Determine booking type
    const hasActivities = items.some((i) => i.type === 'activity')
    const hasTransport = items.some((i) => i.type === 'transport')
    let bookingType: 'activities' | 'transport' | 'combined' = 'activities'
    if (hasActivities && hasTransport) {
      bookingType = 'combined'
    } else if (hasTransport) {
      bookingType = 'transport'
    }

    // Prepare activities array
    // Note: item.price is already the TOTAL price calculated by frontend (adults * pricePerAdult + children * pricePerChild)
    const activities = items
      .filter((i) => i.type === 'activity')
      .map((item) => {
        const adults = item.adults || 1
        const children = item.children || 0
        const totalGuests = adults + children
        // item.price is the total from frontend
        // Back-calculate unit prices (assuming child price is roughly half of adult price if children present)
        let pricePerAdult = item.price
        let pricePerChild = 0
        if (totalGuests > 0) {
          if (children > 0) {
            pricePerAdult = Math.round((item.price / (adults + children * 0.5)) * 100) / 100
            pricePerChild = Math.round(pricePerAdult * 0.5 * 100) / 100
          } else {
            pricePerAdult = Math.round((item.price / adults) * 100) / 100
          }
        }
        return {
          activity: item.id,
          activityTitle: item.title,
          date: date,
          adults,
          children,
          quantity: adults, // Legacy field for backwards compatibility
          pricePerAdult,
          pricePerChild,
          subtotal: item.price, // item.price is already the total from frontend
        }
      })

    // Note: Transport bookings are not yet supported in this route
    // Transport items are currently ignored

    // Calculate total guests
    const totalAdults = items.reduce((sum, item) => sum + (item.adults || 1), 0)
    const totalChildren = items.reduce((sum, item) => sum + (item.children || 0), 0)

    // Create the booking in pending state
    const booking = await payload.create({
      collection: 'bookings',
      data: {
        bookingReference: '',
        status: 'pending',
        bookingType,
        bookingDate: date,
        tourType: 'group',
        guestName: `${guestDetails.firstName} ${guestDetails.lastName}`.trim(),
        guestEmail: guestDetails.email,
        guestPhone: guestDetails.phone,
        guestCountry: guestDetails.country || '',
        guests: {
          adults: totalAdults,
          children: totalChildren,
        },
        specialRequests: guestDetails.specialRequests || '',
        activities: activities.length > 0 ? activities : undefined,
        customPickupAddress: guestDetails.pickupLocation || '',
        pricing: {
          subtotal: totals.total,
          totalAmount: totals.total,
          currency: 'EUR',
        },
        payment: {
          status: 'pending',
          method: 'stripe',
        },
        source: 'website',
        language: locale as 'en' | 'fr',
      },
    })

    // Create Stripe PaymentIntent
    const stripe = getStripe()
    const amountInCents = Math.round(totals.total * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
      },
      receipt_email: guestDetails.email,
      description: `Atlas Mountain Visit Booking - ${booking.bookingReference}`,
    })

    // Update booking with payment intent ID
    await payload.update({
      collection: 'bookings',
      id: booking.id,
      data: {
        payment: {
          status: 'pending',
          method: 'stripe',
          stripePaymentIntentId: paymentIntent.id,
        },
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingReference: booking.bookingReference,
      bookingId: booking.id,
    })
  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
