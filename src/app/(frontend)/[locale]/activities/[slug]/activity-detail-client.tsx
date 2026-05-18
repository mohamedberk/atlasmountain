'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  Star,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Users,
  Share2,
  MapPin,
  Minus,
  Plus,
  Car,
  Coffee,
  Shield,
  Utensils,
  Zap,
  Award,
  Sunrise,
  Camera,
  Gift,
  Home,
  Plane,
  Heart,
  Mountain,
  Sun,
  Wind,
  Eye,
  Ticket,
  Compass,
  Globe,
  Lightbulb
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import { useCart, ActivityCartItem } from '@/context/CartContext'
import type { Activity, Media, Category, Location } from '@/payload-types'
import { useGoogleReviews, type GoogleReview } from '@/hooks/useGoogleReviews'
import { RichText } from '@/components/rich-text'

// Dynamically import map components to avoid SSR issues
const ActivityLocationMap = dynamic(
  () => import('@/components/ui/activity-location-map').then(mod => mod.ActivityLocationMap),
  { ssr: false, loading: () => <div className="h-[300px] bg-neutral-100 rounded-xl animate-pulse" /> }
)

const RouteMap = dynamic(
  () => import('@/components/ui/route-map').then(mod => mod.RouteMap),
  { ssr: false, loading: () => <div className="h-[400px] bg-neutral-100 rounded-xl animate-pulse" /> }
)

// Constants
const STAR_RATINGS = [1, 2, 3, 4, 5] as const
const ACCENT_GREEN = '#49b540'

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      delay,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
}

// Helpers
function getImageUrl(image: string | number | Media | null | undefined): string | null {
  if (!image) return null
  if (typeof image === 'string') return image
  if (typeof image === 'number') return null // ID reference, not populated
  // Check externalUrl first (for UploadThing images), then url
  return image.externalUrl || image.url || null
}

function getLocationName(location: string | number | Location | null | undefined): string {
  if (!location) return 'Morocco'
  if (typeof location === 'string') return location
  if (typeof location === 'number') return 'Morocco' // ID reference, not populated
  return location.name || 'Morocco'
}

function getCategoryName(category: string | number | Category | null | undefined): string {
  if (!category) return 'Experience'
  if (typeof category === 'string') return category
  if (typeof category === 'number') return 'Experience' // ID reference, not populated
  return category.name || 'Experience'
}

function getHighlights(highlights: Activity['highlights']): any[] {
  if (!highlights || !Array.isArray(highlights)) return []
  return highlights.map((h: any) => h.highlight).filter(Boolean)
}

function getIncluded(included: Activity['included']): any[] {
  if (!included || !Array.isArray(included)) return []
  return included.map((i: any) => i.item).filter(Boolean)
}

function getNotIncluded(notIncluded: Activity['notIncluded']): any[] {
  if (!notIncluded || !Array.isArray(notIncluded)) return []
  return notIncluded.map((i: any) => i.item).filter(Boolean)
}

function getRecommendations(recommendations: Activity['recommendations']): any[] {
  if (!recommendations || !Array.isArray(recommendations)) return []
  return recommendations.map((r: any) => r.item).filter(Boolean)
}

function RichTextOrString({ content }: { content: any }) {
  if (typeof content === 'string') return <span>{content}</span>
  if (content?.root?.children) return <RichText content={content} />
  return null
}

function getLanguages(languages: Activity['languages']): string[] {
  if (!languages || !Array.isArray(languages)) return []
  return languages.map((l: any) => l.language || '').filter(Boolean)
}

interface ItineraryStep {
  time?: string
  activity: string
  description?: any
}

function getItinerary(itinerary: Activity['itinerary']): ItineraryStep[] {
  if (!itinerary || !Array.isArray(itinerary)) return []
  return itinerary.map((i: any) => ({
    time: i.time || '',
    activity: i.activity || '',
    description: i.description || null,
  })).filter(i => i.activity)
}

function getActivityCoordinates(activity: Activity): { lat: number; lng: number } | null {
  const activityCoords = (activity as any).coordinates
  if (activityCoords?.latitude && activityCoords?.longitude) {
    return { lat: activityCoords.latitude, lng: activityCoords.longitude }
  }
  const location = (activity as any).location
  if (!location || typeof location === 'string' || typeof location === 'number') return null
  const locationCoords = (location as any).coordinates
  if (!locationCoords?.latitude || !locationCoords?.longitude) return null
  return { lat: locationCoords.latitude, lng: locationCoords.longitude }
}

interface RouteData {
  waypoints: { lat: number; lng: number; name: string }[]
  routeColor: string
  geometry?: string
}

function getRouteData(activity: Activity): RouteData | null {
  const route = (activity as any).route
  if (!route?.enabled) return null

  // Extract waypoints from the new waypoints array
  const waypointsData = route.waypoints
  if (!waypointsData || !Array.isArray(waypointsData) || waypointsData.length < 2) return null

  // Build waypoints array from the new schema
  const waypoints = waypointsData
    .filter((wp: any) => wp.coordinates?.latitude && wp.coordinates?.longitude)
    .map((wp: any) => ({
      lat: wp.coordinates.latitude,
      lng: wp.coordinates.longitude,
      name: wp.name || 'Waypoint',
    }))

  // Need at least 2 valid waypoints
  if (waypoints.length < 2) return null

  return {
    waypoints,
    routeColor: route.routeColor || 'blue',
    // Don't use stored geometry - always calculate fresh based on current waypoints
    // This ensures the route is always correct even if waypoints were changed after calculation
    geometry: undefined,
  }
}

