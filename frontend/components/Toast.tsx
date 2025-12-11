'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function Toast({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 3000
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const config = {
    success: {
      icon: CheckCircle2,
      bg: 'bg-emerald-500/95',
      border: 'border-emerald-400/50',
      iconColor: 'text-white'
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-500/95',
      border: 'border-red-400/50',
      iconColor: 'text-white'
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-500/95',
      border: 'border-amber-400/50',
      iconColor: 'text-white'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-500/95',
      border: 'border-blue-400/50',
      iconColor: 'text-white'
    }
  }

  const { icon: Icon, bg, border, iconColor } = config[type]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 100, x: '-50%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 md:bottom-8 left-1/2 z-[100]"
        >
          <div
            className={`${bg} backdrop-blur-md rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 text-white border ${border} min-w-[280px] max-w-[90vw] md:max-w-md`}
          >
            <div className="flex-shrink-0">
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <p className="flex-1 text-sm font-medium leading-tight">{message}</p>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

