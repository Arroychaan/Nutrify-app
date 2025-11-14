'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
        className="space-y-4 md:space-y-6 max-w-7xl mx-auto"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
      {/* Header with Gradient */}
      <motion.div className="relative overflow-hidden glass rounded-xl md:rounded-2xl shadow-lg p-5 md:p-8" variants={fadeInUp}>
        <div className="absolute inset-0 bg-gradient-accent opacity-10"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 md:mb-2">
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Meal Plan
              </span>
              <svg className="inline-block w-8 h-8 md:w-10 md:h-10 ml-2 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              Rencana makan personal berbasis AI dengan makanan lokal Indonesia
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
          >
            {showForm ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline">Tutup Form</span>
                <span className="sm:hidden">Tutup</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Buat Meal Plan Baru</span>
                <span className="sm:hidden">Buat Baru</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Form Generate Meal Plan */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            className="glass rounded-xl md:rounded-2xl shadow-lg p-5 md:p-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-base md:text-2xl">Buat Meal Plan Baru</span>
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Kalori (per hari)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.targetCalories}
                    onChange={(e) => setFormData({ ...formData, targetCalories: parseInt(e.target.value) })}
                    className="input-field w-full text-base"
                    min="1000"
                    max="5000"
                  />
                  <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">kkal</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipe Diet
                </label>
                <select
                  value={formData.dietType}
                  onChange={(e) => setFormData({ ...formData, dietType: e.target.value })}
                  className="input-field w-full text-base"
                >
                  <option value="balanced">⚖️ Seimbang</option>
                  <option value="high-protein">💪 Tinggi Protein</option>
                  <option value="low-carb">🥗 Rendah Karbo</option>
                  <option value="vegetarian">🌱 Vegetarian</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jumlah Makan Utama
                </label>
                <select
                  value={formData.meals}
                  onChange={(e) => setFormData({ ...formData, meals: parseInt(e.target.value) })}
                  className="input-field w-full text-base"
                >
                  <option value="2">2x Makan</option>
                  <option value="3">3x Makan</option>
                  <option value="4">4x Makan</option>
                </select>
              </div>

              <div className="flex items-center pt-0 sm:pt-8">
                <input
                  type="checkbox"
                  checked={formData.includeSnacks}
                  onChange={(e) => setFormData({ ...formData, includeSnacks: e.target.checked })}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label className="ml-3 text-sm font-medium text-gray-700">
                  Sertakan Snack Sehat 🍎
                </label>
              </div>
            </div>

            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={generateMealPlan}
                disabled={generating}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate dengan AI
                  </>
                )}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary px-6 md:px-8"
              >
                Batal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meal Plans List */}
      {mealPlans.length === 0 ? (
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-8 md:p-12 text-center"
          variants={fadeInUp}
        >
          <div className="text-5xl md:text-6xl mb-3 md:mb-4">🍽️</div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
            Belum Ada Meal Plan
          </h3>
          <p className="text-sm md:text-base text-gray-600 mb-5 md:mb-6 max-w-2xl mx-auto">
            Buat meal plan pertama Anda dengan AI untuk mendapatkan rekomendasi makanan lokal Indonesia yang sesuai dengan kebutuhan nutrisi Anda
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 md:py-3 px-6 md:px-8 rounded-lg transition active:scale-95 w-full sm:w-auto"
          >
            Buat Meal Plan Sekarang
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {mealPlans.map((plan) => (
            <motion.div
              key={plan.id}
              className="bg-white rounded-xl shadow-sm p-4 md:p-6"
              variants={fadeInUp}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-xl font-bold text-gray-900 truncate">
                    {formatDate(plan.date)}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 mt-1 break-words">
                    Total: {plan.totalCalories} kkal | Protein: {plan.totalProtein}g | Karbo: {plan.totalCarbs}g | Lemak: {plan.totalFat}g
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteClick(plan.id)}
                  className="text-red-600 hover:text-red-700 font-medium text-sm self-start sm:self-auto active:scale-95"
                >
                  🗑️ Hapus
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {/* Breakfast */}
                {plan.breakfast && (
                  <div className="bg-yellow-50 rounded-lg p-3 md:p-4">
                    <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-2 flex items-center gap-2">
                      🌅 Sarapan
                    </h4>
                    <p className="text-xs md:text-sm text-gray-700 line-clamp-2">{plan.breakfast.name || 'Menu sarapan'}</p>
                    <p className="text-xs text-gray-600 mt-1">{plan.breakfast.calories || 0} kkal</p>
                  </div>
                )}

                {/* Lunch */}
                {plan.lunch && (
                  <div className="bg-orange-50 rounded-lg p-3 md:p-4">
                    <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-2 flex items-center gap-2">
                      ☀️ Makan Siang
                    </h4>
                    <p className="text-xs md:text-sm text-gray-700 line-clamp-2">{plan.lunch.name || 'Menu makan siang'}</p>
                    <p className="text-xs text-gray-600 mt-1">{plan.lunch.calories || 0} kkal</p>
                  </div>
                )}

                {/* Dinner */}
                {plan.dinner && (
                  <div className="bg-blue-50 rounded-lg p-3 md:p-4">
                    <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-2 flex items-center gap-2">
                      🌙 Makan Malam
                    </h4>
                    <p className="text-xs md:text-sm text-gray-700 line-clamp-2">{plan.dinner.name || 'Menu makan malam'}</p>
                    <p className="text-xs text-gray-600 mt-1">{plan.dinner.calories || 0} kkal</p>
                  </div>
                )}
              </div>

              {/* Snacks */}
              {plan.snacks && plan.snacks.length > 0 && (
                <div className="mt-3 md:mt-4 bg-green-50 rounded-lg p-3 md:p-4">
                  <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-2">🍎 Snack</h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.snacks.map((snack: any, idx: number) => (
                      <span key={idx} className="text-xs md:text-sm bg-white px-2.5 md:px-3 py-1 rounded-full text-gray-700">
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
