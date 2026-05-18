'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

interface ActivityItem {
  id: string
  title: string
  slug: string
  featuredImage?: { url?: string; thumbnailURL?: string; id?: string; sizes?: { thumbnail?: { url?: string } } } | string | null
  gallery?: { media: { url?: string; thumbnailURL?: string; id?: string; sizes?: { thumbnail?: { url?: string } } } | string; id?: string }[] | null
  category?: { title?: string } | string | null
}

const getImageUrl = (img: any): string | null => {
  if (!img) return null
  if (typeof img === 'string') return null
  return img.sizes?.thumbnail?.url || img.thumbnailURL || img.url || null
}

export const BulkImageUploader: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/activities?limit=500&depth=1&sort=title')
      const data = await res.json()
      setActivities(data.docs || [])
    } catch (err) {
      console.error('Failed to fetch activities:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const filteredActivities = activities.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const uploadFiles = async (files: FileList | File[]) => {
    if (!selectedActivity || files.length === 0) return

    setUploading(true)
    setMessage(null)
    const fileArray = Array.from(files)
    const uploadedMediaIds: string[] = []

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        setUploadProgress(`Upload ${i + 1}/${fileArray.length}: ${file.name}`)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('alt', `${selectedActivity.title} - Image ${i + 1}`)

        const res = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const mediaDoc = await res.json()
        uploadedMediaIds.push(mediaDoc.doc.id)
      }

      setUploadProgress('Mise à jour de l\'activité...')

      const hasFeaturedImage = selectedActivity.featuredImage && typeof selectedActivity.featuredImage !== 'string' && selectedActivity.featuredImage.id

      const updateData: any = {}
      let startGalleryIndex = 0

      if (!hasFeaturedImage && uploadedMediaIds.length > 0) {
        updateData.featuredImage = uploadedMediaIds[0]
        startGalleryIndex = 1
      }

      if (uploadedMediaIds.length > startGalleryIndex) {
        const existingGallery = (selectedActivity.gallery || []).map((g) => ({
          media: typeof g.media === 'string' ? g.media : g.media?.id,
        }))
        const newGalleryItems = uploadedMediaIds.slice(startGalleryIndex).map((id) => ({
          media: id,
        }))
        updateData.gallery = [...existingGallery, ...newGalleryItems]
      }

      if (Object.keys(updateData).length > 0) {
        const updateRes = await fetch(`/api/activities/${selectedActivity.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        })

        if (!updateRes.ok) {
          throw new Error('Failed to update activity')
        }

        const updatedActivity = await updateRes.json()

        setActivities((prev) =>
          prev.map((a) => (a.id === selectedActivity.id ? updatedActivity.doc : a))
        )
        setSelectedActivity(updatedActivity.doc)
      }

      setMessage({ type: 'success', text: `${fileArray.length} image(s) uploadée(s) avec succès!` })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erreur lors de l\'upload' })
    } finally {
      setUploading(false)
      setUploadProgress('')
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files) {
        uploadFiles(e.dataTransfer.files)
      }
    },
    [selectedActivity]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(e.target.files)
      e.target.value = ''
    }
  }

  const removeGalleryImage = async (galleryItemId: string) => {
    if (!selectedActivity) return

    const updatedGallery = (selectedActivity.gallery || [])
      .filter((g) => g.id !== galleryItemId)
      .map((g) => ({
        media: typeof g.media === 'string' ? g.media : g.media?.id,
        id: g.id,
      }))

    try {
      const res = await fetch(`/api/activities/${selectedActivity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gallery: updatedGallery }),
      })

      if (res.ok) {
        const updated = await res.json()
        setActivities((prev) => prev.map((a) => (a.id === selectedActivity.id ? updated.doc : a)))
        setSelectedActivity(updated.doc)
      }
    } catch (err) {
      console.error('Failed to remove image:', err)
    }
  }

  const setAsFeaturedImage = async (mediaId: string) => {
    if (!selectedActivity) return

    try {
      const res = await fetch(`/api/activities/${selectedActivity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featuredImage: mediaId }),
      })

      if (res.ok) {
        const updated = await res.json()
        setActivities((prev) => prev.map((a) => (a.id === selectedActivity.id ? updated.doc : a)))
        setSelectedActivity(updated.doc)
        setMessage({ type: 'success', text: 'Image principale mise à jour!' })
      }
    } catch (err) {
      console.error('Failed to set featured image:', err)
    }
  }

  const navigateActivity = (direction: 'next' | 'prev') => {
    const currentIndex = filteredActivities.findIndex((a) => a.id === selectedActivity?.id)
    if (currentIndex === -1) return

    const newIndex = direction === 'next'
      ? Math.min(currentIndex + 1, filteredActivities.length - 1)
      : Math.max(currentIndex - 1, 0)

    setSelectedActivity(filteredActivities[newIndex])
    setMessage(null)
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '0', fontFamily: 'var(--font-body)' }}>
      {/* LEFT SIDE - Activity List */}
      <div
        style={{
          width: '350px',
          minWidth: '350px',
          borderRight: '1px solid var(--theme-elevation-150)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--theme-elevation-0)',
        }}
      >
        <div style={{ padding: '12px', borderBottom: '1px solid var(--theme-elevation-150)' }}>
          <input
            type="text"
            placeholder="Rechercher une activité..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              fontSize: '14px',
              background: 'var(--theme-elevation-50)',
              color: 'var(--theme-text)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--theme-elevation-400)' }}>
            {filteredActivities.length} activité(s) {searchQuery && `pour "${searchQuery}"`}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--theme-elevation-400)' }}>
              Chargement...
            </div>
          ) : (
            filteredActivities.map((activity) => {
              const isSelected = selectedActivity?.id === activity.id
              const hasFeatured = activity.featuredImage && typeof activity.featuredImage !== 'string'
              const galleryCount = activity.gallery?.length || 0
              const thumbUrl = getImageUrl(activity.featuredImage)

              return (
                <div
                  key={activity.id}
                  onClick={() => {
                    setSelectedActivity(activity)
                    setMessage(null)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--theme-elevation-100)',
                    background: isSelected ? 'var(--theme-elevation-100)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--theme-elevation-50)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'var(--theme-elevation-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={activity.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--theme-elevation-300)" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--theme-text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {activity.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--theme-elevation-400)', marginTop: '2px' }}>
                      {typeof activity.category === 'object' && activity.category?.title
                        ? activity.category.title
                        : ''}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: hasFeatured ? 'var(--theme-success-500)' : 'var(--theme-error-500)',
                      }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--theme-elevation-400)' }}>
                      {galleryCount}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* RIGHT SIDE - Upload Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--theme-elevation-0)' }}>
        {selectedActivity ? (
          <>
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--theme-elevation-150)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--theme-text)' }}>
                  {selectedActivity.title}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--theme-elevation-400)' }}>
                  {typeof selectedActivity.category === 'object' && selectedActivity.category?.title
                    ? selectedActivity.category.title
                    : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => navigateActivity('prev')}
                  disabled={filteredActivities.findIndex((a) => a.id === selectedActivity.id) === 0}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid var(--theme-elevation-150)',
                    borderRadius: '4px',
                    background: 'var(--theme-elevation-50)',
                    color: 'var(--theme-text)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    opacity: filteredActivities.findIndex((a) => a.id === selectedActivity.id) === 0 ? 0.4 : 1,
                  }}
                  type="button"
                >
                  Précédent
                </button>
                <button
                  onClick={() => navigateActivity('next')}
                  disabled={filteredActivities.findIndex((a) => a.id === selectedActivity.id) === filteredActivities.length - 1}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid var(--theme-elevation-150)',
                    borderRadius: '4px',
                    background: 'var(--theme-elevation-50)',
                    color: 'var(--theme-text)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    opacity: filteredActivities.findIndex((a) => a.id === selectedActivity.id) === filteredActivities.length - 1 ? 0.4 : 1,
                  }}
                  type="button"
                >
                  Suivant
                </button>
              </div>
            </div>

            {message && (
              <div
                style={{
                  margin: '12px 20px 0',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  background: message.type === 'success' ? 'var(--theme-success-100)' : 'var(--theme-error-100)',
                  color: message.type === 'success' ? 'var(--theme-success-500)' : 'var(--theme-error-500)',
                }}
              >
                {message.text}
              </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--theme-text)', fontWeight: 600 }}>
                  Image principale
                </h4>
                {selectedActivity.featuredImage && typeof selectedActivity.featuredImage !== 'string' ? (
                  <div
                    style={{
                      width: '200px',
                      height: '200px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '2px solid var(--theme-success-500)',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={selectedActivity.featuredImage.url || selectedActivity.featuredImage.sizes?.thumbnail?.url || ''}
                      alt={selectedActivity.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        background: 'var(--theme-success-500)',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontWeight: 600,
                      }}
                    >
                      PRINCIPALE
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      width: '200px',
                      height: '200px',
                      borderRadius: '8px',
                      border: '2px dashed var(--theme-elevation-200)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--theme-elevation-300)',
                      fontSize: '13px',
                    }}
                  >
                    Aucune image
                  </div>
                )}
              </div>

              {selectedActivity.gallery && selectedActivity.gallery.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--theme-text)', fontWeight: 600 }}>
                    Galerie ({selectedActivity.gallery.length} images)
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {selectedActivity.gallery.map((item) => {
                      const imgUrl = getImageUrl(item.media)
                      const mediaId = typeof item.media === 'string' ? item.media : item.media?.id
                      return (
                        <div
                          key={item.id}
                          style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            border: '1px solid var(--theme-elevation-150)',
                            position: 'relative',
                          }}
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--theme-elevation-50)',
                                color: 'var(--theme-elevation-300)',
                                fontSize: '12px',
                              }}
                            >
                              No preview
                            </div>
                          )}
                          <div
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              display: 'flex',
                              gap: '3px',
                            }}
                          >
                            {mediaId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setAsFeaturedImage(mediaId)
                                }}
                                title="Définir comme image principale"
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: 'rgba(0,0,0,0.6)',
                                  color: 'white',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                }}
                                type="button"
                              >
                                *
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (item.id) removeGalleryImage(item.id)
                              }}
                              title="Retirer de la galerie"
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                border: 'none',
                                background: 'rgba(220,38,38,0.8)',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: 'bold',
                              }}
                              type="button"
                            >
                              x
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--theme-text)', fontWeight: 600 }}>
                  Ajouter des images
                </h4>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragOver ? '#D7502B' : 'var(--theme-elevation-200)'}`,
                    borderRadius: '8px',
                    padding: '40px 20px',
                    textAlign: 'center',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    background: dragOver ? 'rgba(215, 80, 43, 0.05)' : 'var(--theme-elevation-50)',
                    transition: 'all 0.2s',
                  }}
                >
                  {uploading ? (
                    <div>
                      <div style={{ fontSize: '14px', color: 'var(--theme-text)', marginBottom: '8px' }}>
                        Upload en cours...
                      </div>
                      <div style={{ fontSize: '13px', color: '#D7502B', fontWeight: 500 }}>
                        {uploadProgress}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={dragOver ? '#D7502B' : 'var(--theme-elevation-300)'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ marginBottom: '12px' }}
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <div style={{ fontSize: '14px', color: 'var(--theme-text)', marginBottom: '4px' }}>
                        Glissez-déposez vos images ici
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--theme-elevation-400)' }}>
                        ou cliquez pour sélectionner des fichiers
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--theme-elevation-300)', marginTop: '8px' }}>
                        La première image sera l&apos;image principale si aucune n&apos;est définie
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--theme-elevation-300)',
            }}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginBottom: '16px' }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>
              Sélectionnez une activité
            </div>
            <div style={{ fontSize: '13px', color: 'var(--theme-elevation-250)' }}>
              Choisissez une activité à gauche pour gérer ses images
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
