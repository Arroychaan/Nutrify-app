'use client'

import React from 'react'
import Link from 'next/link'
import { Plus, Camera, Search, Coffee } from 'lucide-react'

const ACTIONS = [
  { name: 'Scan Foto', icon: Camera, color: 'bg-primary-subtle text-primary border-primary/20', href: '/dashboard/scan' },
  { name: 'Cari Makanan', icon: Search, color: 'bg-accent-subtle text-accent border-accent/20', href: '/search' },
  { name: 'Input Manual', icon: Plus, color: 'bg-[#DBEAFE] text-[#3B82F6] border-[#3B82F6]/20', href: '/dashboard/food-log/add' },
  { name: 'Air & Kopi', icon: Coffee, color: 'bg-[#F3E8FF] text-[#A855F7] border-[#A855F7]/20', href: '/dashboard/hydration' },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {ACTIONS.map((action) => (
        <Link 
          key={action.name} 
          href={action.href}
          className="flex flex-col items-center justify-center p-4 rounded-card bg-bg-surface border border-border hover:shadow-card-hover hover:-translate-y-1 transition-all group"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 border ${action.color} group-hover:scale-110 transition-transform`}>
            <action.icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-text-primary text-center">{action.name}</span>
        </Link>
      ))}
    </div>
  )
}
