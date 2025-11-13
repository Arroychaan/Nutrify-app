'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { authApi } from '@/lib/api'
import axios from 'axios'
import Toast from '@/components/Toast'
import ConfirmDialog from '@/components/ConfirmDialog'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface MealPlan {
  id: string
  date: string
  breakfast: any
  lunch: any
  dinner: any
  snacks: any[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  createdAt: string
}

export default function MealPlanPage() {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    targetCalories: 2000,
    dietType: 'balanced',
    meals: 3,
    includeSnacks: true,
  })
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' })
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, mealPlanId: '' })

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
    loadMealPlans()
  }, [])

  const loadMealPlans = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/api/v1/meal-plans`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMealPlans(response.data.data || [])
    } catch (error) {
      console.error('Failed to load meal plans', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMealPlan = async () => {
    try {
      setGenerating(true)
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/api/v1/meal-plans/generate`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      if (response.data.success) {
        await loadMealPlans()
        setShowForm(false)
        showToast('Meal plan berhasil dibuat! 🎉', 'success')
      }
    } catch (error: any) {
      console.error('Failed to generate meal plan', error)
      showToast(error.response?.data?.error?.message || 'Gagal membuat meal plan', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const deleteMealPlan = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/api/v1/meal-plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await loadMealPlans()
      showToast('Meal plan berhasil dihapus', 'success')
    } catch (error) {
      console.error('Failed to delete meal plan', error)
      showToast('Gagal menghapus meal plan', 'error')
    }
  }

  const handleDeleteClick = (id: string) => {
    setConfirmDialog({ isOpen: true, mealPlanId: id })
  }

  const handleConfirmDelete = () => {
    if (confirmDialog.mealPlanId) {
      deleteMealPlan(confirmDialog.mealPlanId)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Hapus Meal Plan?"
        message="Apakah Anda yakin ingin menghapus meal plan ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, mealPlanId: '' })}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />
      
      <motion.div
        className="space-y-6"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
      {/* Header */}
      <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={fadeInUp}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Meal Plan 🍽️
            </h1>
            <p className="text-gray-600">
              Rencana makan personal berbasis AI dengan makanan lokal Indonesia
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            {showForm ? 'Tutup Form' : '+ Buat Meal Plan Baru'}
          </button>
        </div>
      </motion.div>

      {/* Form Generate Meal Plan */}
      {showForm && (
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Buat Meal Plan Baru</h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Kalori (per hari)
              </label>
              <input
                type="number"
                value={formData.targetCalories}
                onChange={(e) => setFormData({ ...formData, targetCalories: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="1000"
                max="5000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Diet
              </label>
              <select
                value={formData.dietType}
                onChange={(e) => setFormData({ ...formData, dietType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="balanced">Seimbang</option>
                <option value="high-protein">Tinggi Protein</option>
                <option value="low-carb">Rendah Karbo</option>
                <option value="vegetarian">Vegetarian</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Makan Utama
              </label>
              <select
                value={formData.meals}
                onChange={(e) => setFormData({ ...formData, meals: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="2">2x Makan</option>
                <option value="3">3x Makan</option>
                <option value="4">4x Makan</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.includeSnacks}
                onChange={(e) => setFormData({ ...formData, includeSnacks: e.target.checked })}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Sertakan Snack Sehat
              </label>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={generateMealPlan}
              disabled={generating}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:bg-gray-400"
            >
              {generating ? 'Generating...' : 'Generate dengan AI 🤖'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Batal
            </button>
          </div>
        </motion.div>
      )}

      {/* Meal Plans List */}
      {mealPlans.length === 0 ? (
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-12 text-center"
          variants={fadeInUp}
        >
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Belum Ada Meal Plan
          </h3>
          <p className="text-gray-600 mb-6">
            Buat meal plan pertama Anda dengan AI untuk mendapatkan rekomendasi makanan lokal Indonesia yang sesuai dengan kebutuhan nutrisi Anda
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Buat Meal Plan Sekarang
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {mealPlans.map((plan) => (
            <motion.div
              key={plan.id}
              className="bg-white rounded-xl shadow-sm p-6"
              variants={fadeInUp}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {formatDate(plan.date)}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Total: {plan.totalCalories} kkal | Protein: {plan.totalProtein}g | Karbo: {plan.totalCarbs}g | Lemak: {plan.totalFat}g
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteClick(plan.id)}
                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  🗑️ Hapus
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {/* Breakfast */}
                {plan.breakfast && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      🌅 Sarapan
                    </h4>
                    <p className="text-sm text-gray-700">{plan.breakfast.name || 'Menu sarapan'}</p>
                    <p className="text-xs text-gray-600 mt-1">{plan.breakfast.calories || 0} kkal</p>
                  </div>
                )}

                {/* Lunch */}
                {plan.lunch && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      ☀️ Makan Siang
                    </h4>
                    <p className="text-sm text-gray-700">{plan.lunch.name || 'Menu makan siang'}</p>
                    <p className="text-xs text-gray-600 mt-1">{plan.lunch.calories || 0} kkal</p>
                  </div>
                )}

                {/* Dinner */}
                {plan.dinner && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      🌙 Makan Malam
                    </h4>
                    <p className="text-sm text-gray-700">{plan.dinner.name || 'Menu makan malam'}</p>
                    <p className="text-xs text-gray-600 mt-1">{plan.dinner.calories || 0} kkal</p>
                  </div>
                )}
              </div>

              {/* Snacks */}
              {plan.snacks && plan.snacks.length > 0 && (
                <div className="mt-4 bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🍎 Snack</h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.snacks.map((snack: any, idx: number) => (
                      <span key={idx} className="text-sm bg-white px-3 py-1 rounded-full text-gray-700">
                        {snack.name || `Snack ${idx + 1}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
      </motion.div>
    </>
  )
}
