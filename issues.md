 Prompt: Fix Text Spacing & Add Navigation Loading UI

  Problem 1: Text Spacing/Paragraphs Not Showing on Frontend

  Issue: When entering text with line breaks (Enter key) or paragraphs in the admin CMS, the frontend
  displays it as one continuous block without any spacing.

  Root Cause: HTML collapses whitespace by default. Plain text fields containing \n (newlines) render
  without visible line breaks.

  Solution: Add the CSS class whitespace-pre-line to any element that renders plain text content from the
  CMS.

  // Before (line breaks not visible):
  <p className="text-neutral-600">{content.description}</p>

  // After (line breaks preserved):
  <p className="text-neutral-600 whitespace-pre-line">{content.description}</p>

  Apply this to ALL plain text fields across the site:
  - Descriptions (short descriptions, item descriptions, feature descriptions)
  - Excerpts (blog excerpts, summaries)
  - Category descriptions
  - Any textarea content from the CMS

  Search pattern to find candidates:
  # Find all places rendering dynamic text content
  grep -r "{\w+\.description}" src/
  grep -r "{\w+\.excerpt}" src/
  grep -r "{\w+\.shortDescription}" src/

  ---
  Problem 2: No Loading Indicator When Navigating Between Pages

  Issue: When clicking links, there's a delay before the new page appears, with no visual feedback.

  Solution: Create a navigation loading system with React Context.

  Step 1: Create the Context (src/context/NavigationLoadingContext.tsx)

  'use client'

  import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
  import { usePathname } from 'next/navigation' // or from your i18n routing

  interface NavigationLoadingContextType {
    isNavigating: boolean
    startNavigation: () => void
  }

  const NavigationLoadingContext = createContext<NavigationLoadingContextType | undefined>(undefined)

  export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
    const [isNavigating, setIsNavigating] = useState(false)
    const pathname = usePathname()

    // Reset loading state when pathname changes (navigation complete)
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

  Step 2: Create the Loading Overlay (src/components/ui/navigation-loading-overlay.tsx)

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
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 
  backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  Step 3: Create NavLink Component (src/components/ui/nav-link.tsx)

  'use client'

  import { ComponentProps, useCallback } from 'react'
  import Link from 'next/link' // or from your i18n routing
  import { usePathname } from 'next/navigation'
  import { useNavigationLoading } from '@/context/NavigationLoadingContext'

  type NavLinkProps = ComponentProps<typeof Link>

  export function NavLink({ onClick, href, children, ...props }: NavLinkProps) {
    const { startNavigation } = useNavigationLoading()
    const currentPathname = usePathname()

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        const targetPath = typeof href === 'string' ? href : href?.pathname
        // Only show loading for actual navigation (not hash links, not same page)
        if (targetPath && !targetPath.startsWith('#') && targetPath !== currentPathname) {
          startNavigation()
        }
        onClick?.(e)
      },
      [onClick, startNavigation, currentPathname, href]
    )

    return (
      <Link onClick={handleClick} href={href} {...props}>
        {children}
      </Link>
    )
  }

  Step 4: Create Wrapper Component (src/components/providers/navigation-loading-wrapper.tsx)

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

  Step 5: Add to Root Layout (src/app/layout.tsx)

  import { NavigationLoadingWrapper } from '@/components/providers/navigation-loading-wrapper'

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html>
        <body>
          <NavigationLoadingWrapper>
            {children}
          </NavigationLoadingWrapper>
        </body>
      </html>
    )
  }

  Step 6: Replace All <Link> with <NavLink>

  Search and replace across all components:

  // Before:
  import Link from 'next/link'
  <Link href="/about">About</Link>

  // After:
  import { NavLink } from '@/components/ui/nav-link'
  <NavLink href="/about">About</NavLink>

  Requirements:
  - framer-motion package for animations
  - Next.js App Router (can be adapted for Pages Router)

  ---
  Summary:
  1. Add whitespace-pre-line class to all plain text content rendering
  2. Create navigation context, overlay, and NavLink wrapper
  3. Wrap app in NavigationLoadingWrapper
  4. Replace all Link components with NavLink




  