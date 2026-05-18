"use client"

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isBefore,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addDays,
} from 'date-fns'
import { cn } from '@/lib/utils'

interface RealCalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  className?: string
  minDate?: Date
  maxDate?: Date
}

export function RealCalendar({
  selectedDate,
  onDateSelect,
  className,
  minDate = new Date(),
  maxDate = addMonths(new Date(), 12)
}: RealCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())
  const tCal = useTranslations('calendarWidget')

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return isBefore(date, today) || isBefore(maxDate, date)
  }

  const isInCurrentMonth = (date: Date) => date >= monthStart && date <= monthEnd

  const canGoPrev = !isBefore(subMonths(currentMonth, 1), subMonths(minDate, 1))
  const canGoNext = !isBefore(maxDate, addMonths(currentMonth, 1))

  // Quick select dates
  const tomorrow = addDays(new Date(), 1)
  const thisWeekend = (() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilSaturday = dayOfWeek === 0 ? 6 : 6 - dayOfWeek
    return addDays(today, daysUntilSaturday)
  })()
  const nextWeek = addDays(new Date(), 7)

  const handleQuickSelect = (date: Date) => {
    if (!isDateDisabled(date)) {
      onDateSelect(date)
      setCurrentMonth(date)
    }
  }

  return (
    <div className={cn("bg-white rounded-xl border border-neutral-200", className)}>
      <div className="p-4">
        {/* Quick Select & Selected Date - TOP */}
        <div className="mb-4 pb-4 border-b border-neutral-100">
          {selectedDate && (
            <div className="mb-3 px-3 py-2 bg-primary/5 rounded-lg text-sm font-medium text-primary">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {[
              { label: tCal('tomorrow'), date: tomorrow },
              { label: tCal('thisWeekend'), date: thisWeekend },
              { label: tCal('nextWeek'), date: nextWeek },
            ].map(({ label, date }) => (
              <button
                key={label}
                onClick={() => handleQuickSelect(date)}
                disabled={isDateDisabled(date)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                  selectedDate && isSameDay(selectedDate, date)
                    ? "bg-primary text-white border-primary"
                    : "border-neutral-200 hover:border-primary/30 hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Month Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => canGoPrev && setCurrentMonth(subMonths(currentMonth, 1))}
            disabled={!canGoPrev}
            className="p-1.5 rounded-full hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold">{format(currentMonth, 'MMMM yyyy')}</span>
          <button
            onClick={() => canGoNext && setCurrentMonth(addMonths(currentMonth, 1))}
            disabled={!canGoNext}
            className="p-1.5 rounded-full hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
            <div key={day} className="text-center text-[10px] font-medium text-neutral-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((date) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isTodayDate = isToday(date)
            const isDisabled = isDateDisabled(date)
            const inMonth = isInCurrentMonth(date)

            return (
              <button
                key={date.toISOString()}
                onClick={() => !isDisabled && onDateSelect(date)}
                disabled={isDisabled}
                className={cn(
                  "h-8 w-full rounded text-xs font-medium transition-colors",
                  isSelected && "bg-primary text-white",
                  !isSelected && isTodayDate && inMonth && "bg-primary/10 text-primary font-bold",
                  !isSelected && !isTodayDate && inMonth && !isDisabled && "hover:bg-neutral-100",
                  !inMonth && "text-neutral-300",
                  isDisabled && "text-neutral-300 cursor-not-allowed"
                )}
              >
                {format(date, 'd')}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
