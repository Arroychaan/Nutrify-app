'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, BookOpen, CalendarHeart, User, Camera } from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { name: 'Beranda', href: '/dashboard', icon: Home },
  { name: 'Jurnal', href: '/dashboard/food-log', icon: BookOpen },
  { name: 'Snap', href: '/snap', icon: Camera, isAction: true },
  { name: 'Rencana', href: '/meal-plan', icon: CalendarHeart },
  { name: 'Profil', href: '/dashboard/settings', icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-bg-base/70 backdrop-blur-xl border-t border-border" />
      
      <nav className="relative flex justify-around items-center h-20 px-4 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon

          if (item.isAction) {
            return (
              <div key={item.name} className="relative -top-5">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="bg-twilight text-white p-4 rounded-full shadow-glow flex items-center justify-center cursor-pointer"
                >
                  <Link href={item.href}>
                    <Icon className="w-6 h-6" />
                  </Link>
                </motion.div>
              </div>
            )
          }

          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex flex-col items-center justify-center w-16 h-full gap-1"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="relative"
              >
                <Icon 
                  className={clsx(
                    "w-6 h-6 transition-colors duration-300",
                    isActive ? "text-sage" : "text-text-muted"
                  )} 
                />
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-sage rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
              </motion.div>
              <span className={clsx(
                "text-[10px] font-medium transition-colors duration-300",
                isActive ? "text-sage" : "text-text-muted"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
