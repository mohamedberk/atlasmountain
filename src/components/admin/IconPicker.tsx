'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useField } from '@payloadcms/ui'
import * as LucideIcons from 'lucide-react'
import type { TextFieldClientComponent } from 'payload'

// Get all icon names from lucide-react
// Filter for valid icon components (they start with uppercase and are valid React components)
const iconNames = Object.keys(LucideIcons).filter((key) => {
  // Must start with uppercase letter (icon naming convention)
  if (!/^[A-Z]/.test(key)) return false
  // Exclude known non-icon exports
  if (['Icon', 'createLucideIcon', 'icons'].includes(key)) return false

  const component = (LucideIcons as Record<string, unknown>)[key]
  // Check if it's a valid React component (function or object with $$typeof)
  return (
    typeof component === 'function' ||
    (typeof component === 'object' && component !== null && '$$typeof' in component)
  )
})

// Popular tourism-related icons to show at the top
const popularIcons = [
  // Transportation
  'Mountain', 'Car', 'Plane', 'Bus', 'Ship', 'Train', 'Bike',
  'CarFront', 'PlaneTakeoff', 'PlaneLanding', 'Sailboat', 'Cable', 'Rocket',
  'Truck', 'Ambulance', 'Tractor', 'Helicopter',

  // Navigation & Location
  'MapPin', 'MapPinned', 'Map', 'Compass', 'Globe', 'Globe2', 'Navigation', 'Navigation2',
  'Locate', 'LocateFixed', 'Signpost', 'Milestone', 'Route',

  // Nature & Outdoors
  'Palmtree', 'TreePine', 'Trees', 'Tent', 'Campfire', 'Flame',
  'Mountain', 'MountainSnow', 'Waves', 'Anchor', 'Fish',
  'Bird', 'Turtle', 'Flower', 'Flower2', 'Leaf', 'Shrub',
  'Sunrise', 'Sunset', 'Sun', 'Moon', 'Star', 'Stars',
  'Cloud', 'CloudSun', 'CloudMoon', 'Snowflake', 'Wind', 'Rainbow', 'Cloudy',

  // Accommodation & Buildings
  'Home', 'Building', 'Building2', 'Hotel', 'Castle', 'Church', 'Landmark',
  'Factory', 'Warehouse', 'Store', 'Tent', 'BedDouble', 'Bed', 'Bath', 'Lamp',

  // Food & Dining
  'UtensilsCrossed', 'Utensils', 'Coffee', 'Wine', 'Beer', 'CupSoda', 'Martini',
  'Pizza', 'Sandwich', 'Salad', 'Soup', 'IceCream', 'Cake', 'Cookie', 'Croissant',
  'Apple', 'Cherry', 'Grape', 'Banana', 'Citrus', 'Carrot',

  // Activities & Entertainment
  'Camera', 'Video', 'Image', 'Images', 'Aperture',
  'Music', 'Music2', 'Headphones', 'Mic', 'Radio',
  'Gamepad2', 'Dices', 'Puzzle', 'Drama', 'Theater',
  'Binoculars', 'Telescope', 'Glasses', 'Sparkles', 'PartyPopper',

  // Sports & Adventure
  'Bike', 'Footprints', 'PersonStanding', 'Accessibility',
  'Dumbbell', 'Medal', 'Trophy', 'Target', 'Swords',
  'Volleyball', 'Football', 'CircleDot',

  // Shopping & Services
  'ShoppingBag', 'ShoppingCart', 'Gift', 'Ticket', 'Tickets', 'Receipt', 'CreditCard',
  'Wallet', 'Banknote', 'Coins', 'BadgePercent', 'Tag', 'Tags',

  // People & Social
  'Users', 'User', 'UserPlus', 'Users2', 'Baby', 'PersonStanding',
  'Heart', 'HeartHandshake', 'Handshake', 'ThumbsUp',

  // Time & Schedule
  'Clock', 'Clock1', 'Clock12', 'Calendar', 'CalendarDays', 'Timer', 'Hourglass', 'Watch',

  // Communication
  'Phone', 'Mail', 'MessageCircle', 'MessageSquare', 'Send', 'Share2',

  // Weather
  'Umbrella', 'UmbrellaOff', 'Thermometer', 'ThermometerSun', 'Droplets',

  // Misc Travel
  'Luggage', 'Briefcase', 'Backpack', 'Key', 'KeyRound', 'Lock', 'Unlock',
  'Flag', 'Languages', 'BookOpen', 'Bookmark', 'Info', 'HelpCircle',
  'Wifi', 'WifiOff', 'Battery', 'BatteryCharging', 'Plug', 'Flashlight',

  // UI Elements
  'Check', 'X', 'Plus', 'Minus', 'ChevronRight', 'ChevronLeft', 'ArrowRight', 'ArrowLeft'
]

