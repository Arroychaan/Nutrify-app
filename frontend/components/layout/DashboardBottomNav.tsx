'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, UtensilsCrossed, Calendar, Search, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const BOTTOM_NAV_ITEMS = [
  { name: 'Beranda', href: '/dashboard', icon: Home },
  { name: 'Menu', href: '/meal-plan', icon: UtensilsCrossed },
  { name: 'Asisten', href: '/chat', icon: MessageCircle },
  { name: 'Jurnal', href: '/dashboard/food-log', icon: Calendar },
]

export function DashboardBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-border pb-safe z-50">
      <div className="flex items-center justify-around h-16">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full gap-1"
            >
              <div className={cn(
                "p-1.5 rounded-full transition-colors",
                isActive ? "bg-primary-subtle" : "bg-transparent"
              )}>
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-primary" : "text-text-muted"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive ? "text-primary font-bold" : "text-text-secondary"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
