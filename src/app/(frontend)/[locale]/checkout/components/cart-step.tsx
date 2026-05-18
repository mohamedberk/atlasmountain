'use client'

import { memo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { CartItem, ActivityCartItem } from '@/context/CartContext'
import { getItemImage, getItemTitle, getItemPrice } from './checkout-types'

interface CartStepProps {
  items: CartItem[]
  onRemoveItem: (id: string, type: 'activity' | 'transport') => void
}

export const CartStep = memo(function CartStep({ items, onRemoveItem }: CartStepProps) {
  const t = useTranslations('checkout')

  return (
    <motion.div
      key="cart"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h1 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 mb-4 sm:mb-6">
        {t('cart.title')}
      </h1>

      <div className="space-y-3 sm:space-y-4">
        {items.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-neutral-50 rounded-xl"
          >
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 bg-neutral-200 relative">
              <Image
                src={getItemImage(item)}
                alt={getItemTitle(item)}
                fill
                sizes="(max-width: 640px) 64px, 96px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-neutral-900 text-sm sm:text-base line-clamp-2 sm:line-clamp-1">
                    {getItemTitle(item)}
                  </h3>
                  {item.type === 'activity' && (
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {(item as ActivityCartItem).duration}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onRemoveItem(item.id, item.type)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2 text-base sm:text-lg font-bold text-secondary">
                €{getItemPrice(item)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
})
