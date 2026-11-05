'use client'

import { motion } from 'framer-motion'
import { GuideCard } from './guide-card'
import type { Guide } from '@/payload-types'

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

interface GuidesGridProps {
  guides: Guide[]
}

export function GuidesGrid({ guides }: GuidesGridProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8"
    >
      {guides.map((guide, index) => (
        <GuideCard key={guide.id} guide={guide} index={index} />
      ))}
    </motion.div>
  )
}
