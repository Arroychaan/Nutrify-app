'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Scale,
    Ruler,
    Target,
    TrendingDown,
    TrendingUp,
    Save,
    Loader2,
    Activity
} from 'lucide-react'
import { authApi } from '@/lib/api'
import Toast from '@/components/Toast'

export default function WeightSettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as any })
    const [formData, setFormData] = useState({
        heightCm: '',
        currentWeightKg: '',
        targetWeightKg: '',
        activityLevel: 'moderate'
    })

    useEffect(() => {
        loadUser()
    }, [])

    const loadUser = async () => {
        try {
            const res = await authApi.me()
            const user = res.data || res
            setFormData({
                heightCm: user.heightCm?.toString() || '',
                currentWeightKg: user.currentWeightKg?.toString() || '',
                targetWeightKg: user.targetWeightKg?.toString() || '',
                activityLevel: user.activityLevel || 'moderate'
            })
        } catch (error) {
            console.error('Failed to load user', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            await authApi.updateProfile({
                heightCm: formData.heightCm ? parseFloat(formData.heightCm) : undefined,
                currentWeightKg: formData.currentWeightKg ? parseFloat(formData.currentWeightKg) : undefined,
                targetWeightKg: formData.targetWeightKg ? parseFloat(formData.targetWeightKg) : undefined,
                activityLevel: formData.activityLevel
            })
            setToast({ isVisible: true, message: 'Data berhasil disimpan! ✅', type: 'success' })
        } catch (error: any) {
            setToast({
                isVisible: true,
                message: error.response?.data?.error?.message || 'Gagal menyimpan',
                type: 'error'
            })
        } finally {
            setSaving(false)
        }
    }

    const calculateBMI = () => {
        if (formData.heightCm && formData.currentWeightKg) {
            const heightM = parseFloat(formData.heightCm) / 100
            const weight = parseFloat(formData.currentWeightKg)
            return (weight / (heightM * heightM)).toFixed(1)
        }
        return '--'
    }

    const getWeightDiff = () => {
        if (formData.currentWeightKg && formData.targetWeightKg) {
            return (parseFloat(formData.currentWeightKg) - parseFloat(formData.targetWeightKg)).toFixed(1)
        }
        return null
    }

    const activityLevels = [
        { id: 'sedentary', label: 'Jarang Gerak', desc: 'Kerja kantoran, jarang olahraga' },
        { id: 'light', label: 'Ringan', desc: 'Olahraga 1-2x seminggu' },
        { id: 'moderate', label: 'Sedang', desc: 'Olahraga 3-5x seminggu' },
        { id: 'active', label: 'Aktif', desc: 'Olahraga harian' },
        { id: 'very_active', label: 'Sangat Aktif', desc: 'Atlet profesional' },
    ]

    if (loading) {
        return (
            <div className="max-w-xl mx-auto animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
            </div>
        )
    }

    const weightDiff = getWeightDiff()

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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Berat Badan & Target</h1>
                        <p className="text-sm text-gray-500">Atur data fisik dan target Anda</p>
                    </div>
                </div>

                {/* BMI Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm mb-1">BMI Anda</p>
                            <p className="text-4xl font-bold">{calculateBMI()}</p>
                        </div>
                        {weightDiff && (
                            <div className="text-right">
                                <p className="text-emerald-100 text-sm mb-1">Menuju Target</p>
                                <div className="flex items-center gap-2">
                                    {parseFloat(weightDiff) > 0 ? (
                                        <TrendingDown className="w-5 h-5" />
                                    ) : (
                                        <TrendingUp className="w-5 h-5" />
                                    )}
                                    <span className="text-2xl font-bold">{Math.abs(parseFloat(weightDiff))} kg</span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-5"
                >
                    {/* Height */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                            <Ruler className="w-4 h-4" /> Tinggi Badan (cm)
                        </label>
                        <input
                            type="number"
                            value={formData.heightCm}
                            onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-semibold"
                            placeholder="170"
                        />
                    </div>

                    {/* Current Weight */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                            <Scale className="w-4 h-4" /> Berat Saat Ini (kg)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.currentWeightKg}
                            onChange={(e) => setFormData({ ...formData, currentWeightKg: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-semibold"
                            placeholder="65.0"
                        />
                    </div>

                    {/* Target Weight */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                            <Target className="w-4 h-4" /> Target Berat (kg)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.targetWeightKg}
                            onChange={(e) => setFormData({ ...formData, targetWeightKg: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-semibold"
                            placeholder="60.0"
                        />
                    </div>

                    {/* Activity Level */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Tingkat Aktivitas
                        </label>
                        <div className="space-y-2">
                            {activityLevels.map((level) => (
                                <button
                                    key={level.id}
                                    onClick={() => setFormData({ ...formData, activityLevel: level.id })}
                                    className={`w-full p-3 rounded-xl text-left transition-all ${formData.activityLevel === level.id
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <p className="font-semibold">{level.label}</p>
                                    <p className={`text-xs ${formData.activityLevel === level.id ? 'text-emerald-100' : 'text-gray-500'}`}>
                                        {level.desc}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Save Button */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Simpan Perubahan
                        </>
                    )}
                </motion.button>
            </div>
        </>
    )
}
