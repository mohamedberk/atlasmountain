'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import {
  Send,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Loader2,
  Instagram,
  Facebook,
  MessageCircle,
  Car,
  CalendarX,
  Heart,
  Shield,
  Star,
} from 'lucide-react'
import { NavLink } from '@/components/ui/nav-link'
import { PhoneInput } from '@/components/ui/phone-input'
import { useTranslations } from 'next-intl'

const ACCENT_GREEN = '#49b540'

interface Props {
  content: {
    title: string
    subtitle: string
    description: string
  }
  locale?: string
  cmsData?: any
}

const iconMap = {
  heart: Heart,
  calendarX: CalendarX,
  car: Car,
  shield: Shield,
  clock: Clock,
  star: Star,
}

const defaultFeatures = [
  {
    icon: 'heart' as const,
    title: 'Personalized Experiences',
    description: 'We specialize in personalized experiences. Contact us with your preferences and we\'ll create a custom itinerary just for you.',
  },
  {
    icon: 'calendarX' as const,
    title: 'Free Cancellation',
    description: 'Free cancellation up to 24 hours before your activity. Full refund guaranteed.',
  },
  {
    icon: 'car' as const,
    title: 'Free Hotel Pickup',
    description: 'All our activities include free pickup and drop-off from your hotel or riad in Marrakech.',
  },
]

