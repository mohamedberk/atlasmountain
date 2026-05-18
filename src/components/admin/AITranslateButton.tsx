'use client'

import React, { useState, useCallback } from 'react'
import { useDocumentInfo, useLocale, useTranslation } from '@payloadcms/ui'

// Types for the translation response
interface TranslationResult {
  success: boolean
  error?: string
}

interface TranslationResponse {
  success: boolean
  message: string
  results: Record<string, TranslationResult>
  translatedFields: string[]
}

interface FieldsInfoResponse {
  localizedFields: string[]
  availableLocales: string[]
  defaultLocale: string
}

export const AITranslateButton: React.FC = () => {
  const [isTranslating, setIsTranslating] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'partial'>('idle')
  const [message, setMessage] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [results, setResults] = useState<Record<string, TranslationResult>>({})

  const { id, collectionSlug, globalSlug } = useDocumentInfo()
  const locale = useLocale()
  const { t } = useTranslation()

  // Don't show the button until the document is saved (has an ID)
  // For globals, we always show it since they don't need an ID
  const isCollection = Boolean(collectionSlug)
  const isDocumentSaved = Boolean(id) || !isCollection

  const handleTranslate = useCallback(async () => {
    // Early exit if document not saved
    if (!isDocumentSaved) {
      setStatus('error')
      setMessage('Please save the document first')
      return
    }
    const type = collectionSlug ? 'collection' : 'global'
    const slug = collectionSlug || globalSlug

    if (!slug) {
      setStatus('error')
      setMessage('Could not determine document type')
      return
    }

    // For collections, we need the document ID
    if (type === 'collection' && !id) {
      setStatus('error')
      setMessage('Please save the document first before translating')
      return
    }

    setIsTranslating(true)
    setStatus('idle')
    setMessage('')
    setResults({})

    try {
      // First, get available locales and fields info
      console.log(`[AITranslate] Fetching fields for type=${type}, slug=${slug}`)
      const infoResponse = await fetch(
        `/api/ai-translate?type=${type}&slug=${slug}`
      )
      const fieldsInfo = await infoResponse.json()

      // Log full response for debugging
      console.log('[AITranslate] API Response:', JSON.stringify(fieldsInfo, null, 2))

      if (!infoResponse.ok) {
        throw new Error(fieldsInfo.error || 'Failed to get field info')
      }

      // Log debug info if available
      if (fieldsInfo.debug) {
        console.log('[AITranslate] Debug Info:', fieldsInfo.debug)
      }

      // Filter out current locale from target locales - only translate to French
      const currentLocale = locale?.code || 'en'
      const targetLocales = fieldsInfo.availableLocales.filter(
        (l: string) => l !== currentLocale && l === 'fr'
      )

      console.log('[AITranslate] Current locale:', currentLocale)
      console.log('[AITranslate] Target locales:', targetLocales)
      console.log('[AITranslate] Localized fields found:', fieldsInfo.localizedFields)

      if (targetLocales.length === 0) {
        setStatus('error')
        setMessage('No other locales to translate to')
        setIsTranslating(false)
        return
      }

      if (!fieldsInfo.localizedFields || fieldsInfo.localizedFields.length === 0) {
        setStatus('error')
        setMessage('No translatable fields found in this document')
        console.error('[AITranslate] No localized fields found! Check debug info above.')
        setIsTranslating(false)
        return
      }

      // Perform translation
      const translateResponse = await fetch('/api/ai-translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          slug,
          documentId: id,
          sourceLocale: currentLocale,
          targetLocales,
        }),
      })

      const translateResult: TranslationResponse = await translateResponse.json()

      if (!translateResponse.ok) {
        throw new Error((translateResult as any).error || 'Translation failed')
      }

      setResults(translateResult.results)

      // Check results
      const successCount = Object.values(translateResult.results).filter(
        (r) => r.success
      ).length
      const totalCount = Object.keys(translateResult.results).length

      if (successCount === totalCount) {
        setStatus('success')
        setMessage(
          `Successfully translated to ${successCount} locale${successCount > 1 ? 's' : ''}`
        )
      } else if (successCount > 0) {
        setStatus('partial')
        setMessage(
          `Translated to ${successCount}/${totalCount} locales. Some translations failed.`
        )
      } else {
        setStatus('error')
        setMessage('All translations failed')
      }
    } catch (error: any) {
      console.error('Translation error:', error)
      setStatus('error')
      setMessage(error.message || 'Translation failed')
    } finally {
      setIsTranslating(false)
    }
  }, [id, collectionSlug, globalSlug, locale, isDocumentSaved])

  // Early return UI for unsaved documents
  if (!isDocumentSaved) {
    return (
      <div
        style={{
          padding: '16px',
          marginBottom: '16px',
          backgroundColor: 'var(--theme-elevation-50)',
          borderRadius: '8px',
          border: '1px solid var(--theme-elevation-100)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--theme-elevation-500)',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.5 }}
          >
            <path d="m5 8 6 6" />
            <path d="m4 14 6-6 2-3" />
            <path d="M2 5h12" />
            <path d="M7 2h1" />
            <path d="m22 22-5-10-5 10" />
            <path d="M14 18h6" />
          </svg>
          <span style={{ fontSize: '13px' }}>
            Save the document first to enable AI translation
          </span>
        </div>
      </div>
    )
  }

  // Get locale display info
  const localeNames: Record<string, string> = {
    en: 'English',
    fr: 'French',
    de: 'German',
    es: 'Spanish',
    ar: 'Arabic',
    it: 'Italian',
    pt: 'Portuguese',
  }

  return (
    <div
      style={{
        padding: '16px',
        marginBottom: '16px',
        backgroundColor: 'var(--theme-elevation-50)',
        borderRadius: '8px',
        border: '1px solid var(--theme-elevation-100)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: status !== 'idle' ? '12px' : '0',
        }}
      >
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: isTranslating
              ? 'var(--theme-elevation-200)'
              : 'var(--theme-success-500)',
            color: isTranslating ? 'var(--theme-text)' : 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isTranslating ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
        >
          {isTranslating ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid currentColor',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              Translating...
            </>
          ) : (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 8 6 6" />
                <path d="m4 14 6-6 2-3" />
                <path d="M2 5h12" />
                <path d="M7 2h1" />
                <path d="m22 22-5-10-5 10" />
                <path d="M14 18h6" />
              </svg>
              AI Translate All
            </>
          )}
        </button>

        <span
          style={{
            fontSize: '13px',
            color: 'var(--theme-elevation-500)',
          }}
        >
          Translate from{' '}
          <strong>{localeNames[locale?.code || 'en'] || locale?.code}</strong> to
          French
        </span>
      </div>

      {/* Status message */}
      {status !== 'idle' && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '6px',
            backgroundColor:
              status === 'success'
                ? 'var(--theme-success-100)'
                : status === 'partial'
                  ? 'var(--theme-warning-100)'
                  : 'var(--theme-error-100)',
            color:
              status === 'success'
                ? 'var(--theme-success-600)'
                : status === 'partial'
                  ? 'var(--theme-warning-600)'
                  : 'var(--theme-error-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {status === 'success' && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {status === 'partial' && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
            {status === 'error' && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            {message}
          </span>

          {Object.keys(results).length > 0 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                fontSize: '13px',
                textDecoration: 'underline',
              }}
            >
              {showDetails ? 'Hide details' : 'Show details'}
            </button>
          )}
        </div>
      )}

      {/* Detailed results */}
      {showDetails && Object.keys(results).length > 0 && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: 'var(--theme-elevation-0)',
            borderRadius: '6px',
            border: '1px solid var(--theme-elevation-100)',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
            Translation Results:
          </div>
          {Object.entries(results).map(([localeCode, result]) => (
            <div
              key={localeCode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 0',
                borderBottom: '1px solid var(--theme-elevation-100)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: result.success
                    ? 'var(--theme-success-500)'
                    : 'var(--theme-error-500)',
                }}
              />
              <span style={{ fontWeight: '500' }}>
                {localeNames[localeCode] || localeCode}
              </span>
              {result.success ? (
                <span style={{ color: 'var(--theme-success-600)', fontSize: '12px' }}>
                  Success
                </span>
              ) : (
                <span style={{ color: 'var(--theme-error-600)', fontSize: '12px' }}>
                  {result.error || 'Failed'}
                </span>
              )}
            </div>
          ))}
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
    </div>
  )
}

export default AITranslateButton
