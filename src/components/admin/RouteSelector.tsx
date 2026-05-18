'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useField, useDocumentInfo } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { Route, Loader2, Check, RefreshCw, MapPin } from 'lucide-react'

// Polyline decode function
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let b: number
    let shift = 0
    let result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlat = result & 1 ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlng = result & 1 ? ~(result >> 1) : result >> 1
    lng += dlng

    points.push([lat / 1e5, lng / 1e5])
  }

  return points
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  const km = meters / 1000
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours} hr`
  return `${hours} hr ${minutes} min`
}

interface RouteOption {
  index: number
  geometry: string
  distance: number
  duration: number
  summary: string
}

interface LocationData {
  id: string
  name: string
  coordinates?: {
    latitude?: number
    longitude?: number
  }
}

const ROUTE_COLORS = ['#3b82f6', '#22c55e', '#f97316'] // blue, green, orange

export const RouteSelectorField: UIFieldClientComponent = () => {
  // Form field hooks
  const { value: geometry, setValue: setGeometry } = useField<string>({
    path: 'route.selectedRoute.geometry',
  })
  const { setValue: setDistance } = useField<number>({
    path: 'route.selectedRoute.distance',
  })
  const { setValue: setDuration } = useField<number>({
    path: 'route.selectedRoute.duration',
  })
  const { value: startLocationId } = useField<string | LocationData>({
    path: 'route.startLocation',
  })
  const { value: endLocationId } = useField<string | LocationData>({
    path: 'route.endLocation',
  })

  // State
  const [routes, setRoutes] = useState<RouteOption[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startLocation, setStartLocation] = useState<LocationData | null>(null)
  const [endLocation, setEndLocation] = useState<LocationData | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Map refs
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null)
  const polylinesRef = useRef<L.Polyline[]>([])
  const markersRef = useRef<L.Marker[]>([])

  // Extract location IDs (handle both string ID and populated object)
  const startId = typeof startLocationId === 'object' ? startLocationId?.id : startLocationId
  const endId = typeof endLocationId === 'object' ? endLocationId?.id : endLocationId

  // Fetch location details
  useEffect(() => {
    const fetchLocations = async () => {
      if (!startId || !endId) {
        setStartLocation(null)
        setEndLocation(null)
        return
      }

      try {
        const [startRes, endRes] = await Promise.all([
          fetch(`/api/locations/${startId}`),
          fetch(`/api/locations/${endId}`),
        ])

        if (startRes.ok) {
          const startData = await startRes.json()
          setStartLocation(startData)
        }
        if (endRes.ok) {
          const endData = await endRes.json()
          setEndLocation(endData)
        }
      } catch (err) {
        console.error('Failed to fetch locations:', err)
      }
    }

    // If locations are already populated objects, use them directly
    if (typeof startLocationId === 'object' && startLocationId?.coordinates) {
      setStartLocation(startLocationId as LocationData)
    } else if (startId) {
      fetchLocations()
    }

    if (typeof endLocationId === 'object' && endLocationId?.coordinates) {
      setEndLocation(endLocationId as LocationData)
    }
  }, [startId, endId, startLocationId, endLocationId])

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      await new Promise((resolve) => setTimeout(resolve, 100))

      const leafletModule = await import('leaflet')
      const L = leafletModule.default
      leafletRef.current = leafletModule

      delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!mapRef.current || mapInstanceRef.current) return

      // Default to Morocco center
      const map = L.map(mapRef.current).setView([31.5, -6.5], 6)

      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=fr&gl=MA', {
        attribution: '&copy; Google Maps',
      }).addTo(map)

      mapInstanceRef.current = map
      setMapLoaded(true)
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Clear map layers
  const clearMapLayers = useCallback(() => {
    if (!mapInstanceRef.current) return

    polylinesRef.current.forEach((p) => p.remove())
    polylinesRef.current = []

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
  }, [])

  // Draw routes on map
  const drawRoutes = useCallback(
    (routeOptions: RouteOption[], selectedIdx: number | null) => {
      if (!mapInstanceRef.current || !leafletRef.current || !startLocation || !endLocation) return

      const L = leafletRef.current.default
      clearMapLayers()

      // Draw each route
      routeOptions.forEach((route, idx) => {
        const coords = decodePolyline(route.geometry)
        const isSelected = idx === selectedIdx
        const color = ROUTE_COLORS[idx] || '#666666'

        const polyline = L.polyline(coords, {
          color: isSelected ? color : color,
          weight: isSelected ? 6 : 4,
          opacity: isSelected ? 1 : 0.5,
        }).addTo(mapInstanceRef.current)

        // Click handler to select route
        polyline.on('click', () => {
          handleSelectRoute(route, idx)
        })

        // Add route number label at midpoint
        const midIdx = Math.floor(coords.length / 2)
        if (coords[midIdx]) {
          const label = L.divIcon({
            className: 'route-label',
            html: `<div style="
              background: ${color};
              color: white;
              font-weight: bold;
              font-size: 14px;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              cursor: pointer;
            ">${idx + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })
          const marker = L.marker(coords[midIdx], { icon: label }).addTo(mapInstanceRef.current)
          marker.on('click', () => handleSelectRoute(route, idx))
          markersRef.current.push(marker)
        }

        polylinesRef.current.push(polyline)
      })

      // Add start marker (green)
      if (startLocation.coordinates?.latitude && startLocation.coordinates?.longitude) {
        const startIcon = L.divIcon({
          className: 'start-marker',
          html: `<div style="
            width: 32px;
            height: 32px;
            background: #22c55e;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
          "></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })
        const startMarker = L.marker(
          [startLocation.coordinates.latitude, startLocation.coordinates.longitude],
          { icon: startIcon }
        )
          .bindPopup(`<strong>Start:</strong> ${startLocation.name}`)
          .addTo(mapInstanceRef.current)
        markersRef.current.push(startMarker)
      }

      // Add end marker (red)
      if (endLocation.coordinates?.latitude && endLocation.coordinates?.longitude) {
        const endIcon = L.divIcon({
          className: 'end-marker',
          html: `<div style="
            width: 32px;
            height: 32px;
            background: #ef4444;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          "></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })
        const endMarker = L.marker(
          [endLocation.coordinates.latitude, endLocation.coordinates.longitude],
          { icon: endIcon }
        )
          .bindPopup(`<strong>Destination:</strong> ${endLocation.name}`)
          .addTo(mapInstanceRef.current)
        markersRef.current.push(endMarker)
      }

      // Fit bounds to show all routes
      if (polylinesRef.current.length > 0) {
        const group = L.featureGroup(polylinesRef.current)
        mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] })
      }
    },
    [startLocation, endLocation, clearMapLayers]
  )

  // Handle route selection
  const handleSelectRoute = useCallback(
    (route: RouteOption, index: number) => {
      setSelectedIndex(index)
      setGeometry(route.geometry)
      setDistance(route.distance)
      setDuration(route.duration)

      // Redraw routes with new selection
      drawRoutes(routes, index)
    },
    [routes, setGeometry, setDistance, setDuration, drawRoutes]
  )

  // Fetch routes from OSRM
  const fetchRoutes = useCallback(async () => {
    if (
      !startLocation?.coordinates?.latitude ||
      !startLocation?.coordinates?.longitude ||
      !endLocation?.coordinates?.latitude ||
      !endLocation?.coordinates?.longitude
    ) {
      setError('Both start and end locations must have coordinates')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        startLat: startLocation.coordinates.latitude.toString(),
        startLng: startLocation.coordinates.longitude.toString(),
        endLat: endLocation.coordinates.latitude.toString(),
        endLng: endLocation.coordinates.longitude.toString(),
      })

      const response = await fetch(`/api/routes/osrm?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch routes')
      }

      setRoutes(data.routes)

      // If we have a stored geometry, find matching route
      if (geometry) {
        const matchIdx = data.routes.findIndex((r: RouteOption) => r.geometry === geometry)
        if (matchIdx >= 0) {
          setSelectedIndex(matchIdx)
        }
      }

      // Draw routes on map
      drawRoutes(data.routes, geometry ? data.routes.findIndex((r: RouteOption) => r.geometry === geometry) : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch routes')
    } finally {
      setIsLoading(false)
    }
  }, [startLocation, endLocation, geometry, drawRoutes])

  // Check if we can fetch routes
  const canFetchRoutes =
    startLocation?.coordinates?.latitude &&
    startLocation?.coordinates?.longitude &&
    endLocation?.coordinates?.latitude &&
    endLocation?.coordinates?.longitude

  return (
    <div className="field-type ui" style={{ marginBottom: '24px' }}>
      <label
        className="field-label"
        style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Route size={18} />
        Route Selector
      </label>

      <p
        style={{
          fontSize: '12px',
          color: 'var(--theme-elevation-500)',
          marginBottom: '12px',
        }}
      >
        Click &quot;Fetch Routes&quot; to see available route options, then click on a route to
        select it. The selected route will be displayed on the activity page.
      </p>

      {/* Location info */}
      {startLocation && endLocation && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
            padding: '10px 14px',
            backgroundColor: 'var(--theme-elevation-50)',
            borderRadius: '6px',
            border: '1px solid var(--theme-elevation-100)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>{startLocation.name}</span>
          </div>
          <span style={{ color: 'var(--theme-elevation-400)' }}>→</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>{endLocation.name}</span>
          </div>
        </div>
      )}

      {/* Fetch button */}
      <button
        type="button"
        onClick={fetchRoutes}
        disabled={isLoading || !canFetchRoutes}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: canFetchRoutes ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-200)',
          color: canFetchRoutes ? 'white' : 'var(--theme-elevation-500)',
          border: 'none',
          borderRadius: '6px',
          cursor: canFetchRoutes ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: 500,
          marginBottom: '12px',
        }}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            Fetching Routes...
          </>
        ) : (
          <>
            <RefreshCw size={16} />
            Fetch Routes
          </>
        )}
      </button>

      {!canFetchRoutes && (
        <p
          style={{
            fontSize: '12px',
            color: 'var(--theme-warning-500)',
            marginBottom: '12px',
          }}
        >
          Please select start and end locations with coordinates to fetch routes.
        </p>
      )}

      {error && (
        <p
          style={{
            fontSize: '12px',
            color: 'var(--theme-error-500)',
            marginBottom: '12px',
            padding: '10px',
            backgroundColor: 'var(--theme-error-50)',
            borderRadius: '4px',
          }}
        >
          {error}
        </p>
      )}

      {/* Map container */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '400px',
          borderRadius: '8px',
          border: '1px solid var(--theme-elevation-150)',
          overflow: 'hidden',
          backgroundColor: 'var(--theme-elevation-100)',
          marginBottom: '12px',
        }}
      />

      {/* Route options list */}
      {routes.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '8px',
              color: 'var(--theme-elevation-800)',
            }}
          >
            Available Routes ({routes.length}):
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {routes.map((route, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectRoute(route, idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor:
                    selectedIndex === idx
                      ? 'var(--theme-success-50)'
                      : 'var(--theme-elevation-50)',
                  border:
                    selectedIndex === idx
                      ? '2px solid var(--theme-success-500)'
                      : '1px solid var(--theme-elevation-150)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: ROUTE_COLORS[idx] || '#666',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>
                      {route.summary || `Route ${idx + 1}`}
                    </p>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--theme-elevation-500)',
                        margin: 0,
                      }}
                    >
                      {formatDistance(route.distance)} · {formatDuration(route.duration)}
                    </p>
                  </div>
                </div>
                {selectedIndex === idx && (
                  <Check size={20} style={{ color: 'var(--theme-success-500)' }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected route info */}
      {geometry && selectedIndex !== null && routes[selectedIndex] && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px 14px',
            backgroundColor: 'var(--theme-success-50)',
            borderRadius: '6px',
            border: '1px solid var(--theme-success-200)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} style={{ color: 'var(--theme-success-500)' }} />
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--theme-success-700)' }}>
              Route {selectedIndex + 1} selected - This route will be shown to visitors
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default RouteSelectorField
