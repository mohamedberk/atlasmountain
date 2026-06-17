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

  // -------------------------------------------------------------------------
  // 5) Best 6 day in Morocco with Sahara
  // -------------------------------------------------------------------------
  const best6DayDescription = createRichText([
    'From Marrakech to the Sahara Desert, Imperial Cities & Blue City',
    'Discover Morocco in 6 unforgettable days, crossing the High Atlas Mountains, exploring ancient kasbahs, riding camels in the Sahara Desert, and visiting the imperial cities of Fes, Rabat, and Casablanca, ending in the famous in Casablanca.',
  ])

  const best6DayItinerary = [
    {
      activity: 'Day 1: Marrakech → Dades Gorges',
      description: createRichText([
        'Departure from Marrakech through the High Atlas Mountains via Tizi n’Tichka Pass with scenic stops along the way. Visit Ait Ben Haddou Kasbah (UNESCO World Heritage Site) and explore its ancient alleys. Continue through Ouarzazate, Rose Valley, and Skoura palm grove before arriving at Dades Gorges for overnight stay in the mountains.',
        '📍 Start point: Marrakech (Hotel/Riad pickup 07:00 or 08:00)',
        '🍽️ Meals: Breakfast, Dinner',
        '✅ Included activities:',
        '🧭 Guided visit of Ait Ben Haddou with local guide',
        '⭐ Optional activities:',
        '🥐 Breakfast stop at Ait Barka Village',
        '🍴 Lunch at Ait Ben Haddou (free time)',
        '🗺️ Landmarks:',
        '. Tizi n’Tichka Pass',
        '. Ait Barka Village',
        '. Ait Ben Haddou',
        '. Ouarzazate',
        '. Skoura Palm Grove',
        '. Dades Valley',
        '. Dades Gorges',
      ]),
    },
    {
      activity: 'Day 2: Dades Gorges → Merzouga (Sahara Desert)',
      description: createRichText([
        'After breakfast, travel along the Road of 1000 Kasbahs, passing Berber villages and stopping in Tineghir to see its palm groves and old Jewish quarter. Continue to Todra Gorges for free time to walk through the canyon, then have lunch on your own. In the afternoon, drive to Merzouga and the Erg Chebbi dunes. At sunset, enjoy a 1h camel ride to the desert camp, where you spend the night in a nomadic-style tent with traditional music under the stars.',
        '🍽️ Meals: Breakfast, Dinner',
        '🌃 night : camp Sahara',
        '✅ Included Activities:',
        '🐪 Camel ride at sunset (1h)',
        '🏕️ Overnight in Berber desert camp with nomadic tents',
        '⭐ Optional Activities:',
        '🚶 Trek in Todra Gorges canyon (free time)',
        '🍴 Lunch on the way (free time)',
        '🏍Sahara quad bikes / ATV ride',
        '🥁 Traditional drum music with camel drivers',
        '🗺️ Landmarks:',
        '. Dades Valley',
        '. Tineghir',
        '. Todra Gorges',
        '. Merzouga',
      ]),
    },
    {
      activity: 'Day 3: Merzouga → Fes',
      description: createRichText([
        'Start the day with sunrise over the Erg Chebbi dunes, followed by breakfast at the camp and a short camel ride back to Merzouga village. Then drive towards Fes through the Ziz Valley, with a lunch stop in Midelt. Continue through the Cedar Forest to see wild monkeys and pass Ifrane before arriving in Fes in the evening.',
        '🍽️ Meals: Breakfast, Dinner',
        '✅ Included Activities:',
        '🌄 Sunrise over Erg Chebbi dunes',
        '🐪 Morning camel trek back to Merzouga village',
        '🐒 Visit to wild monkeys in Cedar Forest',
        '⭐ Optional Activities:',
        '🍴 Lunch in Midelt (free time)',
        '🗺️ Landmarks',
        '. Merzouga',
        '. Ziz Valley',
        '. Errachidia',
        '. Midelt',
        '. Cedar Forest',
        '. Ifrane City',
      ]),
    },
    {
      activity: 'Day 4: Fes (Full Day)',
      description: createRichText([
        'After breakfast, explore the old medina of Fes with its narrow streets and historic atmosphere. Visit key sites including the Royal Palace gate, Blue Gate, the Mellah, Al Quaraouiyine University, the tanneries, and Moulay Idriss mausoleum. After lunch, visit a local tile cooperative and enjoy panoramic views over the medina before returning to the riad for overnight stay.',
        '🍽️ Meals: Breakfast, Dinner',
        '✅ Included Activities:',
        '🧭 Guided tour of Fes Medina with local guide',
        '🏰 Visit Royal Palace Gate & Blue Gate',
        '🕍 Visit Jewish Quarter (Mellah)',
        '🎓 Visit Al Quaraouiyine University',
        '🏺 Visit traditional tanneries',
        '🕌 Visit Moulay Idriss mausoleum',
        '🏺 Visit tile cooperative',
        '🌄 Panoramic view over Fes Medina',
        '⭐ Optional Activities:',
        '🍴 Lunch (free time)',
        '🗺️ Landmarks:',
        '. Visit Fes Medina',
        '. Royal Palace Gate',
        '. Blue Gate (Bab Boujloud)',
        '. Mellah (Jewish Quarter)',
        '. Al Quaraouiyine University',
        '. Tanneries of Fes',
        '. Moulay Idriss Mausoleum',
      ]),
    },
    {
      activity: 'Day 5 Fes → Chefchaouen (Blue City)',
      description: createRichText([
        'Fes to Chefchaouen',
        'Early in the morning, depart from Fes and travel through the scenic Rif Mountains towards Chefchaouen, known as the "Blue City." Along the way, enjoy panoramic mountain views and changing landscapes.',
        '🍽️ Meals: Breakfast, Dinner',
        '⭐ Optional Activities:',
        '🛍️ Shopping for wool garments and woven blankets',
        '🚶 Exploration of the Blue City',
        '🗺️ Landmarks:',
        '. Rif Mountains',
        '. Chefchaouen Blue City',
      ]),
    },
    {
      activity: 'Day 6 :Chefchaouen → Casablanca → Marrakech',
      description: createRichText([
        'After breakfast in Chefchaouen, depart towards Rabat, the capital of Morocco. Upon arrival, explore the city’s main landmarks including Bab Chellah, the Mausoleum of Mohammed V, the Royal Palace gates, the Kasbah of the Udayas, and the Hassan Tower.',
        'After lunch at a local restaurant, continue the journey to Casablanca to visit the iconic Hassan II Mosque, one of the most impressive architectural landmarks in Morocco.',
        'In the late afternoon, travel back to Marrakech where the trip concludes.',
        '📍 End Point',
        'Casablanca to Marrakech drop-off (hotel/riad)',
        '🍽️ Meals: Breakfast included',
        '✅ Included Activities',
        '🕌 Bab Chellah',
        '🕊️ Mausoleum of Mohammed V',
        '🏰 Kasbah of the Udayas',
        '🏯 Hassan Tower',
        '🕌 Hassan II Mosque',
        '⭐ Optional Activities',
        '🍴 Lunch at a local restaurant in Rabat (free time available)',
        '☕ Explore local cafés and corniche views in Casablanca (optional leisure stop)',
      ]),
    },
  ]

  const best6DayHighlights = [
    'Drive through the High Atlas Mountains via Tizi n’Tichka Pass',
    'Visit the UNESCO World Heritage site of Ait Ben Haddou Kasbah',
    'Explore the stunning Dades Valley & Todra Gorges',
    'Camel trekking across the golden dunes of Erg Chebbi (Sahara Desert)',
    'Overnight in a traditional Berber desert camp under the stars',
    'Watch the magical sunrise over the Sahara Desert',
    'See wild monkeys in the Cedar Forest of the Middle Atlas',
    'Guided cultural tour of Fes Medina (UNESCO site)',
    'Discover the famous blue streets of Chefchaouen',
    'Visit Rabat’s historical monuments (Hassan Tower, Kasbah of the Udayas)',
    'Explore the iconic Hassan II Mosque in Casablanca',
    'Experience Morocco’s most diverse landscapes in one trip',
  ].map((h) => ({ highlight: createRichText(h) }))

  const best6DayIncluded = [
    '🚐 Pick-up and drop-off from your accommodation in Marrakech',
    '🚗 Transportation in comfortable air-conditioned vehicle',
    '👨‍✈️ Professional English-speaking driver/guide',
    '🌃 Accommodation for 5 nights (hotel / riad / desert camp)',
    '🍽️ Daily meals: breakfast & dinner (as mentioned in itinerary)',
    '🐪 Camel trekking in the Sahara Desert',
    '🌌 Overnight stay in a Berber desert camp',
  ].map((i) => ({ item: createRichText(i) }))

  const best6DayNotIncluded = [
    '🍴 Lunches during the tour',
    '🎟️ Entrance fees to monuments (where applicable)',
    '🏍️ Optional activities (quad biking, ATV, sandboarding, etc.)',
    '🧑‍🤝‍🧑 Personal expenses (drinks, souvenirs, tips)',
    '📶 Personal travel insurance',
  ].map((i) => ({ item: createRichText(i) }))

  await upsertActivity(payload, {
    slug: 'best-6-day-in-morocco-with-sahara',
    title: 'Best 6 day in Morocco with Sahara',
    description: best6DayDescription,
    duration: '6 Days / 5 Nights',
    pricingType: 'tiered',
    highlights: best6DayHighlights,
    included: best6DayIncluded,
    notIncluded: best6DayNotIncluded,
    itinerary: best6DayItinerary,
    isActive: true,
  })

  // -------------------------------------------------------------------------
  // 6) The best week in morocco.
  // -------------------------------------------------------------------------
  const bestWeekDescription = createRichText(
    'One week in Morocco tour from Marrakech covering the High Atlas Mountains, Ait Ben Haddou, Dades Valley, Todra Gorges, and a Sahara Desert camel trek with overnight camp in Merzouga. Continue through the Middle Atlas to Fes, then explore Chefchaouen (Blue City), Rabat, and Casablanca including Hassan II Mosque. End with Essaouira on the Atlantic coast and return to Marrakech.',
  )

  const bestWeekItinerary = [
    {
      activity: 'Day 1: Marrakech → Dades Gorges',
      description: createRichText([
        'Departure from Marrakech through the High Atlas Mountains via Tizi n’Tichka Pass with scenic stops along the way. Visit Ait Ben Haddou Kasbah (UNESCO World Heritage Site) and explore its ancient alleys. Continue through Ouarzazate, Rose Valley, and Skoura palm grove before arriving at Dades Gorges for overnight stay in the mountains.',
        '📍 Start point: Marrakech (Hotel/Riad pickup 07:00 or 08:00)',
        '🍽️ Meals: Breakfast, Dinner',
        '📍 Overnight: Dades Gorges',
        '✅ Included activities:',
        '🧭 Guided visit of Ait Ben Haddou with local guide',
        '⭐ Optional activities:',
        '🥐 Breakfast stop at Ait Barka Village',
        '🍴 Lunch at Ait Ben Haddou (free time)',
        '🗺️ Landmarks:',
        '. Tizi n’Tichka Pass',
        '. Ait Barka Village',
        '. Ait Ben Haddou',
        '. Ouarzazate',
        '. Skoura Palm Grove',
        '. Dades Valley',
        '. Dades Gorges',
      ]),
    },
    {
      activity: 'Day 2: Dades Gorges → Merzouga (Sahara Desert)',
      description: createRichText([
        'After breakfast, travel along the Road of 1000 Kasbahs, passing Berber villages and stopping in Tineghir to see its palm groves and old Jewish quarter. Continue to Todra Gorges for free time to walk through the canyon, then have lunch on your own. In the afternoon, drive to Merzouga and the Erg Chebbi dunes. At sunset, enjoy a 1h camel ride to the desert camp, where you spend the night in a nomadic-style tent with traditional music under the stars.',
        '🍽️ Meals: Breakfast, Dinner',
        '🌃 night : camp Sahara',
        '✅ Included Activities:',
        '🐪 Camel ride at sunset (1h)',
        '🏕️ Overnight in Berber desert camp with nomadic tents',
        '⭐ Optional Activities:',
        '🚶 Trek in Todra Gorges canyon (free time)',
        '🍴 Lunch on the way (free time)',
        '🏍Sahara quad bikes / ATV ride',
        '🥁 Traditional drum music with camel drivers',
        '🗺️ Landmarks:',
        '. Dades Valley',
        '. Tineghir',
        '. Todra Gorges',
        '. Merzouga',
      ]),
    },
    {
      activity: 'Day 3: Merzouga → Fes',
      description: createRichText([
        'Start the day with sunrise over the Erg Chebbi dunes, followed by breakfast at the camp and a short camel ride back to Merzouga village. Then drive towards Fes through the Ziz Valley, with a lunch stop in Midelt. Continue through the Cedar Forest to see wild monkeys and pass Ifrane before arriving in Fes in the evening.',
        '🍽️ Meals: Breakfast, Dinner',
        '📍 Overnight: Fes',
        '✅ Included Activities:',
        '🌄 Sunrise over Erg Chebbi dunes',
        '🐪 Morning camel trek back to Merzouga village',
        '🐒 Visit to wild monkeys in Cedar Forest',
        '⭐ Optional Activities:',
        '🍴 Lunch in Midelt (free time)',
        '🗺️ Landmarks',
        '. Merzouga',
        '. Ziz Valley',
        '. Errachidia',
        '. Midelt',
        '. Cedar Forest',
        '. Ifrane City',
      ]),
    },
    {
      activity: 'Day 4: Fes (Full Day)',
      description: createRichText([
        'After breakfast, explore the old medina of Fes with its narrow streets and historic atmosphere. Visit key sites including the Royal Palace gate, Blue Gate, the Mellah, Al Quaraouiyine University, the tanneries, and Moulay Idriss mausoleum. After lunch, visit a local tile cooperative and enjoy panoramic views over the medina before returning to the riad for overnight stay.',
        '🍽️ Meals: Breakfast, Dinner',
        '📍 Overnight: Fes',
        '✅ Included Activities:',
        '🧭 Guided tour of Fes Medina with local guide',
        '🏰 Visit Royal Palace Gate & Blue Gate',
        '🕍 Visit Jewish Quarter (Mellah)',
        '🎓 Visit Al Quaraouiyine University',
        '🏺 Visit traditional tanneries',
        '🕌 Visit Moulay Idriss mausoleum',
        '🏺 Visit tile cooperative',
        '🌄 Panoramic view over Fes Medina',
        '⭐ Optional Activities:',
        '🍴 Lunch (free time)',
        '🗺️ Landmarks:',
        '. Visit Fes Medina',
        '. Royal Palace Gate',
        '. Blue Gate (Bab Boujloud)',
        '. Mellah (Jewish Quarter)',
        '. Al Quaraouiyine University',
        '. Tanneries of Fes',
        '. Moulay Idriss Mausoleum',
      ]),
    },
    {
      activity: 'Day 5 Fes → Chefchaouen (Blue City)',
      description: createRichText([
        'Fes to Chefchaouen',
        'Early in the morning, depart from Fes and travel through the scenic Rif Mountains towards Chefchaouen, known as the "Blue City." Along the way, enjoy panoramic mountain views and changing landscapes.',
        '🍽️ Meals: Breakfast, Dinner',
        '📍 Overnight: Chefchaouen',
        '⭐ Optional Activities:',
        '🛍️ Shopping for wool garments and woven blankets',
        '🚶 Exploration of the Blue City',
        '🗺️ Landmarks:',
        '. Rif Mountains',
        '. Chefchaouen Blue City',
      ]),
    },
    {
      activity: 'Day 6: Chefchaouen → Rabat → Casablanca',
      description: createRichText([
        'After breakfast in Chefchaouen, depart towards Rabat, the capital city of Morocco. Visit the city\'s historical landmarks including Bab Chellah, the Mausoleum of Mohammed V, Hassan Tower, the Royal Palace gates, and the Kasbah of the Udayas. After lunch, continue to Casablanca where you will visit the magnificent Hassan II Mosque and enjoy free time along the Corniche before overnight stay in Casablanca.',
        '📍 Overnight: Casablanca',
        '🍽️ Meals: Breakfast, Dinner',
        '✅ Included Activities:',
        '🕌 Visit Bab Chellah',
        '🕊️ Visit Mausoleum of Mohammed V',
        '🏯 Visit Hassan Tower',
        '🏰 Visit Kasbah of the Udayas',
        '🕌 Visit Hassan II Mosque',
        '🌊 Walk along Casablanca Corniche',
        '⭐ Optional Activities:',
        '🍴 Lunch in Rabat (free time)',
        '☕ Coffee break at Casablanca Corniche',
        '🗺️ Landmarks: . Chefchaouen',
        '. Rabat',
        '. Bab Chellah',
        '. Hassan Tower',
        '. Kasbah of the Udayas',
        '. Mausoleum of Mohammed V',
        '. Casablanca',
        '. Hassan II Mosque',
        '. Corniche Casablanca',
      ]),
    },
    {
      activity: 'Day 7: Casablanca → Essaouira',
      description: createRichText([
        'After breakfast, depart from Casablanca and travel along Morocco’s Atlantic coast towards the charming seaside town of Essaouira. Upon arrival, explore the UNESCO-listed medina, the historic Skala fortress, the fishing port, and the vibrant coastal atmosphere. Overnight stay in a riad or hotel in Essaouira.',
        '📍 Overnight:Essaouira',
        '🍽️ Meals: Breakfast, Dinner',
        '✅ Included Activities:',
        '🏰 Explore Essaouira Medina',
        '⚓ Visit Essaouira Fishing Port',
        '🌊 Discover Skala de la Ville',
        '⭐ Optional Activities:',
        '🍴 Fresh seafood lunch at the harbor',
        '🐎 Horse riding on the beach',
        '🏄 Surfing or kitesurfing experience',
        '🗺️ Landmarks: . Casablanca',
        '. Essaouira Medina',
        '. Skala de la Ville',
        '. Fishing Port',
        '. Atlantic Coast',
      ]),
    },
    {
      activity: 'Day 8: Essaouira → Marrakech',
      description: createRichText([
        'After breakfast, enjoy some free time in Essaouira for last-minute shopping or a walk through the medina before departing for Marrakech. On the way, visit a traditional Argan Oil Cooperative to learn about the production of Morocco’s famous argan products, then continue to Marrakech where the tour concludes.',
        '📍 End Point: Marrakech (Hotel/Riad Drop-off)',
        '🍽️ Meals: Breakfast',
        '✅ Included Activities:',
        '🌿 Visit a traditional Argan Oil Cooperative',
        '🚐 Transfer from Essaouira to Marrakech',
        '⭐ Optional Activities:',
        '🛍️ Shopping in Essaouira Medina',
        '☕ Morning coffee overlooking the Atlantic Ocean',
        '🗺️ Landmarks:',
        '. Essaouira',
        '. Argan Oil Cooperative',
        '. Argan Forests',
        '. Marrakech',
      ]),
    },
  ]

  const bestWeekHighlights = [
    'High Atlas Mountains drive via Tizi n’Tichka Pass',
    'Ait Ben Haddou Kasbah (UNESCO site)',
    'Dades Valley & Todra Gorges landscapes',
    'Sahara Desert camel trek in Merzouga',
    'Overnight desert camp under the stars',
    'Sunrise & sunset over Erg Chebbi dunes',
    'Cedar Forest with wild monkeys',
    'Fes Medina exploration',
    'Chefchaouen (Blue City)',
    'Rabat imperial monuments',
    'Hassan II Mosque in Casablanca',
    'Essaouira Atlantic coast experience',
  ].map((h) => ({ highlight: createRichText(h) }))

  const bestWeekIncluded = [
    '🚐 Pick-up and drop-off from your accommodation in Marrakech',
    '🚗 Transportation in comfortable air-conditioned vehicle',
    '👨‍✈️ Professional English-speaking driver/guide',
    '🌃 Accommodation for 7 nights (hotel / riad / desert camp)',
    '🍽️ Daily meals: breakfast & dinner (as mentioned in itinerary)',
    '🐪 Camel trekking in the Sahara Desert',
    '🌌 Overnight stay in a Berber desert camp',
    '🏞Visit cooperative woman Berber',
  ].map((i) => ({ item: createRichText(i) }))

  const bestWeekNotIncluded = [
    '🍴 Lunches during the tour',
    '🎟️ Entrance fees to monuments (where applicable)',
    '🏍️ Optional activities (quad biking, ATV, sandboarding, etc.)',
    '🧑‍🤝‍🧑 Personal expenses (drinks, souvenirs, tips)',
    '📶 Personal travel insurance',
  ].map((i) => ({ item: createRichText(i) }))

  await upsertActivity(payload, {
    slug: 'the-best-week-in-morocco',
    title: 'The best week in morocco.',
    description: bestWeekDescription,
    duration: '8 Days / 7 Nights',
    pricingType: 'tiered',
    highlights: bestWeekHighlights,
    included: bestWeekIncluded,
    notIncluded: bestWeekNotIncluded,
    itinerary: bestWeekItinerary,
    isActive: true,
  })

  // -------------------------------------------------------------------------
  // 7) 4 day in Morocco with desert 🏜
  // -------------------------------------------------------------------------
  const fourDayDesertDescription = createRichText(
    'Experience the magic of Morocco’s Sahara Desert on a 4-day journey from Marrakech to Merzouga. Travel through the stunning High Atlas Mountains, discover ancient kasbahs and dramatic gorges, and enjoy a magical night under the stars in a luxury desert camp. A perfect blend of adventure, culture, and breathtaking landscapes for an unforgettable Moroccan experience.',
  )

  const fourDayDesertItinerary = [
    {
      activity: 'Day 01: Marrakech – Ait Ben Haddou – Dades Gorges',
      description: createRichText([
        'Depart from Marrakech and travel through the spectacular High Atlas Mountains via the Tizi n’Tichka Pass. Visit the historic Kasbah of Ait Ben Haddou, a UNESCO World Heritage Site, before continuing through Ouarzazate and the Skoura Oasis. Arrive in Dades Gorges, famous for its dramatic rock formations and scenic landscapes.',
        '📍 Start point: Marrakech (Hotel/Riad pickup 07:00 or 08:00)',
        '🍽️ Meals: Breakfast, Dinner',
        '📍Overnight: Dades Gorges',
        '✅ Included activities:',
        '🧭 Guided visit of Ait Ben Haddou with local guide',
        '⭐ Optional activities:',
        '🥐 Breakfast stop at Ait Barka Village',
        '🍴 Lunch at Ait Ben Haddou (free time)',
        '🗺️ Landmarks:',
        '. Tizi n’Tichka Pass',
        '. Ait Barka Village',
        '. Ait Ben Haddou',
        '. Ouarzazate',
        '. Skoura Palm Grove',
        '. Dades Valley',
        '. Dades Gorges',
      ]),
    },
    {
      activity: 'Day 02: Dades Gorges – Todra Gorges – Merzouga Desert',
      description: createRichText([
        'After breakfast, continue through the Dades Valley towards the impressive Todra Gorges, where towering canyon walls create one of Morocco’s most beautiful natural sites. Travel through Erfoud and reach Merzouga in the afternoon. Enjoy a camel trek across the Erg Chebbi dunes and experience a magical Sahara sunset before arriving at your desert camp.',
        '🍽️ Meals: Breakfast, Dinner',
        '🌃 night : camp Sahara',
        '✅ Included Activities:',
        '🐪 Camel ride at sunset (1h)',
        '🏕️ Overnight in Berber desert camp with nomadic tents',
        '⭐ Optional Activities:',
        '🚶 Trek in Todra Gorges canyon (free time)',
        '🍴 Lunch on the way (free time)',
        '🏍Sahara quad bikes / ATV ride',
        '🥁 Traditional drum music with camel drivers',
        '🗺️ Landmarks:',
        '. Dades Valley',
        '. Tineghir',
        '. Todra Gorges',
        '. Merzouga',
      ]),
    },
    {
      activity: 'Day 03: Merzouga –  Ouarzazate',
      description: createRichText([
        'Wake up early to enjoy sunrise over the dunes before returning to Merzouga for breakfast. Continue the journey through the desert landscapes of southern Morocco, passing traditional villages and the lush Draa Valley, lined with palm groves and ancient kasbahs. Arrive in Ouarzazate in the evening.',
        '🍽️ Meals: Breakfast, Dinner',
        '📍 Overnight: Hotel in Ouarzazate',
        '✅ Included Activities:',
        '🌄 Sunrise over the Sahara Desert',
        '🐪 Camel ride back to Merzouga',
        '🛍️ Visit Rissani Market',
        '🌴 Scenic drive through Draa Valley',
        '🗺️ Landmarks:',
        '🐪 Merzouga Desert',
        '🛍️ Rissani',
        '🏜️ Alnif',
        '🎬 Ouarzazate',
      ]),
    },
    {
      activity: 'Day 04: Ouarzazate – Marrakech',
      description: createRichText([
        'After breakfast, enjoy free time in Ouarzazate before driving back through the High Atlas Mountains and the Tizi n’Tichka Pass. Arrive in Marrakech in the afternoon, marking the end of the tour.',
        '🍽️ Meals: Breakfast',
        '📍 End Point: Marrakech (Hotel/Riad Drop-off)',
        '🍽️ Meals: Breakfast',
      ]),
    },
  ]

  const fourDayDesertHighlights = [
    'Cross the High Atlas Mountains via Tizi n’Tichka Pass',
    'Visit Ait Ben Haddou Kasbah (UNESCO World Heritage Site)',
    'Explore Ouarzazate, the “Gateway to the Desert”',
    'Drive through the Rose Valley and Skoura Oasis',
    'Discover Dades Valley landscapes and rock formations',
    'Walk in the dramatic Todra Gorge canyon',
    'Camel trek across Erg Chebbi dunes at sunset',
    'Overnight in a Sahara desert camp under',
  ].map((h) => ({ highlight: createRichText(h) }))

  const fourDayDesertIncluded = [
    '🚐 Pick-up and drop-off from your accommodation in Marrakech',
    '🚗 Transportation in comfortable air-conditioned vehicle',
    '👨‍✈️ Professional English-speaking driver/guide',
    '🌃 Accommodation for 3 nights (hotel / riad / desert camp)',
    '🍽️ Daily meals: breakfast & dinner (as mentioned in itinerary)',
    '🐪 Camel trekking in the Sahara Desert',
    '🌌 Overnight stay in a Berber desert camp',
  ].map((i) => ({ item: createRichText(i) }))

  const fourDayDesertNotIncluded = [
    '🍴 Lunches during the tour',
    '🎟️ Entrance fees to monuments (where applicable)',
    '🏍️ Optional activities (quad biking, ATV, sandboarding, etc.)',
    '🧑‍🤝‍🧑 Personal expenses (drinks, souvenirs, tips)',
    '📶 Personal travel insurance',
  ].map((i) => ({ item: createRichText(i) }))

  await upsertActivity(payload, {
    slug: '4-day-in-morocco-with-desert',
    title: '4 day in Morocco with desert 🏜',
    description: fourDayDesertDescription,
    duration: '4 Days / 3 Nights',
    pricingType: 'tiered',
    highlights: fourDayDesertHighlights,
    included: fourDayDesertIncluded,
    notIncluded: fourDayDesertNotIncluded,
    itinerary: fourDayDesertItinerary,
    isActive: true,
  })

  // -------------------------------------------------------------------------
  // 8) 3 day in Morocco from agadir
  // -------------------------------------------------------------------------
  const agadir3DayDescription = createRichText(
    'A scenic 3-day journey along Morocco’s Atlantic coast from Agadir to Essaouira and Marrakech. Discover the surf vibes of Taghazout, the charming blue-and-white medina of Essaouira, Argan forests and local cooperatives, before finishing in the vibrant city of Marrakech with its lively souks and iconic landmarks.',
  )

  const agadir3DayItinerary = [
    {
      activity: 'Day 01: Agadir – Taghazout – Essaouira',
      description: createRichText([
        'Travel from Agadir to Taghazout for optional surfing activities, then continue along the Atlantic coast to Essaouira. Explore the medina with optional guided tour and enjoy the port and historic ramparts.',
        '📍 Start point: Agadir (Hotel/Riad pickup 07:00 or 08:00)',
        '🍽️ Meals: Dinner in Essaouira',
        '✅ Included activities:',
        '🚐 Scenic coastal drive Agadir → Essaouira',
        '🏄 Stop in Taghazout surf village ( option )',
        '⭐ Optional activities:',
        '🏄 Surf lessons in Taghazout',
        '🚶 Guided walking tour of Essaouira Medina',
        '🗺️ Landmarks:',
        '📍 Agadir',
        '🌊 Taghazout',
        '🌊 Atlantic Coast',
        '🏰 Skala du Port',
        '🏙️ Essaouira Medina',
      ]),
    },
    {
      activity: 'Day 02: Essaouira → Marrakech',
      description: createRichText([
        'After breakfast, enjoy free time in Essaouira with optional activities such as quad biking on the beach or horse riding along the Atlantic shore.',
        'In the afternoon, travel inland towards Marrakech, passing through Argan forests and visiting a local women’s cooperative producing Argan oil using traditional methods.',
        'Arrive in Marrakech in the evening.',
        '🍽️ Meals:Breakfast. Dinner',
        '📍Overnight: Marrakech',
        '✅ Included activities:',
        '🌳 Argan forest drive',
        '🫒 Visit Argan oil cooperative',
        '⭐ Optional activities:',
        '🏍️ Quad biking in Essaouira',
        '🐎 Horse riding on the beach',
        '🚶 Guided city tour in Essaouira',
        '🗺️ Landmarks:',
        '🏙️ Essaouira',
        '🌳 Argan Forest',
        '🫒 Argan Cooperative',
        '🏜️ Marrakech',
      ]),
    },
    {
      activity: 'Day 03: Marrakech → Agadir',
      description: createRichText([
        'Full free day to explore Marrakech at your own pace or join optional guided experiences.',
        'You can discover the vibrant Medina, Jemaa el-Fna Square, Bahia Palace, and Majorelle Garden, or enjoy adventure and wellness activities around the city.',
        '🍽️ Meals: Breakfast',
        '⭐ Optional activities:',
        '🚶 Guided city tour of Marrakech',
        '🏍️ Quad biking in the Palmeraie',
        '🐪 Camel ride experience',
        '🧖 Traditional hammam & spa',
        '🗺️ Landmarks:',
        '🌟 Jemaa el-Fna Square',
        '🏙️ Medina of Marrakech',
        '🏰 Bahia Palace',
        '🌿 Majorelle Garden',
        '🌴 Palmeraie',
        '🏁 End point: agadir (Hotel/Riad drop-off)',
      ]),
    },
  ]

  const agadir3DayHighlights = [
    '🌊 Scenic Atlantic coastal drive from Agadir to Essaouira',
    '🏄 Stop in Taghazout surf village, famous for waves and surf culture',
    '🏙️ Explore the UNESCO-listed Essaouira Medina with blue-and-white streets',
    '🏰 Visit Skala du Port & historic fishing port',
    '🌳 Drive through Argan forests and visit a women’s Argan cooperative',
    '🫒 Discover traditional Argan oil production process',
    '🏍️ Optional quad biking and horse riding on the Atlantic beach',
    '🚶 Guided walking tours in Essaouira and Marrakech medinas',
    '🌟 Experience the lively Jemaa el-Fna Square in Marrakech',
  ].map((h) => ({ highlight: createRichText(h) }))

  const agadir3DayIncluded = [
    '🚐 Pick-up and drop-off from your accommodation in Agadir',
    '🚗 Transportation in comfortable air-conditioned vehicle',
    '👨‍✈️ Professional English-speaking driver/guide',
    '🌃 Accommodation for 2 nights (hotel / riad)',
    '🍽️ Daily meals: breakfast & dinner (as mentioned in itinerary)',
  ].map((i) => ({ item: createRichText(i) }))

  const agadir3DayNotIncluded = [
    '✈️ International flights',
    '🍴 Meals not mentioned in the itinerary',
    '🎟️ Entrance fees to monuments and attractions (if applicable)',
    '🏍️ Optional activities (surfing, quad biking, camel ride, hammam, etc.)',
    '💰 Tips for driver and local guides',
    '🛡️ Travel insurance',
  ].map((i) => ({ item: createRichText(i) }))

  await upsertActivity(payload, {
    slug: '3-day-in-morocco-from-agadir',
    title: '3 day in Morocco from agadir',
    description: agadir3DayDescription,
    duration: '3 Days / 2 Nights',
    pricingType: 'tiered',
    highlights: agadir3DayHighlights,
    included: agadir3DayIncluded,
    notIncluded: agadir3DayNotIncluded,
    itinerary: agadir3DayItinerary,
    isActive: true,
  })

  console.log('\n✅ Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
