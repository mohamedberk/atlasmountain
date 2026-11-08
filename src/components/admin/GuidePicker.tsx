'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'
import { Search, ChevronDown, ShieldCheck, X } from 'lucide-react'
import type { RelationshipFieldClientComponent } from 'payload'

interface GuideOption {
  id: string
  name: string
  tagline?: string | null
  avatarUrl?: string | null
  isOfficiallyLicensed?: boolean | null
  languages: string[]
}

function getThumbnailUrl(avatar: unknown): string | null {
  if (!avatar || typeof avatar !== 'object') return null
  const media = avatar as { url?: string; externalUrl?: string; sizes?: { thumbnail?: { url?: string } } }
  return media.sizes?.thumbnail?.url || media.externalUrl || media.url || null
}

export const GuidePickerField: RelationshipFieldClientComponent = ({ path, field }) => {
  const { value, setValue } = useField<string>({ path })
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [guides, setGuides] = useState<GuideOption[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const loadGuides = useCallback(async () => {
    if (loaded) return
    setLoading(true)
    try {
      const res = await fetch('/api/guides?limit=100&depth=1')
      const data = await res.json()
      const mapped: GuideOption[] = (data.docs || []).map((g: Record<string, unknown>) => ({
        id: String(g.id),
        name: g.name as string,
        tagline: g.tagline as string | null,
        avatarUrl: getThumbnailUrl(g.avatar),
        isOfficiallyLicensed: g.isOfficiallyLicensed as boolean | null,
        languages: ((g.languagesSpoken as { language: string }[]) || []).map((l) => l.language),
      }))
      setGuides(mapped)
      setLoaded(true)
    } finally {
      setLoading(false)
    }
  }, [loaded])

  useEffect(() => {
    if (isOpen) loadGuides()
  }, [isOpen, loadGuides])

  const selected = guides.find((g) => g.id === value)
  const filtered = guides.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="field-type relationship">
      <label className="field-label">
        {typeof field.label === 'string' ? field.label : 'Guide'}
      </label>
      {field.admin?.description && (
        <div
          className="field-description"
          style={{ marginBottom: 8, fontSize: 12, color: 'var(--theme-elevation-400)' }}
        >
          {typeof field.admin.description === 'string' ? field.admin.description : null}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <div
          onClick={() => setIsOpen((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            cursor: 'pointer',
            backgroundColor: 'var(--theme-elevation-50)',
            minHeight: 56,
          }}
        >
          {selected ? (
            <>
              {selected.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.avatarUrl}
                  alt={selected.name}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--theme-elevation-150)', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {selected.name}
                  {selected.isOfficiallyLicensed && <ShieldCheck size={14} color="var(--theme-success-500)" />}
                </div>
                {selected.tagline && (
                  <div style={{ fontSize: 12, color: 'var(--theme-elevation-500)' }}>{selected.tagline}</div>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setValue(null)
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--theme-elevation-400)' }}
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <span style={{ color: 'var(--theme-elevation-400)' }}>Click to select a guide...</span>
          )}
          <ChevronDown
            size={16}
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          />
        </div>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              backgroundColor: 'var(--theme-elevation-0)',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: 4,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              maxHeight: 420,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: 8, borderBottom: '1px solid var(--theme-elevation-100)' }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--theme-elevation-400)' }}
                />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search guides..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 8px 8px 36px',
                    border: '1px solid var(--theme-elevation-150)',
                    borderRadius: 4,
                    fontSize: 14,
                    backgroundColor: 'var(--theme-elevation-50)',
                  }}
                />
              </div>
            </div>

            <div style={{ padding: 8, overflowY: 'auto', maxHeight: 340 }}>
              {loading && (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--theme-elevation-400)' }}>Loading guides...</div>
              )}

              {!loading && value && (
                <button
                  type="button"
                  onClick={() => {
                    setValue(null)
                    setIsOpen(false)
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    marginBottom: 4,
                    border: 'none',
                    borderRadius: 6,
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--theme-error-500)',
                    fontSize: 13,
                  }}
                >
                  ✕ Remove guide
                </button>
              )}

              {!loading &&
                filtered.map((g) => {
                  const isSelected = g.id === value
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setValue(g.id)
                        setIsOpen(false)
                        setSearch('')
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: 10,
                        borderRadius: 6,
                        cursor: 'pointer',
                        textAlign: 'left',
                        border: isSelected ? '2px solid var(--theme-success-500)' : '1px solid transparent',
                        backgroundColor: isSelected ? 'var(--theme-success-50)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100)'
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      {g.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={g.avatarUrl}
                          alt={g.name}
                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--theme-elevation-150)', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {g.name}
                          {g.isOfficiallyLicensed && <ShieldCheck size={13} color="var(--theme-success-500)" />}
                        </div>
                        {g.tagline && (
                          <div style={{ fontSize: 12, color: 'var(--theme-elevation-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {g.tagline}
                          </div>
                        )}
                        {g.languages.length > 0 && (
                          <div style={{ fontSize: 11, color: 'var(--theme-elevation-400)', marginTop: 2 }}>{g.languages.join(', ')}</div>
                        )}
                      </div>
                    </button>
                  )
                })}

              {!loading && filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--theme-elevation-400)' }}>
                  No guides found{search ? ` for "${search}"` : ''}.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}

export default GuidePickerField
