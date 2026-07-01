import React from 'react'
import { Bell, Search } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { NotificationBell } from '@/components/layout/NotificationBell'

export function DashboardNavbar() {
  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border h-16 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex-1 max-w-xl">
        <div className="hidden lg:block w-full max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-2" />
          <input
            type="text"
            placeholder="Cari makanan atau resep..."
            className="w-full bg-surface-2 border-[0.5px] border-border rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold transition-all placeholder:text-ink-3 text-ink"
          />
        </div>
        <div className="md:hidden">
          <span className="font-display font-bold text-xl text-text-primary">Beranda</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* We can integrate NotificationBell if needed or build a simpler one */}
        <button className="relative p-2 text-ink-2 hover:bg-surface-2 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-surface"></span>
        </button>
        <Avatar src={null} fallback="AR" size="sm" />
      </div>
    </header>
  )
}
