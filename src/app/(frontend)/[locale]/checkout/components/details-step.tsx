'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FormData, isValidEmail } from './checkout-types'
import dynamic from 'next/dynamic'

const LocationMapPicker = dynamic(
  () => import('@/components/ui/location-map-picker').then(mod => ({ default: mod.LocationMapPicker })),
  { ssr: false, loading: () => <div className="h-48 bg-neutral-100 rounded-xl animate-pulse" /> }
)

interface DetailsStepProps {
  formData: FormData
  onFormChange: (data: FormData) => void
}

export const DetailsStep = memo(function DetailsStep({ formData, onFormChange }: DetailsStepProps) {
  const t = useTranslations('checkout')

  const updateField = (field: keyof FormData, value: string) => {
    onFormChange({ ...formData, [field]: value })
  }

  return (
    <motion.div
      key="details"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        <h1 className="text-xl sm:text-2xl font-display font-bold text-neutral-900">
          {t('details.title')}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {t('details.firstName')} *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            placeholder="John"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {t('details.lastName')}
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            placeholder="Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {t('details.email')} *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={`w-full h-12 px-4 rounded-xl border outline-none transition-all ${
              formData.email && !isValidEmail(formData.email)
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-neutral-300 focus:border-primary focus:ring-primary/20'
            } focus:ring-2`}
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {t('details.phone')} *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            placeholder="+1 234 567 890"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {t('details.pickupLocation')}
          </label>
          <LocationMapPicker
            value={formData.pickupLocation}
            onChange={(value) => updateField('pickupLocation', value)}
            placeholder={t('details.pickupLocationPlaceholder') || 'Search or click on map to select location...'}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {t('details.specialRequests')}
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => updateField('specialRequests', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
            placeholder={t('details.specialRequestsPlaceholder')}
          />
        </div>
      </div>
    </motion.div>
  )
})
