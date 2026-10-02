'use client'

import React from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

interface NavItem {
  id: string
  label: string
  path: string
  iconSrc: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'feed', label: 'Jurnal', path: '/dashboard', iconSrc: '/assets/icons/home-icon.svg' },
  { id: 'explore', label: 'Jelajah', path: '/dashboard/explore', iconSrc: '/assets/icons/ai-icon.svg' },
  { id: 'log', label: 'Catat', path: '/dashboard/log', iconSrc: '/assets/icons/scan-icon.svg' },
  { id: 'ai', label: 'AI Tanya', path: '/dashboard/chat', iconSrc: '/assets/icons/ai-icon.svg' },
  { id: 'profile', label: 'Kamu', path: '/dashboard/profile', iconSrc: '/assets/icons/user-icon.svg' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-2 pb-safe-safe px-2 pt-1.5 shadow-[0_-4px_24px_rgba(30,24,16,0.06)]">
      {/* Torn paper edge di atas nav */}
      <div className="absolute -top-3 left-0 right-0 h-4 overflow-hidden pointer-events-none">
        <Image
          src="/assets/scrapbook/torn-paper-edge.png"
          alt=""
          width={400}
          height={16}
          className="w-full h-4 object-cover opacity-70"
        />
      </div>

      <div className="max-w-lg mx-auto flex items-center justify-between">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path))

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-fast min-w-[64px]
                ${isActive
                  ? 'text-sage scale-105'
                  : 'text-ink-3 hover:text-ink-2'
                }`}
            >
              <div className="relative w-7 h-7 flex items-center justify-center">
                <Image
                  src={item.iconSrc}
                  alt={item.label}
                  width={28}
                  height={28}
                  className={`object-contain transition-all duration-normal ${isActive ? 'opacity-100' : 'opacity-50'}`}
                />
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-sage rounded-full" />
                )}
              </div>

              <span className={`text-[10px] font-bold leading-none transition-all ${isActive ? 'text-sage' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}