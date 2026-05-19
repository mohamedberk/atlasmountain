import { NextRequest, NextResponse } from 'next/server'

interface OSRMRoute {
  geometry: string
  distance: number
  duration: number
  legs: Array<{
    summary: string
    distance: number
    duration: number
  }>
}

interface OSRMResponse {
  code: string
  routes: OSRMRoute[]
  waypoints: Array<{
    name: string
    location: [number, number]
  }>
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // New format: waypoints=lat1,lng1|lat2,lng2|lat3,lng3
  const waypointsParam = searchParams.get('waypoints')

  // Legacy format: startLat, startLng, endLat, endLng
  const startLng = searchParams.get('startLng')
  const startLat = searchParams.get('startLat')
  const endLng = searchParams.get('endLng')
  const endLat = searchParams.get('endLat')

  let coordinates: string

  if (waypointsParam) {
    // Parse new waypoints format: "lat1,lng1|lat2,lng2|lat3,lng3"
    const waypoints = waypointsParam.split('|').map((wp) => {
      const [lat, lng] = wp.split(',')
      return { lat: parseFloat(lat), lng: parseFloat(lng) }
    })

    if (waypoints.length < 2) {
      return NextResponse.json({ error: 'At least 2 waypoints are required' }, { status: 400 })
    }

    // Validate all waypoints have valid coordinates
    const invalidWaypoint = waypoints.find((wp) => isNaN(wp.lat) || isNaN(wp.lng))
    if (invalidWaypoint) {
      return NextResponse.json({ error: 'Invalid waypoint coordinates' }, { status: 400 })
    }

    // OSRM format: lng,lat;lng,lat;lng,lat (note: longitude first!)
    coordinates = waypoints.map((wp) => `${wp.lng},${wp.lat}`).join(';')
  } else if (startLng && startLat && endLng && endLat) {
    // Legacy format support
    coordinates = `${startLng},${startLat};${endLng},${endLat}`
  } else {
    return NextResponse.json(
      { error: 'Missing coordinates. Use waypoints=lat1,lng1|lat2,lng2|... or startLat/startLng/endLat/endLng' },
      { status: 400 }
    )
  }

  try {
    // Call OSRM public server
    // Format: /route/v1/{profile}/{coordinates}
    // No alternatives for multi-waypoint routes (OSRM only returns one route with waypoints)
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordinates}?geometries=polyline&overview=full&steps=false`

    const response = await fetch(osrmUrl, {
      headers: {
        'User-Agent': 'AtlasMountainVisit/1.0',
      },
    })

    if (!response.ok) {
      throw new Error(`OSRM API returned ${response.status}`)
    }

    const data: OSRMResponse = await response.json()

    if (data.code !== 'Ok') {
      return NextResponse.json({ error: `OSRM error: ${data.code}` }, { status: 500 })
    }

    if (!data.routes || data.routes.length === 0) {
      return NextResponse.json({ error: 'No route found' }, { status: 404 })
    }

    // Return the first (and usually only) route for multi-waypoint requests
    const route = data.routes[0]

    return NextResponse.json({
      geometry: route.geometry,
      distance: route.distance, // meters
      duration: route.duration, // seconds
      legs: route.legs.map((leg) => ({
        summary: leg.summary,
        distance: leg.distance,
        duration: leg.duration,
      })),
      waypoints: data.waypoints,
    })
  } catch (error) {
    console.error('[OSRM API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch routes' },
      { status: 500 }
    )
  }
}
