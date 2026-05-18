/**
 * Centralized Pricing Utility
 * Single source of truth for all price calculations
 * Used in: activity cards, detail pages, checkout, emails, etc.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface TieredPricingTier {
  minPeople: number
  maxPeople: number
  pricePerPerson: number
}

export interface ActivityPricingInput {
  pricingType: 'per_person' | 'fixed' | 'private' | 'both' | 'custom_note'
  // Group/per_person pricing
  groupAdultPrice?: number
  groupChildPrice?: number
  groupMinSize?: number
  groupMaxSize?: number
  // Tiered pricing
  tieredPricingEnabled?: boolean
  tieredPricingTiers?: TieredPricingTier[]
  // Private/fixed pricing
  privateBasePrice?: number
  privateMinGuests?: number
  privateMaxGuests?: number
  privateAdditionalGuestPrice?: number
}

export interface GuestCount {
  adults: number
  children: number
}

export interface PriceResult {
  total: number
  breakdown: {
    basePrice: number
    adultTotal?: number
    childTotal?: number
    extraGuestFee?: number
    tierName?: string
  }
  perPersonDisplay?: string
  isPrivate: boolean
  tierInfo?: TieredPricingTier
}

// ============================================================================
// ACTIVITY PRICING
// ============================================================================

/**
 * Calculate activity price based on pricing type and guest count
 */
export function calculateActivityPrice(
  pricing: ActivityPricingInput,
  guests: GuestCount,
  selectedMode: 'group' | 'private' = 'group'
): PriceResult {
  const { adults, children } = guests
  const totalGuests = adults + children

  // Determine effective mode based on pricing type
  const isPrivate =
    pricing.pricingType === 'fixed' ||
    pricing.pricingType === 'private' ||
    (pricing.pricingType === 'both' && selectedMode === 'private')

  if (isPrivate) {
    // Private/Fixed pricing calculation
    const basePrice = pricing.privateBasePrice || 0
    const minGuests = pricing.privateMinGuests || 1
    const additionalGuestPrice = pricing.privateAdditionalGuestPrice || 0
    const extraGuests = Math.max(0, totalGuests - minGuests)
    const extraGuestFee = extraGuests * additionalGuestPrice
    const total = basePrice + extraGuestFee

    return {
      total,
      breakdown: {
        basePrice,
        extraGuestFee: extraGuestFee > 0 ? extraGuestFee : undefined,
      },
      perPersonDisplay: additionalGuestPrice > 0
        ? `€${basePrice} + €${additionalGuestPrice}/extra guest`
        : `€${basePrice} total`,
      isPrivate: true,
    }
  } else {
    // Per person pricing calculation

    // Check if tiered pricing is enabled
    if (pricing.tieredPricingEnabled && pricing.tieredPricingTiers && pricing.tieredPricingTiers.length > 0) {
      // Find applicable tier based on total guests (adults only, children use standard price)
      const applicableTier = pricing.tieredPricingTiers.find(
        tier => adults >= tier.minPeople && adults <= tier.maxPeople
      )

      if (applicableTier) {
        // Use tiered pricing for adults
        const adultTotal = applicableTier.pricePerPerson * adults
        const childTotal = (pricing.groupChildPrice || 0) * children
        const total = adultTotal + childTotal

        return {
          total,
          breakdown: {
            basePrice: applicableTier.pricePerPerson,
            adultTotal,
            childTotal: children > 0 ? childTotal : undefined,
            tierName: `${applicableTier.minPeople}-${applicableTier.maxPeople} people`,
          },
          perPersonDisplay: `€${applicableTier.pricePerPerson}/person`,
          isPrivate: false,
          tierInfo: applicableTier,
        }
      }
    }

    // Fall back to standard per-person pricing
    const adultPrice = pricing.groupAdultPrice || 0
    const childPrice = pricing.groupChildPrice || 0
    const adultTotal = adultPrice * adults
    const childTotal = childPrice * children
    const total = adultTotal + childTotal

    return {
      total,
      breakdown: {
        basePrice: adultPrice,
        adultTotal,
        childTotal: children > 0 ? childTotal : undefined,
      },
      perPersonDisplay: `€${adultPrice}/adult${childPrice > 0 && childPrice !== adultPrice ? `, €${childPrice}/child` : ''}`,
      isPrivate: false,
    }
  }
}

