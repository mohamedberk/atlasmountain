// Run with: npx tsx --env-file=.env src/seed-new-activities.ts
//
// Seeds two categories ("Desert Tours" and "Activities") and two activities
// (3-Day Merzouga desert tour and Agafay quad/camel/dinner) from images stored in
// /public/seed-images/desert-tour and /public/seed-images/agafay-quad.
//
// Idempotent: looks up categories & activities by slug and updates them if they
// already exist instead of creating duplicates.

// @ts-nocheck
import { getPayload } from 'payload'
import config from './payload.config'
import path from 'path'
import fs from 'fs'

// ---------------------------------------------------------------------------
// Lexical rich-text helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Media upload helpers
// ---------------------------------------------------------------------------

const SEED_IMAGES_DIR = path.resolve(process.cwd(), 'public/seed-images')

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

async function uploadImage(
  payload: any,
  folder: string,
  filename: string,
  alt: string,
): Promise<string | null> {
  const filePath = path.join(SEED_IMAGES_DIR, folder, filename)
  if (!fs.existsSync(filePath)) {
    console.log(`    ! Missing file: ${filePath}`)
    return null
  }

  const ext = path.extname(filename).toLowerCase()
  const mimetype = MIME_BY_EXT[ext] || 'image/jpeg'
  const buffer = fs.readFileSync(filePath)
  // Unique-ish filename in Payload media collection so re-runs don't clash
  const stableName = `${folder}-${filename}`

  // Idempotency: if a media doc with this filename already exists, reuse it
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: stableName } },
    limit: 1,
  })
  if (existing.docs[0]) {
    return existing.docs[0].id
  }

  const created = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data: buffer,
      mimetype,
      name: stableName,
      size: buffer.length,
    },
  })
  return created.id
}

