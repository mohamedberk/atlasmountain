import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

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

interface CreatePayPalOrderRequest {
  items: CartItem[]
  date?: string
  guestDetails: GuestDetails
  totals?: {
    activities: number
    transport: number
    total: number
  }
  locale: string
}

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured')
  }

  const baseUrl =
    process.env.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token')
  }

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePayPalOrderRequest = await request.json()
    const { items, date, guestDetails, totals, locale } = body

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    if (!guestDetails?.email || !guestDetails?.firstName) {
      return NextResponse.json({ error: 'Missing guest details' }, { status: 400 })
    }

    // Calculate total from items if totals not provided
    const totalAmount =
      totals?.total ||
      items.reduce((total, item) => {
        return total + (item.price || 0)
      }, 0)

    if (totalAmount <= 0) {
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

    // Get booking date
    const bookingDate = date || new Date().toISOString()

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
          activity: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
          activityTitle: item.title,
          date: bookingDate,
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

    // Create booking in Payload CMS (pending status)
    const booking = await payload.create({
      collection: 'bookings',
      data: {
        bookingReference: '',
        status: 'pending',
        bookingType,
        bookingDate,
        tourType: 'group',
        guestName: `${guestDetails.firstName} ${guestDetails.lastName}`.trim(),
        guestEmail: guestDetails.email,
        guestPhone: guestDetails.phone || '',
        guestCountry: guestDetails.country || '',
        specialRequests: guestDetails.specialRequests || '',
        customPickupAddress: guestDetails.pickupLocation || '',
        guests: {
          adults: totalAdults,
          children: totalChildren,
        },
        pricing: {
          subtotal: totalAmount,
          totalAmount,
          currency: 'EUR',
        },
        payment: {
          status: 'pending',
          method: 'paypal',
        },
        activities: activities.length > 0 ? activities : undefined,
        source: 'website',
        language: (locale === 'de' ? 'de' : locale === 'fr' ? 'fr' : 'en') as 'en' | 'fr',
      },
    })

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    const baseUrl =
      process.env.PAYPAL_MODE === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com'

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create PayPal order
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: booking.bookingReference,
            description: `Green Atlas Travel Booking - ${booking.bookingReference}`,
            custom_id: booking.id,
            amount: {
              currency_code: 'EUR',
              value: totalAmount.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: 'Green Atlas Travel',
          locale: locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : 'en-US',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${appUrl}/${locale}/confirmation?ref=${booking.bookingReference}`,
          cancel_url: `${appUrl}/${locale}/checkout?canceled=true`,
        },
      }),
    })

    const orderData = await orderResponse.json()

    if (!orderResponse.ok) {
      console.error('PayPal order creation failed:', orderData)
      // Clean up the booking if PayPal order creation fails
      await payload.delete({
        collection: 'bookings',
        id: booking.id,
      })
      return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 })
    }

    // Update booking with PayPal order ID
    await payload.update({
      collection: 'bookings',
      id: booking.id,
      data: {
        payment: {
          status: 'pending',
          method: 'paypal',
          paypalOrderId: orderData.id,
        },
      },
    })

    return NextResponse.json({
      orderId: orderData.id,
      bookingReference: booking.bookingReference,
      bookingId: booking.id,
    })
  } catch (error) {
    console.error('PayPal checkout error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create PayPal order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
