import type { GlobalConfig } from 'payload'
import { revalidateGlobalAfterChange } from '@/hooks/revalidateOnChange'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Settings',
    description: 'Global site settings including contact info and social links',
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
          label: 'Contact Information',
          fields: [
            {
              name: 'contact',
              type: 'group',
              fields: [
                {
                  name: 'phone',
                  type: 'group',
                  fields: [
                    {
                      name: 'countryCode',
                      type: 'text',
                      required: true,
                      defaultValue: '+212',
                      admin: {
                        description: 'Country code with + (e.g., +212 for Morocco)',
                        width: '30%',
                      },
                    },
                    {
                      name: 'number',
                      type: 'text',
                      required: true,
                      defaultValue: '629102424',
                      admin: {
                        description: 'Phone number without country code (e.g., 629102424)',
                        width: '70%',
                      },
                    },
                    {
                      name: 'display',
                      type: 'text',
                      defaultValue: '+212 629-102424',
                      admin: {
                        description: 'Formatted display version (e.g., +212 777-926596)',
                      },
                    },
                  ],
                },
                {
                  name: 'email',
                  type: 'email',
                  required: true,
                  defaultValue: 'atlasmountainsvisit@gmail.com',
                  admin: {
                    description: 'Main contact email address',
                  },
                },
                {
                  name: 'address',
                  type: 'group',
                  fields: [
                    {
                      name: 'line1',
                      type: 'text',
                      defaultValue: 'Marrakech',
                      admin: {
                        description: 'City or main address line',
                      },
                    },
                    {
                      name: 'line2',
                      type: 'text',
                      defaultValue: 'Morocco',
                      admin: {
                        description: 'Country or secondary address line',
                      },
                    },
                    {
                      name: 'full',
                      type: 'text',
                      defaultValue: 'Marrakech, Morocco',
                      admin: {
                        description: 'Full address for display',
                      },
                    },
                  ],
                },
                {
                  name: 'availability',
                  type: 'text',
                  defaultValue: '24/7',
                  admin: {
                    description: 'Availability hours (e.g., 24/7, 9AM-6PM)',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Social Links',
          fields: [
            {
              name: 'social',
              type: 'group',
              fields: [
                {
                  name: 'facebook',
                  type: 'text',
                  defaultValue: 'https://www.facebook.com/share/18rfo2mmva/',
                  admin: {
                    description: 'Full Facebook page URL',
                  },
                },
                {
                  name: 'instagram',
                  type: 'text',
                  defaultValue: 'https://www.instagram.com/atlas_mountains_visit?igsh=MWJhN3FpeXh5dXV0dQ==',
                  admin: {
                    description: 'Full Instagram profile URL',
                  },
                },
                {
                  name: 'youtube',
                  type: 'text',
                  admin: {
                    description: 'Full YouTube channel URL (optional)',
                  },
                },
                {
                  name: 'tiktok',
                  type: 'text',
                  defaultValue: 'https://www.tiktok.com/@visit_atlas_mountains?_r=1&_t=ZS-972qRKPxftc',
                  admin: {
                    description: 'Full TikTok profile URL (optional)',
                  },
                },
                {
                  name: 'twitter',
                  type: 'text',
                  admin: {
                    description: 'Full Twitter/X profile URL (optional)',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Company Info',
          fields: [
            {
              name: 'company',
              type: 'group',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  defaultValue: 'Atlas Mountain Visit',
                  admin: {
                    description: 'Official company name',
                  },
                },
                {
                  name: 'shortName',
                  type: 'text',
                  defaultValue: 'Atlas Mountain Visit',
                  admin: {
                    description: 'Short company name for headers/emails',
                  },
                },
                {
                  name: 'tagline',
                  type: 'text',
                  defaultValue: 'Marrakech Adventures',
                  localized: true,
                  admin: {
                    description: 'Company tagline/slogan',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
