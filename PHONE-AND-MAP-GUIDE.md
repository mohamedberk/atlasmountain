# How to Build: Phone Number Input + Pickup Location Map Picker

A complete guide to recreate the **Phone Number** input with international country selector and the **Pickup Location Map** with search, autocomplete, popular locations, and click-to-pin — exactly as used in the Dream Tours Morocco checkout flow (Step 2: "Your Details").

---

## Table of Contents

1. [Prerequisites & Dependencies](#1-prerequisites--dependencies)
2. [File Structure](#2-file-structure)
3. [useDebounce Hook](#3-usedebounce-hook)
4. [Phone Number Input Component](#4-phone-number-input-component)
5. [Location Map View Component (Leaflet)](#5-location-map-view-component-leaflet)
6. [Location Map Picker Component (Full Feature)](#6-location-map-picker-component-full-feature)
7. [Using Both in a Form](#7-using-both-in-a-form)
8. [How It All Works Together](#8-how-it-all-works-together)

---

## 1. Prerequisites & Dependencies

Install these npm packages:

```bash
npm install react-international-phone leaflet react-leaflet
npm install -D @types/leaflet
```

| Package | Purpose |
|---|---|
| `react-international-phone` | Phone input with country code selector, flag icons, dial codes |
| `leaflet` | Open-source interactive map library |
| `react-leaflet` | React bindings for Leaflet |
| `@types/leaflet` | TypeScript types for Leaflet |

**No API keys required.** The map uses free Google Maps tile layer and the geocoding uses the free [Photon API](https://photon.komoot.io/) (OpenStreetMap-based, no auth needed).

---

## 2. File Structure

Create these files in your project:

```
src/
├── hooks/
│   └── useDebounce.ts                  # Generic debounce hook
├── components/
│   └── ui/
│       ├── phone-input.tsx             # Phone number input component
│       ├── location-map-picker.tsx      # Full location picker (search + map)
│       └── location-map-view.tsx        # Leaflet map (dynamically imported)
└── app/
    └── your-page/
        └── your-form.tsx               # Your form that uses both components
```

---

## 3. useDebounce Hook

**File: `src/hooks/useDebounce.ts`**

This hook delays updating a value until the user stops typing — used to avoid spamming the geocoding API on every keystroke.

```tsx
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
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
```

---

## 4. Phone Number Input Component

**File: `src/components/ui/phone-input.tsx`**

This wraps `react-international-phone` with custom styling to match a rounded, modern checkout form design. It provides:
- Country flag selector with dropdown
- Auto-formatted phone number based on selected country
- Default country set to Morocco (`"ma"`) — change this to your target country

```tsx
'use client'

import { PhoneInput as ReactPhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function PhoneInput({ value, onChange, placeholder }: PhoneInputProps) {
  return (
    <div className="phone-input-wrapper">
      <ReactPhoneInput
        defaultCountry="ma"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputStyle={{
          width: '100%',
          height: '48px',
          fontSize: '16px',
          borderRadius: '0 12px 12px 0',
          border: '1px solid #d4d4d4',
          borderLeft: 'none',
          paddingLeft: '12px',
          outline: 'none',
        }}
        countrySelectorStyleProps={{
          buttonStyle: {
            height: '48px',
            borderRadius: '12px 0 0 12px',
            border: '1px solid #d4d4d4',
            borderRight: 'none',
            paddingLeft: '12px',
            paddingRight: '8px',
            minWidth: '80px',
          },
        }}
      />
      <style jsx global>{`
        .phone-input-wrapper .react-international-phone-input-container {
          width: 100%;
          display: flex;
          align-items: center;
        }
        .phone-input-wrapper .react-international-phone-input {
          width: 100% !important;
          transition: all 0.2s;
        }
        .phone-input-wrapper .react-international-phone-input:focus {
          border-color: var(--color-primary, #22c55e) !important;
          box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2) !important;
        }
        .phone-input-wrapper .react-international-phone-country-selector-button {
          transition: all 0.2s;
        }
        .phone-input-wrapper .react-international-phone-country-selector-button:focus,
        .phone-input-wrapper .react-international-phone-country-selector-button:hover {
          border-color: var(--color-primary, #22c55e) !important;
        }
        .phone-input-wrapper .react-international-phone-country-selector-dropdown {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border: 1px solid #e5e5e5;
          max-height: 300px;
        }
        .phone-input-wrapper .react-international-phone-country-selector-dropdown__list-item {
          padding: 10px 12px;
        }
        .phone-input-wrapper .react-international-phone-country-selector-dropdown__list-item:hover {
          background-color: #f5f5f5;
        }
        .phone-input-wrapper .react-international-phone-country-selector-dropdown__list-item--selected {
          background-color: rgba(34, 197, 94, 0.1);
        }
      `}</style>
    </div>
  )
}
```

### Customization Notes

- **Change default country:** Replace `defaultCountry="ma"` with any ISO 3166-1 alpha-2 code (`"us"`, `"fr"`, `"gb"`, etc.)
- **Change focus color:** Replace `#22c55e` (green-500) and `rgba(34, 197, 94, ...)` with your brand color
- **Change border radius:** Modify `borderRadius` values in both `inputStyle` and `countrySelectorStyleProps.buttonStyle`
- **Change height:** Modify `height: '48px'` in both style objects

---

## 5. Location Map View Component (Leaflet)

**File: `src/components/ui/location-map-view.tsx`**

This is the raw Leaflet map. It's dynamically imported (no SSR) from the picker component because Leaflet requires the `window` object.

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom teardrop marker with your brand color
const customMarkerIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #C75B12;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(199, 91, 18, 0.4);
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

// Smoothly pans/zooms map when center prop changes
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  const prevCenterRef = useRef(center)

  useEffect(() => {
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

// Captures click events on the map
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
        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
      />
      <MapCenterUpdater center={center} />
      <MapClickHandler onMapClick={onMapClick} disabled={disabled} />
      {markerPosition && (
        <Marker position={markerPosition} icon={customMarkerIcon} />
      )}
    </MapContainer>
  )
}
```

### Customization Notes

- **Change marker color:** Replace `#C75B12` and `rgba(199, 91, 18, ...)` in the `customMarkerIcon` HTML
- **Change map height:** Modify `h-[200px]` in the className
- **Change tile provider:** Replace the TileLayer URL. Options:
  - OpenStreetMap: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
  - Google Maps: `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`
  - Google Satellite: `https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}`
- **Change default zoom:** Modify `zoom={13}` on MapContainer and `map.flyTo(center, 15, ...)` zoom level

---

## 6. Location Map Picker Component (Full Feature)

**File: `src/components/ui/location-map-picker.tsx`**

This is the main component that combines:
- A text search input with autocomplete (Photon geocoding API)
- Popular/preset locations dropdown (shown on focus when empty)
- A Leaflet map with click-to-pin
- Reverse geocoding (click map → get address)
- Keyboard navigation (arrow keys + enter + escape)
- Loading states and "no results" state

```tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, Loader2, X, Star, Search, Navigation } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import dynamic from 'next/dynamic'

// CRITICAL: Dynamically import the Leaflet map to avoid SSR errors
// Leaflet needs `window` which doesn't exist during server-side rendering
const MapComponent = dynamic(() => import('./location-map-view'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[200px] bg-neutral-100 rounded-xl flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
    </div>
  ),
})

// ---------- Types ----------

interface PhotonFeature {
  type: 'Feature'
  geometry: {
    coordinates: [number, number] // [longitude, latitude]
    type: 'Point'
  }
  properties: {
    osm_id: number
    osm_type: string
    name?: string
    street?: string
    housenumber?: string
    city?: string
    district?: string
    state?: string
    country?: string
    postcode?: string
  }
}

interface PhotonResponse {
  type: 'FeatureCollection'
  features: PhotonFeature[]
}

interface LocationMapPickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

// ---------- Configuration ----------
// CUSTOMIZE THESE for your city/region:

const DEFAULT_LAT = 31.6295    // Marrakech latitude
const DEFAULT_LON = -7.9811    // Marrakech longitude

// Popular preset locations shown when the input is focused and empty
const POPULAR_LOCATIONS = [
  { name: 'Jemaa el-Fnaa', district: 'Medina', city: 'Marrakech', lat: 31.6258, lon: -7.9891 },
  { name: 'Gueliz (New Town)', district: 'Gueliz', city: 'Marrakech', lat: 31.6347, lon: -8.0083 },
  { name: 'La Mamounia', district: 'Medina', city: 'Marrakech', lat: 31.6219, lon: -7.9969 },
  { name: 'Majorelle Garden', district: 'Gueliz', city: 'Marrakech', lat: 31.6416, lon: -8.0031 },
  { name: 'Koutoubia Mosque', district: 'Medina', city: 'Marrakech', lat: 31.6238, lon: -7.9939 },
]

// ---------- Component ----------

export function LocationMapPicker({
  value,
  onChange,
  placeholder = 'Search or click on map to select location...',
  className = '',
  disabled = false,
}: LocationMapPickerProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showPopular, setShowPopular] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([DEFAULT_LAT, DEFAULT_LON])
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null)
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const debouncedValue = useDebounce(inputValue, 250)

  // Sync external value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // ---------- Geocoding API Calls ----------

  // Forward geocode: text query → location suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      // Photon API (free, no API key, based on OpenStreetMap)
      // Docs: https://photon.komoot.io/
      const url = new URL('https://photon.komoot.io/api/')
      url.searchParams.set('q', `${query} Marrakech Morocco`) // Bias toward your city
      url.searchParams.set('lat', DEFAULT_LAT.toString())
      url.searchParams.set('lon', DEFAULT_LON.toString())
      url.searchParams.set('location_bias_scale', '0.8')  // How strongly to prefer nearby results (0-1)
      url.searchParams.set('limit', '10')
      url.searchParams.set('lang', 'en')

      const response = await fetch(url.toString())
      if (response.ok) {
        const data: PhotonResponse = await response.json()
        setSuggestions(data.features)
        setShowPopular(false)
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Reverse geocode: lat/lon (from map click) → address text
  const reverseGeocode = useCallback(async (lat: number, lon: number) => {
    setIsReverseGeocoding(true)
    try {
      const url = new URL('https://photon.komoot.io/reverse')
      url.searchParams.set('lat', lat.toString())
      url.searchParams.set('lon', lon.toString())
      url.searchParams.set('lang', 'en')

      const response = await fetch(url.toString())
      if (response.ok) {
        const data: PhotonResponse = await response.json()
        if (data.features.length > 0) {
          const feature = data.features[0]
          const locationText = formatLocation(feature)
          setInputValue(locationText)
          onChange(locationText)
        } else {
          const locationText = `${lat.toFixed(6)}, ${lon.toFixed(6)}`
          setInputValue(locationText)
          onChange(locationText)
        }
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      const locationText = `${lat.toFixed(6)}, ${lon.toFixed(6)}`
      setInputValue(locationText)
      onChange(locationText)
    } finally {
      setIsReverseGeocoding(false)
    }
  }, [onChange])

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debouncedValue && debouncedValue.length >= 2) {
      fetchSuggestions(debouncedValue)
    }
  }, [debouncedValue, fetchSuggestions])

  // ---------- Formatters ----------

  const formatLocation = (feature: PhotonFeature): string => {
    const parts: string[] = []
    const props = feature.properties

    if (props.name) {
      parts.push(props.name)
    } else if (props.street) {
      if (props.housenumber) {
        parts.push(`${props.housenumber} ${props.street}`)
      } else {
        parts.push(props.street)
      }
    }

    if (props.district && !parts.includes(props.district)) {
      parts.push(props.district)
    }

    if (props.city && !parts.includes(props.city)) {
      parts.push(props.city)
    }

    return parts.slice(0, 3).join(', ') || 'Unknown location'
  }

  // Highlight the matching part of the search query in suggestion text
  const highlightMatch = (text: string, query: string) => {
    if (!query || query.length < 2) return text

    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const index = lowerText.indexOf(lowerQuery)

    if (index === -1) return text

    return (
      <>
        {text.slice(0, index)}
        <span className="font-bold text-primary">{text.slice(index, index + query.length)}</span>
        {text.slice(index + query.length)}
      </>
    )
  }

  // ---------- Event Handlers ----------

  const handleSelect = (feature: PhotonFeature) => {
    const locationText = formatLocation(feature)
    setInputValue(locationText)
    onChange(locationText)
    setSuggestions([])
    setShowSuggestions(false)
    setShowPopular(false)
    setSelectedIndex(-1)

    // Photon returns coordinates as [longitude, latitude] — swap them for Leaflet
    const [lon, lat] = feature.geometry.coordinates
    setMarkerPosition([lat, lon])
    setMapCenter([lat, lon])
  }

  const handleSelectPopular = (location: typeof POPULAR_LOCATIONS[0]) => {
    const locationText = `${location.name}, ${location.district}, ${location.city}`
    setInputValue(locationText)
    onChange(locationText)
    setShowSuggestions(false)
    setShowPopular(false)
    setSelectedIndex(-1)

    setMarkerPosition([location.lat, location.lon])
    setMapCenter([location.lat, location.lon])
  }

  const handleMapClick = (lat: number, lon: number) => {
    setMarkerPosition([lat, lon])
    setMapCenter([lat, lon])
    setShowSuggestions(false)
    setShowPopular(false)
    reverseGeocode(lat, lon)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = showPopular ? POPULAR_LOCATIONS.length : suggestions.length

    if (!showSuggestions || totalItems === 0) {
      if (e.key === 'Enter') e.preventDefault()
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          if (showPopular) {
            handleSelectPopular(POPULAR_LOCATIONS[selectedIndex])
          } else if (selectedIndex < suggestions.length) {
            handleSelect(suggestions[selectedIndex])
          }
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setShowPopular(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setSelectedIndex(-1)
    setSuggestions([])

    if (newValue.length === 0) {
      setShowPopular(true)
      setShowSuggestions(true)
    } else if (newValue.length >= 2) {
      setShowPopular(false)
      setShowSuggestions(true)
      setIsLoading(true)
    } else {
      setShowSuggestions(false)
      setShowPopular(false)
    }

    onChange(newValue)
  }

  const handleFocus = () => {
    if (inputValue.length === 0) {
      setShowPopular(true)
      setShowSuggestions(true)
    } else if (inputValue.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleClear = () => {
    setInputValue('')
    onChange('')
    setSuggestions([])
    setShowSuggestions(false)
    setShowPopular(false)
    setSelectedIndex(-1)
    setMarkerPosition(null)
    inputRef.current?.focus()
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setShowPopular(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ---------- Render ----------

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full h-12 pl-11 pr-10 rounded-xl border border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
              disabled ? 'bg-neutral-100 cursor-not-allowed' : ''
            }`}
            autoComplete="off"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            aria-autocomplete="list"
          />
          {(isLoading || isReverseGeocoding) && (
            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
          )}
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Clear input"
            >
              <X className="w-4 h-4 text-neutral-400" />
            </button>
          )}
        </div>

        {/* Popular locations dropdown (shown on focus when input is empty) */}
        {showSuggestions && showPopular && !isLoading && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden"
            role="listbox"
          >
            <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-100 sticky top-0">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
                <Star className="w-3 h-3" />
                Popular Locations
              </p>
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {POPULAR_LOCATIONS.map((location, index) => (
                <button
                  key={location.name}
                  type="button"
                  onClick={() => handleSelectPopular(location)}
                  className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                    index === selectedIndex ? 'bg-primary/10' : 'hover:bg-neutral-50'
                  }`}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">{location.name}</p>
                    <p className="text-xs text-neutral-500">{location.district}, {location.city}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search results dropdown */}
        {showSuggestions && !showPopular && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden max-h-[250px] overflow-y-auto"
            role="listbox"
          >
            {suggestions.map((feature, index) => {
              const props = feature.properties
              const mainText = props.name || props.street || 'Location'
              const secondaryParts: string[] = []

              if (props.district) secondaryParts.push(props.district)
              if (props.city && props.city !== props.district) secondaryParts.push(props.city)
              if (props.country) secondaryParts.push(props.country)

              const secondaryText = secondaryParts.slice(0, 2).join(', ')

              return (
                <button
                  key={`${feature.properties.osm_type}-${feature.properties.osm_id}-${index}`}
                  type="button"
                  onClick={() => handleSelect(feature)}
                  className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                    index === selectedIndex ? 'bg-primary/10' : 'hover:bg-neutral-50'
                  }`}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {highlightMatch(mainText, inputValue)}
                    </p>
                    {secondaryText && (
                      <p className="text-xs text-neutral-500 truncate">
                        {secondaryText}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Loading skeleton while searching */}
        {showSuggestions && isLoading && inputValue.length >= 2 && !showPopular && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden"
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3">
                <div className="w-5 h-5 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-3/4" />
                  <div className="h-3 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results state */}
        {showSuggestions && !isLoading && !showPopular && inputValue.length >= 2 && suggestions.length === 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-neutral-200 shadow-lg p-4"
          >
            <div className="text-center">
              <MapPin className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-neutral-700">No locations found</p>
              <p className="text-xs text-neutral-500 mt-1">
                Try clicking on the map to pin your location
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Map */}
      <div className="relative rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
        <MapComponent
          center={mapCenter}
          markerPosition={markerPosition}
          onMapClick={handleMapClick}
          disabled={disabled}
        />

        {/* Instruction overlay (shown when no marker is placed yet) */}
        {!markerPosition && (
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-neutral-200/50 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-xs text-neutral-600">
                Click on the map to pin your pickup location
              </p>
            </div>
          </div>
        )}

        {/* Loading overlay during reverse geocoding */}
        {isReverseGeocoding && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-white rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-sm text-neutral-600">Getting address...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 7. Using Both in a Form

Here's how to wire both components into a checkout/booking form:

```tsx
'use client'

import { useState } from 'react'
import { PhoneInput } from '@/components/ui/phone-input'
import { LocationMapPicker } from '@/components/ui/location-map-picker'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  pickupLocation: string
}

export function BookingForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    pickupLocation: '',
  })

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <h2 className="text-xl font-bold text-neutral-900 mb-6">Your Details</h2>

      <div className="space-y-4">
        {/* First Name + Last Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Doe"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            placeholder="john@example.com"
          />
        </div>

        {/* ======================= */}
        {/* PHONE NUMBER INPUT      */}
        {/* ======================= */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Phone Number *
          </label>
          <PhoneInput
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
            placeholder="600 000 000"
          />
        </div>

        {/* ======================= */}
        {/* PICKUP LOCATION MAP     */}
        {/* ======================= */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Pickup Location
          </label>
          <LocationMapPicker
            value={formData.pickupLocation}
            onChange={(value) => setFormData({ ...formData, pickupLocation: value })}
            placeholder="Search or click on map to select location..."
          />
        </div>
      </div>
    </div>
  )
}
```

---

## 8. How It All Works Together

### Phone Number Flow

```
User focuses input
  → Country selector shows Morocco flag + +212
  → User types digits
  → react-international-phone auto-formats the number
  → onChange fires with full international format (e.g. "+212600000000")
  → Parent form stores the value in formData.phone
```

### Location Map Picker Flow

```
User focuses empty input
  → Popular locations dropdown appears (preset list)
  → User can click one → marker placed, map flies to it, input filled

User types 2+ characters
  → 250ms debounce triggers
  → Photon API called with query biased toward your city
  → Suggestions dropdown appears with highlighted matches
  → Arrow keys navigate, Enter selects, Escape closes
  → On select → marker placed, map flies to location, input filled

User clicks directly on map
  → Marker placed at click point
  → Reverse geocode API called (lat/lon → address)
  → Loading overlay shows "Getting address..."
  → Input filled with resolved address text
  → If no address found, falls back to raw coordinates

User clicks X button
  → Input cleared, marker removed, suggestions hidden
```

### Key Technical Details

| Detail | Value |
|---|---|
| Geocoding API | Photon (photon.komoot.io) — free, no API key |
| Forward geocode endpoint | `GET https://photon.komoot.io/api/?q=...&lat=...&lon=...` |
| Reverse geocode endpoint | `GET https://photon.komoot.io/reverse?lat=...&lon=...` |
| Photon coordinate format | `[longitude, latitude]` (GeoJSON standard) |
| Leaflet coordinate format | `[latitude, longitude]` (must swap!) |
| Search debounce | 250ms |
| Min chars to trigger search | 2 |
| Map tile provider | Google Maps (free tile layer, no key) |
| Map library | Leaflet + react-leaflet |
| SSR handling | `next/dynamic` with `ssr: false` for the map |
| Accessibility | ARIA combobox pattern with listbox roles |

### Adapting for a Different City

1. Change `DEFAULT_LAT` and `DEFAULT_LON` to your city's coordinates
2. Change `POPULAR_LOCATIONS` array to landmarks in your city
3. Change the bias query in `fetchSuggestions`: replace `"Marrakech Morocco"` with your city
4. Change `defaultCountry="ma"` in PhoneInput to your country code
5. Change the marker color (`#C75B12`) in `location-map-view.tsx` to your brand color
6. Change the focus colors in `phone-input.tsx` CSS (`#22c55e` → your color)
