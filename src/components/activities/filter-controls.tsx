'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronDown, X, Filter,
  DollarSign, Clock, Grid3X3, LayoutList,
  SlidersHorizontal
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface FilterControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  categories: { id: string; name: string; slug: string }[]
  activeCategory: string
  onCategoryChange: (slug: string) => void
  sortOptions: { value: string; label: string }[]
  sortBy: string
  onSortChange: (value: string) => void
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  priceRange?: [number, number]
  onPriceRangeChange?: (range: [number, number]) => void
  maxPrice?: number
  showViewToggle?: boolean
  showPriceFilter?: boolean
  compact?: boolean
}

export function FilterControls({
  searchQuery,
  onSearchChange,
  categories,
  activeCategory,
  onCategoryChange,
  sortOptions,
  sortBy,
  onSortChange,
  viewMode = 'grid',
  onViewModeChange,
  priceRange,
  onPriceRangeChange,
  maxPrice = 500,
  showViewToggle = true,
  showPriceFilter = false,
  compact = false,
}: FilterControlsProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const tFilter = useTranslations('filterControls')

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`${compact ? 'space-y-3' : 'space-y-4'}`}>
      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder={tFilter('searchActivities')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Price Filter Toggle */}
          {showPriceFilter && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 h-11 px-4 rounded-xl border transition-all ${
                showFilters
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{tFilter('filters')}</span>
            </button>
          )}

          {/* View Toggle */}
          {showViewToggle && onViewModeChange && (
            <div className="hidden sm:flex items-center bg-neutral-100 rounded-xl p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 h-11 px-4 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-700 hover:border-neutral-300 transition-all"
            >
              <span className="hidden sm:inline">{sortOptions.find(o => o.value === sortBy)?.label}</span>
              <span className="sm:hidden">{tFilter('sort')}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSortDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl border border-neutral-200 shadow-md z-50 overflow-hidden"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortChange(option.value)
                        setShowSortDropdown(false)
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        sortBy === option.value
                          ? 'bg-primary/5 text-primary font-medium'
                          : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.slug)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === category.slug
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Price Range Filter (expandable) */}
      <AnimatePresence>
        {showFilters && showPriceFilter && priceRange && onPriceRangeChange && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-700">{tFilter('priceRange')}</span>
                <span className="text-sm text-neutral-500">
                  €{priceRange[0]} - €{priceRange[1]}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const newMin = Math.min(Number(e.target.value), priceRange[1] - 10)
                      onPriceRangeChange([newMin, priceRange[1]])
                    }}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const newMax = Math.max(Number(e.target.value), priceRange[0] + 10)
                      onPriceRangeChange([priceRange[0], newMax])
                    }}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
