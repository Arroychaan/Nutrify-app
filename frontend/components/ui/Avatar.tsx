import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

export interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, size = 'md', className }, ref) => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-16 h-16 text-xl',
      xl: 'w-20 h-20 text-2xl',
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-primary-subtle border border-primary/20",
          sizes[size],
          className
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt || "Avatar"}
            fill
            className="aspect-square h-full w-full object-cover"
          />
        ) : fallback ? (
          <div className="flex h-full w-full items-center justify-center font-semibold text-primary uppercase">
            {fallback}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary">
            <User className="w-1/2 h-1/2" />
          </div>
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'
