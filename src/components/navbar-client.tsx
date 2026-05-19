'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Menu, ChevronDown, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { NavLink } from '@/components/ui/nav-link'
import { useCart } from '@/context/CartContext'

const localeLabels: Record<string, { flag: string; label: string }> = {
  en: { flag: '🇬🇧', label: 'EN' },
  fr: { flag: '🇫🇷', label: 'FR' },
}

interface NavCategory {
  id: string
  name: string
  slug: string
  image: string | null
}

interface NavActivity {
  id: string
  title: string
  slug: string
  image: string | null
}

export interface NavbarData {
  categories: NavCategory[]
  activitiesByCategory: Record<string, NavActivity[]>
}

interface Props {
  initialData: NavbarData
}

export function NavbarClient({ initialData }: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [navbarData] = useState<NavbarData>(initialData)

  const categoriesTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const activitiesTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const { items } = useCart()

  const cartItemCount = items.length

  const mainNavLinks = [
    { name: t('home'), href: '/' },
    { name: t('about'), href: '/about' },
  ]

  const secondaryNavLinks: { name: string; href: string; isAnchor?: boolean }[] = [
    { name: t('faq') || 'FAQ', href: '/#faq', isAnchor: true },
    { name: t('contact') || 'Contact', href: '/contact' },
  ]

  // Handle anchor link clicks (for FAQ)
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isHomePage = pathname === '/' || pathname === ''
    const anchor = href.split('#')[1]

    if (isHomePage && anchor) {
      // If on homepage, smooth scroll to section
      e.preventDefault()
      const element = document.getElementById(anchor)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
      setIsMobileMenuOpen(false)
    } else if (anchor) {
      // If on another page, navigate to home then scroll
      e.preventDefault()
      router.push('/')
      // Use setTimeout to wait for navigation before scrolling
      setTimeout(() => {
        const element = document.getElementById(anchor)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
      setIsMobileMenuOpen(false)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isLangMenuOpen && !(e.target as Element).closest('.lang-menu')) {
        setIsLangMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isLangMenuOpen])

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as 'en' | 'fr' })
    setIsLangMenuOpen(false)
    setIsMobileMenuOpen(false)
  }

  // Handle mouse enter on Tours & Categories
  const handleCategoriesMouseEnter = () => {
    if (categoriesTimeoutRef.current) {
      clearTimeout(categoriesTimeoutRef.current)
    }
    setIsCategoriesOpen(true)
  }

  // Handle mouse leave on Tours & Categories
  const handleCategoriesMouseLeave = () => {
    categoriesTimeoutRef.current = setTimeout(() => {
      setIsCategoriesOpen(false)
      setHoveredCategory(null)
    }, 150)
  }

  // Handle mouse enter on category card
  const handleCategoryMouseEnter = (categoryId: string) => {
    if (activitiesTimeoutRef.current) {
      clearTimeout(activitiesTimeoutRef.current)
    }
    setHoveredCategory(categoryId)
  }

  // Handle mouse leave on category card
  const handleCategoryMouseLeave = () => {
    activitiesTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null)
    }, 100)
  }

  // Get activities for hovered category
  const hoveredCategoryActivities = hoveredCategory && navbarData
    ? navbarData.activitiesByCategory[hoveredCategory] || []
    : []

  // Check if a nav link is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === ''
    return pathname === href || pathname.startsWith(href + '/')
  }

  // Check if Tours & Categories should be highlighted
  const isToursActive = pathname.startsWith('/category') || pathname.startsWith('/activities')

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className={`flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5'
          : 'bg-white/90 backdrop-blur-lg shadow-md'
      }`}>
          {/* Wordmark */}
          <NavLink
            href="/"
            className="flex-shrink-0 flex items-center font-display font-bold text-xl tracking-tight text-neutral-900 hover:text-[#ff2828] transition-colors"
            aria-label="Atlas Mountain Visit"
          >
            Atlas Mountain Visit
          </NavLink>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center gap-1">
            {mainNavLinks.map((link) => (
              <NavLink
                key={link.name}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  isActive(link.href)
                    ? 'text-[#ff2828] font-semibold bg-[#ff2828]/10 ring-1 ring-[#ff2828]/20'
                    : 'text-neutral-700 hover:text-[#ff2828] hover:bg-[#ff2828]/5'
                }`}
              >
                {link.name}
              </NavLink>
            ))}

            {/* Tours & Categories with Mega Menu */}
            <div
              className="relative"
              onMouseEnter={handleCategoriesMouseEnter}
              onMouseLeave={handleCategoriesMouseLeave}
            >
              <button
                className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  isCategoriesOpen || isToursActive
                    ? 'text-[#ff2828] font-semibold bg-[#ff2828]/10 ring-1 ring-[#ff2828]/20'
                    : 'text-neutral-700 hover:text-[#ff2828] hover:bg-[#ff2828]/5'
                }`}
              >
                {t('toursCategories') || 'Tours & Categories'}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Categories Dropdown - Full Width Mega Menu */}
              <AnimatePresence>
                {isCategoriesOpen && navbarData && navbarData.categories.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="fixed left-0 right-0 bg-white shadow-md"
                    style={{ top: '64px' }}
                  >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                      {/* Categories Row */}
                      <div className="flex items-stretch justify-center gap-6">
                        {navbarData.categories.map((category) => (
                          <div
                            key={category.id}
                            onMouseEnter={() => handleCategoryMouseEnter(category.id)}
                            onMouseLeave={handleCategoryMouseLeave}
                          >
                            <NavLink
                              href={`/category/${category.slug}`}
                              className="block group"
                              onClick={() => setIsCategoriesOpen(false)}
                            >
                              <div className={`w-44 p-3 rounded-xl transition-all duration-200 ${
                                hoveredCategory === category.id
                                  ? 'bg-[#ff2828]/10 ring-2 ring-[#ff2828]/30'
                                  : 'hover:bg-neutral-50'
                              }`}>
                                <div className="aspect-[4/3] relative overflow-hidden rounded-xl">
                                  {category.image ? (
                                    <Image
                                      src={category.image}
                                      alt={category.name}
                                      fill
                                      sizes="176px"
                                      loading="eager"
                                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                                  )}
                                </div>
                                <p className={`mt-2.5 text-sm font-semibold text-center transition-colors ${
                                  hoveredCategory === category.id ? 'text-[#ff2828]' : 'text-neutral-700 group-hover:text-[#ff2828]'
                                }`}>
                                  {category.name}
                                </p>
                              </div>
                            </NavLink>
                          </div>
                        ))}
                      </div>

                      {/* Activities Row - Horizontally Scrollable */}
                      <AnimatePresence mode="wait">
                        {hoveredCategory && hoveredCategoryActivities.length > 0 && (
                          <motion.div
                            key={hoveredCategory}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div
                              className="mt-5 pt-5 border-t border-neutral-100"
                              onMouseEnter={() => {
                                // Keep both dropdowns open when mouse is anywhere in activities area
                                if (activitiesTimeoutRef.current) {
                                  clearTimeout(activitiesTimeoutRef.current)
                                }
                                if (categoriesTimeoutRef.current) {
                                  clearTimeout(categoriesTimeoutRef.current)
                                }
                              }}
                              onMouseLeave={handleCategoryMouseLeave}
                            >
                              <div
                                className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent"
                                onMouseEnter={() => {
                                  if (activitiesTimeoutRef.current) {
                                    clearTimeout(activitiesTimeoutRef.current)
                                  }
                                  if (categoriesTimeoutRef.current) {
                                    clearTimeout(categoriesTimeoutRef.current)
                                  }
                                }}
                              >
                                <div className="flex items-stretch gap-3 min-w-max px-1">
                                  {hoveredCategoryActivities.map((activity) => (
                                    <NavLink
                                      key={activity.id}
                                      href={`/activities/${activity.slug}`}
                                      className="block group flex-shrink-0"
                                      onClick={() => {
                                        setIsCategoriesOpen(false)
                                        setHoveredCategory(null)
                                      }}
                                      onMouseEnter={() => {
                                        if (activitiesTimeoutRef.current) {
                                          clearTimeout(activitiesTimeoutRef.current)
                                        }
                                      }}
                                    >
                                      <div className="w-32 p-2 rounded-xl hover:bg-neutral-50 transition-all">
                                        <div className="aspect-[4/3] relative overflow-hidden rounded-lg bg-neutral-100">
                                          {activity.image ? (
                                            <Image
                                              src={activity.image}
                                              alt={activity.title}
                                              fill
                                              sizes="128px"
                                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                          ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                                          )}
                                        </div>
                                        <p className="mt-2 text-xs font-medium text-neutral-600 text-center group-hover:text-[#ff2828] transition-colors line-clamp-2 leading-tight h-8">
                                          {activity.title}
                                        </p>
                                      </div>
                                    </NavLink>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {secondaryNavLinks.map((link) => (
              link.isAnchor ? (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className="px-4 py-2 text-sm text-neutral-700 hover:text-[#ff2828] font-medium rounded-xl transition-all cursor-pointer"
                >
                  {link.name}
                </a>
              ) : (
                <NavLink
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    isActive(link.href)
                      ? 'text-[#ff2828] font-semibold bg-[#ff2828]/10 ring-1 ring-[#ff2828]/20'
                      : 'text-neutral-700 hover:text-[#ff2828] hover:bg-[#ff2828]/5'
                  }`}
                >
                  {link.name}
                </NavLink>
              )
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative lang-menu">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-all"
              >
                <span>{localeLabels[locale].flag}</span>
                <span className="font-medium">{localeLabels[locale].label}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-36 bg-white rounded-2xl shadow-md border border-neutral-100 overflow-hidden p-2"
                  >
                    {Object.entries(localeLabels).map(([code, { flag, label }]) => (
                      <button
                        key={code}
                        onClick={() => switchLocale(code)}
                        className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm rounded-xl transition-all ${
                          locale === code
                            ? 'bg-[#ff2828]/10 text-[#ff2828] font-semibold'
                            : 'text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <span>{flag}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <NavLink
              href="/checkout"
              className="relative flex items-center justify-center w-10 h-10 text-neutral-600 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-semibold text-white bg-[#ff2828] rounded-full">
                  {cartItemCount}
                </span>
              )}
            </NavLink>

            {/* Book Now CTA */}
            <NavLink
              href={cartItemCount > 0 ? '/checkout' : '/activities'}
              className="px-5 py-2.5 bg-[#ff2828] text-white text-sm font-semibold rounded-xl hover:bg-[#e51f1f] transition-all shadow-sm hover:shadow-md"
            >
              {t('book')}
            </NavLink>
          </div>

          {/* Mobile Right Side */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Cart - Mobile */}
            <NavLink
              href="/checkout"
              className="relative flex items-center justify-center w-10 h-10 text-neutral-600"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-semibold text-white bg-[#ff2828] rounded-full">
                  {cartItemCount}
                </span>
              )}
            </NavLink>

            {/* Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center w-10 h-10 text-neutral-700 rounded-xl hover:bg-neutral-100 transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="absolute top-24 left-4 right-4 bg-white rounded-2xl shadow-md border border-neutral-100 overflow-hidden lg:hidden max-h-[80vh] overflow-y-auto"
            >
              {/* Menu Links */}
              <div className="p-3">
                {mainNavLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                      isActive(link.href)
                        ? 'text-[#ff2828] font-semibold'
                        : 'text-neutral-800 hover:text-[#ff2828]'
                    }`}
                  >
                    {isActive(link.href) && (
                      <span className="w-2 h-2 bg-[#ff2828] rounded-full flex-shrink-0" />
                    )}
                    {link.name}
                  </NavLink>
                ))}

                {/* Categories Section - Mobile */}
                {navbarData && navbarData.categories.length > 0 && (
                  <div className="pt-3 pb-2">
                    <div className="px-4 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      {t('toursCategories') || 'Tours & Categories'}
                    </div>

                    {/* Categories Grid - Mobile */}
                    <div className="px-2 py-2 grid grid-cols-3 gap-2">
                      {navbarData.categories.map((category) => (
                        <NavLink
                          key={category.id}
                          href={`/category/${category.slug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block group"
                        >
                          <div className="aspect-[4/3] relative bg-neutral-100 overflow-hidden rounded-lg">
                            {category.image ? (
                              <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                sizes="(max-width: 640px) 33vw, 128px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                            )}
                          </div>
                          <p className="mt-1 text-xs font-medium text-neutral-800 text-center line-clamp-1">
                            {category.name}
                          </p>
                        </NavLink>
                      ))}
                    </div>

                    {/* View All Link */}
                    <div className="px-4 py-2">
                      <NavLink
                        href="/activities"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-sm font-medium text-[#ff2828]"
                      >
                        {t('viewAllActivities')} →
                      </NavLink>
                    </div>
                  </div>
                )}

                {secondaryNavLinks.map((link) => (
                  link.isAnchor ? (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => handleAnchorClick(e, link.href)}
                      className="block px-4 py-3 text-neutral-800 hover:text-[#ff2828] rounded-xl font-medium transition-colors cursor-pointer"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <NavLink
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                        isActive(link.href)
                          ? 'text-[#ff2828] font-semibold'
                          : 'text-neutral-800 hover:text-[#ff2828]'
                      }`}
                    >
                      {isActive(link.href) && (
                        <span className="w-2 h-2 bg-[#ff2828] rounded-full flex-shrink-0" />
                      )}
                      {link.name}
                    </NavLink>
                  )
                ))}
              </div>

              {/* Divider */}
              <div className="mx-4 border-t border-neutral-100" />

              {/* Bottom Section */}
              <div className="p-4 space-y-4">
                {/* Language Row */}
                <div className="flex items-center gap-2">
                  {Object.entries(localeLabels).map(([code, { flag, label }]) => (
                    <button
                      key={code}
                      onClick={() => switchLocale(code)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                        locale === code
                          ? 'bg-[#ff2828] text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      <span>{flag}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {/* Book Now */}
                <NavLink
                  href={cartItemCount > 0 ? '/checkout' : '/activities'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-3.5 bg-[#ff2828] text-white font-semibold rounded-xl hover:bg-[#e51f1f] transition-all text-center shadow-sm"
                >
                  {t('book')}
                </NavLink>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
