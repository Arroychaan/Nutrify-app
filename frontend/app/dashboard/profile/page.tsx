'use client'

import { useState, useEffect } from 'react'
import { authApi } from '@/lib/api'
import { motion } from 'framer-motion'
import Toast from '@/components/Toast'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' })

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ isVisible: true, message, type })
  }

  const hideToast = () => {
    setToast({ ...toast, isVisible: false })
  }

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
      const userData = response.data || response
      setUser(userData)
      setFormData({
        fullName: userData.fullName || '',
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: userData.gender || '',
        phoneNumber: userData.phoneNumber || '',
        heightCm: userData.heightCm || '',
        currentWeightKg: userData.currentWeightKg || '',
        targetWeightKg: userData.targetWeightKg || '',
        activityLevel: userData.activityLevel || 'moderate',
        culture: userData.culture || '',
        religion: userData.religion || '',
        medicalConditions: userData.medicalConditions || [],
        medications: userData.medications || [],
        allergies: userData.allergies || [],
        dietaryRestrictions: userData.dietaryRestrictions || [],
        dislikes: userData.dislikes || [],
      })
    } catch (error) {
      console.error('Failed to load user data', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await authApi.updateProfile(formData)
      await loadUserData()
      setEditing(false)
      showToast('Profil berhasil diperbarui! 🎉', 'success')
    } catch (error: any) {
      console.error('Failed to update profile', error)
      showToast(error.response?.data?.error?.message || 'Gagal memperbarui profil', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    loadUserData()
  }

  const addArrayItem = (field: string, value: string) => {
    if (value.trim()) {
      setFormData({
        ...formData,
        [field]: [...(formData[field] || []), value.trim()],
      })
    }
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_: any, i: number) => i !== index),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <>
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      <motion.div 
        className="max-w-4xl mx-auto space-y-6"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
      {/* Header */}
      <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={fadeInUp}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Profil Saya
            </h1>
            <p className="text-gray-600">
              Kelola informasi pribadi dan preferensi kesehatan Anda
            </p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Edit Profil
            </button>
          )}
        </div>
      </motion.div>

      {/* Personal Info */}
      <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={fadeInUp}>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Informasi Pribadi</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
            {editing ? (
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-base text-gray-900">{user?.fullName || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <p className="text-base text-gray-900">{user?.email || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
            {editing ? (
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-base text-gray-900">
                {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('id-ID') : 'Belum diatur'}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
            {editing ? (
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Pilih</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            ) : (
              <p className="text-base text-gray-900 capitalize">{user?.gender || 'Belum diatur'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
            {editing ? (
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-base text-gray-900">{user?.phoneNumber || 'Belum diatur'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Aktivitas</label>
            {editing ? (
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="sedentary">Sedentary (Tidak aktif)</option>
                <option value="light">Light (Ringan)</option>
                <option value="moderate">Moderate (Sedang)</option>
                <option value="active">Active (Aktif)</option>
                <option value="very_active">Very Active (Sangat Aktif)</option>
              </select>
            ) : (
              <p className="text-base text-gray-900 capitalize">{user?.activityLevel || 'moderate'}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Physical Metrics */}
      <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={fadeInUp}>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Metrik Fisik</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tinggi Badan (cm)</label>
            {editing ? (
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{user?.heightCm} <span className="text-base font-normal">cm</span></p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Berat Badan Saat Ini (kg)</label>
            {editing ? (
              <input
                type="number"
                step="0.1"
                value={formData.currentWeightKg}
                onChange={(e) => setFormData({ ...formData, currentWeightKg: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{user?.currentWeightKg} <span className="text-base font-normal">kg</span></p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Berat Badan (kg)</label>
            {editing ? (
              <input
                type="number"
                step="0.1"
                value={formData.targetWeightKg}
                onChange={(e) => setFormData({ ...formData, targetWeightKg: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {user?.targetWeightKg || '-'} <span className="text-base font-normal">{user?.targetWeightKg ? 'kg' : ''}</span>
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Cultural & Religious */}
      <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={fadeInUp}>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Budaya & Agama</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budaya</label>
            {editing ? (
              <select
                value={formData.culture}
                onChange={(e) => setFormData({ ...formData, culture: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Pilih Budaya</option>
                <option value="Jawa">Jawa</option>
                <option value="Sunda">Sunda</option>
                <option value="Minang">Minang</option>
                <option value="Bugis">Bugis</option>
                <option value="Batak">Batak</option>
                <option value="Bali">Bali</option>
                <option value="Betawi">Betawi</option>
              </select>
            ) : (
              <p className="text-base text-gray-900">{user?.culture || 'Belum diatur'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Agama</label>
            {editing ? (
              <select
                value={formData.religion}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Pilih Agama</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            ) : (
              <p className="text-base text-gray-900">{user?.religion || 'Belum diatur'}</p>
            )}
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

      {/* Action Buttons */}
      {editing && (
        <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={fadeInUp}>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition disabled:bg-gray-400"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              onClick={handleCancel}
              className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Batal
            </button>
          </div>
        </motion.div>
      )}
      </motion.div>
    </>
  )
}
