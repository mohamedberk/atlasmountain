import type { ActivityCartItem, TransportCartItem, CartItem } from '@/context/CartContext'
import { calculateCartItemPrice } from '@/utils/pricing'

export type CheckoutStep = 'cart' | 'upsell' | 'guests' | 'schedule' | 'details' | 'payment'

export interface UpsellActivity {
  id: string
  title: string
  price: number
  childPrice: number
  image: string
  duration: string
  slug: string
  shortDescription?: string
  location?: string
  highlights?: string[]
  included?: string[]
  rating?: number
  reviewCount?: number
  // Category info
  categoryId?: string
  categoryName?: string
  categorySlug?: string
  // Pricing type info
  pricingType?: 'per_person' | 'fixed' | 'both'
  // Private pricing details
  privateBasePrice?: number
  privateMinGuests?: number
  privateMaxGuests?: number
  privateAdditionalGuestPrice?: number
  // Group pricing constraints
  groupMinSize?: number
  groupMaxSize?: number
}

export interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  pickupLocation: string
  specialRequests: string
}

// Helper functions
export const getItemImage = (item: CartItem): string => {
  if (item.type === 'activity') return (item as ActivityCartItem).image || '/placeholder-activity.jpg'
  return (item as TransportCartItem).image || '/placeholder-vehicle.jpg'
}

export const getItemTitle = (item: CartItem): string => {
  if (item.type === 'activity') return (item as ActivityCartItem).title
  return (item as TransportCartItem).vehicleName
}

// Use centralized pricing utility
export const getItemPrice = calculateCartItemPrice

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
