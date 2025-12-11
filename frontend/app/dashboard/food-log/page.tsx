'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    ArrowLeft,
    Utensils,
    Plus,
    Trash2,
    Edit2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Sunrise,
    Sun,
    Moon,
    Apple,
    Flame,
    Search
} from 'lucide-react'
import { foodLogApi } from '@/lib/api'
import Toast from '@/components/Toast'

interface FoodLog {
    id: string
    mealType: string
    foodName: string
    portion?: string
    calories?: number
    proteinG?: number
    carbsG?: number
    fatG?: number
    createdAt: string
}

export default function FoodLogPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [logs, setLogs] = useState<FoodLog[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [summary, setSummary] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 })
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as any })
    const [deleting, setDeleting] = useState<string | null>(null)

    useEffect(() => {
        loadLogs()
    }, [selectedDate])

    const loadLogs = async () => {
        try {
            setLoading(true)
            const dateStr = selectedDate.toISOString().split('T')[0]
            const data = await foodLogApi.getByDate(dateStr)
            setLogs(Array.isArray(data) ? data : data?.logs || [])

            // Calculate summary with proper number conversion
            const logsArray = Array.isArray(data) ? data : data?.logs || []
            const totals = logsArray.reduce((acc: any, log: FoodLog) => ({
                calories: acc.calories + (Number(log.calories) || 0),
                protein: acc.protein + (Number(log.proteinG) || 0),
                carbs: acc.carbs + (Number(log.carbsG) || 0),
                fat: acc.fat + (Number(log.fatG) || 0),
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
            setSummary({
                calories: Math.round(totals.calories),
                protein: Math.round(totals.protein),
                carbs: Math.round(totals.carbs),
                fat: Math.round(totals.fat * 10) / 10, // Keep 1 decimal for fat
            })
        } catch (error) {
            console.error('Failed to load food logs', error)
            setLogs([])
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus log makanan ini?')) return
        try {
            setDeleting(id)
            await foodLogApi.delete(id)
            setToast({ isVisible: true, message: 'Log makanan berhasil dihapus', type: 'success' })
            loadLogs()
        } catch (error) {
            setToast({ isVisible: true, message: 'Gagal menghapus log makanan', type: 'error' })
        } finally {
            setDeleting(null)
        }
    }

    const changeDate = (days: number) => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() + days)
        setSelectedDate(newDate)
    }

    const isToday = selectedDate.toDateString() === new Date().toDateString()

    const getMealIcon = (mealType: string) => {
        switch (mealType) {
            case 'breakfast': return <Sunrise className="w-5 h-5 text-amber-500" />
            case 'lunch': return <Sun className="w-5 h-5 text-orange-500" />
            case 'dinner': return <Moon className="w-5 h-5 text-indigo-500" />
            case 'snack': return <Apple className="w-5 h-5 text-emerald-500" />
            default: return <Utensils className="w-5 h-5 text-gray-500" />
        }
    }

    const getMealLabel = (mealType: string) => {
        switch (mealType) {
            case 'breakfast': return 'Sarapan'
            case 'lunch': return 'Makan Siang'
            case 'dinner': return 'Makan Malam'
            case 'snack': return 'Camilan'
            default: return mealType
        }
    }

    const groupedLogs = {
        breakfast: logs.filter(l => l.mealType === 'breakfast'),
        lunch: logs.filter(l => l.mealType === 'lunch'),
        dinner: logs.filter(l => l.mealType === 'dinner'),
        snack: logs.filter(l => l.mealType === 'snack'),
    }

    return (
        <>
            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />

            <div className="max-w-3xl mx-auto space-y-6 pb-24 md:pb-8">
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
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Log Makanan</h1>
                            <p className="text-sm text-gray-500">Catat asupan harianmu</p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/food-log/add"
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/25"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Tambah</span>
                    </Link>
                </div>

                {/* Date Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between"
                >
                    <button
                        onClick={() => changeDate(-1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="text-center">
                        <p className="font-bold text-gray-900 dark:text-white">
                            {isToday ? 'Hari Ini' : selectedDate.toLocaleDateString('id-ID', { weekday: 'long' })}
                        </p>
                        <p className="text-sm text-gray-500">
                            {selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    <button
                        onClick={() => changeDate(1)}
                        disabled={isToday}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-30"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </motion.div>

                {/* Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5" />
                            <span className="font-medium">Total Hari Ini</span>
                        </div>
                        <span className="text-3xl font-bold">{summary.calories} kkal</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                            <p className="text-xs opacity-80">Protein</p>
                            <p className="font-bold">{summary.protein}g</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                            <p className="text-xs opacity-80">Karbo</p>
                            <p className="font-bold">{summary.carbs}g</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                            <p className="text-xs opacity-80">Lemak</p>
                            <p className="font-bold">{summary.fat}g</p>
                        </div>
                    </div>
                </motion.div>

                {/* Food Logs by Meal Type */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType, index) => (
                            <motion.div
                                key={mealType}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                            >
                                {/* Meal Header */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mealType === 'breakfast' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                            mealType === 'lunch' ? 'bg-orange-100 dark:bg-orange-900/30' :
                                                mealType === 'dinner' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                                                    'bg-emerald-100 dark:bg-emerald-900/30'
                                            }`}>
                                            {getMealIcon(mealType)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{getMealLabel(mealType)}</p>
                                            <p className="text-xs text-gray-500">
                                                {groupedLogs[mealType].reduce((sum, l) => sum + (l.calories || 0), 0)} kkal
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/dashboard/food-log/add?meal=${mealType}`}
                                        className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl text-gray-500 hover:text-emerald-600 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </Link>
                                </div>

                                {/* Food Items */}
                                {groupedLogs[mealType].length === 0 ? (
                                    <div className="p-4 text-center text-gray-400 text-sm">
                                        Belum ada makanan tercatat
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {groupedLogs[mealType].map((log) => (
                                            <div
                                                key={log.id}
                                                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 dark:text-white">{log.foodName}</p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                        {log.portion && <span>{log.portion}</span>}
                                                        <span>{log.calories || 0} kkal</span>
                                                        {log.proteinG && <span>P: {log.proteinG}g</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Link
                                                        href={`/dashboard/food-log/edit/${log.id}`}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(log.id)}
                                                        disabled={deleting === log.id}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
