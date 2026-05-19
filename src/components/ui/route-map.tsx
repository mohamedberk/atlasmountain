'use client'

import { useMemo, useEffect, useRef, useState } from 'react'
import { decodePolyline } from '@/lib/polyline'

interface Waypoint {
  lat: number
  lng: number
  name: string
}

interface RouteMapProps {
  waypoints: Waypoint[] // Array of waypoints (minimum 2)
  routeColor?: string
  className?: string
  geometry?: string // OSRM encoded polyline for actual road route
}

export function RouteMap({
  waypoints,
  routeColor = 'blue',
  className = '',
  geometry: initialGeometry,
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const polylineWhiteRef = useRef<L.Polyline | null>(null)
  const polylineColorRef = useRef<L.Polyline | null>(null)
  const [routeGeometry, setRouteGeometry] = useState<string | undefined>(initialGeometry)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)

  // Build Google Maps directions URL (for "Open in Google Maps" link)
  const googleMapsDirectionsUrl = useMemo(() => {
    if (waypoints.length < 2) return '#'
    const coords = waypoints.map((wp) => `${wp.lat},${wp.lng}`).join('/')
    return `https://www.google.com/maps/dir/${coords}`
  }, [waypoints])

  // Get route color hex
  const routeColorHex = useMemo(() => {
    const colors: Record<string, string> = {
      blue: '#4285F4', // Google Maps blue
      red: '#EA4335',
      green: '#34A853',
      orange: '#FBBC04',
      purple: '#9334E6',
    }
    return colors[routeColor] || colors.blue
  }, [routeColor])

  // Fetch route from OSRM if no geometry provided
  useEffect(() => {
    if (initialGeometry || waypoints.length < 2) return

    const fetchRoute = async () => {
      setIsLoadingRoute(true)
      try {
        // Build waypoints string for OSRM: lat1,lng1|lat2,lng2|...
        const waypointsStr = waypoints
          .map((wp) => `${wp.lat},${wp.lng}`)
          .join('|')

        const response = await fetch(`/api/routes/osrm?waypoints=${encodeURIComponent(waypointsStr)}`)

        if (response.ok) {
          const data = await response.json()
          if (data.geometry) {
            setRouteGeometry(data.geometry)
          }
        }
      } catch (error) {
        console.error('Failed to fetch route:', error)
      } finally {
        setIsLoadingRoute(false)
      }
    }

    fetchRoute()
  }, [waypoints, initialGeometry])

  // Load Leaflet and initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || waypoints.length < 2) return

    const loadMap = async () => {
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      await new Promise((resolve) => setTimeout(resolve, 100))

      const L = (await import('leaflet')).default

      if (!mapRef.current || mapInstanceRef.current) return

      // Calculate center and bounds
      const lats = waypoints.map((wp) => wp.lat)
      const lngs = waypoints.map((wp) => wp.lng)
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2

      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([centerLat, centerLng], 7)

      // Use Google Maps tiles for authentic look
      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=fr&gl=MA', {
        attribution: '&copy; Google Maps',
        maxZoom: 20,
      }).addTo(map)

      // Add professional Google Maps style markers for each waypoint
      waypoints.forEach((wp, idx) => {
        const isFirst = idx === 0
        const isLast = idx === waypoints.length - 1

        // Google Maps style colors: green=start, red=end, blue=intermediate
        const markerColor = isFirst ? '#34A853' : isLast ? '#EA4335' : '#4285F4'
        const label = String.fromCharCode(65 + idx) // A, B, C, D...

        // Google Maps style pin marker
        const icon = L.divIcon({
          className: 'gmap-marker',
          html: `<div style="
            position: relative;
            width: 27px;
            height: 43px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="27" height="43" viewBox="0 0 27 43">
              <path fill="${markerColor}" d="M13.5 0C6.044 0 0 6.044 0 13.5 0 23.625 13.5 43 13.5 43S27 23.625 27 13.5C27 6.044 20.956 0 13.5 0z"/>
              <circle fill="white" cx="13.5" cy="13.5" r="5.5"/>
            </svg>
            <span style="
              position: absolute;
              top: 7px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 11px;
              font-weight: 600;
              color: white;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">${label}</span>
          </div>`,
          iconSize: [27, 43],
          iconAnchor: [13.5, 43],
          popupAnchor: [0, -43],
        })

        L.marker([wp.lat, wp.lng], { icon })
          .addTo(map)
          .bindPopup(`<strong>${label}. ${wp.name}</strong>`)
      })

      // Draw initial route (straight lines as placeholder if no geometry yet)
      let routeCoords: [number, number][]

      if (routeGeometry) {
        routeCoords = decodePolyline(routeGeometry)
      } else {
        routeCoords = waypoints.map((wp) => [wp.lat, wp.lng] as [number, number])
      }

      // Draw route with Google Maps style (colored line with white border)
      polylineWhiteRef.current = L.polyline(routeCoords, {
        color: 'white',
        weight: 8,
        opacity: 1,
      }).addTo(map)

      polylineColorRef.current = L.polyline(routeCoords, {
        color: routeColorHex,
        weight: 5,
        opacity: 1,
      }).addTo(map)

      // Fit bounds to show the entire route
      const bounds = L.latLngBounds(routeCoords)
      map.fitBounds(bounds, { padding: [40, 40] })

      mapInstanceRef.current = map
    }

    loadMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        polylineWhiteRef.current = null
        polylineColorRef.current = null
      }
    }
  }, [waypoints, routeColorHex])

  // Update route polyline when geometry changes (after OSRM fetch)
  useEffect(() => {
    if (!mapInstanceRef.current || !routeGeometry) return

    const routeCoords = decodePolyline(routeGeometry)

    // Update polylines with actual road route
    if (polylineWhiteRef.current && polylineColorRef.current) {
      polylineWhiteRef.current.setLatLngs(routeCoords)
      polylineColorRef.current.setLatLngs(routeCoords)

      // Fit bounds to the new route
      const L = (window as any).L
      if (L) {
        const bounds = L.latLngBounds(routeCoords)
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] })
      }
    }
  }, [routeGeometry])

  // Not enough waypoints
  if (waypoints.length < 2) {
    return (
      <div
        className={`w-full h-[400px] bg-neutral-100 rounded-xl flex items-center justify-center ${className}`}
      >
        <span className="text-neutral-400">Route requires at least 2 waypoints</span>
      </div>
    )
  }

  return (
    <div className={`relative rounded-xl overflow-hidden z-0 ${className}`}>
      {/* Leaflet Map with Google Maps tiles */}
      <div ref={mapRef} className="w-full h-[400px] z-0" />

      {/* Loading indicator */}
      {isLoadingRoute && (
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
          <span className="text-sm text-neutral-600">Loading route...</span>
        </div>
      )}

      {/* Route info overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md border border-neutral-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Waypoints summary */}
            <div className="flex items-center gap-2 flex-wrap">
              {waypoints.map((wp, idx) => {
                const isFirst = idx === 0
                const isLast = idx === waypoints.length - 1
                const markerColor = isFirst ? '#34A853' : isLast ? '#EA4335' : '#4285F4'
                const label = String.fromCharCode(65 + idx) // A, B, C...

                return (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: markerColor }}
                    >
                      {label}
                    </div>
                    <span className="text-sm font-medium text-neutral-900">{wp.name}</span>
                    {idx < waypoints.length - 1 && (
                      <svg
                        className="w-4 h-4 text-neutral-300 mx-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </div>
                )
              })}
            </div>

            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C7.802 0 4 3.403 4 7.602 4 11.8 7.469 16.812 12 24c4.531-7.188 8-12.2 8-16.398C20 3.403 16.199 0 12 0zm0 11a3 3 0 110-6 3 3 0 010 6z"/>
              </svg>
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RouteMap
