'use client'

import { memo } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CheckoutStep } from './checkout-types'

interface StepNavigationProps {
  steps: CheckoutStep[]
  currentStep: CheckoutStep
  currentStepIndex: number
  total: number
  canContinue: boolean
  onPrev: () => void
  onNext: () => void
}

export const StepNavigation = memo(function StepNavigation({
  steps,
  currentStep,
  currentStepIndex,
  total,
  canContinue,
  onPrev,
  onNext,
}: StepNavigationProps) {
  const tCommon = useTranslations('common')

  if (currentStep === 'payment') return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  idx < currentStepIndex
                    ? 'bg-red-500 text-white'
                    : idx === currentStepIndex
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                {idx < currentStepIndex ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  idx + 1
                )}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-4 sm:w-6 h-0.5 mx-0.5 sm:mx-1 transition-all ${
                    idx < currentStepIndex ? 'bg-red-500' : 'bg-neutral-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Back button */}
          <div className="flex-shrink-0">
            {currentStep !== 'cart' ? (
              <button
                onClick={onPrev}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{tCommon('back')}</span>
              </button>
            ) : (
              <div className="w-12 sm:w-auto" />
            )}
          </div>

          {/* Center: Total (mobile only) */}
          <div className="flex-1 text-center lg:hidden">
            <p className="text-xs text-neutral-500">Total</p>
            <p className="text-base font-bold text-secondary">€{total}</p>
          </div>

          {/* Right: Continue button */}
          <button
            onClick={onNext}
            disabled={!canContinue}
            className="flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 bg-primary text-white rounded-xl font-medium shadow-sm shadow-primary/20 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
          >
            <span>{tCommon('continue')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
})
