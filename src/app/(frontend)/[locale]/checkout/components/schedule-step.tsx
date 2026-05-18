'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { RealCalendar } from '@/components/ui/real-calendar'

interface ScheduleStepProps {
  selectedDate: Date | null
  onDateSelect: (date: Date | null) => void
}

export const ScheduleStep = memo(function ScheduleStep({ selectedDate, onDateSelect }: ScheduleStepProps) {
  const tSchedule = useTranslations('scheduleStep')

  return (
    <motion.div
      key="schedule"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        <h1 className="text-xl sm:text-2xl font-display font-bold text-neutral-900">
          {tSchedule('selectYourDate')}
        </h1>
      </div>

      <RealCalendar
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        className="max-w-sm mx-auto"
      />
    </motion.div>
  )
})
