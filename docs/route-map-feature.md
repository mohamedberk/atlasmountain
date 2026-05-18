# Route Map Feature - Complete Implementation Guide

## Overview

This document describes the complete implementation of the interactive route map feature for travel activities. The system allows administrators to define multi-stop travel routes with waypoints, and displays them on the frontend with actual road routing.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL                               │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │ WaypointMapPicker│    │ RouteCalculator │                     │
│  │ - Search location│    │ - Calculate route│                    │
│  │ - Click on map   │    │ - Preview map    │                    │
│  │ - Set coordinates│    │ - Store geometry │                    │
│  └────────┬────────┘    └────────┬────────┘                     │
│           │                      │                               │
│           └──────────┬───────────┘                               │
│                      ▼                                           │
│              ┌──────────────┐                                    │
│              │  Activities  │                                    │
│              │  Collection  │                                    │
│              │  (Payload)   │                                    │
│              └──────┬───────┘                                    │
└─────────────────────┼───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE                                   │
│  route: {                                                        │
│    enabled: boolean                                              │
│    routeColor: 'blue' | 'red' | 'green' | 'orange' | 'purple'   │
│    waypoints: [{                                                 │
│      name: string                                                │
│      coordinates: { latitude: number, longitude: number }        │
│    }]                                                            │
│    selectedRoute: {                                              │
│      geometry: string (encoded polyline)                         │
│      distance: number (meters)                                   │
│      duration: number (seconds)                                  │
│    }                                                             │
│  }                                                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND                                   │
│  ┌─────────────────────────────────────────┐                    │
│  │              RouteMap Component          │                    │
│  │  - Leaflet map with Google Maps tiles   │                    │
│  │  - Custom markers (A, B, C, D...)       │                    │
│  │  - OSRM road routing                    │                    │
│  │  - Waypoint summary overlay             │                    │
│  │  - "Open in Google Maps" link           │                    │
│  └─────────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Payload CMS)

### Activities Collection - Route Tab

```typescript
// src/collections/Activities.ts

{
  label: 'Route',
  description: 'Define the travel route for this activity',
  fields: [
    {
      name: 'route',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable route display on activity page',
          },
        },
        {
          name: 'routeColor',
          type: 'select',
          defaultValue: 'blue',
          options: [
            { label: 'Blue', value: 'blue' },
            { label: 'Green', value: 'green' },
            { label: 'Red', value: 'red' },
            { label: 'Orange', value: 'orange' },
            { label: 'Purple', value: 'purple' },
          ],
        },
        {
          name: 'waypoints',
          type: 'array',
          minRows: 2,
          admin: {
            description: 'Add stops along your route. Minimum 2 required.',
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: {
                placeholder: 'e.g., Marrakech, Ait Benhaddou, Ouarzazate...',
              },
            },
            {
              name: 'coordinates',
              type: 'group',
              fields: [
                {
                  name: 'latitude',
                  type: 'number',
                  admin: { step: 0.000001, width: '50%' },
                },
                {
                  name: 'longitude',
                  type: 'number',
                  admin: { step: 0.000001, width: '50%' },
                },
              ],
            },
            {
              name: 'waypointMapPicker',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/admin/WaypointMapPicker#WaypointMapPickerField',
                },
              },
            },
          ],
        },
        {
          name: 'selectedRoute',
          type: 'group',
          admin: {
            description: 'Calculated route data',
          },
          fields: [
            {
              name: 'geometry',
              type: 'textarea',
              admin: { description: 'Encoded polyline geometry', readOnly: true },
            },
            {
              name: 'distance',
              type: 'number',
              admin: { description: 'Total distance in meters', readOnly: true },
            },
            {
              name: 'duration',
              type: 'number',
              admin: { description: 'Estimated duration in seconds', readOnly: true },
            },
          ],
        },
        {
          name: 'routeCalculator',
          type: 'ui',
          admin: {
            components: {
              Field: '@/components/admin/RouteCalculator#RouteCalculatorField',
            },
            condition: (data) => data?.route?.enabled && data?.route?.waypoints?.length >= 2,
          },
        },
      ],
    },
  ],
}
```

