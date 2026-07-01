import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "size"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'premium'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ElementType
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon: Icon, isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sage disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden'
    
    const variants = {
      primary: 'bg-twilight text-ink hover:brightness-110 shadow-glow',
      secondary: 'bg-sage text-ink hover:brightness-110 shadow-card',
      outline: 'bg-transparent border-[0.5px] border-border text-text-primary hover:bg-surface-2',
      ghost: 'bg-transparent text-ink-2 hover:text-text-primary hover:bg-surface-2',
      danger: 'bg-danger text-white hover:bg-red-700',
      premium: 'bg-gold text-bg-base hover:brightness-110 font-bold',
    }

    const sizes = {
      sm: 'h-9 px-4 rounded-xl text-sm',
      md: 'h-12 px-6 rounded-xl text-base',
      lg: 'h-14 px-8 rounded-xl text-lg py-4',
    }

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children as React.ReactNode}
        {!isLoading && Icon && <Icon className="ml-2 w-5 h-5" />}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
