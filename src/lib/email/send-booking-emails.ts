import type { Payload } from 'payload'
import type { Booking } from '@/payload-types'
import {
  generateCustomerEmailHtml,
  generateAdminEmailHtml,
  extractBookingEmailData,
  type EmailSiteSettings,
} from './templates'

interface SendBookingEmailsResult {
  customerEmailSent: boolean
  adminEmailSent: boolean
  errors: string[]
}

export async function sendBookingEmails(
  payload: Payload,
  booking: Booking,
): Promise<SendBookingEmailsResult> {
  const result: SendBookingEmailsResult = {
    customerEmailSent: false,
    adminEmailSent: false,
    errors: [],
  }

  const emailData = extractBookingEmailData(booking)
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL

  // Fetch site settings for email templates
  let siteSettings: EmailSiteSettings
  try {
    const settings = await payload.findGlobal({
      slug: 'site-settings' as any,
      depth: 0,
    })
    const phoneCountryCode = (settings as any).contact?.phone?.countryCode ?? ''
    const phoneNumber = (settings as any).contact?.phone?.number ?? ''
    const whatsappDigits = `${phoneCountryCode}${phoneNumber}`.replace(/\D/g, '')
    siteSettings = {
      whatsappLink: `https://wa.me/${whatsappDigits}`,
      email: (settings as any).contact?.email,
      companyName: (settings as any).company?.name,
      companyShortName: (settings as any).company?.shortName,
    }
  } catch (error) {
    result.errors.push('Could not fetch site settings for email')
    payload.logger.error('Could not fetch site settings for email, aborting email send')
    return result
  }

  // Send customer email
  if (emailData.guestEmail) {
    try {
      await payload.sendEmail({
        to: emailData.guestEmail,
        subject: `Booking Confirmed - ${emailData.bookingReference} | ${siteSettings.companyShortName}`,
        html: generateCustomerEmailHtml(emailData, siteSettings),
      })
      result.customerEmailSent = true
      payload.logger.info(`Customer email sent to ${emailData.guestEmail} for booking ${emailData.bookingReference}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      result.errors.push(`Failed to send customer email: ${errorMessage}`)
      payload.logger.error(`Failed to send customer email for booking ${emailData.bookingReference}: ${errorMessage}`)
    }
  } else {
    result.errors.push('No customer email address provided')
  }

  // Send admin email
  if (adminEmail) {
    try {
      await payload.sendEmail({
        to: adminEmail,
        subject: `New Booking: ${emailData.bookingReference} - ${emailData.guestName}`,
        html: generateAdminEmailHtml(emailData, siteSettings),
      })
      result.adminEmailSent = true
      payload.logger.info(`Admin email sent to ${adminEmail} for booking ${emailData.bookingReference}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      result.errors.push(`Failed to send admin email: ${errorMessage}`)
      payload.logger.error(`Failed to send admin email for booking ${emailData.bookingReference}: ${errorMessage}`)
    }
  } else {
    result.errors.push('ADMIN_NOTIFICATION_EMAIL environment variable not set')
    payload.logger.warn('ADMIN_NOTIFICATION_EMAIL not configured, skipping admin notification')
  }

  return result
}
