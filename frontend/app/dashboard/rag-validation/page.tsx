'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { Loader2, CheckCircle, AlertTriangle, XCircle, FileText, Activity, User, Utensils, Scale, BookOpen } from 'lucide-react'
import { authApi, foodLogApi } from '@/lib/api'
import axios from 'axios'
import { clsx } from 'clsx'

// Types
interface ComplianceMetric {
    nutrient: string;
    aiValue: number;
    referenceValue: number;
    deviation: number;
    score: number;
    status: string;
    source?: string;
}

interface ComplianceResult {
    score: number;
    status: 'compliant' | 'non_compliant' | 'warning';
    details: string;
    recommendations: string[];
    sourceDocument: string;
    metrics: ComplianceMetric[];
}

export default function RagValidationPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<ComplianceResult | null>(null)

    // Initialize with empty defaults, will be populated by effect
    const [userProfile, setUserProfile] = useState({
        age: 0,
        gender: 'male',
        currentWeightKg: 0,
        heightCm: 0,
        activityLevel: 'moderate',
        medicalConditions: 'Healthy'
    })

    const [mealPlan, setMealPlan] = useState({
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0
    })

    // Load actual user data and daily targets
    useEffect(() => {
        const loadData = async () => {
            try {
                const [userRes, summaryRes] = await Promise.all([
                    authApi.me(),
                    foodLogApi.getTodaySummary()
                ])

                const user = userRes.data || userRes
                const summary = summaryRes?.data || summaryRes || {}

                // Populate User Profile
                if (user) {
                    // Calculate age from DOB if available, else default
                    let age = 25
                    if (user.dateOfBirth) {
                        const dob = new Date(user.dateOfBirth)
                        const diffMs = Date.now() - dob.getTime()
                        const ageDt = new Date(diffMs)
                        age = Math.abs(ageDt.getUTCFullYear() - 1970)
                    }

                    setUserProfile({
                        age,
                        gender: user.gender || 'male',
                        currentWeightKg: Number(user.currentWeightKg) || 70,
                        heightCm: Number(user.heightCm) || 170,
                        activityLevel: user.activityLevel || 'moderate',
                        medicalConditions: user.medicalConditions?.join(', ') || 'Healthy'
                    })
                }

                // Populate Meal Plan targets based on Dashboard Logic
                // If summary has calorieTarget, use that. Otherwise 2000.
                const targetCals = summary.calorieTarget ? Number(summary.calorieTarget) : 2000

                // Calculate targets same as Dashboard
                setMealPlan({
                    totalCalories: targetCals,
                    totalProtein: Math.round((Number(user.currentWeightKg) || 65) * 1.6), // Standard protein formula used in Dashboard
                    totalCarbs: Math.round(targetCals * 0.5 / 4), // 50% carbs
                    totalFat: Math.round(targetCals * 0.25 / 9)   // 25% fat
                })

            } catch (error) {
                console.error('Failed to load user data for validation', error)
            }
        }
        loadData()
    }, [])

    const handleValidate = async () => {
        setLoading(true)
        setResult(null)
        try {
            const profileToSend = {
                ...userProfile,
                medicalConditions: userProfile.medicalConditions.split(',').map(s => s.trim())
            }

            // Use the test route we enabled
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/test/validation/rag`

            const response = await axios.post(apiUrl, {
                userProfile: profileToSend,
                mealPlan
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.data.success) {
                setResult(response.data.result)
            }
        } catch (error: any) {
            console.error('Validation Error:', error)
            alert(error.response?.data?.error || 'Validation failed. Ensure backend is running.')
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase()
        if (s.includes('sesuai') && !s.includes('tidak') && !s.includes('cukup')) return 'text-emerald-500 bg-emerald-50 border-emerald-200'
        if (s.includes('cukup sesuai')) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        if (s.includes('compliant') && !s.includes('non')) return 'text-emerald-500 bg-emerald-50 border-emerald-200'
        return 'text-red-500 bg-red-50 border-red-200'
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 p-8 shadow-2xl text-white">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        <BookOpen className="w-8 h-8" />
                        RAG Knowledge Validation
                    </h1>
                    <p className="text-emerald-100 max-w-2xl text-lg opacity-90">
                        Verify AI reasoning against "Permenkes RI No. 28 Tahun 2019" Ground Truth.
                        This tool demonstrates the correct implementation of the Retrieval-Augmented Generation system.
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* INPUT: User Profile */}
                <GlassCard className="p-6 space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <User className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">User Profile</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">Age (Years)</label>
                            <input
                                type="number"
                                value={userProfile.age}
                                onChange={e => setUserProfile({ ...userProfile, age: Number(e.target.value) })}
                                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-semibold text-gray-700 dark:text-gray-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">Gender</label>
                            <select
                                value={userProfile.gender}
                                onChange={e => setUserProfile({ ...userProfile, gender: e.target.value })}
                                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-semibold text-gray-700 dark:text-gray-200"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">Weight (kg)</label>
                            <input
                                type="number"
                                value={userProfile.currentWeightKg}
                                onChange={e => setUserProfile({ ...userProfile, currentWeightKg: Number(e.target.value) })}
                                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-semibold text-gray-700 dark:text-gray-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">Height (cm)</label>
                            <input
                                type="number"
                                value={userProfile.heightCm}
                                onChange={e => setUserProfile({ ...userProfile, heightCm: Number(e.target.value) })}
                                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-semibold text-gray-700 dark:text-gray-200"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-xs font-medium text-gray-500">Activity Level</label>
                            <select
                                value={userProfile.activityLevel}
                                onChange={e => setUserProfile({ ...userProfile, activityLevel: e.target.value })}
                                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-semibold text-gray-700 dark:text-gray-200"
                            >
                                <option value="sedentary">Sedentary</option>
                                <option value="moderate">Moderate</option>
                                <option value="active">Active</option>
                                <option value="very_active">Very Active</option>
                            </select>
                        </div>
                    </div>
                </GlassCard>

                {/* INPUT: Meal Plan */}
                <GlassCard className="p-6 space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Proposed Meal Plan</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">Total Calories (kcal)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={mealPlan.totalCalories}
                                    onChange={e => setMealPlan({ ...mealPlan, totalCalories: Number(e.target.value) })}
                                    className="w-full p-2.5 pl-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-800 dark:text-gray-100"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">kcal</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">Protein (g)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={mealPlan.totalProtein}
                                    onChange={e => setMealPlan({ ...mealPlan, totalProtein: Number(e.target.value) })}
                                    className="w-full p-2.5 pl-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-semibold text-gray-700 dark:text-gray-200"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">g</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">Carbs (g)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={mealPlan.totalCarbs}
                                    onChange={e => setMealPlan({ ...mealPlan, totalCarbs: Number(e.target.value) })}
                                    className="w-full p-2.5 pl-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-semibold text-gray-700 dark:text-gray-200"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">g</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">Fat (g)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={mealPlan.totalFat}
                                    onChange={e => setMealPlan({ ...mealPlan, totalFat: Number(e.target.value) })}
                                    className="w-full p-2.5 pl-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-semibold text-gray-700 dark:text-gray-200"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">g</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="flex justify-center py-4">
                <GradientButton
                    onClick={handleValidate}
                    isLoading={loading}
                    className="w-full max-w-md h-14 text-lg shadow-xl shadow-emerald-500/20"
                >
                    <Activity className="mr-2 w-5 h-5" />
                    Validate Ground Truth
                </GradientButton>
            </div>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >

                        {/* Main Score Result */}
                        <GlassCard className="p-8 border-l-8 border-l-emerald-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full" />

                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full border-8 border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center bg-white dark:bg-gray-800 shadow-inner">
                                        <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                                            {result.score}
                                        </span>
                                    </div>
                                    {result.score >= 90 && (
                                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                                            <CheckCircle className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {result.status === 'compliant' ? 'Fully Compliant ✅' : 'Review Needed ⚠️'}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                                        {result.details}
                                    </p>
                                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-500">
                                        <FileText className="w-4 h-4" />
                                        Source: {result.sourceDocument}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Metrics Breakdown */}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white px-2">Nutrient Compliance Breakdown</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {result.metrics?.map((metric, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <GlassCard className="p-5 h-full hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-800 dark:text-white">{metric.nutrient}</h4>
                                                <span className={clsx(
                                                    "text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider mt-1 inline-block",
                                                    getStatusColor(metric.status)
                                                )}>
                                                    {metric.status}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-black text-gray-900 dark:text-white">
                                                    {(metric.score).toFixed(0)}<span className="text-sm font-normal text-gray-400">/100</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                                <span className="text-sm text-gray-500">AI Value</span>
                                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                                                    {metric.aiValue}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                                <span className="text-sm text-gray-500">Reference (AKG)</span>
                                                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-lg">
                                                    {metric.referenceValue}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Deviation</span>
                                                <span className={clsx("font-mono font-bold text-lg", metric.deviation > 0.2 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300')}>
                                                    {(metric.deviation * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>

                                        {metric.source && (
                                            <p className="mt-4 text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
                                                Ref: {metric.source}
                                            </p>
                                        )}
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