export function ContactPageClient({ content, cmsData, locale }: Props) {
  const tContact = useTranslations('contactPage')
  const isFrench = locale === 'fr'
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const turnstileRef = useRef<TurnstileInstance>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    website: '',
  })

  // Extract CMS data - NO FALLBACKS, use CMS only
  const header = cmsData?.header || {}
  const badgeText = header.badgeText || ''
  const heroTitle = header.title || ''
  const heroTitleHighlight = header.titleHighlight || ''
  const heroDescription = header.description || ''

  // Features from CMS only
  const features = cmsData?.features || []

  // Contact info from CMS only
  const contactInfo = cmsData?.contactInfo || {}
  const address = contactInfo.address || {}
  const addressLine1 = address.line1 || ''
  const addressLine2 = address.line2 || ''

  const phoneData = contactInfo.phone || {}
  const phoneNumber = phoneData.number || ''
  const phoneDisplay = phoneData.display || phoneNumber
  const phoneClean = phoneNumber.replace(/\s+/g, '')

  const emailData = contactInfo.email || {}
  const emailAddress = emailData.address || ''
  const emailResponseTime = emailData.responseTime || ''

  const whatsappData = contactInfo.whatsapp || {}
  const whatsappNumber = whatsappData.number || ''
  const whatsappDisplay = whatsappData.display || whatsappNumber
  const whatsappMessage = whatsappData.message || ''
  const whatsappClean = whatsappNumber.replace(/[^0-9]/g, '')

  // Working hours from CMS only
  const workingHours = contactInfo.workingHours || {}
  const workingHoursTitle = workingHours.title || ''
  const workingHoursLine1 = workingHours.line1 || ''
  const workingHoursLine2 = workingHours.line2 || ''

  // Social links from CMS only
  const socialLinks = contactInfo.socialLinks || {}
  const instagramUrl = socialLinks.instagram || ''
  const facebookUrl = socialLinks.facebook || ''
  const tiktokUrl = socialLinks.tiktok || ''
  const youtubeUrl = socialLinks.youtube || ''

  // Form settings from CMS only
  const formSettings = cmsData?.formSettings || {}
  const formTitle = formSettings.title || ''
  const submitButtonText = formSettings.submitButtonText || tContact('sendMessage')
  const successMessage = formSettings.successMessage || ''

  // Form field labels from CMS
  const firstNameLabel = formSettings.firstNameLabel || tContact('firstName')
  const lastNameLabel = formSettings.lastNameLabel || tContact('lastName')
  const emailLabel = formSettings.emailLabel || tContact('emailAddress')
  const phoneLabel = formSettings.phoneLabel || tContact('phoneWhatsApp')
  const subjectLabel = formSettings.subjectLabel || tContact('interested')
  const subjectPlaceholder = formSettings.subjectPlaceholder || tContact('selectOption')
  const messageLabel = formSettings.messageLabel || tContact('yourMessage')
  const messagePlaceholder = formSettings.messagePlaceholder || tContact('messagePlaceholder')

  // Subject options from CMS
  const subjectOptions = formSettings.subjects || []

  // Section labels from CMS
  const labels = cmsData?.labels || {}
  const contactInfoTitle = labels.contactInfoTitle || tContact('contactInformation')
  const visitUsTitle = labels.visitUsTitle || tContact('visitUs')
  const callUsTitle = labels.callUsTitle || tContact('callUs')
  const emailUsTitle = labels.emailUsTitle || tContact('emailUs')
  const whatsappTitle = labels.whatsappTitle || tContact('whatsAppFastest')
  const followUsTitle = labels.followUsTitle || tContact('followUs')

  // Map from CMS only
  const mapData = cmsData?.map || {}
  const mapEmbedUrl = mapData.embedUrl || ''

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!captchaToken) {
      setFormState('error')
      setErrorMessage(isFrench ? 'Veuillez compléter la vérification anti-bot.' : 'Please complete the anti-bot verification.')
      return
    }

    setFormState('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          website: formData.website,
          captchaToken,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setFormState('success')
      setCaptchaToken('')
      turnstileRef.current?.reset()
      setTimeout(() => {
        setFormState('idle')
        setFormData({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '', website: '' })
      }, 5000)
    } catch (error) {
      setFormState('error')
      setErrorMessage(isFrench ? 'Une erreur s\'est produite. Veuillez réessayer ou nous contacter via WhatsApp.' : 'Something went wrong. Please try again or contact us via WhatsApp.')
      setCaptchaToken('')
      turnstileRef.current?.reset()
    }
  }

  return (
    <main className="bg-[#fafaf9]">
      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ backgroundColor: `${ACCENT_GREEN}15` }}
            >
              <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
              <span className="text-sm font-medium uppercase tracking-wider" style={{ color: ACCENT_GREEN }}>
                {badgeText}
              </span>
              <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
            </div>
            <h1 className="mb-4 max-w-3xl font-display text-4xl md:text-5xl lg:text-6xl text-neutral-900">
              {heroTitle}{' '}
              <span style={{ color: ACCENT_GREEN }}>{heroTitleHighlight}</span>
            </h1>
            <p className="max-w-2xl text-lg text-neutral-600">
              {heroDescription}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Banner - only show if features exist in CMS */}
      {features.length > 0 && (
        <section className="pb-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((feature: any, index: number) => {
                const IconComponent = iconMap[feature.icon as keyof typeof iconMap] || Heart
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-start gap-4"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: ACCENT_GREEN }} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-neutral-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-neutral-600 whitespace-pre-line">{feature.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Contact Content */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-8 font-display text-2xl text-neutral-900">{formTitle}</h2>

              {formState === 'success' ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
                  <div
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${ACCENT_GREEN}20` }}
                  >
                    <CheckCircle className="h-8 w-8" style={{ color: ACCENT_GREEN }} />
                  </div>
                  <h3 className="mb-2 font-display text-xl text-neutral-900">{tContact('messageSent')}</h3>
                  <p className="text-neutral-600">
                    {successMessage}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-neutral-100 p-6 md:p-8">
                  {formState === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-neutral-700">
                        {firstNameLabel} *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full rounded-xl border border-neutral-200 bg-[#fafaf9] px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-neutral-700">
                        {lastNameLabel} *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full rounded-xl border border-neutral-200 bg-[#fafaf9] px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-neutral-700">
                      {emailLabel} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 bg-[#fafaf9] px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium text-neutral-700">
                      {phoneLabel}
                    </label>
                    <PhoneInput
                      value={formData.phone}
                      onChange={(value) => setFormData({ ...formData, phone: value })}
                      placeholder="600 000 000"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="mb-2 block text-sm font-medium text-neutral-700">
                      {subjectLabel}
                    </label>
                    <select
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 bg-[#fafaf9] px-4 py-3.5 text-neutral-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
                    >
                      <option value="">{subjectPlaceholder}</option>
                      {subjectOptions.length > 0 ? (
                        subjectOptions.map((option: { value: string; label: string }, index: number) => (
                          <option key={index} value={option.value}>{option.label}</option>
                        ))
                      ) : (
                        <>
                          <option value="day-trip">{isFrench ? 'Excursion d\'une journée depuis Marrakech' : 'Day Trip from Marrakech'}</option>
                          <option value="desert-tour">{isFrench ? 'Circuit dans le désert (Sahara)' : 'Desert Tour (Sahara)'}</option>
                          <option value="multi-day">{isFrench ? 'Aventure de plusieurs jours' : 'Multi-Day Adventure'}</option>
                          <option value="custom-tour">{isFrench ? 'Demande de circuit personnalisé' : 'Custom Tour Request'}</option>
                          <option value="airport-transfer">{isFrench ? 'Transfert aéroport' : 'Airport Transfer'}</option>
                          <option value="group-booking">{isFrench ? 'Réservation de groupe' : 'Group Booking'}</option>
                          <option value="other">{isFrench ? 'Autre demande' : 'Other Inquiry'}</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-2 block text-sm font-medium text-neutral-700">
                      {messageLabel} *
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full resize-none rounded-xl border border-neutral-200 bg-[#fafaf9] px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
                      placeholder={messagePlaceholder}
                    />
                  </div>

                  {/* Honeypot — hidden from real users, bots fill it */}
                  <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
                    <label htmlFor="website">Website</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>

                  {/* Cloudflare Turnstile */}
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onSuccess={(token) => setCaptchaToken(token)}
                    onError={() => setCaptchaToken('')}
                    onExpire={() => setCaptchaToken('')}
                    options={{ theme: 'light' }}
                  />

                  <button
                    type="submit"
                    disabled={formState === 'loading' || !captchaToken}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-4 font-medium text-white transition-all hover:opacity-90 disabled:opacity-60 md:w-auto md:px-8"
                    style={{ backgroundColor: ACCENT_GREEN }}
                  >
                    {formState === 'loading' ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {tContact('sending')}
                      </>
                    ) : (
                      <>
                        {submitButtonText}
                        <Send className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-8 font-display text-2xl text-neutral-900">{contactInfoTitle}</h2>

              <div className="space-y-4">
                {/* Visit Us with Map */}
                <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white">
                  {/* Map - only show if URL exists */}
                  {mapEmbedUrl && (
                    <div className="h-[150px] sm:h-[200px] w-full">
                      <iframe
                        src={mapEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="grayscale hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                  )}
                  {/* Address Info */}
                  {(addressLine1 || addressLine2) && (
                    <div className="bg-[#fafaf9] p-5">
                      <div className="flex items-start gap-4">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: ACCENT_GREEN }}
                        >
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="mb-1 font-display text-base text-neutral-900">{visitUsTitle}</h3>
                          <p className="text-sm text-neutral-600">
                            {addressLine1}{addressLine1 && addressLine2 && <br />}
                            {addressLine2}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone & Email - 2 columns */}
                {(phoneNumber || emailAddress) && (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {phoneNumber && (
                      <a
                        href={`tel:${phoneClean}`}
                        className="flex items-start gap-4 rounded-2xl border border-neutral-100 bg-white p-5 hover:border-green-200 transition-colors"
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: ACCENT_GREEN }}
                        >
                          <Phone className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="mb-1 font-display text-base text-neutral-900">{callUsTitle}</h3>
                          <p className="text-sm text-neutral-600">{phoneDisplay}</p>
                        </div>
                      </a>
                    )}

                    {emailAddress && (
                      <a
                        href={`mailto:${emailAddress}`}
                        className="flex items-start gap-4 rounded-2xl border border-neutral-100 bg-white p-5 hover:border-green-200 transition-colors"
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: ACCENT_GREEN }}
                        >
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="mb-1 font-display text-base text-neutral-900">{emailUsTitle}</h3>
                          <p className="text-sm text-neutral-600 break-all">{emailAddress}</p>
                        </div>
                      </a>
                    )}
                  </div>
                )}

                {/* WhatsApp */}
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappClean}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 rounded-2xl border border-neutral-100 bg-white p-5 hover:border-green-200 transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-display text-base text-neutral-900">{whatsappTitle}</h3>
                      <p className="text-sm text-neutral-600">{whatsappDisplay}{whatsappMessage && ` • ${whatsappMessage}`}</p>
                    </div>
                  </a>
                )}

                {/* Working Hours */}
                {(workingHoursTitle || workingHoursLine1 || workingHoursLine2) && (
                  <div className="flex items-start gap-4 rounded-2xl border border-neutral-100 bg-white p-5">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: ACCENT_GREEN }}
                    >
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-display text-base text-neutral-900">{workingHoursTitle}</h3>
                      <p className="text-sm text-neutral-600">
                        {workingHoursLine1}{workingHoursLine1 && workingHoursLine2 && <br />}
                        {workingHoursLine2}
                      </p>
                    </div>
                  </div>
                )}

                {/* Social Links - only show if at least one URL exists */}
                {(instagramUrl || facebookUrl || tiktokUrl || youtubeUrl) && (
                  <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-5">
                    <h3 className="font-display text-base text-neutral-900">{followUsTitle}</h3>
                    <div className="flex gap-2">
                      {instagramUrl && (
                        <a
                          href={instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-[#fafaf9] text-neutral-600 transition-all hover:text-white"
                          style={{ ['--hover-bg' as any]: ACCENT_GREEN }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = ACCENT_GREEN
                            e.currentTarget.style.borderColor = ACCENT_GREEN
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fafaf9'
                            e.currentTarget.style.borderColor = '#e5e5e5'
                          }}
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                      {facebookUrl && (
                        <a
                          href={facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-[#fafaf9] text-neutral-600 transition-all hover:text-white"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = ACCENT_GREEN
                            e.currentTarget.style.borderColor = ACCENT_GREEN
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fafaf9'
                            e.currentTarget.style.borderColor = '#e5e5e5'
                          }}
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {tiktokUrl && (
                        <a
                          href={tiktokUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-[#fafaf9] text-neutral-600 transition-all hover:text-white"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = ACCENT_GREEN
                            e.currentTarget.style.borderColor = ACCENT_GREEN
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fafaf9'
                            e.currentTarget.style.borderColor = '#e5e5e5'
                          }}
                        >
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                        </a>
                      )}
                      {youtubeUrl && (
                        <a
                          href={youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-[#fafaf9] text-neutral-600 transition-all hover:text-white"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = ACCENT_GREEN
                            e.currentTarget.style.borderColor = ACCENT_GREEN
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fafaf9'
                            e.currentTarget.style.borderColor = '#e5e5e5'
                          }}
                        >
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}
