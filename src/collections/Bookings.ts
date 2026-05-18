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
        // Generate booking reference on create
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
        // Send email notifications ONLY when booking status changes to 'confirmed' (payment successful)
        // This ensures emails are sent after payment, not before
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
      type: 'tabs',
      tabs: [
        // Booking Details Tab
        {
          label: 'Booking Details',
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
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'bookingDate',
                  type: 'date',
                  required: true,
                  admin: {
                    description: 'Primary date of the activity/transport',
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
                    width: '50%',
                  },
                },
                {
                  name: 'bookingTime',
                  type: 'text',
                  admin: {
                    description: 'Preferred time (if applicable)',
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'tourType',
              type: 'select',
              options: [
                { label: 'Group Tour', value: 'group' },
                { label: 'Private Tour', value: 'private' },
              ],
              defaultValue: 'group',
            },
          ],
        },
        // Guest Information Tab
        {
          label: 'Guest Information',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'guestName',
                  type: 'text',
                  required: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'guestEmail',
                  type: 'email',
                  required: true,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'guestPhone',
                  type: 'text',
                  required: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'guestCountry',
                  type: 'text',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'guests',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'adults',
                      type: 'number',
                      required: true,
                      min: 0,
                      defaultValue: 1,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'children',
                      type: 'number',
                      min: 0,
                      defaultValue: 0,
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'childrenAges',
                  type: 'text',
                  admin: {
                    description: 'Ages of children (if applicable)',
                  },
                },
              ],
            },
            {
              name: 'specialRequests',
              type: 'textarea',
              admin: {
                description: 'Dietary restrictions, accessibility needs, special occasions, etc.',
              },
            },
          ],
        },
        // Booked Items Tab
        {
          label: 'Booked Items',
          fields: [
            // Activities
            {
              name: 'activities',
              type: 'array',
              admin: {
                description: 'Booked activities/experiences',
              },
              fields: [
                {
                  name: 'activity',
                  type: 'relationship',
                  relationTo: 'activities',
                  required: false,
                },
                {
                  name: 'activityTitle',
                  type: 'text',
                  admin: {
                    description: 'Title at time of booking (for records)',
                  },
                },
                {
                  name: 'date',
                  type: 'date',
                  admin: {
                    date: { pickerAppearance: 'dayOnly' },
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'adults',
                      type: 'number',
                      defaultValue: 1,
                      min: 1,
                      admin: { width: '50%', description: 'Number of adults' },
                    },
                    {
                      name: 'children',
                      type: 'number',
                      defaultValue: 0,
                      min: 0,
                      admin: { width: '50%', description: 'Number of children' },
                    },
                  ],
                },
                {
                  name: 'quantity',
                  type: 'number',
                  defaultValue: 1,
                  min: 1,
                  admin: {
                    description: 'Legacy field - use adults/children instead',
                    hidden: true,
                  },
                },
                {
                  name: 'selectedVariant',
                  type: 'group',
                  admin: {
                    description: 'If a specific duration/option was selected',
                  },
                  fields: [
                    { name: 'variantLabel', type: 'text' },
                    { name: 'variantPrice', type: 'number' },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'pricePerAdult',
                      type: 'number',
                      required: true,
                      admin: { width: '33%' },
                    },
                    {
                      name: 'pricePerChild',
                      type: 'number',
                      admin: { width: '33%' },
                    },
                    {
                      name: 'subtotal',
                      type: 'number',
                      required: true,
                      admin: { width: '33%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        // Pickup & Logistics Tab
        {
          label: 'Pickup & Logistics',
          fields: [
            {
              name: 'pickupLocation',
              type: 'relationship',
              relationTo: 'locations',
            },
            {
              name: 'customPickupAddress',
              type: 'textarea',
              admin: {
                description: 'Custom address if not in location list',
              },
            },
            {
              name: 'pickupTime',
              type: 'text',
              admin: {
                description: 'Confirmed pickup time',
              },
            },
            {
              name: 'dropoffLocation',
              type: 'relationship',
              relationTo: 'locations',
            },
            {
              name: 'customDropoffAddress',
              type: 'textarea',
            },
            {
              name: 'flightDetails',
              type: 'group',
              admin: {
                description: 'For airport transfers',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'flightNumber', type: 'text', admin: { width: '50%' } },
                    { name: 'airline', type: 'text', admin: { width: '50%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'arrivalTime', type: 'text', admin: { width: '50%' } },
                    { name: 'departureTime', type: 'text', admin: { width: '50%' } },
                  ],
                },
              ],
            },
          ],
        },
        // Payment Tab
        {
          label: 'Payment',
          fields: [
            {
              name: 'pricing',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'subtotal',
                      type: 'number',
                      required: true,
                      admin: {
                        description: 'Subtotal before discounts (EUR)',
                        width: '50%',
                      },
                    },
                    {
                      name: 'totalAmount',
                      type: 'number',
                      required: true,
                      admin: {
                        description: 'Final total (EUR)',
                        width: '50%',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'discountCode',
                      type: 'text',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'discountAmount',
                      type: 'number',
                      defaultValue: 0,
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'pickupFee',
                  type: 'number',
                  defaultValue: 0,
                  admin: {
                    description: 'Additional pickup/dropoff fee',
                  },
                },
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
                },
              ],
            },
            {
              name: 'payment',
              type: 'group',
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
                },
                {
                  name: 'transactionId',
                  type: 'text',
                  admin: {
                    description: 'Payment gateway transaction ID',
                  },
                },
                {
                  name: 'stripeSessionId',
                  type: 'text',
                },
                {
                  name: 'stripePaymentIntentId',
                  type: 'text',
                },
                {
                  name: 'paypalOrderId',
                  type: 'text',
                },
                {
                  name: 'paidAt',
                  type: 'date',
                  admin: {
                    date: { pickerAppearance: 'dayAndTime' },
                  },
                },
                {
                  name: 'refundAmount',
                  type: 'number',
                },
                {
                  name: 'refundReason',
                  type: 'textarea',
                },
                {
                  name: 'refundedAt',
                  type: 'date',
                },
              ],
            },
          ],
        },
        // Admin Notes Tab
        {
          label: 'Admin Notes',
          fields: [
            {
              name: 'internalNotes',
              type: 'textarea',
              admin: {
                description: 'Internal notes (not visible to customer)',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'assignedDriver',
                  type: 'text',
                  admin: {
                    description: 'Assigned driver/guide name',
                    width: '50%',
                  },
                },
                {
                  name: 'assignedVehicle',
                  type: 'text',
                  admin: {
                    description: 'Assigned vehicle details',
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'communicationLog',
              type: 'array',
              fields: [
                {
                  name: 'date',
                  type: 'date',
                  required: true,
                  admin: {
                    date: { pickerAppearance: 'dayAndTime' },
                  },
                },
                {
                  name: 'type',
                  type: 'select',
                  options: [
                    { label: 'Email', value: 'email' },
                    { label: 'WhatsApp', value: 'whatsapp' },
                    { label: 'Phone', value: 'phone' },
                    { label: 'SMS', value: 'sms' },
                  ],
                },
                {
                  name: 'message',
                  type: 'textarea',
                  required: true,
                },
                {
                  name: 'sentBy',
                  type: 'relationship',
                  relationTo: 'users',
                },
              ],
            },
          ],
        },
      ],
    },
    // Sidebar fields for quick access
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
      admin: {
        position: 'sidebar',
      },
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
      admin: {
        position: 'sidebar',
        description: 'Customer preferred language',
      },
      options: [
        { label: 'English', value: 'en' },
        { label: 'French', value: 'fr' },
        { label: 'German', value: 'de' },
      ],
      defaultValue: 'en',
    },
  ],
}
