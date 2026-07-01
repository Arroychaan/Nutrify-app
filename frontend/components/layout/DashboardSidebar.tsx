'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Leaf, Home, UtensilsCrossed, Wallet, Sparkles, TrendingUp, Settings, LogOut, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const NAV_ITEMS = [
  { name: 'Beranda', href: '/dashboard', icon: Home },
  { name: 'Rencana Makan', href: '/meal-plan', icon: UtensilsCrossed },
  { name: 'Anggaran', href: '/anggaran', icon: Wallet },
  { name: 'AI Nutrisi', href: '/chat', icon: Sparkles, premium: true },
  { name: 'Kemajuan', href: '/kemajuan', icon: TrendingUp },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-surface border-r border-border h-screen sticky top-0 py-6 px-4 shrink-0">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-6 group">
        <Image 
          src="/assets/brand/Wordmark.svg" 
          alt="AI Ate Indonesia" 
          width={150} 
          height={32} 
          className="h-7 w-auto object-contain" 
          priority
        />
      </Link>

      <div className="mb-8 px-2">
        <div className="flex items-center gap-3 p-3 bg-surface rounded-2xl border border-surface-2">
          <div className="w-10 h-10 rounded-full bg-sage-muted flex-shrink-0" />
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-ink truncate">Budi Santoso</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-premium" />
              <p className="text-xs text-premium font-medium">Premium</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        <p className="px-3 text-xs font-bold text-ink-3 uppercase tracking-wider mb-3">Menu</p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-3 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-sage/10 text-sage" 
                  : "text-ink-2 hover:bg-surface-2 hover:text-ink"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-sage rounded-r-full" />
              )}
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-sage" : "text-ink-3 group-hover:text-ink-2")} />
                {item.name}
              </div>
              {item.premium && !isActive && (
                <Lock className="w-3.5 h-3.5 text-premium/70" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="pt-6 border-t border-surface-2 mt-auto space-y-1.5">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-sm font-medium text-ink-2">Tampilan</span>
          <ThemeToggle />
        </div>
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors">
          <Settings className="w-5 h-5 text-ink-3" />
          Pengaturan
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-danger hover:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5 text-danger/70" />
          Keluar
        </button>
      </div>
    </aside>
  )
}
