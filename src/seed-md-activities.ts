// Seeds the three activities from activities.md (mountain bike, Toubkal trek, Imlil overnight).
// Run with: npx tsx --env-file=.env.local src/seed-md-activities.ts
//
// Idempotent: upserts each activity by slug.
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
  console.log('🌱 Seeding activities from activities.md\n')

  const payload = await getPayload({ config })

  // -------------------------------------------------------------------------
  // 1) Atlas Mountain Biking from Imlil to Tachdert
  // -------------------------------------------------------------------------
  const bikeDescription = createRichText(
    'Start your journey with a comfortable pickup from your accommodation in Marrakech and head toward the stunning High Atlas Mountains, where adventure and authentic Berber culture await.',
  )

  const bikeItinerary = [
    {
      activity: '1h30 drive From Marrakech to Imlil',
    },
    {
      activity: '🏔️ ARRIVAL IN IMLIL – GATEWAY TO THE ATLAS',
      description: createRichText(
        'Arrive in the famous mountain village of Imlil, meet your professional local guide, and get fitted with a high-quality mountain bike 🚲. After a short safety briefing, your adventure begins.',
      ),
    },
    {
      activity: '🚴‍♂️ RIDE THROUGH TRADITIONAL AMAZIGH VILLAGES',
      description: createRichText(
        'Cycle through authentic Berber villages such as Ait Souka and Tamatert, surrounded by breathtaking landscapes and panoramic Atlas views.',
      ),
    },
    {
      activity: '🌄 RIDE TOWARDS TACHDERT VILLAGE',
      description: createRichText(
        'Continue your journey along peaceful mountain trails toward the remote village of Tachdert, discovering authentic Amazigh culture and untouched nature.',
      ),
    },
    {
      activity: '🍲 TRADITIONAL LUNCH IN TACHDERT',
      description: createRichText(
        'Enjoy a freshly prepared Moroccan lunch in Tachdert with stunning mountain views and local hospitality.',
      ),
    },
    {
      activity: '🌿 SCENIC DESCENT TO ASNI VALLEY',
      description: createRichText(
        'End your biking adventure with a downhill ride toward Asni Valley before returning comfortably to Marrakech.',
      ),
    },
  ]

  const bikeIncluded = [
    'Full biking experience (3–4 hours ride)',
    'Bike & helmet',
    'Professional guide',
    'Transport',
    'Traditional lunch',
    'Marrakech pickup & drop-off',
  ].map((i) => ({ item: createRichText(i) }))

  const bikeNotIncluded = [
    'Insurance',
    'Drinks',
    'Tips (optional)',
  ].map((i) => ({ item: createRichText(i) }))

  await upsertActivity(payload, {
    slug: 'atlas-mountain-biking-from-imlil-to-tachdert',
    title: 'Atlas Mountain Biking Adventure from Imlil to Tachdert',
    description: bikeDescription,
    duration: 'Full Day',
    pricingType: 'tiered',
    included: bikeIncluded,
    notIncluded: bikeNotIncluded,
    itinerary: bikeItinerary,
    isActive: true,
  })

  // -------------------------------------------------------------------------
  // 2) 2-Day Jbel Toubkal Summit Trek from Marrakech
  // -------------------------------------------------------------------------
  const toubkalDescription = createRichText(
    'Join us for an unforgettable 2-day adventure to the summit of Jbel Toubkal, the highest peak in North Africa. Discover breathtaking Atlas Mountain landscapes, authentic Berber villages, and stunning panoramic views along the way.',
  )

  const toubkalItinerary = [
    {
      activity: 'Day 1: Marrakech – Imlil – Toubkal Refuge',
      description: createRichText([
        'Departure from Marrakech towards the mountain village of Imlil, the starting point of the trek.',
        'You will meet your mountain guide in Imlil and begin hiking through beautiful Berber villages and the shrine of Sidi Chamharouch before continuing to the refuge of Jbel Toubkal.',
        'Overnight stay at the mountain refuge at 3,207 m altitude.',
        '🥾 Hiking time: 5 to 6 hours.',
      ]),
    },
    {
      activity: 'Day 2: Toubkal Summit – Return to Marrakech',
      description: createRichText([
        'Early morning ascent to the summit of Jbel Toubkal (4,167 m), the highest peak in North Africa.',
        'Enjoy breathtaking panoramic views over the Atlas Mountains and surrounding landscapes before descending back to Imlil.',
        'Transfer back to Marrakech in the evening.',
        '🥾 Hiking time: 10 to 12 hours.',
      ]),
    },
  ]

  const toubkalHighlights = [
    'Discover the beauty of the High Atlas Mountains',
    'Trek to the summit of Jbel Toubkal, the highest peak in North Africa',
    'Explore authentic Berber villages and mountain landscapes',
    'Enjoy breathtaking panoramic views from 4,167 meters above sea level',
    'Spend the night at the famous Toubkal mountain refuge',
    'Experience a true adventure with a professional local mountain guide',
  ].map((h) => ({ highlight: createRichText(h) }))

  const toubkalIncluded = [
    '🚐 Round-trip transfer from/to Marrakech',
    '🏠 1 night accommodation at Toubkal refuge',
    '🍽️ Meals during the trek (lunch, dinner & breakfast)',
    '🚶‍♂️ Guide Mountains',
  ].map((i) => ({ item: createRichText(i) }))

  const toubkalNotIncluded = [
    '🎒 Personal hiking gear and clothing',
    '💊 Personal medication',
    '🧑‍🧑‍🧒 Personal expenses',
  ].map((i) => ({ item: createRichText(i) }))

  await upsertActivity(payload, {
    slug: 'jbel-toubkal-summit-trek-2-day-from-marrakech',
    title: '2-Day Jbel Toubkal Summit Trek from Marrakech',
    description: toubkalDescription,
    duration: '2 Days / 1 Night',
    pricingType: 'tiered',
    highlights: toubkalHighlights,
    included: toubkalIncluded,
    notIncluded: toubkalNotIncluded,
    itinerary: toubkalItinerary,
    isActive: true,
  })

  // -------------------------------------------------------------------------
  // 3) Overnight Imlil Adventure & Atlas Mountains Hike from Marrakech
  // -------------------------------------------------------------------------
  const imlilDescription = createRichText([
    'Welcome to Marrakech',
    'Escape the city and enjoy a beautiful 1-night adventure to Imlil in the heart of the High Atlas Mountains. This flexible experience allows you to choose your favorite activity and discover authentic Berber culture, mountain landscapes, and traditional villages.',
  ])

  const imlilItinerary = [
    {
      activity: 'Day 1 – Journey to the Atlas Mountains',
      description: createRichText([
        'Your driver will pick you up from Marrakech and take you to the charming mountain village of Imlil, the gateway to the Atlas Mountains.',
        'After arrival, you can choose one of the following experiences:',
        '• Visit the beautiful Imlil waterfalls and explore the traditional Berber village of Aroumd.',
        '• Hike to the famous Tizi Mzik pass (2,489m), with around 4 hours of walking and lunch surrounded by panoramic mountain views.',
        "• Discover the stunning area of Tamatert (2,700m), including about 4 hours of hiking and lunch at Tizi n'Tamatert with breathtaking scenery over the Atlas valleys.",
      ]),
    },
    {
      activity: 'Day 2: Breakfast with Mountain Views & Return to Marrakech',
      description: createRichText([
        'Enjoy a traditional breakfast with spectacular views over Imlil and the surrounding Atlas Mountains.',
        'After breakfast, meet your driver for the return journey to Marrakech. Along the way, you can stop to discover several authentic Amazigh (Berber) villages and enjoy the peaceful mountain atmosphere before arriving back in Marrakech.',
      ]),
    },
  ]

  const imlilHighlights = [
    'Scenic drive from Marrakech through the High Atlas Mountains',
    'Explore the charming mountain village of Imlil',
    'Choose your own hiking experience (Easy / Moderate / Challenging)',
    'Lunch with panoramic Atlas Mountain views',
    'Overnight stay in a traditional guesthouse in Imlil',
    'Traditional Moroccan breakfast with mountain views',
  ].map((h) => ({ highlight: createRichText(h) }))

  const imlilIncluded = [
    'transfer from/to Marrakech',
    'Professional local guide',
    'Traditional breakfast on Day 2',
    '1 night accommodation in Imlil',
    'dinner and lunch and breakfast',
  ].map((i) => ({ item: createRichText(i) }))

  const imlilNotIncluded = [
    'Personal expenses',
    'walking clothes',
  ].map((i) => ({ item: createRichText(i) }))

  await upsertActivity(payload, {
    slug: 'overnight-imlil-adventure-atlas-mountains-from-marrakech',
    title: 'Overnight Imlil Adventure & Atlas Mountains Hike from Marrakech',
    description: imlilDescription,
    duration: '2 Days / 1 Night',
    pricingType: 'tiered',
    highlights: imlilHighlights,
    included: imlilIncluded,
    notIncluded: imlilNotIncluded,
    itinerary: imlilItinerary,
    isActive: true,
  })

  console.log('\n✅ Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
