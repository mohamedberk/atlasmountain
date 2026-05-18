'use client'

import React from 'react'
import { useModal } from '@payloadcms/ui'
import { Drawer } from '@payloadcms/ui'
import { BulkImageUploader } from './index'

const drawerSlug = 'bulk-image-uploader-drawer'

export const BulkImageButton: React.FC = () => {
  const { toggleModal } = useModal()

  return (
    <>
      <button
        onClick={() => toggleModal(drawerSlug)}
        style={{
          backgroundColor: '#D7502B',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        Images en masse
      </button>
      <Drawer slug={drawerSlug} title="Gestion des images produits">
        <BulkImageUploader />
      </Drawer>
    </>
  )
}
