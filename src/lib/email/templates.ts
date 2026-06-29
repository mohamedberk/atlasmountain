import type { Booking } from '@/payload-types'

interface BookingEmailData {
  bookingReference: string
  guestName: string
  guestEmail: string
  guestPhone: string
  bookingDate: string
  bookingTime?: string
  tourType: string
  status: string
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod?: 'stripe' | 'paypal' | 'cash' | string
  activities: Array<{
    title: string
    adults: number
    children: number
    subtotal: number
  }>
  transport: Array<{
    title: string
    price: number
  }>
  totalAmount: number
  specialRequests?: string
  pickupLocation?: string
  currency: string
}

// Site settings interface for email templates
export interface EmailSiteSettings {
  whatsappLink: string
  email: string
  companyName: string
  companyShortName: string
}

const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency,
  }).format(amount)
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const generateCustomerEmailHtml = (data: BookingEmailData, siteSettings: EmailSiteSettings): string => {
  const settings = siteSettings
  const itemsHtml = [
    ...data.activities.map(
      (a) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0;">
          <div style="font-weight: 500; color: #1a1a1a; margin-bottom: 4px;">${a.title}</div>
          <div style="font-size: 14px; color: #666;">${a.adults} Adult${a.adults > 1 ? 's' : ''}${a.children > 0 ? `, ${a.children} Child${a.children > 1 ? 'ren' : ''}` : ''}</div>
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 500; color: #1a1a1a;">
          ${formatCurrency(a.subtotal, data.currency)}
        </td>
      </tr>
    `,
    ),
    ...data.transport.map(
      (t) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0;">
          <div style="font-weight: 500; color: #1a1a1a;">${t.title}</div>
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 500; color: #1a1a1a;">
          ${formatCurrency(t.price, data.currency)}
        </td>
      </tr>
    `,
    ),
  ].join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">${settings.companyShortName}</h1>
              <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 2px;">Marrakech Adventures</p>
            </td>
          </tr>

          <!-- Confirmation Badge -->
          <tr>
            <td style="padding: 40px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${data.paymentMethod === 'cash' ? `
                  <td style="background-color: #fff7ed; border-radius: 12px; padding: 20px; text-align: center;">
                    <div style="display: inline-block; width: 48px; height: 48px; background-color: #f97316; border-radius: 50%; line-height: 48px; margin-bottom: 12px;">
                      <span style="color: #ffffff; font-size: 24px;">✓</span>
                    </div>
                    <h2 style="margin: 0 0 4px 0; font-size: 20px; font-weight: 600; color: #9a3412;">Booking Reserved</h2>
                    <p style="margin: 0; font-size: 14px; color: #c2410c;">Payment due on arrival</p>
                  </td>
                  ` : `
                  <td style="background-color: #ffe5e5; border-radius: 12px; padding: 20px; text-align: center;">
                    <div style="display: inline-block; width: 48px; height: 48px; background-color: #ff2828; border-radius: 50%; line-height: 48px; margin-bottom: 12px;">
                      <span style="color: #ffffff; font-size: 24px;">✓</span>
                    </div>
                    <h2 style="margin: 0 0 4px 0; font-size: 20px; font-weight: 600; color: #b91c1c;">Booking Confirmed</h2>
                    <p style="margin: 0; font-size: 14px; color: #dc2626;">Your Moroccan adventure awaits!</p>
                  </td>
                  `}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Booking Reference -->
          <tr>
            <td style="padding: 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border-radius: 12px; padding: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a; letter-spacing: 1px;">${data.bookingReference}</p>
                  </td>
                  <td style="text-align: right;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Date</p>
                    <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1a1a1a;">${formatDate(data.bookingDate)}</p>
                    ${data.bookingTime ? `<p style="margin: 4px 0 0 0; font-size: 14px; color: #666;">${data.bookingTime}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Guest Details -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px;">Guest Details</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #666; font-size: 14px;">Name:</span>
                    <span style="color: #1a1a1a; font-size: 14px; font-weight: 500; margin-left: 8px;">${data.guestName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #666; font-size: 14px;">Email:</span>
                    <span style="color: #1a1a1a; font-size: 14px; font-weight: 500; margin-left: 8px;">${data.guestEmail}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #666; font-size: 14px;">Phone:</span>
                    <span style="color: #1a1a1a; font-size: 14px; font-weight: 500; margin-left: 8px;">${data.guestPhone}</span>
                  </td>
                </tr>
                ${
                  data.pickupLocation
                    ? `
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #666; font-size: 14px;">Pickup:</span>
                    <span style="color: #1a1a1a; font-size: 14px; font-weight: 500; margin-left: 8px;">${data.pickupLocation}</span>
                  </td>
                </tr>
                `
                    : ''
                }
              </table>
            </td>
          </tr>

          <!-- Booked Items -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px;">Your Booking</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; padding: 20px;">
                <tr>
                  <td>
                    <span style="font-size: 14px; color: rgba(255,255,255,0.7);">Total Amount</span>
                    ${data.paymentMethod === 'cash' ? `
                    <div style="margin-top: 4px;">
                      <span style="font-size: 12px; color: #f97316; background-color: rgba(249,115,22,0.2); padding: 2px 8px; border-radius: 4px;">Pay on arrival</span>
                    </div>
                    ` : `
                    <div style="margin-top: 4px;">
                      <span style="font-size: 12px; color: #ff2828; background-color: rgba(255,40,40,0.15); padding: 2px 8px; border-radius: 4px;">Paid</span>
                    </div>
                    `}
                  </td>
                  <td style="text-align: right;">
                    <span style="font-size: 24px; font-weight: 700; color: #ffffff;">${formatCurrency(data.totalAmount, data.currency)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${
            data.specialRequests
              ? `
          <!-- Special Requests -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px;">Special Requests</h3>
              <p style="margin: 0; font-size: 14px; color: #666; background-color: #fafafa; padding: 16px; border-radius: 8px;">${data.specialRequests}</p>
            </td>
          </tr>
          `
              : ''
          }

          <!-- What's Next -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px;">What's Next?</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="display: inline-block; width: 24px; height: 24px; background-color: #f0f0f0; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600; color: #1a1a1a; margin-right: 12px;">1</span>
                    <span style="font-size: 14px; color: #1a1a1a;">We'll send you a confirmation WhatsApp message</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="display: inline-block; width: 24px; height: 24px; background-color: #f0f0f0; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600; color: #1a1a1a; margin-right: 12px;">2</span>
                    <span style="font-size: 14px; color: #1a1a1a;">Our team will confirm pickup details 24h before</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="display: inline-block; width: 24px; height: 24px; background-color: #f0f0f0; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600; color: #1a1a1a; margin-right: 12px;">3</span>
                    <span style="font-size: 14px; color: #1a1a1a;">Get ready for an amazing adventure!</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 32px 40px; text-align: center; border-top: 1px solid #f0f0f0;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">Questions? Contact us anytime</p>
              <p style="margin: 0 0 16px 0;">
                <a href="${settings.whatsappLink}" style="color: #1a1a1a; font-weight: 500; text-decoration: none;">WhatsApp</a>
                <span style="color: #ccc; margin: 0 12px;">|</span>
                <a href="mailto:${settings.email}" style="color: #1a1a1a; font-weight: 500; text-decoration: none;">${settings.email}</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} ${settings.companyShortName}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export const generateAdminEmailHtml = (data: BookingEmailData, siteSettings: EmailSiteSettings): string => {
  const settings = siteSettings
  const itemsHtml = [
    ...data.activities.map(
      (a) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0;">
          <div style="font-weight: 500; color: #1a1a1a; margin-bottom: 4px;">${a.title}</div>
          <div style="font-size: 14px; color: #666;">${a.adults} Adult${a.adults > 1 ? 's' : ''}${a.children > 0 ? `, ${a.children} Child${a.children > 1 ? 'ren' : ''}` : ''}</div>
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 500; color: #1a1a1a;">
          ${formatCurrency(a.subtotal, data.currency)}
        </td>
      </tr>
    `,
    ),
    ...data.transport.map(
      (t) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0;">
          <div style="font-weight: 500; color: #1a1a1a;">${t.title}</div>
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 500; color: #1a1a1a;">
          ${formatCurrency(t.price, data.currency)}
        </td>
      </tr>
    `,
    ),
  ].join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">${settings.companyShortName}</h1>
              <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 2px;">Admin Notification</p>
            </td>
          </tr>

          <!-- New Booking Badge -->
          <tr>
            <td style="padding: 40px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #fafafa; border-radius: 12px; padding: 20px; text-align: center;">
                    <div style="display: inline-block; width: 48px; height: 48px; background-color: #1a1a1a; border-radius: 50%; line-height: 48px; margin-bottom: 12px;">
                      <span style="color: #ffffff; font-size: 20px;">+</span>
                    </div>
                    <h2 style="margin: 0 0 4px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">New Booking Received</h2>
                    <p style="margin: 0; font-size: 14px; color: #666;">A new booking requires your attention</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Booking Reference & Total -->
          <tr>
            <td style="padding: 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border-radius: 12px; padding: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a; letter-spacing: 1px;">${data.bookingReference}</p>
                  </td>
                  <td style="text-align: right;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Total Amount</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">${formatCurrency(data.totalAmount, data.currency)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Guest Details -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px;">Guest Information</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #666; font-size: 14px;">Name:</span>
                    <span style="color: #1a1a1a; font-size: 14px; font-weight: 500; margin-left: 8px;">${data.guestName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #666; font-size: 14px;">Email:</span>
                    <a href="mailto:${data.guestEmail}" style="color: #1a1a1a; font-size: 14px; font-weight: 500; margin-left: 8px; text-decoration: none;">${data.guestEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #666; font-size: 14px;">Phone:</span>
                    <a href="tel:${data.guestPhone}" style="color: #1a1a1a; font-size: 14px; font-weight: 500; margin-left: 8px; text-decoration: none;">${data.guestPhone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #666; font-size: 14px;">Tour Type:</span>
                    <span style="color: #1a1a1a; font-size: 14px; font-weight: 500; margin-left: 8px;">${data.tourType === 'private' ? 'Private Tour' : 'Group Tour'}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px;">Booking Details</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #666; font-size: 14px;">Date:</span>
                    <span style="color: #1a1a1a; font-size: 14px; font-weight: 500; margin-left: 8px;">${formatDate(data.bookingDate)}${data.bookingTime ? ` at ${data.bookingTime}` : ''}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #666; font-size: 14px;">Status:</span>
                    <span style="background-color: #fafafa; color: #1a1a1a; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; text-transform: uppercase; margin-left: 8px;">${data.status}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #666; font-size: 14px;">Payment:</span>
                    ${data.paymentMethod === 'cash' ? `
                    <span style="background-color: #fff7ed; color: #c2410c; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; text-transform: uppercase; margin-left: 8px;">PAY ON ARRIVAL</span>
                    ` : `
                    <span style="background-color: #ffe5e5; color: #b91c1c; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; text-transform: uppercase; margin-left: 8px;">PAID (${data.paymentMethod || 'card'})</span>
                    `}
                  </td>
                </tr>
                ${data.pickupLocation ? `<tr><td style="padding: 8px 0;"><span style="color: #666; font-size: 14px;">Pickup:</span><span style="color: #1a1a1a; font-size: 14px; font-weight: 500; margin-left: 8px;">${data.pickupLocation}</span></td></tr>` : ''}
              </table>
            </td>
          </tr>

          <!-- Booked Items -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px;">Booked Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          ${
            data.specialRequests
              ? `
          <!-- Special Requests -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px;">Special Requests</h3>
              <p style="margin: 0; font-size: 14px; color: #666; background-color: #fafafa; padding: 16px; border-radius: 8px;">${data.specialRequests}</p>
            </td>
          </tr>
          `
              : ''
          }

          <!-- Action Button -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <a href="${process.env.NEXT_PUBLIC_SERVER_URL || 'https://atlasmountainsvisit.com'}/admin/collections/bookings" style="display: block; background-color: #1a1a1a; color: #ffffff; text-align: center; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 500; font-size: 14px;">View in Admin Panel</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 32px 40px; text-align: center; border-top: 1px solid #f0f0f0;">
              <p style="margin: 0; font-size: 12px; color: #999;">This is an automated notification from ${settings.companyShortName} booking system.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export const extractBookingEmailData = (booking: Booking): BookingEmailData => {
  return {
    bookingReference: booking.bookingReference || 'N/A',
    guestName: booking.guestName || 'Guest',
    guestEmail: booking.guestEmail || '',
    guestPhone: booking.guestPhone || '',
    bookingDate: booking.bookingDate || new Date().toISOString(),
    tourType: booking.tourType || 'group',
    status: booking.status || 'pending',
    paymentStatus: booking.payment?.status as BookingEmailData['paymentStatus'],
    paymentMethod: booking.payment?.method as BookingEmailData['paymentMethod'],
    activities: (booking.activities || []).map((a) => ({
      title: a.activityTitle || 'Activity',
      adults: a.adults || 1,
      children: a.children || 0,
      subtotal: a.subtotal || 0,
    })),
    // Transport bookings are not yet supported
    transport: [],
    totalAmount: booking.pricing?.totalAmount || booking.totalAmount || 0,
    specialRequests: booking.specialRequests || undefined,
    pickupLocation: booking.customPickupAddress || undefined,
    currency: booking.pricing?.currency || 'EUR',
  }
}
