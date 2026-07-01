import React from 'react'
import { cn } from '@/lib/utils'

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  variant?: 'default' | 'filter' | 'suggestion'
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, selected, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: cn(
        'px-3 py-1.5 rounded-chip text-sm transition-colors',
        selected 
          ? 'bg-primary-subtle border-2 border-primary text-primary font-medium' 
          : 'bg-bg-muted text-text-secondary border border-transparent hover:bg-border'
      ),
      filter: cn(
        'px-4 py-2 rounded-chip text-sm transition-colors',
        selected
          ? 'bg-text-primary text-white font-medium'
          : 'bg-bg-surface border border-border text-text-secondary hover:border-border-strong'
      ),
      suggestion: cn(
        'px-3 py-1.5 rounded-chip text-sm border bg-bg-surface text-primary border-primary/20 hover:bg-primary-subtle transition-colors'
      )
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn("inline-flex items-center justify-center whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", variants[variant], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Chip.displayName = 'Chip'
