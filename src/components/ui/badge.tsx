import type { ReactNode } from 'react'

const ACCENT_GREEN = '#ff2828'

type BadgeVariant = 'solid' | 'soft' | 'outline'

interface BadgeProps {
  children: ReactNode
  icon?: ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, icon, variant = 'soft', className = '' }: BadgeProps) {
  const variantClasses: Record<BadgeVariant, string> = {
    solid: 'text-white',
    soft: '',
    outline: 'bg-white border',
  }

  const style =
    variant === 'solid'
      ? { backgroundColor: ACCENT_GREEN }
      : variant === 'soft'
        ? { backgroundColor: `${ACCENT_GREEN}15`, color: ACCENT_GREEN }
        : { borderColor: ACCENT_GREEN, color: ACCENT_GREEN }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {icon}
      {children}
    </span>
  )
}
