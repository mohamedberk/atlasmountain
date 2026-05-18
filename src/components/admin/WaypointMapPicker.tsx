'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useField, useRowLabel } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { Search, MapPin, Loader2, X } from 'lucide-react'

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const WaypointMapPickerField: UIFieldClientComponent = ({ path }) => {
  // Get the parent path (remove 'waypointMapPicker' to get the array item path)
  const parentPath = path?.replace(/\.waypointMapPicker$/, '') || ''

  // Access sibling fields within this array item using full paths
  const { value: lat, setValue: setLat } = useField<number>({ path: `${parentPath}.coordinates.latitude` })
  const { value: lng, setValue: setLng } = useField<number>({ path: `${parentPath}.coordinates.longitude` })
  const { value: name, setValue: setName } = useField<string>({ path: `${parentPath}.name` })

  const [search, setSearch] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null)

  const debouncedSearch = useDebounce(search, 500)

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return

      // Check if CSS already loaded
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

      // Default to Morocco center or existing coordinates
      const defaultLat = lat ?? 31.6295
      const defaultLng = lng ?? -7.9811

      const map = L.map(mapRef.current).setView([defaultLat, defaultLng], lat && lng ? 12 : 6)

      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=fr&gl=MA', {
        attribution: '&copy; Google Maps',
      }).addTo(map)

      // Add marker if coordinates exist
      if (lat && lng) {
        markerRef.current = L.marker([lat, lng]).addTo(map)
      }

      // Click handler
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat: clickLat, lng: clickLng } = e.latlng

        setLat(clickLat)
        setLng(clickLng)

        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng])
        } else {
          markerRef.current = L.marker([clickLat, clickLng]).addTo(map)
        }
      })

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

  // Update marker when coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !leafletRef.current) return

    const L = leafletRef.current.default

    if (lat && lng) {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current)
      }
      mapInstanceRef.current.setView([lat, lng], 12)
    }
  }, [lat, lng, mapLoaded])

  // Search places
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 3) {
      setResults([])
      return
    }

    const searchPlaces = async () => {
      setIsSearching(true)

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            debouncedSearch
          )}&countrycodes=ma&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        )

        if (!response.ok) throw new Error('Search failed')

        const data: NominatimResult[] = await response.json()
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }

    searchPlaces()
  }, [debouncedSearch])

  const handleSelectPlace = useCallback(
    (result: NominatimResult) => {
      const newLat = parseFloat(result.lat)
      const newLng = parseFloat(result.lon)

      setLat(newLat)
      setLng(newLng)

      // Also update the name field with the place name
      const shortName = result.display_name.split(',')[0]
      if (!name) {
        setName(shortName)
      }

      if (mapInstanceRef.current && leafletRef.current) {
        mapInstanceRef.current.setView([newLat, newLng], 12)

        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng])
        } else {
          const L = leafletRef.current.default
          markerRef.current = L.marker([newLat, newLng]).addTo(mapInstanceRef.current)
        }
      }

      setSearch('')
      setResults([])
      setIsOpen(false)
    },
    [setLat, setLng, setName, name]
  )

  const handleClear = useCallback(() => {
    setLat(null as unknown as number)
    setLng(null as unknown as number)

    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current)
      markerRef.current = null
    }
  }, [setLat, setLng])

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: '8px' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--theme-elevation-400)',
            }}
          />
          <input
            type="text"
            placeholder="Search location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            style={{
              width: '100%',
              padding: '8px 32px 8px 32px',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              fontSize: '13px',
              backgroundColor: 'var(--theme-elevation-50)',
            }}
          />
          {isSearching && (
            <Loader2
              size={14}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                animation: 'spin 1s linear infinite',
              }}
            />
          )}
        </div>

        {/* Search results */}
        {isOpen && results.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              backgroundColor: 'var(--theme-elevation-0)',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {results.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => handleSelectPlace(result)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 10px',
                  border: 'none',
                  borderBottom: '1px solid var(--theme-elevation-100)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '12px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-elevation-50)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ lineHeight: '1.3' }}>{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mini map */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '180px',
          borderRadius: '6px',
          border: '1px solid var(--theme-elevation-150)',
          overflow: 'hidden',
          backgroundColor: 'var(--theme-elevation-100)',
        }}
      />

      {/* Coordinates display */}
      {lat && lng && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
            padding: '6px 10px',
            backgroundColor: 'var(--theme-elevation-50)',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} style={{ color: 'var(--theme-success-500)' }} />
            <span>
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              border: 'none',
              backgroundColor: 'var(--theme-elevation-200)',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            <X size={12} />
            Clear
          </button>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && results.length > 0 && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 999 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to { transform: translateY(-50%) rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default WaypointMapPickerField
