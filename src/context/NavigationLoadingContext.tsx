'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { usePathname } from '@/i18n/routing'

interface NavigationLoadingContextType {
  isNavigating: boolean
  startNavigation: () => void
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType | undefined>(undefined)

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()

  // When pathname changes, navigation is complete
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname])

  const startNavigation = useCallback(() => {
    setIsNavigating(true)
  }, [])

  return (
    <NavigationLoadingContext.Provider value={{ isNavigating, startNavigation }}>
      {children}
    </NavigationLoadingContext.Provider>
  )
}

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext)
  if (!context) {
    throw new Error('useNavigationLoading must be used within NavigationLoadingProvider')
  }
  return context
}
