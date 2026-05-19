'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useNavigationLoading } from '@/context/NavigationLoadingContext'

export function NavigationLoadingOverlay() {
  const { isNavigating } = useNavigationLoading()

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-[#ff2828]/20 border-t-[#ff2828] rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
