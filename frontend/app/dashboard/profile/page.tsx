'use client'

import { useState, useEffect } from 'react'
import { authApi } from '@/lib/api'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const response = await authApi.me()
      setUser(response.data || response)
    } catch (error) {
      console.error('Failed to load user data', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <motion.div 
      className="max-w-4xl mx-auto space-y-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={fadeInUp}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Profil Saya
        </h1>
        <p className="text-gray-600">
          Kelola informasi pribadi dan preferensi kesehatan Anda
        </p>
      </motion.div>

      {/* Personal Info */}
      <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={fadeInUp}>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Informasi Pribadi</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
            <p className="text-base text-gray-900">{user?.fullName || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <p className="text-base text-gray-900">{user?.email || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
            <p className="text-base text-gray-900">
              {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('id-ID') : 'Belum diatur'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
            <p className="text-base text-gray-900">{user?.gender || 'Belum diatur'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
            <p className="text-base text-gray-900">{user?.phoneNumber || 'Belum diatur'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Aktivitas</label>
            <p className="text-base text-gray-900 capitalize">{user?.activityLevel || 'moderate'}</p>
          </div>
        </div>
      </motion.div>

      {/* Physical Metrics */}
      <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={fadeInUp}>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Metrik Fisik</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tinggi Badan</label>
            <p className="text-2xl font-bold text-gray-900">{user?.heightCm} <span className="text-base font-normal">cm</span></p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Berat Badan Saat Ini</label>
            <p className="text-2xl font-bold text-gray-900">{user?.currentWeightKg} <span className="text-base font-normal">kg</span></p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Berat Badan</label>
            <p className="text-2xl font-bold text-gray-900">
              {user?.targetWeightKg || '-'} <span className="text-base font-normal">{user?.targetWeightKg ? 'kg' : ''}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Cultural & Religious */}
      <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={fadeInUp}>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Budaya & Agama</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budaya</label>
            <p className="text-base text-gray-900">{user?.culture || 'Belum diatur'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Agama</label>
            <p className="text-base text-gray-900">{user?.religion || 'Belum diatur'}</p>
          </div>
        </div>
      </motion.div>

      {/* Medical Info */}
      <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={fadeInUp}>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Informasi Medis</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kondisi Medis</label>
            <div className="flex flex-wrap gap-2">
              {user?.medicalConditions?.length > 0 ? (
                user.medicalConditions.map((condition: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                    {condition}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">Tidak ada kondisi medis</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Obat-obatan</label>
            <div className="flex flex-wrap gap-2">
              {user?.medications?.length > 0 ? (
                user.medications.map((med: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {med}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">Tidak ada obat-obatan</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alergi</label>
            <div className="flex flex-wrap gap-2">
              {user?.allergies?.length > 0 ? (
                user.allergies.map((allergy: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    {allergy}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">Tidak ada alergi</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pantangan Makanan</label>
            <div className="flex flex-wrap gap-2">
              {user?.dietaryRestrictions?.length > 0 ? (
                user.dietaryRestrictions.map((restriction: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {restriction}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">Tidak ada pantangan</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Makanan yang Tidak Disukai</label>
            <div className="flex flex-wrap gap-2">
              {user?.dislikes?.length > 0 ? (
                user.dislikes.map((dislike: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {dislike}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">Tidak ada</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badges & Achievements */}
      <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={fadeInUp}>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Badge & Pencapaian</h2>
        <div className="flex flex-wrap gap-4">
          {user?.badges?.length > 0 ? (
            user.badges.map((badge: string, index: number) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-2xl mb-2">
                  🏆
                </div>
                <span className="text-sm text-gray-700">{badge}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Belum ada badge. Mulai gunakan Nutrify untuk mendapatkan badge!</p>
          )}
        </div>
      </motion.div>

      {/* Edit Button */}
      <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={fadeInUp}>
        <button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition">
          Edit Profil
        </button>
        <p className="text-sm text-gray-500 mt-4">
          Fitur edit profil akan segera tersedia. Untuk saat ini, profil hanya dapat dilihat.
        </p>
      </motion.div>
    </motion.div>
  )
}
