'use client'

import { memo } from 'react'
import Image from 'next/image'
import { Calendar, Shield, Check, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import type { CartItem, ActivityCartItem } from '@/context/CartContext'
import { getItemImage, getItemTitle, getItemPrice } from './checkout-types'

interface SidebarProps {
  items: CartItem[]
  selectedDate: Date | null
  hasActivities: boolean
  hasTransport: boolean
  activityTotal: number
  transportTotal: number
  total: number
}

// Helper to get guest count display
const getGuestDisplay = (
  item: CartItem,
  tBookingForm: ReturnType<typeof useTranslations>,
): string => {
  if (item.type === 'activity') {
    const actItem = item as ActivityCartItem
    return tBookingForm('guestsCount', { adults: actItem.adults, children: actItem.children })
  }
  return ''
}

// Helper to get pricing type badge
const getPricingTypeBadge = (
  item: CartItem,
  tBookingForm: ReturnType<typeof useTranslations>,
): { label: string; color: string } | null => {
  if (item.type === 'activity') {
    const actItem = item as ActivityCartItem
    if (actItem.pricingType === 'private' || actItem.pricingType === 'fixed') {
      return { label: tBookingForm('pricingPrivate'), color: 'bg-amber-100 text-amber-700' }
    }
    return null
  }
  return null
}

export const Sidebar = memo(function Sidebar({
  items,
  selectedDate,
  hasActivities,
  hasTransport,
  activityTotal,
  transportTotal,
  total,
}: SidebarProps) {
  const t = useTranslations('checkout')
  const tSidebar = useTranslations('sidebarCheckout')
  const tCommon = useTranslations('common')
  const tBookingForm = useTranslations('bookingForm')

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 sticky top-24">
      <h2 className="font-display font-bold text-neutral-900 mb-4">
        {t('summary.title')}
      </h2>

      <div className="space-y-3 mb-6">
        {items.map((item) => {
          const guestDisplay = getGuestDisplay(item, tBookingForm)
          const pricingBadge = getPricingTypeBadge(item, tBookingForm)

          return (
            <div key={`${item.type}-${item.id}`} className="flex gap-3">
              <div className="w-14 h-14 rounded-lg bg-neutral-100 overflow-hidden relative flex-shrink-0">
                <Image
                  src={getItemImage(item)}
                  alt={getItemTitle(item)}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-neutral-900 text-sm truncate">
                    {getItemTitle(item)}
                  </p>
                  {pricingBadge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${pricingBadge.color}`}>
                      {pricingBadge.label}
                    </span>
                  )}
                </div>
                {guestDisplay && (
                  <p className="text-xs text-neutral-500">{guestDisplay}</p>
                )}
                <p className="text-sm text-secondary font-medium">
                  €{getItemPrice(item)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {selectedDate && (
        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4 p-3 bg-neutral-50 rounded-lg">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{format(selectedDate, 'MMM d, yyyy')}</span>
        </div>
      )}

      <div className="border-t border-neutral-200 pt-4">
        {hasActivities && (
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-600">{tSidebar('activities')}</span>
            <span className="font-medium">€{activityTotal}</span>
          </div>
        )}
        {hasTransport && (
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-600">{tSidebar('transport')}</span>
            <span className="font-medium">€{transportTotal}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-neutral-200">
          <span>{tCommon('total')}</span>
          <span className="text-secondary">€{total}</span>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-neutral-200 space-y-2">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Shield className="w-4 h-4 text-red-600" />
          <span>{tSidebar('secureCheckout')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Check className="w-4 h-4 text-red-600" />
          <span>{tSidebar('instantConfirmation')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Clock className="w-4 h-4 text-red-600" />
          <span>{tSidebar('freeCancellation')}</span>
        </div>
      </div>
    </div>
  )
})

interface MobileSummaryProps {
  total: number
  itemCount: number
  selectedDate: Date | null
}

export const MobileSummary = memo(function MobileSummary({ total, itemCount, selectedDate }: MobileSummaryProps) {
  const t = useTranslations('checkout')
  const tCommon = useTranslations('common')

  return (
    <div className="lg:hidden bg-white rounded-xl border border-neutral-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">{t('summary.title')}</p>
          <p className="text-xl font-bold text-secondary">€{total}</p>
        </div>
        <div className="text-right text-sm text-neutral-600">
          <p>{itemCount} {itemCount > 1 ? tCommon('items') : tCommon('item')}</p>
          {selectedDate && (
            <p className="text-primary">{format(selectedDate, 'MMM d')}</p>
          )}
        </div>
      </div>
    </div>
  )
})
