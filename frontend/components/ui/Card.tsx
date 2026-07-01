import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'interactive' | 'premium'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-surface rounded-xl shadow-card border-[0.5px] border-border',
      flat: 'bg-surface rounded-xl border-[0.5px] border-border',
      interactive: 'bg-surface rounded-xl shadow-card border-[0.5px] border-border cursor-pointer',
      premium: 'bg-surface-2 rounded-xl shadow-card border-[1.5px] border-twilight text-ink relative overflow-hidden',
    }

    if (variant === 'interactive') {
      return (
        <motion.div
          ref={ref as React.Ref<HTMLDivElement>}
          className={cn(variants[variant], className)}
          whileHover={{ y: -4, scale: 1.01, boxShadow: "0 12px 30px rgba(0,0,0,0.15)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          {...(props as any)}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
