'use client'

import { ReactNode } from 'react'
import { NavigationLoadingProvider } from '@/context/NavigationLoadingContext'
import { NavigationLoadingOverlay } from '@/components/ui/navigation-loading-overlay'

export function NavigationLoadingWrapper({ children }: { children: ReactNode }) {
  return (
    <NavigationLoadingProvider>
      <NavigationLoadingOverlay />
      {children}
    </NavigationLoadingProvider>
  )
}