---

## Admin Components

### 1. WaypointMapPicker Component

**Location:** `src/components/admin/WaypointMapPicker.tsx`

**Purpose:** Allows admins to search for locations and pick coordinates on a mini-map for each waypoint.

**Features:**
- Search bar using Nominatim API (OpenStreetMap geocoding)
- Mini Leaflet map for visual selection
- Click-to-select coordinates
- Auto-fills waypoint name from search result
- Displays current coordinates

**Key Implementation:**

```typescript
'use client'
import { useField } from '@payloadcms/ui'

export const WaypointMapPickerField: UIFieldClientComponent = ({ path }) => {
  // Get parent path to access sibling fields
  const parentPath = path?.replace(/\.waypointMapPicker$/, '') || ''

  // Access coordinates and name fields
  const { value: lat, setValue: setLat } = useField<number>({
    path: `${parentPath}.coordinates.latitude`
  })
  const { value: lng, setValue: setLng } = useField<number>({
    path: `${parentPath}.coordinates.longitude`
  })
  const { value: name, setValue: setName } = useField<string>({
    path: `${parentPath}.name`
  })

  // ... search functionality using Nominatim API
  // ... Leaflet map with click handler
}
```

### 2. RouteCalculator Component

**Location:** `src/components/admin/RouteCalculator.tsx`

**Purpose:** Calculates the driving route between all waypoints using OSRM and stores the geometry.

**Features:**
- Preview map showing all waypoints
- "Calculate Route" button
- Calls OSRM API for actual road routing
- Stores encoded polyline geometry
- Shows distance and duration

**Key Implementation:**

```typescript
'use client'
import { useField } from '@payloadcms/ui'

export const RouteCalculatorField: UIFieldClientComponent = () => {
  const { value: geometry, setValue: setGeometry } = useField<string>({
    path: 'route.selectedRoute.geometry',
  })
  const { setValue: setDistance } = useField<number>({
    path: 'route.selectedRoute.distance',
  })
  const { setValue: setDuration } = useField<number>({
    path: 'route.selectedRoute.duration',
  })
  const { value: waypoints } = useField<Waypoint[]>({
    path: 'route.waypoints',
  })

  const calculateRoute = async () => {
    const waypointsStr = validWaypoints
      .map((wp) => `${wp.coordinates.latitude},${wp.coordinates.longitude}`)
      .join('|')

    const response = await fetch(`/api/routes/osrm?waypoints=${waypointsStr}`)
    const data = await response.json()

    setGeometry(data.geometry)
    setDistance(data.distance)
    setDuration(data.duration)
  }
}
```

---

## API Route

### OSRM Route API

**Location:** `src/app/api/routes/osrm/route.ts`

**Purpose:** Proxies requests to OSRM (Open Source Routing Machine) for road routing.

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const waypoints = searchParams.get('waypoints')

  if (!waypoints) {
    return NextResponse.json({ error: 'Waypoints required' }, { status: 400 })
  }

  // Parse waypoints: "lat1,lng1|lat2,lng2|lat3,lng3"
  const coords = waypoints.split('|').map(wp => {
    const [lat, lng] = wp.split(',').map(Number)
    return `${lng},${lat}` // OSRM uses lng,lat format
  }).join(';')

  // Call OSRM API
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=polyline`
  const response = await fetch(osrmUrl)
  const data = await response.json()

  if (data.code !== 'Ok' || !data.routes?.[0]) {
    return NextResponse.json({ error: 'Route not found' }, { status: 404 })
  }

  const route = data.routes[0]
  return NextResponse.json({
    geometry: route.geometry, // Encoded polyline
    distance: route.distance, // meters
    duration: route.duration, // seconds
  })
}
```

---

## Frontend Component

### RouteMap Component

**Location:** `src/components/ui/route-map.tsx`

**Purpose:** Displays the route map on activity detail pages.