/**
 * Validate guest count against activity constraints
 */
export function validateActivityGuests(
  pricing: ActivityPricingInput,
  guests: GuestCount,
  isPrivateMode: boolean
): { valid: boolean; error?: string; minGuests?: number; maxGuests?: number } {
  const totalGuests = guests.adults + guests.children

  if (guests.adults < 1) {
    return { valid: false, error: 'At least 1 adult required' }
  }

  if (isPrivateMode) {
    const minGuests = pricing.privateMinGuests || 1
    const maxGuests = pricing.privateMaxGuests

    if (totalGuests < minGuests) {
      return {
        valid: false,
        error: `Minimum ${minGuests} guest${minGuests > 1 ? 's' : ''} required`,
        minGuests,
        maxGuests
      }
    }
    if (maxGuests && totalGuests > maxGuests) {
      return {
        valid: false,
        error: `Maximum ${maxGuests} guests allowed`,
        minGuests,
        maxGuests
      }
    }
    return { valid: true, minGuests, maxGuests }
  } else {
    const minSize = pricing.groupMinSize || 1
    const maxSize = pricing.groupMaxSize

    if (totalGuests < minSize) {
      return {
        valid: false,
        error: `Minimum ${minSize} guest${minSize > 1 ? 's' : ''} required`,
        minGuests: minSize,
        maxGuests: maxSize
      }
    }
    if (maxSize && totalGuests > maxSize) {
      return {
        valid: false,
        error: `Maximum ${maxSize} guests allowed`,
        minGuests: minSize,
        maxGuests: maxSize
      }
    }
    return { valid: true, minGuests: minSize, maxGuests: maxSize }
  }
}

// ============================================================================
// CART ITEM HELPERS
// ============================================================================

import type { ActivityCartItem, TransportCartItem, CartItem } from '@/context/CartContext'

/**
 * Get activity pricing input from cart item
 */
export function getActivityPricingFromCartItem(item: ActivityCartItem): ActivityPricingInput {
  return {
    pricingType: item.pricingType,
    groupAdultPrice: item.pricingType === 'per_person' ? item.price : undefined,
    groupChildPrice: item.pricingType === 'per_person' ? item.childPrice : undefined,
    groupMinSize: item.groupMinSize,
    groupMaxSize: item.groupMaxSize,
    privateBasePrice: item.privateBasePrice || (item.pricingType !== 'per_person' ? item.price : undefined),
    privateMinGuests: item.privateMinGuests,
    privateMaxGuests: item.privateMaxGuests,
    privateAdditionalGuestPrice: item.privateAdditionalGuestPrice,
  }
}

/**
 * Calculate price for any cart item (activity or transport)
 */
export function calculateCartItemPrice(item: CartItem): number {
  if (item.type === 'activity') {
    const actItem = item as ActivityCartItem
    const pricing = getActivityPricingFromCartItem(actItem)
    const guests = { adults: actItem.adults, children: actItem.children }
    const isPrivate = actItem.pricingType === 'private' || actItem.pricingType === 'fixed'
    return calculateActivityPrice(pricing, guests, isPrivate ? 'private' : 'group').total
  }

  if (item.type === 'transport') {
    return (item as TransportCartItem).pricePerCar
  }

  return 0
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = '€'): string {
  return `${currency}${amount.toLocaleString()}`
}

/**
 * Get display price label for an activity (for cards, etc.)
 */
export function getActivityDisplayPrice(
  pricing: ActivityPricingInput,
  preferPrivate: boolean = false
): { price: number; label: string; isPerPerson: boolean } {
  const showPrivate =
    pricing.pricingType === 'fixed' ||
    pricing.pricingType === 'private' ||
    (pricing.pricingType === 'both' && preferPrivate)

  if (showPrivate) {
    return {
      price: pricing.privateBasePrice || 0,
      label: 'total',
      isPerPerson: false,
    }
  }

  return {
    price: pricing.groupAdultPrice || 0,
    label: '/person',
    isPerPerson: true,
  }
}
