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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🥗</div>
          <p className="text-gray-600">Loading...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50">
      {/* MOBILE ONLY: Hamburger button (<=768px) */}
      <div className="mobile-only fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="glass p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        } fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-y-auto shadow-xl`}
      >
        <div className="h-full flex flex-col p-6">
              {/* Logo */}
              <div className="mb-6 sidebar-logo">
                <Link href="/dashboard" className="flex items-center space-x-3 group" onClick={() => setMobileMenuOpen(false)}>
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-[#24B47E] rounded-xl blur opacity-50 group-hover:opacity-75 transition"></div>
                    <div className="relative w-12 h-12 bg-[#24B47E] rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🥗</span>
                    </div>
                  </div>
                  <div className="sidebar-text">
                    <h1 className="text-xl font-bold text-[#24B47E]">
                      Nutrify
                    </h1>
                    <p className="text-xs text-gray-600">Your Health Partner</p>
                  </div>
                </Link>
              </div>

              {/* User Info */}
              <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 sidebar-user">
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-[#24B47E] rounded-full blur opacity-50"></div>
                    <div className="relative w-12 h-12 bg-[#24B47E] rounded-full flex items-center justify-center text-white font-bold shadow-lg text-lg">
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 sidebar-text">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-gray-700 truncate">
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
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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
                      
                      <div className={`flex-shrink-0 w-6 h-6 nav-icon ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'} transition-colors`}>
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

              {/* Logout Button */}
              <div className="mt-5 pt-5 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="logout-btn w-full flex items-center space-x-3 px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group font-semibold"
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
