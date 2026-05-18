/**
 * Polyline decoding and formatting utilities for route display
 * Uses Google's Polyline Algorithm (https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
 */

/**
 * Decode a Google/OSRM encoded polyline string into an array of [lat, lng] coordinates
 * @param encoded - The encoded polyline string
 * @returns Array of [latitude, longitude] pairs
 */
export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let b: number
    let shift = 0
    let result = 0

    // Decode latitude
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlat = result & 1 ? ~(result >> 1) : result >> 1
    lat += dlat

    // Decode longitude
    shift = 0
    result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlng = result & 1 ? ~(result >> 1) : result >> 1
    lng += dlng

    // Polyline uses precision of 5 decimal places
    points.push([lat / 1e5, lng / 1e5])
  }

  return points
}

/**
 * Format distance in meters to human-readable string
 * @param meters - Distance in meters
 * @returns Formatted distance (e.g., "530 km" or "800 m")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  const km = meters / 1000
  if (km < 10) {
    return `${km.toFixed(1)} km`
  }
  return `${Math.round(km)} km`
}

/**
 * Format duration in seconds to human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted duration (e.g., "6 hr 30 min" or "45 min")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)

  if (hours === 0) {
    return `${minutes} min`
  }
  if (minutes === 0) {
    return `${hours} hr`
  }
  return `${hours} hr ${minutes} min`
}

/**
 * Calculate the bounding box of a set of coordinates
 * @param coordinates - Array of [lat, lng] pairs
 * @returns Bounds object with northeast and southwest corners
 */
export function calculateBounds(coordinates: [number, number][]): {
  northeast: { lat: number; lng: number }
  southwest: { lat: number; lng: number }
} {
  if (coordinates.length === 0) {
    return {
      northeast: { lat: 0, lng: 0 },
      southwest: { lat: 0, lng: 0 },
    }
  }

  let minLat = coordinates[0][0]
  let maxLat = coordinates[0][0]
  let minLng = coordinates[0][1]
  let maxLng = coordinates[0][1]

  for (const [lat, lng] of coordinates) {
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
  }

  return {
    northeast: { lat: maxLat, lng: maxLng },
    southwest: { lat: minLat, lng: minLng },
  }
}
