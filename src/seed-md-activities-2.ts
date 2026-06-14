// Seeds activities copied from activities.md.
// Run with: npx tsx --env-file=.env.local src/seed-md-activities-2.ts
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
  // 1) 3 Day in Morocco ; Agafay Desert and Atlas Mountains from Marrakech
  // -------------------------------------------------------------------------
  const agafayAtlasDescription = createRichText(
    'Experience the perfect combination of desert and mountain landscapes. Enjoy an unforgettable night in the Agafay Desert with your choice of a camel ride, quad biking, or horse riding, followed by a traditional dinner, live music, and a spectacular fire show under the stars. Continue to Imlil in the High Atlas Mountains for an authentic Berber experience before returning to Marrakech.',
  )

  const agafayAtlasItinerary = [
    {
      activity: 'Day 1: Marrakech → Agafay Desert (40mintes drive)',
      description: createRichText([
        'Pick-up from your accommodation in Marrakech.',
        'Drive to the Agafay Desert.',
        'Welcome tea upon arrival.',
        'Choose your preferred activity:',
        '• Camel ride',
        '• Quad biking',
        '• Horse riding',
        'Enjoy the sunset over the desert.',
        'Traditional Moroccan dinner.',
        'Live music entertainment.',
        'Spectacular fire show under the stars.',
        'Campfire experience.',
        'Overnight stay in a desert camp.',
      ]),
    },
    {
      activity: 'Day 2: Agafay Desert → Imlil (1h30drvie)',
      description: createRichText([
        '• Breakfast at the camp.',
        '• Transfer to Imlil, in the heart of the High Atlas Mountains.',
        '• Upon arrival in Imlil, you can choose from the following activities:',
        '• Short walk to the Imlil Waterfalls',
        '• Visit the Berber village of Aremd',
        '• Cooking Class in Berber house',
        '• Explore the local village and its traditional atmosphere',
        'Traditional lunch.',
        '🌃 Dinner and overnight stay in a guesthouse in Imlil.',
      ]),
    },
    {
      activity: 'Day 3: Imlil → Marrakech (1h30drvie)',
      description: createRichText([
        'Breakfast at the guesthouse.',
        'Free time to enjoy the peaceful mountain surroundings.',
        'Departure from Imlil and transfer back to Marrakech.',
        'End of the tour.',
      ]),
    },
  ]

  const agafayAtlasHighlights = [
    'Night in a Agafay Desert camp',
    'Camel ride, quad biking, or horse riding',
    'Fire show & live music under the stars',
    'Imlil village & High Atlas Mountains',
    'Authentic Berber guesthouse stay',
    'Traditional Moroccan meals included',
  ].map((h) => ({ highlight: createRichText(h) }))

  const agafayAtlasIncluded = [
    '🚐 Transportation from/to Marrakech',
    '🏕️ 1 night in Agafay Desert Camp',
    '🏔️ 1 night in atlas mountains',
    '🍽️ Meals during the trek (lunch, dinner & breakfast)',
    '🎶 Live music',
    '🔥 Fire show',
  ].map((i) => ({ item: createRichText(i) }))

  const agafayAtlasNotIncluded = [
    '💊 Personal medication',
    '💰 Personal expenses',
  ].map((i) => ({ item: createRichText(i) }))

  await upsertActivity(payload, {
    slug: '3-day-in-morocco-agafay-desert-and-atlas-mountains-from-marrakech',
    title: '3 Day in  Morocco ; Agafay Desert and Atlas Mountains from Marrakech',
    description: agafayAtlasDescription,
    duration: '3 Days / 2 Nights',
    pricingType: 'tiered',
    highlights: agafayAtlasHighlights,
    included: agafayAtlasIncluded,
    notIncluded: agafayAtlasNotIncluded,
    itinerary: agafayAtlasItinerary,
    isActive: true,
  })

  // -------------------------------------------------------------------------
  // 2) 5-Day in atlas mountains with mountain Toubkal
  // -------------------------------------------------------------------------
  const atlasToubkalDescription = createRichText(
    'A 5-day adventure through the High Atlas Mountains, from Marrakech to Oukaïmeden, Tacheddirt, and Imlil, culminating with the ascent of Jbel Toubkal (4,167m), the highest peak in North Africa. Discover authentic Berber culture, breathtaking mountain landscapes, and optional nights under the stars for a truly immersive and unforgettable trekking experience.',
  )

  const atlasToubkalItinerary = [
    {
      activity: 'Day1:Marrakech→Oukaïmeden(1h30drvie)',
      description: createRichText([
        'We start the journey in the morning from Marrakech towards Oukaïmeden, driving through scenic mountain roads, traditional Berber villages, and beautiful valleys.',
        'Upon arrival in Oukaïmeden (around 2,600m altitude), we explore the area:',
        '• Visit ancient Berber rock carvings (petroglyphs)',
        '• Short walk around the peaceful mountain lake',
        '• Enjoy panoramic views of the High Atlas peaks',
        '• There are many things you can discover in the Oukaïmeden area.',
        '🏔️ Overnight: Oukaïmeden guesthouse',
        '📍 Altitude: 2,600m',
        '🥾 Hiking time: 2h',
      ]),
    },
    {
      activity: 'Day 2: Oukaïmeden → Tacheddirt',
      description: createRichText([
        'After breakfast, we start a beautiful descent and trekking route towards the remote village of Tacheddirt, one of the highest villages in North Africa.',
        '• Scenic walk through high mountain landscapes',
        '• Pass traditional Berber paths and valley imnan',
        '• Lunch on the way to Tacheddirt',
        '🏔️ Overnight: Tacheddirt guesthouse',
        '📍 Altitude: 2,300m',
        '🥾 Hiking time: 4–5 hours',
      ]),
    },
    {
      activity: 'Day 3: Tacheddirt → Imlil',
      description: createRichText([
        'After breakfast, we continue trekking to imlil valley.',
        "•The lunch in Tizi n'Tamatert",
        '•Enjoy spectacular mountain views',
        '🏔️ Overnight: imlil hotel',
        '📍 Altitude: 1,700m',
        '🥾 Hiking time: 4–5hours',
      ]),
    },
    {
      activity: 'Day 4: Imlil → Toubkal Refuge',
      description: createRichText([
        'Today we begin the ascent towards Mount Toubkal.',
        '• Pass Sidi Chamharouch shrine and lunch',
        '• climb Mount Toubkal (4167m)',
        '🏔️ Overnight: Toubkal Refuge',
        '📍 Altitude: (3207m)',
        '🥾 Hiking time: 5–6 hours',
      ]),
    },
    {
      activity: 'Day 5: Toubkal Summit → Imlil → Marrakech',
      description: createRichText([
        'Early morning ascent to the summit of Jbel Toubkal (4,167 m), the highest peak in North Africa.',
        '• Early ascent to Mount Toubkal (4,167m)',
        '• Enjoy breathtaking panoramic views',
        '• Descend to refuge, then continue to Imlil',
        '• Transfer back to Marrakech',
        '🥾 Hiking time: 10–12 hours',
        '📍 Highest point: 4,167m',
      ]),
    },
  ]

  const atlasToubkalHighlights = [
    '🏔️ Summit Jbel Toubkal (4,167m) — the highest peak in North Africa',
    '🏡 Choose your experience—sleep in a cozy Berber guesthouse or spend the night under the stars in a traditional tent.',
    '🪨 Explore ancient Berber petroglyphs in Oukaïmeden.',
    '🌄 Stunning panoramic views of the High Atlas Mountains.',
    '🥾 Walk historic mountain paths used by Berbers for centuries.',
    '🍽️ Enjoy authentic Moroccan meals on the trail.',
    '🚐 Convenient departure & return from Marrakech.',
  ].map((h) => ({ highlight: createRichText(h) }))

  const atlasToubkalIncluded = [
    '🧭 Professional guide',
    '🏡 All accommodation (guesthouses, mountain refuge or tent — your choice)',
    '🍽️ All meals throughout the trip (breakfasts, lunches & dinners)',
    '🚐 Transport: (pick-up & drop-off)',
    '🫏 Mule for carrying group equipment & supplies.',
  ].map((i) => ({ item: createRichText(i) }))

  const atlasToubkalNotIncluded = [
    '🛡️ Travel insurance',
    '🎒 Personal trekking gear & equipment',
    '🍫 Personal snacks & extra drinks',
    '💳 Any expenses of a personal nature',
  ].map((i) => ({ item: createRichText(i) }))

  await upsertActivity(payload, {
    slug: '5-day-in-atlas-mountains-with-mountain-toubkal',
    title: '5-Day in atlas mountains with mountain Toubkal',
    description: atlasToubkalDescription,
    duration: '5 Days / 4 Nights',
    pricingType: 'tiered',
    highlights: atlasToubkalHighlights,
    included: atlasToubkalIncluded,
    notIncluded: atlasToubkalNotIncluded,
    itinerary: atlasToubkalItinerary,
    isActive: true,
  })

  // -------------------------------------------------------------------------
  // 3) Atlas Mountains 6-Day Trek - Berber Villages, Lake Ifni & Toubkal Summit.
  // -------------------------------------------------------------------------
  const lakeIfniToubkalDescription = createRichText(
    '6-Day Toubkal Trek from Marrakech Join an unforgettable adventure through the High Atlas Mountains, passing Berber villages, valleys, and Lake Ifni, before reaching the summit of Mount Toubkal (4167m) A perfect mix of trekking, culture, and wild camping in Morocco.',
  )

  const lakeIfniToubkalItinerary = [
    {
      activity: 'Day 1: Marrakech – Imlil – Tizi Tamatert (2300m) – Tachddirt Village (2314m)',
      description: createRichText([
        'Drive from Marrakech to Imlil, then start hiking through scenic valleys to Tizi Tamatert pass. Continue to Tachddirt village.',
        '🏕️ Overnight: Guesthouse or camping',
        '⏱️ Hiking time: Approx. 5–6 hours',
      ]),
    },
    {
      activity: 'Day 2: Tachddirt – Tizi Likemt (3550m) – Azib Likemt (2200m)',
      description: createRichText([
        'A steady and challenging ascent to Tizi Likemt pass with panoramic mountain views, followed by descent to Azib Likemt.',
        '🏕️ Overnight: Camping',
        '⏱️ Hiking time: Approx. 6–7 hours',
      ]),
    },
    {
      activity: 'Day 3: Azib Likemt – Aouray Valley – Amsouzart Village (1700m)',
      description: createRichText([
        'Trek through the beautiful Aouray Valley with changing landscapes and Berber villages. Arrival in Amsouzart.',
        '🏨 Overnight: Hotel or guesthouse',
        '⏱️ Hiking time: Approx. 5–6 hours',
      ]),
    },
    {
      activity: 'Day 4: Amsouzart – Lake Ifni (2300m)',
      description: createRichText([
        'Walk through traditional villages and mountain scenery to reach Lake Ifni, the only natural lake in the Toubkal region.',
        '⛺ Overnight: Camping by the lake',
        '⏱️ Hiking time: Approx. 5–6 hours',
      ]),
    },
    {
      activity: 'Day 5: Lake Ifni – Tizi n Ouanoums (3650m) – Toubkal Refuge (3207m)',
      description: createRichText([
        'The hardest day with a steep climb to the high pass, followed by descent to the refuge.',
        '🏔️ Overnight: Toubkal Refuge (mountain shelter or tents)',
        '⏱️ Hiking time: Approx. 7–8 hours',
      ]),
    },
    {
      activity: 'Day 6: Toubkal Refuge – Toubkal Summit (4167m) – Marrakech',
      description: createRichText([
        'Early morning climb to the summit of Mount Toubkal, then descend via Sidi Chamharouch back to Imlil and drive to Marrakech.',
        '🚫 Overnight: Not included (end of trip)',
        '⏱️ Hiking time: 8–10 hours',
      ]),
    },
  ]

  const lakeIfniToubkalIncluded = [
    '🧭 Professional guide',
    '🏡 All accommodation (guesthouses, mountain refuge or tent — your choice)',
    '🍽️ All meals throughout the trip (breakfasts, lunches & dinners)',
    '🚐 Transport: (pick-up & drop-off)',
    '🫏 Mule for carrying group equipment & supplies.',
  ].map((i) => ({ item: createRichText(i) }))

  const lakeIfniToubkalNotIncluded = [
    '🛡️ Travel insurance',
    '🎒 Personal trekking gear & equipment',
    '🍫 Personal snacks & extra drinks',
    '💳 Any expenses of a personal nature',
  ].map((i) => ({ item: createRichText(i) }))

  await upsertActivity(payload, {
    slug: 'atlas-mountains-6-day-trek-berber-villages-lake-ifni-and-toubkal-summit',
    title: 'Atlas Mountains 6-Day Trek - Berber Villages, Lake Ifni & Toubkal Summit.',
    description: lakeIfniToubkalDescription,
    duration: '6 Days',
    pricingType: 'tiered',
    included: lakeIfniToubkalIncluded,
    notIncluded: lakeIfniToubkalNotIncluded,
    itinerary: lakeIfniToubkalItinerary,
    isActive: true,
  })

  // -------------------------------------------------------------------------
  // 4) 2 Days Atlas Mountains Trek
  // -------------------------------------------------------------------------
  const atlas2DayDescription = createRichText(
    'Escape the city and discover the beauty of the Atlas Mountains on this 2-day trek from Marrakech. Hike through Tizi Mzik Pass, visit the stunning Ighouliden Waterfalls, explore traditional Berber villages, and spend a night in the peaceful Tamsoult Refuge surrounded by breathtaking mountain scenery.',
  )

  const atlas2DayItinerary = [
    {
      activity: 'Day 1: Marrakech – Imlil – Tizi Mzik – Tamsoult',
      description: createRichText(
        'Pick up from Marrakech and transfer to Imlil (1,740m), the gateway to the High Atlas Mountains. Begin your trek through scenic mountain trails to the Tizi Mzik Pass (2,489m), offering breathtaking panoramic views. Continue down towards the beautiful Ighouliden Waterfalls before reaching Tamsoult Refuge, where you will spend the night surrounded by stunning mountain landscapes.',
      ),
    },
    {
      activity: 'Day 2: Tamsoult – Azzaden Valley – Tizi Oudid – Marrakech',
      description: createRichText(
        'After breakfast, trek through the picturesque Azzaden Valley, passing the traditional Berber villages of Tizi Oussem and Aït Aïssa. Ascend to the Tizi Oudid Pass (2,200m) and enjoy spectacular views of the surrounding peaks and valleys. Descend to the village of Aguersioual (1,600m) for lunch before transferring back to Marrakech.',
      ),
    },
  ]

  const atlas2DayHighlights = [
    'Scenic trek through the High Atlas Mountains',
    'Cross the Tizi Mzik Pass (2,489m)',
    'Visit the beautiful Ighouliden Waterfalls',
    'Explore traditional Berber villages',
    'Discover the stunning Azzaden Valley',
    'Overnight stay at Tamsoult Refuge',
    'Visit imlil valley and Azzaden Valley',
    'Experience authentic Berber culture and',
  ].map((h) => ({ highlight: createRichText(h) }))

  const atlas2DayIncluded = [
    '🚐 Transport: (pick-up & drop-off)',
    '🥾 Professional mountain guide',
    '🏡 1 night at Tamsoult Refuge',
    '🍽️ Breakfast, Lunch & Dinner',
    '🐴 Mule for luggage transport',
  ].map((i) => ({ item: createRichText(i) }))

  const atlas2DayNotIncluded = [
    '💊 Personal medication',
    '🛡️ Travel insurance',
    '💰 Personal expenses',
  ].map((i) => ({ item: createRichText(i) }))

  await upsertActivity(payload, {
    slug: '2-days-atlas-mountains-trek',
    title: '2 Days Atlas Mountains Trek',
    description: atlas2DayDescription,
    duration: '2 Days / 1 Night',
    pricingType: 'tiered',
    highlights: atlas2DayHighlights,
    included: atlas2DayIncluded,
    notIncluded: atlas2DayNotIncluded,
    itinerary: atlas2DayItinerary,
    isActive: true,
  })

  console.log('\n✅ Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
