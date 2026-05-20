import type { GlobalConfig } from 'payload'

import { revalidateGlobalAfterChange } from '@/hooks/revalidateOnChange'

export const ContactPage: GlobalConfig = {
  slug: 'contact-page',
  label: 'Contact Page',
  admin: {
    group: 'Pages',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    afterChange: [revalidateGlobalAfterChange],
  },
  fields: [
    
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Header',
          fields: [
            {
              name: 'header',
              type: 'group',
              fields: [
                {
                  name: 'badgeText',
                  type: 'text',
                  defaultValue: 'Get in Touch',
                  localized: true,
                  admin: {
                    description: 'Small badge text above the title',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      defaultValue: "Let's Plan Your",
                      localized: true,
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'titleHighlight',
                      type: 'text',
                      defaultValue: 'Moroccan Adventure',
                      localized: true,
                      admin: {
                        description: 'Shown in green',
                        width: '50%',
                      },
                    },
                  ],
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue: "Have a dream trip in mind? We'd love to hear from you. Send us a message and we'll create an unforgettable experience just for you.",
                  localized: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Feature Cards',
          fields: [
            {
              name: 'features',
              type: 'array',
              minRows: 1,
              maxRows: 4,
              admin: {
                description: 'Feature highlight cards shown below the hero',
              },
              fields: [
                {
                  name: 'icon',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Heart - Personalized', value: 'heart' },
                    { label: 'Calendar X - Free Cancellation', value: 'calendarX' },
                    { label: 'Car - Hotel Pickup', value: 'car' },
                    { label: 'Shield - Security', value: 'shield' },
                    { label: 'Clock - 24/7 Support', value: 'clock' },
                    { label: 'Star - Quality', value: 'star' },
                  ],
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  localized: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                  localized: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Contact Info',
          fields: [
            {
              name: 'contactInfo',
              type: 'group',
              fields: [
                {
                  name: 'address',
                  type: 'group',
                  fields: [
                    {
                      name: 'line1',
                      type: 'text',
                      defaultValue: 'Marrakech, Morocco',
                      localized: true,
                    },
                    {
                      name: 'line2',
                      type: 'text',
                      defaultValue: 'Near Jemaa el-Fnaa Square',
                      localized: true,
                    },
                  ],
                },
                {
                  name: 'phone',
                  type: 'group',
                  fields: [
                    {
                      name: 'number',
                      type: 'text',
                      defaultValue: '+212 777 926 596',
                    },
                    {
                      name: 'display',
                      type: 'text',
                      admin: {
                        description: 'How the phone number appears (optional)',
                      },
                    },
                  ],
                },
                {
                  name: 'email',
                  type: 'group',
                  fields: [
                    {
                      name: 'address',
                      type: 'email',
                      defaultValue: 'info@atlasmountainsvisit.com',
                    },
                    {
                      name: 'responseTime',
                      type: 'text',
                      defaultValue: 'We reply within 2 hours',
                      localized: true,
                    },
                  ],
                },
                {
                  name: 'whatsapp',
                  type: 'group',
                  fields: [
                    {
                      name: 'number',
                      type: 'text',
                      defaultValue: '+212 777 926 596',
                      admin: {
                        description: 'Include country code',
                      },
                    },
                    {
                      name: 'display',
                      type: 'text',
                      admin: {
                        description: 'How the number appears (optional)',
                      },
                    },
                    {
                      name: 'message',
                      type: 'text',
                      defaultValue: 'We reply within minutes!',
                      localized: true,
                      admin: {
                        description: 'Message shown next to WhatsApp number',
                      },
                    },
                  ],
                },
                {
                  name: 'workingHours',
                  type: 'group',
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      defaultValue: "We're Available",
                      localized: true,
                    },
                    {
                      name: 'line1',
                      type: 'text',
                      defaultValue: '24/7 for WhatsApp & emergencies',
                      localized: true,
                    },
                    {
                      name: 'line2',
                      type: 'text',
                      defaultValue: 'Office: Mon-Sat 9:00 AM - 7:00 PM',
                      localized: true,
                    },
                  ],
                },
                {
                  name: 'socialLinks',
                  type: 'group',
                  fields: [
                    {
                      name: 'instagram',
                      type: 'text',
                      defaultValue: 'https://www.instagram.com/atlasmountainsvisit/',
                    },
                    {
                      name: 'facebook',
                      type: 'text',
                      defaultValue: 'https://www.facebook.com/p/Green-Atlas-Travel-100037206949855',
                    },
                    {
                      name: 'tiktok',
                      type: 'text',
                      defaultValue: 'https://www.tiktok.com/@green.atlas.travel',
                    },
                    {
                      name: 'youtube',
                      type: 'text',
                      defaultValue: 'https://www.youtube.com/channel/UCPXRC2VNDf7UPHjx8LmiYkA',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Form Settings',
          fields: [
            {
              name: 'formSettings',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Send Us a Message',
                  localized: true,
                },
                {
                  name: 'submitButtonText',
                  type: 'text',
                  defaultValue: 'Send Message',
                  localized: true,
                },
                {
                  name: 'successMessage',
                  type: 'textarea',
                  defaultValue: 'Thank you for reaching out. We\'ll get back to you within 2 hours.',
                  localized: true,
                },
                // Form field labels
                {
                  name: 'firstNameLabel',
                  type: 'text',
                  defaultValue: 'First Name',
                  localized: true,
                },
                {
                  name: 'lastNameLabel',
                  type: 'text',
                  defaultValue: 'Last Name',
                  localized: true,
                },
                {
                  name: 'emailLabel',
                  type: 'text',
                  defaultValue: 'Email Address',
                  localized: true,
                },
                {
                  name: 'phoneLabel',
                  type: 'text',
                  defaultValue: 'Phone / WhatsApp',
                  localized: true,
                },
                {
                  name: 'subjectLabel',
                  type: 'text',
                  defaultValue: 'What are you interested in?',
                  localized: true,
                },
                {
                  name: 'subjectPlaceholder',
                  type: 'text',
                  defaultValue: 'Select an option',
                  localized: true,
                },
                {
                  name: 'messageLabel',
                  type: 'text',
                  defaultValue: 'Your Message',
                  localized: true,
                },
                {
                  name: 'messagePlaceholder',
                  type: 'text',
                  defaultValue: 'Tell us about your dream Moroccan adventure...',
                  localized: true,
                },
                {
                  name: 'subjects',
                  type: 'array',
                  admin: {
                    description: 'Subject options for the dropdown',
                  },
                  fields: [
                    {
                      name: 'value',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      localized: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Labels',
          description: 'Section titles and labels for translation',
          fields: [
            {
              name: 'labels',
              type: 'group',
              fields: [
                {
                  name: 'contactInfoTitle',
                  type: 'text',
                  defaultValue: 'Contact Information',
                  localized: true,
                },
                {
                  name: 'visitUsTitle',
                  type: 'text',
                  defaultValue: 'Visit Us',
                  localized: true,
                },
                {
                  name: 'callUsTitle',
                  type: 'text',
                  defaultValue: 'Call Us',
                  localized: true,
                },
                {
                  name: 'emailUsTitle',
                  type: 'text',
                  defaultValue: 'Email Us',
                  localized: true,
                },
                {
                  name: 'whatsappTitle',
                  type: 'text',
                  defaultValue: 'WhatsApp (Fastest)',
                  localized: true,
                },
                {
                  name: 'followUsTitle',
                  type: 'text',
                  defaultValue: 'Follow Us',
                  localized: true,
                },
              ],
            },
          ],
        },
        {
          label: 'FAQ',
          fields: [
            {
              name: 'faq',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Frequently Asked Questions',
                  localized: true,
                },
                {
                  name: 'questions',
                  type: 'array',
                  fields: [
                    {
                      name: 'question',
                      type: 'text',
                      required: true,
                      localized: true,
                    },
                    {
                      name: 'answer',
                      type: 'textarea',
                      required: true,
                      localized: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Map',
          fields: [
            {
              name: 'map',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Find Us in Marrakech',
                  localized: true,
                },
                {
                  name: 'subtitle',
                  type: 'text',
                  defaultValue: 'Located in the heart of the Red City, we\'re easy to find.',
                  localized: true,
                },
                {
                  name: 'embedUrl',
                  type: 'textarea',
                  admin: {
                    description: 'Google Maps embed URL',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              fields: [
                {
                  name: 'metaTitle',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'metaDescription',
                  type: 'textarea',
                  localized: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
