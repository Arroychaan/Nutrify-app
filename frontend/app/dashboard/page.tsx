'use client'

import { useState, useEffect } from 'react'
import { authApi, mealPlanApi } from '@/lib/api'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    bmi: 0,
    mealPlans: 0,
    streak: 0,
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    setLoading(true)
    try {
      // Ambil data user dan meal plans paralel
      const [meRes, mealPlansRes] = await Promise.all([
        authApi.me(),
        mealPlanApi.list().catch(() => ([])),
      ])

      const userData = (meRes as any).data || meRes
      setUser(userData)

      // Hitung BMI jika data tersedia
      let bmiValue = 0
      if (userData?.heightCm && userData?.currentWeightKg) {
        const heightInMeters = userData.heightCm / 100
        bmiValue = userData.currentWeightKg / (heightInMeters * heightInMeters)
      }

      const mealPlans = Array.isArray((mealPlansRes as any)?.data) ? (mealPlansRes as any).data : (mealPlansRes as any)
      const mealPlansCount = Array.isArray(mealPlans) ? mealPlans.length : 0

      setStats({
        bmi: Math.round(bmiValue * 10) / 10,
        mealPlans: mealPlansCount,
        streak: userData?.streakDays || 0,
      })
    } catch (error) {
      console.error('Failed to load user data', error)
    } finally {
      setLoading(false)
    }
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Kurus', color: 'text-yellow-700 bg-yellow-100 border-yellow-300', status: '⚠️' }
    if (bmi < 25) return { label: 'Normal', color: 'text-green-700 bg-green-100 border-green-300', status: '✅' }
    if (bmi < 30) return { label: 'Gemuk', color: 'text-orange-700 bg-orange-100 border-orange-300', status: '⚠️' }
    return { label: 'Obesitas', color: 'text-red-700 bg-red-100 border-red-300', status: '🚨' }
  }

  const bmiCategory = getBMICategory(stats.bmi)

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Loading Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="hero-grid">
            <div className="h-48 bg-gray-200 rounded-xl"></div>
            <div className="hero-grid-bottom contents">
              <div className="h-48 bg-gray-200 rounded-xl"></div>
              <div className="h-48 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
          <div className="mt-6 h-7 bg-gray-200 rounded w-44 mb-3"></div>
          <div className="action-grid">
            <div className="h-28 bg-gray-200 rounded-xl"></div>
            <div className="h-28 bg-gray-200 rounded-xl"></div>
            <div className="h-28 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 🏆 HERO: DATA UTAMA - 3 DETIK RULE */}
      <div>
        {/* Greeting COMPACT + Integrated */}
        <div className="mb-5">
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Hai {user?.fullName?.split(' ')[0] || 'Sobat'} 👋
          </h1>
          <p className="text-base text-gray-700 font-medium">
            {user?.targetWeightKg ? (
              <>BMI kamu hari ini <span className="font-black text-[#24B47E]">{stats.bmi.toFixed(1)}</span>. {bmiCategory.label === 'Normal' ? 'Pertahankan! 💪' : 'Terus usaha! 🔥'}</>
            ) : (
              <>Yuk mulai journey sehat kamu! 🎯</>
            )}
          </p>
        </div>

        {/* 3 HERO CARDS - ADAPTIVE GRID */}
        <div className="hero-grid">
          {/* 1. BMI CARD */}
          <motion.div 
            className="card-full-mobile bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#24B47E] hover:shadow-lg transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">BMI Kamu</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-6xl font-black text-gray-900 leading-none">{stats.bmi.toFixed(1)}</span>
                  <span className="text-xl font-bold text-gray-400">/25</span>
                </div>
                <p className="text-sm font-bold text-gray-600">{bmiCategory.label}</p>
              </div>
              <span className="text-3xl">{bmiCategory.status}</span>
            </div>
            <div className="space-y-3">
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#24B47E] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((stats.bmi / 30) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <p className="text-sm text-gray-600 font-medium">
                {user?.heightCm}cm · {user?.currentWeightKg}kg
              </p>
            </div>
          </motion.div>

          {/* WRAPPER for 2-column layout on tablet */}
          <div className="hero-grid-bottom contents">
            {/* 2. TARGET WEIGHT CARD */}
            <motion.div 
              className="card-full-mobile bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Target Berat</p>
              {user?.targetWeightKg ? (
                <>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-6xl font-black text-gray-900 leading-none">{user.targetWeightKg}</span>
                    <span className="text-xl font-bold text-gray-400">kg</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-600">Kurang lagi</span>
                      <span className="text-base font-black text-orange-600">{Math.abs(user.currentWeightKg - user.targetWeightKg).toFixed(1)}kg</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((user.currentWeightKg / user.targetWeightKg) * 100, 100)}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-6xl font-black text-gray-200 mb-4 leading-none">--</div>
                  <a 
                    href="/dashboard/profile" 
                    className="inline-flex items-center gap-2 text-base font-bold text-blue-600 hover:text-blue-700 hover:gap-3 transition-all"
                  >
                    Set target berat
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </>
              )}
            </motion.div>

            {/* 3. STREAK CARD */}
            <motion.div 
              className="card-full-mobile bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-500 hover:shadow-lg transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Streak Harian</p>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-6xl font-black text-gray-900 leading-none">{stats.streak}</span>
                <span className="text-3xl">{stats.streak > 0 ? '🔥' : '💪'}</span>
              </div>
              <p className="text-sm font-bold text-gray-700">
                {stats.streak > 0 ? 'Pertahankan terus!' : 'Mulai hari ini!'}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 🎯 MAU NGAPAIN? - Shortcut Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Mau Ngapain Hari Ini?</h2>
        <div className="action-grid">
          {/* Buat Meal Plan - PRIMARY ACTION */}
          <motion.a
            href="/dashboard/meal-plan"
            className="card-full-mobile bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg transition-all group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 mb-1">Buat Meal Plan</h3>
                <p className="text-sm text-gray-600">Rencanakan menu sehat kamu</p>
              </div>
              <svg className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </motion.a>

          {/* Chat AI */}
          <motion.a
            href="/dashboard/chat"
            className="card-full-mobile bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-[#24B47E] hover:shadow-lg transition-all group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#24B47E] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 mb-1">Chat dengan AI</h3>
                <p className="text-sm text-gray-600">Tanya soal nutrisi</p>
              </div>
              <svg className="w-5 h-5 text-[#24B47E] group-hover:translate-x-1 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </motion.a>

          {/* Update Profile */}
          <motion.a
            href="/dashboard/profile"
            className="card-full-mobile bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-gray-400 hover:shadow-lg transition-all group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 mb-1">Update Profil</h3>
                <p className="text-sm text-gray-600">Edit data kamu</p>
              </div>
              <svg className="w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </motion.a>
        </div>
      </div>

      {/* MEAL PLANS & TIPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meal Plans Kamu */}
        <div className="card-full-mobile bg-white border-2 border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Meal Plans Kamu</h2>
          {stats.mealPlans > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-base font-bold text-gray-900">Plan hari ini</p>
                  <p className="text-sm text-gray-600">1500 kcal</p>
                </div>
                <span className="text-2xl">🍽️</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">📋</span>
              <p className="text-base text-gray-600 mb-4">Belum ada meal plan</p>
              <a href="/dashboard/meal-plan" className="inline-flex items-center gap-2 text-base text-blue-600 font-bold hover:gap-3 transition-all">
                Buat sekarang
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          )}
        </div>

        {/* Tips Hari Ini */}
        <div className="card-full-mobile bg-white border-2 border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tips Hari Ini</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#24B47E] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 mb-1">Hidrasi Penting</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Minum minimal 8 gelas air putih sehari. Mulai hari dengan segelas air hangat!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
