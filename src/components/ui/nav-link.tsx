'use client'

import { ComponentProps, useCallback } from 'react'
import { Link, usePathname } from '@/i18n/routing'
import { useNavigationLoading } from '@/context/NavigationLoadingContext'

type NavLinkProps = ComponentProps<typeof Link>

export function NavLink({ onClick, href, children, ...props }: NavLinkProps) {
  const { startNavigation } = useNavigationLoading()
  const currentPathname = usePathname()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const targetPath = typeof href === 'string' ? href : href?.pathname
      // Only trigger loading if navigating to different page (not anchor links)
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
