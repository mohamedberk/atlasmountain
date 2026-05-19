'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom marker icon with brand color
const customMarkerIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #ff2828 0%, #d11f1f 100%);
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 16px rgba(255, 40, 40, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
})

interface ActivityLocationMapProps {
  latitude: number
  longitude: number
  locationName: string
  activityTitle?: string
  className?: string
}

// Component to handle initial bounds
function MapBounds({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap()
  const hasSetBounds = useRef(false)

  useEffect(() => {
    if (!hasSetBounds.current) {
      map.setView([latitude, longitude], 13)
      hasSetBounds.current = true
    }
  }, [latitude, longitude, map])

  return null
}

export function ActivityLocationMap({
  latitude,
  longitude,
  locationName,
  activityTitle,
  className = '',
}: ActivityLocationMapProps) {
  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-[300px] z-0"
        style={{ cursor: 'grab' }}
      >
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=fr&gl=MA"
        />
        <MapBounds latitude={latitude} longitude={longitude} />
        <Marker position={[latitude, longitude]} icon={customMarkerIcon}>
          <Popup>
            <div className="text-center p-1">
              <p className="font-semibold text-neutral-900">{locationName}</p>
              {activityTitle && (
                <p className="text-xs text-neutral-500 mt-1">{activityTitle}</p>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Directions link overlay */}
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-primary font-medium text-sm px-4 py-2 rounded-lg shadow-sm hover:bg-white hover:shadow-md transition-all flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
        Get Directions
      </a>
    </div>
  )
}

export default ActivityLocationMap