async function uploadFolder(
  payload: any,
  folder: string,
  altPrefix: string,
): Promise<string[]> {
  const dir = path.join(SEED_IMAGES_DIR, folder)
  if (!fs.existsSync(dir)) {
    console.log(`  ! Folder missing: ${dir}`)
    return []
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
    .sort()

  const ids: string[] = []
  for (const f of files) {
    const id = await uploadImage(payload, folder, f, `${altPrefix} - ${path.parse(f).name}`)
    if (id) {
      ids.push(id)
      console.log(`    + ${folder}/${f} -> media ${id}`)
    }
  }
  return ids
}

// ---------------------------------------------------------------------------
// Upsert helpers
// ---------------------------------------------------------------------------

async function upsertCategory(
  payload: any,
  data: {
    slug: string
    name: string
    type: 'activity' | 'transport'
    durationType?: 'multi-day' | 'day-trip'
    icon?: string
    description?: string
    displayOrder?: number
    imageId?: string | null
  },
): Promise<string> {
  const existing = await payload.find({
    collection: 'categories',
    where: { slug: { equals: data.slug } },
    limit: 1,
  })

  const payloadData: any = {
    slug: data.slug,
    name: data.name,
    type: data.type,
    durationType: data.durationType ?? 'day-trip',
    icon: data.icon,
    description: data.description,
    displayOrder: data.displayOrder ?? 0,
  }
  if (data.imageId) payloadData.image = data.imageId

  if (existing.docs[0]) {
    const updated = await payload.update({
      collection: 'categories',
      id: existing.docs[0].id,
      locale: 'en',
      data: payloadData,
    })
    console.log(`  ✓ Updated category: ${data.name}`)
    return updated.id
  }

  const created = await payload.create({
    collection: 'categories',
    locale: 'en',
    data: payloadData,
  })
  console.log(`  ✓ Created category: ${data.name}`)
  return created.id
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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('🌱 Seeding new categories + activities (Desert Tour & Agafay Quad)\n')

  const payload = await getPayload({ config })

  // -------------------------------------------------------------------------
  // 1) Upload all media
  // -------------------------------------------------------------------------
  console.log('🖼️  Uploading desert-tour images...')
  const desertImageIds = await uploadFolder(payload, 'desert-tour', '3-Day Merzouga Desert Tour')
  console.log(`   → ${desertImageIds.length} desert-tour images uploaded\n`)

  console.log('🖼️  Uploading agafay-quad images...')
  const agafayImageIds = await uploadFolder(payload, 'agafay-quad', 'Agafay Desert Quad & Camel')
  console.log(`   → ${agafayImageIds.length} agafay-quad images uploaded\n`)

  // -------------------------------------------------------------------------
  // 2) Upsert categories
  // -------------------------------------------------------------------------
  console.log('📁 Upserting categories...')
  const desertCategoryId = await upsertCategory(payload, {
    slug: 'desert-tours',
    name: 'Desert Tours',
    type: 'activity',
    durationType: 'multi-day',
    icon: 'Sun',
    description:
      'Multi-day journeys into the Moroccan Sahara: cross the Atlas, sleep under desert skies, and discover ancient kasbahs.',
    displayOrder: 1,
    imageId: desertImageIds[0] || null,
  })

  const activitiesCategoryId = await upsertCategory(payload, {
    slug: 'activities',
    name: 'Activities',
    type: 'activity',
    durationType: 'day-trip',
    icon: 'Star',
    description:
      'Half-day and day excursions from Marrakech — quad rides, camel treks, dinners under the stars, and more.',
    displayOrder: 2,
    imageId: agafayImageIds[0] || null,
  })
  console.log()

  // -------------------------------------------------------------------------
  // 3) Activity: 3-Day Desert Tour Marrakech → Merzouga → Marrakech
  // -------------------------------------------------------------------------
  console.log('🐪 Upserting Desert Tour activity...')

  // Pricing decision: the user wants the card to read "from 120eur".
  // The compact / featured cards render the LOWEST tieredPricing tier as the
  // displayed price, which is exactly the "from X" convention. Setting the
  // lowest tier to €120 makes the card naturally display "€120 /pp".
  const desertTieredPricing = {
    tiers: [
      { numberOfPeople: 1, maxPeople: 1, pricePerPerson: 200 },
      { numberOfPeople: 2, maxPeople: 2, pricePerPerson: 150 },
      { numberOfPeople: 3, maxPeople: 5, pricePerPerson: 130 },
      { numberOfPeople: 6, maxPeople: 15, pricePerPerson: 120 },
    ],
  }

  const desertDescription = createRichText([
    'Cross the High Atlas and reach the golden dunes of Erg Chebbi on this three-day journey from Marrakech to the Merzouga Desert. The route climbs over the dramatic Tizi n\'Tichka Pass, stops at the UNESCO-listed kasbah of Aït Benhaddou, and continues through the cinematic landscapes around Ouarzazate, the fragrant Rose Valley, and the towering walls of the Dadès Gorges, where you spend the first night.',
    'Day two follows the canyon road through the Todra Gorges to the fossil town of Erfoud before arriving at the edge of the Sahara. A camel trek across the Erg Chebbi dunes brings you to a desert camp for dinner, Berber music around the fire and a night under the stars.',
    'On the final day you wake for sunrise over the dunes, then loop back to Marrakech via Rissani, the Draa Valley and a second crossing of the Atlas — arriving in the late evening with a memorable circuit of southern Morocco behind you. Travel is in an air-conditioned vehicle with an English-speaking driver-guide, and pickup is included from your Marrakech hotel or riad.',
  ])

  const desertItinerary = [
    {
      time: 'Day 1',
      activity:
        'Marrakech → Tizi n\'Tichka Pass → Aït Benhaddou → Ouarzazate → Rose Valley → Boumalne Dadès',
      description: createRichText(
        'Hotel pickup from Marrakech around 8:00 AM. Drive south over the High Atlas via the Tizi n\'Tichka Pass with panoramic photo stops. Guided visit of the UNESCO kasbah of Aït Benhaddou, then continue to Ouarzazate (the "Hollywood of Morocco") for a stop at the famous film studios. The route follows the Rose Valley with its cooperatives of rose-based products, then enters the dramatic Dadès Gorges where you check in to your hotel. Dinner and overnight in Dadès.',
      ),
    },
    {
      time: 'Day 2',
      activity:
        'Boumalne Dadès → Todra Gorges → Tinejdad → Erfoud → Merzouga Desert',
      description: createRichText(
        'After breakfast, drive to the Todra Gorges and walk between the towering limestone cliffs. Lunch in Tinejdad, then on to Erfoud and a stop at a fossil workshop. By late afternoon you arrive at the Merzouga Desert: a sunset camel trek takes you across the Erg Chebbi dunes to your camp, where you settle in for a traditional dinner, Berber drumming around the fire, and a night under the stars.',
      ),
    },
    {
      time: 'Day 3',
      activity:
        'Merzouga → Rissani → Alnif → Tazzarine → Ouarzazate → Atlas Mountains → Marrakech',
      description: createRichText(
        'Wake before dawn for sunrise over the dunes, then ride camels back to the village for breakfast. The road home passes Rissani — cradle of the Alaouite dynasty — Alnif, Tazzarine, and the palm-lined Draa Valley with stops at Nkob and the Ksar of Tamnougalt. Lunch in Ouarzazate, then a final crossing of the High Atlas with photo stops before arriving back in Marrakech around 8:00 PM.',
      ),
    },
  ]

  const desertHighlights = [
    'Cross the High Atlas via the spectacular Tizi n\'Tichka Pass',
    'Guided visit of the UNESCO kasbah of Aït Benhaddou',
    'Drive through the Rose Valley with its women\'s cooperatives',
    'Explore the dramatic Dadès and Todra gorges',
    'Sunset camel trek across the Erg Chebbi dunes of Merzouga',
    'Overnight in a desert camp under a star-filled Sahara sky',
    'Return through Rissani and the palm groves of the Draa Valley',
  ].map((h) => ({ highlight: createRichText(h) }))

  const desertIncluded = [
    'Comfortable air-conditioned transport for 3 days',
    'English-speaking driver/guide',
    'Pickup and drop-off at your hotel or riad in Marrakech',
    'Camel ride across the Erg Chebbi dunes',
    'Overnight in a desert camp with dinner and breakfast',
    'Hotel accommodation in Dadès (1 night, dinner & breakfast)',
    'Guided visit of the Aït Benhaddou kasbah',
  ].map((i) => ({ item: createRichText(i) }))

  const desertNotIncluded = [
    'Lunches and personal expenses',
    'Entrance fee to the Atlas Film Studios (optional)',
    'Drinks',
  ].map((i) => ({ item: createRichText(i) }))

  const desertGallery = desertImageIds.map((id) => ({
    media: id,
    type: 'image' as const,
  }))

  await upsertActivity(payload, {
    slug: '3-day-2-night-desert-tour-from-marrakech-to-merzouga-and-back',
    title: '3-Day 2-Night Desert Tour From Marrakech to Merzouga and Back',
    description: desertDescription,
    shortDescription:
      'A three-day loop from Marrakech to the Erg Chebbi dunes: Atlas crossings, Aït Benhaddou, the Dadès and Todra gorges, a camel trek, and a night in a Sahara desert camp.',
    category: desertCategoryId,
    duration: '3 days / 2 nights',
    location: 'Marrakech → Merzouga',
    languages: [{ language: 'English' }, { language: 'Francais' }],
    pricingType: 'tiered',
    tieredPricing: desertTieredPricing,
    featuredImage: desertImageIds[0] || null,
    gallery: desertGallery,
    highlights: desertHighlights,
    included: desertIncluded,
    notIncluded: desertNotIncluded,
    itinerary: desertItinerary,
    isActive: true,
    isFeatured: true,
    displayOrder: 1,
    overallRating: 4.8,
    totalReviews: 22,
  })
  console.log()

  // -------------------------------------------------------------------------
  // 4) Activity: Agafay Desert Quad Bike, Camel Ride & Dinner Show
  // -------------------------------------------------------------------------
  console.log('🏜️  Upserting Agafay Quad activity...')

  // Pricing decision: the user wants the card to read "100eur" (no "from").
  // Fixed/private pricing renders the single basePrice without a "from" floor,
  // so privatePricing.basePrice = 100 gives the card exactly "€100".
  const agafayPrivatePricing = {
    basePrice: 100,
    minGuests: 1,
    maxGuests: 15,
    additionalGuestPrice: 0,
  }

  const agafayDescription = createRichText([
    'Trade Marrakech for the rocky horizons of the Agafay Desert on this evening adventure 30–45 minutes from the medina. After hotel pickup in an air-conditioned vehicle, you arrive at a desert base camp for a safety briefing and an hour-long quad bike ride across the stony plains — equally good for first-timers and experienced riders, with helmets, goggles and a guide provided.',
    'As the light softens, swap engines for a calmer pace: a sunset camel ride across the desert with sweeping views and golden-hour photo stops. The evening ends in a Berber-style tent for a traditional Moroccan dinner — tagine, couscous, salads, mint tea — followed by a live show with music, drumming and (often) fire performances around the fire.',
    'After dinner, settle in for a relaxed transfer back to your accommodation in Marrakech. The standard camp experience is included in this price; a luxury camp upgrade with an enhanced dinner and extra services is available on request.',
  ])

  const agafayItinerary = [
    {
      time: 'Approx. 15:00–16:00',
      activity: 'Hotel pickup in Marrakech',
      description: createRichText(
        'Air-conditioned pickup from your hotel or riad in Marrakech for the 40–45 minute drive to the Agafay Desert.',
      ),
    },
    {
      time: '~1 hour',
      activity: 'Quad biking across the Agafay plains',
      description: createRichText(
        'Arrive at the base camp, receive a safety briefing and equipment (helmet, goggles), then ride a quad bike across the rocky desert terrain with great viewpoints over Agafay.',
      ),
    },
    {
      time: '~45 min – 1 hour',
      activity: 'Sunset camel ride',
      description: createRichText(
        'Swap the quad for a gentle camel ride at golden hour. Soak in the desert colours, take photos, and enjoy the calm of the Agafay landscape.',
      ),
    },
    {
      time: '1.5 – 2 hours',
      activity: 'Traditional Moroccan dinner & live show',
      description: createRichText(
        'Dinner under the stars in a desert camp — typically tagine or couscous with salads, dessert and mint tea. Live music, drumming, and (often) a fire show provide the evening entertainment.',
      ),
    },
    {
      time: 'Evening',
      activity: 'Return transfer to Marrakech',
      description: createRichText(
        'Relax on the drive back to your accommodation in Marrakech with the desert behind you.',
      ),
    },
  ]

  const agafayHighlights = [
    'Thrilling quad bike ride across the Agafay desert terrain',
    'Sunset camel ride with golden-hour photo stops',
    'Traditional Moroccan dinner served under the stars',
    'Live show with traditional music and cultural performances',
    'Comfortable hotel pickup and drop-off in Marrakech',
  ].map((h) => ({ highlight: createRichText(h) }))

  const agafayIncluded = [
    'Round-trip transfer in an air-conditioned vehicle',
    'Quad bike with safety gear and guide',
    'Sunset camel ride with a local guide',
    'Traditional Moroccan dinner (tagine / couscous + dessert)',
    'Vegetarian meal option on request',
    'Live cultural show with music and performances',
  ].map((i) => ({ item: createRichText(i) }))

  const agafayNotIncluded = [
    'Personal expenses and gratuities',
    'Drinks (unless specified)',
  ].map((i) => ({ item: createRichText(i) }))

  const agafayRecommendations = [
    'Quad biking is recommended for ages 16+. Younger children may ride as passengers.',
    'Comfortable clothing, sunscreen, sunglasses and a camera are recommended.',
    'Not recommended for pregnant travellers or guests with serious back problems.',
  ].map((i) => ({ item: createRichText(i) }))

  const agafayGallery = agafayImageIds.map((id) => ({
    media: id,
    type: 'image' as const,
  }))

  await upsertActivity(payload, {
    slug: 'agafay-desert-quad-bike-camel-ride-dinner-show',
    title: 'Agafay Desert Quad Bike, Camel Ride & Dinner Show',
    description: agafayDescription,
    shortDescription:
      'An evening in the Agafay Desert near Marrakech: quad biking on the rocky plains, a sunset camel ride, and a traditional Moroccan dinner with live music under the stars.',
    category: activitiesCategoryId,
    duration: 'Half day (evening, ~5–6 hours)',
    location: 'Agafay Desert (Marrakech)',
    languages: [{ language: 'English' }, { language: 'Francais' }],
    pricingType: 'fixed',
    privatePricing: agafayPrivatePricing,
    featuredImage: agafayImageIds[0] || null,
    gallery: agafayGallery,
    highlights: agafayHighlights,
    included: agafayIncluded,
    notIncluded: agafayNotIncluded,
    recommendations: agafayRecommendations,
    itinerary: agafayItinerary,
    isActive: true,
    isFeatured: true,
    displayOrder: 2,
    overallRating: 4.8,
    totalReviews: 22,
  })
  console.log()

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log('─'.repeat(60))
  console.log('✅ Seed complete.')
  console.log('─'.repeat(60))
  console.log(`  Desert Tours category id        : ${desertCategoryId}`)
  console.log(`  Activities category id          : ${activitiesCategoryId}`)
  console.log(`  Desert tour images uploaded     : ${desertImageIds.length}`)
  console.log(`  Agafay quad images uploaded     : ${agafayImageIds.length}`)
  console.log('  Desert tour price (card)        : tiered, lowest tier €120 -> "from €120"')
  console.log('  Agafay quad price (card)        : fixed €100')
  console.log()

  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
