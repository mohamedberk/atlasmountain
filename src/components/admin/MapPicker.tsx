'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useField } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { Search, MapPin, Loader2, X } from 'lucide-react'

// Nominatim search result type
interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
  importance: number
}

// Debounce hook
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

export const MapPickerField: UIFieldClientComponent = () => {
  const { value: lat, setValue: setLat } = useField<number>({ path: 'coordinates.latitude' })
  const { value: lng, setValue: setLng } = useField<number>({ path: 'coordinates.longitude' })

  const [search, setSearch] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null)

  const debouncedSearch = useDebounce(search, 500)

  // Load Leaflet dynamically (client-side only)
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return

      // Import Leaflet CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      // Wait for CSS to load
      await new Promise(resolve => setTimeout(resolve, 100))

      // Import Leaflet
      const leafletModule = await import('leaflet')
      const L = leafletModule.default
      leafletRef.current = leafletModule

      // Fix default marker icons
      delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!mapRef.current || mapInstanceRef.current) return

      // Default to Marrakech if no coordinates
      const defaultLat = lat ?? 31.6295
      const defaultLng = lng ?? -7.9811

      const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 12)

      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=fr&gl=MA', {
        attribution: '&copy; Google Maps'
      }).addTo(map)

      // Add marker if coordinates exist
      if (lat && lng) {
        markerRef.current = L.marker([lat, lng]).addTo(map)
      }

      // Click handler to set coordinates
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat: clickLat, lng: clickLng } = e.latlng

        // Update form fields
        setLat(clickLat)
        setLng(clickLng)

        // Update or create marker
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

  // Update marker when coordinates change externally
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !leafletRef.current) return

    const L = leafletRef.current.default

    if (lat && lng) {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current)
      }
    }
  }, [lat, lng, mapLoaded])

  // Search for places using Nominatim
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 3) {
      setResults([])
      return
    }

    const searchPlaces = async () => {
      setIsSearching(true)
      setError(null)

      try {
        // Bias search to Morocco
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            debouncedSearch
          )}&countrycodes=ma&limit=5`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          }
        )

        if (!response.ok) throw new Error('Search failed')

        const data: NominatimResult[] = await response.json()
        setResults(data)
      } catch (err) {
        setError('Failed to search locations')
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }

    searchPlaces()
  }, [debouncedSearch])

  const handleSelectPlace = useCallback((result: NominatimResult) => {
    const newLat = parseFloat(result.lat)
    const newLng = parseFloat(result.lon)

    // Update form fields
    setLat(newLat)
    setLng(newLng)

    // Update map view and marker
    if (mapInstanceRef.current && leafletRef.current) {
      mapInstanceRef.current.setView([newLat, newLng], 15)

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
  }, [setLat, setLng])

  const handleClearCoordinates = useCallback(() => {
    setLat(null as unknown as number)
    setLng(null as unknown as number)

    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current)
      markerRef.current = null
    }
  }, [setLat, setLng])

  return (
    <div className="field-type ui" style={{ marginBottom: '24px' }}>
      <label className="field-label" style={{ marginBottom: '8px', display: 'block' }}>
        Location Map Picker
      </label>

      <p style={{ fontSize: '12px', color: 'var(--theme-elevation-500)', marginBottom: '12px' }}>
        Search for a location or click on the map to set coordinates. The latitude and longitude fields below will be updated automatically.
      </p>

      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--theme-elevation-400)'
            }}
          />
          <input
            type="text"
            placeholder="Search for a location in Morocco..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            style={{
              width: '100%',
              padding: '10px 40px 10px 40px',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: 'var(--theme-elevation-50)'
            }}
          />
          {isSearching && (
            <Loader2
              size={16}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                animation: 'spin 1s linear infinite'
              }}
            />
          )}
        </div>

        {/* Search results dropdown */}
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
              maxHeight: '250px',
              overflowY: 'auto'
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
                  gap: '10px',
                  width: '100%',
                  padding: '10px 12px',
                  border: 'none',
                  borderBottom: '1px solid var(--theme-elevation-100)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-elevation-50)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--theme-elevation-500)' }} />
                <span style={{ fontSize: '13px', lineHeight: '1.4' }}>
                  {result.display_name}
                </span>
              </button>
            ))}
          </div>
        )}

        {error && (
          <p style={{ fontSize: '12px', color: 'var(--theme-error-500)', marginTop: '4px' }}>
            {error}
          </p>
        )}
      </div>

      {/* Map container */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '300px',
          borderRadius: '8px',
          border: '1px solid var(--theme-elevation-150)',
          overflow: 'hidden',
          backgroundColor: 'var(--theme-elevation-100)'
        }}
      />

      {/* Current coordinates display */}
      {lat && lng && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
            padding: '10px 14px',
            backgroundColor: 'var(--theme-elevation-50)',
            borderRadius: '4px',
            border: '1px solid var(--theme-elevation-100)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} style={{ color: 'var(--theme-success-500)' }} />
            <span style={{ fontSize: '13px' }}>
              <strong>Lat:</strong> {lat.toFixed(6)} | <strong>Lng:</strong> {lng.toFixed(6)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearCoordinates}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              border: 'none',
              backgroundColor: 'var(--theme-elevation-200)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            <X size={14} />
            Clear
          </button>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isOpen && results.length > 0 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999
          }}
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

export default MapPickerField
