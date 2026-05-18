'use client'

import Image from 'next/image'

export const Icon = () => {
  return (
    <div className="admin-icon">
      <Image
        src="/green-atlas-icon.png"
        alt="Green Atlas Travel"
        width={28}
        height={28}
        priority
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}

export default Icon
