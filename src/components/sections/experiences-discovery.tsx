'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, ChevronDown, ChevronRight,
  Mountain, Palmtree, Building2, Users,
  Star, Calculator, Wallet, Plus, Minus
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import { useCart, ActivityCartItem } from '@/context/CartContext'
import Image from 'next/image'
import type { Activity, Media } from '@/payload-types'

// Helper functions
function getImageUrl(image: string | number | Media | null | undefined): string {
  if (!image) return '/placeholder-activity.jpg'
  if (typeof image === 'string') return image
  if (typeof image === 'number') return '/placeholder-activity.jpg'
  return image.url || '/placeholder-activity.jpg'
}

function getPrice(activity: Activity): number {
  if (activity.pricingType === 'tiered' && activity.tieredPricing?.tiers && activity.tieredPricing.tiers.length > 0) {
    // Get the LOWEST price from all tiers
    const lowestPrice = Math.min(...activity.tieredPricing.tiers.map(tier => tier.pricePerPerson || 0))
    return lowestPrice
  }
  if (activity.pricingType === 'fixed' && activity.privatePricing?.basePrice) {
    return activity.privatePricing.basePrice
  }
  return 0
}

function getChildPrice(activity: Activity): number {
  if (activity.pricingType === 'tiered' && activity.tieredPricing?.childPrice) {
    return activity.tieredPricing.childPrice
  }
  return 0
}

function getPlainText(description: Activity['description'] | null | undefined): string {
  if (!description?.root?.children) return ''
  const extractText = (node: any): string => {
    if (node.text) return node.text
    if (node.children) return node.children.map(extractText).join('')
    return ''
  }
  return description.root.children.map(extractText).join(' ').slice(0, 200)
}

interface Props {
  activities: Activity[]
}

// Mood categories configuration - using solid brand colors only
const moodCategories = [
  { id: 'adventure', titleKey: 'adventure', subtitleKey: 'adventureSubtitle', descKey: 'adventureDesc', icon: Mountain, bgColor: 'bg-secondary', keywords: ['quad', 'desert', 'safari', 'camel', 'buggy', 'adventure'] },
  { id: 'relaxation', titleKey: 'relaxation', subtitleKey: 'relaxationSubtitle', descKey: 'relaxationDesc', icon: Palmtree, bgColor: 'bg-primary', keywords: ['balloon', 'spa', 'sunset', 'peaceful', 'relax'] },
  { id: 'culture', titleKey: 'culture', subtitleKey: 'cultureSubtitle', descKey: 'cultureDesc', icon: Building2, bgColor: 'bg-secondary', keywords: ['tour', 'medina', 'cooking', 'traditional', 'heritage', 'guided'] },
  { id: 'family', titleKey: 'family', subtitleKey: 'familySubtitle', descKey: 'familyDesc', icon: Users, bgColor: 'bg-primary', keywords: ['family', 'kids', 'children', 'fun'] },
]