**Features:**
- Leaflet map with Google Maps tiles
- Custom Google Maps-style markers (A, B, C, D...)
- Color-coded: Green (start), Blue (intermediate), Red (end)
- Actual road routing from OSRM (auto-fetches if no geometry saved)
- Waypoint summary bar at bottom
- "Open in Google Maps" button
- Proper z-index (doesn't overlap navbar)

**Key Implementation:**

```typescript
'use client'
import { useMemo, useEffect, useRef, useState } from 'react'
import { decodePolyline } from '@/lib/polyline'

interface Waypoint {
  lat: number
  lng: number
  name: string
}

interface RouteMapProps {
  waypoints: Waypoint[]
  routeColor?: string
  className?: string
  geometry?: string // Pre-calculated OSRM geometry
}

export function RouteMap({ waypoints, routeColor = 'blue', className = '', geometry: initialGeometry }: RouteMapProps) {
  const [routeGeometry, setRouteGeometry] = useState(initialGeometry)

  // Auto-fetch route from OSRM if no geometry provided
  useEffect(() => {
    if (initialGeometry || waypoints.length < 2) return

    const fetchRoute = async () => {
      const waypointsStr = waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|')
      const response = await fetch(`/api/routes/osrm?waypoints=${waypointsStr}`)
      const data = await response.json()
      if (data.geometry) setRouteGeometry(data.geometry)
    }

    fetchRoute()
  }, [waypoints, initialGeometry])

  // Initialize Leaflet map with Google Maps tiles
  useEffect(() => {
    const L = await import('leaflet')

    const map = L.map(mapRef.current)

    // Google Maps tiles
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}')

    // Add markers for each waypoint
    waypoints.forEach((wp, idx) => {
      const isFirst = idx === 0
      const isLast = idx === waypoints.length - 1
      const markerColor = isFirst ? '#34A853' : isLast ? '#EA4335' : '#4285F4'
      const label = String.fromCharCode(65 + idx) // A, B, C...

      // Custom Google Maps-style pin marker
      const icon = L.divIcon({
        html: `<svg>...</svg><span>${label}</span>`
      })

      L.marker([wp.lat, wp.lng], { icon }).addTo(map)
    })

    // Draw route polyline
    const routeCoords = routeGeometry
      ? decodePolyline(routeGeometry)
      : waypoints.map(wp => [wp.lat, wp.lng])

    L.polyline(routeCoords, { color: routeColorHex, weight: 5 }).addTo(map)
  }, [waypoints, routeGeometry])

  return (
    <div className="relative rounded-xl overflow-hidden z-0">
      <div ref={mapRef} className="w-full h-[400px] z-0" />

      {/* Waypoint summary overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3">
          {waypoints.map((wp, idx) => (
            <span key={idx}>
              <span className="marker">{String.fromCharCode(65 + idx)}</span>
              {wp.name}
              {idx < waypoints.length - 1 && ' → '}
            </span>
          ))}
          <a href={googleMapsUrl}>Open in Google Maps</a>
        </div>
      </div>
    </div>
  )
}
```

---

## Utility Functions

### Polyline Decoder

**Location:** `src/lib/polyline.ts`

```typescript
// Decode OSRM encoded polyline to array of [lat, lng] coordinates
export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = []
  let index = 0, lat = 0, lng = 0

  while (index < encoded.length) {
    let b, shift = 0, result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    lat += (result & 1 ? ~(result >> 1) : result >> 1)

    shift = 0
    result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    lng += (result & 1 ? ~(result >> 1) : result >> 1)

    points.push([lat / 1e5, lng / 1e5])
  }

  return points
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  const km = meters / 1000
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours} hr`
  return `${hours} hr ${minutes} min`
}
```

---

## Frontend Integration

### Activity Detail Page

**Location:** `src/app/(frontend)/[locale]/activities/[slug]/activity-detail-client.tsx`

```typescript
// Extract route data from activity
function getRouteData(activity: Activity): RouteData | null {
  const route = (activity as any).route
  if (!route?.enabled) return null

  const waypointsData = route.waypoints
  if (!waypointsData || !Array.isArray(waypointsData) || waypointsData.length < 2) return null

  const waypoints = waypointsData
    .filter((wp: any) => wp.coordinates?.latitude && wp.coordinates?.longitude)
    .map((wp: any) => ({
      lat: wp.coordinates.latitude,
      lng: wp.coordinates.longitude,
      name: wp.name || 'Waypoint',
    }))

  if (waypoints.length < 2) return null

  return {
    waypoints,
    routeColor: route.routeColor || 'blue',
    geometry: route.selectedRoute?.geometry,
  }
}

