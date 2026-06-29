import type { CollectionConfig } from 'payload'
import { sendBookingEmails } from '@/lib/email/send-booking-emails'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: {
    useAsTitle: 'bookingReference',
    group: 'Orders',
    defaultColumns: ['bookingReference', 'guestName', 'status', 'totalAmount', 'bookingDate', 'createdAt'],
    description: 'Manage customer bookings',
    listSearchableFields: ['bookingReference', 'guestName', 'guestEmail', 'guestPhone'],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true, // Allow public booking creation
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && !data.bookingReference) {
          const timestamp = Date.now().toString(36).toUpperCase()
          const random = Math.random().toString(36).substring(2, 6).toUpperCase()
          data.bookingReference = `MTS-${timestamp}-${random}`
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        const statusChanged = operation === 'update' && previousDoc?.status !== doc.status
        const nowConfirmed = doc.status === 'confirmed'
        const paymentSucceeded = doc.payment?.status === 'paid'

        if (statusChanged && nowConfirmed && paymentSucceeded) {
          try {
            const result = await sendBookingEmails(req.payload, doc)
            if (result.errors.length > 0) {
              req.payload.logger.warn(`Booking ${doc.bookingReference} confirmed with email errors: ${result.errors.join(', ')}`)
            } else {
              req.payload.logger.info(`Booking ${doc.bookingReference} confirmed, confirmation emails sent successfully`)
            }
          } catch (error) {
            req.payload.logger.error(`Failed to send confirmation emails for ${doc.bookingReference}: ${error}`)
          }
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'bookingReference',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated booking reference',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: [
            { label: 'Pending Payment', value: 'pending' },
            { label: 'Paid', value: 'paid' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Refunded', value: 'refunded' },
            { label: 'No Show', value: 'no_show' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'bookingType',
          type: 'select',
          options: [
            { label: 'Activities Only', value: 'activities' },
            { label: 'Transport Only', value: 'transport' },
            { label: 'Combined', value: 'combined' },
          ],
          defaultValue: 'activities',
          admin: { width: '50%', readOnly: true },
        },
      ],
    },
    {
      name: 'bookingDate',
      type: 'date',
      required: true,
      admin: {
        description: 'Primary date of the activity',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'guestName', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'guestEmail', type: 'email', required: true, admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'guestPhone', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'guestCountry', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      name: 'guests',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'adults', type: 'number', required: true, min: 0, defaultValue: 1, admin: { width: '50%' } },
            { name: 'children', type: 'number', min: 0, defaultValue: 0, admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      name: 'customPickupAddress',
      type: 'textarea',
      admin: {
        description: 'Pickup location entered at checkout',
      },
    },
    {
      name: 'specialRequests',
      type: 'textarea',
    },
    {
      name: 'activities',
      type: 'array',
      admin: { description: 'Booked activities' },
      fields: [
        { name: 'activityTitle', type: 'text' },
        {
          name: 'date',
          type: 'date',
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
        {
          type: 'row',
          fields: [
            { name: 'adults', type: 'number', defaultValue: 1, min: 1, admin: { width: '50%' } },
            { name: 'children', type: 'number', defaultValue: 0, min: 0, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'pricePerAdult', type: 'number', required: true, admin: { width: '33%' } },
            { name: 'pricePerChild', type: 'number', admin: { width: '33%' } },
            { name: 'subtotal', type: 'number', required: true, admin: { width: '33%' } },
          ],
        },
      ],
    },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'subtotal', type: 'number', required: true, admin: { width: '40%' } },
            { name: 'totalAmount', type: 'number', required: true, admin: { width: '40%' } },
            {
              name: 'currency',
              type: 'select',
              defaultValue: 'EUR',
              options: [
                { label: 'Euro (EUR)', value: 'EUR' },
                { label: 'US Dollar (USD)', value: 'USD' },
                { label: 'Moroccan Dirham (MAD)', value: 'MAD' },
                { label: 'British Pound (GBP)', value: 'GBP' },
              ],
              admin: { width: '20%' },
            },
          ],
        },
      ],
    },
    {
      name: 'payment',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'pending',
              options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Processing', value: 'processing' },
                { label: 'Paid', value: 'paid' },
                { label: 'Failed', value: 'failed' },
                { label: 'Refunded', value: 'refunded' },
                { label: 'Partially Refunded', value: 'partial_refund' },
              ],
              admin: { width: '50%' },
            },
            {
              name: 'method',
              type: 'select',
              options: [
                { label: 'Stripe', value: 'stripe' },
                { label: 'PayPal', value: 'paypal' },
                { label: 'Cash', value: 'cash' },
                { label: 'Bank Transfer', value: 'bank_transfer' },
              ],
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'transactionId',
          type: 'text',
          admin: { hidden: true },
        },
        {
          name: 'stripeSessionId',
          type: 'text',
          admin: { hidden: true },
        },
        {
          name: 'stripePaymentIntentId',
          type: 'text',
          admin: { hidden: true },
        },
        {
          name: 'paypalOrderId',
          type: 'text',
          admin: { hidden: true },
        },
        {
          name: 'paidAt',
          type: 'date',
          admin: { hidden: true },
        },
      ],
    },
    // Sidebar fields
    {
      name: 'totalAmount',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Total booking amount',
      },
      hooks: {
        beforeChange: [
          ({ data }) => data?.pricing?.totalAmount || 0,
        ],
      },
    },
    {
      name: 'source',
      type: 'select',
      admin: { position: 'sidebar', readOnly: true },
      options: [
        { label: 'Website', value: 'website' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Phone', value: 'phone' },
        { label: 'Email', value: 'email' },
        { label: 'Walk-in', value: 'walkin' },
        { label: 'Partner', value: 'partner' },
      ],
      defaultValue: 'website',
    },
    {
      name: 'language',
      type: 'select',
      admin: { position: 'sidebar', readOnly: true },
      options: [
        { label: 'English', value: 'en' },
        { label: 'French', value: 'fr' },
      ],
      defaultValue: 'en',
    },
    // Hidden: kept for backwards compatibility (set by API routes / used by email templates)
    {
      name: 'tourType',
      type: 'select',
      options: [
        { label: 'Group Tour', value: 'group' },
        { label: 'Private Tour', value: 'private' },
      ],
      defaultValue: 'group',
      admin: { hidden: true },
    },
  ],
}
