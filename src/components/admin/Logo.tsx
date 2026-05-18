'use client'

import Image from 'next/image'

export const Logo = () => {
  return (
    <div className="admin-logo">
      <Image
        src="/green-atlas-icon.png"
        alt="Green Atlas Travel"
        width={150}
        height={150}
        priority
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}

export default Logo
