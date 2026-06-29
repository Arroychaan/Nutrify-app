'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Utensils,
    Save,
    Loader2,
    Flame,
    Sunrise,
    Sun,
    Moon,
    Apple,
    Trash2
} from 'lucide-react'
import { foodLogApi, api } from '@/lib/api'
import Toast from '@/components/Toast'
import ConfirmDialog from '@/components/ConfirmDialog'

type PortionUnit = 'piring' | 'mangkok' | 'potong' | 'gelas' | 'gram' | 'ml' | 'buah' | 'sdm' | 'porsi';

export default function EditFoodLogPage() {
    const router = useRouter()
    const params = useParams()
    const logId = params.id as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as any })

    const [formData, setFormData] = useState({
        mealType: 'breakfast',
        foodName: '',
        portionSize: '',
        portionUnit: 'porsi' as PortionUnit,
        calories: '',
        proteinG: '',
        carbsG: '',
        fatG: '',
        notes: ''
    })

    const mealTypes = [
        { id: 'breakfast', label: 'Sarapan', icon: Sunrise, color: 'amber' },
        { id: 'lunch', label: 'Makan Siang', icon: Sun, color: 'orange' },
        { id: 'dinner', label: 'Makan Malam', icon: Moon, color: 'indigo' },
        { id: 'snack', label: 'Camilan', icon: Apple, color: 'emerald' },
    ]

    const portionUnits: { value: PortionUnit, label: string }[] = [
        { value: 'porsi', label: 'Porsi' },
        { value: 'piring', label: 'Piring' },
        { value: 'mangkok', label: 'Mangkok' },
        { value: 'potong', label: 'Potong' },
        { value: 'buah', label: 'Buah' },
        { value: 'gelas', label: 'Gelas' },
        { value: 'sdm', label: 'Sendok Makan' },
        { value: 'gram', label: 'Gram (g)' },
        { value: 'ml', label: 'Mililiter (ml)' },
    ];

    useEffect(() => {
        const loadFoodLog = async () => {
            try {
                setLoading(true)
                // Fetch the specific food log - we'll need to get it from the list and find by id
                const dateStr = new Date().toISOString().split('T')[0]
                const data = await foodLogApi.getByDate(dateStr)
                const logs = Array.isArray(data) ? data : data?.logs || []

                // Try to find the log in today's data
                let log = logs.find((l: any) => l.id === logId)

                // If not found in today, try fetching all recent logs
                if (!log) {
                    // Try last 7 days
                    for (let i = 1; i <= 7; i++) {
                        const pastDate = new Date()
                        pastDate.setDate(pastDate.getDate() - i)
                        const pastDateStr = pastDate.toISOString().split('T')[0]
                        const pastData = await foodLogApi.getByDate(pastDateStr)
                        const pastLogs = Array.isArray(pastData) ? pastData : pastData?.logs || []
                        log = pastLogs.find((l: any) => l.id === logId)
                        if (log) break
                    }
                }

                if (log) {
                    // Parse portion if possible
                    const portionParts = log.portion?.split(' ') || ['1', 'porsi']
                    const portionSize = portionParts[0] || '1'
                    const portionUnit = portionParts.slice(1).join(' ') || 'porsi'

                    setFormData({
                        mealType: log.mealType || 'breakfast',
                        foodName: log.foodName || '',
                        portionSize: portionSize,
                        portionUnit: portionUnit as PortionUnit,
                        calories: log.calories?.toString() || '',
                        proteinG: log.proteinG?.toString() || '',
                        carbsG: log.carbsG?.toString() || '',
                        fatG: log.fatG?.toString() || '',
                        notes: log.notes || ''
                    })
                } else {
                    setToast({ isVisible: true, message: 'Log makanan tidak ditemukan', type: 'error' })
                    setTimeout(() => router.push('/dashboard/food-log'), 1500)
                }
            } catch (error) {
                console.error('Failed to load food log', error)
                setToast({ isVisible: true, message: 'Gagal memuat data', type: 'error' })
            } finally {
                setLoading(false)
            }
        }

        if (logId) {
            loadFoodLog()
        }
    }, [logId, router])

    const handleSubmit = async () => {
        if (!formData.foodName) {
            setToast({ isVisible: true, message: 'Nama makanan wajib diisi!', type: 'error' })
            return
        }

        if (!formData.calories || !formData.portionSize) {
            setToast({ isVisible: true, message: 'Mohon lengkapi kalori dan porsi.', type: 'warning' })
            return
        }

        try {
            setSaving(true)

            const portionString = `${formData.portionSize} ${formData.portionUnit}`

            const updateData = {
                mealType: formData.mealType,
                foodName: formData.foodName,
                portion: portionString,
                calories: formData.calories ? parseInt(formData.calories) : 0,
                proteinG: formData.proteinG ? parseFloat(formData.proteinG) : 0,
                carbsG: formData.carbsG ? parseFloat(formData.carbsG) : 0,
                fatG: formData.fatG ? parseFloat(formData.fatG) : 0,
                notes: formData.notes
            }

            await foodLogApi.update(logId, updateData)
            setToast({ isVisible: true, message: 'Berhasil diperbarui! ✅', type: 'success' })

            setTimeout(() => {
                router.push('/dashboard/food-log')
            }, 1000)
        } catch (error: any) {
            console.error('Failed to update food log', error)
            setToast({
                isVisible: true,
                message: error.response?.data?.error?.message || 'Gagal memperbarui',
                type: 'error'
            })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        try {
            setDeleting(true)
            await foodLogApi.delete(logId)
            setToast({ isVisible: true, message: 'Log berhasil dihapus', type: 'success' })
            setTimeout(() => {
                router.push('/dashboard/food-log')
            }, 1000)
        } catch (error) {
            console.error('Failed to delete', error)
            setToast({ isVisible: true, message: 'Gagal menghapus', type: 'error' })
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-8 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                    <div className="space-y-2">
                        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="h-4 w-60 bg-gray-200 dark:bg-gray-800 rounded" />
                    </div>
                </div>
                <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
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

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Hapus Log Makanan?"
                message="Apakah Anda yakin ingin menghapus log makanan ini? Tindakan ini tidak dapat dibatalkan."
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                type="danger"
            />

            <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Makanan</h1>
                            <p className="text-sm text-gray-500">Perbarui detail asupan nutrisimu</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Meal Type Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <p className="text-sm font-medium text-gray-500 mb-3">Waktu Makan</p>
                    <div className="grid grid-cols-4 gap-2">
                        {mealTypes.map((meal) => {
                            const Icon = meal.icon
                            const isActive = formData.mealType === meal.id
                            return (
                                <button
                                    key={meal.id}
                                    onClick={() => setFormData({ ...formData, mealType: meal.id })}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${isActive
                                        ? `bg-${meal.color}-100 dark:bg-${meal.color}-900/30 text-${meal.color}-600 dark:text-${meal.color}-400 ring-2 ring-${meal.color}-500`
                                        : 'bg-gray-50 dark:bg-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-xs font-medium">{meal.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Food Details Form */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-5"
                >
                    {/* Food Name */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                            Nama Makanan <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.foodName}
                            onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="cth: Nasi Goreng Spesial"
                        />
                    </div>

                    {/* Portion */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                Jumlah Porsi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.portionSize}
                                onChange={(e) => setFormData({ ...formData, portionSize: e.target.value })}
                                placeholder="1"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                Satuan <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.portionUnit}
                                onChange={(e) => setFormData({ ...formData, portionUnit: e.target.value as any })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
                            >
                                {portionUnits.map(unit => (
                                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Nutrition Info */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                        <div className="flex items-center gap-2 mb-3">
                            <Flame className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Informasi Nutrisi</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Kalori (kcal)</label>
                                <input
                                    type="number"
                                    value={formData.calories}
                                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                                    placeholder="0"
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-center font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Protein (g)</label>
                                <input
                                    type="number"
                                    value={formData.proteinG}
                                    onChange={(e) => setFormData({ ...formData, proteinG: e.target.value })}
                                    placeholder="0"
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-center font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Karbo (g)</label>
                                <input
                                    type="number"
                                    value={formData.carbsG}
                                    onChange={(e) => setFormData({ ...formData, carbsG: e.target.value })}
                                    placeholder="0"
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-center font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Lemak (g)</label>
                                <input
                                    type="number"
                                    value={formData.fatG}
                                    onChange={(e) => setFormData({ ...formData, fatG: e.target.value })}
                                    placeholder="0"
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-center font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                            Catatan (opsional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                            placeholder="Tambahkan catatan..."
                        />
                    </div>
                </motion.div>

                {/* Submit Button */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 md:static md:bg-transparent md:border-none">
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={handleSubmit}
                        disabled={saving}
                        className="w-full max-w-2xl mx-auto py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/25 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]"
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
            </div>
        </>
    )
}
