import { clsx } from 'clsx'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center font-medium transition-colors rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-primary)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            // Variants
            'bg-[var(--color-accent-blue)] text-white hover:bg-[var(--color-accent-blue)]/90 focus:ring-[var(--color-accent-blue)]':
              variant === 'primary',
            'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] focus:ring-[var(--color-border)]':
              variant === 'secondary',
            'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] focus:ring-[var(--color-border)]':
              variant === 'ghost',
            'bg-[var(--color-accent-red)] text-white hover:bg-[var(--color-accent-red)]/90 focus:ring-[var(--color-accent-red)]':
              variant === 'danger',
            // Sizes
            'px-2.5 py-1.5 text-xs gap-1.5': size === 'sm',
            'px-4 py-2 text-sm gap-2': size === 'md',
            'px-6 py-3 text-base gap-2': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
