'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function Loading() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Simpler loading for mobile
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 mx-auto">
          <div className="w-full h-full rounded-full border-2 border-gray-100 border-t-primary animate-spin" />
        </div>
      </div>
    )
  }

  // Full animation for desktop
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div
        className="w-12 h-12 mx-auto"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 0,
          immediateRender: true
        }}
      >
        <div className="w-full h-full rounded-full border-4 border-gray-100 border-t-primary animate-spin" />
      </motion.div>
    </div>
  )
}