// In the component
const routeData = getRouteData(activity)

// Render
{routeData && (
  <div>
    <h2>Travel Route</h2>
    <RouteMap
      waypoints={routeData.waypoints}
      routeColor={routeData.routeColor}
      geometry={routeData.geometry}
    />
  </div>
)}
```

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── routes/
│   │       └── osrm/
│   │           └── route.ts          # OSRM proxy API
│   └── (frontend)/
│       └── [locale]/
│           └── activities/
│               └── [slug]/
│                   └── activity-detail-client.tsx  # Uses RouteMap
├── collections/
│   └── Activities.ts                 # Route schema definition
├── components/
│   ├── admin/
│   │   ├── WaypointMapPicker.tsx     # Admin waypoint picker
│   │   └── RouteCalculator.tsx       # Admin route calculator
│   └── ui/
│       └── route-map.tsx             # Frontend route display
└── lib/
    └── polyline.ts                   # Polyline utilities
```

---

## Dependencies

```json
{
  "dependencies": {
    "leaflet": "^1.9.4"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.8"
  }
}
```

**CDN loaded at runtime:**
- Leaflet CSS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`
- Google Maps tiles: `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`

---

## External APIs Used

1. **OSRM (Open Source Routing Machine)**
   - URL: `https://router.project-osrm.org/route/v1/driving/`
   - Free, no API key required
   - Returns encoded polyline geometry for road routes

2. **Nominatim (OpenStreetMap Geocoding)**
   - URL: `https://nominatim.openstreetmap.org/search`
   - Free, no API key required
   - Used for location search in admin

3. **Google Maps Tiles**
   - URL: `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`
   - Free for low-volume usage
   - Provides familiar Google Maps appearance

---

## Usage Instructions

### For Administrators

1. Go to **Activities** collection in Payload admin
2. Edit or create an activity
3. Navigate to the **Route** tab
4. Check **Enable route display**
5. Add waypoints:
   - Click **+ Add Waypoint**
   - Enter the location name (e.g., "Marrakech")
   - Use the search bar to find the location
   - Or click on the mini-map to set coordinates
6. Repeat for all stops (minimum 2 required)
7. Click **Calculate Route** to generate the road path
8. Save the activity

### Result on Frontend

- The activity page will display a "Travel Route" section
- Shows an interactive map with:
  - Google Maps tiles
  - Custom markers (A, B, C, D...) at each stop
  - Blue route line following actual roads
  - Waypoint summary bar at bottom
  - "Open in Google Maps" link

---

## Troubleshooting

### Route not showing on frontend
- Ensure `route.enabled` is checked
- Verify at least 2 waypoints have coordinates set
- Check browser console for OSRM API errors

### Markers not appearing
- Leaflet CSS must be loaded
- Check z-index issues with parent containers

### Route showing straight lines instead of roads
- OSRM API might be rate-limited or down
- Check `/api/routes/osrm` endpoint
- Verify waypoints are accessible by road

### Map overlapping navbar
- Ensure the map container has `z-0` class
- Internal overlays should use `z-10` (not `z-[1000]`)

---

## Changelog

### 2026-01-28
- Removed the location itinerary text (e.g., "Marrakech → Ait Ben Haddou → Dades Gorges → ...") that was displayed below the "Travel Route" heading. The waypoint summary is still visible in the overlay at the bottom of the map, so this text was redundant. The map section now shows just the title followed directly by the RouteMap component.