// Section translations
const getSectionTranslations = (lang: string) => {
  if (lang === 'fr') {
    return {
      aboutThisActivity: 'À propos de cette activité',
      highlights: 'Points forts',
      customerReviews: 'Avis clients',
      reviews: 'avis',
      seeAllReviews: 'Voir tous les',
      seeAllReviewsOnGoogle: 'Voir tous les avis sur Google',
      fullDescription: 'Description complète',
      showLess: 'Voir moins',
      seeMore: 'Voir plus',
      whatsIncluded: 'Ce qui est inclus',
      whatsNotIncluded: 'Ce qui n\'est pas inclus',
      yourExperienceStepByStep: 'Votre expérience étape par étape',
      importantInformation: 'Informations importantes',
      knowBeforeYouGo: 'À savoir avant de partir :',
      share: 'Partager',
      linkCopied: 'Lien copié !',
      youMightAlsoLike: 'Vous aimerez aussi',
      whatOurCustomersSay: 'Ce que disent nos clients',
      basedOn: 'Basé sur',
      meetingPoint: 'Point de rencontre',
      whatToBring: 'Quoi apporter',
      overview: 'Aperçu',
      aboutExperience: 'À propos de cette expérience',
      headerText: 'Sélectionnez les participants et la date',
      fromLabel: 'À partir de',
      perPersonLabel: 'par personne',
      totalLabel: 'total',
      adultsLabel: 'Adultes',
      adultLabel: 'Adulte',
      childrenLabel: 'Enfants',
      childLabel: 'Enfant',
      eachLabel: 'chacun',
      checkAvailabilityButton: 'Vérifier la disponibilité',
      whatsappCta: 'Des questions ? Contactez-nous sur WhatsApp',
      group: 'Groupe',
      private: 'Privé',
      extraGuest: 'invité supplémentaire',
      fixedPrice: 'Prix fixe',
      yearRound: 'Toute l\'année',
      groupPricingLabel: 'Tarifs de groupe',
      personLabel: 'personne',
      peopleLabel: 'personnes',
      freeCancellation: 'Annulation gratuite jusqu\'à 24h avant',
      instantConfirmation: 'Confirmation instantanée',
      whatsappQuestion: 'Des questions ? WhatsApp',
      bookNowButton: 'Réserver maintenant',
    }
  }
  return {
    aboutThisActivity: 'About this activity',
    highlights: 'Highlights',
    customerReviews: 'Customer Reviews',
    reviews: 'reviews',
    seeAllReviews: 'See all',
    seeAllReviewsOnGoogle: 'See all reviews on Google',
    fullDescription: 'Full description',
    showLess: 'Show less',
    seeMore: 'See more',
    whatsIncluded: 'What\'s included',
    whatsNotIncluded: 'What\'s not included',
    yourExperienceStepByStep: 'Your experience step by step',
    importantInformation: 'Important information',
    knowBeforeYouGo: 'Know before you go:',
    share: 'Share',
    linkCopied: 'Link copied!',
    youMightAlsoLike: 'You might also like',
    whatOurCustomersSay: 'What Our Customers Say',
    basedOn: 'Based on',
    meetingPoint: 'Meeting point',
    whatToBring: 'What to bring',
    overview: 'Overview',
    aboutExperience: 'About This Experience',
    headerText: 'Select participants and date',
    fromLabel: 'From',
    perPersonLabel: 'per person',
    totalLabel: 'total',
    adultsLabel: 'Adults',
    adultLabel: 'Adult',
    childrenLabel: 'Children',
    childLabel: 'Child',
    eachLabel: 'each',
    checkAvailabilityButton: 'Check availability',
    whatsappCta: 'Questions? WhatsApp us',
    group: 'Group',
    private: 'Private',
    extraGuest: 'extra guest',
    fixedPrice: 'Fixed price',
    yearRound: 'Year round',
    groupPricingLabel: 'Group Pricing',
    personLabel: 'person',
    peopleLabel: 'people',
    freeCancellation: 'Free cancellation up to 24h before',
    instantConfirmation: 'Instant confirmation',
    whatsappQuestion: 'Questions? WhatsApp us',
    bookNowButton: 'Book now',
  }
}

