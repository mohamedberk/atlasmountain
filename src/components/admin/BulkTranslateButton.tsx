'use client'

import React, { useState, useCallback, useRef } from 'react'

interface TranslationResult {
  id: string
  title: string
  success: boolean
  error?: string
}

interface ProgressEvent {
  type: 'start' | 'progress' | 'complete' | 'error'
  total?: number
  current?: number
  activityId?: string
  title?: string
  status?: 'translating' | 'success' | 'error' | 'skipped'
  message?: string
  error?: string
  localizedFields?: number
  results?: {
    success: number
    failed: number
    details: TranslationResult[]
  }
}

type TranslationStatus = 'idle' | 'translating' | 'complete' | 'error'

export const BulkTranslateButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<TranslationStatus>('idle')
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(0)
  const [currentActivity, setCurrentActivity] = useState<string>('')
  const [results, setResults] = useState<TranslationResult[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [localizedFieldsCount, setLocalizedFieldsCount] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleStartTranslation = useCallback(async () => {
    setStatus('translating')
    setTotal(0)
    setCurrent(0)
    setCurrentActivity('')
    setResults([])
    setErrorMessage('')

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/bulk-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          collection: 'activities',
          sourceLocale: 'en',
          targetLocale: 'fr',
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to start bulk translation')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response stream')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: ProgressEvent = JSON.parse(line.slice(6))

              switch (event.type) {
                case 'start':
                  setTotal(event.total || 0)
                  setLocalizedFieldsCount(event.localizedFields || 0)
                  break

                case 'progress':
                  setCurrent(event.current || 0)
                  setCurrentActivity(event.title || '')
                  if (event.status === 'success' || event.status === 'error' || event.status === 'skipped') {
                    setResults((prev) => [
                      ...prev,
                      {
                        id: event.activityId || '',
                        title: event.title || '',
                        success: event.status === 'success' || event.status === 'skipped',
                        error: event.error || event.message,
                      },
                    ])
                  }
                  break

                case 'complete':
                  setStatus('complete')
                  if (event.results) {
                    setResults(event.results.details)
                  }
                  break

                case 'error':
                  setStatus('error')
                  setErrorMessage(event.message || 'Translation failed')
                  break
              }
            } catch (e) {
              console.error('Failed to parse SSE event:', line)
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setStatus('idle')
        return
      }
      console.error('Bulk translation error:', error)
      setStatus('error')
      setErrorMessage(error.message || 'Translation failed')
    }
  }, [])

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setStatus('idle')
  }, [])

  const closeModal = useCallback(() => {
    if (status === 'translating') {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
    setIsOpen(false)
    setStatus('idle')
    setResults([])
    setErrorMessage('')
  }, [status])

  const successCount = results.filter((r) => r.success).length
  const failedCount = results.filter((r) => !r.success).length

  return (
    <>
      {/* Translate Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          backgroundColor: 'var(--theme-elevation-500)',
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
          <path d="m5 8 6 6" />
          <path d="m4 14 6-6 2-3" />
          <path d="M2 5h12" />
          <path d="M7 2h1" />
          <path d="m22 22-5-10-5 10" />
          <path d="M14 18h6" />
        </svg>
        Translate All to French
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
            if (e.target === e.currentTarget && status !== 'translating') closeModal()
          }}
        >
          {/* Modal Content */}
          <div
            style={{
              backgroundColor: 'var(--theme-elevation-0)',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m5 8 6 6" />
                    <path d="m4 14 6-6 2-3" />
                    <path d="M2 5h12" />
                    <path d="M7 2h1" />
                    <path d="m22 22-5-10-5 10" />
                    <path d="M14 18h6" />
                  </svg>
                  Bulk Translate to French
                </h2>
                <p style={{ color: 'var(--theme-elevation-500)', fontSize: '13px', margin: '4px 0 0' }}>
                  Translate all activities from English to French
                </p>
              </div>
              {status !== 'translating' && (
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
                  x
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              {/* Idle state - Confirmation */}
              {status === 'idle' && (
                <div>
                  <div
                    style={{
                      backgroundColor: 'var(--theme-warning-50)',
                      border: '1px solid var(--theme-warning-200)',
                      borderRadius: '6px',
                      padding: '16px',
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--theme-warning-600)"
                        strokeWidth="2"
                        style={{ flexShrink: 0, marginTop: '2px' }}
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--theme-warning-700)', marginBottom: '4px' }}>
                          This will translate ALL activities
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--theme-warning-600)' }}>
                          This operation will translate every activity in the database from English to French.
                          This may take several minutes depending on the number of activities.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600' }}>Fields that will be translated:</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--theme-elevation-600)' }}>
                      <li>Title</li>
                      <li>Description (Rich Text)</li>
                      <li>Short Description</li>
                      <li>Duration</li>
                      <li>Highlights (all items)</li>
                      <li>Included items</li>
                      <li>Not Included items</li>
                      <li>Recommendations</li>
                      <li>Itinerary (all steps)</li>
                      <li>Gallery captions</li>
                      <li>SEO fields (meta title, description, keywords)</li>
                    </ul>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleStartTranslation}
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
                        fontWeight: '600',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m5 8 6 6" />
                        <path d="m4 14 6-6 2-3" />
                        <path d="M2 5h12" />
                        <path d="M7 2h1" />
                        <path d="m22 22-5-10-5 10" />
                        <path d="M14 18h6" />
                      </svg>
                      Start Translation
                    </button>
                    <button
                      onClick={closeModal}
                      style={{
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
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Translating state - Progress */}
              {status === 'translating' && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid var(--theme-elevation-200)',
                        borderTopColor: 'var(--theme-success-500)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px',
                      }}
                    />
                    <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                      Translating Activities...
                    </div>
                    <div style={{ color: 'var(--theme-elevation-500)', fontSize: '14px' }}>
                      {current} of {total} activities
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      height: '8px',
                      backgroundColor: 'var(--theme-elevation-200)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: total > 0 ? `${(current / total) * 100}%` : '0%',
                        backgroundColor: 'var(--theme-success-500)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>

                  {currentActivity && (
                    <div
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--theme-elevation-50)',
                        borderRadius: '6px',
                        marginBottom: '16px',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: 'var(--theme-elevation-500)', marginBottom: '4px' }}>
                        Currently translating:
                      </div>
                      <div style={{ fontWeight: '500' }}>{currentActivity}</div>
                    </div>
                  )}

                  {/* Recent results */}
                  {results.length > 0 && (
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <div style={{ fontSize: '12px', color: 'var(--theme-elevation-500)', marginBottom: '8px' }}>
                        Completed:
                      </div>
                      {results.slice(-5).reverse().map((result, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px',
                            fontSize: '13px',
                            borderBottom: '1px solid var(--theme-elevation-100)',
                          }}
                        >
                          <span style={{ color: result.success ? 'var(--theme-success-500)' : 'var(--theme-error-500)' }}>
                            {result.success ? '✓' : '✗'}
                          </span>
                          <span style={{ flex: 1 }}>{result.title}</span>
                          {result.error && (
                            <span style={{ fontSize: '11px', color: 'var(--theme-error-500)' }}>{result.error}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleCancel}
                    style={{
                      marginTop: '16px',
                      padding: '10px 20px',
                      backgroundColor: 'var(--theme-elevation-200)',
                      color: 'var(--theme-text)',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Complete state */}
              {status === 'complete' && (
                <div>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '20px',
                      backgroundColor: 'var(--theme-success-50)',
                      borderRadius: '8px',
                      marginBottom: '20px',
                    }}
                  >
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--theme-success-500)"
                      strokeWidth="2"
                      style={{ margin: '0 auto 12px' }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--theme-success-700)', marginBottom: '8px' }}>
                      Translation Complete!
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--theme-success-600)' }}>
                      {successCount} activities translated successfully
                      {failedCount > 0 && `, ${failedCount} failed`}
                    </div>
                  </div>

                  {/* Results list */}
                  <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                    {results.map((result, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          backgroundColor: result.success ? 'var(--theme-success-50)' : 'var(--theme-error-50)',
                          borderRadius: '6px',
                          marginBottom: '8px',
                        }}
                      >
                        <span
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: result.success ? 'var(--theme-success-500)' : 'var(--theme-error-500)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            flexShrink: 0,
                          }}
                        >
                          {result.success ? '✓' : '!'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '500', fontSize: '14px' }}>{result.title}</div>
                          {result.error && (
                            <div style={{ fontSize: '12px', color: 'var(--theme-error-600)', marginTop: '2px' }}>
                              {result.error}
                            </div>
                          )}
                        </div>
                        {result.success && (
                          <a
                            href={`/admin/collections/activities/${result.id}?locale=fr`}
                            style={{
                              fontSize: '12px',
                              color: 'var(--theme-success-600)',
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
                      onClick={() => window.location.reload()}
                      style={{
                        flex: 1,
                        padding: '12px 24px',
                        backgroundColor: 'var(--theme-success-500)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* Error state */}
              {status === 'error' && (
                <div>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '20px',
                      backgroundColor: 'var(--theme-error-50)',
                      borderRadius: '8px',
                      marginBottom: '20px',
                    }}
                  >
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--theme-error-500)"
                      strokeWidth="2"
                      style={{ margin: '0 auto 12px' }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--theme-error-700)', marginBottom: '8px' }}>
                      Translation Failed
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--theme-error-600)' }}>{errorMessage}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => {
                        setStatus('idle')
                        setErrorMessage('')
                      }}
                      style={{
                        flex: 1,
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
                      Try Again
                    </button>
                    <button
                      onClick={closeModal}
                      style={{
                        flex: 1,
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
                      Close
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

export default BulkTranslateButton
