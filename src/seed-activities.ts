// @ts-nocheck
import { getPayload } from 'payload'
import config from './payload.config'
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

// Placeholder image URL (you'll change this later)
const PLACEHOLDER_IMAGE_URL = "https://ik.imagekit.io/fentr/Anwar%20-%20Best%20Marrakech%20Activity/Agafay%20Desert%20Sunset.jpg"

// Helper to download image and create media
async function createMediaFromUrl(
  payload: any,
  url: string,
  alt: string,
): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.log(`  Failed to fetch image: ${url}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const urlPath = new URL(url).pathname
    const filename = decodeURIComponent(path.basename(urlPath))
    const extension = path.extname(filename) || '.jpg'
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '-')

    const tempDir = os.tmpdir()
    const tempPath = path.join(tempDir, `seed-${Date.now()}-${safeName}`)
    fs.writeFileSync(tempPath, buffer)

    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    }
    const mimeType = mimeTypes[extension.toLowerCase()] || 'image/jpeg'

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

    try {
      fs.unlinkSync(tempPath)
    } catch {}

    return media.id
  } catch (error: any) {
    console.log(`  Error creating media from ${url}: ${error.message}`)
    return null
  }
}

async function seedActivities() {
  console.log('🎯 Starting Activities Seed...\n')

  const payload = await getPayload({ config })

  // ============================================
  // STEP 1: Ensure Categories Exist
  // ============================================
  console.log('📁 Checking/Creating categories...')

  const categoriesData = [
    { slug: 'desert-adventures', type: 'activity', icon: 'Sun', displayOrder: 1, name: { en: 'Desert Adventures', fr: 'Aventures dans le Désert', de: 'Wüstenabenteuer' } },
    { slug: 'mountain-excursions', type: 'activity', icon: 'Mountain', displayOrder: 2, name: { en: 'Mountain Excursions', fr: 'Excursions en Montagne', de: 'Bergausflüge' } },
    { slug: 'nature-wildlife', type: 'activity', icon: 'Trees', displayOrder: 3, name: { en: 'Nature & Wildlife', fr: 'Nature et Faune', de: 'Natur & Tierwelt' } },
    { slug: 'coastal-adventures', type: 'activity', icon: 'Waves', displayOrder: 4, name: { en: 'Coastal Adventures', fr: 'Aventures Côtières', de: 'Küstenabenteuer' } },
    { slug: 'cultural-heritage', type: 'activity', icon: 'Landmark', displayOrder: 5, name: { en: 'Cultural Heritage', fr: 'Patrimoine Culturel', de: 'Kulturerbe' } },
    { slug: 'adventure-sports', type: 'activity', icon: 'Bike', displayOrder: 6, name: { en: 'Adventure Sports', fr: "Sports d'Aventure", de: 'Abenteuersport' } },
  ]

  const createdCategories: Record<string, string> = {}

  for (const category of categoriesData) {
    try {
      const existing = await payload.find({
        collection: 'categories',
        where: { slug: { equals: category.slug } },
      })

      if (existing.docs[0]) {
        createdCategories[category.slug] = existing.docs[0].id
        console.log(`  ✓ Category exists: ${category.name.en}`)
      } else {
        const created = await payload.create({
          collection: 'categories',
          locale: 'en',
          data: {
            slug: category.slug,
            type: category.type as 'activity',
            icon: category.icon,
            displayOrder: category.displayOrder,
            name: category.name.en,
          },
        })
        createdCategories[category.slug] = created.id

        await payload.update({ collection: 'categories', id: created.id, locale: 'fr', data: { name: category.name.fr } })
        await payload.update({ collection: 'categories', id: created.id, locale: 'de', data: { name: category.name.de } })

        console.log(`  ✓ Created category: ${category.name.en}`)
      }
    } catch (error: any) {
      console.error(`  ✗ Error with category ${category.name.en}:`, error.message)
    }
  }

  // ============================================
  // STEP 2: Ensure Locations Exist
  // ============================================
  console.log('\n📍 Checking/Creating locations...')

  const locationsData = [
    { slug: 'palmeraie', type: ['pickup', 'dropoff', 'activity'], city: 'marrakech', name: { en: 'La Palmeraie', fr: 'La Palmeraie', de: 'La Palmeraie' } },
    { slug: 'agafay-desert', type: ['activity'], city: 'marrakech', name: { en: 'Agafay Desert', fr: "Désert d'Agafay", de: 'Agafay-Wüste' } },
    { slug: 'ouzoud-waterfalls', type: ['activity'], city: 'marrakech', name: { en: 'Ouzoud Falls', fr: "Cascades d'Ouzoud", de: 'Ouzoud-Wasserfälle' } },
    { slug: 'ourika-valley', type: ['activity'], city: 'marrakech', name: { en: 'Ourika Valley', fr: "Vallée de l'Ourika", de: 'Ourika-Tal' } },
    { slug: 'essaouira', type: ['dropoff', 'activity'], city: 'essaouira', name: { en: 'Essaouira', fr: 'Essaouira', de: 'Essaouira' } },
    { slug: 'ouarzazate', type: ['dropoff', 'activity'], city: 'ouarzazate', name: { en: 'Ouarzazate', fr: 'Ouarzazate', de: 'Ouarzazate' } },
    { slug: 'ait-benhaddou', type: ['activity'], city: 'ouarzazate', name: { en: 'Ait Benhaddou', fr: 'Aït Benhaddou', de: 'Ait Benhaddou' } },
    { slug: 'zagora', type: ['activity'], city: 'zagora', name: { en: 'Zagora', fr: 'Zagora', de: 'Zagora' } },
    { slug: 'merzouga', type: ['activity'], city: 'merzouga', name: { en: 'Merzouga (Erg Chebbi)', fr: 'Merzouga (Erg Chebbi)', de: 'Merzouga (Erg Chebbi)' } },
    { slug: 'imlil', type: ['activity'], city: 'marrakech', name: { en: 'Imlil', fr: 'Imlil', de: 'Imlil' } },
    { slug: 'atlas-foothills', type: ['activity'], city: 'marrakech', name: { en: 'Atlas Foothills', fr: "Contreforts de l'Atlas", de: 'Atlas-Vorgebirge' } },
  ]

  const createdLocations: Record<string, string> = {}

  for (const location of locationsData) {
    try {
      const existing = await payload.find({
        collection: 'locations',
        where: { slug: { equals: location.slug } },
      })

      if (existing.docs[0]) {
        createdLocations[location.slug] = existing.docs[0].id
        console.log(`  ✓ Location exists: ${location.name.en}`)
      } else {
        const created = await payload.create({
          collection: 'locations',
          locale: 'en',
          data: {
            slug: location.slug,
            type: location.type as any,
            city: location.city as any,
            isActive: true,
            name: location.name.en,
          },
        })
        createdLocations[location.slug] = created.id

        await payload.update({ collection: 'locations', id: created.id, locale: 'fr', data: { name: location.name.fr } })
        await payload.update({ collection: 'locations', id: created.id, locale: 'de', data: { name: location.name.de } })

        console.log(`  ✓ Created location: ${location.name.en}`)
      }
    } catch (error: any) {
      console.error(`  ✗ Error with location ${location.name.en}:`, error.message)
    }
  }

  // ============================================
  // STEP 3: Upload Placeholder Image
  // ============================================
  console.log('\n🖼️  Uploading placeholder image...')
  const placeholderMediaId = await createMediaFromUrl(payload, PLACEHOLDER_IMAGE_URL, 'Activity Placeholder')

  if (!placeholderMediaId) {
    console.error('Failed to upload placeholder image. Exiting.')
    process.exit(1)
  }
  console.log('  ✓ Placeholder image uploaded!')

  // ============================================
  // STEP 4: Create Activities
  // ============================================
  console.log('\n🎯 Creating activities...')

  const activitiesData = [
    // ========== DESERT ADVENTURES ==========
    {
      slug: 'agafay-desert-sunset-dinner',
      categorySlug: 'desert-adventures',
      locationSlug: 'agafay-desert',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 35, childPrice: 20, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 20 },
      duration: { en: 'Half Day', fr: 'Demi-journée', de: 'Halbtag' },
      durationMinutes: 300,
      displayOrder: 1,
      isFeatured: true,
      title: {
        en: 'Agafay Desert Sunset & Dinner Experience',
        fr: "Coucher de Soleil et Dîner dans le Désert d'Agafay",
        de: 'Agafay Wüste Sonnenuntergang & Abendessen',
      },
      shortDescription: {
        en: 'Watch the sun set over the stunning Agafay Desert while enjoying a traditional Moroccan dinner under the stars.',
        fr: "Admirez le coucher de soleil sur le magnifique désert d'Agafay tout en savourant un dîner marocain traditionnel sous les étoiles.",
        de: 'Beobachten Sie den Sonnenuntergang über der atemberaubenden Agafay-Wüste bei einem traditionellen marokkanischen Abendessen unter den Sternen.',
      },
      highlights: {
        en: ['Scenic drive through Moroccan countryside', 'Camel ride at sunset', 'Traditional Berber tent experience', 'Authentic Moroccan dinner with live music', 'Stargazing in the desert'],
        fr: ['Trajet panoramique à travers la campagne marocaine', 'Balade à dos de chameau au coucher du soleil', 'Expérience dans une tente berbère traditionnelle', 'Dîner marocain authentique avec musique live', 'Observation des étoiles dans le désert'],
        de: ['Malerische Fahrt durch die marokkanische Landschaft', 'Kamelritt bei Sonnenuntergang', 'Traditionelles Berberzelt-Erlebnis', 'Authentisches marokkanisches Abendessen mit Live-Musik', 'Sternenbeobachtung in der Wüste'],
      },
      included: {
        en: ['Hotel pickup & drop-off', 'Camel ride', 'Traditional dinner', 'Mint tea & pastries', 'Live entertainment', 'Blankets for stargazing'],
        fr: ['Transfert hôtel aller-retour', 'Balade à dos de chameau', 'Dîner traditionnel', 'Thé à la menthe et pâtisseries', 'Animation live', 'Couvertures pour observation des étoiles'],
        de: ['Hotel-Abholung & Rückfahrt', 'Kamelritt', 'Traditionelles Abendessen', 'Minztee & Gebäck', 'Live-Unterhaltung', 'Decken für Sternenbeobachtung'],
      },
    },
    {
      slug: 'agafay-luxury-day-pass',
      categorySlug: 'desert-adventures',
      locationSlug: 'agafay-desert',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 55, childPrice: 35, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 15 },
      duration: { en: 'Full Day', fr: 'Journée complète', de: 'Ganzer Tag' },
      durationMinutes: 480,
      displayOrder: 2,
      isFeatured: true,
      title: {
        en: 'Agafay Desert Luxury Day Pass with Pool',
        fr: "Pass Journée Luxe Désert d'Agafay avec Piscine",
        de: 'Agafay Wüste Luxus-Tagespass mit Pool',
      },
      shortDescription: {
        en: 'Escape to a luxury desert camp with infinity pool, gourmet lunch, and stunning Atlas Mountain views.',
        fr: "Évadez-vous dans un camp de luxe dans le désert avec piscine à débordement, déjeuner gastronomique et vues imprenables sur l'Atlas.",
        de: 'Entfliehen Sie in ein Luxus-Wüstencamp mit Infinity-Pool, Gourmet-Mittagessen und atemberaubendem Blick auf das Atlasgebirge.',
      },
      highlights: {
        en: ['Access to luxury desert camp', 'Infinity pool with Atlas views', 'Gourmet Moroccan lunch', 'Lounge areas & sun beds', 'Optional spa treatments', 'Camel ride included'],
        fr: ['Accès au camp de luxe', 'Piscine à débordement avec vue sur l\'Atlas', 'Déjeuner marocain gastronomique', 'Espaces lounge & transats', 'Soins spa optionnels', 'Balade à chameau incluse'],
        de: ['Zugang zum Luxus-Wüstencamp', 'Infinity-Pool mit Atlas-Blick', 'Gourmet marokkanisches Mittagessen', 'Lounge-Bereiche & Sonnenliegen', 'Optionale Spa-Behandlungen', 'Kamelritt inklusive'],
      },
      included: {
        en: ['Round-trip transfer', 'Full day camp access', 'Gourmet lunch', 'Pool & lounge access', 'Towels provided', 'Camel ride', 'Welcome drink'],
        fr: ['Transfert aller-retour', 'Accès camp journée complète', 'Déjeuner gastronomique', 'Accès piscine & lounge', 'Serviettes fournies', 'Balade à chameau', 'Boisson de bienvenue'],
        de: ['Hin- und Rücktransfer', 'Ganztägiger Camp-Zugang', 'Gourmet-Mittagessen', 'Pool- & Lounge-Zugang', 'Handtücher bereitgestellt', 'Kamelritt', 'Begrüßungsgetränk'],
      },
    },
    {
      slug: 'zagora-desert-2-day',
      categorySlug: 'desert-adventures',
      locationSlug: 'zagora',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 75, childPrice: 50, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 15 },
      duration: { en: '2 Days', fr: '2 Jours', de: '2 Tage' },
      durationMinutes: 2880,
      displayOrder: 3,
      isFeatured: true,
      title: {
        en: 'Zagora Desert 2-Day Sahara Adventure',
        fr: 'Aventure Sahara 2 Jours à Zagora',
        de: 'Zagora Wüste 2-Tage Sahara-Abenteuer',
      },
      shortDescription: {
        en: 'Journey to the gateway of the Sahara with camel trekking, overnight camping under stars, and UNESCO World Heritage exploration.',
        fr: 'Voyagez vers la porte du Sahara avec randonnée à chameau, camping sous les étoiles et exploration du patrimoine UNESCO.',
        de: 'Reisen Sie zum Tor der Sahara mit Kameltrekking, Übernachtung unter Sternen und UNESCO-Weltkulturerbe-Erkundung.',
      },
      highlights: {
        en: ['Cross High Atlas via Tizi n\'Tichka pass', 'Visit UNESCO Ait Ben Haddou', 'Draa Valley palm groves', 'Sunset camel trek', 'Night in Berber desert camp', 'Traditional dinner & breakfast'],
        fr: ['Traversée du Haut Atlas via Tizi n\'Tichka', 'Visite UNESCO Aït Ben Haddou', 'Palmeraies de la Vallée du Drâa', 'Trek à chameau au coucher du soleil', 'Nuit en camp berbère', 'Dîner & petit-déjeuner traditionnels'],
        de: ['Überquerung Hoher Atlas via Tizi n\'Tichka', 'UNESCO Ait Ben Haddou besuchen', 'Draa-Tal Palmenhaine', 'Kameltreck bei Sonnenuntergang', 'Nacht im Berber-Wüstencamp', 'Traditionelles Abendessen & Frühstück'],
      },
      included: {
        en: ['Transport in AC vehicle', 'English/French driver-guide', '1 night desert camp', 'Dinner & breakfast', 'Camel trek', 'All tolls & fuel'],
        fr: ['Transport en véhicule climatisé', 'Chauffeur-guide anglais/français', '1 nuit camp désert', 'Dîner & petit-déjeuner', 'Trek à chameau', 'Tous péages & carburant'],
        de: ['Transport im klimatisierten Fahrzeug', 'Englisch/Französisch sprechender Fahrer-Guide', '1 Nacht Wüstencamp', 'Abendessen & Frühstück', 'Kameltreck', 'Alle Mautgebühren & Treibstoff'],
      },
    },
    {
      slug: 'merzouga-3-day-expedition',
      categorySlug: 'desert-adventures',
      locationSlug: 'merzouga',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 120, childPrice: 85, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 15 },
      duration: { en: '3 Days', fr: '3 Jours', de: '3 Tage' },
      durationMinutes: 4320,
      displayOrder: 4,
      isFeatured: true,
      title: {
        en: 'Merzouga 3-Day Sahara Expedition',
        fr: 'Expédition Sahara 3 Jours à Merzouga',
        de: 'Merzouga 3-Tage Sahara-Expedition',
      },
      shortDescription: {
        en: 'The ultimate Morocco adventure: High Atlas, dramatic gorges, UNESCO kasbahs, and magical nights in the Erg Chebbi dunes.',
        fr: "L'aventure ultime au Maroc: Haut Atlas, gorges spectaculaires, kasbahs UNESCO et nuits magiques dans les dunes de l'Erg Chebbi.",
        de: 'Das ultimative Marokko-Abenteuer: Hoher Atlas, dramatische Schluchten, UNESCO-Kasbahs und magische Nächte in den Erg Chebbi Dünen.',
      },
      highlights: {
        en: ['Tizi n\'Tichka pass panoramas', 'Ait Ben Haddou UNESCO site', 'Dades & Todgha Gorges', 'Erfoud fossil discovery', 'Erg Chebbi camel trek', '2 nights accommodation', 'Sahara sunrise experience'],
        fr: ['Panoramas du col Tizi n\'Tichka', 'Site UNESCO Aït Ben Haddou', 'Gorges du Dadès & Todgha', 'Découverte fossiles Erfoud', 'Trek chameau Erg Chebbi', '2 nuits hébergement', 'Lever de soleil saharien'],
        de: ['Tizi n\'Tichka Pass Panoramen', 'UNESCO-Stätte Ait Ben Haddou', 'Dades & Todgha Schluchten', 'Erfoud Fossilienentdeckung', 'Erg Chebbi Kameltreck', '2 Übernachtungen', 'Sahara-Sonnenaufgang'],
      },
      included: {
        en: ['All transport', 'Professional guide', '2 nights (1 guesthouse + 1 desert camp)', '2 dinners + 2 breakfasts', 'Camel trek', 'Bottled water daily'],
        fr: ['Tout transport', 'Guide professionnel', '2 nuits (1 maison d\'hôtes + 1 camp)', '2 dîners + 2 petits-déjeuners', 'Trek à chameau', 'Eau en bouteille quotidienne'],
        de: ['Alle Transporte', 'Professioneller Guide', '2 Nächte (1 Gästehaus + 1 Wüstencamp)', '2 Abendessen + 2 Frühstücke', 'Kameltreck', 'Täglich Wasser'],
      },
    },

    // ========== MOUNTAIN EXCURSIONS ==========
    {
      slug: 'ourika-valley-day-trip',
      categorySlug: 'mountain-excursions',
      locationSlug: 'ourika-valley',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 20, childPrice: 12, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 15 },
      duration: { en: 'Full Day', fr: 'Journée complète', de: 'Ganzer Tag' },
      durationMinutes: 540,
      displayOrder: 5,
      isFeatured: true,
      title: {
        en: 'Ourika Valley Day Trip: Atlas Mountains & Berber Villages',
        fr: "Excursion Vallée de l'Ourika: Atlas et Villages Berbères",
        de: 'Ourika-Tal Tagesausflug: Atlasgebirge & Berberdörfer',
      },
      shortDescription: {
        en: 'Discover traditional Berber villages, hike to mountain waterfalls, and experience authentic Moroccan hospitality just an hour from Marrakech.',
        fr: 'Découvrez des villages berbères traditionnels, randonnez vers des cascades et vivez l\'hospitalité marocaine authentique à une heure de Marrakech.',
        de: 'Entdecken Sie traditionelle Berberdörfer, wandern Sie zu Bergwasserfällen und erleben Sie authentische marokkanische Gastfreundschaft nur eine Stunde von Marrakesch.',
      },
      highlights: {
        en: ['Scenic Atlas Mountain drive', 'Visit authentic Berber villages', 'Hike to Setti Fatma waterfalls', 'Mint tea in a Berber home', 'Local souk exploration', 'River-side lunch option'],
        fr: ['Route panoramique Atlas', 'Villages berbères authentiques', 'Randonnée cascades Setti Fatma', 'Thé à la menthe chez les Berbères', 'Exploration du souk local', 'Déjeuner optionnel au bord de la rivière'],
        de: ['Malerische Atlas-Fahrt', 'Authentische Berberdörfer besuchen', 'Wanderung zu Setti Fatma Wasserfällen', 'Minztee im Berberhaus', 'Lokaler Souk-Besuch', 'Mittagessen am Fluss optional'],
      },
      included: {
        en: ['Hotel pickup & drop-off', 'AC vehicle', 'English/French driver', 'Fuel & tolls', 'Bottled water', 'WiFi in vehicle'],
        fr: ['Transfert hôtel', 'Véhicule climatisé', 'Chauffeur anglais/français', 'Carburant & péages', 'Eau en bouteille', 'WiFi dans véhicule'],
        de: ['Hotel-Transfer', 'Klimatisiertes Fahrzeug', 'Englisch/Französisch Fahrer', 'Treibstoff & Maut', 'Wasser', 'WLAN im Fahrzeug'],
      },
    },
    {
      slug: 'imlil-three-valleys',
      categorySlug: 'mountain-excursions',
      locationSlug: 'imlil',
      pricingType: 'fixed',
      privatePricing: { basePrice: 45, minGuests: 1, maxGuests: 7, additionalGuestPrice: 10 },
      duration: { en: 'Full Day', fr: 'Journée complète', de: 'Ganzer Tag' },
      durationMinutes: 480,
      displayOrder: 6,
      isFeatured: false,
      title: {
        en: 'Private Imlil & Three Valleys Day Trip',
        fr: 'Excursion Privée Imlil et Trois Vallées',
        de: 'Private Imlil & Drei Täler Tagestour',
      },
      shortDescription: {
        en: 'Your private escape to the High Atlas. Explore three stunning valleys, visit Berber villages, and discover the gateway to Mount Toubkal.',
        fr: 'Votre escapade privée dans le Haut Atlas. Explorez trois vallées magnifiques, visitez des villages berbères et découvrez la porte du Mont Toubkal.',
        de: 'Ihre private Flucht in den Hohen Atlas. Erkunden Sie drei atemberaubende Täler, besuchen Sie Berberdörfer und entdecken Sie das Tor zum Mount Toubkal.',
      },
      highlights: {
        en: ['Private vehicle & driver', 'Asni, Ouirgane & Imlil valleys', 'Imlil village at 1,740m', 'Berber home visit', 'Atlas peak views', 'Kasbah du Toubkal optional lunch'],
        fr: ['Véhicule & chauffeur privés', 'Vallées Asni, Ouirgane & Imlil', 'Village Imlil à 1 740m', 'Visite maison berbère', 'Vues sur les sommets de l\'Atlas', 'Déjeuner optionnel Kasbah du Toubkal'],
        de: ['Privates Fahrzeug & Fahrer', 'Asni, Ouirgane & Imlil Täler', 'Imlil Dorf auf 1.740m', 'Berberhaus-Besuch', 'Atlas-Gipfel-Ausblicke', 'Optionales Mittagessen Kasbah du Toubkal'],
      },
      included: {
        en: ['Private AC vehicle', 'English/French driver', 'Flexible itinerary', 'Hotel pickup/drop-off', 'Bottled water', 'WiFi'],
        fr: ['Véhicule privé climatisé', 'Chauffeur anglais/français', 'Itinéraire flexible', 'Transfert hôtel', 'Eau en bouteille', 'WiFi'],
        de: ['Privates klimatisiertes Fahrzeug', 'Englisch/Französisch Fahrer', 'Flexibler Ablauf', 'Hotel-Transfer', 'Wasser', 'WLAN'],
      },
    },
    {
      slug: 'atlas-mountains-berber-experience',
      categorySlug: 'mountain-excursions',
      locationSlug: 'atlas-foothills',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 28, childPrice: 18, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 12 },
      duration: { en: 'Full Day', fr: 'Journée complète', de: 'Ganzer Tag' },
      durationMinutes: 540,
      displayOrder: 7,
      isFeatured: false,
      title: {
        en: 'Atlas Mountains Berber Experience',
        fr: 'Expérience Berbère dans l\'Atlas',
        de: 'Atlasgebirge Berber-Erlebnis',
      },
      shortDescription: {
        en: 'Immerse yourself in authentic Berber culture with village visits, traditional cooking class, and stunning mountain landscapes.',
        fr: 'Plongez dans la culture berbère authentique avec visites de villages, cours de cuisine traditionnelle et paysages montagneux.',
        de: 'Tauchen Sie ein in die authentische Berberkultur mit Dorfbesuchen, traditionellem Kochkurs und atemberaubenden Berglandschaften.',
      },
      highlights: {
        en: ['Traditional Berber village visit', 'Cooking class with local family', 'Tagine preparation', 'Mountain hike', 'Tea ceremony', 'Panoramic Atlas views'],
        fr: ['Visite village berbère traditionnel', 'Cours de cuisine avec famille locale', 'Préparation de tajine', 'Randonnée en montagne', 'Cérémonie du thé', 'Vues panoramiques Atlas'],
        de: ['Traditionelles Berberdorf besuchen', 'Kochkurs bei lokaler Familie', 'Tajine-Zubereitung', 'Bergwanderung', 'Tee-Zeremonie', 'Panoramablick Atlas'],
      },
      included: {
        en: ['Hotel transfer', 'Cooking class', 'Lunch (what you cook!)', 'English/French guide', 'All ingredients', 'Recipe booklet'],
        fr: ['Transfert hôtel', 'Cours de cuisine', 'Déjeuner (ce que vous cuisinez!)', 'Guide anglais/français', 'Tous ingrédients', 'Livret de recettes'],
        de: ['Hotel-Transfer', 'Kochkurs', 'Mittagessen (was Sie kochen!)', 'Englisch/Französisch Guide', 'Alle Zutaten', 'Rezeptbuch'],
      },
    },

    // ========== NATURE & WILDLIFE ==========
    {
      slug: 'ouzoud-waterfalls-day-trip',
      categorySlug: 'nature-wildlife',
      locationSlug: 'ouzoud-waterfalls',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 25, childPrice: 15, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 15 },
      duration: { en: 'Full Day', fr: 'Journée complète', de: 'Ganzer Tag' },
      durationMinutes: 600,
      displayOrder: 8,
      isFeatured: true,
      title: {
        en: "Ouzoud Waterfalls Day Trip: Morocco's Most Spectacular Falls",
        fr: "Excursion Cascades d'Ouzoud: Les Plus Spectaculaires du Maroc",
        de: 'Ouzoud Wasserfälle Tagesausflug: Marokkos Spektakulärste Wasserfälle',
      },
      shortDescription: {
        en: "Escape to Morocco's tallest waterfalls - 110 meters of cascading beauty, wild Barbary macaques, and the hidden wonder of Iminifri Bridge.",
        fr: "Évadez-vous vers les plus hautes cascades du Maroc - 110 mètres de beauté, macaques de Barbarie et le Pont d'Iminifri.",
        de: 'Entfliehen Sie zu Marokkos höchsten Wasserfällen - 110 Meter Naturschönheit, wilde Berberaffen und die versteckte Iminifri-Brücke.',
      },
      highlights: {
        en: ['110-meter cascading waterfalls', 'Wild Barbary macaques', 'Ancient grain mills', 'Iminifri natural bridge', 'Optional boat ride', 'Scenic hiking trails'],
        fr: ['Cascades de 110 mètres', 'Macaques de Barbarie sauvages', 'Anciens moulins à grains', 'Pont naturel Iminifri', 'Balade en bateau optionnelle', 'Sentiers de randonnée pittoresques'],
        de: ['110 Meter hohe Wasserfälle', 'Wilde Berberaffen', 'Alte Getreidemühlen', 'Iminifri Naturbrücke', 'Optionale Bootsfahrt', 'Malerische Wanderwege'],
      },
      included: {
        en: ['Hotel pickup & drop-off', 'AC vehicle', 'Professional driver', 'Fuel & tolls', 'Bottled water', 'WiFi'],
        fr: ['Transfert hôtel', 'Véhicule climatisé', 'Chauffeur professionnel', 'Carburant & péages', 'Eau en bouteille', 'WiFi'],
        de: ['Hotel-Transfer', 'Klimatisiertes Fahrzeug', 'Professioneller Fahrer', 'Treibstoff & Maut', 'Wasser', 'WLAN'],
      },
    },

    // ========== COASTAL ADVENTURES ==========
    {
      slug: 'essaouira-day-trip',
      categorySlug: 'coastal-adventures',
      locationSlug: 'essaouira',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 20, childPrice: 12, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 15 },
      duration: { en: 'Full Day', fr: 'Journée complète', de: 'Ganzer Tag' },
      durationMinutes: 660,
      displayOrder: 9,
      isFeatured: true,
      title: {
        en: "Essaouira Day Trip: Morocco's Enchanting Coastal Escape",
        fr: "Excursion à Essaouira: Escapade Côtière Enchanteresse",
        de: 'Essaouira Tagesausflug: Marokkos Bezaubernde Küstenflucht',
      },
      shortDescription: {
        en: "Trade Marrakech's red walls for Atlantic blue. Wander a UNESCO medina, taste fresh seafood, and let the ocean breeze work its magic.",
        fr: "Échangez les murs rouges de Marrakech pour le bleu de l'Atlantique. Flânez dans une médina UNESCO, goûtez les fruits de mer frais.",
        de: 'Tauschen Sie Marrakeschs rote Mauern gegen Atlantikblau. Wandern Sie durch eine UNESCO-Medina, kosten Sie frische Meeresfrüchte.',
      },
      highlights: {
        en: ['UNESCO medina exploration', 'Game of Thrones filming location', 'Fresh port seafood', 'Argan cooperative visit', 'Art galleries', 'Atlantic ocean views'],
        fr: ['Exploration médina UNESCO', 'Lieu de tournage Game of Thrones', 'Fruits de mer frais du port', 'Visite coopérative argan', 'Galeries d\'art', 'Vues sur l\'Atlantique'],
        de: ['UNESCO-Medina erkunden', 'Game of Thrones Drehort', 'Frische Meeresfrüchte vom Hafen', 'Argan-Kooperative besuchen', 'Kunstgalerien', 'Atlantik-Aussichten'],
      },
      included: {
        en: ['Hotel pickup & drop-off', 'Comfortable transport', 'English/French driver', 'Argan cooperative stop', 'Fuel & tolls', 'Bottled water', 'WiFi'],
        fr: ['Transfert hôtel', 'Transport confortable', 'Chauffeur anglais/français', 'Arrêt coopérative argan', 'Carburant & péages', 'Eau en bouteille', 'WiFi'],
        de: ['Hotel-Transfer', 'Komfortabler Transport', 'Englisch/Französisch Fahrer', 'Argan-Kooperative Stopp', 'Treibstoff & Maut', 'Wasser', 'WLAN'],
      },
    },

    // ========== CULTURAL HERITAGE ==========
    {
      slug: 'ait-benhaddou-ouarzazate',
      categorySlug: 'cultural-heritage',
      locationSlug: 'ouarzazate',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 30, childPrice: 20, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 15 },
      duration: { en: 'Full Day', fr: 'Journée complète', de: 'Ganzer Tag' },
      durationMinutes: 720,
      displayOrder: 10,
      isFeatured: true,
      title: {
        en: 'Ait Ben Haddou & Ouarzazate: Hollywood of the Desert',
        fr: 'Aït Ben Haddou & Ouarzazate: Hollywood du Désert',
        de: 'Ait Ben Haddou & Ouarzazate: Hollywood der Wüste',
      },
      shortDescription: {
        en: "Walk in the footsteps of Gladiator and Game of Thrones. Cross Morocco's highest pass and explore the UNESCO fortress.",
        fr: "Marchez sur les traces de Gladiator et Game of Thrones. Traversez le plus haut col du Maroc et explorez la forteresse UNESCO.",
        de: 'Wandeln Sie auf den Spuren von Gladiator und Game of Thrones. Überqueren Sie Marokkos höchsten Pass und erkunden Sie die UNESCO-Festung.',
      },
      highlights: {
        en: ['Tizi n\'Tichka pass (2,260m)', 'UNESCO Ait Ben Haddou', 'Gladiator & GOT filming sites', 'Atlas Film Studios', 'Kasbah Taourirt', 'Berber villages'],
        fr: ['Col Tizi n\'Tichka (2 260m)', 'UNESCO Aït Ben Haddou', 'Lieux de tournage Gladiator & GOT', 'Atlas Film Studios', 'Kasbah Taourirt', 'Villages berbères'],
        de: ['Tizi n\'Tichka Pass (2.260m)', 'UNESCO Ait Ben Haddou', 'Gladiator & GOT Drehorte', 'Atlas Film Studios', 'Kasbah Taourirt', 'Berberdörfer'],
      },
      included: {
        en: ['Hotel pickup & drop-off', 'AC vehicle', 'English/French driver', 'Cross High Atlas', 'Ait Ben Haddou exploration', 'Fuel & tolls', 'WiFi'],
        fr: ['Transfert hôtel', 'Véhicule climatisé', 'Chauffeur anglais/français', 'Traversée Haut Atlas', 'Exploration Aït Ben Haddou', 'Carburant & péages', 'WiFi'],
        de: ['Hotel-Transfer', 'Klimatisiertes Fahrzeug', 'Englisch/Französisch Fahrer', 'Hoher Atlas Überquerung', 'Ait Ben Haddou Erkundung', 'Treibstoff & Maut', 'WLAN'],
      },
    },
    {
      slug: 'camel-ride-palmeraie',
      categorySlug: 'cultural-heritage',
      locationSlug: 'palmeraie',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 25, childPrice: 15, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 20 },
      duration: { en: '2-3 Hours', fr: '2-3 Heures', de: '2-3 Stunden' },
      durationMinutes: 150,
      displayOrder: 11,
      isFeatured: true,
      title: {
        en: 'Sunset Camel Ride in Marrakech Palm Grove',
        fr: 'Balade à Chameau au Coucher du Soleil dans la Palmeraie',
        de: 'Kamelritt bei Sonnenuntergang im Palmenhain',
      },
      shortDescription: {
        en: "Ride through Marrakech's ancient palm grove at sunset. Traditional Berber attire, mint tea ceremony, and stunning photos included.",
        fr: "Parcourez la palmeraie ancienne de Marrakech au coucher du soleil. Tenue berbère, cérémonie du thé et photos exceptionnelles incluses.",
        de: 'Reiten Sie durch Marrakeschs alten Palmenhain bei Sonnenuntergang. Traditionelle Berberkleidung, Teezeremonie und tolle Fotos inklusive.',
      },
      highlights: {
        en: ['12th-century palm grove', 'Traditional Berber robes', '1-hour camel ride', 'Berber tent relaxation', 'Mint tea ceremony', 'Atlas Mountain views'],
        fr: ['Palmeraie du 12ème siècle', 'Robes berbères traditionnelles', '1 heure de chameau', 'Détente en tente berbère', 'Cérémonie du thé', 'Vues sur l\'Atlas'],
        de: ['Palmenhain aus dem 12. Jahrhundert', 'Traditionelle Berbergewänder', '1 Stunde Kamelritt', 'Berberzelt-Entspannung', 'Teezeremonie', 'Atlas-Blick'],
      },
      included: {
        en: ['Hotel transfer', '1-hour camel ride', 'Berber robes & headscarf', 'Camel guide', 'Berber tent rest', 'Mint tea & pastries'],
        fr: ['Transfert hôtel', '1 heure de chameau', 'Robes berbères & foulard', 'Guide chamelier', 'Repos en tente berbère', 'Thé à la menthe & pâtisseries'],
        de: ['Hotel-Transfer', '1 Stunde Kamelritt', 'Berbergewänder & Kopftuch', 'Kamelführer', 'Berberzelt-Rast', 'Minztee & Gebäck'],
      },
    },

    // ========== ADVENTURE SPORTS ==========
    {
      slug: 'quad-biking-palmeraie',
      categorySlug: 'adventure-sports',
      locationSlug: 'palmeraie',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 36, childPrice: 25, childAgeLimit: 16, minGroupSize: 1, maxGroupSize: 12 },
      duration: { en: '2 Hours', fr: '2 Heures', de: '2 Stunden' },
      durationMinutes: 120,
      displayOrder: 12,
      isFeatured: true,
      title: {
        en: 'Quad Biking Adventure in Marrakech Palm Grove',
        fr: 'Aventure en Quad dans la Palmeraie de Marrakech',
        de: 'Quad-Abenteuer im Marrakech Palmenhain',
      },
      shortDescription: {
        en: 'Thrilling quad adventure through the Palmeraie. Explore Berber villages, enjoy mint tea with locals, and experience off-road excitement.',
        fr: 'Aventure palpitante en quad dans la Palmeraie. Explorez les villages berbères, savourez le thé à la menthe et vivez le hors-piste.',
        de: 'Aufregendes Quad-Abenteuer durch die Palmeraie. Erkunden Sie Berberdörfer, genießen Sie Minztee und erleben Sie Off-Road-Action.',
      },
      highlights: {
        en: ['300cc KYMCO quad bikes', 'Off-road Palmeraie trails', 'Berber village visit', 'Meet local families', 'Mint tea & pastries', 'Safety gear included'],
        fr: ['Quads KYMCO 300cc', 'Sentiers hors-piste Palmeraie', 'Visite village berbère', 'Rencontre familles locales', 'Thé à la menthe & pâtisseries', 'Équipement sécurité inclus'],
        de: ['300cc KYMCO Quads', 'Offroad-Trails Palmeraie', 'Berberdorf-Besuch', 'Lokale Familien treffen', 'Minztee & Gebäck', 'Sicherheitsausrüstung inklusive'],
      },
      included: {
        en: ['Hotel transfer', '1-hour quad ride', 'Safety equipment', 'Safety briefing', 'English/French guide', 'Village visit', 'Tea & pastries'],
        fr: ['Transfert hôtel', '1 heure de quad', 'Équipement sécurité', 'Briefing sécurité', 'Guide anglais/français', 'Visite village', 'Thé & pâtisseries'],
        de: ['Hotel-Transfer', '1 Stunde Quad-Fahrt', 'Sicherheitsausrüstung', 'Sicherheitseinweisung', 'Englisch/Französisch Guide', 'Dorfbesuch', 'Tee & Gebäck'],
      },
    },
    {
      slug: 'quad-biking-agafay',
      categorySlug: 'adventure-sports',
      locationSlug: 'agafay-desert',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 45, childPrice: 30, childAgeLimit: 16, minGroupSize: 1, maxGroupSize: 10 },
      duration: { en: '3 Hours', fr: '3 Heures', de: '3 Stunden' },
      durationMinutes: 180,
      displayOrder: 13,
      isFeatured: false,
      title: {
        en: 'Quad Biking in Agafay Desert',
        fr: "Quad dans le Désert d'Agafay",
        de: 'Quad-Fahren in der Agafay Wüste',
      },
      shortDescription: {
        en: 'Race across the dramatic Agafay Desert landscape on powerful quad bikes with stunning Atlas Mountain backdrops.',
        fr: "Traversez le paysage spectaculaire du désert d'Agafay en quad puissant avec l'Atlas en toile de fond.",
        de: 'Rasen Sie über die dramatische Agafay-Wüstenlandschaft auf kraftvollen Quads mit atemberaubendem Atlas-Panorama.',
      },
      highlights: {
        en: ['Agafay Desert terrain', 'Powerful 450cc quads', 'Atlas Mountain views', 'Professional instruction', 'Small groups', 'Refreshment break'],
        fr: ['Terrain désert Agafay', 'Quads puissants 450cc', 'Vues sur l\'Atlas', 'Instruction professionnelle', 'Petits groupes', 'Pause rafraîchissement'],
        de: ['Agafay Wüstengelände', 'Kraftvolle 450cc Quads', 'Atlas-Bergblick', 'Professionelle Einweisung', 'Kleine Gruppen', 'Erfrischungspause'],
      },
      included: {
        en: ['Hotel transfer', '2-hour quad adventure', 'Full safety gear', 'Professional guide', 'Water & soft drinks', 'Insurance'],
        fr: ['Transfert hôtel', '2 heures de quad', 'Équipement sécurité complet', 'Guide professionnel', 'Eau & boissons', 'Assurance'],
        de: ['Hotel-Transfer', '2 Stunden Quad-Abenteuer', 'Komplette Sicherheitsausrüstung', 'Professioneller Guide', 'Wasser & Getränke', 'Versicherung'],
      },
    },
    {
      slug: 'buggy-adventure-palmeraie',
      categorySlug: 'adventure-sports',
      locationSlug: 'palmeraie',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 50, childPrice: 35, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 8 },
      duration: { en: '2 Hours', fr: '2 Heures', de: '2 Stunden' },
      durationMinutes: 120,
      displayOrder: 14,
      isFeatured: false,
      title: {
        en: 'Buggy Adventure in Marrakech Palm Grove',
        fr: 'Aventure en Buggy dans la Palmeraie de Marrakech',
        de: 'Buggy-Abenteuer im Marrakech Palmenhain',
      },
      shortDescription: {
        en: 'Experience the thrill of off-road buggy driving through the Palmeraie desert landscape and traditional villages.',
        fr: 'Vivez le frisson de la conduite buggy hors-piste dans le paysage désertique de la Palmeraie et les villages traditionnels.',
        de: 'Erleben Sie den Nervenkitzel des Offroad-Buggy-Fahrens durch die Palmeraie-Wüstenlandschaft und traditionelle Dörfer.',
      },
      highlights: {
        en: ['Powerful buggy vehicles', 'Palmeraie exploration', 'Village visits', 'Photo opportunities', 'Refreshments included', 'All skill levels welcome'],
        fr: ['Véhicules buggy puissants', 'Exploration Palmeraie', 'Visites de villages', 'Opportunités photos', 'Rafraîchissements inclus', 'Tous niveaux bienvenus'],
        de: ['Kraftvolle Buggy-Fahrzeuge', 'Palmeraie erkunden', 'Dorfbesuche', 'Fotogelegenheiten', 'Erfrischungen inklusive', 'Alle Levels willkommen'],
      },
      included: {
        en: ['Hotel transfer', '1.5-hour buggy ride', 'Safety equipment', 'Training session', 'Guide', 'Mint tea', 'Insurance'],
        fr: ['Transfert hôtel', '1h30 de buggy', 'Équipement sécurité', 'Session formation', 'Guide', 'Thé à la menthe', 'Assurance'],
        de: ['Hotel-Transfer', '1,5 Stunden Buggy-Fahrt', 'Sicherheitsausrüstung', 'Trainingseinheit', 'Guide', 'Minztee', 'Versicherung'],
      },
    },
    {
      slug: 'hot-air-balloon-marrakech',
      categorySlug: 'adventure-sports',
      locationSlug: 'atlas-foothills',
      pricingType: 'per_person',
      groupPricing: { adultPrice: 180, childPrice: 140, childAgeLimit: 12, minGroupSize: 1, maxGroupSize: 20 },
      duration: { en: '4 Hours', fr: '4 Heures', de: '4 Stunden' },
      durationMinutes: 240,
      displayOrder: 15,
      isFeatured: true,
      title: {
        en: 'Hot Air Balloon Sunrise over Marrakech',
        fr: 'Montgolfière au Lever du Soleil sur Marrakech',
        de: 'Heißluftballon-Sonnenaufgang über Marrakesch',
      },
      shortDescription: {
        en: 'Float above the stunning Moroccan landscape at sunrise. See the Atlas Mountains, Berber villages, and ancient kasbahs from above.',
        fr: 'Survolez le paysage marocain époustouflant au lever du soleil. Voyez l\'Atlas, les villages berbères et les kasbahs anciennes d\'en haut.',
        de: 'Schweben Sie bei Sonnenaufgang über die atemberaubende marokkanische Landschaft. Sehen Sie das Atlasgebirge, Berberdörfer und alte Kasbahs von oben.',
      },
      highlights: {
        en: ['Sunrise flight', 'Atlas Mountain views', 'Berber villages from above', '1-hour flight', 'Traditional breakfast', 'Flight certificate', 'Champagne toast'],
        fr: ['Vol au lever du soleil', 'Vues sur l\'Atlas', 'Villages berbères vus d\'en haut', 'Vol d\'1 heure', 'Petit-déjeuner traditionnel', 'Certificat de vol', 'Toast au champagne'],
        de: ['Sonnenaufgangsflug', 'Atlas-Bergblick', 'Berberdörfer von oben', '1-stündiger Flug', 'Traditionelles Frühstück', 'Flugzertifikat', 'Champagner-Toast'],
      },
      included: {
        en: ['Early hotel pickup', '1-hour balloon flight', 'Traditional Berber breakfast', 'Flight certificate', 'Celebratory toast', 'Photos', 'Insurance'],
        fr: ['Transfert hôtel tôt', 'Vol montgolfière 1 heure', 'Petit-déjeuner berbère traditionnel', 'Certificat de vol', 'Toast de célébration', 'Photos', 'Assurance'],
        de: ['Frühe Hotel-Abholung', '1-stündiger Ballonflug', 'Traditionelles Berber-Frühstück', 'Flugzertifikat', 'Feierlicher Toast', 'Fotos', 'Versicherung'],
      },
    },
  ]

  for (const activity of activitiesData) {
    try {
      // Check if exists
      const existing = await payload.find({
        collection: 'activities',
        where: { slug: { equals: activity.slug } },
      })

      if (existing.docs[0]) {
        console.log(`  ⏭ Activity exists: ${activity.title.en}`)
        continue
      }

      const categoryId = createdCategories[activity.categorySlug]
      const locationId = createdLocations[activity.locationSlug]

      if (!categoryId) {
        console.log(`  ⚠ Skipping ${activity.title.en} - category not found: ${activity.categorySlug}`)
        continue
      }

      const baseData: any = {
        slug: activity.slug,
        category: categoryId,
        location: locationId,
        featuredImage: placeholderMediaId,
        pricingType: activity.pricingType,
        duration: activity.duration.en,
        durationMinutes: activity.durationMinutes,
        displayOrder: activity.displayOrder,
        isActive: true,
        isFeatured: activity.isFeatured,
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

      // French
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

      // German
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

      console.log(`  ✓ Created: ${activity.title.en}`)
    } catch (error: any) {
      console.error(`  ✗ Error creating ${activity.title.en}:`, error.message)
    }
  }

  console.log('\n✅ Activities seed complete!')
  process.exit(0)
}

seedActivities().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