// Star Rating Component
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
  }

  return (
    <div className="flex items-center gap-0.5">
      {STAR_RATINGS.map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating ? 'fill-[#FFB800] text-[#FFB800]' : 'fill-neutral-200 text-neutral-200'
          }`}
        />
      ))}
    </div>
  )
}

// Icon mapping - larger icons for better visibility (24px = w-6 h-6)
const iconMap: Record<string, React.ReactNode> = {
  'clock': <Clock className="w-6 h-6" />,
  'users': <Users className="w-6 h-6" />,
  'car': <Car className="w-6 h-6" />,
  'shield': <Shield className="w-6 h-6" />,
  'coffee': <Coffee className="w-6 h-6" />,
  'utensils': <Utensils className="w-6 h-6" />,
  'camera': <Camera className="w-6 h-6" />,
  'sunrise': <Sunrise className="w-6 h-6" />,
  'zap': <Zap className="w-6 h-6" />,
  'award': <Award className="w-6 h-6" />,
  'map-pin': <MapPin className="w-6 h-6" />,
  'plane': <Plane className="w-6 h-6" />,
  'home': <Home className="w-6 h-6" />,
  'gift': <Gift className="w-6 h-6" />,
  'heart': <Heart className="w-6 h-6" />,
  'star': <Star className="w-6 h-6" />,
  'check': <Check className="w-6 h-6" />,
  'calendar': <Calendar className="w-6 h-6" />,
  'mountain': <Mountain className="w-6 h-6" />,
  'sun': <Sun className="w-6 h-6" />,
  'wind': <Wind className="w-6 h-6" />,
  'eye': <Eye className="w-6 h-6" />,
  'ticket': <Ticket className="w-6 h-6" />,
  'compass': <Compass className="w-6 h-6" />,
  'globe': <Globe className="w-6 h-6" />,
}

const getIcon = (iconName: string) => iconMap[iconName] || <Clock className="w-6 h-6" />

interface Props {
  activity: Activity
  relatedActivities: Activity[]
}

export function ActivityDetailClient({ activity, relatedActivities }: Props) {
  const tNav = useTranslations('activities')
  const tCommon = useTranslations('common')
  const tDetail = useTranslations('activityDetail')
  const { addItem } = useCart()
  const router = useRouter()
  const locale = useLocale()
  const t = useMemo(() => getSectionTranslations(locale), [locale])

  // Google Reviews
  const { reviews: googleReviews, totalReviews: googleTotalReviews, overallRating: googleOverallRating } = useGoogleReviews({ minRating: 4 })
  const hasReviews = googleReviews.length > 0

  // Use activity rating from admin if set, otherwise fall back to Google Reviews
  const overallRating = activity.overallRating ?? googleOverallRating
  const totalReviews = activity.totalReviews ?? googleTotalReviews

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [isStickyVisible, setIsStickyVisible] = useState(false)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [showParticipants, setShowParticipants] = useState(false)
  const [reviewCarouselIndex, setReviewCarouselIndex] = useState(0)

  // Mobile collapsible sections state - default to expanded on mobile for better UX
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    fullDescription: true,
    included: true,
    notIncluded: true,
    itinerary: true,
    recommendations: true,
  })

  // For activities with "both" pricing, let user choose
  const [selectedPricingMode, setSelectedPricingMode] = useState<'group' | 'private'>(
    activity.pricingType === 'fixed' ? 'private' : 'group'
  )

  // Tiered pricing state
  const [selectedTierIndex, setSelectedTierIndex] = useState<number | null>(null)

  const bookingSectionRef = useRef<HTMLDivElement>(null)
  const participantsRef = useRef<HTMLDivElement>(null)

  // Build gallery array
  const images: string[] = useMemo(() => [
    getImageUrl(activity.featuredImage),
    ...((activity.gallery as any[]) || []).map((g) => getImageUrl(g.media)),
  ].filter((url): url is string => url !== null && url !== ''), [activity.featuredImage, activity.gallery])

  const highlights = useMemo(() => getHighlights(activity.highlights), [activity.highlights])
  const included = useMemo(() => getIncluded(activity.included), [activity.included])
  const notIncluded = useMemo(() => getNotIncluded(activity.notIncluded), [activity.notIncluded])
  const recommendations = useMemo(() => getRecommendations(activity.recommendations), [activity.recommendations])
  const itinerary = useMemo(() => getItinerary(activity.itinerary), [activity.itinerary])
  const locationCoords = useMemo(() => getActivityCoordinates(activity), [activity])
  const routeData = useMemo(() => getRouteData(activity), [activity])
  const languages = useMemo(() => getLanguages(activity.languages), [activity.languages])


  // Pricing calculations
  const childPrice = (activity as any).tieredPricing?.childPrice || 0
  const privateBasePrice = activity.privatePricing?.basePrice || 0
  const privateMinGuests = activity.privatePricing?.minGuests || 1
  const privateMaxGuests = activity.privatePricing?.maxGuests || undefined
  const privateAdditionalGuestPrice = activity.privatePricing?.additionalGuestPrice || 0

  // Tiered pricing data
  const tieredPricingEnabled = activity.pricingType === 'tiered'
  const tieredPricingTiers = (activity as any).tieredPricing?.tiers || []
  const customPricingNote = (activity as any).customPricingNote?.note || null
  const isCustomNoteMode = activity.pricingType === 'custom_note'

  // Get applicable tier based on current adult count
  const getApplicableTier = useCallback(() => {
    if (!tieredPricingEnabled || tieredPricingTiers.length === 0) return null
    return tieredPricingTiers.find(
      (tier: any) => {
        const minPeople = tier.numberOfPeople || tier.minPeople
        const maxPeople = tier.maxPeople || tier.numberOfPeople || tier.minPeople
        return adults >= minPeople && adults <= maxPeople
      }
    )
  }, [adults, tieredPricingEnabled, tieredPricingTiers])

  const applicableTier = getApplicableTier()

  const isPrivateMode = selectedPricingMode === 'private'

  // For display price, show the LOWEST price from tiered pricing
  const getLowestTierPrice = () => {
    if (!tieredPricingEnabled || tieredPricingTiers.length === 0) return 0
    return Math.min(...tieredPricingTiers.map((tier: any) => tier.pricePerPerson))
  }

  const displayPrice = isPrivateMode
    ? privateBasePrice
    : (tieredPricingEnabled && tieredPricingTiers.length > 0)
      ? getLowestTierPrice()
      : (applicableTier ? applicableTier.pricePerPerson : 0)

  const calculateTotal = useCallback(() => {
    if (isPrivateMode) {
      const totalGuests = adults + children
      const extraGuests = Math.max(0, totalGuests - privateMinGuests)
      return privateBasePrice + (extraGuests * privateAdditionalGuestPrice)
    } else if (isCustomNoteMode) {
      return 0 // No price for custom note mode
    } else {
      // Check for tiered pricing
      if (tieredPricingEnabled && applicableTier) {
        return (applicableTier.pricePerPerson * adults) + (childPrice * children)
      }
      return 0
    }
  }, [isPrivateMode, isCustomNoteMode, adults, children, privateMinGuests, privateBasePrice, privateAdditionalGuestPrice, childPrice, tieredPricingEnabled, applicableTier])

  const totalPrice = calculateTotal()

  // Handle scroll for sticky booking
  useEffect(() => {
    const handleScroll = () => {
      if (bookingSectionRef.current) {
        const rect = bookingSectionRef.current.getBoundingClientRect()
        setIsStickyVisible(rect.bottom < 0)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideParticipants =
        (participantsRef.current && participantsRef.current.contains(target))
      if (!isInsideParticipants) {
        setShowParticipants(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Preload all gallery images so switching is instant
  useEffect(() => {
    images.forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
  }, [images])

  // Lock body scroll when gallery is open
  useEffect(() => {
    if (isGalleryOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isGalleryOpen])

  const handleAddToCart = useCallback(() => {
    const cartItem: ActivityCartItem = {
      type: 'activity',
      id: String(activity.id),
      slug: activity.slug,
      title: activity.title,
      image: getImageUrl(activity.featuredImage) || '',
      price: isCustomNoteMode ? 0 : (isPrivateMode ? privateBasePrice : (applicableTier ? applicableTier.pricePerPerson : 0)),
      childPrice: isCustomNoteMode ? 0 : (isPrivateMode ? 0 : childPrice),
      duration: activity.duration || '',
      adults: adults,
      children: children,
      date: '',
      pricingType: isCustomNoteMode ? 'custom_note' : (isPrivateMode ? 'private' : 'per_person'),
      customPricingNote: isCustomNoteMode ? customPricingNote || undefined : undefined,
      privatePrice: isPrivateMode ? calculateTotal() : undefined,
      privateBasePrice: privateBasePrice || undefined,
      privateMinGuests: privateMinGuests || undefined,
      privateMaxGuests: privateMaxGuests || undefined,
      privateAdditionalGuestPrice: privateAdditionalGuestPrice || undefined,
      // Tiered pricing
      tieredPricingEnabled: tieredPricingEnabled || undefined,
      tierInfo: applicableTier || undefined,
      allTiers: tieredPricingEnabled ? tieredPricingTiers : undefined,
    }
    addItem(cartItem)
    router.push(`/${locale}/checkout/${activity.slug}`)
  }, [activity, isCustomNoteMode, customPricingNote, isPrivateMode, privateBasePrice, childPrice, adults, children, calculateTotal, privateMinGuests, privateMaxGuests, privateAdditionalGuestPrice, addItem, router, locale, applicableTier, tieredPricingEnabled, tieredPricingTiers])

  const handleShare = useCallback(async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }, [])

  const nextImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prevImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }, [])

  const nextReview = useCallback(() => {
    setReviewCarouselIndex((prev) => (prev + 1) % googleReviews.length)
  }, [googleReviews.length])

  const prevReview = useCallback(() => {
    setReviewCarouselIndex((prev) => (prev - 1 + googleReviews.length) % googleReviews.length)
  }, [googleReviews.length])

  // Activity features for "About this activity" section
  // Uses CMS data if available, otherwise auto-generates from activity fields
  const activityFeatures = useMemo(() => {
    // Check if CMS has custom features defined
    const cmsFeatures = (activity as any).aboutSection?.features
    if (cmsFeatures && Array.isArray(cmsFeatures) && cmsFeatures.length > 0) {
      return cmsFeatures.map((f: any) => ({
        icon: f.icon || 'clock',
        title: f.title || '',
        description: f.description || null,
      }))
    }

    // Auto-generate from activity fields (default behavior)
    const groupSizeDescription = (() => {
      if (activity.pricingType === 'fixed') {
        return tDetail('privateTour')
      }
      if (activity.pricingType === 'tiered' && activity.tieredPricing?.tiers) {
        const tiers = activity.tieredPricing.tiers
        if (tiers.length > 0) {
          const maxTier = tiers[tiers.length - 1]
          const maxPeople = maxTier.maxPeople || maxTier.numberOfPeople
          return maxPeople ? tDetail('upToPeople', { count: maxPeople }) : tDetail('flexibleGroupSize')
        }
      }
      if (activity.pricingType === 'custom_note') {
        return tDetail('contactForDetails')
      }
      return tDetail('flexibleGroupSize')
    })()

    return [
      { icon: 'clock', title: activity.duration || '3-4 hours', description: tNav('yearRound') },
      { icon: 'users', title: activity.pricingType === 'fixed' ? t.private : t.group, description: groupSizeDescription },
      { icon: 'map-pin', title: getLocationName((activity as any).location), description: tDetail('meetingPointDesc') },
      ...(languages.length > 0 ? [{ icon: 'globe', title: languages.slice(0, 2).join(', '), description: tDetail('availableLanguages') }] : []),
    ]
  }, [activity, languages, t, tNav, tDetail])

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Mobile Bottom Booking Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-neutral-200 shadow-md lg:hidden"
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold" style={{ color: ACCENT_GREEN }}>€{displayPrice}</span>
                <span className="text-sm text-neutral-500">{isPrivateMode ? t.totalLabel : t.perPersonLabel}</span>
              </div>
              {activity.isFeatured && (
                <div className="mt-1">
                  <span className="inline-block px-2.5 py-1 text-white text-xs font-semibold rounded" style={{ backgroundColor: ACCENT_GREEN }}>
                    {tCommon('featured')}
                  </span>
                </div>
              )}
            </div>
            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 max-w-[200px] px-6 py-3.5 text-white font-bold text-base rounded-xl transition-all shadow-sm hover:shadow-md"
              style={{ backgroundColor: ACCENT_GREEN }}
            >
              {t.checkAvailabilityButton}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Sticky Desktop Bar */}
      <AnimatePresence>
        {isStickyVisible && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 shadow-sm hidden lg:block"
          >
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <h2 className="font-bold text-lg text-neutral-900 truncate max-w-[350px]">{activity.title}</h2>
                  {(overallRating || totalReviews) && (
                    <div className="flex items-center gap-2">
                      <StarRating rating={Math.round(overallRating || 5)} size="md" />
                      <span className="text-base text-neutral-600">{overallRating} ({totalReviews} {t.reviews})</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-sm text-neutral-500">{t.fromLabel} </span>
                    <span className="text-2xl font-bold" style={{ color: ACCENT_GREEN }}>€{displayPrice}</span>
                    <span className="text-base text-neutral-500"> /{isPrivateMode ? t.totalLabel : t.perPersonLabel}</span>
                  </div>
                  <motion.button
                    onClick={handleAddToCart}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 text-white font-bold text-base rounded-xl transition-all shadow-md"
                    style={{ backgroundColor: ACCENT_GREEN }}
                  >
                    {t.checkAvailabilityButton}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb spacer - maintains spacing without visible content */}
      <div className="bg-neutral-50 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          {/* Empty spacer to maintain consistent layout */}
          <div className="h-5" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 lg:pt-8 pb-32 lg:pb-16">
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Image Gallery */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              {/* Main Image */}
              <div
                className="relative aspect-[3/4] sm:aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer group shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
                onClick={() => setIsGalleryOpen(true)}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {images[activeImageIndex] && (
                    <motion.div
                      key={activeImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={images[activeImageIndex]}
                        alt={`${activity.title} - Photo ${activeImageIndex + 1}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 900px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority
                        quality={90}
                        unoptimized={images[activeImageIndex].includes('utfs.io') || images[activeImageIndex].includes('uploadthing')}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-white/95 backdrop-blur-sm text-neutral-900 px-3 py-1.5 rounded-full font-semibold text-xs shadow-sm">
                    {getCategoryName(activity.category)}
                  </span>
                  {activity.isFeatured && (
                    <span className="text-white px-3 py-1.5 rounded-full font-semibold text-xs flex items-center gap-1" style={{ backgroundColor: ACCENT_GREEN }}>
                      <Award className="w-3.5 h-3.5" />
                      {tCommon('featured')}
                    </span>
                  )}
                </div>

                {/* Photo count badge */}
                <button className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-black/70 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  +{images.length}
                </button>

                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage() }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5 text-neutral-900" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage() }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5 text-neutral-900" />
                    </button>
                  </>
                )}

                {/* Dots indicator */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {images.slice(0, 5).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx) }}
                        className={`h-2 rounded-full transition-all ${
                          idx === activeImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="hidden sm:grid grid-cols-5 gap-2 mt-2">
                  {images.slice(0, 5).map((img, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      whileHover={{ scale: 1.02 }}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all"
                      style={{
                        borderColor: idx === activeImageIndex ? ACCENT_GREEN : 'transparent',
                        boxShadow: idx === activeImageIndex ? `0 0 0 2px ${ACCENT_GREEN}20` : 'none'
                      }}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        sizes="120px"
                        className="object-cover"
                        unoptimized={img.includes('utfs.io') || img.includes('uploadthing')}
                      />
                      {idx === 4 && images.length > 5 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">+{images.length - 5}</span>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Title & Rating Section */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0.2}
              className="space-y-4"
            >
              {/* Top Rated Badge */}
              {overallRating && overallRating >= 4.5 && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: ACCENT_GREEN }}>
                    <Award className="w-4 h-4" />
                    Top rated
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-[#FFB800] text-[#FFB800]" />
                    <span className="font-bold text-neutral-900 text-lg">{overallRating}</span>
                    {totalReviews && (
                      <span className="text-neutral-500">({totalReviews})</span>
                    )}
                  </div>
                </div>
              )}

              {/* Title and Share button on same line */}
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight tracking-tight" style={{ fontFamily: 'var(--font-circular), sans-serif' }}>
                  {activity.title}
                </h1>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 hover:border-neutral-300 transition-colors text-sm font-medium text-neutral-700 shrink-0"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4 text-[#4CAF50]" />
                      <span className="text-[#4CAF50]">{t.linkCopied}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>{t.share}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Rating for lower-rated activities */}
              {(overallRating && overallRating < 4.5) || (totalReviews && (!overallRating || overallRating < 4.5)) ? (
                <div className="flex flex-wrap items-center gap-4">
                  {overallRating && overallRating < 4.5 && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-5 h-5 fill-[#FFB800] text-[#FFB800]" />
                      <span className="font-bold text-neutral-900 text-lg">{overallRating}</span>
                    </div>
                  )}
                  {totalReviews && (!overallRating || overallRating < 4.5) && (
                    <NavLink href="#reviews" className="text-base text-neutral-600 underline transition-colors hover:text-[#49b540]">
                      {totalReviews} {t.reviews}
                    </NavLink>
                  )}
                </div>
              ) : null}
            </motion.div>

            {/* Mobile Pricing Section - Show pricing options on mobile */}
            <div className="lg:hidden">
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm">
                {/* Green top accent bar */}
                <div className="h-2 rounded-t-2xl" style={{ backgroundColor: ACCENT_GREEN }} />

                <div className="p-5 space-y-4">
                  {/* Pricing Display Section */}
                  {isCustomNoteMode && customPricingNote ? (
                    /* Custom Note Display */
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <p className="text-lg text-neutral-900 font-medium whitespace-pre-wrap">
                          {customPricingNote}
                        </p>
                      </div>
                    </div>
                  ) : tieredPricingEnabled && tieredPricingTiers.length > 0 ? (
                    /* Tiered Pricing Card */
                    <>
                      {/* Header with "Group Pricing" and "per person" */}
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-lg font-semibold text-neutral-900">{t.groupPricingLabel}</h3>
                        <span className="text-sm text-neutral-600">{t.perPersonLabel}</span>
                      </div>

                      {/* Tiered pricing list */}
                      <div className="space-y-2">
                        {tieredPricingTiers.map((tier: any, index: number) => {
                          const numPeople = tier.numberOfPeople || tier.minPeople
                          const maxPeople = tier.maxPeople || numPeople
                          const isSinglePerson = !tier.maxPeople || maxPeople === numPeople
                          const isSelected = adults >= numPeople && adults <= maxPeople

                          return (
                            <button
                              key={index}
                              onClick={() => {
                                setAdults(numPeople)
                                setChildren(0)
                              }}
                              className={`w-full flex justify-between items-center p-3 rounded-lg transition-all ${
                                isSelected
                                  ? 'bg-green-50 border-2 border-green-500'
                                  : 'bg-neutral-50 border border-transparent hover:bg-neutral-100'
                              }`}
                            >
                              <span className={`text-sm ${isSelected ? 'font-semibold' : ''}`}>
                                {isSinglePerson
                                  ? `${numPeople} ${numPeople === 1 ? t.personLabel : t.peopleLabel}`
                                  : `${numPeople}-${maxPeople} ${t.peopleLabel}`
                                }
                              </span>
                              <span className={`text-sm font-semibold text-green-600 ${isSelected ? 'font-bold' : ''}`}>
                                €{tier.pricePerPerson}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  ) : !isCustomNoteMode && (
                    /* Standard Price Display */
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold" style={{ color: ACCENT_GREEN }}>€{displayPrice}</span>
                        <span className="text-base text-neutral-500">{isPrivateMode ? t.totalLabel : t.perPersonLabel}</span>
                      </div>
                      {isPrivateMode && privateAdditionalGuestPrice > 0 && (
                        <p className="text-sm text-neutral-500 mt-1">
                          +€{privateAdditionalGuestPrice} per {t.extraGuest} above {privateMinGuests}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Short Description */}
            {activity.shortDescription && (
              <p className="text-lg text-neutral-700 leading-relaxed whitespace-pre-line">
                {activity.shortDescription}
              </p>
            )}

            {/* Full Description - Moved above About this activity */}
            {activity.description?.root?.children && activity.description.root.children.length > 0 && (
              <div className="space-y-5">
                <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">{t.fullDescription}</h2>

                {/* Mobile - Collapsible */}
                <div className="lg:hidden">
                  <div className={`text-neutral-700 leading-relaxed text-base overflow-hidden [&_p]:mb-2 [&_p:last-child]:mb-0 ${!expandedSections.fullDescription ? 'line-clamp-4' : ''}`}>
                    <RichText content={activity.description} />
                  </div>
                  <button
                    onClick={() => toggleSection('fullDescription')}
                    className="flex items-center gap-1 mt-2 text-sm font-semibold hover:underline"
                    style={{ color: ACCENT_GREEN }}
                  >
                    {expandedSections.fullDescription ? t.showLess : t.seeMore}
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.fullDescription ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Desktop - Always visible */}
                <div className="hidden lg:block text-neutral-700 leading-relaxed text-base [&_p]:mb-3 [&_p:last-child]:mb-0">
                  <RichText content={activity.description} />
                </div>
              </div>
            )}

            {/* About this activity - Features */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="space-y-5"
            >
              <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">{t.aboutThisActivity}</h2>
              <div className="space-y-4">
                {activityFeatures.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeInUp}
                    custom={idx * 0.1}
                    className="flex gap-4 items-start"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: ACCENT_GREEN }}>
                      {getIcon(feature.icon)}
                    </div>
                    <div className="pt-1">
                      <p className="font-bold text-neutral-900 text-base">{feature.title}</p>
                      {feature.description && (
                        <div className="text-sm text-neutral-600 mt-0.5 [&_p]:mb-0">
                          <RichTextOrString content={feature.description} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Highlights Section */}
            {highlights.length > 0 && (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="space-y-5"
              >
                <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">{t.highlights}</h2>
                <ul className="space-y-3">
                  {highlights.map((highlight, idx) => (
                    <motion.li
                      key={idx}
                      variants={fadeInUp}
                      custom={idx * 0.05}
                      className="flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${ACCENT_GREEN}20` }}>
                          <Check className="w-4 h-4" style={{ color: ACCENT_GREEN }} />
                        </div>
                      </div>
                      <div className="text-neutral-700 text-base [&_p]:mb-0"><RichTextOrString content={highlight} /></div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Reviews Section - Mobile Carousel / Desktop Grid */}
            {hasReviews && (
              <div id="reviews" className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">{t.customerReviews}</h2>
                  {(overallRating || totalReviews) && (
                    <div className="flex items-center gap-2">
                      {overallRating && (
                        <div className="flex items-center gap-1.5">
                          <Star className="w-5 h-5 fill-[#FFB800] text-[#FFB800]" />
                          <span className="font-bold text-neutral-900 text-lg">{overallRating}</span>
                        </div>
                      )}
                      {totalReviews && (
                        <span className="text-base text-neutral-500">({totalReviews} {t.reviews})</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Mobile Carousel */}
                <div className="lg:hidden relative">
                  <div className="overflow-hidden">
                    {googleReviews[reviewCarouselIndex] && (
                      <motion.div
                        key={reviewCarouselIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-[#49b540]/30 hover:shadow-[0_6px_14px_-10px_rgba(0,0,0,0.04)] transition-all shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col h-full min-h-[220px]"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {googleReviews[reviewCarouselIndex].profilePhotoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={googleReviews[reviewCarouselIndex].profilePhotoUrl}
                                alt={googleReviews[reviewCarouselIndex].name}
                                className="w-11 h-11 rounded-full object-cover ring-2 ring-neutral-100"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-[#49b540] flex items-center justify-center text-white font-semibold text-sm">
                                {googleReviews[reviewCarouselIndex].avatar}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-semibold text-[15px] text-neutral-900">{googleReviews[reviewCarouselIndex].name}</span>
                              <span className="text-xs text-neutral-500">{googleReviews[reviewCarouselIndex].date}</span>
                            </div>
                          </div>
                          <svg className="w-5 h-5 shrink-0 mt-1" viewBox="0 0 24 24" fill="none">
                            <path d="M21.8055 10.0415H12V14.0415H17.6515C16.827 16.3275 14.6115 17.9555 12 17.9555C8.8385 17.9555 6.267 15.384 6.267 12.2225C6.267 9.06097 8.8385 6.48947 12 6.48947C13.5255 6.48947 14.9155 7.06447 15.9585 8.01747L18.873 5.10297C17.085 3.42747 14.6715 2.39697 12 2.39697C6.4785 2.39697 2 6.87547 2 12.397C2 17.9185 6.4785 22.397 12 22.397C18.24 22.397 22.5 17.0655 22.5 11.147C22.5 10.787 22.473 10.4125 22.41 10.0415H21.8055Z" fill="#4285F4"/>
                            <path d="M3.15454 7.45574L6.43704 9.87724C7.32754 7.89424 9.48004 6.48949 12 6.48949C13.5255 6.48949 14.9155 7.06449 15.9585 8.01749L18.873 5.10299C17.085 3.42749 14.6715 2.39699 12 2.39699C8.1585 2.39699 4.82704 4.49999 3.15454 7.45574Z" fill="#EA4335"/>
                            <path d="M12 22.397C14.6115 22.397 16.9695 21.4145 18.74 19.8115L15.5115 17.1975C14.5717 17.8679 13.3654 18.255 12 18.255C9.39904 18.255 7.19054 16.6415 6.35404 14.3695L3.09754 16.8925C4.75204 20.1555 8.13754 22.397 12 22.397Z" fill="#34A853"/>
                            <path d="M22.5 11.147C22.5 10.787 22.473 10.4125 22.41 10.0415H12V14.0415H17.6515C17.2635 15.1185 16.437 16.0175 15.51 16.6305L15.5115 16.6305L18.7415 19.2425C18.4845 19.476 22.5 16.5 22.5 11.147Z" fill="#FBBC05"/>
                          </svg>
                        </div>
                        <div className="flex gap-0.5 mb-3">
                          {[...Array(5)].map((_, s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${s < googleReviews[reviewCarouselIndex].rating ? 'fill-[#49b540] text-[#49b540]' : 'fill-neutral-200 text-neutral-200'}`}
                            />
                          ))}
                        </div>
                        <p className="text-neutral-600 text-[14px] leading-[1.7] line-clamp-4 flex-1">
                          &ldquo;{googleReviews[reviewCarouselIndex].text}&rdquo;
                        </p>
                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                          <span className="text-[11px] text-neutral-400">Posted on Google</span>
                          {googleReviews[reviewCarouselIndex].profileUrl && (
                            <a
                              href={googleReviews[reviewCarouselIndex].profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-[#49b540] hover:underline"
                            >
                              View profile
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Carousel Controls */}
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={prevReview}
                      className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-neutral-600" />
                    </button>
                    <div className="flex items-center gap-1.5">
                      {googleReviews.slice(0, 2).map((_: unknown, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setReviewCarouselIndex(idx)}
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: idx === reviewCarouselIndex ? '16px' : '8px',
                            backgroundColor: idx === reviewCarouselIndex ? ACCENT_GREEN : '#d4d4d4'
                          }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={nextReview}
                      className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-neutral-600" />
                    </button>
                  </div>
                </div>

                {/* Desktop Grid */}
                <div className="hidden lg:grid grid-cols-2 gap-4">
                  {googleReviews.slice(0, 2).map((review: GoogleReview) => (
                    <motion.div
                      key={review.id}
                      variants={scaleIn}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-[#49b540]/30 hover:shadow-[0_6px_14px_-10px_rgba(0,0,0,0.04)] transition-all shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col h-full min-h-[220px]"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {review.profilePhotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={review.profilePhotoUrl}
                              alt={review.name}
                              className="w-11 h-11 rounded-full object-cover ring-2 ring-neutral-100"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-[#49b540] flex items-center justify-center text-white font-semibold text-sm">
                              {review.avatar}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-[15px] text-neutral-900">{review.name}</span>
                            <span className="text-xs text-neutral-500">{review.date}</span>
                          </div>
                        </div>
                        <svg className="w-5 h-5 shrink-0 mt-1" viewBox="0 0 24 24" fill="none">
                          <path d="M21.8055 10.0415H12V14.0415H17.6515C16.827 16.3275 14.6115 17.9555 12 17.9555C8.8385 17.9555 6.267 15.384 6.267 12.2225C6.267 9.06097 8.8385 6.48947 12 6.48947C13.5255 6.48947 14.9155 7.06447 15.9585 8.01747L18.873 5.10297C17.085 3.42747 14.6715 2.39697 12 2.39697C6.4785 2.39697 2 6.87547 2 12.397C2 17.9185 6.4785 22.397 12 22.397C18.24 22.397 22.5 17.0655 22.5 11.147C22.5 10.787 22.473 10.4125 22.41 10.0415H21.8055Z" fill="#4285F4"/>
                          <path d="M3.15454 7.45574L6.43704 9.87724C7.32754 7.89424 9.48004 6.48949 12 6.48949C13.5255 6.48949 14.9155 7.06449 15.9585 8.01749L18.873 5.10299C17.085 3.42749 14.6715 2.39699 12 2.39699C8.1585 2.39699 4.82704 4.49999 3.15454 7.45574Z" fill="#EA4335"/>
                          <path d="M12 22.397C14.6115 22.397 16.9695 21.4145 18.74 19.8115L15.5115 17.1975C14.5717 17.8679 13.3654 18.255 12 18.255C9.39904 18.255 7.19054 16.6415 6.35404 14.3695L3.09754 16.8925C4.75204 20.1555 8.13754 22.397 12 22.397Z" fill="#34A853"/>
                          <path d="M22.5 11.147C22.5 10.787 22.473 10.4125 22.41 10.0415H12V14.0415H17.6515C17.2635 15.1185 16.437 16.0175 15.51 16.6305L15.5115 16.6305L18.7415 19.2425C18.4845 19.476 22.5 16.5 22.5 11.147Z" fill="#FBBC05"/>
                        </svg>
                      </div>
                      <div className="flex gap-0.5 mb-3">
                        {[...Array(5)].map((_, s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${s < review.rating ? 'fill-[#49b540] text-[#49b540]' : 'fill-neutral-200 text-neutral-200'}`}
                          />
                        ))}
                      </div>
                      <p className="text-neutral-600 text-[14px] leading-[1.7] line-clamp-4 flex-1">
                        &ldquo;{review.text}&rdquo;
                      </p>
                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                        <span className="text-[11px] text-neutral-400">Posted on Google</span>
                        {review.profileUrl && (
                          <a
                            href={review.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#49b540] hover:underline"
                          >
                            View profile
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* See all reviews link */}
                {totalReviews && (
                  <NavLink
                    href="#all-reviews"
                    className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    style={{ color: ACCENT_GREEN }}
                  >
                    {t.seeAllReviews} {totalReviews} {t.reviews}
                    <ChevronRight className="w-4 h-4" />
                  </NavLink>
                )}
              </div>
            )}

            {/* What's Included - Collapsible on Mobile */}
            {included.length > 0 && (
              <div className="space-y-4">
                {/* Mobile - Collapsible Header */}
                <button
                  onClick={() => toggleSection('included')}
                  className="lg:hidden w-full flex items-center justify-between py-3 border-b border-neutral-100"
                >
                  <h2 className="text-xl font-bold text-neutral-900">{t.whatsIncluded}</h2>
                  <ChevronDown className={`w-6 h-6 text-neutral-500 transition-transform ${expandedSections.included ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop - Static Header */}
                <h2 className="hidden lg:block text-xl lg:text-2xl font-bold text-neutral-900">{t.whatsIncluded}</h2>

                {/* Mobile - Collapsible Content */}
                <AnimatePresence>
                  {expandedSections.included && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="lg:hidden overflow-hidden"
                    >
                      <div className="grid gap-3 pt-2">
                        {included.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${ACCENT_GREEN}20` }}>
                              <Check className="w-4 h-4" style={{ color: ACCENT_GREEN }} />
                            </div>
                            <div className="text-neutral-700 text-base [&_p]:mb-0"><RichTextOrString content={item} /></div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Desktop - Always visible */}
                <div className="hidden lg:grid sm:grid-cols-2 gap-3">
                  {included.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${ACCENT_GREEN}20` }}>
                        <Check className="w-4 h-4" style={{ color: ACCENT_GREEN }} />
                      </div>
                      <div className="text-neutral-700 text-base [&_p]:mb-0"><RichTextOrString content={item} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's NOT Included - Collapsible on Mobile */}
            {notIncluded.length > 0 && (
              <div className="space-y-4">
                {/* Mobile - Collapsible Header */}
                <button
                  onClick={() => toggleSection('notIncluded')}
                  className="lg:hidden w-full flex items-center justify-between py-3 border-b border-neutral-100"
                >
                  <h2 className="text-xl font-bold text-neutral-900">{t.whatsNotIncluded}</h2>
                  <ChevronDown className={`w-6 h-6 text-neutral-500 transition-transform ${expandedSections.notIncluded ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop - Static Header */}
                <h2 className="hidden lg:block text-xl lg:text-2xl font-bold text-neutral-900">{t.whatsNotIncluded}</h2>

                {/* Mobile - Collapsible Content */}
                <AnimatePresence>
                  {expandedSections.notIncluded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="lg:hidden overflow-hidden"
                    >
                      <div className="grid gap-3 pt-2">
                        {notIncluded.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                              <X className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="text-neutral-700 text-base [&_p]:mb-0"><RichTextOrString content={item} /></div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Desktop - Always visible */}
                <div className="hidden lg:grid sm:grid-cols-2 gap-3">
                  {notIncluded.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <X className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="text-neutral-700 text-base [&_p]:mb-0"><RichTextOrString content={item} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary Section - Collapsible on Mobile */}
            {itinerary.length > 0 && (
              <div className="space-y-5">
                {/* Mobile - Collapsible Header */}
                <button
                  onClick={() => toggleSection('itinerary')}
                  className="lg:hidden w-full flex items-center justify-between py-3 border-b border-neutral-100"
                >
                  <h2 className="text-xl font-bold text-neutral-900">{t.yourExperienceStepByStep}</h2>
                  <ChevronDown className={`w-6 h-6 text-neutral-500 transition-transform ${expandedSections.itinerary ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop - Static Header */}
                <h2 className="hidden lg:block text-xl lg:text-2xl font-bold text-neutral-900">{t.yourExperienceStepByStep}</h2>

                {/* Mobile - Collapsible Content */}
                <AnimatePresence>
                  {expandedSections.itinerary && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="lg:hidden overflow-hidden"
                    >
                      <div className="relative pt-2">
                        <div className="absolute left-5 top-10 bottom-8 w-0.5" style={{ background: `linear-gradient(to bottom, ${ACCENT_GREEN}, ${ACCENT_GREEN}80, ${ACCENT_GREEN}30)` }} />
                        <div className="space-y-5">
                          {itinerary.map((step, idx) => (
                            <div key={idx} className="relative flex gap-4">
                              <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full text-white flex items-center justify-center shadow-sm text-base font-bold" style={{ backgroundColor: ACCENT_GREEN }}>
                                {idx + 1}
                              </div>
                              <div className="flex-1 pb-1 pt-1">
                                <h3 className="font-bold text-neutral-900 text-base">{step.activity}</h3>
                                {step.time && (
                                  <p className="text-sm font-medium mt-1" style={{ color: ACCENT_GREEN }}>
                                    Time: {step.time}
                                  </p>
                                )}
                                {step.description && (
                                  <div className="text-sm text-neutral-600 leading-relaxed mt-2 [&_p]:mb-1 [&_p:last-child]:mb-0">
                                    {typeof step.description === 'string' ? (
                                      <p className="whitespace-pre-line">{step.description}</p>
                                    ) : (
                                      <RichText content={step.description} />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Desktop - Always visible */}
                <div className="hidden lg:block relative">
                  <div className="absolute left-5 top-8 bottom-8 w-0.5" style={{ background: `linear-gradient(to bottom, ${ACCENT_GREEN}, ${ACCENT_GREEN}80, ${ACCENT_GREEN}30)` }} />
                  <div className="space-y-5">
                    {itinerary.map((step, idx) => (
                      <motion.div
                        key={idx}
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        custom={idx * 0.1}
                        className="relative flex gap-4"
                      >
                        <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full text-white flex items-center justify-center shadow-sm text-base font-bold" style={{ backgroundColor: ACCENT_GREEN }}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 pb-1 pt-1">
                          <h3 className="font-bold text-neutral-900 text-base">{step.activity}</h3>
                          {step.time && (
                            <p className="text-sm font-medium mt-1" style={{ color: ACCENT_GREEN }}>
                              Time: {step.time}
                            </p>
                          )}
                          {step.description && (
                            <div className="text-sm text-neutral-600 leading-relaxed mt-2 [&_p]:mb-1 [&_p:last-child]:mb-0">
                              {typeof step.description === 'string' ? (
                                <p className="whitespace-pre-line">{step.description}</p>
                              ) : (
                                <RichText content={step.description} />
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* What to Bring / Recommendations */}
            {recommendations.length > 0 && (
              <div className="space-y-4">
                {/* Mobile - Collapsible Header */}
                <button
                  onClick={() => toggleSection('recommendations')}
                  className="lg:hidden w-full flex items-center justify-between py-3 border-b border-neutral-100"
                >
                  <h2 className="text-xl font-bold text-neutral-900">{t.whatToBring}</h2>
                  <ChevronDown className={`w-6 h-6 text-neutral-500 transition-transform ${expandedSections.recommendations ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop - Static Header */}
                <h2 className="hidden lg:block text-xl lg:text-2xl font-bold text-neutral-900">{t.whatToBring}</h2>

                {/* Mobile - Collapsible Content */}
                <AnimatePresence>
                  {expandedSections.recommendations && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="lg:hidden overflow-hidden"
                    >
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2">
                        <div className="flex items-start gap-4">
                          <Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                          <ul className="space-y-2 text-base text-amber-800">
                            {recommendations.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <div className="[&_p]:mb-0"><RichTextOrString content={item} /></div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Desktop - Always visible */}
                <div className="hidden lg:block bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <ul className="space-y-2 text-base text-amber-800">
                      {recommendations.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <div className="[&_p]:mb-0"><RichTextOrString content={item} /></div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Route Map - Shows journey between two locations */}
            {routeData && (
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-5"
              >
                <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">
                  {locale === 'fr' ? 'Itinéraire du trajet' : 'Travel Route'}
                </h2>
                <RouteMap
                  waypoints={routeData.waypoints}
                  routeColor={routeData.routeColor}
                  geometry={routeData.geometry}
                  className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm"
                />
              </motion.div>
            )}

            {/* Location Map */}
            {locationCoords && !routeData && (
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-5"
              >
                <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">{t.meetingPoint}</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-neutral-600 text-base">
                    <MapPin className="w-5 h-5" style={{ color: ACCENT_GREEN }} />
                    <span>{getLocationName((activity as any).location)}</span>
                  </div>
                  <ActivityLocationMap
                    latitude={locationCoords.lat}
                    longitude={locationCoords.lng}
                    locationName={getLocationName((activity as any).location)}
                    activityTitle={activity.title}
                    className="border border-neutral-200 rounded-xl overflow-hidden"
                  />
                </div>
              </motion.div>
            )}

          </div>

          {/* Right Column - Sticky Booking Form */}
          <div className="hidden lg:block">
            <motion.div
              ref={bookingSectionRef}
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="sticky top-24"
            >
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                {/* Green top accent bar */}
                <div className="h-2 rounded-t-2xl" style={{ backgroundColor: ACCENT_GREEN }} />

                {/* Featured badge if applicable */}
                {activity.isFeatured && (
                  <div className="text-white text-center py-2 px-4" style={{ backgroundColor: ACCENT_GREEN }}>
                    <span className="font-semibold text-sm flex items-center justify-center gap-2">
                      <Award className="w-4 h-4" />
                      Featured Experience
                    </span>
                  </div>
                )}

                <div className="p-5 space-y-4">
                  {/* Pricing Display Section */}
                  {isCustomNoteMode && customPricingNote ? (
                    /* Custom Note Display */
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <p className="text-lg text-neutral-900 font-medium whitespace-pre-wrap">
                          {customPricingNote}
                        </p>
                      </div>
                    </div>
                  ) : tieredPricingEnabled && tieredPricingTiers.length > 0 ? (
                    /* Simplified Tiered Pricing Card */
                    <>
                      {/* Header with "Group Pricing" and "per person" */}
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-lg font-semibold text-neutral-900">{t.groupPricingLabel}</h3>
                        <span className="text-sm text-neutral-600">{t.perPersonLabel}</span>
                      </div>

                      {/* Tiered pricing list */}
                      <div className="space-y-2">
                        {tieredPricingTiers.map((tier: any, index: number) => {
                          const numPeople = tier.numberOfPeople || tier.minPeople
                          const maxPeople = tier.maxPeople || numPeople
                          const isSinglePerson = !tier.maxPeople || maxPeople === numPeople
                          const isSelected = adults >= numPeople && adults <= maxPeople

                          return (
                            <button
                              key={index}
                              onClick={() => {
                                setAdults(numPeople)
                                setChildren(0)
                              }}
                              className={`w-full flex justify-between items-center p-3 rounded-lg transition-all ${
                                isSelected
                                  ? 'bg-green-50 border-2 border-green-500'
                                  : 'bg-neutral-50 border border-transparent hover:bg-neutral-100'
                              }`}
                            >
                              <span className={`text-sm ${isSelected ? 'font-semibold' : ''}`}>
                                {isSinglePerson
                                  ? `${numPeople} ${numPeople === 1 ? t.personLabel : t.peopleLabel}`
                                  : `${numPeople}-${maxPeople} ${t.peopleLabel}`
                                }
                              </span>
                              <span className={`text-sm font-semibold text-green-600 ${isSelected ? 'font-bold' : ''}`}>
                                €{tier.pricePerPerson}
                              </span>
                            </button>
                          )
                        })}
                      </div>

                      {/* Divider */}
                      <div className="border-t border-neutral-200"></div>

                      {/* Book now button */}
                      <motion.button
                        onClick={handleAddToCart}
                        disabled={!applicableTier}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-4 text-white font-bold text-lg rounded-xl transition-all shadow-sm hover:shadow-md ${
                          !applicableTier
                            ? 'bg-neutral-300 cursor-not-allowed'
                            : ''
                        }`}
                        style={{ backgroundColor: applicableTier ? ACCENT_GREEN : undefined }}
                      >
                        {t.bookNowButton}
                      </motion.button>

                      {/* Trust signals */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm text-neutral-600">
                          <Shield className="w-5 h-5 text-[#4CAF50]" />
                          <span>{t.freeCancellation}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-neutral-600">
                          <Check className="w-5 h-5 text-[#4CAF50]" />
                          <span>{t.instantConfirmation}</span>
                        </div>
                      </div>
                    </>
                  ) : !isCustomNoteMode && (
                    /* Price Section - Only show for non-custom-note modes */
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold" style={{ color: ACCENT_GREEN }}>€{displayPrice}</span>
                        <span className="text-base text-neutral-500">{isPrivateMode ? t.totalLabel : t.perPersonLabel}</span>
                      </div>
                      {isPrivateMode && privateAdditionalGuestPrice > 0 && (
                        <p className="text-sm text-neutral-500 mt-1">
                          +€{privateAdditionalGuestPrice} per {t.extraGuest} above {privateMinGuests}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Booking Form - Show for both custom note and fixed pricing modes */}
                  {!tieredPricingEnabled && (
                    <>

                  {/* Participants Dropdown Button */}
                  <div className="relative" ref={participantsRef}>
                    <button
                      onClick={() => setShowParticipants(!showParticipants)}
                      className="w-full flex items-center justify-between px-4 py-3.5 border border-neutral-300 rounded-xl hover:border-neutral-400 transition-colors bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-neutral-700" />
                        <span className="text-neutral-900 font-medium text-base">
                          {t.adultLabel} x {adults}{children > 0 ? `, ${t.childLabel} x ${children}` : ''}
                        </span>
                      </div>
                      <ChevronDown className={`w-6 h-6 text-neutral-500 transition-transform ${showParticipants ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Participants Dropdown */}
                    <AnimatePresence>
                      {showParticipants && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-md z-50 overflow-hidden"
                        >
                          <div className="p-4 space-y-4">
                            {/* Adults Row */}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-neutral-900">{t.adultsLabel}</p>
                                {!isCustomNoteMode && (
                                  <p className="text-sm text-neutral-500">
                                    {isPrivateMode
                                      ? (privateAdditionalGuestPrice > 0 ? `+€${privateAdditionalGuestPrice}/${t.extraGuest}` : t.fixedPrice)
                                      : `€${0} ${t.eachLabel}`}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setAdults(Math.max(1, adults - 1))}
                                  disabled={adults <= 1}
                                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-6 text-center font-semibold">{adults}</span>
                                <button
                                  onClick={() => setAdults(Math.min(999, adults + 1))}
                                  disabled={isPrivateMode && privateMaxGuests !== undefined && (adults + children) >= privateMaxGuests}
                                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Children Row */}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-neutral-900">{t.childrenLabel} <span className="text-neutral-500 font-normal">(0-{12})</span></p>
                                {!isCustomNoteMode && (
                                  <p className="text-sm text-neutral-500">
                                    {isPrivateMode
                                      ? (privateAdditionalGuestPrice > 0 ? `+€${privateAdditionalGuestPrice}/${t.extraGuest}` : t.fixedPrice)
                                      : `€${childPrice} ${t.eachLabel}`}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setChildren(Math.max(0, children - 1))}
                                  disabled={children <= 0}
                                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-6 text-center font-semibold">{children}</span>
                                <button
                                  onClick={() => setChildren(Math.min(999, children + 1))}
                                  disabled={isPrivateMode && privateMaxGuests !== undefined && (adults + children) >= privateMaxGuests}
                                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Total in dropdown */}
                            {!isCustomNoteMode && (
                              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                                <span className="text-sm text-neutral-600">{tCommon('total')}</span>
                                <span className="font-bold text-neutral-900">€{totalPrice}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                      {/* Check Availability Button */}
                      <motion.button
                        onClick={handleAddToCart}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 text-white font-bold text-lg rounded-xl transition-all shadow-sm hover:shadow-md"
                        style={{ backgroundColor: ACCENT_GREEN }}
                      >
                        {t.checkAvailabilityButton}
                      </motion.button>

                      {/* Trust Signals */}
                      <div className="pt-4 space-y-2.5">
                        <div className="flex items-center gap-3 text-sm text-neutral-600">
                          <Shield className="w-5 h-5 text-[#4CAF50]" />
                          <span>Free cancellation up to 24h before</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-neutral-600">
                          <Check className="w-5 h-5 text-[#4CAF50]" />
                          <span>Instant confirmation</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/212751622180"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 border-2 border-neutral-200 rounded-xl text-neutral-700 font-medium hover:border-[#25D366] hover:text-[#25D366] transition-colors text-base"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                {t.whatsappCta}
              </a>
            </motion.div>
          </div>
        </div>

      </div>

      {/* Fullscreen Gallery Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isGalleryOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black"
            >
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="h-full flex items-center justify-center p-4">
                <button
                  onClick={prevImage}
                  className="absolute left-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="relative w-full max-w-5xl aspect-[16/10]">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {images[activeImageIndex] && (
                      <motion.div
                        key={activeImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={images[activeImageIndex]}
                          alt={`${activity.title} - Photo ${activeImageIndex + 1}`}
                          fill
                          sizes="(max-width: 1280px) 100vw, 1280px"
                          className="object-contain"
                          unoptimized={images[activeImageIndex].includes('utfs.io') || images[activeImageIndex].includes('uploadthing')}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={nextImage}
                  className="absolute right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm">
                  {activeImageIndex + 1} / {images.length}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
