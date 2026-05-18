import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { getPayload } from 'payload'
import config from '@payload-config'

type CheerioSelection = ReturnType<ReturnType<typeof cheerio.load>>

export interface ScrapedActivity {
  title: string
  slug: string
  description: string
  shortDescription: string
  duration: string
  location: string
  difficulty: string
  pricingType: 'per_person' | 'fixed' | 'both'
  groupPricing?: {
    adultPrice: number
    childPrice: number
    childAgeLimit?: number
    minGroupSize?: number
    maxGroupSize?: number
  }
  privatePricing?: {
    basePrice: number
    minGuests?: number
    maxGuests?: number
    additionalGuestPrice?: number
  }
  highlights: string[]
  included: string[]
  notIncluded: string[]
  recommendations: string[]
  itinerary: { time?: string; activity: string; description?: string }[]
  images: string[]
  sourceUrl: string
  category?: string
  languages: string[]
  coordinates?: {
    latitude: number
    longitude: number
  }
}

// Fallback coordinates for common Moroccan destinations
const MOROCCAN_CITIES_COORDS: Record<string, { latitude: number; longitude: number }> = {
  'marrakech': { latitude: 31.6295, longitude: -7.9811 },
  'casablanca': { latitude: 33.5731, longitude: -7.5898 },
  'agadir': { latitude: 30.4278, longitude: -9.5981 },
  'essaouira': { latitude: 31.5085, longitude: -9.7595 },
  'fes': { latitude: 34.0181, longitude: -5.0078 },
  'ouarzazate': { latitude: 30.9189, longitude: -6.8936 },
  'merzouga': { latitude: 31.0801, longitude: -4.0134 },
  'chefchaouen': { latitude: 35.1688, longitude: -5.2636 },
  'rabat': { latitude: 34.0209, longitude: -6.8416 },
  'tangier': { latitude: 35.7595, longitude: -5.8340 },
  'ouzoud': { latitude: 32.0136, longitude: -6.7219 },
  'imlil': { latitude: 31.1367, longitude: -7.9196 },
  'ourika': { latitude: 31.3167, longitude: -7.8000 },
  'ait benhaddou': { latitude: 31.0470, longitude: -7.1299 },
  'ait-benhaddou': { latitude: 31.0470, longitude: -7.1299 },
  'zagora': { latitude: 30.3286, longitude: -5.8378 },
  'todra': { latitude: 31.5892, longitude: -5.5897 },
  'dades': { latitude: 31.4500, longitude: -5.9667 },
}

