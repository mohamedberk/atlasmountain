import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import { getOptimizedImageUrl } from '@/lib/image-utils'
import type { Guide } from '@/payload-types'

interface GuidedByBadgeProps {
  guide: Guide
}

export function GuidedByBadge({ guide }: GuidedByBadgeProps) {
  const tDetail = useTranslations('activityDetail')

  return (
    <NavLink
      href={`/guides/${guide.slug}`}
      className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors"
    >
      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        <Image src={getOptimizedImageUrl(guide.avatar, 'thumbnail')} alt={guide.name} fill sizes="40px" className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-neutral-500">{tDetail('guidedBy')}</div>
        <div className="text-sm font-semibold text-neutral-900 truncate">{guide.name} →</div>
      </div>
    </NavLink>
  )
}
