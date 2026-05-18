'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import { PhoneInput as ReactPhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import type { TextFieldClientComponent } from 'payload'

export const PhoneFieldInput: TextFieldClientComponent = ({ path, field }) => {
  const { value, setValue } = useField<string>({ path })

  return (
    <div className="field-type text phone-admin-field">
      <label className="field-label">
        {typeof field.label === 'string' ? field.label : 'Phone'}
        {field.required && <span className="required">*</span>}
      </label>

      {field.admin?.description && typeof field.admin.description === 'string' && (
        <div className="field-description" style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--theme-elevation-500)' }}>
          {field.admin.description}
        </div>
      )}

      <ReactPhoneInput
        defaultCountry="ma"
        value={value || ''}
        onChange={(val) => setValue(val)}
        inputStyle={{
          width: '100%',
          height: '40px',
          fontSize: '14px',
          borderRadius: '0 4px 4px 0',
          border: '1px solid var(--theme-elevation-150)',
          borderLeft: 'none',
          paddingLeft: '12px',
          outline: 'none',
          backgroundColor: 'var(--theme-input-bg)',
          color: 'var(--theme-elevation-1000)',
        }}
        countrySelectorStyleProps={{
          buttonStyle: {
            height: '40px',
            borderRadius: '4px 0 0 4px',
            border: '1px solid var(--theme-elevation-150)',
            borderRight: 'none',
            paddingLeft: '10px',
            paddingRight: '6px',
            minWidth: '70px',
            backgroundColor: 'var(--theme-input-bg)',
          },
          dropdownStyleProps: {
            style: {
              maxHeight: '300px',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              backgroundColor: 'var(--theme-elevation-0)',
              color: 'var(--theme-elevation-1000)',
              zIndex: 10,
            },
          },
        }}
      />
    </div>
  )
}

export default PhoneFieldInput
