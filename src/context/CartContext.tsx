'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

// Types for cart items
export interface ActivityCartItem {
  type: 'activity'
  id: string
  slug: string
  title: string
  image: string
  price: number
  childPrice: number
  duration: string
  adults: number
  children: number
  date: string
  pricingType: 'per_person' | 'private' | 'fixed' | 'custom_note'
  privatePrice?: number
  // Custom pricing note
  customPricingNote?: string
  // Private pricing details for recalculation
  privateBasePrice?: number
  privateMinGuests?: number
  privateMaxGuests?: number
  privateAdditionalGuestPrice?: number
  // Group pricing constraints
  groupMinSize?: number
  groupMaxSize?: number
  // Tiered pricing
  tieredPricingEnabled?: boolean
  tierInfo?: {
    minPeople: number
    maxPeople: number
    pricePerPerson: number
  }
  allTiers?: Array<{
    minPeople: number
    maxPeople: number
    pricePerPerson: number
  }>
}

export interface TransportCartItem {
  type: 'transport'
  id: string
  vehicleName: string
  vehicleType: string
  image: string
  pricePerCar: number
  maxPassengers: number
  passengers: number
  pickupDate: string
  pickupTime: string
  pickupLocationId: string
  pickupLocationName: string
  dropoffLocationId: string
  dropoffLocationName: string
  routeId?: string
}

export type CartItem = ActivityCartItem | TransportCartItem

export interface GuestDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  pickupLocation: string
  specialRequests: string
}

interface CartContextType {
  items: CartItem[]
  guestDetails: GuestDetails
  addItem: (item: CartItem) => void
  removeItem: (id: string, type: 'activity' | 'transport') => void
  updateItem: (id: string, type: 'activity' | 'transport', updates: Partial<CartItem>) => void
  clearCart: () => void
  setGuestDetails: (details: GuestDetails) => void
  getTotal: () => number
  getActivityTotal: () => number
  getTransportTotal: () => number
  itemCount: number
  hasActivities: boolean
  hasTransport: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'atlasmountainsvisit-cart'
const CART_EXPIRY_MINUTES = 30

interface StoredCart {
  items: CartItem[]
  guestDetails: GuestDetails
  timestamp: number
}

const defaultGuestDetails: GuestDetails = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  pickupLocation: '',
  specialRequests: '',
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [guestDetails, setGuestDetailsState] = useState<GuestDetails>(defaultGuestDetails)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed: StoredCart = JSON.parse(stored)
        const now = Date.now()
        const expiryTime = CART_EXPIRY_MINUTES * 60 * 1000

        // Check if cart has expired
        if (now - parsed.timestamp < expiryTime) {
          setItems(parsed.items || [])
          setGuestDetailsState(parsed.guestDetails || defaultGuestDetails)
        } else {
          // Cart expired, clear it
          localStorage.removeItem(CART_STORAGE_KEY)
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
      localStorage.removeItem(CART_STORAGE_KEY)
    }

    setIsInitialized(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return

    const cartData: StoredCart = {
      items,
      guestDetails,
      timestamp: Date.now(),
    }

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [items, guestDetails, isInitialized])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      // Check if item already exists
      const existingIndex = prev.findIndex(
        (i) => i.id === item.id && i.type === item.type
      )

      if (existingIndex >= 0) {
        // Update existing item
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], ...item }
        return updated
      }

      // Add new item
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((id: string, type: 'activity' | 'transport') => {
    setItems((prev) => prev.filter((item) => !(item.id === id && item.type === type)))
  }, [])

  const updateItem = useCallback(
    (id: string, type: 'activity' | 'transport', updates: Partial<CartItem>) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id && item.type === type) {
            return { ...item, ...updates } as CartItem
          }
          return item
        })
      )
    },
    []
  )

  const clearCart = useCallback(() => {
    setItems([])
    setGuestDetailsState(defaultGuestDetails)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CART_STORAGE_KEY)
    }
  }, [])

  const setGuestDetails = useCallback((details: GuestDetails) => {
    setGuestDetailsState(details)
  }, [])

  const getActivityTotal = useCallback(() => {
    return items
      .filter((item): item is ActivityCartItem => item.type === 'activity')
      .reduce((total, item) => {
        const isPrivateMode = item.pricingType === 'private' || item.pricingType === 'fixed'
        if (isPrivateMode) {
          // Recalculate private/fixed pricing based on current guests
          const basePrice = item.privateBasePrice || item.price
          const minGuests = item.privateMinGuests || 1
          const additionalGuestPrice = item.privateAdditionalGuestPrice || 0
          const totalGuests = item.adults + item.children
          const extraGuests = Math.max(0, totalGuests - minGuests)
          return total + basePrice + (extraGuests * additionalGuestPrice)
        }

        // Check if item has tiered pricing
        if (item.tieredPricingEnabled && item.allTiers && item.allTiers.length > 0) {
          // Find applicable tier based on number of adults
          const applicableTier = item.allTiers.find(
            tier => item.adults >= tier.minPeople && item.adults <= tier.maxPeople
          )

          if (applicableTier) {
            const adultTotal = applicableTier.pricePerPerson * item.adults
            const childTotal = item.childPrice * item.children
            return total + adultTotal + childTotal
          }
        }

        // Fall back to standard per person pricing
        const adultTotal = item.price * item.adults
        const childTotal = item.childPrice * item.children
        return total + adultTotal + childTotal
      }, 0)
  }, [items])

  const getTransportTotal = useCallback(() => {
    return items
      .filter((item): item is TransportCartItem => item.type === 'transport')
      .reduce((total, item) => total + item.pricePerCar, 0)
  }, [items])

  const getTotal = useCallback(() => {
    return getActivityTotal() + getTransportTotal()
  }, [getActivityTotal, getTransportTotal])

  const itemCount = items.length

  const hasActivities = items.some((item) => item.type === 'activity')
  const hasTransport = items.some((item) => item.type === 'transport')
  return (
    <CartContext.Provider
      value={{
        items,
        guestDetails,
        addItem,
        removeItem,
        updateItem,
        clearCart,
        setGuestDetails,
        getTotal,
        getActivityTotal,
        getTransportTotal,
        itemCount,
        hasActivities,
        hasTransport,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
