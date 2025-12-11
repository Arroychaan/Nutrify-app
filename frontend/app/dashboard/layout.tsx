'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { authApi } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    
    // Update DOM
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      document.documentElement.style.colorScheme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
    }
    
    // Save to localStorage
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}')
    settings.theme = newDarkMode ? 'dark' : 'light'
    localStorage.setItem('appSettings', JSON.stringify(settings))
  }

  // Load dark mode state on mount
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}')
    const theme = settings.theme || 'light'
    const isDark = theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDarkMode(isDark)
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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse">
              <defs>
                <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#24B47E"/>
                  <stop offset="100%" stopColor="#1a8f63"/>
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="50" fill="url(#loadingGradient)"/>
              <path d="M30 70 L30 30 L40 30 L60 55 L60 30 L70 30 L70 70 L60 70 L40 45 L40 70 Z" fill="white"/>
              <ellipse cx="72" cy="28" rx="6" ry="10" fill="#86efac" transform="rotate(45, 72, 28)"/>
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'Meal Plan', 
      href: '/dashboard/meal-plan', 
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    { 
      name: 'Chat AI', 
      href: '/dashboard/chat', 
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
    { 
      name: 'Notifikasi', 
      href: '/dashboard/notifications', 
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
    { 
      name: 'Profil', 
      href: '/dashboard/profile', 
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* MOBILE ONLY: Hamburger button (<=768px) */}
      <div className="mobile-only fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="glass dark:bg-gray-800 p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
        >
          <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar - ADAPTIVE */}
      <motion.aside
        initial={false}
        animate={{ x: 0 }}
        className={`sidebar ${
          mobileMenuOpen ? 'sidebar-mobile-open' : ''
        } fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out overflow-y-auto shadow-xl`}
      >
        <div className="h-full flex flex-col p-6">
              {/* Logo */}
              <div className="mb-6 sidebar-logo">
                <Link href="/dashboard" className="flex items-center space-x-3 group" onClick={() => setMobileMenuOpen(false)}>
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-[#24B47E] rounded-xl blur opacity-50 group-hover:opacity-75 transition"></div>
                    <div className="relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <defs>
                          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#24B47E"/>
                            <stop offset="100%" stopColor="#1a8f63"/>
                          </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="50" fill="url(#logoGradient)"/>
                        <path d="M30 70 L30 30 L40 30 L60 55 L60 30 L70 30 L70 70 L60 70 L40 45 L40 70 Z" fill="white"/>
                        <ellipse cx="72" cy="28" rx="6" ry="10" fill="#86efac" transform="rotate(45, 72, 28)"/>
                      </svg>
                    </div>
                  </div>
                  <div className="sidebar-text">
                    <h1 className="text-xl font-bold text-[#24B47E]">
                      Nutrify
                    </h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Your Health Partner</p>
                  </div>
                </Link>
              </div>

              {/* User Info */}
              <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 sidebar-user">
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-[#24B47E] rounded-full blur opacity-50"></div>
                    <div className="relative w-12 h-12 bg-[#24B47E] rounded-full flex items-center justify-center text-white font-bold shadow-lg text-lg">
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 sidebar-text">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-400 truncate">
                      {user?.email || 'user@email.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`nav-item group relative flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-semibold ${
                        isActive
                          ? 'bg-[#24B47E] text-white shadow-lg shadow-green-500/30'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeBar"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full tablet-hide"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      
                      <div className={`flex-shrink-0 w-6 h-6 nav-icon ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'} transition-colors`}>
                        {item.icon}
                      </div>
                      
                      <span className="sidebar-text flex-1">{item.name}</span>
                      
                      {!isActive && (
                        <div className="absolute inset-0 bg-[#24B47E] opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300"></div>
                      )}
                    </Link>
                  )
                })}
              </nav>

              {/* Dark Mode Toggle & Logout */}
              <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700 space-y-2">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 group font-semibold"
                  title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
                >
                  {isDarkMode ? (
                    <svg className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                  <span className="sidebar-text">{isDarkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
                  
                  {/* Toggle Switch Visual */}
                  <div className={`ml-auto w-10 h-5 rounded-full transition-colors flex-shrink-0 ${isDarkMode ? 'bg-[#24B47E]' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform mt-0.5 ${isDarkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="logout-btn w-full flex items-center space-x-3 px-4 py-3.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 group font-semibold"
                  title="Keluar"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="sidebar-text">Keluar</span>
                </button>
              </div>
            </div>
      </motion.aside>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mobile-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="main-content transition-all duration-300 min-h-screen">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  )
}
