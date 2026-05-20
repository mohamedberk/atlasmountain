// @ts-nocheck
import { getPayload } from 'payload'
import config from './payload.config'
import { imagekitUrls } from './data/imagekit-urls'
import path from 'path'
import fs from 'fs'
import os from 'os'

// Helper to create Lexical richText content
function createRichText(text: string) {
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: text,
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

// Helper to download image and create media
async function createMediaFromUrl(
  payload: any,
  url: string,
  alt: string,
): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.log(`  ⚠ Failed to fetch image: ${url}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get filename from URL
    const urlPath = new URL(url).pathname
    const filename = decodeURIComponent(path.basename(urlPath))
    const extension = path.extname(filename) || '.jpg'
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '-')

    // Create temp file
    const tempDir = os.tmpdir()
    const tempPath = path.join(tempDir, `seed-${Date.now()}-${safeName}`)
    fs.writeFileSync(tempPath, buffer)

    // Determine mime type
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    }
    const mimeType = mimeTypes[extension.toLowerCase()] || 'image/jpeg'

    // Create media document
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: alt,
      },
      file: {
        data: buffer,
        mimetype: mimeType,
        name: safeName,
        size: buffer.length,
      },
    })

    // Clean up temp file
    try {
      fs.unlinkSync(tempPath)
    } catch {}

    return media.id
  } catch (error: any) {
    console.log(`  ⚠ Error creating media from ${url}: ${error.message}`)
    return null
  }
}

async function seed() {
  console.log('🌱 Starting comprehensive seed...')
  console.log('   This may take a few minutes as images are being uploaded...\n')

  const payload = await getPayload({ config })

  // ============================================
  // CATEGORIES
  // ============================================
  console.log('📁 Creating categories...')

  const categoriesData = [
    // Activity Categories
    {
      slug: 'desert-adventures',
      type: 'activity',
      icon: 'Sun',
      displayOrder: 1,
      name: { en: 'Desert Adventures', fr: 'Aventures dans le Désert', de: 'Wüstenabenteuer' },
      description: {
        en: 'Experience the magic of the Sahara with our desert excursions',
        fr: 'Découvrez la magie du Sahara avec nos excursions dans le désert',
        de: 'Erleben Sie die Magie der Sahara mit unseren Wüstenausflügen',
      },
    },
    {
      slug: 'mountain-excursions',
      type: 'activity',
      icon: 'Mountain',
      displayOrder: 2,
      name: { en: 'Mountain Excursions', fr: 'Excursions en Montagne', de: 'Bergausflüge' },
      description: {
        en: 'Discover the majestic Atlas Mountains',
        fr: "Découvrez les majestueuses montagnes de l'Atlas",
        de: 'Entdecken Sie das majestätische Atlasgebirge',
      },
    },
    {
      slug: 'nature-wildlife',
      type: 'activity',
      icon: 'Trees',
      displayOrder: 3,
      name: { en: 'Nature & Wildlife', fr: 'Nature et Faune', de: 'Natur & Tierwelt' },
      description: {
        en: 'Explore Morocco\'s natural wonders',
        fr: 'Explorez les merveilles naturelles du Maroc',
        de: 'Entdecken Sie Marokkos Naturwunder',
      },
    },
    {
      slug: 'coastal-adventures',
      type: 'activity',
      icon: 'Waves',
      displayOrder: 4,
      name: { en: 'Coastal Adventures', fr: 'Aventures Côtières', de: 'Küstenabenteuer' },
      description: {
        en: 'Discover Morocco\'s beautiful Atlantic coast',
        fr: 'Découvrez la belle côte atlantique du Maroc',
        de: 'Entdecken Sie Marokkos wunderschöne Atlantikküste',
      },
    },
    {
      slug: 'cultural-heritage',
      type: 'activity',
      icon: 'Landmark',
      displayOrder: 5,
      name: { en: 'Cultural Heritage', fr: 'Patrimoine Culturel', de: 'Kulturerbe' },
      description: {
        en: 'Immerse yourself in Moroccan culture and history',
        fr: "Plongez dans la culture et l'histoire marocaine",
        de: 'Tauchen Sie ein in die marokkanische Kultur und Geschichte',
      },
    },
    {
      slug: 'adventure-sports',
      type: 'activity',
      icon: 'Bike',
      displayOrder: 6,
      name: { en: 'Adventure Sports', fr: 'Sports d\'Aventure', de: 'Abenteuersport' },
      description: {
        en: 'Thrilling outdoor activities and sports',
        fr: 'Activités de plein air et sports passionnants',
        de: 'Spannende Outdoor-Aktivitäten und Sport',
      },
    },
  ]

  const createdCategories: Record<string, string> = {}

  for (const category of categoriesData) {
    try {
      // First check if it already exists
      const existing = await payload.find({
        collection: 'categories',
        where: { slug: { equals: category.slug } },
      })

      if (existing.docs[0]) {
        createdCategories[category.slug] = existing.docs[0].id
        console.log(`  ⏭ Category already exists: ${category.name.en}`)
        continue
      }

      const created = await payload.create({
        collection: 'categories',
        locale: 'en',
        data: {
          slug: category.slug,
          type: category.type as 'activity',
          icon: category.icon,
          displayOrder: category.displayOrder,
          name: category.name.en,
          description: category.description.en,
        },
      })
      createdCategories[category.slug] = created.id

      await payload.update({
        collection: 'categories',
        id: created.id,
        locale: 'fr',
        data: { name: category.name.fr, description: category.description.fr },
      })

      await payload.update({
        collection: 'categories',
        id: created.id,
        locale: 'de',
        data: { name: category.name.de, description: category.description.de },
      })

      console.log(`  ✓ Created category: ${category.name.en}`)
    } catch (error: any) {
      console.error(`  ✗ Error creating category ${category.name.en}:`, error.message)
    }
  }

  // ============================================
  // LOCATIONS
  // ============================================
  console.log('\n📍 Creating locations...')

  const locationsData = [
    {
      slug: 'marrakech-menara-airport',
      type: ['pickup', 'dropoff'],
      city: 'marrakech',
      coordinates: { latitude: 31.6069, longitude: -8.0363 },
      isActive: true,
      displayOrder: 1,
      name: { en: 'Marrakech Menara Airport', fr: 'Aéroport de Marrakech Menara', de: 'Flughafen Marrakesch Menara' },
      address: { en: 'Menara Airport, Marrakech 40000', fr: 'Aéroport Menara, Marrakech 40000', de: 'Flughafen Menara, Marrakesch 40000' },
    },
    {
      slug: 'jemaa-el-fnaa',
      type: ['pickup', 'dropoff', 'activity'],
      city: 'marrakech',
      coordinates: { latitude: 31.6258, longitude: -7.9891 },
      isActive: true,
      displayOrder: 2,
      name: { en: 'Jemaa el-Fnaa Square', fr: 'Place Jemaa el-Fnaa', de: 'Jemaa el-Fnaa Platz' },
      address: { en: 'Jemaa el-Fnaa, Medina, Marrakech', fr: 'Jemaa el-Fnaa, Médina, Marrakech', de: 'Jemaa el-Fnaa, Medina, Marrakesch' },
    },
    {
      slug: 'marrakech-train-station',
      type: ['pickup', 'dropoff'],
      city: 'marrakech',
      coordinates: { latitude: 31.6306, longitude: -8.0196 },
      isActive: true,
      displayOrder: 3,
      name: { en: 'Marrakech Train Station', fr: 'Gare de Marrakech', de: 'Bahnhof Marrakesch' },
      address: { en: 'Avenue Hassan II, Marrakech', fr: 'Avenue Hassan II, Marrakech', de: 'Avenue Hassan II, Marrakesch' },
    },
    {
      slug: 'palmeraie',
      type: ['pickup', 'dropoff', 'activity'],
      city: 'marrakech',
      coordinates: { latitude: 31.6695, longitude: -7.9687 },
      additionalFee: 10,
      isActive: true,
      displayOrder: 4,
      name: { en: 'La Palmeraie', fr: 'La Palmeraie', de: 'La Palmeraie' },
      address: { en: 'Palmeraie, Marrakech', fr: 'Palmeraie, Marrakech', de: 'Palmeraie, Marrakesch' },
    },
    {
      slug: 'agafay-desert',
      type: ['activity'],
      city: 'marrakech',
      coordinates: { latitude: 31.4687, longitude: -8.2231 },
      isActive: true,
      displayOrder: 5,
      name: { en: 'Agafay Desert', fr: 'Désert d\'Agafay', de: 'Agafay-Wüste' },
      address: { en: 'Agafay Desert, Marrakech', fr: 'Désert d\'Agafay, Marrakech', de: 'Agafay-Wüste, Marrakesch' },
    },
    {
      slug: 'ouzoud-waterfalls',
      type: ['activity'],
      city: 'marrakech',
      coordinates: { latitude: 32.0155, longitude: -6.7166 },
      isActive: true,
      displayOrder: 6,
      name: { en: 'Ouzoud Falls', fr: 'Cascades d\'Ouzoud', de: 'Ouzoud-Wasserfälle' },
      address: { en: 'Ouzoud, Azilal Province', fr: 'Ouzoud, Province d\'Azilal', de: 'Ouzoud, Provinz Azilal' },
    },
    {
      slug: 'ourika-valley',
      type: ['activity'],
      city: 'marrakech',
      coordinates: { latitude: 31.3667, longitude: -7.7333 },
      isActive: true,
      displayOrder: 7,
      name: { en: 'Ourika Valley', fr: 'Vallée de l\'Ourika', de: 'Ourika-Tal' },
      address: { en: 'Ourika Valley, Atlas Mountains', fr: 'Vallée de l\'Ourika, Atlas', de: 'Ourika-Tal, Atlasgebirge' },
    },
    {
      slug: 'essaouira',
      type: ['dropoff', 'activity'],
      city: 'essaouira',
      coordinates: { latitude: 31.5085, longitude: -9.7595 },
      isActive: true,
      displayOrder: 8,
      name: { en: 'Essaouira', fr: 'Essaouira', de: 'Essaouira' },
      address: { en: 'Essaouira, Morocco', fr: 'Essaouira, Maroc', de: 'Essaouira, Marokko' },
    },
    {
      slug: 'ouarzazate',
      type: ['dropoff', 'activity'],
      city: 'ouarzazate',
      coordinates: { latitude: 30.9189, longitude: -6.8936 },
      isActive: true,
      displayOrder: 9,
      name: { en: 'Ouarzazate', fr: 'Ouarzazate', de: 'Ouarzazate' },
      address: { en: 'Ouarzazate, Morocco', fr: 'Ouarzazate, Maroc', de: 'Ouarzazate, Marokko' },
    },
    {
      slug: 'ait-benhaddou',
      type: ['activity'],
      city: 'ouarzazate',
      coordinates: { latitude: 31.047, longitude: -7.1318 },
      isActive: true,
      displayOrder: 10,
      name: { en: 'Ait Benhaddou', fr: 'Aït Benhaddou', de: 'Ait Benhaddou' },
      address: { en: 'Ait Benhaddou, Morocco', fr: 'Aït Benhaddou, Maroc', de: 'Ait Benhaddou, Marokko' },
    },
    {
      slug: 'atlas-foothills',
      type: ['activity'],
      city: 'marrakech',
      coordinates: { latitude: 31.45, longitude: -7.85 },
      isActive: true,
      displayOrder: 11,
      name: { en: 'Atlas Foothills', fr: 'Contreforts de l\'Atlas', de: 'Atlas-Vorgebirge' },
      address: { en: 'Atlas Mountains, Morocco', fr: 'Montagnes de l\'Atlas, Maroc', de: 'Atlasgebirge, Marokko' },
    },
    {
      slug: 'zagora',
      type: ['activity'],
      city: 'zagora',
      coordinates: { latitude: 30.3314, longitude: -5.8383 },
      isActive: true,
      displayOrder: 12,
      name: { en: 'Zagora', fr: 'Zagora', de: 'Zagora' },
      address: { en: 'Zagora, Draa-Tafilalet', fr: 'Zagora, Drâa-Tafilalet', de: 'Zagora, Drâa-Tafilalet' },
    },
    {
      slug: 'merzouga',
      type: ['activity'],
      city: 'merzouga',
      coordinates: { latitude: 31.0801, longitude: -4.0134 },
      isActive: true,
      displayOrder: 13,
      name: { en: 'Merzouga (Erg Chebbi)', fr: 'Merzouga (Erg Chebbi)', de: 'Merzouga (Erg Chebbi)' },
      address: { en: 'Merzouga, Errachidia Province', fr: 'Merzouga, Province d\'Errachidia', de: 'Merzouga, Provinz Errachidia' },
    },
    {
      slug: 'imlil',
      type: ['activity'],
      city: 'marrakech',
      coordinates: { latitude: 31.1375, longitude: -7.9194 },
      isActive: true,
      displayOrder: 14,
      name: { en: 'Imlil', fr: 'Imlil', de: 'Imlil' },
      address: { en: 'Imlil, High Atlas Mountains', fr: 'Imlil, Haut Atlas', de: 'Imlil, Hoher Atlas' },
    },
  ]

  const createdLocations: Record<string, string> = {}

  for (const location of locationsData) {
    try {
      // First check if it already exists
      const existing = await payload.find({
        collection: 'locations',
        where: { slug: { equals: location.slug } },
      })

      if (existing.docs[0]) {
        createdLocations[location.slug] = existing.docs[0].id
        console.log(`  ⏭ Location already exists: ${location.name.en}`)
        continue
      }

      const created = await payload.create({
        collection: 'locations',
        locale: 'en',
        data: {
          slug: location.slug,
          type: location.type as ('activity' | 'pickup' | 'dropoff')[],
          city: location.city as any,
          coordinates: location.coordinates,
          additionalFee: location.additionalFee || 0,
          isActive: location.isActive,
          displayOrder: location.displayOrder,
          name: location.name.en,
          address: location.address.en,
        },
      })
      createdLocations[location.slug] = created.id

      await payload.update({
        collection: 'locations',
        id: created.id,
        locale: 'fr',
        data: { name: location.name.fr, address: location.address.fr },
      })

      await payload.update({
        collection: 'locations',
        id: created.id,
        locale: 'de',
        data: { name: location.name.de, address: location.address.de },
      })

      console.log(`  ✓ Created location: ${location.name.en}`)
    } catch (error: any) {
      console.error(`  ✗ Error creating location ${location.name.en}:`, error.message)
    }
  }

  // ============================================
  // MEDIA (Upload images from ImageKit)
  // ============================================
  console.log('\n🖼️  Uploading media assets...')

  const mediaAssets: Record<string, string> = {}

  const imagesToUpload = [
    { key: 'ourika', url: imagekitUrls.ourika, alt: 'Ourika Valley' },
    { key: 'ouzoud', url: imagekitUrls.ouzoud, alt: 'Ouzoud Falls' },
    { key: 'essaouira', url: imagekitUrls.essaouira, alt: 'Essaouira' },
    { key: 'agafayNormal', url: imagekitUrls.agafayNormal, alt: 'Agafay Desert' },
    { key: 'agafayLux', url: imagekitUrls.agafayLux, alt: 'Agafay Desert Luxury' },
    { key: 'ouarzazate', url: imagekitUrls.ouarzazate, alt: 'Ouarzazate & Ait Ben Haddou' },
    { key: 'montgolfiere', url: imagekitUrls.montgolfiere, alt: 'Hot Air Balloon' },
    { key: 'quadPalmeraie', url: imagekitUrls.quadPalmeraie, alt: 'Quad Biking Palmeraie' },
    { key: 'buggyPalmeraie', url: imagekitUrls.buggyPalmeraie, alt: 'Buggy Palmeraie' },
    { key: 'camelPalmeraie', url: imagekitUrls.camelPalmeraie, alt: 'Camel Ride Palmeraie' },
    { key: 'comboHotAirBalloon', url: imagekitUrls.comboHotAirBalloon, alt: 'Hot Air Balloon Combo Pack' },
    { key: 'comboOuzoudAdventure', url: imagekitUrls.comboOuzoudAdventure, alt: 'Ouzoud Adventure Pack' },
  ]

  for (const img of imagesToUpload) {
    console.log(`  ↓ Uploading: ${img.alt}...`)
    const mediaId = await createMediaFromUrl(payload, img.url, img.alt)
    if (mediaId) {
      mediaAssets[img.key] = mediaId
      console.log(`  ✓ Uploaded: ${img.alt}`)
    }
  }

  // ============================================
  // ACTIVITIES
  // ============================================
  console.log('\n🎯 Creating activities...')

  const activitiesData = [
    // ============================================
    // ACTIVITY 1: OUZOUD FALLS DAY TRIP
    // ============================================
    {
      slug: 'ouzoud-falls-day-trip',
      categorySlug: 'nature-wildlife',
      locationSlug: 'ouzoud-waterfalls',
      mediaKey: 'ouzoud',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 25, childPrice: 15, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 15 },
      duration: { en: '1 Day', fr: '1 Jour', de: '1 Tag' },
      durationMinutes: 600,
      displayOrder: 1,
      rating: 4.9,
      reviewCount: 127,
      isFeatured: true,
      title: {
        en: "Ouzoud Falls Day Trip: Morocco's Most Breathtaking Waterfalls",
        fr: "Excursion aux Cascades d'Ouzoud : Les Plus Belles Chutes du Maroc",
        de: 'Tagesausflug zu den Ouzoud-Wasserfällen: Marokkos Atemberaubendste Wasserfälle',
      },
      shortDescription: {
        en: "Escape to Morocco's most spectacular waterfalls. 110 meters of thundering cascades, playful Barbary macaques, and the hidden wonder of Iminifri Bridge—all in one unforgettable day.",
        fr: "Évadez-vous vers les cascades les plus spectaculaires du Maroc. 110 mètres de chutes tonnantes, des macaques de Barbarie joueurs et la merveille cachée du Pont d'Iminifri—tout en une journée inoubliable.",
        de: 'Entfliehen Sie zu Marokkos spektakulärsten Wasserfällen. 110 Meter donnernde Kaskaden, verspielte Berberaffen und das verborgene Wunder der Iminifri-Brücke—alles an einem unvergesslichen Tag.',
      },
      highlights: {
        en: ["Marvel at 110-meter cascading waterfalls—Morocco's tallest", 'Walk scenic paths through fig, olive, and pomegranate groves', 'Spot wild Barbary macaques in their natural habitat', 'Visit ancient grain mills powered by the falls for centuries', "Explore Iminifri Bridge's stunning natural rock formations", 'Optional boat ride to the base of the falls'],
        fr: ['Admirez les cascades de 110 mètres—les plus hautes du Maroc', 'Parcourez des sentiers pittoresques à travers les figuiers, oliviers et grenadiers', 'Observez les macaques de Barbarie dans leur habitat naturel', 'Visitez les anciens moulins à grains alimentés par les chutes', "Explorez les formations rocheuses naturelles du Pont d'Iminifri", 'Balade en bateau optionnelle au pied des cascades'],
        de: ['Bestaunen Sie die 110 Meter hohen Wasserfälle—Marokkos höchste', 'Wandern Sie auf malerischen Pfaden durch Feigen-, Oliven- und Granatapfelhaine', 'Entdecken Sie wilde Berberaffen in ihrem natürlichen Lebensraum', 'Besuchen Sie uralte Getreidemühlen, die seit Jahrhunderten von den Wasserfällen angetrieben werden', 'Erkunden Sie die atemberaubenden natürlichen Felsformationen der Iminifri-Brücke', 'Optionale Bootsfahrt zum Fuß der Wasserfälle'],
      },
      included: {
        en: ['Hotel pickup & drop-off in air-conditioned vehicle', 'Professional bilingual driver (English/French)', 'Fuel, tolls & vehicle insurance', 'Complimentary bottled water', 'Free WiFi in vehicle'],
        fr: ['Transfert hôtel aller-retour en véhicule climatisé', 'Chauffeur professionnel bilingue (anglais/français)', 'Carburant, péages et assurance véhicule', 'Eau en bouteille offerte', 'WiFi gratuit dans le véhicule'],
        de: ['Hotel-Abholung & Rückfahrt im klimatisierten Fahrzeug', 'Professioneller zweisprachiger Fahrer (Englisch/Französisch)', 'Treibstoff, Mautgebühren & Fahrzeugversicherung', 'Kostenlose Wasserflasche', 'Kostenloses WLAN im Fahrzeug'],
      },
    },
    // ============================================
    // ACTIVITY 2: ESSAOUIRA DAY TRIP
    // ============================================
    {
      slug: 'essaouira-day-trip',
      categorySlug: 'coastal-adventures',
      locationSlug: 'essaouira',
      mediaKey: 'essaouira',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 20, childPrice: 12, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 15 },
      duration: { en: '1 Day', fr: '1 Jour', de: '1 Tag' },
      durationMinutes: 660,
      displayOrder: 2,
      rating: 4.8,
      reviewCount: 98,
      isFeatured: true,
      title: {
        en: "Essaouira Day Trip: Morocco's Enchanting Coastal Escape",
        fr: "Excursion à Essaouira : L'Escapade Côtière Enchanteresse du Maroc",
        de: 'Tagesausflug nach Essaouira: Marokkos Bezaubernde Küstenflucht',
      },
      shortDescription: {
        en: "Trade Marrakech's red walls for Atlantic blue. Wander a UNESCO medina, taste the freshest seafood, and let the ocean breeze work its magic.",
        fr: "Échangez les murs rouges de Marrakech contre le bleu de l'Atlantique. Flânez dans une médina UNESCO, goûtez les fruits de mer les plus frais et laissez la brise océanique opérer sa magie.",
        de: 'Tauschen Sie Marrakeschs rote Mauern gegen Atlantikblau. Wandern Sie durch eine UNESCO-Medina, kosten Sie die frischesten Meeresfrüchte und lassen Sie die Meeresbrise ihre Magie wirken.',
      },
      highlights: {
        en: ['Explore the UNESCO-listed medina with its blue boats and whitewashed walls', 'Discover Essaouira\'s role as a Game of Thrones filming location (Astapor)', 'Taste fresh-caught seafood at the historic port', 'Visit a traditional argan oil women\'s cooperative', 'Wander art galleries and meet local artists', 'Feel the legendary Atlantic winds that draw windsurfers worldwide'],
        fr: ["Explorez la médina classée UNESCO avec ses bateaux bleus et ses murs blanchis", "Découvrez le rôle d'Essaouira comme lieu de tournage de Game of Thrones (Astapor)", 'Dégustez des fruits de mer fraîchement pêchés au port historique', "Visitez une coopérative traditionnelle d'huile d'argan", 'Flânez dans les galeries d\'art et rencontrez les artistes locaux', 'Ressentez les vents légendaires de l\'Atlantique qui attirent les véliplanchistes du monde entier'],
        de: ['Erkunden Sie die UNESCO-gelistete Medina mit ihren blauen Booten und weißgetünchten Mauern', 'Entdecken Sie Essaouiras Rolle als Game of Thrones Drehort (Astapor)', 'Kosten Sie fangfrische Meeresfrüchte am historischen Hafen', 'Besuchen Sie eine traditionelle Arganöl-Frauenkooperative', 'Schlendern Sie durch Kunstgalerien und treffen Sie lokale Künstler', 'Spüren Sie die legendären Atlantikwinde, die Windsurfer aus aller Welt anziehen'],
      },
      included: {
        en: ['Hotel pickup & drop-off from Marrakech', 'Comfortable air-conditioned transport', 'Professional English/French-speaking driver', 'Stop at an argan oil cooperative', 'All fuel and vehicle expenses', 'Complimentary bottled water', 'Free WiFi in vehicle'],
        fr: ['Transfert hôtel aller-retour depuis Marrakech', 'Transport confortable climatisé', 'Chauffeur professionnel anglophone/francophone', "Arrêt dans une coopérative d'huile d'argan", 'Tous les frais de carburant et véhicule', 'Eau en bouteille offerte', 'WiFi gratuit dans le véhicule'],
        de: ['Hotel-Abholung & Rückfahrt von Marrakesch', 'Komfortabler klimatisierter Transport', 'Professioneller englisch/französischsprachiger Fahrer', 'Stopp bei einer Arganöl-Kooperative', 'Alle Treibstoff- und Fahrzeugkosten', 'Kostenlose Wasserflasche', 'Kostenloses WLAN im Fahrzeug'],
      },
    },
    // ============================================
    // ACTIVITY 3: OURIKA VALLEY DAY TRIP
    // ============================================
    {
      slug: 'ourika-valley-day-trip',
      categorySlug: 'mountain-excursions',
      locationSlug: 'ourika-valley',
      mediaKey: 'ourika',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 20, childPrice: 12, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 15 },
      duration: { en: '1 Day', fr: '1 Jour', de: '1 Tag' },
      durationMinutes: 540,
      displayOrder: 3,
      rating: 4.8,
      reviewCount: 112,
      isFeatured: true,
      title: {
        en: 'Ourika Valley Day Trip: Atlas Mountains & Berber Culture',
        fr: "Excursion Vallée de l'Ourika : Montagnes de l'Atlas et Culture Berbère",
        de: 'Tagesausflug ins Ourika-Tal: Atlasgebirge & Berberkultur',
      },
      shortDescription: {
        en: 'Just an hour from Marrakech, a different world awaits. Discover traditional Berber villages, hike to mountain waterfalls, and experience authentic Moroccan hospitality.',
        fr: "À seulement une heure de Marrakech, un autre monde vous attend. Découvrez les villages berbères traditionnels, randonnez vers les cascades de montagne et vivez l'hospitalité marocaine authentique.",
        de: 'Nur eine Stunde von Marrakesch entfernt erwartet Sie eine andere Welt. Entdecken Sie traditionelle Berberdörfer, wandern Sie zu Bergwasserfällen und erleben Sie authentische marokkanische Gastfreundschaft.',
      },
      highlights: {
        en: ['Cross the dramatic Ourika Valley to the foot of the Atlas Mountains', 'Visit authentic Berber villages clinging to mountainsides', 'Hike to the seven waterfalls of Setti Fatma', 'Enjoy traditional mint tea in a Berber home', 'Explore local souks and artisan workshops', 'Optional lunch overlooking the rushing river'],
        fr: ["Traversez la spectaculaire Vallée de l'Ourika jusqu'au pied de l'Atlas", 'Visitez des villages berbères authentiques accrochés aux flancs des montagnes', 'Randonnez vers les sept cascades de Setti Fatma', 'Dégustez un thé à la menthe traditionnel dans une maison berbère', 'Explorez les souks locaux et ateliers d\'artisans', 'Déjeuner optionnel avec vue sur la rivière'],
        de: ['Durchqueren Sie das dramatische Ourika-Tal bis zum Fuß des Atlasgebirges', 'Besuchen Sie authentische Berberdörfer an Berghängen', 'Wandern Sie zu den sieben Wasserfällen von Setti Fatma', 'Genießen Sie traditionellen Minztee in einem Berberhaus', 'Erkunden Sie lokale Souks und Handwerksbetriebe', 'Optionales Mittagessen mit Blick auf den rauschenden Fluss'],
      },
      included: {
        en: ['Hotel pickup & drop-off from Marrakech', 'Air-conditioned vehicle', 'English/French-speaking driver', 'Fuel, tolls & vehicle insurance', 'Complimentary bottled water', 'WiFi in vehicle'],
        fr: ['Transfert hôtel aller-retour depuis Marrakech', 'Véhicule climatisé', 'Chauffeur anglophone/francophone', 'Carburant, péages et assurance véhicule', 'Eau en bouteille offerte', 'WiFi dans le véhicule'],
        de: ['Hotel-Abholung & Rückfahrt von Marrakesch', 'Klimatisiertes Fahrzeug', 'Englisch/französischsprachiger Fahrer', 'Treibstoff, Mautgebühren & Fahrzeugversicherung', 'Kostenlose Wasserflasche', 'WLAN im Fahrzeug'],
      },
    },
    // ============================================
    // ACTIVITY 4: AIT BEN HADDOU & OUARZAZATE
    // ============================================
    {
      slug: 'ait-ben-haddou-ouarzazate-day-trip',
      categorySlug: 'cultural-heritage',
      locationSlug: 'ouarzazate',
      mediaKey: 'ouarzazate',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 30, childPrice: 20, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 15 },
      duration: { en: '1 Day', fr: '1 Jour', de: '1 Tag' },
      durationMinutes: 720,
      displayOrder: 4,
      rating: 4.9,
      reviewCount: 89,
      isFeatured: true,
      title: {
        en: 'Ait Ben Haddou & Ouarzazate: Hollywood of the Desert',
        fr: "Aït Ben Haddou & Ouarzazate : Le Hollywood du Désert",
        de: 'Ait Ben Haddou & Ouarzazate: Hollywood der Wüste',
      },
      shortDescription: {
        en: "Walk in the footsteps of Gladiator and Game of Thrones. Cross Morocco's highest pass and explore the UNESCO fortress that's starred in over 20 blockbusters.",
        fr: "Marchez sur les traces de Gladiator et Game of Thrones. Traversez le plus haut col du Maroc et explorez la forteresse UNESCO qui a joué dans plus de 20 blockbusters.",
        de: 'Wandeln Sie auf den Spuren von Gladiator und Game of Thrones. Überqueren Sie Marokkos höchsten Pass und erkunden Sie die UNESCO-Festung, die in über 20 Blockbustern mitgespielt hat.',
      },
      highlights: {
        en: ["Cross Tizi n'Tichka pass (2,260m) with breathtaking panoramic views", 'Explore the UNESCO World Heritage ksar of Ait Ben Haddou', 'Walk the streets where Gladiator, Game of Thrones, and Lawrence of Arabia were filmed', "Visit Atlas Film Studios—Africa's largest movie studio", 'Discover the Kasbah Taourirt in Ouarzazate', 'Pass through traditional Berber villages along the ancient caravan route'],
        fr: ["Traversez le col du Tizi n'Tichka (2 260 m) avec des vues panoramiques à couper le souffle", 'Explorez le ksar d\'Aït Ben Haddou, patrimoine mondial de l\'UNESCO', 'Parcourez les rues où Gladiator, Game of Thrones et Lawrence d\'Arabie ont été tournés', "Visitez les Studios Atlas—le plus grand studio de cinéma d'Afrique", 'Découvrez la Kasbah Taourirt à Ouarzazate', 'Passez par des villages berbères traditionnels le long de l\'ancienne route caravanière'],
        de: ["Überqueren Sie den Tizi n'Tichka-Pass (2.260 m) mit atemberaubendem Panoramablick", 'Erkunden Sie den UNESCO-Weltkulturerbe-Ksar von Ait Ben Haddou', 'Gehen Sie durch die Straßen, wo Gladiator, Game of Thrones und Lawrence von Arabien gedreht wurden', 'Besuchen Sie die Atlas Film Studios—Afrikas größtes Filmstudio', 'Entdecken Sie die Kasbah Taourirt in Ouarzazate', 'Fahren Sie durch traditionelle Berberdörfer entlang der alten Karawanenroute'],
      },
      included: {
        en: ['Hotel pickup & drop-off in air-conditioned vehicle', 'Professional English/French-speaking driver', 'Cross the High Atlas via Tizi n\'Tichka', 'Guided exploration of Ait Ben Haddou', 'Fuel, tolls & vehicle insurance', 'Complimentary bottled water', 'WiFi in vehicle'],
        fr: ['Transfert hôtel aller-retour en véhicule climatisé', 'Chauffeur professionnel anglophone/francophone', "Traversée du Haut Atlas via le Tizi n'Tichka", 'Exploration guidée d\'Aït Ben Haddou', 'Carburant, péages et assurance véhicule', 'Eau en bouteille offerte', 'WiFi dans le véhicule'],
        de: ['Hotel-Abholung & Rückfahrt im klimatisierten Fahrzeug', 'Professioneller englisch/französischsprachiger Fahrer', "Überquerung des Hohen Atlas über den Tizi n'Tichka", 'Geführte Erkundung von Ait Ben Haddou', 'Treibstoff, Mautgebühren & Fahrzeugversicherung', 'Kostenlose Wasserflasche', 'WLAN im Fahrzeug'],
      },
    },
    // ============================================
    // ACTIVITY 5: ZAGORA DESERT 2-DAY
    // ============================================
    {
      slug: 'zagora-desert-overnight-adventure',
      categorySlug: 'desert-adventures',
      locationSlug: 'zagora',
      mediaKey: 'agafayNormal',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 70, childPrice: 50, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 15 },
      duration: { en: '2 Days', fr: '2 Jours', de: '2 Tage' },
      durationMinutes: 2880,
      displayOrder: 5,
      rating: 4.9,
      reviewCount: 76,
      isFeatured: true,
      title: {
        en: 'Zagora Desert Overnight: Sleep Under a Million Stars',
        fr: 'Désert de Zagora : Dormez Sous un Million d\'Étoiles',
        de: 'Zagora Wüste Übernachtung: Schlafen Sie Unter Millionen Sternen',
      },
      shortDescription: {
        en: "Journey to Morocco's desert gateway with camel trekking, overnight camping under the stars, and UNESCO World Heritage exploration.",
        fr: "Voyagez vers la porte du désert marocain avec randonnée à dos de chameau, camping sous les étoiles et exploration du patrimoine mondial UNESCO.",
        de: 'Reisen Sie zu Marokkos Wüstentor mit Kameltrekking, Übernachtung unter den Sternen und UNESCO-Weltkulturerbe-Erkundung.',
      },
      highlights: {
        en: ["Cross the High Atlas via Tizi n'Tichka (2,260m) - Morocco's most spectacular mountain pass", 'Explore UNESCO-listed Ait Ben Haddou - filming location for Gladiator, Game of Thrones, and Lawrence of Arabia', "Journey through the lush Draa Valley - Morocco's longest river oasis with 200km of palm groves", 'Experience an authentic camel trek into the desert dunes at sunset', 'Sleep under millions of stars in a traditional Berber bivouac camp', 'Enjoy traditional Moroccan dinner around a crackling campfire', 'Visit the gateway town of Zagora - where the famous "Timbuktu 52 Days" sign marks the start of ancient caravan routes'],
        fr: ["Traversez le Haut Atlas via le Tizi n'Tichka (2 260 m) - le col le plus spectaculaire du Maroc", "Explorez Aït Ben Haddou classé UNESCO - lieu de tournage de Gladiator, Game of Thrones et Lawrence d'Arabie", "Traversez la luxuriante Vallée du Drâa - la plus longue oasis fluviale du Maroc avec 200 km de palmeraies", 'Vivez une authentique randonnée à dos de chameau dans les dunes au coucher du soleil', 'Dormez sous des millions d\'étoiles dans un bivouac berbère traditionnel', 'Savourez un dîner marocain traditionnel autour d\'un feu de camp', 'Visitez Zagora - où le célèbre panneau "Tombouctou 52 Jours" marque le début des anciennes routes caravanières'],
        de: ["Überqueren Sie den Hohen Atlas über den Tizi n'Tichka (2.260 m) - Marokkos spektakulärster Gebirgspass", 'Erkunden Sie das UNESCO-gelistete Ait Ben Haddou - Drehort für Gladiator, Game of Thrones und Lawrence von Arabien', 'Durchqueren Sie das üppige Draa-Tal - Marokkos längste Flussoase mit 200 km Palmhainen', 'Erleben Sie einen authentischen Kameltreck in die Wüstendünen bei Sonnenuntergang', 'Schlafen Sie unter Millionen von Sternen in einem traditionellen Berber-Biwakcamp', 'Genießen Sie ein traditionelles marokkanisches Abendessen am knisternden Lagerfeuer', 'Besuchen Sie die Tor-Stadt Zagora - wo das berühmte "Timbuktu 52 Tage"-Schild den Beginn alter Karawanenrouten markiert'],
      },
      included: {
        en: ['Comfortable air-conditioned transportation', 'Professional English and French-speaking driver', '1 night accommodation in traditional Berber desert camp', 'Dinner at the bivouac camp (traditional Moroccan meal)', 'Breakfast at the desert camp', 'Sunset camel trek to the bivouac', 'All fuel and vehicle expenses', 'Travel insurance coverage', 'Complimentary bottled water', 'WiFi available in vehicles'],
        fr: ['Transport confortable climatisé', 'Chauffeur professionnel anglophone et francophone', '1 nuit en camp désertique berbère traditionnel', 'Dîner au bivouac (repas marocain traditionnel)', 'Petit-déjeuner au camp du désert', 'Randonnée à dos de chameau au coucher du soleil', 'Tous les frais de carburant et véhicule', 'Couverture d\'assurance voyage', 'Eau en bouteille offerte', 'WiFi disponible dans les véhicules'],
        de: ['Komfortabler klimatisierter Transport', 'Professioneller englisch- und französischsprachiger Fahrer', '1 Übernachtung im traditionellen Berber-Wüstencamp', 'Abendessen im Biwakcamp (traditionelle marokkanische Mahlzeit)', 'Frühstück im Wüstencamp', 'Kamelritt bei Sonnenuntergang zum Biwak', 'Alle Treibstoff- und Fahrzeugkosten', 'Reiseversicherung', 'Kostenlose Wasserflasche', 'WLAN in Fahrzeugen verfügbar'],
      },
    },
    // ============================================
    // ACTIVITY 6: MERZOUGA 3-DAY SAHARA
    // ============================================
    {
      slug: 'merzouga-sahara-expedition',
      categorySlug: 'desert-adventures',
      locationSlug: 'merzouga',
      mediaKey: 'agafayNormal',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 110, childPrice: 80, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 15 },
      duration: { en: '3 Days', fr: '3 Jours', de: '3 Tage' },
      durationMinutes: 4320,
      displayOrder: 6,
      rating: 5.0,
      reviewCount: 143,
      isFeatured: true,
      title: {
        en: 'Merzouga 3-Day Sahara Expedition: The Ultimate Desert Journey',
        fr: 'Expédition Sahara 3 Jours à Merzouga : Le Voyage Ultime dans le Désert',
        de: 'Merzouga 3-Tage Sahara-Expedition: Die Ultimative Wüstenreise',
      },
      shortDescription: {
        en: 'The ultimate 3-day Morocco adventure: High Atlas passes, dramatic gorges, UNESCO kasbahs, and a magical night camping in the Sahara dunes.',
        fr: "L'aventure ultime de 3 jours au Maroc : cols du Haut Atlas, gorges spectaculaires, kasbahs UNESCO et une nuit magique dans les dunes du Sahara.",
        de: 'Das ultimative 3-Tage Marokko-Abenteuer: Hohe Atlas-Pässe, dramatische Schluchten, UNESCO-Kasbahs und eine magische Nacht in den Sahara-Dünen.',
      },
      highlights: {
        en: ["Cross the mighty High Atlas via Tizi n'Tichka pass (2,260m) with breathtaking panoramic views", 'Explore UNESCO World Heritage Ait Ben Haddou - the iconic fortress from Gladiator and Game of Thrones', 'Wind through the spectacular Dades Gorges and the legendary Valley of Roses', "Marvel at the towering 300-meter walls of Todgha Gorge - Morocco's most dramatic canyon", 'Discover 350-million-year-old marine fossils at Erfoud - relics of an ancient ocean', 'Trek by camel into the towering Erg Chebbi dunes as the sun sets in a blaze of gold and crimson', 'Spend a magical night in a traditional Berber desert camp beneath countless stars', 'Wake to a Saharan sunrise - watch the dunes transform from deep purple to fiery orange'],
        fr: ["Traversez le majestueux Haut Atlas via le col du Tizi n'Tichka (2 260 m) avec des vues panoramiques époustouflantes", "Explorez le patrimoine mondial UNESCO d'Aït Ben Haddou - la forteresse emblématique de Gladiator et Game of Thrones", 'Serpentez à travers les spectaculaires Gorges du Dadès et la légendaire Vallée des Roses', 'Émerveillez-vous devant les parois de 300 mètres des Gorges du Todgha - le canyon le plus spectaculaire du Maroc', 'Découvrez des fossiles marins de 350 millions d\'années à Erfoud', 'Randonnée à dos de chameau dans les imposantes dunes de l\'Erg Chebbi au coucher du soleil', 'Passez une nuit magique dans un camp berbère traditionnel sous des étoiles innombrables', 'Réveillez-vous devant un lever de soleil saharien - regardez les dunes passer du violet profond à l\'orange flamboyant'],
        de: ["Überqueren Sie den mächtigen Hohen Atlas über den Tizi n'Tichka-Pass (2.260 m) mit atemberaubendem Panoramablick", 'Erkunden Sie das UNESCO-Weltkulturerbe Ait Ben Haddou - die ikonische Festung aus Gladiator und Game of Thrones', 'Schlängeln Sie sich durch die spektakulären Dades-Schluchten und das legendäre Tal der Rosen', 'Bestaunen Sie die 300 Meter hohen Wände der Todgha-Schlucht - Marokkos dramatischste Schlucht', 'Entdecken Sie 350 Millionen Jahre alte Meeresfossilien in Erfoud', 'Reiten Sie per Kamel in die hohen Erg Chebbi Dünen während die Sonne in Gold und Karmesin untergeht', 'Verbringen Sie eine magische Nacht in einem traditionellen Berber-Wüstencamp unter unzähligen Sternen', 'Wachen Sie zu einem Sahara-Sonnenaufgang auf - sehen Sie wie die Dünen von tiefem Violett zu feurigem Orange wechseln'],
      },
      included: {
        en: ['Comfortable air-conditioned transportation throughout', 'Professional English and French-speaking driver/guide', '2 nights accommodation (1 night Dades Valley guesthouse + 1 night Sahara desert camp)', '2 dinners (Day 1 guesthouse + Day 2 desert camp)', '2 breakfasts (Day 2 + Day 3)', 'Sunset camel trek to the desert bivouac', 'All fuel and vehicle expenses', 'Travel insurance coverage', 'Complimentary bottled water daily', 'WiFi in vehicles'],
        fr: ['Transport climatisé confortable tout au long du voyage', 'Chauffeur/guide professionnel anglophone et francophone', '2 nuits d\'hébergement (1 nuit maison d\'hôtes Vallée du Dadès + 1 nuit camp du désert)', '2 dîners (Jour 1 maison d\'hôtes + Jour 2 camp du désert)', '2 petits-déjeuners (Jour 2 + Jour 3)', 'Randonnée à dos de chameau au coucher du soleil vers le bivouac', 'Tous les frais de carburant et véhicule', 'Couverture d\'assurance voyage', 'Eau en bouteille offerte quotidiennement', 'WiFi dans les véhicules'],
        de: ['Komfortabler klimatisierter Transport während der gesamten Reise', 'Professioneller englisch- und französischsprachiger Fahrer/Guide', '2 Übernachtungen (1 Nacht Dades-Tal Gästehaus + 1 Nacht Sahara-Wüstencamp)', '2 Abendessen (Tag 1 Gästehaus + Tag 2 Wüstencamp)', '2 Frühstücke (Tag 2 + Tag 3)', 'Kamelritt bei Sonnenuntergang zum Wüstenbiwak', 'Alle Treibstoff- und Fahrzeugkosten', 'Reiseversicherung', 'Täglich kostenlose Wasserflasche', 'WLAN in Fahrzeugen'],
      },
    },
    // ============================================
    // ACTIVITY 7: PRIVATE ATLAS IMLIL DAY TRIP
    // ============================================
    {
      slug: 'private-atlas-imlil-day-trip',
      categorySlug: 'mountain-excursions',
      locationSlug: 'imlil',
      mediaKey: 'ourika',
      pricingType: 'fixed',
      privatePricing: { basePrice: 40, minGuests: 1, maxGuests: 7, additionalGuestPrice: 10 },
      duration: { en: '1 Day', fr: '1 Jour', de: '1 Tag' },
      durationMinutes: 480,
      displayOrder: 7,
      rating: 4.9,
      reviewCount: 54,
      title: {
        en: 'Private Atlas Day Trip: Imlil & the Three Valleys',
        fr: 'Excursion Privée Atlas : Imlil et les Trois Vallées',
        de: 'Privater Atlas-Tagesausflug: Imlil & die Drei Täler',
      },
      shortDescription: {
        en: 'Your own private escape to the High Atlas. Explore three stunning valleys, visit authentic Berber villages, and discover the gateway to Mount Toubkal.',
        fr: "Votre escapade privée dans le Haut Atlas. Explorez trois vallées magnifiques, visitez des villages berbères authentiques et découvrez la porte du Mont Toubkal.",
        de: 'Ihre eigene private Flucht in den Hohen Atlas. Erkunden Sie drei atemberaubende Täler, besuchen Sie authentische Berberdörfer und entdecken Sie das Tor zum Mount Toubkal.',
      },
      highlights: {
        en: ['Travel in complete privacy with your own dedicated vehicle and driver', 'Wind through three breathtaking valleys - Asni, Ouirgane, and Imlil', "Visit the iconic Imlil village (1,740m) - gateway to Mount Toubkal, North Africa's highest summit", 'Experience authentic Berber hospitality in a traditional mountain home', 'Enjoy panoramic views of snow-capped Atlas peaks (seasonal)', 'Discover ancient terraced farms and traditional irrigation systems', 'Optional lunch at the legendary Kasbah du Toubkal or local village restaurant', 'Stop at scenic viewpoints for stunning photography opportunities'],
        fr: ['Voyagez en toute intimité avec votre véhicule et chauffeur dédiés', 'Serpentez à travers trois vallées époustouflantes - Asni, Ouirgane et Imlil', "Visitez le village emblématique d'Imlil (1 740 m) - porte du Mont Toubkal, plus haut sommet d'Afrique du Nord", "Vivez l'hospitalité berbère authentique dans une maison de montagne traditionnelle", 'Profitez de vues panoramiques sur les sommets enneigés de l\'Atlas (saisonnier)', 'Découvrez les anciennes fermes en terrasses et les systèmes d\'irrigation traditionnels', 'Déjeuner optionnel à la légendaire Kasbah du Toubkal ou dans un restaurant du village', 'Arrêts aux points de vue panoramiques pour des photos exceptionnelles'],
        de: ['Reisen Sie in vollständiger Privatsphäre mit Ihrem eigenen Fahrzeug und Fahrer', 'Schlängeln Sie sich durch drei atemberaubende Täler - Asni, Ouirgane und Imlil', 'Besuchen Sie das ikonische Dorf Imlil (1.740 m) - Tor zum Mount Toubkal, Nordafrikas höchstem Gipfel', 'Erleben Sie authentische Berber-Gastfreundschaft in einem traditionellen Berghaus', 'Genießen Sie Panoramablicke auf schneebedeckte Atlas-Gipfel (saisonal)', 'Entdecken Sie uralte Terrassenfarmen und traditionelle Bewässerungssysteme', 'Optionales Mittagessen in der legendären Kasbah du Toubkal oder einem lokalen Dorfrestaurant', 'Stopps an malerischen Aussichtspunkten für atemberaubende Fotogelegenheiten'],
      },
      included: {
        en: ['Private air-conditioned vehicle exclusively for your group', 'Professional English and French-speaking driver', 'Full day of flexibility - go at your own pace', 'All fuel and vehicle expenses', 'Travel insurance coverage', 'Complimentary bottled water', 'WiFi available in vehicle', 'Hotel pickup and drop-off from any Marrakech accommodation'],
        fr: ['Véhicule climatisé privé exclusivement pour votre groupe', 'Chauffeur professionnel anglophone et francophone', 'Journée complète de flexibilité - à votre rythme', 'Tous les frais de carburant et véhicule', 'Couverture d\'assurance voyage', 'Eau en bouteille offerte', 'WiFi disponible dans le véhicule', 'Transfert hôtel aller-retour depuis tout hébergement à Marrakech'],
        de: ['Privates klimatisiertes Fahrzeug exklusiv für Ihre Gruppe', 'Professioneller englisch- und französischsprachiger Fahrer', 'Ganzer Tag Flexibilität - in Ihrem eigenen Tempo', 'Alle Treibstoff- und Fahrzeugkosten', 'Reiseversicherung', 'Kostenlose Wasserflasche', 'WLAN im Fahrzeug verfügbar', 'Hotel-Abholung und Rückfahrt von jeder Unterkunft in Marrakesch'],
      },
    },
    // ============================================
    // ACTIVITY 8: CAMEL RIDE PALMERAIE
    // ============================================
    {
      slug: 'camel-ride-palmeraie-marrakech',
      categorySlug: 'cultural-heritage',
      locationSlug: 'palmeraie',
      mediaKey: 'camelPalmeraie',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 25, childPrice: 15, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 20 },
      duration: { en: '2-3 Hours', fr: '2-3 Heures', de: '2-3 Stunden' },
      durationMinutes: 150,
      displayOrder: 8,
      rating: 4.8,
      reviewCount: 183,
      isFeatured: true,
      title: {
        en: 'Sunset Camel Ride in the Marrakech Palm Grove',
        fr: 'Balade à Dos de Chameau au Coucher du Soleil dans la Palmeraie de Marrakech',
        de: 'Kamelritt bei Sonnenuntergang im Palmenhain von Marrakesch',
      },
      shortDescription: {
        en: "Ride a camel through Marrakech's ancient palm grove at sunset. Traditional Berber attire, mint tea ceremony, and stunning photo opportunities included.",
        fr: "Montez à dos de chameau dans l'ancienne palmeraie de Marrakech au coucher du soleil. Tenue berbère traditionnelle, cérémonie du thé à la menthe et opportunités photo exceptionnelles incluses.",
        de: 'Reiten Sie auf einem Kamel durch Marrakeschs uralten Palmenhain bei Sonnenuntergang. Traditionelle Berberkleidung, Minztee-Zeremonie und atemberaubende Fotogelegenheiten inklusive.',
      },
      highlights: {
        en: ['Ride through the legendary Palmeraie - a 12th-century oasis of 100,000+ palm trees', 'Wear traditional Berber robes and headscarf for authentic photos', '1-hour camel trek through sun-dappled palm groves and traditional villages', 'Relax in a colorful Berber tent with cushions and carpets', 'Savor authentic Moroccan mint tea ceremony with local sweets', 'Capture incredible sunset photos with the Atlas Mountains as backdrop', 'Learn about traditional Berber culture and camel husbandry from local guides'],
        fr: ['Parcourez la légendaire Palmeraie - une oasis du 12ème siècle de plus de 100 000 palmiers', 'Portez des robes berbères traditionnelles et un foulard pour des photos authentiques', '1 heure de randonnée à dos de chameau dans les palmeraies et villages traditionnels', 'Détendez-vous dans une tente berbère colorée avec coussins et tapis', 'Savourez une authentique cérémonie du thé à la menthe avec des pâtisseries locales', "Capturez des photos incroyables au coucher du soleil avec l'Atlas en arrière-plan", 'Découvrez la culture berbère traditionnelle et l\'élevage de chameaux auprès des guides locaux'],
        de: ['Reiten Sie durch die legendäre Palmeraie - eine Oase aus dem 12. Jahrhundert mit über 100.000 Palmen', 'Tragen Sie traditionelle Berbergewänder und Kopftuch für authentische Fotos', '1-stündiger Kameltreck durch sonnengefleckte Palmenhaine und traditionelle Dörfer', 'Entspannen Sie sich in einem bunten Berberzelt mit Kissen und Teppichen', 'Genießen Sie eine authentische marokkanische Minztee-Zeremonie mit lokalen Süßigkeiten', 'Fangen Sie unglaubliche Sonnenuntergangsfotos mit dem Atlasgebirge als Kulisse ein', 'Lernen Sie von lokalen Guides über traditionelle Berberkultur und Kamelzucht'],
      },
      included: {
        en: ['Hotel pickup and drop-off from central Marrakech', '1-hour camel ride through the Palmeraie', 'Traditional Berber robes and headscarf for the ride', 'Experienced camel guide throughout', 'Relaxation time in traditional Berber tent', 'Authentic Moroccan mint tea and pastries', 'Photo opportunities (use your own camera)', 'All taxes and service charges'],
        fr: ['Transfert hôtel aller-retour depuis le centre de Marrakech', '1 heure de balade à dos de chameau dans la Palmeraie', 'Robes berbères traditionnelles et foulard pour la balade', 'Guide chamelier expérimenté tout au long', 'Temps de détente dans une tente berbère traditionnelle', 'Thé à la menthe marocain authentique et pâtisseries', 'Opportunités photo (avec votre propre appareil)', 'Toutes taxes et frais de service inclus'],
        de: ['Hotel-Abholung und Rückfahrt aus dem Zentrum von Marrakesch', '1-stündiger Kamelritt durch die Palmeraie', 'Traditionelle Berbergewänder und Kopftuch für den Ritt', 'Erfahrener Kamelführer während der gesamten Tour', 'Entspannungszeit im traditionellen Berberzelt', 'Authentischer marokkanischer Minztee und Gebäck', 'Fotogelegenheiten (eigene Kamera)', 'Alle Steuern und Servicegebühren inklusive'],
      },
    },
    // ============================================
    // ACTIVITY 9: QUAD BIKE PALMERAIE
    // ============================================
    {
      slug: 'quad-bike-palmeraie-marrakech',
      categorySlug: 'adventure-sports',
      locationSlug: 'palmeraie',
      mediaKey: 'quadPalmeraie',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 36, childPrice: 25, childAgeLimit: 16, minGroupSize: 1, maxGroupSize: 12 },
      duration: { en: '2 Hours', fr: '2 Heures', de: '2 Stunden' },
      durationMinutes: 120,
      displayOrder: 9,
      rating: 4.7,
      reviewCount: 156,
      isFeatured: true,
      title: {
        en: 'Quad Bike Adventure: Race Through the Marrakech Palm Grove',
        fr: 'Aventure en Quad : Course à Travers la Palmeraie de Marrakech',
        de: 'Quad-Bike Abenteuer: Rasen Sie Durch den Palmenhain von Marrakesch',
      },
      shortDescription: {
        en: 'Thrilling quad bike adventure through the Palmeraie desert landscape. Explore Berber villages, enjoy mint tea with locals, and experience off-road excitement.',
        fr: 'Aventure palpitante en quad à travers le paysage désertique de la Palmeraie. Explorez les villages berbères, savourez le thé à la menthe avec les locaux et vivez l\'excitation du hors-piste.',
        de: 'Aufregendes Quad-Bike-Abenteuer durch die Wüstenlandschaft der Palmeraie. Erkunden Sie Berberdörfer, genießen Sie Minztee mit Einheimischen und erleben Sie Off-Road-Aufregung.',
      },
      highlights: {
        en: ['Ride powerful 300cc KYMCO quad bikes (2021 models) through varied terrain', 'Explore off-road trails that wind through the ancient Palmeraie palm grove', 'Visit authentic Berber villages with traditional mudbrick (pisé) architecture', 'Meet local families and experience genuine Moroccan hospitality', 'Enjoy traditional mint tea and pastries in a Berber home', 'Professional safety briefing and training for all skill levels', 'Expert guides who know every trail and hidden gem', 'Stunning photo opportunities in dramatic desert landscapes'],
        fr: ['Pilotez des quads KYMCO 300cc puissants (modèles 2021) sur des terrains variés', 'Explorez des sentiers hors-piste qui serpentent à travers l\'ancienne palmeraie', 'Visitez des villages berbères authentiques avec architecture en pisé traditionnelle', 'Rencontrez des familles locales et vivez l\'hospitalité marocaine authentique', 'Savourez thé à la menthe traditionnel et pâtisseries dans une maison berbère', 'Briefing de sécurité professionnel et formation pour tous les niveaux', 'Guides experts qui connaissent chaque sentier et trésor caché', 'Opportunités photo exceptionnelles dans des paysages désertiques spectaculaires'],
        de: ['Fahren Sie leistungsstarke 300cc KYMCO Quads (2021 Modelle) über abwechslungsreiches Gelände', 'Erkunden Sie Offroad-Trails, die sich durch den uralten Palmeraie-Palmenhain schlängeln', 'Besuchen Sie authentische Berberdörfer mit traditioneller Lehmziegelarchitektur (Pisé)', 'Treffen Sie lokale Familien und erleben Sie echte marokkanische Gastfreundschaft', 'Genießen Sie traditionellen Minztee und Gebäck in einem Berberhaus', 'Professionelles Sicherheitsbriefing und Training für alle Könnensstufen', 'Erfahrene Guides, die jeden Trail und verborgenen Schatz kennen', 'Atemberaubende Fotogelegenheiten in dramatischen Wüstenlandschaften'],
      },
      included: {
        en: ['Hotel pickup and drop-off in air-conditioned vehicle', '1-hour quad bike ride on 300cc KYMCO quad (2021 model)', 'Full safety equipment (helmet, goggles, face covering)', 'Complete safety briefing and riding instruction', 'Professional English/French-speaking guide', 'Visit to traditional Berber village', 'Mint tea and Moroccan pastries with local family', 'Third-party liability insurance'],
        fr: ['Transfert hôtel aller-retour en véhicule climatisé', '1 heure de quad sur KYMCO 300cc (modèle 2021)', 'Équipement de sécurité complet (casque, lunettes, protection faciale)', 'Briefing de sécurité complet et instruction de conduite', 'Guide professionnel anglophone/francophone', 'Visite d\'un village berbère traditionnel', 'Thé à la menthe et pâtisseries marocaines avec une famille locale', 'Assurance responsabilité civile'],
        de: ['Hotel-Abholung und Rückfahrt im klimatisierten Fahrzeug', '1-stündige Quad-Fahrt auf 300cc KYMCO Quad (2021 Modell)', 'Vollständige Sicherheitsausrüstung (Helm, Schutzbrille, Gesichtsschutz)', 'Umfassendes Sicherheitsbriefing und Fahranleitung', 'Professioneller englisch/französischsprachiger Guide', 'Besuch eines traditionellen Berberdorfes', 'Minztee und marokkanisches Gebäck mit einer lokalen Familie', 'Haftpflichtversicherung'],
      },
    },
  ]

  const createdActivities: Record<string, string> = {}

  for (const activity of activitiesData) {
    try {
      // First check if it already exists
      const existing = await payload.find({
        collection: 'activities',
        where: { slug: { equals: activity.slug } },
      })

      if (existing.docs[0]) {
        createdActivities[activity.slug] = existing.docs[0].id
        console.log(`  ⏭ Activity already exists: ${activity.title.en}`)
        continue
      }

      const mediaId = mediaAssets[activity.mediaKey]
      if (!mediaId) {
        console.log(`  ⚠ Skipping ${activity.title.en} - no media available`)
        continue
      }

      const categoryId = createdCategories[activity.categorySlug]
      const locationId = createdLocations[activity.locationSlug]

      const baseData: any = {
        slug: activity.slug,
        category: categoryId,
        location: locationId,
        featuredImage: mediaId,
        pricingType: activity.pricingType,
        duration: activity.duration.en,
        durationMinutes: activity.durationMinutes,
        displayOrder: activity.displayOrder,
        isActive: true,
        isFeatured: activity.isFeatured || false,
        title: activity.title.en,
        description: createRichText(activity.shortDescription.en),
        shortDescription: activity.shortDescription.en,
        highlights: activity.highlights.en.map(h => ({ highlight: h })),
        included: activity.included.en.map(i => ({ item: i })),
        availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      }

      if (activity.pricingType === 'per_person' || activity.pricingType === 'both') {
        baseData.groupPricing = activity.groupPricing
      }
      if (activity.pricingType === 'fixed' || activity.pricingType === 'both') {
        baseData.privatePricing = activity.privatePricing
      }

      const created = await payload.create({
        collection: 'activities',
        locale: 'en',
        data: baseData,
      })
      createdActivities[activity.slug] = created.id

      // Update French
      await payload.update({
        collection: 'activities',
        id: created.id,
        locale: 'fr',
        data: {
          title: activity.title.fr,
          description: createRichText(activity.shortDescription.fr),
          shortDescription: activity.shortDescription.fr,
          duration: activity.duration.fr,
          highlights: activity.highlights.fr.map(h => ({ highlight: h })),
          included: activity.included.fr.map(i => ({ item: i })),
        },
      })

      // Update German
      await payload.update({
        collection: 'activities',
        id: created.id,
        locale: 'de',
        data: {
          title: activity.title.de,
          description: createRichText(activity.shortDescription.de),
          shortDescription: activity.shortDescription.de,
          duration: activity.duration.de,
          highlights: activity.highlights.de.map(h => ({ highlight: h })),
          included: activity.included.de.map(i => ({ item: i })),
        },
      })

      console.log(`  ✓ Created activity: ${activity.title.en}`)
    } catch (error: any) {
      console.error(`  ✗ Error creating activity ${activity.title.en}:`, error.message)
    }
  }

  // ============================================
  // GLOBALS: ABOUT PAGE & CONTACT PAGE (All Languages)
  // ============================================

  // About Page - English
  console.log('\n📄 Seeding About Page (English)...')
  try {
    await payload.updateGlobal({
      slug: 'about-page',
      locale: 'en',
      data: {
        hero: {
          badge: 'Since 2004',
          title: 'Your Gateway to Authentic Morocco',
          description: 'We are a team of passionate Moroccan locals dedicated to sharing the magic of our country with travelers from around the world. From the bustling medinas to the silent Sahara, we create unforgettable experiences.',
        },
        stats: [
          { value: '20+', label: 'Years Experience', icon: 'clock' },
          { value: '5,000+', label: 'Happy Travelers', icon: 'users' },
          { value: '4.9', label: 'Google Rating', icon: 'star' },
          { value: '50+', label: 'Unique Experiences', icon: 'mapPin' },
        ],
        story: {
          title: 'Our Story',
          paragraphs: [
            { text: "What started as a simple passion for sharing Morocco's beauty has grown into Atlas Mountain Visit - a trusted name in authentic Moroccan experiences. Founded in 2004, we've been helping travelers discover the real Morocco for over two decades." },
            { text: "Born and raised in Marrakech, our team knows every corner of this magical country. From the bustling souks to the silent Sahara, from the snow-capped Atlas to the blue streets of Chefchaouen - we've explored it all and can't wait to share these adventures with you." },
            { text: "We believe travel should be more than just sightseeing. It should be about connections, understanding, and moments that stay with you forever. That's why we focus on small groups, local experiences, and personalized attention." },
          ],
          highlights: [
            { text: 'Local guides who know Morocco intimately' },
            { text: 'Small groups for personal attention' },
            { text: 'Flexible itineraries to suit your pace' },
            { text: 'Authentic experiences, no tourist traps' },
          ],
          badgeValue: '20+',
          badgeLabel: 'Years of creating unforgettable memories',
        },
        valuesSection: {
          title: 'What Drives Us',
          subtitle: 'Our values guide everything we do, from the experiences we create to the way we treat every guest.',
          values: [
            { icon: 'heart', title: 'Passion for Morocco', description: 'We are Moroccan locals who love sharing our culture, traditions, and hidden gems with travelers from around the world.' },
            { icon: 'shield', title: 'Safety First', description: 'Your safety is our priority. All our activities are carefully vetted and our guides are professionally trained.' },
            { icon: 'award', title: 'Authentic Experiences', description: 'No tourist traps here. We offer genuine, immersive experiences that connect you with real Moroccan life.' },
            { icon: 'users', title: 'Personal Touch', description: 'Small groups, personalized attention, and flexibility to make your adventure exactly what you dream of.' },
          ],
        },
        teamSection: {
          title: 'Meet Our Team',
          subtitle: 'Local experts passionate about sharing the best of Morocco with you.',
          members: [
            { name: 'Ahmed', role: 'Founder & Lead Guide', bio: '20+ years guiding visitors through Morocco' },
            { name: 'Fatima', role: 'Customer Experience', bio: 'Ensuring every traveler has an amazing experience' },
            { name: 'Youssef', role: 'Adventure Specialist', bio: 'Desert expert and quad biking enthusiast' },
          ],
        },
        cta: {
          title: 'Ready to Explore Morocco?',
          subtitle: 'Let us create an unforgettable adventure tailored just for you.',
          primaryButtonText: 'Browse Activities',
          primaryButtonLink: '/activities',
          secondaryButtonText: 'Contact Us',
          secondaryButtonLink: '/contact',
        },
        seo: {
          metaTitle: 'About Atlas Mountain Visit | Authentic Morocco Experiences Since 2004',
          metaDescription: 'Meet the passionate Moroccan team behind Atlas Mountain Visit. 20+ years of experience creating unforgettable desert adventures, city tours, and authentic cultural experiences.',
        },
      },
    })
    console.log('  ✓ About Page (EN) seeded!')
  } catch (error: any) {
    console.error('  ✗ Error seeding About Page (EN):', error.message)
  }

  // About Page - French
  console.log('📄 Seeding About Page (French)...')
  try {
    await payload.updateGlobal({
      slug: 'about-page',
      locale: 'fr',
      data: {
        hero: {
          badge: 'Depuis 2004',
          title: 'Votre Porte vers le Maroc Authentique',
          description: 'Nous sommes une équipe de Marocains passionnés, dédiés à partager la magie de notre pays avec les voyageurs du monde entier. Des médinas animées au Sahara silencieux, nous créons des expériences inoubliables.',
        },
        stats: [
          { value: '20+', label: "Années d'Expérience", icon: 'clock' },
          { value: '5 000+', label: 'Voyageurs Satisfaits', icon: 'users' },
          { value: '4.9', label: 'Note Google', icon: 'star' },
          { value: '50+', label: 'Expériences Uniques', icon: 'mapPin' },
        ],
        story: {
          title: 'Notre Histoire',
          paragraphs: [
            { text: "Ce qui a commencé comme une simple passion pour partager la beauté du Maroc est devenu Atlas Mountain Visit - un nom de confiance dans les expériences marocaines authentiques. Fondé en 2004, nous aidons les voyageurs à découvrir le vrai Maroc depuis plus de deux décennies." },
            { text: "Nés et élevés à Marrakech, notre équipe connaît chaque recoin de ce pays magique. Des souks animés au Sahara silencieux, de l'Atlas enneigé aux rues bleues de Chefchaouen - nous avons tout exploré et avons hâte de partager ces aventures avec vous." },
            { text: "Nous croyons que le voyage devrait être plus que du tourisme. Il devrait s'agir de connexions, de compréhension et de moments qui restent avec vous pour toujours. C'est pourquoi nous nous concentrons sur les petits groupes, les expériences locales et l'attention personnalisée." },
          ],
          highlights: [
            { text: 'Guides locaux qui connaissent le Maroc intimement' },
            { text: 'Petits groupes pour une attention personnelle' },
            { text: 'Itinéraires flexibles adaptés à votre rythme' },
            { text: 'Expériences authentiques, pas de pièges à touristes' },
          ],
          badgeLabel: 'Années de souvenirs inoubliables',
        },
        valuesSection: {
          title: 'Ce Qui Nous Anime',
          subtitle: 'Nos valeurs guident tout ce que nous faisons, des expériences que nous créons à la façon dont nous traitons chaque invité.',
          values: [
            { icon: 'heart', title: 'Passion pour le Maroc', description: 'Nous sommes des Marocains locaux qui aiment partager notre culture, nos traditions et nos trésors cachés avec les voyageurs du monde entier.' },
            { icon: 'shield', title: 'Sécurité Avant Tout', description: 'Votre sécurité est notre priorité. Toutes nos activités sont soigneusement vérifiées et nos guides sont professionnellement formés.' },
            { icon: 'award', title: 'Expériences Authentiques', description: "Pas de pièges à touristes ici. Nous offrons des expériences genuines et immersives qui vous connectent à la vraie vie marocaine." },
            { icon: 'users', title: 'Touche Personnelle', description: "Petits groupes, attention personnalisée et flexibilité pour faire de votre aventure exactement ce dont vous rêvez." },
          ],
        },
        teamSection: {
          title: 'Rencontrez Notre Équipe',
          subtitle: 'Des experts locaux passionnés par le partage du meilleur du Maroc avec vous.',
          members: [
            { name: 'Ahmed', role: 'Fondateur & Guide Principal', bio: '20+ ans à guider les visiteurs à travers le Maroc' },
            { name: 'Fatima', role: 'Expérience Client', bio: "S'assurer que chaque voyageur a une expérience incroyable" },
            { name: 'Youssef', role: 'Spécialiste Aventure', bio: 'Expert du désert et passionné de quad' },
          ],
        },
        cta: {
          title: 'Prêt à Explorer le Maroc?',
          subtitle: 'Laissez-nous créer une aventure inoubliable sur mesure pour vous.',
          primaryButtonText: 'Voir les Activités',
          secondaryButtonText: 'Nous Contacter',
        },
        seo: {
          metaTitle: 'À Propos de Atlas Mountain Visit | Expériences Authentiques au Maroc Depuis 2004',
          metaDescription: "Découvrez l'équipe marocaine passionnée derrière Atlas Mountain Visit. 20+ ans d'expérience à créer des aventures inoubliables dans le désert, visites de villes et expériences culturelles authentiques.",
        },
      },
    })
    console.log('  ✓ About Page (FR) seeded!')
  } catch (error: any) {
    console.error('  ✗ Error seeding About Page (FR):', error.message)
  }

  // About Page - German
  console.log('📄 Seeding About Page (German)...')
  try {
    await payload.updateGlobal({
      slug: 'about-page',
      locale: 'de',
      data: {
        hero: {
          badge: 'Seit 2004',
          title: 'Ihr Tor zum Authentischen Marokko',
          description: 'Wir sind ein Team leidenschaftlicher marokkanischer Einheimischer, die sich der Aufgabe verschrieben haben, die Magie unseres Landes mit Reisenden aus aller Welt zu teilen. Von den geschäftigen Medinas bis zur stillen Sahara schaffen wir unvergessliche Erlebnisse.',
        },
        stats: [
          { value: '20+', label: 'Jahre Erfahrung', icon: 'clock' },
          { value: '5.000+', label: 'Zufriedene Reisende', icon: 'users' },
          { value: '4.9', label: 'Google Bewertung', icon: 'star' },
          { value: '50+', label: 'Einzigartige Erlebnisse', icon: 'mapPin' },
        ],
        story: {
          title: 'Unsere Geschichte',
          paragraphs: [
            { text: "Was als einfache Leidenschaft begann, die Schönheit Marokkos zu teilen, ist zu Atlas Mountain Visit geworden - ein vertrauenswürdiger Name für authentische marokkanische Erlebnisse. Gegründet im Jahr 2004, helfen wir Reisenden seit über zwei Jahrzehnten, das echte Marokko zu entdecken." },
            { text: "In Marrakesch geboren und aufgewachsen, kennt unser Team jeden Winkel dieses magischen Landes. Von den geschäftigen Souks zur stillen Sahara, vom schneebedeckten Atlas zu den blauen Straßen von Chefchaouen - wir haben alles erkundet und können es kaum erwarten, diese Abenteuer mit Ihnen zu teilen." },
            { text: "Wir glauben, dass Reisen mehr sein sollte als nur Sightseeing. Es sollte um Verbindungen, Verständnis und Momente gehen, die für immer bei Ihnen bleiben. Deshalb konzentrieren wir uns auf kleine Gruppen, lokale Erlebnisse und persönliche Betreuung." },
          ],
          highlights: [
            { text: 'Lokale Guides, die Marokko bestens kennen' },
            { text: 'Kleine Gruppen für persönliche Betreuung' },
            { text: 'Flexible Reiserouten nach Ihrem Tempo' },
            { text: 'Authentische Erlebnisse, keine Touristenfallen' },
          ],
          badgeLabel: 'Jahre unvergesslicher Erinnerungen',
        },
        valuesSection: {
          title: 'Was Uns Antreibt',
          subtitle: 'Unsere Werte leiten alles, was wir tun, von den Erlebnissen, die wir schaffen, bis hin zur Art, wie wir jeden Gast behandeln.',
          values: [
            { icon: 'heart', title: 'Leidenschaft für Marokko', description: 'Wir sind marokkanische Einheimische, die es lieben, unsere Kultur, Traditionen und versteckten Schätze mit Reisenden aus aller Welt zu teilen.' },
            { icon: 'shield', title: 'Sicherheit Zuerst', description: 'Ihre Sicherheit hat Priorität. Alle unsere Aktivitäten werden sorgfältig geprüft und unsere Guides sind professionell ausgebildet.' },
            { icon: 'award', title: 'Authentische Erlebnisse', description: 'Keine Touristenfallen hier. Wir bieten echte, immersive Erlebnisse, die Sie mit dem echten marokkanischen Leben verbinden.' },
            { icon: 'users', title: 'Persönliche Note', description: 'Kleine Gruppen, persönliche Betreuung und Flexibilität, um Ihr Abenteuer genau so zu gestalten, wie Sie es sich erträumen.' },
          ],
        },
        teamSection: {
          title: 'Lernen Sie Unser Team Kennen',
          subtitle: 'Lokale Experten, die leidenschaftlich das Beste Marokkos mit Ihnen teilen.',
          members: [
            { name: 'Ahmed', role: 'Gründer & Hauptguide', bio: '20+ Jahre Erfahrung als Reiseführer durch Marokko' },
            { name: 'Fatima', role: 'Kundenerlebnis', bio: 'Sorgt dafür, dass jeder Reisende ein unvergessliches Erlebnis hat' },
            { name: 'Youssef', role: 'Abenteuer-Spezialist', bio: 'Wüstenexperte und Quad-Enthusiast' },
          ],
        },
        cta: {
          title: 'Bereit, Marokko zu Erkunden?',
          subtitle: 'Lassen Sie uns ein unvergessliches Abenteuer speziell für Sie gestalten.',
          primaryButtonText: 'Aktivitäten Ansehen',
          secondaryButtonText: 'Kontaktieren Sie Uns',
        },
        seo: {
          metaTitle: 'Über Atlas Mountain Visit | Authentische Marokko-Erlebnisse Seit 2004',
          metaDescription: 'Lernen Sie das leidenschaftliche marokkanische Team hinter Atlas Mountain Visit kennen. 20+ Jahre Erfahrung in der Gestaltung unvergesslicher Wüstenabenteuer, Stadttouren und authentischer kultureller Erlebnisse.',
        },
      },
    })
    console.log('  ✓ About Page (DE) seeded!')
  } catch (error: any) {
    console.error('  ✗ Error seeding About Page (DE):', error.message)
  }

  // Contact Page - English
  console.log('\n📄 Seeding Contact Page (English)...')
  try {
    await payload.updateGlobal({
      slug: 'contact-page',
      locale: 'en',
      data: {
        header: {
          title: 'Get in Touch',
          description: "Have questions about our tours or want to create a custom adventure? We'd love to hear from you. Our team typically responds within 2 hours.",
        },
        contactInfo: {
          address: {
            line1: 'Marrakech, Morocco',
            line2: 'Near Jemaa el-Fnaa Square',
          },
          phone: {
            number: '+212 777 926 596',
            display: '+212 777 926 596',
          },
          email: {
            address: 'info@atlasmountainsvisit.com',
            responseTime: 'We reply within 2 hours',
          },
          whatsapp: {
            number: '+212 777 926 596',
            display: '+212 777 926 596',
          },
        },
        formSettings: {
          title: 'Send Us a Message',
          submitButtonText: 'Send Message',
          successMessage: "Thank you for reaching out. We'll get back to you within 2 hours.",
          subjects: [
            { value: 'general', label: 'General Inquiry' },
            { value: 'booking', label: 'Booking Question' },
            { value: 'custom', label: 'Custom Tour Request' },
            { value: 'support', label: 'Support' },
          ],
        },
        faq: {
          title: 'Frequently Asked Questions',
          questions: [
            { question: 'How do I book a tour?', answer: "You can book directly through our website by selecting your preferred activity and date. Alternatively, contact us via WhatsApp or email for personalized assistance." },
            { question: 'What is your cancellation policy?', answer: 'We offer free cancellation up to 24 hours before your scheduled activity. For cancellations within 24 hours, a 50% fee applies.' },
            { question: 'Do you offer private tours?', answer: 'Yes! All our tours can be customized as private experiences. Contact us to discuss your preferences and group size.' },
            { question: 'What should I bring on a desert tour?', answer: 'We recommend sunscreen, sunglasses, comfortable clothing, a warm layer for evenings, and a camera. We provide all necessary equipment for activities.' },
          ],
        },
        map: {
          title: 'Find Us in Marrakech',
          subtitle: "Located in the heart of the Red City, we're easy to find.",
          embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3397.0876089817396!2d-7.989755684877!3d31.62556988133001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdafee8d96179e51%3A0x5950b6534f87adb8!2sJemaa%20el-Fnaa!5e0!3m2!1sen!2sma!4v1',
        },
        seo: {
          metaTitle: 'Contact Atlas Mountain Visit | Get in Touch for Morocco Adventures',
          metaDescription: 'Contact Atlas Mountain Visit for desert tours, city excursions, and custom Morocco adventures. WhatsApp, email, or call us. We respond within 2 hours.',
        },
      },
    })
    console.log('  ✓ Contact Page (EN) seeded!')
  } catch (error: any) {
    console.error('  ✗ Error seeding Contact Page (EN):', error.message)
  }

  // Contact Page - French
  console.log('📄 Seeding Contact Page (French)...')
  try {
    await payload.updateGlobal({
      slug: 'contact-page',
      locale: 'fr',
      data: {
        header: {
          title: 'Contactez-Nous',
          description: "Vous avez des questions sur nos circuits ou souhaitez créer une aventure sur mesure? Nous serions ravis de vous entendre. Notre équipe répond généralement dans les 2 heures.",
        },
        contactInfo: {
          address: {
            line1: 'Marrakech, Maroc',
            line2: 'Près de la Place Jemaa el-Fnaa',
          },
          email: {
            responseTime: 'Nous répondons dans les 2 heures',
          },
        },
        formSettings: {
          title: 'Envoyez-Nous un Message',
          submitButtonText: 'Envoyer le Message',
          successMessage: "Merci de nous avoir contactés. Nous vous répondrons dans les 2 heures.",
          subjects: [
            { value: 'general', label: 'Demande Générale' },
            { value: 'booking', label: 'Question de Réservation' },
            { value: 'custom', label: 'Demande de Circuit Sur Mesure' },
            { value: 'support', label: 'Support' },
          ],
        },
        faq: {
          title: 'Questions Fréquemment Posées',
          questions: [
            { question: 'Comment réserver un circuit?', answer: "Vous pouvez réserver directement via notre site web en sélectionnant votre activité et date préférées. Vous pouvez également nous contacter via WhatsApp ou email pour une assistance personnalisée." },
            { question: "Quelle est votre politique d'annulation?", answer: "Nous offrons une annulation gratuite jusqu'à 24 heures avant votre activité prévue. Pour les annulations dans les 24 heures, des frais de 50% s'appliquent." },
            { question: 'Proposez-vous des circuits privés?', answer: 'Oui! Tous nos circuits peuvent être personnalisés en expériences privées. Contactez-nous pour discuter de vos préférences et de la taille de votre groupe.' },
            { question: "Que dois-je apporter pour un circuit dans le désert?", answer: "Nous recommandons de la crème solaire, des lunettes de soleil, des vêtements confortables, une couche chaude pour les soirées et un appareil photo. Nous fournissons tout l'équipement nécessaire pour les activités." },
          ],
        },
        map: {
          title: 'Trouvez-Nous à Marrakech',
          subtitle: "Situés au cœur de la Ville Rouge, nous sommes faciles à trouver.",
        },
        seo: {
          metaTitle: 'Contactez Atlas Mountain Visit | Pour Vos Aventures au Maroc',
          metaDescription: 'Contactez Atlas Mountain Visit pour des circuits dans le désert, excursions en ville et aventures sur mesure au Maroc. WhatsApp, email ou appelez-nous. Nous répondons dans les 2 heures.',
        },
      },
    })
    console.log('  ✓ Contact Page (FR) seeded!')
  } catch (error: any) {
    console.error('  ✗ Error seeding Contact Page (FR):', error.message)
  }

  // Contact Page - German
  console.log('📄 Seeding Contact Page (German)...')
  try {
    await payload.updateGlobal({
      slug: 'contact-page',
      locale: 'de',
      data: {
        header: {
          title: 'Kontaktieren Sie Uns',
          description: "Haben Sie Fragen zu unseren Touren oder möchten Sie ein individuelles Abenteuer erstellen? Wir freuen uns von Ihnen zu hören. Unser Team antwortet normalerweise innerhalb von 2 Stunden.",
        },
        contactInfo: {
          address: {
            line1: 'Marrakesch, Marokko',
            line2: 'In der Nähe des Jemaa el-Fnaa Platzes',
          },
          email: {
            responseTime: 'Wir antworten innerhalb von 2 Stunden',
          },
        },
        formSettings: {
          title: 'Senden Sie Uns eine Nachricht',
          submitButtonText: 'Nachricht Senden',
          successMessage: "Vielen Dank für Ihre Nachricht. Wir melden uns innerhalb von 2 Stunden bei Ihnen.",
          subjects: [
            { value: 'general', label: 'Allgemeine Anfrage' },
            { value: 'booking', label: 'Buchungsfrage' },
            { value: 'custom', label: 'Individuelle Tour-Anfrage' },
            { value: 'support', label: 'Support' },
          ],
        },
        faq: {
          title: 'Häufig Gestellte Fragen',
          questions: [
            { question: 'Wie buche ich eine Tour?', answer: "Sie können direkt über unsere Website buchen, indem Sie Ihre bevorzugte Aktivität und Datum auswählen. Alternativ kontaktieren Sie uns über WhatsApp oder E-Mail für persönliche Unterstützung." },
            { question: 'Was ist Ihre Stornierungsrichtlinie?', answer: 'Wir bieten kostenlose Stornierung bis zu 24 Stunden vor Ihrer geplanten Aktivität. Bei Stornierungen innerhalb von 24 Stunden fallen 50% Gebühren an.' },
            { question: 'Bieten Sie private Touren an?', answer: 'Ja! Alle unsere Touren können als private Erlebnisse angepasst werden. Kontaktieren Sie uns, um Ihre Wünsche und Gruppengröße zu besprechen.' },
            { question: 'Was sollte ich zu einer Wüstentour mitbringen?', answer: 'Wir empfehlen Sonnencreme, Sonnenbrille, bequeme Kleidung, eine warme Schicht für den Abend und eine Kamera. Wir stellen alle notwendigen Ausrüstungen für Aktivitäten zur Verfügung.' },
          ],
        },
        map: {
          title: 'Finden Sie Uns in Marrakesch',
          subtitle: "Im Herzen der Roten Stadt gelegen, sind wir leicht zu finden.",
        },
        seo: {
          metaTitle: 'Kontakt Atlas Mountain Visit | Für Ihre Marokko-Abenteuer',
          metaDescription: 'Kontaktieren Sie Atlas Mountain Visit für Wüstentouren, Stadtausflüge und individuelle Marokko-Abenteuer. WhatsApp, E-Mail oder rufen Sie uns an. Wir antworten innerhalb von 2 Stunden.',
        },
      },
    })
    console.log('  ✓ Contact Page (DE) seeded!')
  } catch (error: any) {
    console.error('  ✗ Error seeding Contact Page (DE):', error.message)
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n✅ Seed completed!')
  console.log(`   Categories: ${Object.keys(createdCategories).length}`)
  console.log(`   Locations: ${Object.keys(createdLocations).length}`)
  console.log(`   Media assets: ${Object.keys(mediaAssets).length}`)
  console.log(`   Activities: ${Object.keys(createdActivities).length}`)
  console.log(`   Pages: About Page, Contact Page`)

  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
