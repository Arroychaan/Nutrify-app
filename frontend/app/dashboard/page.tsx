'use client'

import { useState, useEffect } from 'react'
import { authApi } from '@/lib/api'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    bmi: 0,
    mealPlans: 0,
    streak: 0,
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const response = await authApi.me()
      const userData = response.data || response
      setUser(userData)
      
      // Calculate BMI
      if (userData.heightCm && userData.currentWeightKg) {
        const heightInMeters = userData.heightCm / 100
        const bmi = userData.currentWeightKg / (heightInMeters * heightInMeters)
        setStats({
          bmi: Math.round(bmi * 10) / 10,
          mealPlans: 0, // TODO: Get from API
          streak: userData.streakDays || 0,
        })
      }
    } catch (error) {
      console.error('Failed to load user data', error)
    }
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Kurus', color: 'text-yellow-600 bg-yellow-50' }
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600 bg-green-50' }
    if (bmi < 30) return { label: 'Gemuk', color: 'text-orange-600 bg-orange-50' }
    return { label: 'Obesitas', color: 'text-red-600 bg-red-50' }
  }

  const bmiCategory = getBMICategory(stats.bmi)

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <motion.div 
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={fadeInUp}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Selamat Datang, {user?.fullName || 'User'}! 👋
        </h1>
        <p className="text-gray-600">
          Ini adalah ringkasan kesehatan dan aktivitas nutrisi Anda hari ini
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" variants={fadeInUp}>
        {/* BMI Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">⚖️</span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${bmiCategory.color}`}>
              {bmiCategory.label}
            </span>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">BMI Anda</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.bmi}</p>
          <p className="text-xs text-gray-500 mt-2">
            {user?.currentWeightKg}kg / {user?.heightCm}cm
          </p>
        </div>

        {/* Weight Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-3xl mb-4">🎯</div>
          <h3 className="text-sm text-gray-600 mb-1">Target Berat</h3>
          <p className="text-3xl font-bold text-gray-900">
            {user?.targetWeightKg || '-'}<span className="text-lg">kg</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {user?.targetWeightKg 
              ? `${Math.abs(user.currentWeightKg - user.targetWeightKg).toFixed(1)}kg lagi`
              : 'Belum diatur'}
          </p>
        </div>

        {/* Meal Plans Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-3xl mb-4">🍽️</div>
          <h3 className="text-sm text-gray-600 mb-1">Meal Plans</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.mealPlans}</p>
          <p className="text-xs text-gray-500 mt-2">Rencana makan aktif</p>
        </div>

        {/* Streak Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-3xl mb-4">🔥</div>
          <h3 className="text-sm text-gray-600 mb-1">Streak</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.streak}</p>
          <p className="text-xs text-gray-500 mt-2">Hari berturut-turut</p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={fadeInUp}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/dashboard/meal-plan"
            className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
          >
            <span className="text-3xl">📋</span>
            <div>
              <h3 className="font-semibold text-gray-900">Buat Meal Plan</h3>
              <p className="text-sm text-gray-600">Rencana makan baru</p>
            </div>
          </a>

          <a
            href="/dashboard/chat"
            className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
          >
            <span className="text-3xl">💬</span>
            <div>
              <h3 className="font-semibold text-gray-900">Chat dengan AI</h3>
              <p className="text-sm text-gray-600">Konsultasi nutrisi</p>
            </div>
          </a>

          <a
            href="/dashboard/profile"
            className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
          >
            <span className="text-3xl">⚙️</span>
            <div>
              <h3 className="font-semibold text-gray-900">Update Profil</h3>
              <p className="text-sm text-gray-600">Edit informasi Anda</p>
            </div>
          </a>
        </div>
      </motion.div>

      {/* Health Tips */}
      <motion.div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6" variants={fadeInUp}>
        <div className="flex items-start space-x-4">
          <span className="text-4xl">💡</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Tips Hari Ini</h2>
            <p className="text-gray-700 leading-relaxed">
              Minum air putih minimal 8 gelas sehari untuk menjaga hidrasi tubuh dan mendukung metabolisme yang optimal. 
              Mulai hari Anda dengan segelas air hangat!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={fadeInUp}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Aktivitas Terkini</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Akun berhasil dibuat</p>
              <p className="text-sm text-gray-600">Selamat datang di Nutrify!</p>
            </div>
            <span className="text-sm text-gray-500">Baru saja</span>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <p>Belum ada aktivitas lainnya</p>
            <p className="text-sm mt-2">Mulai dengan membuat meal plan pertama Anda!</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
