'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, HelpCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

const ACCENT_GREEN = '#ff2828'


interface FAQItem {
  question: string
  answer: string
}

interface FAQData {
  badgeText?: string | null
  title?: string | null
  titleHighlight?: string | null
  description?: string | null
  items?: FAQItem[] | null
  contactCtaText?: string | null
  contactLinkText?: string | null
  contactEmail?: string | null
}

interface Props {
  faqData?: FAQData | null
}

// Animation variants
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
      delayChildren: 0.2,
    },
  },
}

export function FAQSection({ faqData }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const tFaq = useTranslations('faqSection')

  const defaultFaqs = [
    { question: tFaq('defaultFaq1Question'), answer: tFaq('defaultFaq1Answer') },
    { question: tFaq('defaultFaq2Question'), answer: tFaq('defaultFaq2Answer') },
    { question: tFaq('defaultFaq3Question'), answer: tFaq('defaultFaq3Answer') },
    { question: tFaq('defaultFaq4Question'), answer: tFaq('defaultFaq4Answer') },
  ]

  const title = faqData?.title || tFaq('frequentlyAsked')
  const titleHighlight = faqData?.titleHighlight || tFaq('questions')
  const description = faqData?.description || tFaq('description')
  const contactCtaText = faqData?.contactCtaText || tFaq('stillHaveQuestions')
  const contactLinkText = faqData?.contactLinkText || tFaq('contactOurTeam')
  const contactEmail = faqData?.contactEmail || 'atlasmountainsvisit@gmail.com'

  const faqs = faqData?.items?.length ? faqData.items : defaultFaqs

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16 md:py-24 bg-white" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.div variants={fadeInUp} custom={0}>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-neutral-900 mb-4">
              {title} <span style={{ color: ACCENT_GREEN }}>{titleHighlight}</span>
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              {description}
            </p>
          </motion.div>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div
                className={`bg-[#fafaf9] rounded-2xl border overflow-hidden transition-all duration-300 ${
                  openIndex === index
                    ? 'border-red-200 shadow-[0_1px_4px_rgba(0,0,0,0.02)]'
                    : 'border-neutral-100 hover:border-neutral-200'
                }`}
              >
                {/* Question Button */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                      style={{
                        backgroundColor: openIndex === index ? ACCENT_GREEN : `${ACCENT_GREEN}15`,
                      }}
                    >
                      <span
                        className="text-xs sm:text-sm font-bold transition-colors duration-300"
                        style={{ color: openIndex === index ? 'white' : ACCENT_GREEN }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="font-display text-sm sm:text-base md:text-lg font-semibold text-neutral-900 pr-2 sm:pr-4">
                      {faq.question}
                    </h3>
                  </div>
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor: openIndex === index ? ACCENT_GREEN : `${ACCENT_GREEN}15`,
                    }}
                  >
                    {openIndex === index ? (
                      <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ACCENT_GREEN }} />
                    )}
                  </div>
                </button>

                {/* Answer */}
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                        <div className="pl-0 sm:pl-14">
                          <div
                            className="w-10 sm:w-12 h-1 rounded-full mb-3 sm:mb-4"
                            style={{ backgroundColor: `${ACCENT_GREEN}30` }}
                          />
                          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed whitespace-pre-line">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-[#fafaf9] rounded-2xl border border-neutral-100">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${ACCENT_GREEN}15` }}
            >
              <HelpCircle className="w-6 h-6" style={{ color: ACCENT_GREEN }} />
            </div>
            <div className="text-left">
              <p className="text-sm text-neutral-500">{contactCtaText}</p>
              <a
                href={`mailto:${contactEmail}`}
                className="font-semibold hover:underline transition-colors"
                style={{ color: ACCENT_GREEN }}
              >
                {contactLinkText}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
