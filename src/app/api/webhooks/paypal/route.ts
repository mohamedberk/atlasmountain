import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const eventType = body.event_type
    const resource = body.resource

    console.log(`PayPal webhook received: ${eventType}`)

    const payload = await getPayload({ config })

    switch (eventType) {
      case 'CHECKOUT.ORDER.APPROVED': {
        // Order approved but not yet captured
        const orderId = resource.id
        console.log(`PayPal order approved: ${orderId}`)
        break
      }

      case 'PAYMENT.CAPTURE.COMPLETED': {
        // Payment captured successfully
        const customId = resource.custom_id
        const captureId = resource.id

        if (customId) {
          await payload.update({
            collection: 'bookings',
            id: customId,
            data: {
              status: 'confirmed',
              payment: {
                status: 'paid',
                transactionId: captureId,
                paidAt: new Date().toISOString(),
              },
            },
          })
          console.log(`Booking ${customId} confirmed via PayPal webhook`)
        }
        break
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED': {
        const customId = resource.custom_id

        if (customId) {
          await payload.update({
            collection: 'bookings',
            id: customId,
            data: {
              status: 'cancelled',
              payment: {
                status: 'failed',
              },
            },
          })
          console.log(`Booking ${customId} cancelled due to payment failure`)
        }
        break
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        const customId = resource.custom_id

        if (customId) {
          await payload.update({
            collection: 'bookings',
            id: customId,
            data: {
              payment: {
                status: 'refunded',
              },
            },
          })
          console.log(`Booking ${customId} refunded`)
        }
        break
      }

      default:
        console.log(`Unhandled PayPal event type: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
