'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

interface CategoryHeroProps {
  name: string
  description?: string
  image?: string
  activityCount: number
  icon?: React.ReactNode
  gradient?: string
  onClick?: () => void
  isActive?: boolean
}

export function CategoryHero({
  name,
  description,
  image,
  activityCount,
  icon,
  gradient = 'from-primary to-primary-dark',
  onClick,
  isActive = false,
}: CategoryHeroProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full overflow-hidden rounded-2xl text-left transition-all duration-300 ${
        isActive ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      {/* Background Image or Gradient */}
      {image ? (
        <>
          <div className="relative h-40">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-70`} />
          </div>
        </>
      ) : (
        <div className={`h-40 bg-gradient-to-br ${gradient}`} />
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {icon && (
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {icon}
                </div>
              )}
              <h3 className="text-lg font-display font-bold text-white drop-shadow-md">
                {name}
              </h3>
            </div>
            {description && (
              <p className="text-sm text-white/80 line-clamp-1 max-w-[200px]">
                {description}
              </p>
            )}
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              <span className="text-xs font-medium text-white">
                {activityCount} {activityCount === 1 ? 'activity' : 'activities'}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </motion.button>
  )
}

// Mood-based category variant for Experiences page
interface MoodCategoryProps {
  mood: 'adventure' | 'relaxation' | 'culture' | 'family'
  title: string
  description: string
  activities: number
  onClick?: () => void
  isActive?: boolean
}

const moodConfigs = {
  adventure: {
    gradient: 'from-[#ff2828] to-[#ff5050]',
    icon: '🏜️',
    bgPattern: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
  },
  relaxation: {
    gradient: 'from-[#ff2828] to-[#ff5050]',
    icon: '🌴',
    bgPattern: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
  },
  culture: {
    gradient: 'from-[#ff2828] to-[#ff5050]',
    icon: '🕌',
    bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
  },
  family: {
    gradient: 'from-[#ff2828] to-[#ff5050]',
    icon: '👨‍👩‍👧‍👦',
    bgPattern: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)',
  },
}

export function MoodCategory({
  mood,
  title,
  description,
  activities,
  onClick,
  isActive = false,
}: MoodCategoryProps) {
  const config = moodConfigs[mood]

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full overflow-hidden rounded-2xl text-left transition-all duration-300 ${
        isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900' : ''
      }`}
    >
      {/* Gradient Background */}
      <div
        className={`h-44 bg-gradient-to-br ${config.gradient} p-5 flex flex-col justify-between`}
        style={{ backgroundImage: config.bgPattern }}
      >
        {/* Icon */}
        <div className="text-4xl filter drop-shadow-lg">{config.icon}</div>

        {/* Content */}
        <div>
          <h3 className="text-xl font-display font-bold text-white mb-1 drop-shadow-md">
            {title}
          </h3>
          <p className="text-sm text-white/80 line-clamp-1 mb-2">
            {description}
          </p>
          <div className="inline-flex items-center gap-2 text-white/90 text-xs font-medium">
            <span>{activities} experiences</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.button>
  )
}
