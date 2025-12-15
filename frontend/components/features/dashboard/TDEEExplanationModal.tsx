'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Calculator, Activity, ArrowRight } from 'lucide-react'

interface TDEEExplanationModalProps {
    isOpen: boolean
    onClose: () => void
    user: any
    caloriesGoal: number
}

export default function TDEEExplanationModal({ isOpen, onClose, user, caloriesGoal }: TDEEExplanationModalProps) {
    if (!isOpen) return null

    // Calculate BMR for display
    const weight = Number(user?.currentWeightKg) || 60
    const height = Number(user?.heightCm) || 160
    const age = user?.dateOfBirth
        ? Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 30

    // Mifflin-St Jeor
    let bmr = 10 * weight + 6.25 * height - 5 * age
    bmr = user?.gender === 'female' ? bmr - 161 : bmr + 5

    // Activity Multiplier
    const multipliers: any = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
    }
    const activityLevel = user?.activityLevel || 'moderate'
    const multiplier = multipliers[activityLevel] || 1.55
    const tdee = Math.round(bmr * multiplier)

    // Goal Adjustment
    // We infer the adjustment based on the final goal vs TDEE
    // Ideally this comes from backend, but we can reverse engineer or just show the difference
    const diff = caloriesGoal - tdee
    let goalText = "Maintenance"
    if (diff < -200) goalText = "Weight Loss (Deficit)"
    if (diff > 200) goalText = "Weight Gain (Surplus)"

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Calculator className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold">Kalkulasi Target Kalori</h3>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-emerald-100 text-sm">
                            Bagaimana Nutrify menghitung kebutuhan harianmu?
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* 1. BMR */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Basal Metabolic Rate (BMR)</span>
                                <span className="font-bold text-gray-900 dark:text-white">{Math.round(bmr)} kcal</span>
                            </div>
                            <div className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                                Energi yang dibutuhkan tubuhmu saat istirahat total. Dihitung berdasarkan berat ({weight}kg), tinggi ({height}cm), usia ({age}th), dan gender.
                            </div>
                        </div>

                        {/* 2. Activity */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium flex items-center gap-1">
                                    <Activity className="w-3 h-3" />
                                    Aktivitas ({activityLevel})
                                </span>
                                <span className="font-bold text-gray-900 dark:text-white">x {multiplier}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                                <span className="font-semibold text-gray-900 dark:text-white">TDEE (Total Energi)</span>
                                <span className="font-bold text-emerald-600">{tdee} kcal</span>
                            </div>
                        </div>

                        {/* 3. Goal Adjustment */}
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                    Goal
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{goalText}</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                        {diff > 0 ? '+' : ''}{diff} kcal dari TDEE
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-200/50 dark:border-emerald-800/30">
                                <span className="font-bold text-gray-600 dark:text-gray-300">Target Harianmu</span>
                                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{caloriesGoal} kcal</span>
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    )
}
