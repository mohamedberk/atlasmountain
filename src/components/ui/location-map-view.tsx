'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon in Leaflet with Next.js
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Custom marker icon with brand color
const customMarkerIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #ff2828;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(255, 40, 40, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

interface MapComponentProps {
  center: [number, number]
  markerPosition: [number, number] | null
  onMapClick: (lat: number, lon: number) => void
  disabled?: boolean
}

// Component to handle map center changes
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  const prevCenterRef = useRef(center)

  useEffect(() => {
    // Only animate if center actually changed
    if (
      prevCenterRef.current[0] !== center[0] ||
      prevCenterRef.current[1] !== center[1]
    ) {
      map.flyTo(center, 15, { duration: 0.5 })
      prevCenterRef.current = center
    }
  }, [center, map])

  return null
}

// Component to handle map click events
function MapClickHandler({
  onMapClick,
  disabled,
}: {
  onMapClick: (lat: number, lon: number) => void
  disabled?: boolean
}) {
  useMapEvents({
    click: (e) => {
      if (!disabled) {
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

export default function LocationMapView({
  center,
  markerPosition,
  onMapClick,
  disabled = false,
}: MapComponentProps) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      className="w-full h-[200px] z-0"
      style={{ cursor: disabled ? 'not-allowed' : 'crosshair' }}
    >
      <TileLayer
        attribution='&copy; Google Maps'
        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=fr&gl=MA"
      />
      <MapCenterUpdater center={center} />
      <MapClickHandler onMapClick={onMapClick} disabled={disabled} />
      {markerPosition && (
        <Marker position={markerPosition} icon={customMarkerIcon} />
      )}
    </MapContainer>
  )
}
