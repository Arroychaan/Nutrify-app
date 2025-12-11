'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Target,
    Flame,
    Drumstick,
    Wheat,
    Droplet,
    Save,
    Loader2,
    Info
} from 'lucide-react'
import { authApi, foodLogApi } from '@/lib/api'
import Toast from '@/components/Toast'

export default function GoalsSettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as any })
    const [user, setUser] = useState<any>(null)
    const [calculatedGoals, setCalculatedGoals] = useState({
        calories: 2000,
        protein: 80,
        carbs: 250,
        fat: 55
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [userRes, summaryRes] = await Promise.all([
                authApi.me(),
                foodLogApi.getTodaySummary().catch(() => null)
            ])

            const userData = userRes.data || userRes
            setUser(userData)

            // Get calculated calorie target from backend
            const calorieTarget = summaryRes?.calorieTarget || 2000
            const proteinGoal = Math.round((userData.currentWeightKg || 65) * 1.6)
            const carbsGoal = Math.round(calorieTarget * 0.5 / 4)
            const fatGoal = Math.round(calorieTarget * 0.25 / 9)

            setCalculatedGoals({
                calories: calorieTarget,
                protein: proteinGoal,
                carbs: carbsGoal,
                fat: fatGoal
            })
        } catch (error) {
            console.error('Failed to load data', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-xl mx-auto animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
            </div>
        )
    }

    return (
        <>
            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />

            <div className="max-w-xl mx-auto space-y-6 pb-24 md:pb-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Target Nutrisi</h1>
                        <p className="text-sm text-gray-500">Target harian kalori dan makronutrien</p>
                    </div>
                </div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex gap-3"
                >
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-medium mb-1">Target dihitung otomatis</p>
                        <p className="text-blue-600 dark:text-blue-400">
                            Target nutrisi Anda dihitung berdasarkan berat badan, tinggi badan, usia, jenis kelamin, dan tingkat aktivitas.
                            Perbarui data tersebut di <span className="font-medium">Berat Badan & Target</span> untuk menyesuaikan target Anda.
                        </p>
                    </div>
                </motion.div>

                {/* Goals Display */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-5"
                >
                    {/* Calories */}
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Flame className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Target Kalori Harian</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{calculatedGoals.calories} <span className="text-sm font-normal text-gray-500">kkal</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Macros Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* Protein */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-center">
                            <Drumstick className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Protein</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{calculatedGoals.protein}<span className="text-xs font-normal">g</span></p>
                        </div>

                        {/* Carbs */}
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-center">
                            <Wheat className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Karbohidrat</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{calculatedGoals.carbs}<span className="text-xs font-normal">g</span></p>
                        </div>

                        {/* Fat */}
                        <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-2xl border border-pink-100 dark:border-pink-900/30 text-center">
                            <Droplet className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lemak</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{calculatedGoals.fat}<span className="text-xs font-normal">g</span></p>
                        </div>
                    </div>

                    {/* Calculation Info */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-400 text-center">
                            Berdasarkan: {user?.currentWeightKg || '--'} kg • {user?.heightCm || '--'} cm • Aktivitas {user?.activityLevel?.replace('_', ' ') || 'sedang'}
                        </p>
                    </div>
                </motion.div>

                {/* Edit Button */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => router.push('/dashboard/settings/weight')}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                    <Target className="w-5 h-5" />
                    Ubah Data Fisik & Aktivitas
                </motion.button>
            </div>
        </>
    )
}
