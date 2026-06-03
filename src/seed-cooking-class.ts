// Seeds the "Welcome in Marrakech" cooking class activity from activities.md.
// Run with: npx tsx --env-file=.env src/seed-cooking-class.ts
//
// Idempotent: looks up the activity by slug and updates it if it already exists.
// Only fields explicitly present in activities.md are populated.

// @ts-nocheck
import { getPayload } from 'payload'
import config from './payload.config'

function rtParagraph(text: string) {
  return {
    children: [
      {
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text,
        type: 'text',
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    type: 'paragraph',
    version: 1,
  }
}

function createRichText(paragraphs: string | string[]) {
  const arr = Array.isArray(paragraphs) ? paragraphs : [paragraphs]
  return {
    root: {
      children: arr.map(rtParagraph),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

async function upsertActivity(payload: any, activity: any): Promise<string> {
  const existing = await payload.find({
    collection: 'activities',
    where: { slug: { equals: activity.slug } },
    limit: 1,
  })

  if (existing.docs[0]) {
    const updated = await payload.update({
      collection: 'activities',
      id: existing.docs[0].id,
      locale: 'en',
      data: activity,
    })
    console.log(`  ✓ Updated activity: ${activity.title}`)
    return updated.id
  }

  const created = await payload.create({
    collection: 'activities',
    locale: 'en',
    data: activity,
  })
  console.log(`  ✓ Created activity: ${activity.title}`)
  return created.id
}

async function main() {
  console.log('🌱 Seeding "Welcome in Marrakech" cooking-class activity\n')

  const payload = await getPayload({ config })

  const description = createRichText(
    'Experience an authentic Moroccan cooking class in the heart of the High Atlas Mountains. This full-day trip from Marrakech takes you deep into Berber culture, traditional cuisine, and breathtaking mountain scenery.',
  )

  const itinerary = [
    {
      activity: '🚐 Pickup from Marrakech 1h30',
      description: createRichText(
        'Your day begins with a comfortable pickup from your accommodation in Marrakech and a scenic drive toward the beautiful High Atlas Mountains.',
      ),
    },
    {
      activity: '🏔️ Discover the Atlas Mountains',
      description: createRichText(
        'Enjoy breathtaking landscapes, traditional Berber villages, river valleys, and panoramic mountain views during the journey.',
      ),
    },
    {
      activity: '☕ Welcome Tea in a Berber House',
      description: createRichText(
        'Upon arrival, receive a warm traditional Moroccan mint tea welcome inside an authentic Berber family home.',
      ),
    },
    {
      activity: '👩‍🍳 Moroccan Cooking Class',
      description: createRichText([
        'Learn how to prepare traditional Moroccan dishes with local ingredients and the help of a local cook.',
        'Possible dishes include:',
        '• Tajine',
        '• Moroccan Salad',
        '• Couscous',
        '• Moroccan Mint Tea',
        '• Traditional Bread',
      ]),
    },
    {
      activity: '🍽️ Lunch with Mountain Views',
      description: createRichText(
        'Enjoy the delicious meal you prepared while admiring the peaceful atmosphere of the Atlas Mountains.',
      ),
    },
    {
      activity: '🚶‍♂️ Optional Village Walk',
      description: createRichText(
        'Take a short guided walk through nearby Berber villages and discover local culture and daily mountain life.',
      ),
    },
    {
      activity: '🚐 Return to Marrakech with the drive',
      description: createRichText(
        'We hope you enjoyed this authentic Moroccan cooking experience and created unforgettable memories with the local Berber culture, traditional food, and beautiful mountain landscapes.',
      ),
    },
  ]

  const included = [
    'Hotel pickup and drop-off from Marrakech',
    'Transportation in an air-conditioned vehicle',
    'Traditional Moroccan cooking class',
    'local cooking',
    'Lunch and Moroccan mint tea',
  ].map((i) => ({ item: createRichText(i) }))

  const notIncluded = [
    'Personal expenses',
    'Travel insurance',
    'Extra activities not mentioned in the program',
  ].map((i) => ({ item: createRichText(i) }))

  await upsertActivity(payload, {
    slug: 'welcome-in-marrakech',
    title: 'Welcome in Marrakech',
    description,
    duration: 'Full Day',
    pricingType: 'tiered',
    included,
    notIncluded,
    itinerary,
    isActive: true,
  })

  console.log('\n✅ Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
