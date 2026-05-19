'use client'

import React, { useState, useCallback } from 'react'

interface ScrapedActivity {
  title: string
  slug: string
  description: string
  shortDescription: string
  duration: string
  location: string
  difficulty: string
  pricingType: 'per_person' | 'fixed' | 'both'
  groupPricing?: {
    adultPrice: number
    childPrice: number
    childAgeLimit?: number
    minGroupSize?: number
    maxGroupSize?: number
  }
  privatePricing?: {
    basePrice: number
    minGuests?: number
    maxGuests?: number
    additionalGuestPrice?: number
  }
  highlights: string[]
  included: string[]
  notIncluded: string[]
  recommendations: string[]
  itinerary: { time?: string; activity: string; description?: string }[]
  images: string[]
  sourceUrl: string
  category?: string
  languages: string[]
  coordinates?: {
    latitude: number
    longitude: number
  }
}

interface ImportResult {
  success: boolean
  activityId?: string
  activityName: string
  slug?: string
  error?: string
  mediaIds?: string[]
  slugConflict?: boolean
  suggestedSlug?: string
}

type ImportStatus = 'idle' | 'scraping' | 'previewing' | 'importing' | 'done'

export const ActivitiesListImportButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [urls, setUrls] = useState('')
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [scrapedActivities, setScrapedActivities] = useState<ScrapedActivity[]>([])
  const [scrapeErrors, setScrapeErrors] = useState<{ url: string; error: string }[]>([])
  const [importResults, setImportResults] = useState<ImportResult[]>([])
  const [selectedActivities, setSelectedActivities] = useState<Set<number>>(new Set())
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set())
  const [options, setOptions] = useState({
    downloadImages: true,
    createCategories: true,
    defaultStatus: false,
  })

  const parseUrls = useCallback(() => {
    return urls
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.startsWith('http'))
  }, [urls])

  const handleScrape = async () => {
    const urlList = parseUrls()
    if (urlList.length === 0) return

    setStatus('scraping')
    setScrapedActivities([])
    setScrapeErrors([])

    try {
      const response = await fetch('/api/scrape-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ urls: urlList }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape activities')
      }

      if (data.activities) {
        setScrapedActivities(data.activities)
        setSelectedActivities(new Set(data.activities.map((_: ScrapedActivity, i: number) => i)))
      }
      if (data.errors) {
        setScrapeErrors(data.errors)
      }

      setStatus('previewing')
    } catch (error) {
      console.error('Scrape error:', error)
      setScrapeErrors([
        { url: 'all', error: error instanceof Error ? error.message : 'Failed to scrape activities' },
      ])
      setStatus('idle')
    }
  }

  const handleImport = async () => {
    if (selectedActivities.size === 0) return

    setStatus('importing')
    setImportResults([])

    const activitiesToImport = scrapedActivities.filter((_, i) => selectedActivities.has(i))

    try {
      const response = await fetch('/api/import-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          activities: activitiesToImport,
          options,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import activities')
      }

      if (data.results) {
        setImportResults(data.results)
      }

      setStatus('done')
    } catch (error) {
      console.error('Import error:', error)
      setImportResults([
        {
          success: false,
          activityName: 'Import',
          error: error instanceof Error ? error.message : 'Failed to import activities',
        },
      ])
      setStatus('done')
    }
  }

  const toggleActivity = (index: number) => {
    const newSelected = new Set(selectedActivities)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedActivities(newSelected)
  }

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedActivities)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedActivities(newExpanded)
  }

  const selectAll = () => setSelectedActivities(new Set(scrapedActivities.map((_, i) => i)))
  const selectNone = () => setSelectedActivities(new Set())

  const reset = () => {
    setStatus('idle')
    setScrapedActivities([])
    setScrapeErrors([])
    setImportResults([])
    setSelectedActivities(new Set())
    setExpandedActivities(new Set())
    setUrls('')
  }

  const closeModal = () => {
    reset()
    setIsOpen(false)
  }

  const formatPrice = (price: number | undefined) => {
    if (!price) return 'Price on request'
    return `${price} EUR`
  }

  return (
    <>
      {/* Import Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          backgroundColor: 'var(--theme-success-500)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '500',
          marginRight: '8px',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Import
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          {/* Modal Content */}
          <div
            style={{
              backgroundColor: 'var(--theme-elevation-0)',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--theme-elevation-150)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                backgroundColor: 'var(--theme-elevation-0)',
                zIndex: 1,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Import Activities
                </h2>
                <p style={{ color: 'var(--theme-elevation-500)', fontSize: '13px', margin: '4px 0 0' }}>
                  Paste URLs from atlasmountainsvisit.com to import activities with images
                </p>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--theme-elevation-500)',
                  lineHeight: 1,
                  padding: '4px',
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              {/* Step 1: URL Input */}
              {status === 'idle' && (
                <div>
                  <textarea
                    style={{
                      width: '100%',
                      minHeight: '150px',
                      padding: '12px',
                      border: '1px solid var(--theme-elevation-200)',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      resize: 'vertical',
                      backgroundColor: 'var(--theme-elevation-50)',
                      color: 'var(--theme-text)',
                    }}
                    placeholder={`Paste activity URLs here, one per line...

https://atlasmountainsvisit.com/marrakech-full-day-guided-city-tour/
https://atlasmountainsvisit.com/3-day-2-night-desert-tour-from-marrakech-to-merzouga-and-back/`}
                    value={urls}
                    onChange={(e) => setUrls(e.target.value)}
                  />

                  {/* Options */}
                  <div
                    style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={options.downloadImages}
                        onChange={(e) => setOptions({ ...options, downloadImages: e.target.checked })}
                        style={{ width: '16px', height: '16px' }}
                      />
                      Download and upload images to media library
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={options.createCategories}
                        onChange={(e) =>
                          setOptions({ ...options, createCategories: e.target.checked })
                        }
                        style={{ width: '16px', height: '16px' }}
                      />
                      Create missing categories automatically
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={options.defaultStatus}
                        onChange={(e) => setOptions({ ...options, defaultStatus: e.target.checked })}
                        style={{ width: '16px', height: '16px' }}
                      />
                      Publish immediately (set isActive to true)
                    </label>
                  </div>

                  <button
                    onClick={handleScrape}
                    disabled={parseUrls().length === 0}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      backgroundColor:
                        parseUrls().length === 0
                          ? 'var(--theme-elevation-200)'
                          : 'var(--theme-success-500)',
                      color: parseUrls().length === 0 ? 'var(--theme-elevation-500)' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: parseUrls().length === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    Analyze {parseUrls().length > 0 && `(${parseUrls().length} URLs)`}
                  </button>
                </div>
              )}

              {/* Step 2: Scraping in progress */}
              {status === 'scraping' && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid var(--theme-elevation-200)',
                      borderTopColor: 'var(--theme-success-500)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 16px',
                    }}
                  />
                  <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                    Analyzing activities...
                  </div>
                  <div style={{ color: 'var(--theme-elevation-500)', fontSize: '14px' }}>
                    Extracting data, itineraries, and images from {parseUrls().length} URL(s)
                  </div>
                </div>
              )}

              {/* Step 3: Preview scraped activities */}
              {status === 'previewing' && (
                <div>
                  {/* Header with selection controls */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: 'var(--theme-elevation-100)',
                      borderRadius: '6px',
                    }}
                  >
                    <strong style={{ fontSize: '15px' }}>
                      {scrapedActivities.length} activity(ies) found
                    </strong>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={selectAll}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--theme-success-500)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          textDecoration: 'underline',
                        }}
                      >
                        Select all
                      </button>
                      <button
                        onClick={selectNone}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--theme-elevation-600)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          textDecoration: 'underline',
                        }}
                      >
                        Deselect all
                      </button>
                      <button
                        onClick={reset}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--theme-error-500)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          textDecoration: 'underline',
                        }}
                      >
                        Start over
                      </button>
                    </div>
                  </div>

                  {/* Scrape errors */}
                  {scrapeErrors.length > 0 && (
                    <div
                      style={{
                        background: 'var(--theme-error-50)',
                        border: '1px solid var(--theme-error-200)',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '16px',
                      }}
                    >
                      <strong style={{ color: 'var(--theme-error-600)' }}>
                        {scrapeErrors.length} error(s):
                      </strong>
                      <ul
                        style={{
                          margin: '8px 0 0',
                          paddingLeft: '20px',
                          fontSize: '13px',
                          color: 'var(--theme-error-600)',
                        }}
                      >
                        {scrapeErrors.map((err, i) => (
                          <li key={i}>
                            {err.url !== 'all' && (
                              <code style={{ marginRight: '4px' }}>{err.url}</code>
                            )}
                            {err.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Activity list */}
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}
                  >
                    {scrapedActivities.map((activity, index) => (
                      <div
                        key={index}
                        style={{
                          border: `2px solid ${selectedActivities.has(index) ? 'var(--theme-success-400)' : 'var(--theme-elevation-200)'}`,
                          borderRadius: '8px',
                          padding: '16px',
                          background: selectedActivities.has(index)
                            ? 'var(--theme-success-50)'
                            : 'var(--theme-elevation-0)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <input
                            type="checkbox"
                            checked={selectedActivities.has(index)}
                            onChange={() => toggleActivity(index)}
                            style={{ marginTop: '4px', width: '18px', height: '18px', cursor: 'pointer' }}
                          />

                          {activity.images[0] && (
                            <img
                              src={activity.images[0]}
                              alt={activity.title}
                              style={{
                                width: '80px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                flexShrink: 0,
                              }}
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          )}

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                              {activity.title}
                            </div>
                            <div
                              style={{
                                fontSize: '13px',
                                color: 'var(--theme-elevation-500)',
                                display: 'flex',
                                gap: '16px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <span>{activity.duration}</span>
                              <span>{activity.location}</span>
                              <span>{activity.difficulty}</span>
                              <span style={{ color: 'var(--theme-success-600)' }}>
                                {activity.category}
                              </span>
                              <span style={{ fontWeight: '500' }}>
                                {formatPrice(activity.groupPricing?.adultPrice)}
                              </span>
                              <span>{activity.images.length} image(s)</span>
                            </div>
                            {/* Data extraction summary */}
                            <div
                              style={{
                                fontSize: '11px',
                                color: 'var(--theme-elevation-400)',
                                marginTop: '6px',
                                display: 'flex',
                                gap: '8px',
                                flexWrap: 'wrap',
                              }}
                            >
                              {activity.highlights.length > 0 && (
                                <span>{activity.highlights.length} highlights</span>
                              )}
                              {activity.included.length > 0 && (
                                <span>{activity.included.length} included</span>
                              )}
                              {activity.notIncluded.length > 0 && (
                                <span>{activity.notIncluded.length} not included</span>
                              )}
                              {activity.itinerary.length > 0 && (
                                <span>{activity.itinerary.length} itinerary steps</span>
                              )}
                              {activity.languages?.length > 0 && (
                                <span>{activity.languages.join(', ')}</span>
                              )}
                              {activity.coordinates && (
                                <span style={{ color: 'var(--theme-success-500)' }}>Has GPS</span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => toggleExpanded(index)}
                            style={{
                              background: 'var(--theme-elevation-100)',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                            }}
                          >
                            {expandedActivities.has(index) ? 'Hide' : 'Details'}
                          </button>
                        </div>

                        {/* Expanded details */}
                        {expandedActivities.has(index) && (
                          <div
                            style={{
                              marginTop: '16px',
                              paddingTop: '16px',
                              borderTop: '1px solid var(--theme-elevation-150)',
                            }}
                          >
                            <div style={{ marginBottom: '12px' }}>
                              <strong style={{ fontSize: '13px', color: 'var(--theme-elevation-600)' }}>
                                Description:
                              </strong>
                              <p style={{ margin: '4px 0 0', fontSize: '13px', lineHeight: '1.5' }}>
                                {activity.description.slice(0, 400)}...
                              </p>
                            </div>

                            {activity.highlights.length > 0 && (
                              <div style={{ marginBottom: '12px' }}>
                                <strong style={{ fontSize: '13px', color: 'var(--theme-elevation-600)' }}>
                                  Highlights ({activity.highlights.length}):
                                </strong>
                                <ul style={{ margin: '4px 0 0', paddingLeft: '20px', fontSize: '13px' }}>
                                  {activity.highlights.slice(0, 5).map((h, i) => (
                                    <li key={i}>{h}</li>
                                  ))}
                                  {activity.highlights.length > 5 && (
                                    <li style={{ color: 'var(--theme-elevation-500)' }}>
                                      +{activity.highlights.length - 5} more...
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}

                            {activity.included.length > 0 && (
                              <div style={{ marginBottom: '12px' }}>
                                <strong style={{ fontSize: '13px', color: 'var(--theme-elevation-600)' }}>
                                  Included ({activity.included.length}):
                                </strong>
                                <ul style={{ margin: '4px 0 0', paddingLeft: '20px', fontSize: '13px' }}>
                                  {activity.included.slice(0, 5).map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                  {activity.included.length > 5 && (
                                    <li style={{ color: 'var(--theme-elevation-500)' }}>
                                      +{activity.included.length - 5} more...
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}

                            {activity.notIncluded.length > 0 && (
                              <div style={{ marginBottom: '12px' }}>
                                <strong style={{ fontSize: '13px', color: 'var(--theme-elevation-600)' }}>
                                  Not Included ({activity.notIncluded.length}):
                                </strong>
                                <ul style={{ margin: '4px 0 0', paddingLeft: '20px', fontSize: '13px' }}>
                                  {activity.notIncluded.slice(0, 5).map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                  {activity.notIncluded.length > 5 && (
                                    <li style={{ color: 'var(--theme-elevation-500)' }}>
                                      +{activity.notIncluded.length - 5} more...
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}

                            {activity.itinerary.length > 0 && (
                              <div style={{ marginBottom: '12px' }}>
                                <strong style={{ fontSize: '13px', color: 'var(--theme-elevation-600)' }}>
                                  Itinerary ({activity.itinerary.length} steps):
                                </strong>
                                <ul style={{ margin: '4px 0 0', paddingLeft: '20px', fontSize: '13px' }}>
                                  {activity.itinerary.slice(0, 3).map((item, idx) => (
                                    <li key={idx}>
                                      {item.time && <strong>{item.time}:</strong>} {item.activity}
                                    </li>
                                  ))}
                                  {activity.itinerary.length > 3 && (
                                    <li style={{ color: 'var(--theme-elevation-500)' }}>
                                      +{activity.itinerary.length - 3} more...
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}

                            {/* Image gallery preview */}
                            {activity.images.length > 0 && (
                              <div>
                                <strong style={{ fontSize: '13px', color: 'var(--theme-elevation-600)' }}>
                                  Images ({activity.images.length}):
                                </strong>
                                <div
                                  style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}
                                >
                                  {activity.images.slice(0, 6).map((img, i) => (
                                    <img
                                      key={i}
                                      src={img}
                                      alt=""
                                      style={{
                                        width: '60px',
                                        height: '45px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                        border: '1px solid var(--theme-elevation-150)',
                                      }}
                                      onError={(e) => {
                                        ;(e.target as HTMLImageElement).style.display = 'none'
                                      }}
                                    />
                                  ))}
                                  {activity.images.length > 6 && (
                                    <div
                                      style={{
                                        width: '60px',
                                        height: '45px',
                                        borderRadius: '4px',
                                        backgroundColor: 'var(--theme-elevation-100)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        color: 'var(--theme-elevation-500)',
                                      }}
                                    >
                                      +{activity.images.length - 6}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Languages */}
                            {activity.languages?.length > 0 && (
                              <div style={{ marginBottom: '12px' }}>
                                <strong style={{ fontSize: '13px', color: 'var(--theme-elevation-600)' }}>
                                  Languages:
                                </strong>
                                <span style={{ marginLeft: '8px', fontSize: '13px' }}>
                                  {activity.languages.join(', ')}
                                </span>
                              </div>
                            )}

                            {/* Coordinates */}
                            {activity.coordinates && (
                              <div style={{ marginBottom: '12px' }}>
                                <strong style={{ fontSize: '13px', color: 'var(--theme-elevation-600)' }}>
                                  GPS Coordinates:
                                </strong>
                                <span style={{ marginLeft: '8px', fontSize: '13px', fontFamily: 'monospace' }}>
                                  {activity.coordinates.latitude.toFixed(6)}, {activity.coordinates.longitude.toFixed(6)}
                                </span>
                              </div>
                            )}

                            <a
                              href={activity.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '12px',
                                color: 'var(--theme-success-500)',
                                marginTop: '12px',
                                display: 'inline-block',
                              }}
                            >
                              View source page
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Import button */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      background: 'var(--theme-elevation-100)',
                      borderRadius: '6px',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>
                      <strong>{selectedActivities.size}</strong> activity(ies) selected for import
                    </span>
                    <button
                      onClick={handleImport}
                      disabled={selectedActivities.size === 0}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor:
                          selectedActivities.size === 0
                            ? 'var(--theme-elevation-200)'
                            : 'var(--theme-success-500)',
                        color: selectedActivities.size === 0 ? 'var(--theme-elevation-500)' : 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: selectedActivities.size === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Import Selected Activities
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Importing in progress */}
              {status === 'importing' && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid var(--theme-elevation-200)',
                      borderTopColor: 'var(--theme-success-500)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 16px',
                    }}
                  />
                  <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                    Importing activities...
                  </div>
                  <div style={{ color: 'var(--theme-elevation-500)', fontSize: '14px' }}>
                    {options.downloadImages
                      ? 'Downloading images and creating activities. This may take a few minutes...'
                      : 'Creating activities...'}
                  </div>
                </div>
              )}

              {/* Step 5: Import complete */}
              {status === 'done' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: 'var(--theme-success-50)',
                      borderRadius: '6px',
                      border: '1px solid var(--theme-success-200)',
                    }}
                  >
                    <strong style={{ fontSize: '15px', color: 'var(--theme-success-600)' }}>
                      Import complete
                    </strong>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                      <span style={{ color: 'var(--theme-success-600)' }}>
                        {importResults.filter((r) => r.success).length} succeeded
                      </span>
                      {importResults.filter((r) => !r.success).length > 0 && (
                        <span style={{ color: 'var(--theme-error-500)' }}>
                          {importResults.filter((r) => !r.success).length} failed
                        </span>
                      )}
                      {importResults.filter((r) => r.slugConflict).length > 0 && (
                        <span style={{ color: 'var(--theme-warning-500)' }}>
                          {importResults.filter((r) => r.slugConflict).length} slug adjusted
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Results list */}
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}
                  >
                    {importResults.map((result, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          background: result.success
                            ? 'var(--theme-success-50)'
                            : 'var(--theme-error-50)',
                          border: `1px solid ${result.success ? 'var(--theme-success-200)' : 'var(--theme-error-200)'}`,
                          borderRadius: '6px',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{result.success ? '✓' : '✗'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '500' }}>{result.activityName}</div>
                          {result.slugConflict && (
                            <div style={{ fontSize: '12px', color: 'var(--theme-warning-600)' }}>
                              Slug adjusted to: {result.suggestedSlug}
                            </div>
                          )}
                          {result.mediaIds && result.mediaIds.length > 0 && (
                            <div style={{ fontSize: '12px', color: 'var(--theme-elevation-500)' }}>
                              {result.mediaIds.length} image(s) uploaded
                            </div>
                          )}
                          {!result.success && (
                            <div style={{ fontSize: '12px', color: 'var(--theme-error-500)' }}>
                              {result.error}
                            </div>
                          )}
                        </div>
                        {result.success && result.activityId && (
                          <a
                            href={`/admin/collections/activities/${result.activityId}`}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: 'var(--theme-success-500)',
                              color: 'white',
                              borderRadius: '4px',
                              fontSize: '12px',
                              textDecoration: 'none',
                            }}
                          >
                            View
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={reset}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: 'var(--theme-elevation-200)',
                        color: 'var(--theme-text)',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    >
                      Import more
                    </button>
                    <button
                      onClick={() => {
                        closeModal()
                        window.location.reload()
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: 'var(--theme-success-500)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spinner animation */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  )
}

export default ActivitiesListImportButton
