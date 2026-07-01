import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger'
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary-subtle text-primary border border-primary/20',
      secondary: 'bg-bg-muted text-text-secondary border border-border',
      accent: 'bg-accent-subtle text-accent border border-accent/20',
      danger: 'bg-red-100 text-danger border border-red-200',
    }

    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center px-3 py-1 rounded-chip text-xs font-semibold whitespace-nowrap", variants[variant], className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
