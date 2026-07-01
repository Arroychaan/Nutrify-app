import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full h-12 bg-bg-surface border rounded-input text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
              icon ? "pl-11 pr-4" : "px-4",
              error ? "border-danger focus:border-danger" : "border-border focus:border-primary",
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-sm text-danger">{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
