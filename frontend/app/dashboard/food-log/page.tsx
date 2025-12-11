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
                {/* Header - Minimalist */}
                <div className="pt-2 pb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Log Makanan</h1>
                    <p className="text-sm text-gray-500">Catat asupan harianmu</p>
                </div>

                {/* Date Selector - Floating & Clean */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm"
                >
                    <button
                        onClick={() => changeDate(-1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-600"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="text-center">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                            {isToday ? 'Hari Ini' : selectedDate.toLocaleDateString('id-ID', { weekday: 'long' })}
                        </p>
                        <p className="text-xs text-gray-500">
                            {selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    <button
                        onClick={() => changeDate(1)}
                        disabled={isToday}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-600 disabled:opacity-30"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </motion.div>

                {/* Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-5 text-white shadow-lg shadow-emerald-500/20"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-emerald-100" />
                            <span className="font-medium text-emerald-50">Total Kalori</span>
                        </div>
                        <span className="text-3xl font-bold tracking-tight">{summary.calories}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                            <p className="text-[10px] uppercase tracking-wider text-emerald-100 mb-1">Protein</p>
                            <p className="font-bold text-lg">{summary.protein}g</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                            <p className="text-[10px] uppercase tracking-wider text-emerald-100 mb-1">Karbo</p>
                            <p className="font-bold text-lg">{summary.carbs}g</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                            <p className="text-[10px] uppercase tracking-wider text-emerald-100 mb-1">Lemak</p>
                            <p className="font-bold text-lg">{summary.fat}g</p>
                        </div>
                    </div>
                </motion.div>

                {/* Food Logs - Containerless "Super App" Style */}
                <div className="space-y-6 pb-8">
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                        </div>
                                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                                    </div>
                                    <div className="h-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 animate-pulse" />
                                    <div className="h-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        (['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType, index) => {
                            const mealLogs = groupedLogs[mealType];
                            const mealTotal = mealLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
                            const MealIcon = mealType === 'breakfast' ? Sunrise :
                                mealType === 'lunch' ? Sun :
                                    mealType === 'dinner' ? Moon : Apple;

                            return (
                                <motion.div
                                    key={mealType}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 + index * 0.05 }}
                                >
                                    {/* Section Header - Clean & Simple */}
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                <MealIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white text-base capitalize">{getMealLabel(mealType)}</h3>
                                                {mealTotal > 0 && <span className="text-xs text-emerald-600 font-medium">{mealTotal} kkal</span>}
                                            </div>
                                        </div>
                                        <Link
                                            href={`/dashboard/food-log/add?meal=${mealType}`}
                                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors"
                                        >
                                            + Tambah
                                        </Link>
                                    </div>

                                    {/* List Items - Flat White Blocks */}
                                    <div className="space-y-2">
                                        {mealLogs.length === 0 ? (
                                            <div className="p-3 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl text-center">
                                                <p className="text-xs text-gray-400">Belum ada {getMealLabel(mealType).toLowerCase()}</p>
                                            </div>
                                        ) : (
                                            mealLogs.map((log) => (
                                                <div
                                                    key={log.id}
                                                    className="group relative bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-gray-50 dark:border-gray-700/50 flex items-start justify-between hover:border-emerald-100 transition-all"
                                                >
                                                    <div className="flex-1 min-w-0 mr-4">
                                                        <p className="font-semibold text-gray-900 dark:text-white truncate">{log.foodName}</p>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                                                                {log.calories} kkal
                                                            </span>
                                                            <span className="text-xs text-gray-500">{log.portion || '1 porsi'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Link href={`/dashboard/food-log/edit/${log.id}`} className="p-2 text-gray-300 hover:text-emerald-500 transition-colors">
                                                            <Edit2 className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(log.id)}
                                                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </div>
            </div>
        </>
    )
}
