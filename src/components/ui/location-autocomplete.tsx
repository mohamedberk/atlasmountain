'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, Loader2, X, Clock, Star } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

interface PhotonFeature {
  type: 'Feature'
  geometry: {
    coordinates: [number, number]
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

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

// Marrakech coordinates for biasing results
const MARRAKECH_LAT = 31.6295
const MARRAKECH_LON = -7.9811

// Popular Marrakech locations for quick selection
const POPULAR_LOCATIONS = [
  { name: 'Jemaa el-Fnaa', district: 'Medina', city: 'Marrakech' },
  { name: 'Gueliz (New Town)', district: 'Gueliz', city: 'Marrakech' },
  { name: 'La Mamounia', district: 'Medina', city: 'Marrakech' },
  { name: 'Majorelle Garden', district: 'Gueliz', city: 'Marrakech' },
  { name: 'Koutoubia Mosque', district: 'Medina', city: 'Marrakech' },
]

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Enter your pickup location...',
  className = '',
  disabled = false,
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showPopular, setShowPopular] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const debouncedValue = useDebounce(inputValue, 250) // Faster debounce for better UX

  // Sync external value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Fetch suggestions from Photon API
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      // Bias results towards Marrakech/Morocco - removed bbox for better results
      const url = new URL('https://photon.komoot.io/api/')
      url.searchParams.set('q', `${query} Marrakech Morocco`) // Add context to query
      url.searchParams.set('lat', MARRAKECH_LAT.toString())
      url.searchParams.set('lon', MARRAKECH_LON.toString())
      url.searchParams.set('location_bias_scale', '0.8') // Strong bias towards Marrakech
      url.searchParams.set('limit', '10') // Show more results
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

  // Fetch when debounced value changes
  useEffect(() => {
    if (debouncedValue && debouncedValue.length >= 2) {
      fetchSuggestions(debouncedValue)
    }
  }, [debouncedValue, fetchSuggestions])

  // Format location display text
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

  // Highlight matching text in suggestion
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

  // Handle selecting a suggestion
  const handleSelect = (feature: PhotonFeature) => {
    const locationText = formatLocation(feature)
    setInputValue(locationText)
    onChange(locationText)
    setSuggestions([])
    setShowSuggestions(false)
    setShowPopular(false)
    setSelectedIndex(-1)
  }

  // Handle selecting a popular location
  const handleSelectPopular = (location: typeof POPULAR_LOCATIONS[0]) => {
    const locationText = `${location.name}, ${location.district}, ${location.city}`
    setInputValue(locationText)
    onChange(locationText)
    setShowSuggestions(false)
    setShowPopular(false)
    setSelectedIndex(-1)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = showPopular ? POPULAR_LOCATIONS.length : suggestions.length

    if (!showSuggestions || totalItems === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
      }
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

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setSelectedIndex(-1)

    // Clear old suggestions immediately when typing new query
    setSuggestions([])

    // If input is empty, show popular locations
    if (newValue.length === 0) {
      setShowPopular(true)
      setShowSuggestions(true)
    } else if (newValue.length >= 2) {
      setShowPopular(false)
      setShowSuggestions(true)
      setIsLoading(true) // Show loading immediately
    } else {
      setShowSuggestions(false)
      setShowPopular(false)
    }

    // Also update parent immediately for manual entry
    onChange(newValue)
  }

  // Handle focus - show popular locations
  const handleFocus = () => {
    if (inputValue.length === 0) {
      setShowPopular(true)
      setShowSuggestions(true)
    } else if (inputValue.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  // Handle clear
  const handleClear = () => {
    setInputValue('')
    onChange('')
    setSuggestions([])
    setShowSuggestions(false)
    setShowPopular(false)
    setSelectedIndex(-1)
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

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
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
          } ${className}`}
          autoComplete="off"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        {isLoading && (
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

      {/* Popular locations dropdown (shown on focus with empty input) */}
      {showSuggestions && showPopular && !isLoading && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-neutral-200 shadow-md overflow-hidden"
          role="listbox"
        >
          <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-100 sticky top-0">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
              <Star className="w-3 h-3" />
              Popular Locations
            </p>
          </div>
          <div className="max-h-[280px] overflow-y-auto">
          {POPULAR_LOCATIONS.map((location, index) => (
            <button
              key={location.name}
              type="button"
              onClick={() => handleSelectPopular(location)}
              className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                index === selectedIndex
                  ? 'bg-primary/10'
                  : 'hover:bg-neutral-50'
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
          className="absolute z-50 w-full mt-2 mb-20 bg-white rounded-xl border border-neutral-200 shadow-md overflow-hidden max-h-[320px] overflow-y-auto"
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
                  index === selectedIndex
                    ? 'bg-primary/10'
                    : 'hover:bg-neutral-50'
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

      {/* Loading state with skeleton shimmer */}
      {showSuggestions && isLoading && inputValue.length >= 2 && !showPopular && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-neutral-200 shadow-md overflow-hidden"
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

      {/* No results message */}
      {showSuggestions && !isLoading && !showPopular && inputValue.length >= 2 && suggestions.length === 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-neutral-200 shadow-md p-4"
        >
          <div className="text-center">
            <MapPin className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-700">No locations found</p>
            <p className="text-xs text-neutral-500 mt-1">
              Try a different search or type your full address
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
