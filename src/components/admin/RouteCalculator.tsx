'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useField } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { Route, Loader2, Check, RefreshCw, MapPin } from 'lucide-react'

interface Waypoint {
  name: string
  coordinates?: {
    latitude?: number
    longitude?: number
  }
}

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

export const RouteCalculatorField: UIFieldClientComponent = () => {
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
  const { value: waypoints } = useField<Waypoint[]>({
    path: 'route.waypoints',
  })

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Map refs
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null)
  const polylineRef = useRef<L.Polyline | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  // Get valid waypoints with coordinates
  const waypointsArray = Array.isArray(waypoints) ? waypoints : []
  const validWaypoints = waypointsArray.filter(
    (wp) => wp && wp.coordinates?.latitude && wp.coordinates?.longitude
  )

  // Load Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return

      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

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

  // Draw waypoint markers
  const drawMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !leafletRef.current || !mapLoaded) return

    const L = leafletRef.current.default

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Add markers for each waypoint
    validWaypoints.forEach((wp, index) => {
      if (!wp.coordinates?.latitude || !wp.coordinates?.longitude) return

      const isFirst = index === 0
      const isLast = index === validWaypoints.length - 1

      const color = isFirst ? '#171717' : isLast ? '#ff2828' : '#737373'

      const icon = L.divIcon({
        className: 'waypoint-marker',
        html: `<div style="
          width: 28px;
          height: 28px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">${index + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      const marker = L.marker([wp.coordinates.latitude, wp.coordinates.longitude], { icon })
        .bindPopup(`<strong>${index + 1}. ${wp.name || 'Waypoint'}</strong>`)
        .addTo(mapInstanceRef.current)

      markersRef.current.push(marker)
    })

    // Fit bounds to markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current)
      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [30, 30] })
    }
  }, [validWaypoints, mapLoaded])

  // Draw route polyline
  const drawRoute = useCallback(
    (encodedGeometry: string) => {
      if (!mapInstanceRef.current || !leafletRef.current || !mapLoaded) return

      const L = leafletRef.current.default

      // Clear existing polyline
      if (polylineRef.current) {
        polylineRef.current.remove()
        polylineRef.current = null
      }

      const coords = decodePolyline(encodedGeometry)

      polylineRef.current = L.polyline(coords, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.8,
      }).addTo(mapInstanceRef.current)

      // Fit bounds to route
      if (polylineRef.current) {
        mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [30, 30] })
      }
    },
    [mapLoaded]
  )

  // Update markers when waypoints change
  useEffect(() => {
    drawMarkers()
  }, [drawMarkers])

  // Draw existing route on load
  useEffect(() => {
    if (geometry && mapLoaded) {
      drawRoute(geometry)
    }
  }, [geometry, mapLoaded, drawRoute])

  // Calculate route
  const calculateRoute = useCallback(async () => {
    if (validWaypoints.length < 2) {
      setError('At least 2 waypoints with coordinates are required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Build waypoints string: lat1,lng1|lat2,lng2|lat3,lng3
      const waypointsStr = validWaypoints
        .map((wp) => `${wp.coordinates!.latitude},${wp.coordinates!.longitude}`)
        .join('|')

      const response = await fetch(`/api/routes/osrm?waypoints=${encodeURIComponent(waypointsStr)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate route')
      }

      // Store route data
      setGeometry(data.geometry)
      setDistance(data.distance)
      setDuration(data.duration)

      setRouteInfo({ distance: data.distance, duration: data.duration })

      // Draw the route
      drawRoute(data.geometry)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate route')
    } finally {
      setIsLoading(false)
    }
  }, [validWaypoints, setGeometry, setDistance, setDuration, drawRoute])

  const hasValidRoute = geometry && routeInfo

  return (
    <div className="field-type ui" style={{ marginBottom: '24px' }}>
      <label
        className="field-label"
        style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Route size={18} />
        Route Calculator
      </label>

      <p
        style={{
          fontSize: '12px',
          color: 'var(--theme-elevation-500)',
          marginBottom: '12px',
        }}
      >
        Click &quot;Calculate Route&quot; to compute the driving route through all waypoints.
      </p>

      {/* Waypoints summary */}
      {validWaypoints.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            padding: '10px 14px',
            backgroundColor: 'var(--theme-elevation-50)',
            borderRadius: '6px',
            fontSize: '13px',
          }}
        >
          {validWaypoints.map((wp, idx) => (
            <React.Fragment key={idx}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor:
                      idx === 0 ? '#171717' : idx === validWaypoints.length - 1 ? '#ff2828' : '#737373',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                >
                  {idx + 1}
                </div>
                <span style={{ fontWeight: 500 }}>{wp.name || 'Waypoint'}</span>
              </div>
              {idx < validWaypoints.length - 1 && (
                <span style={{ color: 'var(--theme-elevation-400)' }}>→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Calculate button */}
      <button
        type="button"
        onClick={calculateRoute}
        disabled={isLoading || validWaypoints.length < 2}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor:
            validWaypoints.length >= 2 ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-200)',
          color: validWaypoints.length >= 2 ? 'white' : 'var(--theme-elevation-500)',
          border: 'none',
          borderRadius: '6px',
          cursor: validWaypoints.length >= 2 ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: 500,
          marginBottom: '12px',
        }}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            Calculating...
          </>
        ) : (
          <>
            <RefreshCw size={16} />
            Calculate Route
          </>
        )}
      </button>

      {validWaypoints.length < 2 && (
        <p
          style={{
            fontSize: '12px',
            color: 'var(--theme-warning-500)',
            marginBottom: '12px',
          }}
        >
          Add at least 2 waypoints with coordinates to calculate a route.
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

      {/* Map preview */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '350px',
          borderRadius: '8px',
          border: '1px solid var(--theme-elevation-150)',
          overflow: 'hidden',
          backgroundColor: 'var(--theme-elevation-100)',
          marginBottom: '12px',
        }}
      />

      {/* Route info */}
      {hasValidRoute && (
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--theme-success-50)',
            borderRadius: '6px',
            border: '1px solid var(--theme-success-200)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Check size={16} style={{ color: 'var(--theme-success-500)' }} />
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--theme-success-700)' }}>
              Route calculated successfully
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
            <span>
              <strong>Distance:</strong> {formatDistance(routeInfo.distance)}
            </span>
            <span>
              <strong>Duration:</strong> {formatDuration(routeInfo.duration)}
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

export default RouteCalculatorField
