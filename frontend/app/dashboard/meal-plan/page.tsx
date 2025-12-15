'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import Toast from '@/components/Toast'
import ConfirmDialog from '@/components/ConfirmDialog'
import {
  Utensils,
  Trash2,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Sunrise,
  Sun,
  Moon,
  Cookie,
  Sparkles,
  Calendar,
  Clock,
  Loader2,
  RefreshCw,
  ShoppingCart,
  Check
} from 'lucide-react'
import { mealPlanApi } from '@/lib/api'

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
  days: any[]
}

export default function MealPlanPage() {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [showForm, setShowForm] = useState(false)
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    targetCalories: 2000,
    dietType: 'balanced',
    meals: 3,
    includeSnacks: true,
  })
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' })
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, mealPlanId: '' })
  const [shoppingListModal, setShoppingListModal] = useState({ isOpen: false, mealPlanId: '' })

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ isVisible: true, message, type })
  }

  const hideToast = () => {
    setToast({ ...toast, isVisible: false })
  }

  useEffect(() => {
    loadData()
  }, [])

  // Auto expand first plan
  useEffect(() => {
    if (mealPlans.length > 0 && !expandedPlan) {
      setExpandedPlan(mealPlans[0].id)
    }
  }, [mealPlans])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      // Load Plans & User Profile concurrently
      const [plansRes, userRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/meal-plans`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null)
      ])

      setMealPlans(plansRes.data.data || [])

      // Pre-fill form with user data if available
      if (userRes?.data?.data) {
        const user = userRes.data.data
        // Simple BMR/TDEE fallback or use saved target
        // Assuming average sedentary multiplier 1.2 * BMR (roughly weight * 24)
        // Or better yet, if the backend provides calculated target.
        // Let's use a safe estimate: (Height - 100) * 24 roughly, OR currentWeight * 30 (maintenance)
        // Ideally backend adds 'dailyCalorieTarget' to User model.
        // For now, let's try to match the logic from dashboard: 
        const weight = Number(user.currentWeightKg) || 60
        const calculatedTarget = Math.round(weight * 30) // Crude maintenance estimation

        setFormData(prev => ({
          ...prev,
          targetCalories: calculatedTarget > 1200 ? calculatedTarget : 2000
        }))
      }
    } catch (error) {
      console.error('Failed to load data', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMealPlans = async () => {
    // Legacy single loader kept for specialized reloading if needed, but normally use loadData
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/api/v1/meal-plans`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMealPlans(response.data.data || [])
    } catch (e) { console.error(e) }
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
        showToast('Rencana makan berhasil dibuat! 🎉', 'success')
      }
    } catch (error: any) {
      console.error('Failed to generate meal plan', error)
      showToast(error.response?.data?.error?.message || 'Gagal membuat rencana makan', 'error')
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
      showToast('Rencana makan berhasil dihapus', 'success')
    } catch (error) {
      console.error('Failed to delete meal plan', error)
      showToast('Gagal menghapus rencana makan', 'error')
    }
  }

  const handleSwapMeal = async (mealPlanId: string, mealPlanDayId: string, mealType: string, currentMealId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `${API_URL}/api/v1/meal-plans/${mealPlanId}/swap`,
        { mealPlanDayId, mealType, currentMealId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        await loadMealPlans()
        showToast('Menu berhasil ditukar! 🔄', 'success')
      }
    } catch (error) {
      console.error('Failed to swap meal', error)
      showToast('Gagal menukar menu', 'error')
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
      day: 'numeric',
      month: 'long'
    })
  }

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    })
  }

  const dietOptions = [
    { id: 'balanced', label: 'Seimbang', desc: 'Karbo, protein, lemak seimbang' },
    { id: 'high-protein', label: 'Tinggi Protein', desc: 'Untuk membangun otot' },
    { id: 'low-carb', label: 'Rendah Karbo', desc: 'Keto / Low carb diet' },
    { id: 'vegetarian', label: 'Vegetarian', desc: 'Tanpa daging' },
  ]

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pb-24 md:pb-8">
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
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
        title="Hapus Rencana Makan?"
        message="Apakah Anda yakin ingin menghapus rencana makan ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, mealPlanId: '' })}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />

      <ShoppingListModal
        isOpen={shoppingListModal.isOpen}
        mealPlanId={shoppingListModal.mealPlanId}
        onClose={() => setShoppingListModal({ isOpen: false, mealPlanId: '' })}
      />

      <div className="max-w-4xl mx-auto pb-24 md:pb-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Rencana Makan
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">
                Menu harian yang dipersonalisasi untuk Anda
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${showForm
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg'
                }`}
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span className="hidden sm:inline">{showForm ? 'Tutup' : 'Rencana Baru'}</span>
            </button>
          </div>
        </motion.div>

        {/* Generator Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">Buat Rencana Baru</h2>
                    <p className="text-xs text-gray-500">AI akan menyesuaikan dengan profil kesehatan Anda</p>
                  </div>
                </div>

                {/* Calorie Target */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Target Kalori Harian
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1200"
                      max="3500"
                      step="100"
                      value={formData.targetCalories}
                      onChange={(e) => setFormData({ ...formData, targetCalories: parseInt(e.target.value) })}
                      className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="w-24 text-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{formData.targetCalories}</span>
                      <span className="text-xs text-gray-500 block">kkal</span>
                    </div>
                  </div>
                </div>

                {/* Diet Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Jenis Diet
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {dietOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setFormData({ ...formData, dietType: opt.id })}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${formData.dietType === opt.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                          }`}
                      >
                        <p className={`font-semibold text-sm ${formData.dietType === opt.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options Row */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.includeSnacks ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                      {formData.includeSnacks && <Plus className="w-3 h-3 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.includeSnacks}
                      onChange={(e) => setFormData({ ...formData, includeSnacks: e.target.checked })}
                      className="hidden"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Sertakan camilan</span>
                  </label>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateMealPlan}
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-500/25 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      AI sedang membuat rencana...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate dengan AI
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meal Plans */}
        <div className="space-y-4">
          {mealPlans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="w-10 h-10 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Belum ada rencana makan
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto text-sm">
                Buat rencana makan pertama Anda dan AI akan menyesuaikan dengan preferensi dan kondisi kesehatan Anda
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
              >
                <Plus className="w-5 h-5" />
                Buat Rencana Pertama
              </button>
            </motion.div>
          ) : (
            mealPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                {/* Plan Header - Minimal */}
                <button
                  onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-4">
                    {/* Date Badge - Green Theme */}
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                      <span className="text-lg leading-none">{new Date(plan.date).getDate()}</span>
                      <span className="text-[10px] uppercase">{new Date(plan.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">
                        {formatDate(plan.date)}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-emerald-500" />
                          {plan.totalCalories} kkal
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>{plan.totalProtein}g protein</span>
                      </div>
                    </div>
                  </div>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${expandedPlan === plan.id ? 'bg-emerald-500 text-white rotate-180' : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedPlan === plan.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-6 space-y-6">
                        {/* Minimalist Macros */}
                        <div className="grid grid-cols-4 gap-2 py-4 border-t border-gray-100 dark:border-gray-700/50 mt-2">
                          <MacroItem label="Kalori" value={plan.totalCalories} unit="kkal" />
                          <MacroItem label="Protein" value={plan.totalProtein} unit="g" />
                          <MacroItem label="Karbo" value={plan.totalCarbs} unit="g" />
                          <MacroItem label="Lemak" value={plan.totalFat} unit="g" />
                        </div>

                        {/* Timeline - Clean List */}
                        <div className="space-y-0 relative">
                          {/* Connecting Line */}
                          <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gray-100 dark:bg-gray-700/50 z-0" />

                          {plan.breakfast && (
                            <MealItem
                              type="breakfast"
                              meal={plan.breakfast}
                              onSwap={() => handleSwapMeal(plan.id, plan.days?.[0]?.id, 'breakfast', plan.breakfast.id)}
                            />
                          )}
                          {plan.lunch && (
                            <MealItem
                              type="lunch"
                              meal={plan.lunch}
                              onSwap={() => handleSwapMeal(plan.id, plan.days?.[0]?.id, 'lunch', plan.lunch.id)}
                            />
                          )}
                          {plan.dinner && (
                            <MealItem
                              type="dinner"
                              meal={plan.dinner}
                              onSwap={() => handleSwapMeal(plan.id, plan.days?.[0]?.id, 'dinner', plan.dinner.id)}
                            />
                          )}
                          {plan.snacks && plan.snacks.length > 0 && plan.snacks.map((snack: any, idx: number) => (
                            <MealItem
                              key={idx}
                              type="snack"
                              meal={snack}
                              // Note: Swap logic for snacks might need specific ID targeting if multiple snacks exist
                              // checking if plan.days[0] exists is needed as it might not be populated in the minimalist interface if not fetched.
                              // However, checking the controller getMealPlansController, it includes days.
                              onSwap={() => handleSwapMeal(plan.id, plan.days?.[0]?.id, 'snack', snack.id)}
                            />
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700/50">
                          <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700/50 gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShoppingListModal({ isOpen: true, mealPlanId: plan.id })
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl text-sm font-medium transition-colors"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Shopping List
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteClick(plan.id)
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Hapus Rencana
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

// Minimalist Macro Item
function MacroItem({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-1">{label}</p>
      <div className="font-bold text-gray-900 dark:text-white text-base">
        {value} <span className="text-[10px] text-gray-400 font-normal">{unit}</span>
      </div>
    </div>
  )
}

// Clean Meal List Item
function MealItem({ type, meal, onSwap }: { type: 'breakfast' | 'lunch' | 'dinner' | 'snack'; meal: { id?: string; name: string; calories: number }; onSwap: () => void }) {
  const config = {
    breakfast: { icon: Sunrise, time: '07:00' },
    lunch: { icon: Sun, time: '12:00' },
    dinner: { icon: Moon, time: '19:00' },
    snack: { icon: Cookie, time: '15:00' }
  }
  const { icon: Icon, time } = config[type]

  return (
    <div className="relative z-10 flex gap-4 py-3 group">
      {/* Icon Node */}
      <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-emerald-100 dark:border-emerald-900/30 group-hover:border-emerald-500 transition-colors flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon className="w-4 h-4 text-emerald-500" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex justify-between items-start mb-1">
          <span className="text-[10px] font-bold text- emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {type === 'snack' ? 'Camilan' : type === 'breakfast' ? 'Sarapan' : type === 'lunch' ? 'Makan Siang' : 'Makan Malam'}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">{time}</span>
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">{meal.name}</p>
        <p className="text-xs text-gray-500 mt-1">{meal.calories} kkal</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onSwap()
        }}
        className="opacity-0 group-hover:opacity-100 p-2 bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-gray-500 hover:text-emerald-600 rounded-lg transition-all"
        title="Tukar Menu"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  )
}

function ShoppingListModal({ isOpen, mealPlanId, onClose }: { isOpen: boolean, mealPlanId: string, onClose: () => void }) {
  const [items, setItems] = useState<{ category: string, items: any[] }[]>([])
  const [loading, setLoading] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (isOpen && mealPlanId) {
      loadList()
    }
  }, [isOpen, mealPlanId])

  const loadList = async () => {
    setLoading(true)
    try {
      const data = await mealPlanApi.getShoppingList(mealPlanId)
      setItems(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const toggleCheck = (id: string, name: string) => {
    const key = `${id}-${name}`
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-emerald-500 text-white">
              <div>
                <h3 className="text-xl font-bold">Shopping List</h3>
                <p className="text-emerald-100 text-sm">Bahan untuk rencana makan ini</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p>Menyiapkan daftar belanja...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Daftar kosong atau data bahan belum tersedia.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((cat, idx) => (
                    <div key={idx}>
                      <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm uppercase tracking-wider mb-3 px-1">
                        {cat.category}
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-2">
                        {cat.items.map((item, i) => {
                          const key = `${cat.category}-${item.name}`
                          const isChecked = checkedItems[key]
                          return (
                            <div
                              key={i}
                              onClick={() => toggleCheck(cat.category, item.name)}
                              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isChecked
                                ? 'bg-emerald-100/50 dark:bg-emerald-900/20 opacity-60'
                                : 'hover:bg-white dark:hover:bg-gray-800'
                                }`}
                            >
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isChecked
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                {isChecked && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm font-medium transition-all ${isChecked ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'
                                  }`}>
                                  {item.name}
                                </p>
                              </div>
                              <div className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                                {item.quantity} {item.unit}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 text-center text-xs text-gray-500">
              Checklist ini tersimpan sementara di perangkat Anda
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
