import type { GlobalConfig } from 'payload'

import { revalidateGlobalAfterChange } from '@/hooks/revalidateOnChange'

export const GuidesPage: GlobalConfig = {
  slug: 'guides-page',
  label: 'Guides Page',
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
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Meet Our Local Guides in Morocco',
                  localized: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue: 'Contact your favorite local guide directly and tell them what you want to see, for a private, personalized day in Morocco.',
                  localized: true,
                },
                {
                  name: 'ctaText',
                  type: 'text',
                  defaultValue: 'Meet Our Guides',
                  localized: true,
                },
                {
                  name: 'heroImage',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
        {
          label: 'Why Book Directly',
          fields: [
            {
              name: 'trust',
              type: 'group',
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  defaultValue: 'Why Book Directly With a Local Guide',
                  localized: true,
                },
                {
                  name: 'intro',
                  type: 'textarea',
                  defaultValue: 'Every guide on this page is a real person, not a call center or travel agency. Message them directly, tell them what you want to see, and build a private day anywhere in Morocco around your own pace.',
                  localized: true,
                },
                {
                  name: 'ctaText',
                  type: 'text',
                  defaultValue: 'Meet Our Guides',
                  localized: true,
                },
                {
                  name: 'points',
                  type: 'array',
                  maxRows: 4,
                  admin: {
                    description: 'The 4 trust points shown as cards (real people, direct contact, personalized, licensed)',
                  },
                  defaultValue: [
                    {
                      icon: 'users',
                      title: 'Real people, not agencies',
                      description: 'Every guide here is a real individual you can see and read about — not an anonymous booking platform or call center.',
                    },
                    {
                      icon: 'messageCircle',
                      title: 'Direct contact, no middleman',
                      description: 'Message a guide yourself, ask questions, and agree on the details before you book anything.',
                    },
                    {
                      icon: 'wand',
                      title: 'Personalized, not fixed',
                      description: 'Every day is built around what you actually want to see — not a fixed group itinerary.',
                    },
                    {
                      icon: 'shieldCheck',
                      title: 'Licensed guides, clearly marked',
                      description: 'Some of our guides hold an official Ministry of Tourism license. We only show the badge when it\'s true — never assumed.',
                    },
                  ],
                  fields: [
                    {
                      name: 'icon',
                      type: 'select',
                      defaultValue: 'users',
                      options: [
                        { label: 'Users', value: 'users' },
                        { label: 'Message Circle', value: 'messageCircle' },
                        { label: 'Wand', value: 'wand' },
                        { label: 'Shield Check', value: 'shieldCheck' },
                        { label: 'Heart', value: 'heart' },
                        { label: 'Star', value: 'star' },
                        { label: 'Award', value: 'award' },
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
          label: 'CTA Banner',
          fields: [
            {
              name: 'cta',
              type: 'group',
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  defaultValue: 'Ready for a Private Day in Morocco?',
                  localized: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue: 'Pick a guide, send a message, and build a tailor-made day trip around what you actually want to see — no group tours, no fixed itinerary.',
                  localized: true,
                },
                {
                  name: 'buttonText',
                  type: 'text',
                  defaultValue: 'Browse Local Guides',
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
                  defaultValue: 'Frequently Asked',
                  localized: true,
                },
                {
                  name: 'titleHighlight',
                  type: 'text',
                  defaultValue: 'Questions',
                  localized: true,
                  admin: {
                    description: 'Shown in green',
                  },
                },
                {
                  name: 'description',
                  type: 'text',
                  defaultValue: 'Everything you need to know about booking a local guide in Marrakech',
                  localized: true,
                },
                {
                  name: 'items',
                  type: 'array',
                  defaultValue: [
                    {
                      question: 'Is it safe to hire a local guide in Marrakech?',
                      answer: 'Yes. Booking through Atlas Mountain Visit connects you with vetted guides, and we clearly mark who holds an official Ministry of Tourism license. Unofficial people posing as guides near the medina and souks is a known issue in Marrakech — booking ahead avoids it.',
                    },
                    {
                      question: 'How do I know if a guide is officially licensed?',
                      answer: 'Look for the "Officially Licensed Guide" badge on their profile, with their license number shown underneath.',
                    },
                    {
                      question: 'How much does a private guide cost in Marrakech?',
                      answer: "It depends on the guide and tour — check each guide's tours for pricing, or send an inquiry for details.",
                    },
                    {
                      question: 'Can I book a guide for just one day?',
                      answer: 'Yes, most guides offer single-day private tours.',
                    },
                    {
                      question: 'Do the guides speak English?',
                      answer: 'Most do — each profile lists the languages that guide speaks.',
                    },
                    {
                      question: 'How do I contact a guide before booking?',
                      answer: 'Use the "Ask About Touring" form on their profile — we\'ll pass your message to that specific guide.',
                    },
                    {
                      question: "What's the difference between a licensed and unlicensed guide?",
                      answer: 'A licensed guide passed official training and holds a Ministry of Tourism card. We never claim every guide here is licensed — use the "Licensed guides only" filter if that matters to you.',
                    },
                  ],
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
