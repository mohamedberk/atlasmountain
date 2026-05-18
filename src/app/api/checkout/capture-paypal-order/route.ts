import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

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
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const accessToken = await getPayPalAccessToken()

    const baseUrl =
      process.env.PAYPAL_MODE === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com'

    // Capture the PayPal order
    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const captureData = await captureResponse.json()

    if (!captureResponse.ok) {
      console.error('PayPal capture failed:', captureData)
      return NextResponse.json(
        { error: 'Failed to capture PayPal payment', details: captureData },
        { status: 500 }
      )
    }

    // Get booking ID from the custom_id
    const bookingId =
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id ||
      captureData.purchase_units?.[0]?.custom_id

    const bookingReference = captureData.purchase_units?.[0]?.reference_id
    const transactionId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id

    const payload = await getPayload({ config })

    if (captureData.status === 'COMPLETED') {
      // Update the booking to confirmed
      if (bookingId) {
        await payload.update({
          collection: 'bookings',
          id: bookingId,
          data: {
            status: 'confirmed',
            payment: {
              status: 'paid',
              method: 'paypal',
              transactionId: transactionId,
              paypalOrderId: orderId,
              paidAt: new Date().toISOString(),
            },
          },
        })
        console.log(`Booking ${bookingId} confirmed via PayPal capture`)
      } else if (bookingReference) {
        // Try to find by booking reference
        const bookings = await payload.find({
          collection: 'bookings',
          where: {
            bookingReference: {
              equals: bookingReference,
            },
          },
        })

        if (bookings.docs.length > 0) {
          await payload.update({
            collection: 'bookings',
            id: bookings.docs[0].id,
            data: {
              status: 'confirmed',
              payment: {
                status: 'paid',
                method: 'paypal',
                transactionId: transactionId,
                paypalOrderId: orderId,
                paidAt: new Date().toISOString(),
              },
            },
          })
          console.log(`Booking ${bookings.docs[0].id} confirmed via PayPal capture (found by reference)`)
        }
      }

      return NextResponse.json({
        status: 'COMPLETED',
        bookingNumber: bookingReference,
        transactionId,
      })
    } else {
      // Payment not completed
      console.error('PayPal payment not completed:', captureData.status)

      if (bookingId) {
        await payload.update({
          collection: 'bookings',
          id: bookingId,
          data: {
            payment: {
              status: 'failed',
              method: 'paypal',
            },
          },
        })
      }

      return NextResponse.json(
        { error: 'Payment not completed', status: captureData.status },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('PayPal capture error:', error)
    return NextResponse.json(
      { error: 'Failed to capture PayPal payment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
