import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendBookingEmails } from '@/lib/email/send-booking-emails'

interface BookingItem {
  type: 'activity' | 'transport'
  id: string
  title: string
  price: number
  adults?: number
  children?: number
  duration?: string
}

interface CreateBookingRequest {
  items: BookingItem[]
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
  payLater?: boolean
  locale?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequest = await request.json()

    // Validate required fields
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'No items in booking' }, { status: 400 })
    }
    if (!body.guestDetails?.email || !body.guestDetails?.firstName || !body.guestDetails?.phone) {
      return NextResponse.json({ error: 'Missing required guest details' }, { status: 400 })
    }
    if (!body.date) {
      return NextResponse.json({ error: 'Booking date is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Determine booking type
    const hasActivities = body.items.some((i) => i.type === 'activity')
    const hasTransport = body.items.some((i) => i.type === 'transport')
    let bookingType: 'activities' | 'transport' | 'combined' = 'activities'
    if (hasActivities && hasTransport) {
      bookingType = 'combined'
    } else if (hasTransport) {
      bookingType = 'transport'
    }

    // Prepare activities array (without relationship - just store title/price info)
    // Note: item.price is already the TOTAL price calculated by frontend (adults * pricePerAdult + children * pricePerChild)
    const activities = body.items
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
            // Estimate: assume children are half price
            // total = adults * adultPrice + children * (adultPrice * 0.5)
            // total = adultPrice * (adults + children * 0.5)
            pricePerAdult = Math.round((item.price / (adults + children * 0.5)) * 100) / 100
            pricePerChild = Math.round(pricePerAdult * 0.5 * 100) / 100
          } else {
            pricePerAdult = Math.round((item.price / adults) * 100) / 100
          }
        }
        return {
          activityTitle: item.title,
          date: body.date,
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
    const totalAdults = body.items.reduce((sum, item) => sum + (item.adults || 1), 0)
    const totalChildren = body.items.reduce((sum, item) => sum + (item.children || 0), 0)

    // Determine status and payment info based on payLater
    // Pay Later: booking is 'pending' (awaiting payment on arrival)
    // Online payment: booking is 'pending' until payment webhook confirms it
    const isPayLater = body.payLater === true
    const bookingStatus = 'pending' // Always pending until payment is confirmed
    const paymentStatus = 'pending' // Payment is pending for both cases initially
    const paymentMethod = isPayLater ? 'cash' : undefined

    // Generate booking reference (GAT = legacy prefix; preserved for continuity)
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    const bookingReference = `GAT-${timestamp}-${random}`

    // Create the booking
    const booking = await payload.create({
      collection: 'bookings',
      data: {
        bookingReference,
        status: bookingStatus,
        bookingType,
        bookingDate: body.date,
        tourType: 'group',
        guestName: `${body.guestDetails.firstName} ${body.guestDetails.lastName}`.trim(),
        guestEmail: body.guestDetails.email,
        guestPhone: body.guestDetails.phone,
        guestCountry: body.guestDetails.country || '',
        guests: {
          adults: totalAdults,
          children: totalChildren,
        },
        specialRequests: body.guestDetails.specialRequests || '',
        activities: activities.length > 0 ? activities : undefined,
        customPickupAddress: body.guestDetails.pickupLocation || '',
        pricing: {
          subtotal: body.totals.total,
          totalAmount: body.totals.total,
          currency: 'EUR',
        },
        payment: {
          status: paymentStatus,
          method: paymentMethod,
        },
        source: 'website',
        language: body.locale === 'fr' ? 'fr' : 'en',
      },
    })

    // For Pay Later bookings, send confirmation emails immediately
    // (since no payment webhook will trigger them)
    if (isPayLater) {
      try {
        const result = await sendBookingEmails(payload, booking)
        if (result.errors.length > 0) {
          payload.logger.warn(`Pay Later booking ${booking.bookingReference} created with email errors: ${result.errors.join(', ')}`)
        } else {
          payload.logger.info(`Pay Later booking ${booking.bookingReference} created, emails sent successfully`)
        }
      } catch (error) {
        payload.logger.error(`Failed to send emails for Pay Later booking ${booking.bookingReference}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      bookingReference: booking.bookingReference,
      bookingId: booking.id,
      payLater: isPayLater,
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
