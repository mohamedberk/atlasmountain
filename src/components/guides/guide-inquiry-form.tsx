'use client'

import { useRef, useState } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { CheckCircle, Loader2, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { PhoneInput } from '@/components/ui/phone-input'

const ACCENT_GREEN = '#ff2828'

interface GuideInquiryFormProps {
  guideName: string
  guideSlug: string
  guideId: string | number
  initialMessage?: string
}

export function GuideInquiryForm({ guideName, guideSlug, guideId, initialMessage = '' }: GuideInquiryFormProps) {
  const tDetail = useTranslations('guideDetail')
  const tContact = useTranslations('contactPage')

  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const turnstileRef = useRef<TurnstileInstance>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: initialMessage,
    website: '',
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!captchaToken) {
      setFormState('error')
      setErrorMessage(tContact('captchaError'))
      return
    }

    setFormState('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: tDetail('inquirySubject', { name: guideName }),
          message: formData.message,
          website: formData.website,
          captchaToken,
          guideName,
          guideSlug,
          guideId,
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
        setFormData({ name: '', email: '', phone: '', message: '', website: '' })
      }, 5000)
    } catch {
      setFormState('error')
      setErrorMessage(tContact('submitError'))
      setCaptchaToken('')
      turnstileRef.current?.reset()
    }
  }

  if (formState === 'success') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <div
          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: `${ACCENT_GREEN}20` }}
        >
          <CheckCircle className="h-6 w-6" style={{ color: ACCENT_GREEN }} />
        </div>
        <h3 className="mb-1 font-display text-lg text-neutral-900">{tDetail('inquirySuccessTitle')}</h3>
        <p className="text-sm text-neutral-600">{tDetail('inquirySuccessMessage', { name: guideName })}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {formState === 'error' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <input
        type="text"
        required
        placeholder={tContact('firstName')}
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full rounded-xl border border-neutral-200 bg-[#fafaf9] px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
      />
      <input
        type="email"
        required
        placeholder={tContact('emailAddress')}
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full rounded-xl border border-neutral-200 bg-[#fafaf9] px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
      />
      <PhoneInput
        value={formData.phone}
        onChange={(value) => setFormData({ ...formData, phone: value })}
      />
      <textarea
        rows={3}
        required
        placeholder={tDetail('inquiryMessagePlaceholder', { name: guideName })}
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        className="w-full resize-none rounded-xl border border-neutral-200 bg-[#fafaf9] px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
      />

      {/* Honeypot */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        />
      </div>

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
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: ACCENT_GREEN }}
      >
        {formState === 'loading' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {tContact('sending')}
          </>
        ) : (
          <>
            {tDetail('sendInquiry')}
            <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  )
}
