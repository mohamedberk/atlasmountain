'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSiteSettings } from '@/context/SiteSettingsContext'

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const tWA = useTranslations('whatsapp')
  const { settings, getWhatsAppLink } = useSiteSettings()
  const pathname = usePathname()

  // Check if we're on a page with a sticky bottom bar (activity detail or checkout)
  // Locale prefix may or may not be in the pathname depending on routing config
  const hasStickyBottomBar = /^\/(([a-z]{2})\/)?(activities|checkout)\/[^/]+$/.test(pathname)

  const handleSend = () => {
    const whatsappUrl = getWhatsAppLink(message || 'Hello! I have a question about your tours.')
    window.open(whatsappUrl, '_blank')
    setIsOpen(false)
    setMessage('')
  }

  const companyName = settings.company.shortName

  return (
    <>
      {/* Floating Button - positioned higher on mobile on pages with sticky bottom bar */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full shadow-md flex items-center justify-center hover:bg-[#20BD5A] transition-colors group ${
          hasStickyBottomBar ? 'bottom-24 lg:bottom-6' : 'bottom-6'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>

        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            {/* Modal Content - positioned higher on mobile on pages with sticky bottom bar */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed right-6 z-50 w-[340px] max-w-[calc(100vw-48px)] ${
                hasStickyBottomBar ? 'bottom-40 lg:bottom-24' : 'bottom-24'
              }`}
            >
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">{companyName}</h3>
                        <p className="text-white/60 text-xs">{tWA('typicallyReplies')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="p-4 bg-[#f5f5f7]">
                  {/* Welcome Message */}
                  <div className="bg-white rounded-xl rounded-tl-sm p-3 shadow-sm max-w-[85%]">
                    <p className="text-sm text-neutral-700">
                      {tWA('greeting')}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-1">{tWA('justNow')}</p>
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-neutral-100">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={tWA('typeMessage')}
                        rows={2}
                        className="w-full px-4 py-3 bg-[#fafafa] border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                          }
                        }}
                      />
                    </div>
                    <button
                      onClick={handleSend}
                      className="w-11 h-11 bg-[#25D366] rounded-xl flex items-center justify-center hover:bg-[#20BD5A] transition-colors flex-shrink-0"
                    >
                      <Send className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-400 text-center mt-3">
                    {tWA('pressEnter')}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
