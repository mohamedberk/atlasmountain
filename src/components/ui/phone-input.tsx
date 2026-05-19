'use client'

import { PhoneInput as ReactPhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function PhoneInput({ value, onChange, placeholder }: PhoneInputProps) {
  return (
    <div className="phone-input-wrapper">
      <ReactPhoneInput
        defaultCountry="ma"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputStyle={{
          width: '100%',
          height: '48px',
          fontSize: '16px',
          borderRadius: '0 12px 12px 0',
          border: '1px solid #d4d4d4',
          borderLeft: 'none',
          paddingLeft: '12px',
          outline: 'none',
        }}
        countrySelectorStyleProps={{
          buttonStyle: {
            height: '48px',
            borderRadius: '12px 0 0 12px',
            border: '1px solid #d4d4d4',
            borderRight: 'none',
            paddingLeft: '12px',
            paddingRight: '8px',
            minWidth: '80px',
          },
        }}
      />
      <style jsx global>{`
        .phone-input-wrapper .react-international-phone-input-container {
          width: 100%;
          display: flex;
          align-items: center;
        }
        .phone-input-wrapper .react-international-phone-input {
          width: 100% !important;
          transition: all 0.2s;
        }
        .phone-input-wrapper .react-international-phone-input:focus {
          border-color: #ff2828 !important;
          box-shadow: 0 0 0 2px rgba(255, 40, 40, 0.2) !important;
        }
        .phone-input-wrapper .react-international-phone-country-selector-button {
          transition: all 0.2s;
        }
        .phone-input-wrapper .react-international-phone-country-selector-button:focus,
        .phone-input-wrapper .react-international-phone-country-selector-button:hover {
          border-color: #ff2828 !important;
        }
        .phone-input-wrapper .react-international-phone-country-selector-dropdown {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border: 1px solid #e5e5e5;
          max-height: 300px;
        }
        .phone-input-wrapper .react-international-phone-country-selector-dropdown__list-item {
          padding: 10px 12px;
        }
        .phone-input-wrapper .react-international-phone-country-selector-dropdown__list-item:hover {
          background-color: #f5f5f5;
        }
        .phone-input-wrapper .react-international-phone-country-selector-dropdown__list-item--selected {
          background-color: rgba(73, 181, 64, 0.1);
        }
      `}</style>
    </div>
  )
}
