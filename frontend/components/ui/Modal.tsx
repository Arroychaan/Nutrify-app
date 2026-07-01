import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
  hideCloseButton?: boolean
}

export function Modal({ open, onOpenChange, trigger, title, description, children, className, hideCloseButton }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg-dark/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-card-lg bg-bg-surface p-6 shadow-popover outline-none animate-scale-in",
          className
        )}>
          {(title || description) && (
            <div className="mb-4">
              {title && <Dialog.Title className="text-xl font-display font-semibold text-text-primary">{title}</Dialog.Title>}
              {description && <Dialog.Description className="mt-1.5 text-sm text-text-secondary">{description}</Dialog.Description>}
            </div>
          )}
          {children}
          {!hideCloseButton && (
            <Dialog.Close className="absolute right-4 top-4 rounded-full p-1 text-text-muted hover:bg-bg-muted hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors">
              <X className="h-5 w-5" />
              <span className="sr-only">Tutup</span>
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