export function ExperiencesDiscovery({ activities }: Props) {
  const { addItem } = useCart()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('experiencesDiscovery')

  const [selectedMood, setSelectedMood] = useState<string | null>(null)

  // Build Your Trip state
  const [budget, setBudget] = useState<number>(200)
  const [travelers, setTravelers] = useState<number>(2)
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [showTripBuilder, setShowTripBuilder] = useState(false)

  // Filter activities by mood
  const activitiesByMood = useMemo(() => {
    if (!selectedMood) return []
    const mood = moodCategories.find(m => m.id === selectedMood)
    if (!mood) return []

    return activities.filter(activity => {
      const title = activity.title?.toLowerCase() || ''
      const description = (activity.shortDescription || getPlainText(activity.description))?.toLowerCase() || ''
      return mood.keywords.some(keyword =>
        title.includes(keyword) || description.includes(keyword)
      )
    })
  }, [activities, selectedMood])

  // Get count of activities matching each mood
  const moodActivityCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    moodCategories.forEach(mood => {
      counts[mood.id] = activities.filter(activity => {
        const title = activity.title?.toLowerCase() || ''
        const description = (activity.shortDescription || getPlainText(activity.description))?.toLowerCase() || ''
        return mood.keywords.some(keyword =>
          title.includes(keyword) || description.includes(keyword)
        )
      }).length
    })
    return counts
  }, [activities])

  // Activities that fit within budget per person
  const budgetPerPerson = Math.round(budget / travelers)
  const activitiesWithinBudget = useMemo(() => {
    return activities
      .filter(a => getPrice(a) <= budgetPerPerson)
      .sort((a, b) => getPrice(b) - getPrice(a))
  }, [activities, budgetPerPerson])

  // Selected activities data
  const selectedActivitiesData = useMemo(() => {
    return activities.filter(a => selectedActivities.includes(String(a.id)))
  }, [activities, selectedActivities])

  // Trip totals
  const tripTotals = useMemo(() => {
    const totalPerPerson = selectedActivitiesData.reduce((sum, a) => sum + getPrice(a), 0)
    const totalForAll = totalPerPerson * travelers
    const totalHours = selectedActivitiesData.reduce((sum, a) => {
      const duration = a.duration || ''
      if (duration.toLowerCase().includes('full day')) return sum + 8
      if (duration.toLowerCase().includes('half day')) return sum + 4
      const match = duration.match(/(\d+)\s*(hour|hr)/i)
      if (match) return sum + parseInt(match[1])
      return sum + 2
    }, 0)
    return { totalPerPerson, totalForAll, totalHours, remaining: budget - totalForAll }
  }, [selectedActivitiesData, travelers, budget])

  const toggleActivitySelection = (activityId: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    )
  }

  const handleAddToCart = (activity: Activity) => {
    const cartItem: ActivityCartItem = {
      type: 'activity',
      id: String(activity.id),
      slug: activity.slug,
      title: activity.title,
      image: getImageUrl(activity.featuredImage),
      price: getPrice(activity),
      childPrice: getChildPrice(activity),
      duration: activity.duration || '',
      adults: 1,
      children: 0,
      date: '',
      pricingType: activity.pricingType === 'fixed' ? 'private' : 'per_person',
    }
    addItem(cartItem)
    router.push(`/${locale}/checkout`)
  }

  return (
    <section className="py-16 bg-[#f9f9fb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Mood-Based Discovery Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                {t('whatsYourVibe')}
              </h3>
              <p className="text-neutral-500">{t('selectMood')}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {moodCategories.map((mood, idx) => {
                const IconComponent = mood.icon
                const isActive = selectedMood === mood.id
                const count = moodActivityCounts[mood.id]

                return (
                  <motion.button
                    key={mood.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * idx }}
                    onClick={() => setSelectedMood(isActive ? null : mood.id)}
                    className={`relative overflow-hidden rounded-xl text-left transition-all duration-300 ${
                      isActive ? 'ring-2 ring-neutral-900' : 'hover:opacity-90'
                    }`}
                  >
                    <div className={`h-44 ${mood.bgColor} p-5 flex flex-col justify-between`}>
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-2">
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-display font-bold text-white mb-0.5">
                          {t(mood.titleKey)}
                        </h4>
                        <p className="text-xs text-white/80 mb-2">{t(mood.subtitleKey)}</p>
                        <div className="inline-flex items-center gap-1 text-white/90 text-xs">
                          <span>{count} {t('experiences')}</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Mood Results */}
            <AnimatePresence>
              {selectedMood && activitiesByMood.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-8 pt-8 border-t border-neutral-200">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-lg font-semibold text-neutral-900">
                          {t('moodExperiences', { mood: t(moodCategories.find(m => m.id === selectedMood)?.titleKey || 'adventure') })}
                        </h4>
                        <p className="text-sm text-neutral-500">{t('activitiesMatchVibe', { count: activitiesByMood.length })}</p>
                      </div>
                      <button
                        onClick={() => setSelectedMood(null)}
                        className="text-sm text-primary font-medium hover:underline"
                      >
                        {t('clearSelection')}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activitiesByMood.slice(0, 6).map((activity, idx) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <div className="flex bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-neutral-300 transition-all duration-300">
                            <div className="relative w-28 flex-shrink-0">
                              <Image
                                src={getImageUrl(activity.featuredImage)}
                                alt={activity.title}
                                fill
                                className="object-cover"
                                sizes="112px"
                              />
                            </div>
                            <div className="flex-1 p-3 flex flex-col justify-between">
                              <div>
                                <NavLink href={`/activities/${activity.slug}`}>
                                  <h5 className="font-semibold text-neutral-900 text-sm line-clamp-1 hover:text-primary transition-colors">
                                    {activity.title}
                                  </h5>
                                </NavLink>
                                <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                                  <Clock className="w-3 h-3" />
                                  <span>{activity.duration}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-base font-bold text-neutral-900">€{getPrice(activity)}</span>
                                <button
                                  onClick={() => handleAddToCart(activity)}
                                  className="h-7 px-3 rounded-lg bg-secondary text-white text-xs font-semibold hover:bg-secondary/90 transition-colors"
                                >
                                  {t('book')}
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {activitiesByMood.length > 6 && (
                      <div className="mt-6 text-center">
                        <NavLink
                          href="/experiences"
                          className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                        >
                          {t('viewAllExperiences', { count: activitiesByMood.length })}
                          <ChevronRight className="w-4 h-4" />
                        </NavLink>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Build Your Trip Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
          >
            {/* Header - Always visible */}
            <button
              onClick={() => setShowTripBuilder(!showTripBuilder)}
              className="w-full p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-display font-bold text-neutral-900">{t('buildYourTrip')}</h3>
                  <p className="text-sm text-neutral-500">{t('planActivities')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {selectedActivities.length > 0 && (
                  <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-primary/5 rounded-lg">
                    <span className="text-sm text-neutral-600">{selectedActivities.length} {t('selected')}</span>
                    <span className="text-sm font-bold text-primary">€{tripTotals.totalForAll}</span>
                  </div>
                )}
                <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${showTripBuilder ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
              {showTripBuilder && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 border-t border-neutral-100">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                      {/* Controls Column */}
                      <div className="space-y-6">
                        {/* Budget Control */}
                        <div className="p-4 bg-neutral-50 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-neutral-700">{t('totalBudget')}</label>
                            <span className="text-xl font-bold text-primary">€{budget}</span>
                          </div>
                          <input
                            type="range"
                            min={100}
                            max={2000}
                            step={50}
                            value={budget}
                            onChange={(e) => setBudget(Number(e.target.value))}
                            className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-primary"
                          />
                          <div className="flex justify-between text-xs text-neutral-400 mt-2">
                            <span>€100</span>
                            <span>€2000</span>
                          </div>
                        </div>

                        {/* Travelers Control */}
                        <div className="p-4 bg-neutral-50 rounded-xl">
                          <label className="text-sm font-medium text-neutral-700 mb-3 block">{t('travelers')}</label>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setTravelers(Math.max(1, travelers - 1))}
                              className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                            >
                              <Minus className="w-4 h-4 text-neutral-600" />
                            </button>
                            <span className="text-2xl font-bold text-neutral-900">{travelers}</span>
                            <button
                              onClick={() => setTravelers(Math.min(10, travelers + 1))}
                              className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                            >
                              <Plus className="w-4 h-4 text-neutral-600" />
                            </button>
                          </div>
                          <p className="text-xs text-neutral-400 text-center mt-2">{t('perPerson', { amount: budgetPerPerson })}</p>
                        </div>

                        {/* Trip Summary */}
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                          <h4 className="font-semibold text-neutral-900 mb-3">{t('yourTrip')}</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-neutral-600">{t('activities')}</span>
                              <span className="font-medium text-neutral-900">{selectedActivities.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-neutral-600">{t('totalHours')}</span>
                              <span className="font-medium text-neutral-900">{tripTotals.totalHours}h</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-neutral-600">{t('perPersonLabel')}</span>
                              <span className="font-medium text-neutral-900">€{tripTotals.totalPerPerson}</span>
                            </div>
                            <div className="pt-2 mt-2 border-t border-primary/10">
                              <div className="flex justify-between">
                                <span className="font-medium text-neutral-700">{t('totalPeople', { count: travelers })}</span>
                                <span className="text-lg font-bold text-primary">€{tripTotals.totalForAll}</span>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="text-xs text-neutral-500">{t('remainingBudget')}</span>
                                <span className={`text-sm font-medium ${tripTotals.remaining >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                  €{tripTotals.remaining}
                                </span>
                              </div>
                            </div>
                          </div>
                          {selectedActivities.length > 0 && (
                            <button
                              onClick={() => {
                                selectedActivitiesData.forEach(a => handleAddToCart(a))
                              }}
                              className="w-full mt-4 h-10 bg-secondary text-white font-medium rounded-lg hover:bg-secondary/90 transition-colors"
                            >
                              {t('bookAllActivities')}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Activities Grid - Takes 2 columns */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-neutral-900">{t('availableActivities')}</h4>
                            <p className="text-sm text-neutral-500">{t('activitiesWithinBudget', { count: activitiesWithinBudget.length, budget: budgetPerPerson })}</p>
                          </div>
                          {selectedActivities.length > 0 && (
                            <button
                              onClick={() => setSelectedActivities([])}
                              className="text-sm text-primary font-medium hover:underline"
                            >
                              {t('clearSelectionLower')}
                            </button>
                          )}
                        </div>

                        {activitiesWithinBudget.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                            {activitiesWithinBudget.slice(0, 12).map((activity) => {
                              const isSelected = selectedActivities.includes(String(activity.id))
                              const wouldExceedBudget = !isSelected && (tripTotals.totalForAll + getPrice(activity) * travelers) > budget

                              return (
                                <button
                                  key={activity.id}
                                  onClick={() => !wouldExceedBudget && toggleActivitySelection(String(activity.id))}
                                  disabled={wouldExceedBudget}
                                  className={`flex text-left rounded-xl overflow-hidden border transition-all duration-200 ${
                                    isSelected
                                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                      : wouldExceedBudget
                                      ? 'border-neutral-200 opacity-50 cursor-not-allowed'
                                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                                  }`}
                                >
                                  <div className="relative w-20 h-20 flex-shrink-0">
                                    <Image
                                      src={getImageUrl(activity.featuredImage)}
                                      alt={activity.title}
                                      fill
                                      className="object-cover"
                                      sizes="80px"
                                    />
                                    {isSelected && (
                                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                          <Star className="w-3 h-3 text-white" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 p-3 min-w-0">
                                    <h5 className="font-medium text-neutral-900 text-sm line-clamp-1">{activity.title}</h5>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                                      <Clock className="w-3 h-3 flex-shrink-0" />
                                      <span>{activity.duration}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                      <span className="font-bold text-neutral-900">€{getPrice(activity)}</span>
                                      {wouldExceedBudget && (
                                        <span className="text-xs text-red-500">{t('overBudget')}</span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 bg-neutral-50 rounded-xl">
                            <Wallet className="w-12 h-12 text-neutral-300 mb-3" />
                            <p className="text-neutral-500 text-center">{t('increaseBudget')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
