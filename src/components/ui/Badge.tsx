import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        {
          // Variants
          'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]':
            variant === 'default',
          'bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]':
            variant === 'primary',
          'bg-[var(--color-accent-green)]/10 text-[var(--color-accent-green)]':
            variant === 'success',
          'bg-[var(--color-accent-orange)]/10 text-[var(--color-accent-orange)]':
            variant === 'warning',
          'bg-[var(--color-accent-red)]/10 text-[var(--color-accent-red)]':
            variant === 'danger',
          'bg-[var(--color-accent-cyan)]/10 text-[var(--color-accent-cyan)]':
            variant === 'info',
          // Sizes
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-1 text-sm': size === 'md',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