export const IconPickerField: TextFieldClientComponent = ({ path, field }) => {
  const { value, setValue } = useField<string>({ path })
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!search) {
      // Show popular icons first, then the rest
      const popular = popularIcons.filter(icon => iconNames.includes(icon))
      // Remove duplicates from popular list
      const uniquePopular = [...new Set(popular)]
      const others = iconNames.filter(icon => !popularIcons.includes(icon))
      return [...uniquePopular, ...others].slice(0, 200)
    }
    return iconNames.filter((icon) =>
      icon.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 200)
  }, [search])

  const handleSelect = useCallback((iconName: string) => {
    setValue(iconName)
    setIsOpen(false)
    setSearch('')
  }, [setValue])

  const handleClear = useCallback(() => {
    setValue('')
  }, [setValue])

  // Get the current icon component
  const CurrentIcon = value ? (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[value] : null

  return (
    <div className="field-type text">
      <label className="field-label">
        {typeof field.label === 'string' ? field.label : 'Icon'}
        {field.required && <span className="required">*</span>}
      </label>

      {field.admin?.description && (
        <div className="field-description" style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
          {typeof field.admin.description === 'string' ? field.admin.description : null}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        {/* Selected icon display */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: 'var(--theme-elevation-50)',
            minHeight: '44px'
          }}
        >
          {CurrentIcon ? (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--theme-elevation-100)',
                borderRadius: '6px'
              }}>
                <CurrentIcon size={20} />
              </div>
              <span style={{ flex: 1 }}>{value}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--theme-elevation-400)'
                }}
              >
                <LucideIcons.X size={16} />
              </button>
            </>
          ) : (
            <span style={{ color: 'var(--theme-elevation-400)' }}>
              Click to select an icon...
            </span>
          )}
          <LucideIcons.ChevronDown
            size={16}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}
          />
        </div>

        {/* Dropdown */}
        {isOpen && (
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
              maxHeight: '400px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Search input */}
            <div style={{ padding: '8px', borderBottom: '1px solid var(--theme-elevation-100)' }}>
              <div style={{ position: 'relative' }}>
                <LucideIcons.Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--theme-elevation-400)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '8px 8px 8px 36px',
                    border: '1px solid var(--theme-elevation-150)',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: 'var(--theme-elevation-50)'
                  }}
                />
              </div>
            </div>

            {/* Icons grid */}
            <div
              style={{
                padding: '8px',
                overflowY: 'auto',
                maxHeight: '320px'
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                  gap: '4px'
                }}
              >
                {filteredIcons.map((iconName) => {
                  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[iconName]
                  if (!IconComponent) return null

                  const isSelected = value === iconName

                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleSelect(iconName)}
                      title={iconName}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '8px 4px',
                        border: isSelected ? '2px solid var(--theme-success-500)' : '1px solid transparent',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'var(--theme-success-50)' : 'transparent',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <IconComponent size={24} />
                      <span
                        style={{
                          fontSize: '10px',
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          width: '100%',
                          color: 'var(--theme-elevation-600)'
                        }}
                      >
                        {iconName}
                      </span>
                    </button>
                  )
                })}
              </div>

              {filteredIcons.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: 'var(--theme-elevation-400)'
                }}>
                  No icons found for &quot;{search}&quot;
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default IconPickerField
