'use client'
// Force redeploy - Auth Layout Fixes

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { authApi } from '@/lib/api'
import { useTranslation } from '@/lib/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
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
  ChevronLeft,
  ClipboardList,
  CalendarDays,
  Settings,
  Menu,
  X,
  Scale,
  ShieldCheck
} from 'lucide-react'
import { NotificationBell } from '@/components/layout/NotificationBell'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { t } = useTranslation()

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

    // Load sidebar state
    const savedSidebarState = localStorage.getItem('sidebarCollapsed')
    if (savedSidebarState) {
      setIsSidebarCollapsed(JSON.parse(savedSidebarState))
    }

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed
    setIsSidebarCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
  }

  useEffect(() => {
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

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
          <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }


  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard, mobileName: 'Home' },
    { name: t('nav.foodLog'), href: '/dashboard/food-log', icon: ClipboardList, mobileName: 'Jurnal' },
    { name: t('nav.mealPlan'), href: '/meal-plan', icon: CalendarDays, mobileName: 'Meal Plan' },
    { name: t('nav.chat'), href: '/chat', icon: MessageSquare, mobileName: 'Chat AI' },
    { name: t('nav.settings'), href: '/dashboard/settings', icon: Settings, mobileName: 'Akun' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center">
            <Image
              src="/illustrations/nutrify-logo-icon.svg"
              alt="Nutrify"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white font-display">Nutrify</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -mr-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR (Desktop Fixed + Mobile Drawer) */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white/95 dark:bg-gray-900/95 md:bg-white/90 md:dark:bg-gray-800/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-2xl md:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] flex flex-col transition-all duration-300 transform 
        ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
        ${isSidebarCollapsed ? 'md:w-20' : 'md:w-72'}
      `}>
        {/* Collapse Toggle Button (Desktop Only) */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3 top-9 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 text-gray-500 hover:text-emerald-500 shadow-sm hover:shadow-md transition-all"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`p-6 relative flex flex-col h-full ${isSidebarCollapsed ? 'px-2 items-center' : ''}`}>
          {/* Close Button Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className={`flex items-center gap-3 mb-8 group ${isSidebarCollapsed ? 'justify-center mb-12' : ''}`}>
            <div className={`relative flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 ${isSidebarCollapsed ? 'w-10 h-10' : 'w-10 h-10'}`}>
              <Image
                src="/illustrations/nutrify-logo-icon.svg"
                alt="Nutrify Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>

            {!isSidebarCollapsed && (
              <div className="overflow-hidden whitespace-nowrap ml-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight font-display">Nutrify</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('dashboard.slogan')}</p>
              </div>
            )}
          </Link>



          <nav className="space-y-1 flex-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isSidebarCollapsed ? item.name : ''}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                    ? 'bg-primary text-gray-900 dark:text-gray-900 shadow-md shadow-primary/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-gray-900 dark:text-gray-900' : 'text-gray-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-200'}`} />
                  {!isSidebarCollapsed && (
                    <span className="whitespace-nowrap">{item.name}</span>
                  )}
                  {isActive && !isSidebarCollapsed && <ChevronRight className="w-4 h-4 ml-auto text-gray-900/80 dark:text-gray-900/80" />}
                </Link>
              )
            })}
          </nav>

          <div className={`mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
            {/* User Profile Snippet (Moved) */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-base border border-primary/10 shrink-0">
                {user?.fullName?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {isDarkMode ? t('settings.themeLight') : t('settings.themeDark')}
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-primary-action dark:text-gray-400 dark:hover:text-primary-action hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              {t('nav.logout')}
            </button>
          </div>

          {/* Collapsed Bottom Actions */}
          {isSidebarCollapsed && (
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2 flex flex-col items-center">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-base border border-primary/10 shrink-0 mb-2">
                {user?.fullName?.charAt(0)?.toUpperCase()}
              </div>
              <button onClick={toggleDarkMode} className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={handleLogout} className="p-3 text-gray-500 hover:text-primary-action dark:text-gray-400 dark:hover:text-primary-action hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-40 pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ${isMobileMenuOpen ? 'translate-y-full' : 'translate-y-0'}`}>
        <div className="flex justify-around items-end px-2 py-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 relative group overflow-hidden`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-x-2 top-0 bottom-2 bg-primary/10 dark:bg-primary/20 rounded-xl -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <div className={`relative p-1 rounded-lg transition-transform duration-300 ${isActive ? '-translate-y-0.5' : ''}`}>
                  <item.icon
                    className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-primary dark:text-primary-400' : 'text-gray-400 group-hover:text-primary'}`}
                    strokeWidth={isActive ? 2.5 : 2}
                    fill={isActive ? "currentColor" : "none"}
                    fillOpacity={isActive ? 0.2 : 0}
                  />
                </div>

                <span className={`text-[10px] leading-none text-center font-medium transition-colors duration-300 ${isActive ? 'text-primary-700 dark:text-primary-300 font-bold' : 'text-gray-400 group-hover:text-primary'}`}>
                  {item.mobileName || item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* MAIN CONTENT WRAPPER */}
      <main className={`min-h-screen transition-all duration-300 pt-16 md:pt-0 ${isMobileMenuOpen ? 'blur-sm md:blur-none' : ''} 
        ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-72'}
      `}>
        {/* DESKTOP HEADER */}
        <div className="hidden md:flex justify-end items-center px-8 py-4">
          <NotificationBell />
        </div>

        <div className="p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

    </div>
  )
}
