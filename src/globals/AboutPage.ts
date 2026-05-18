import type { GlobalConfig } from 'payload'

import { revalidateGlobalAfterChange } from '@/hooks/revalidateOnChange'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About Page',
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
          label: 'Hero Section',
          fields: [
            {
              name: 'hero',
              type: 'group',
              fields: [
                {
                  name: 'badge',
                  type: 'text',
                  defaultValue: 'Who We Are',
                  localized: true,
                },
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Your Gateway to',
                  localized: true,
                },
                {
                  name: 'titleHighlight',
                  type: 'text',
                  defaultValue: 'Authentic Morocco',
                  localized: true,
                  admin: {
                    description: 'Shown in green',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue: 'Green Atlas Travel is a Moroccan travel agency specializing in tailor-made journeys, from authentic escapes to comfortable and well-crafted adventures.',
                  localized: true,
                },
                {
                  name: 'backgroundImage',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
        {
          label: 'Stats',
          fields: [
            {
              name: 'stats',
              type: 'array',
              maxRows: 4,
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
                {
                  name: 'icon',
                  type: 'select',
                  defaultValue: 'clock',
                  options: [
                    { label: 'Clock', value: 'clock' },
                    { label: 'Users', value: 'users' },
                    { label: 'Star', value: 'star' },
                    { label: 'Map Pin', value: 'mapPin' },
                    { label: 'Award', value: 'award' },
                    { label: 'Heart', value: 'heart' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Our Story',
          fields: [
            {
              name: 'story',
              type: 'group',
              fields: [
                {
                  name: 'badge',
                  type: 'text',
                  defaultValue: 'Our Story',
                  localized: true,
                  admin: {
                    description: 'Badge text shown above the title',
                  },
                },
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Driven by a Deep',
                  localized: true,
                },
                {
                  name: 'titleHighlight',
                  type: 'text',
                  defaultValue: 'Passion for Morocco',
                  localized: true,
                  admin: {
                    description: 'Shown in green',
                  },
                },
                {
                  name: 'paragraphs',
                  type: 'array',
                  fields: [
                    {
                      name: 'text',
                      type: 'textarea',
                      required: true,
                      localized: true,
                    },
                  ],
                },
                {
                  name: 'highlights',
                  type: 'array',
                  admin: {
                    description: 'Bullet points shown in the story section',
                  },
                  fields: [
                    {
                      name: 'text',
                      type: 'text',
                      required: true,
                      localized: true,
                    },
                  ],
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'badgeValue',
                  type: 'text',
                  defaultValue: '10+',
                },
                {
                  name: 'badgeLabel',
                  type: 'text',
                  defaultValue: 'Years creating unforgettable memories',
                  localized: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Mission',
          fields: [
            {
              name: 'mission',
              type: 'group',
              fields: [
                {
                  name: 'badge',
                  type: 'text',
                  defaultValue: 'Our Mission',
                  localized: true,
                },
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Your Memories,',
                  localized: true,
                },
                {
                  name: 'titleHighlight',
                  type: 'text',
                  defaultValue: 'Our Privilege',
                  localized: true,
                  admin: {
                    description: 'Shown in green',
                  },
                },
                {
                  name: 'paragraphs',
                  type: 'array',
                  fields: [
                    {
                      name: 'text',
                      type: 'textarea',
                      required: true,
                      localized: true,
                    },
                  ],
                },
                {
                  name: 'goalText',
                  type: 'text',
                  defaultValue: 'Our goal? To turn every trip into a lasting memory — inspired by Moroccan hospitality and elevated by our commitment to exceptional service.',
                  localized: true,
                  admin: {
                    description: 'Final emphasized paragraph',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Values',
          fields: [
            {
              name: 'valuesSection',
              type: 'group',
              fields: [
                {
                  name: 'badge',
                  type: 'text',
                  defaultValue: 'What Drives Us',
                  localized: true,
                },
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Our',
                  localized: true,
                },
                {
                  name: 'titleHighlight',
                  type: 'text',
                  defaultValue: 'Values',
                  localized: true,
                  admin: {
                    description: 'Shown in green',
                  },
                },
                {
                  name: 'subtitle',
                  type: 'text',
                  defaultValue: 'Our values guide everything we do, from the experiences we create to the way we treat every guest.',
                  localized: true,
                },
                {
                  name: 'values',
                  type: 'array',
                  maxRows: 4,
                  fields: [
                    {
                      name: 'icon',
                      type: 'select',
                      options: [
                        { label: 'Heart', value: 'heart' },
                        { label: 'Shield', value: 'shield' },
                        { label: 'Award', value: 'award' },
                        { label: 'Users', value: 'users' },
                        { label: 'Star', value: 'star' },
                        { label: 'Globe', value: 'globe' },
                        { label: 'Compass', value: 'compass' },
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
          ],
        },
        {
          label: 'Why Choose Us',
          fields: [
            {
              name: 'whyChooseUs',
              type: 'group',
              fields: [
                {
                  name: 'badge',
                  type: 'text',
                  defaultValue: 'Why Choose Us',
                  localized: true,
                },
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Experience Morocco',
                  localized: true,
                },
                {
                  name: 'titleHighlight',
                  type: 'text',
                  defaultValue: 'Like Never Before',
                  localized: true,
                  admin: {
                    description: 'Shown in green',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue: "We don't just show you Morocco — we help you feel it. Every detail is carefully curated to ensure your journey is seamless, memorable, and truly authentic.",
                  localized: true,
                },
                {
                  name: 'highlights',
                  type: 'array',
                  admin: {
                    description: 'Feature points with checkmarks',
                  },
                  fields: [
                    {
                      name: 'text',
                      type: 'text',
                      required: true,
                      localized: true,
                    },
                  ],
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
        {
          label: 'Team',
          fields: [
            {
              name: 'teamSection',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Meet Our Team',
                  localized: true,
                },
                {
                  name: 'subtitle',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'members',
                  type: 'array',
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'role',
                      type: 'text',
                      required: true,
                      localized: true,
                    },
                    {
                      name: 'bio',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'CTA',
          fields: [
            {
              name: 'cta',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Ready to Explore Morocco?',
                  localized: true,
                },
                {
                  name: 'subtitle',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'primaryButtonText',
                  type: 'text',
                  defaultValue: 'Browse Activities',
                  localized: true,
                },
                {
                  name: 'primaryButtonLink',
                  type: 'text',
                  defaultValue: '/activities',
                },
                {
                  name: 'secondaryButtonText',
                  type: 'text',
                  defaultValue: 'Contact Us',
                  localized: true,
                },
                {
                  name: 'secondaryButtonLink',
                  type: 'text',
                  defaultValue: '/contact',
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
