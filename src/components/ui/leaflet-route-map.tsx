'use client'

import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { decodePolyline, formatDistance, formatDuration } from '@/lib/polyline'

// Route color mapping
const ROUTE_COLORS: Record<string, string> = {
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  orange: '#f97316',
  purple: '#a855f7',
}

interface Waypoint {
  lat: number
  lng: number
  name: string
}

interface LeafletRouteMapProps {
  waypoints: Waypoint[] // Array of waypoints (minimum 2)
  geometry: string // Encoded polyline
  distance?: number // meters
  duration?: number // seconds
  routeColor?: string
  className?: string
}

// Create numbered marker icon
function createWaypointIcon(index: number, total: number): L.DivIcon {
  const isFirst = index === 0
  const isLast = index === total - 1
  const color = isFirst ? '#22c55e' : isLast ? '#ef4444' : '#3b82f6'

  return new L.DivIcon({
    className: 'custom-waypoint-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
      ">${index + 1}</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

// Component to fit map bounds to route
function FitBoundsToRoute({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [coordinates, map])

  return null
}

export function LeafletRouteMap({
  waypoints,
  geometry,
  distance,
  duration,
  routeColor = 'blue',
  className = '',
}: LeafletRouteMapProps) {
  // Decode polyline to coordinates
  const coordinates = useMemo(() => decodePolyline(geometry), [geometry])

  // Get route color
  const color = ROUTE_COLORS[routeColor] || ROUTE_COLORS.blue

  // Calculate center for initial view
  const center = useMemo((): [number, number] => {
    if (coordinates.length > 0) {
      const midIndex = Math.floor(coordinates.length / 2)
      return coordinates[midIndex]
    }
    if (waypoints.length > 0) {
      const midWp = waypoints[Math.floor(waypoints.length / 2)]
      return [midWp.lat, midWp.lng]
    }
    return [31.5, -6.5] // Morocco center fallback
  }, [coordinates, waypoints])

  // Build Google Maps directions URL with all waypoints
  const googleMapsUrl = useMemo(() => {
    if (waypoints.length < 2) return '#'
    const coords = waypoints.map((wp) => `${wp.lat},${wp.lng}`).join('/')
    return `https://www.google.com/maps/dir/${coords}`
  }, [waypoints])

  // Build route description (e.g., "Marrakech → Ait Benhaddou → Merzouga")
  const routeDescription = waypoints.map((wp) => wp.name).join(' → ')

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <MapContainer
        center={center}
        zoom={8}
        scrollWheelZoom={false}
        className="w-full h-[400px] z-0"
        style={{ cursor: 'grab' }}
      >
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=fr&gl=MA"
        />

        <FitBoundsToRoute coordinates={coordinates} />

        {/* Route polyline */}
        <Polyline
          positions={coordinates}
          pathOptions={{
            color: color,
            weight: 5,
            opacity: 0.8,
          }}
        />

        {/* Waypoint markers */}
        {waypoints.map((waypoint, index) => (
          <Marker
            key={index}
            position={[waypoint.lat, waypoint.lng]}
            icon={createWaypointIcon(index, waypoints.length)}
          >
            <Popup>
              <div className="text-center p-1">
                <p className="font-semibold text-neutral-900">
                  {index + 1}. {waypoint.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {index === 0
                    ? 'Starting Point'
                    : index === waypoints.length - 1
                      ? 'Destination'
                      : 'Stop'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Route info overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md border border-neutral-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Waypoints summary */}
            <div className="flex items-center gap-2 flex-wrap">
              {waypoints.map((wp, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{
                      backgroundColor:
                        idx === 0 ? '#22c55e' : idx === waypoints.length - 1 ? '#ef4444' : '#3b82f6',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-sm font-medium text-neutral-900">{wp.name}</span>
                  {idx < waypoints.length - 1 && (
                    <svg
                      className="w-4 h-4 text-neutral-400 mx-1"
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
              ))}
            </div>

            <div className="flex items-center gap-4">
              {/* Distance and duration */}
              {(distance || duration) && (
                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  {distance && (
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                      {formatDistance(distance)}
                    </span>
                  )}
                  {duration && (
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {formatDuration(duration)}
                    </span>
                  )}
                </div>
              )}

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeafletRouteMap
