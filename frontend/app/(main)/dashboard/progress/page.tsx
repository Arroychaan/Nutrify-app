'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, ArrowLeft, Activity, Info, Plus, TrendingUp, ArrowDown, LineChart as LineChartIcon, Share2 } from 'lucide-react'
import Link from 'next/link'
import { generateAndShareImage } from '@/lib/utils/share-service'
import { GlassCard } from '@/components/ui/GlassCard'
import { authApi, biomarkerApi } from '@/lib/api'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

export default function ProgressPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [history, setHistory] = useState<any[]>([])
    const [showLogModal, setShowLogModal] = useState(false)
    const [weightInput, setWeightInput] = useState('')
    const [activeTab, setActiveTab] = useState('weight')
    const [isSharing, setIsSharing] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [userData, historyData] = await Promise.all([
                authApi.me().then(res => res.data || res),
                biomarkerApi.getWeightHistory().catch(() => [])
            ])
            setUser(userData)

            // Process history data for Chart
            // 1. Sort by date ascending
            const sortedRaw = (historyData || []).sort((a: any, b: any) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())

            // 2. Group by date and take the last entry for each day (latest)
            const dailyMap = new Map()
            sortedRaw.forEach((h: any) => {
                const dateStr = new Date(h.recordedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                dailyMap.set(dateStr, {
                    date: dateStr,
                    fullDate: new Date(h.recordedAt),
                    weight: Number(h.weightKg)
                })
            })

            const formattedHistory = Array.from(dailyMap.values())

            // If no history but user has current weight, add it as a point
            if (formattedHistory.length === 0 && userData?.currentWeightKg) {
                formattedHistory.push({
                    date: 'Hari Ini',
                    fullDate: new Date(),
                    weight: Number(userData.currentWeightKg)
                })
            }

            // Fix for chart: If only 1 point, AreaChart won't render. 
            // Add a "Start" point identical to the first point to show a flat line (baseline).
            if (formattedHistory.length === 1) {
                const first = formattedHistory[0]
                const prevDate = new Date(first.fullDate)
                prevDate.setDate(prevDate.getDate() - 1) // 1 day before

                formattedHistory.unshift({
                    date: 'Awal',
                    fullDate: prevDate,
                    weight: first.weight
                })
            }

            setHistory(formattedHistory)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogWeight = async () => {
        if (!weightInput) return
        try {
            await biomarkerApi.logWeight({ weightKg: parseFloat(weightInput) })
            await loadData() // Reload all data
            setShowLogModal(false)
            setWeightInput('')
        } catch (error) {
            console.error('Failed to log weight', error)
        }
    }

    const handleShare = async () => {
        try {
            setIsSharing(true)
            await generateAndShareImage('progress-content', 'nutrify-progress')
        } catch (error) {
            console.error('Error sharing:', error)
        } finally {
            setIsSharing(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-4">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
            </div>
        )
    }

    if (!user) return <div className="p-8 text-center">Gagal memuat data.</div>

    const weight = user.currentWeightKg || 0
    const heightCm = user.heightCm || 0
    const heightM = heightCm / 100
    const bmi = heightM > 0 ? (weight / (heightM * heightM)).toFixed(1) : '0'
    const bmiNum = parseFloat(bmi as string)

    // BMI Calculation
    let bmiStatus = 'Normal'
    let bmiColor = '#10B981' // emerald-500
    let bmiBg = 'bg-emerald-100 dark:bg-emerald-900/30'
    let bmiTextColor = 'text-emerald-600 dark:text-emerald-400'

    if (bmiNum < 18.5) {
        bmiStatus = 'Kurang Berat Badan'
        bmiColor = '#3B82F6' // blue-500
        bmiBg = 'bg-blue-100 dark:bg-blue-900/30'
        bmiTextColor = 'text-blue-600 dark:text-blue-400'
    } else if (bmiNum >= 25 && bmiNum < 29.9) {
        bmiStatus = 'Kelebihan Berat Badan'
        bmiColor = '#F59E0B' // amber-500
        bmiBg = 'bg-amber-100 dark:bg-amber-900/30'
        bmiTextColor = 'text-amber-600 dark:text-amber-400'
    } else if (bmiNum >= 30) {
        bmiStatus = 'Obesitas'
        bmiColor = '#EF4444' // red-500
        bmiBg = 'bg-red-100 dark:bg-red-900/30'
        bmiTextColor = 'text-red-600 dark:text-red-400'
    }

    // Chart Data
    // Ensure we sort by date
    const chartData = [...history].sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())

    // Calculate Stats
    const startWeight = chartData.length > 0 ? chartData[0].weight : weight
    const currentWeight = chartData.length > 0 ? chartData[chartData.length - 1].weight : weight
    const weightDiff = (currentWeight - startWeight).toFixed(1)
    const isWeightLoss = Number(weightDiff) < 0

    return (
        <div className="max-w-4xl mx-auto pb-24 md:pb-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <LineChartIcon className="w-8 h-8 text-emerald-500" />
                                Progress Tracker
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                                Pantau perjalanan kesehatan Anda
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
                        >
                            <Share2 className="w-4 h-4" />
                            {isSharing ? 'Memproses...' : 'Bagikan'}
                        </button>
                        <button
                            onClick={() => setShowLogModal(true)}
                            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Update Berat
                        </button>
                    </div>
                </div>

                {/* Main Grid */}
                <div id="progress-content" className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1">

                    {/* Left Column: Stats & BMI */}
                    <div className="space-y-6">
                        {/* Current Weight Card */}
                        <GlassCard className="p-6 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-gray-500 mb-1">Berat Badan Saat Ini</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{weight}</span>
                                    <span className="text-gray-500">kg</span>
                                </div>
                                <div className={`text-sm mt-2 px-3 py-1 rounded-lg inline-flex items-center gap-1 ${isWeightLoss ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {isWeightLoss ? <ArrowDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                    <span>{Math.abs(Number(weightDiff))} kg</span>
                                    <span className="opacity-75 text-xs ml-1">sejak awal</span>
                                </div>
                            </div>
                            <div className="absolute right-[-20px] top-[-20px] opacity-5">
                                <Activity className="w-32 h-32" />
                            </div>
                        </GlassCard>

                        {/* BMI Card */}
                        <GlassCard className="p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">Indeks Massa Tubuh (BMI)</h3>

                            <div className="flex items-center justify-between mb-2">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">{bmi}</span>
                                <span className={`text-sm font-bold px-3 py-1 rounded-full ${bmiBg} ${bmiTextColor}`}>
                                    {bmiStatus}
                                </span>
                            </div>

                            {/* Visual BMI Meter */}
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex mt-4">
                                <div className="h-full bg-blue-400 w-[18.5%]" title="Underweight" />
                                <div className="h-full bg-emerald-400 w-[25%]" title="Normal" />
                                <div className="h-full bg-amber-400 w-[15%]" title="Overweight" />
                                <div className="h-full bg-red-400 flex-1" title="Obese" />
                            </div>
                            {/* Indicator Arrow */}
                            <div className="relative h-4 mt-1">
                                <div
                                    className="absolute transform -translate-x-1/2 transition-all duration-500"
                                    style={{
                                        left: `${(() => {
                                            if (bmiNum < 18.5) {
                                                return (bmiNum / 18.5) * 18.5
                                            } else if (bmiNum < 25) {
                                                return 18.5 + ((bmiNum - 18.5) / 6.5) * 25
                                            } else if (bmiNum < 30) {
                                                return 43.5 + ((bmiNum - 25) / 5) * 15
                                            } else {
                                                return Math.min(58.5 + ((bmiNum - 30) / 10) * 41.5, 100)
                                            }
                                        })()}%`
                                    }}
                                >
                                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-gray-800 dark:border-b-white" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                Normal: 18.5 - 25.0
                            </p>
                        </GlassCard>
                    </div>

                    {/* Right Column: Chart */}
                    <div className="lg:col-span-2">
                        <GlassCard className="p-6 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    Riwayat Perjalanan
                                </h3>
                                {/* Simple toggle if we add more metrics later */}
                                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                    <button className="px-3 py-1 text-xs font-bold bg-white dark:bg-gray-700 shadow-sm rounded-md text-gray-900 dark:text-white">
                                        Berat Badan
                                    </button>
                                </div>
                            </div>

                            <div className="w-full h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            domain={['dataMin - 2', 'dataMax + 2']}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                            itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                                            labelStyle={{ color: '#6B7280', marginBottom: '4px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="weight"
                                            stroke="#10B981"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorWeight)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </motion.div>

            {/* Log Weight Modal */}
            <AnimatePresence>
                {showLogModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowLogModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Update Berat Badan</h3>
                            <p className="text-sm text-gray-500 mb-6">Catat berat badan Anda hari ini untuk memantau progress.</p>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Berat Badan (kg)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={weightInput}
                                        onChange={e => setWeightInput(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg"
                                        placeholder="0.0"
                                        autoFocus
                                    />
                                    <span className="absolute right-4 top-3.5 text-gray-400 font-medium">kg</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogModal(false)}
                                    className="flex-1 py-3 rounded-xl font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleLogWeight}
                                    disabled={!weightInput}
                                    className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Simpan
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}


