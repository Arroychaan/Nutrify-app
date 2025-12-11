'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { authApi } from '@/lib/api'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Utensils,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  ClipboardList,
  CalendarDays,
  Settings
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      document.documentElement.style.colorScheme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
    }

    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}')
    settings.theme = newDarkMode ? 'dark' : 'light'
    localStorage.setItem('appSettings', JSON.stringify(settings))
  }

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}')
    const theme = settings.theme || 'light'
    const isDark = theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDarkMode(isDark)

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await authApi.me()
      setUser(response.data || response)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authApi.logout()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-emerald-500/20 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Log Makan', href: '/dashboard/food-log', icon: ClipboardList },
    { name: 'Rencana Makan', href: '/dashboard/meal-plan', icon: CalendarDays },
    { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700/50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-50 flex-col transition-all duration-300">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-3 mb-8 group">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 transition-transform group-hover:scale-110 overflow-hidden">
              <img src="/icon.svg" alt="Nutrify" className="w-full h-full" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Nutrify</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Partner Kesehatanmu</p>
            </div>
          </Link>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg shadow-sm">
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-600 dark:hover:text-emerald-400'
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-emerald-500 transition-colors'}`} />
                  {item.name}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white/80" />}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100 dark:border-gray-700/50 space-y-2">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center px-2 py-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative ${isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
              >
                <item.icon
                  className={`w-6 h-6 transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive ? "currentColor" : "none"}
                  fillOpacity={isActive ? 0.1 : 0}
                />
                <span className={`text-[10px] font-medium transition-all duration-300 ${isActive ? 'font-bold' : ''}`}>
                  {item.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveIndicator"
                    className="absolute bottom-1 w-1 h-1 bg-emerald-500 rounded-full"
                  />
                )}
              </Link>
            )
          })}
          {/* Mobile Logout (Optional - maybe in Profile? For now keeping it simple) */}
        </div>
      </nav>

      {/* MAIN CONTENT WRAPPER */}
      <main className="md:pl-72 min-h-screen transition-all duration-300">
        <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* FLOATING CHAT AI BUTTON */}
      <Link
        href="/dashboard/chat"
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 group"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          {/* Main Button */}
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300">
            <MessageSquare className="w-6 h-6 text-white" strokeWidth={2} />
          </div>

          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Chat AI 🤖
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full border-8 border-transparent border-l-gray-900" />
          </div>

          {/* Pulse Animation */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
        </motion.div>
      </Link>
    </div>
  )
}
