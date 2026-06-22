'use client'

import { memo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Users, Plus, Minus, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { CartItem, ActivityCartItem } from '@/context/CartContext'
import { getItemImage, getItemTitle, getItemPrice } from './checkout-types'
import {
  getActivityPricingFromCartItem,
  calculateActivityPrice,
  validateActivityGuests,
} from '@/utils/pricing'

interface GuestsStepProps {
  items: CartItem[]
  onUpdateActivityGuests: (id: string, field: 'adults' | 'children', delta: number) => void
}

export const GuestsStep = memo(function GuestsStep({
  items,
  onUpdateActivityGuests,
}: GuestsStepProps) {
  const tGuests = useTranslations('guestsStep')

  return (
    <motion.div
      key="guests"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h1 className="text-lg sm:text-xl font-display font-bold text-neutral-900">
          {tGuests('howManyGuests')}
        </h1>
      </div>

      <div className="space-y-3">
        {/* Activities */}
        {items.filter(i => i.type === 'activity').map((item) => (
          <ActivityGuestCard
            key={item.id}
            item={item as ActivityCartItem}
            onUpdate={onUpdateActivityGuests}
          />
        ))}

      </div>
    </motion.div>
  )
})

// Activity Guest Card - handles all pricing types
interface ActivityGuestCardProps {
  item: ActivityCartItem
  onUpdate: (id: string, field: 'adults' | 'children', delta: number) => void
}

const ActivityGuestCard = memo(function ActivityGuestCard({ item, onUpdate }: ActivityGuestCardProps) {
  const tGuests = useTranslations('guestsStep')
  const tBookingForm = useTranslations('bookingForm')
  const pricing = getActivityPricingFromCartItem(item)
  const guests = { adults: item.adults, children: item.children }
  const isPrivateMode = item.pricingType === 'private' || item.pricingType === 'fixed'
  const priceResult = calculateActivityPrice(pricing, guests, isPrivateMode ? 'private' : 'group')
  const validation = validateActivityGuests(pricing, guests, isPrivateMode)

  // Get pricing display info
  const getPricingInfo = () => {
    if (isPrivateMode) {
      const basePrice = item.privateBasePrice || item.price
      const additionalPrice = item.privateAdditionalGuestPrice || 0
      const minGuests = item.privateMinGuests || 1
      return {
        label: tGuests('privateTour'),
        description: additionalPrice > 0
          ? tBookingForm('guestPriceBase', { base: basePrice, additional: additionalPrice, min: minGuests })
          : tBookingForm('guestPriceTotal', { base: basePrice }),
        showPerPerson: false,
      }
    }
    return {
      label: tGuests('perPerson'),
      description: item.childPrice > 0
        ? tBookingForm('guestPriceAdultChild', { adult: item.price, child: item.childPrice })
        : tBookingForm('guestPriceAdult', { adult: item.price }),
      showPerPerson: true,
    }
  }

  const pricingInfo = getPricingInfo()

  return (
    <div className={`p-3 rounded-xl border ${isPrivateMode ? 'bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-amber-200/50' : 'bg-neutral-50 border-neutral-200'}`}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-200 relative">
          <Image src={getItemImage(item)} alt={getItemTitle(item)} fill sizes="48px" className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-neutral-900 text-sm line-clamp-1">{getItemTitle(item)}</h3>
          <p className="text-xs text-neutral-500">{item.duration}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-base font-bold text-secondary">€{priceResult.total}</span>
        </div>
      </div>

      {/* Pricing Mode Info */}
      <div className={`mt-2 px-2 py-1.5 rounded-lg ${isPrivateMode ? 'bg-amber-100/50' : 'bg-white/50'}`}>
        <span className="text-[10px] font-medium text-neutral-600">{pricingInfo.label}:</span>
        <span className="text-[10px] text-neutral-500 ml-1">{pricingInfo.description}</span>
      </div>

      {/* Validation Error */}
      {!validation.valid && (
        <div className="mt-2 flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1.5 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="text-xs">{validation.error}</span>
        </div>
      )}

      {/* Guest Counters */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-200/60">
        {isPrivateMode ? (
          // For private/fixed: show counters without per-person prices
          <>
            <CompactCounter
              label={tBookingForm('adultsLabel')}
              value={item.adults}
              priceLabel=""
              onDecrement={() => onUpdate(item.id, 'adults', -1)}
              onIncrement={() => onUpdate(item.id, 'adults', 1)}
              minValue={1}
              maxValue={validation.maxGuests ? validation.maxGuests - item.children : undefined}
            />
            <div className="w-px h-8 bg-neutral-200" />
            <CompactCounter
              label={tBookingForm('childrenLabel')}
              value={item.children}
              priceLabel=""
              onDecrement={() => onUpdate(item.id, 'children', -1)}
              onIncrement={() => onUpdate(item.id, 'children', 1)}
              minValue={0}
              maxValue={validation.maxGuests ? validation.maxGuests - item.adults : undefined}
            />
          </>
        ) : (
          // For per_person: show price per type
          <>
            <CompactCounter
              label={tBookingForm('adultsLabel')}
              value={item.adults}
              priceLabel={`€${item.price}/ea`}
              onDecrement={() => onUpdate(item.id, 'adults', -1)}
              onIncrement={() => onUpdate(item.id, 'adults', 1)}
              minValue={1}
              maxValue={validation.maxGuests ? validation.maxGuests - item.children : undefined}
            />
            <div className="w-px h-8 bg-neutral-200" />
            <CompactCounter
              label={tBookingForm('childrenLabel')}
              value={item.children}
              priceLabel={`€${item.childPrice}/ea`}
              onDecrement={() => onUpdate(item.id, 'children', -1)}
              onIncrement={() => onUpdate(item.id, 'children', 1)}
              minValue={0}
              maxValue={validation.maxGuests ? validation.maxGuests - item.adults : undefined}
            />
          </>
        )}
      </div>
    </div>
  )
})

interface CompactCounterProps {
  label: string
  value: number
  priceLabel: string
  onDecrement: () => void
  onIncrement: () => void
  minValue?: number
  maxValue?: number
}

const CompactCounter = memo(function CompactCounter({
  label,
  value,
  priceLabel,
  onDecrement,
  onIncrement,
  minValue = 0,
  maxValue
}: CompactCounterProps) {
  const canDecrement = value > minValue
  const canIncrement = maxValue === undefined || value < maxValue

  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 min-w-0">
        <span className="text-xs text-neutral-500">{label}</span>
        {priceLabel && <span className="text-[10px] text-neutral-400 ml-1">{priceLabel}</span>}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onDecrement}
          disabled={!canDecrement}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
            canDecrement
              ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              : 'bg-neutral-50 text-neutral-300 cursor-not-allowed'
          }`}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-semibold text-neutral-900">{value}</span>
        <button
          onClick={onIncrement}
          disabled={!canIncrement}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
            canIncrement
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
})