// Geocode a location string to coordinates using Nominatim API
async function geocodeLocation(location: string): Promise<{ latitude: number; longitude: number } | undefined> {
  // First, check fallback coordinates for known cities
  const locationLower = location.toLowerCase()
  for (const [city, coords] of Object.entries(MOROCCAN_CITIES_COORDS)) {
    if (locationLower.includes(city)) {
      return coords
    }
  }

  // Try Nominatim geocoding API
  try {
    const query = location.includes('Morocco') ? location : `${location}, Morocco`
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ma&limit=1`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GreenAtlasTravel/1.0 (contact@greenatlastravel.com)',
      },
    })

    if (!response.ok) return undefined

    const results = await response.json()
    if (results.length > 0) {
      return {
        latitude: parseFloat(results[0].lat),
        longitude: parseFloat(results[0].lon),
      }
    }
  } catch (error) {
    console.log(`[Scrape] Geocoding failed for ${location}:`, error)
  }

  return undefined
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function scrapeActivity(url: string): Promise<ScrapedActivity> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  // Extract title from h1
  let title = ''
  title = $('h1').first().text().trim()
  if (!title) {
    title = $('title').text().replace(/ - .*$/, '').replace(/ \| .*$/, '').trim()
  }

  const slug = generateSlug(title)

  // Helper function to find section content after a heading
  function findSectionContent(headingText: string): CheerioSelection | null {
    let found: CheerioSelection | null = null
    $('h2, h3, h4, h5, strong').each((_, el) => {
      const text = $(el).text().toLowerCase().trim()
      if (text.includes(headingText.toLowerCase()) && !found) {
        found = $(el) as CheerioSelection
        return false
      }
    })
    return found
  }

  // Extract duration - look for "Durations" heading
  let duration = 'Full Day'
  const durationHeading = findSectionContent('duration')
  if (durationHeading) {
    // Get next sibling or parent's next element
    let next = durationHeading.next()
    for (let i = 0; i < 3 && next.length; i++) {
      const text = next.text().trim()
      if (text && text.length > 0 && text.length < 100) {
        // Check for patterns like "3 Days", "9:00 AM – 17H00 PM", "Half Day"
        if (text.match(/(\d+\s*(Day|Days|Hour|Hours|Night|Nights)|Half Day|Full Day|\d+:\d+.*–.*\d+)/i)) {
          duration = text
          break
        }
      }
      next = next.next()
    }
  }
  // Fallback: search in body text
  if (duration === 'Full Day') {
    const bodyText = $('body').text()
    const durationMatch = bodyText.match(/Durations?\s*[:\n]*\s*([^\n]+)/i)
    if (durationMatch) {
      const dur = durationMatch[1].trim().substring(0, 100)
      if (dur.match(/(\d+\s*(Day|Days|Hour|Hours|Night|Nights)|Half Day|Full Day|\d+:\d+)/i)) {
        duration = dur.split(/\n/, 1)[0].trim()
      }
    }
  }

  // Extract difficulty
  let difficulty = 'Easy'
  const difficultyHeading = findSectionContent('difficulty')
  if (difficultyHeading) {
    let next = difficultyHeading.next()
    for (let i = 0; i < 3 && next.length; i++) {
      const text = next.text().trim()
      if (text && text.match(/^(Easy|Moderate|Difficult|Hard|Challenging|Medium)$/i)) {
        difficulty = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
        break
      }
      next = next.next()
    }
  }
  // Fallback: search in body text
  if (difficulty === 'Easy') {
    const bodyText = $('body').text()
    const difficultyMatch = bodyText.match(/Difficulty\s*[:\n]*\s*(Easy|Moderate|Difficult|Hard|Challenging|Medium)/i)
    if (difficultyMatch) {
      difficulty = difficultyMatch[1].charAt(0).toUpperCase() + difficultyMatch[1].slice(1).toLowerCase()
    }
  }

  // Extract location
  let location = 'Morocco'
  const locationHeading = findSectionContent('location')
  if (locationHeading) {
    let next = locationHeading.next()
    for (let i = 0; i < 3 && next.length; i++) {
      const text = next.text().trim()
      if (text && text.length > 2 && text.length < 100) {
        location = text
        break
      }
      next = next.next()
    }
  }
  // Try to extract from content
  if (location === 'Morocco') {
    const cities = ['Marrakech', 'Fes', 'Casablanca', 'Rabat', 'Merzouga', 'Ouarzazate', 'Essaouira', 'Chefchaouen', 'Agadir']
    for (const city of cities) {
      if (title.toLowerCase().includes(city.toLowerCase())) {
        location = city + ', Morocco'
        break
      }
    }
  }

  // Extract overview/description - greenatlastravel.com specific
  // The description paragraph is inside: .elementor-widget-text-editor .elementor-widget-container p
  let description = ''

  // Find the EXACT description paragraph - it's in a text-editor widget with the intro text
  $('.elementor-widget-text-editor .elementor-widget-container p').each((_, el) => {
    if (description) return // Already found
    const text = $(el).text().trim()

    // Skip short text, footer text, or garbage
    if (text.length < 100) return
    if (text.includes('Green Atlas Travel offers')) return
    if (text.includes('+212') || text.includes('0666-')) return

    // The real description contains these keywords and starts properly
    if (
      (text.toLowerCase().includes('journey') ||
        text.toLowerCase().includes('discover') ||
        text.toLowerCase().includes('experience') ||
        text.toLowerCase().includes('explore') ||
        text.toLowerCase().includes('immersive') ||
        text.toLowerCase().includes('adventure')) &&
      !text.match(/^(Day\s*\d+|Morning|Afternoon|Evening|\d{1,2}:\d{2}|Home)/i)
    ) {
      description = text
    }
  })

  // Fallback: meta description
  if (!description || description.length < 50) {
    description = $('meta[name="description"]').attr('content') || ''
  }

  // Short description left empty - Overview from source goes to full description only
  const shortDescription = ''

  // Extract trip highlights - greenatlastravel.com uses Elementor icon lists
  const highlights: string[] = []

  // Find the "Trip Highlights" heading and extract items from the following list
  let inHighlightsSection = false
  $('h2.elementor-heading-title, h3.elementor-heading-title, h2, h3, h4').each((_, el) => {
    const headingText = $(el).text().toLowerCase().trim()
    if (headingText.includes('highlight') && !inHighlightsSection) {
      inHighlightsSection = true

      // Find the parent section/container
      let container = $(el).closest('.elementor-element')
      if (!container.length) container = $(el).parent()

      // Look for the next sibling container with the icon list
      let nextContainer = container.next()
      for (let i = 0; i < 5 && nextContainer.length; i++) {
        // Look for icon list items with circle icons (bullets, not check marks)
        nextContainer.find('.elementor-icon-list-item').each((_, item) => {
          const $item = $(item)
          const html = $item.html() || ''

          // Only get items with circle/bullet icons (not check or times icons)
          if (html.includes('e-fas-circle') || (!html.includes('e-fas-check') && !html.includes('e-fas-times'))) {
            const text = $item.find('.elementor-icon-list-text').text().trim()
            if (text && text.length > 5 && text.length < 400 && !highlights.includes(text)) {
              highlights.push(text)
            }
          }
        })

        if (highlights.length > 0) break
        nextContainer = nextContainer.next()
      }

      // Also search within the same parent container
      if (highlights.length === 0) {
        container.parent().find('.elementor-icon-list-item').each((_, item) => {
          const $item = $(item)
          const html = $item.html() || ''
          if (html.includes('e-fas-circle') || (!html.includes('e-fas-check') && !html.includes('e-fas-times'))) {
            const text = $item.find('.elementor-icon-list-text').text().trim()
            if (text && text.length > 5 && text.length < 400 && !highlights.includes(text)) {
              highlights.push(text)
            }
          }
        })
      }
    }
  })

  // Fallback: look for any icon list that comes after a "highlight" heading in page order
  if (highlights.length === 0) {
    const bodyHtml = $('body').html() || ''
    const highlightIndex = bodyHtml.toLowerCase().indexOf('highlight')
    if (highlightIndex > -1) {
      // Find icon list items that appear after the highlight text
      $('li.elementor-icon-list-item').each((_, item) => {
        const $item = $(item)
        const html = $item.html() || ''
        // Only items with circle icons (not check/times)
        if (html.includes('e-fas-circle')) {
          const text = $item.find('.elementor-icon-list-text').text().trim()
          if (text && text.length > 5 && text.length < 400 && !highlights.includes(text)) {
            highlights.push(text)
          }
        }
      })
    }
  }

  // Extract included/excluded - greenatlastravel.com uses SVG icons in Elementor lists
  // e-fas-check = included, e-fas-times = excluded
  const included: string[] = []
  const notIncluded: string[] = []

  // Method 1: Find items by their SVG icon class
  $('li.elementor-icon-list-item').each((_, item) => {
    const $item = $(item)
    const html = $item.html() || ''
    const text = $item.find('.elementor-icon-list-text').text().trim()

    // Skip if no text or too short/long
    if (!text || text.length < 3 || text.length > 300) return
    // Skip items that look like itinerary
    if (text.toLowerCase().match(/^day\s*\d+/)) return
    // Skip items with circle icons (those are highlights)
    if (html.includes('e-fas-circle')) return

    // Check for check icon (included) - e-fas-check class
    if (html.includes('e-fas-check') || html.includes('fa-check')) {
      if (!included.includes(text)) {
        included.push(text)
      }
    }
    // Check for times/X icon (excluded) - e-fas-times class
    else if (html.includes('e-fas-times') || html.includes('fa-times') || html.includes('e-fas-xmark') || html.includes('fa-xmark')) {
      if (!notIncluded.includes(text)) {
        notIncluded.push(text)
      }
    }
  })

  // Method 2: Find by section - look for "Included / Excluded" heading
  if (included.length === 0 || notIncluded.length === 0) {
    $('h2.elementor-heading-title, h3.elementor-heading-title, h2, h3').each((_, el) => {
      const headingText = $(el).text().toLowerCase().trim()
      if (headingText.includes('included') || headingText.includes('excluded')) {
        // Find parent container
        let container = $(el).closest('.elementor-element')
        if (!container.length) container = $(el).parent()

        // Search for icon list items in nearby containers
        const parentSection = container.parent()
        parentSection.find('li.elementor-icon-list-item').each((_, item) => {
          const $item = $(item)
          const html = $item.html() || ''
          const text = $item.find('.elementor-icon-list-text').text().trim()

          if (!text || text.length < 3 || text.length > 300) return
          if (html.includes('e-fas-circle')) return // Skip highlights

          if (html.includes('e-fas-check') || html.includes('fa-check')) {
            if (!included.includes(text)) included.push(text)
          } else if (html.includes('e-fas-times') || html.includes('fa-times') || html.includes('e-fas-xmark')) {
            if (!notIncluded.includes(text)) notIncluded.push(text)
          }
        })
      }
    })
  }

  // Method 3: Fallback - scan all icon list items on the page
  if (included.length === 0) {
    $('.elementor-icon-list-item').each((_, item) => {
      const $item = $(item)
      const html = $item.html() || ''
      const text = $item.find('.elementor-icon-list-text').text().trim() || $item.text().trim()

      if (!text || text.length < 3 || text.length > 300) return
      if (html.includes('e-fas-circle')) return

      if (html.includes('e-fas-check') || html.includes('fa-check')) {
        if (!included.includes(text)) included.push(text)
      }
    })
  }

  if (notIncluded.length === 0) {
    $('.elementor-icon-list-item').each((_, item) => {
      const $item = $(item)
      const html = $item.html() || ''
      const text = $item.find('.elementor-icon-list-text').text().trim() || $item.text().trim()

      if (!text || text.length < 3 || text.length > 300) return

      if (html.includes('e-fas-times') || html.includes('fa-times') || html.includes('e-fas-xmark')) {
        if (!notIncluded.includes(text)) notIncluded.push(text)
      }
    })
  }

  // Extract recommendations
  const recommendations: string[] = []
  $('h2, h3, h4, h5, strong').each((_, el) => {
    const heading = $(el).text().toLowerCase().trim()
    if (heading.includes('bring') || heading.includes('recommend') || heading.includes('what to bring') || heading.includes('essentials') || heading.includes('tips')) {
      let sibling = $(el).next()
      for (let i = 0; i < 10 && sibling.length && recommendations.length < 15; i++) {
        if (sibling.is('ul, ol')) {
          sibling.find('li').each((_, li) => {
            const text = $(li).text().trim()
            if (text && text.length > 3 && text.length < 500 && !recommendations.includes(text)) {
              recommendations.push(text)
            }
          })
          break
        }
        sibling = sibling.next()
      }
    }
  })

  // Extract itinerary - greenatlastravel.com uses Elementor accordion (details.e-n-accordion-item)
  // IMPORTANT: We iterate in DOM order to preserve the exact order from the source page
  const itinerary: { time?: string; activity: string; description?: string }[] = []

  $('details.e-n-accordion-item').each((_, detail) => {
    const $detail = $(detail)

    // Get title from .e-n-accordion-item-title-text or summary
    const titleText =
      $detail.find('.e-n-accordion-item-title-text').text().trim() ||
      $detail.find('summary').text().trim()

    if (!titleText || titleText.length < 3) return

    // Get description from [role="region"] inside the accordion
    let itemDescription = ''
    const regionContent = $detail.find('[role="region"]').text().trim()
    if (regionContent && regionContent.length > 10) {
      itemDescription = regionContent
    }

    // Parse the title to extract time/activity
    // Format 1: "Day X: Activity"
    const dayMatch = titleText.match(/^Day\s*(\d+)\s*[:\-–]\s*(.+)/i)
    if (dayMatch) {
      itinerary.push({
        time: `Day ${dayMatch[1]}`,
        activity: dayMatch[2].trim().substring(0, 200),
        description: itemDescription.substring(0, 2000) || undefined,
      })
      return
    }

    // Format 2: "9:00 AM – Activity"
    const timeMatch = titleText.match(/^(\d{1,2}:\d{2}\s*(AM|PM)?)\s*[–\-]\s*(.+)/i)
    if (timeMatch) {
      itinerary.push({
        time: timeMatch[1],
        activity: timeMatch[3].trim().substring(0, 200),
        description: itemDescription.substring(0, 2000) || undefined,
      })
      return
    }

    // Format 3: "Mid-Morning Activity" or "Lunch Activity" (no separator)
    const periodMatch = titleText.match(/^(Morning|Mid-Morning|Late Morning|Afternoon|Evening|Midday|Lunch|Sunrise|Sunset)\s+(.+)/i)
    if (periodMatch) {
      itinerary.push({
        time: periodMatch[1],
        activity: periodMatch[2].trim().substring(0, 200),
        description: itemDescription.substring(0, 2000) || undefined,
      })
      return
    }

    // Format 4: Just use the title as activity (e.g., "4:00 PM – Return to Marrakech" without time extraction)
    // If title has a time pattern anywhere, extract it
    const anyTimeMatch = titleText.match(/(\d{1,2}:\d{2}\s*(AM|PM)?)/i)
    if (anyTimeMatch) {
      const time = anyTimeMatch[1]
      const activity = titleText.replace(anyTimeMatch[0], '').replace(/^[\s–\-:]+|[\s–\-:]+$/g, '').trim()
      itinerary.push({
        time: time,
        activity: activity || titleText,
        description: itemDescription.substring(0, 2000) || undefined,
      })
      return
    }

    // Fallback: just use the full title as activity
    itinerary.push({
      activity: titleText.substring(0, 200),
      description: itemDescription.substring(0, 2000) || undefined,
    })
  })

  // Method 2: Look for <strong>Day X:</strong> pattern (alternate format)
  if (itinerary.length === 0) {
    $('strong').each((_, el) => {
      const strongText = $(el).text().trim()
      const dayMatch = strongText.match(/^Day\s*(\d+)\s*:?\s*$/i)

      if (dayMatch) {
        const dayNum = dayMatch[1]
        const parent = $(el).parent()

        // Get the full text of the parent element (which includes the route after "Day X:")
        const fullText = parent.text().trim()

        // Extract the route/activity name (everything after "Day X:")
        const routeMatch = fullText.match(/Day\s*\d+\s*:\s*(.+)/i)
        let activityName = routeMatch ? routeMatch[1].trim() : `Day ${dayNum} Activities`

        // If the activity name is too long, truncate
        if (activityName.length > 200) {
          const firstSentence = activityName.match(/^[^.!?]+[.!?]?/)
          if (firstSentence) {
            activityName = firstSentence[0].trim()
          } else {
            activityName = activityName.substring(0, 150).trim()
          }
        }

        // Get description from following siblings/paragraphs
        let description = ''
        let sibling = parent.next()
        for (let i = 0; i < 10 && sibling.length; i++) {
          if (sibling.find('strong').text().match(/^Day\s*\d+/i)) break
          if (sibling.is('h2, h3')) break

          const sibText = sibling.text().trim()
          if (sibText.length > 20 && !sibText.match(/^Day\s*\d+/i)) {
            description += sibText + ' '
          }
          sibling = sibling.next()
        }

        const existingDay = itinerary.find(i => i.time === `Day ${dayNum}`)
        if (!existingDay) {
          itinerary.push({
            time: `Day ${dayNum}`,
            activity: activityName,
            description: description.trim().substring(0, 2000) || undefined,
          })
        }
      }
    })
  }

  // Method 3: Look for "Itinerary" section and parse content
  if (itinerary.length === 0) {
    const itineraryHeading = findSectionContent('itinerary')
    if (itineraryHeading) {
      let current = itineraryHeading.next()
      let currentDay: { time?: string; activity: string; description?: string } | null = null

      for (let i = 0; i < 50 && current.length; i++) {
        if (current.is('h2') && !current.text().toLowerCase().includes('day')) {
          break
        }

        const text = current.text().trim()
        const dayMatch = text.match(/Day\s*(\d+)\s*:\s*(.+)/i)

        if (dayMatch) {
          if (currentDay) {
            itinerary.push(currentDay)
          }

          let activityName = dayMatch[2].trim()
          if (activityName.length > 200) {
            const firstPart = activityName.split(/[.!?]/)[0]
            activityName = firstPart.trim() || activityName.substring(0, 150)
          }

          currentDay = {
            time: `Day ${dayMatch[1]}`,
            activity: activityName,
            description: '',
          }
        } else if (currentDay && text.length > 20 && !text.match(/^Day\s*\d+/i)) {
          currentDay.description = ((currentDay.description || '') + ' ' + text).trim().substring(0, 2000)
        }

        current = current.next()
      }

      if (currentDay) {
        itinerary.push(currentDay)
      }
    }
  }

  // Method 4: Fallback - Look for Day X in any heading
  if (itinerary.length === 0) {
    $('h2, h3, h4, h5').each((_, el) => {
      const headingText = $(el).text().trim()
      const dayMatch = headingText.match(/^Day\s*(\d+)[:\s–-]*(.*)/i)
      if (dayMatch) {
        let descriptionText = ''
        let sibling = $(el).next()
        for (let i = 0; i < 10 && sibling.length; i++) {
          if (sibling.is('h2, h3, h4, h5')) {
            if (sibling.text().match(/^Day\s*\d+/i)) break
          }
          const text = sibling.text().trim()
          if (text.length > 10) {
            descriptionText += text + ' '
          }
          sibling = sibling.next()
        }

        const existingDay = itinerary.find(i => i.time === `Day ${dayMatch[1]}`)
        if (!existingDay) {
          itinerary.push({
            time: `Day ${dayMatch[1]}`,
            activity: dayMatch[2]?.trim() || `Day ${dayMatch[1]} Activities`,
            description: descriptionText.trim().substring(0, 2000) || undefined,
          })
        }
      }
    })
  }

  // Method 5: For single-day tours with time-based itinerary
  if (itinerary.length === 0) {
    const timePatterns: { time?: string; activity: string; description?: string }[] = []
    $('h2, h3, h4, h5, strong, p').each((_, el) => {
      const text = $(el).text().trim()
      const timeMatch = text.match(/^(\d{1,2}:\d{2}\s*(AM|PM)?|Morning|Afternoon|Evening|Midday)[:\s–-]*(.*)/i)
      if (timeMatch && timePatterns.length < 10) {
        timePatterns.push({
          time: timeMatch[1],
          activity: timeMatch[3]?.substring(0, 150).trim() || 'Activity',
        })
      }
    })
    if (timePatterns.length > 0) {
      itinerary.push(...timePatterns)
    }
  }

  // NOTE: Do NOT sort itinerary - DOM order from accordion is already correct
  // Sorting breaks time-based itineraries like "9:00 AM", "Mid-Morning", "4:00 PM"

  // Extract images - WordPress/greenatlastravel.com structure
  const images: string[] = []
  const baseUrl = new URL(url).origin

  function addImage(src: string) {
    if (!src || src.includes('data:') || src.includes('placeholder')) return
    if (src.includes('logo') || src.includes('icon') || src.includes('avatar') || src.includes('favicon')) return
    if (src.includes('cookie') || src.includes('plugin') || src.includes('widget')) return
    if (src.includes('gravatar') || src.includes('emoji') || src.includes('spinner')) return
    // Skip small thumbnails (150x150, 100x100, etc.)
    if (src.match(/-\d{2,3}x\d{2,3}\./)) return

    // Make absolute URL
    let absoluteUrl = src
    if (!src.startsWith('http')) {
      absoluteUrl = src.startsWith('/') ? baseUrl + src : baseUrl + '/' + src
    }

    // Skip duplicates and limit to 15 images
    if (!images.includes(absoluteUrl) && images.length < 15) {
      images.push(absoluteUrl)
    }
  }

  // Priority 1: Swiper gallery images (main gallery on greenatlastravel.com)
  $('.swiper-slide-image, figure.swiper-slide-inner img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src')
    if (src) addImage(src)
  })

  // Priority 2: Elementor image carousel/gallery
  $('.elementor-carousel-image, .elementor-gallery-item img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src')
    if (src) addImage(src)
  })

  // Priority 3: WordPress gallery/bookingpress (fallback)
  if (images.length === 0) {
    $('[class*="gallery"] img, .wp-block-gallery img, .bookingpress img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src')
      const srcset = $(el).attr('srcset')
      if (srcset) {
        const largest = srcset.split(',').pop()?.trim().split(' ')[0]
        if (largest) addImage(largest)
      }
      if (src) addImage(src)
    })
  }

  // Priority 4: Featured/main images (only if no gallery found)
  if (images.length === 0) {
    $('.featured-image img, .post-thumbnail img, .wp-post-image').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src')
      if (src) addImage(src)
    })
  }

  // Extract languages
  const languages: string[] = []
  $('*').each((_, el) => {
    const text = $(el).text()
    const langMatch = text.match(/Languages?[:\s]*(English|Espanol|Français|French|Spanish|German|Arabic|Italian|Portuguese|Dutch|Russian|Chinese|Japanese)[\s,]*(.*)/i)
    if (langMatch && languages.length === 0) {
      const langText = langMatch[0].replace(/Languages?[:\s]*/i, '')
      const langs = langText.split(/[,\s]+/).filter(l =>
        l.match(/^(English|Espanol|Français|French|Spanish|German|Arabic|Italian|Portuguese|Dutch|Russian|Chinese|Japanese)$/i)
      )
      langs.forEach(lang => {
        const normalized = lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase()
        if (!languages.includes(normalized)) {
          languages.push(normalized)
        }
      })
    }
  })
  if (languages.length === 0) {
    languages.push('English')
  }

  // Extract coordinates
  let coordinates: { latitude: number; longitude: number } | undefined = undefined
  const mapElement = $('[data-lat][data-lng], [data-latitude][data-longitude]').first()
  if (mapElement.length) {
    const lat = parseFloat(mapElement.attr('data-lat') || mapElement.attr('data-latitude') || '')
    const lng = parseFloat(mapElement.attr('data-lng') || mapElement.attr('data-longitude') || '')
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      coordinates = { latitude: lat, longitude: lng }
    }
  }

  // Fallback: geocode from location name if no coordinates found on page
  if (!coordinates && location && location !== 'Morocco') {
    coordinates = await geocodeLocation(location)
  }

  // Final fallback: try to geocode from title (e.g., "Casablanca Day Trip" -> Casablanca)
  if (!coordinates && title) {
    coordinates = await geocodeLocation(title)
  }

  // Determine category
  let category = 'Tours'
  const urlLower = url.toLowerCase()
  const contentLower = (title + ' ' + description).toLowerCase()

  if (urlLower.includes('activity') || contentLower.includes('activity')) {
    category = 'Activities'
  } else if (urlLower.includes('desert') || contentLower.includes('desert') || contentLower.includes('sahara') || contentLower.includes('merzouga') || contentLower.includes('zagora')) {
    category = 'Desert Tours'
  } else if (urlLower.includes('day-trip') || urlLower.includes('excursion') || contentLower.includes('day trip') || contentLower.includes('ouzoud')) {
    category = 'Day Trips'
  } else if (urlLower.includes('trek') || urlLower.includes('hik') || contentLower.includes('trekking') || contentLower.includes('hiking')) {
    category = 'Trekking'
  } else if (urlLower.includes('quad') || urlLower.includes('camel') || urlLower.includes('balloon') || urlLower.includes('agafay')) {
    category = 'Activities'
  } else if (contentLower.includes('city tour') || contentLower.includes('guided tour')) {
    category = 'City Tours'
  } else if (contentLower.includes('imperial') || contentLower.includes('cities')) {
    category = 'Imperial Cities'
  }

  // Extract pricing (if available on page)
  let adultPrice = 0
  let childPrice = 0
  const priceRegex = /€\s*(\d+(?:[.,]\d{2})?)|(\d+(?:[.,]\d{2})?)\s*€|(\d+(?:[.,]\d{2})?)\s*(EUR|MAD)/gi
  const bodyText = $('body').text()
  const priceMatches = [...bodyText.matchAll(priceRegex)]
  const prices: number[] = []
  for (const match of priceMatches) {
    const priceStr = match[1] || match[2] || match[3]
    if (priceStr) {
      const price = parseFloat(priceStr.replace(',', '.'))
      if (price > 0 && price < 10000) {
        prices.push(price)
      }
    }
  }
  if (prices.length > 0) {
    const uniquePrices = [...new Set(prices)].sort((a, b) => a - b)
    if (uniquePrices.length >= 2) {
      adultPrice = uniquePrices[uniquePrices.length - 1]
      childPrice = uniquePrices[0]
    } else if (uniquePrices.length === 1) {
      adultPrice = uniquePrices[0]
      childPrice = Math.round(adultPrice * 0.7)
    }
  }

  return {
    title,
    slug,
    description,
    shortDescription,
    duration,
    location,
    difficulty,
    pricingType: 'per_person',
    groupPricing: {
      adultPrice: adultPrice || 0,
      childPrice: childPrice || 0,
      childAgeLimit: 12,
      minGroupSize: 1,
      maxGroupSize: 15,
    },
    highlights: highlights.slice(0, 15),
    included: included.slice(0, 20),
    notIncluded: notIncluded.slice(0, 15),
    recommendations: recommendations.slice(0, 10),
    itinerary: itinerary.slice(0, 25),
    images,
    sourceUrl: url,
    category,
    languages,
    coordinates,
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Auth check
    let user = null
    try {
      const { user: verifiedUser } = await payload.auth({
        headers: request.headers,
      })
      user = verifiedUser
    } catch (authError) {
      console.log('[Scrape-Activity] Auth check failed:', authError)
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to the admin panel.' },
        { status: 401 }
      )
    }

    const { urls } = await request.json()

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of URLs' },
        { status: 400 }
      )
    }

    const results: ScrapedActivity[] = []
    const errors: { url: string; error: string }[] = []

    for (const url of urls) {
      try {
        console.log(`[Scrape-Activity] Scraping: ${url}`)
        const activity = await scrapeActivity(url)
        results.push(activity)
      } catch (error) {
        console.error(`[Scrape-Activity] Error scraping ${url}:`, error)
        errors.push({
          url,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({ activities: results, errors })
  } catch (error) {
    console.error('[Scrape-Activity] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to scrape activities' },
      { status: 500 }
    )
  }
}
