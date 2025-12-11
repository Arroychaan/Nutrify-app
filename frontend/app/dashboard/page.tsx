'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Flame,
    Droplets,
    Plus,
    Weight,
    ChevronRight,
    Sunrise,
    Sun,
    Moon,
    Apple,
    Camera,
    Utensils,
    Sparkles
} from 'lucide-react'
import { authApi, foodLogApi } from '@/lib/api'

interface DashboardData {
    user: any
    todayLogs: any[]
    stats: {
        calories: number
        caloriesGoal: number
        protein: number
        proteinGoal: number
        carbs: number
        carbsGoal: number
        fat: number
        fatGoal: number
    }
}

const dailyTips = [
    { title: "Makan Perlahan", tip: "Kunyah makanan 20-30 kali sebelum menelan untuk pencernaan yang lebih baik." },
    { title: "Sarapan Berprotein", tip: "Protein di pagi hari membantu menjaga rasa kenyang lebih lama." },
    { title: "Sayur Setiap Makan", tip: "Tambahkan sayuran di setiap porsi makan untuk serat dan vitamin." },
]

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [waterCount, setWaterCount] = useState(0)
    const [dailyTip] = useState(() => dailyTips[Math.floor(Math.random() * dailyTips.length)])

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0]
        const savedWater = localStorage.getItem(`water_${today}`)
        if (savedWater) setWaterCount(parseInt(savedWater, 10))
    }, [])

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            const [userRes, todayRes] = await Promise.all([
                authApi.me().catch(() => ({ data: { fullName: 'Pengguna', currentWeightKg: 65 } })),
                foodLogApi.getTodaySummary().catch(() => null)
            ])

            const user = userRes.data || userRes
            const caloriesGoal = todayRes?.calorieTarget || 2000

            setData({
                user,
                todayLogs: todayRes?.logs || [],
                stats: {
                    calories: todayRes?.totalCalories || 0,
                    caloriesGoal,
                    protein: todayRes?.totalProtein || 0,
                    proteinGoal: Math.round((user.currentWeightKg || 65) * 1.6),
                    carbs: todayRes?.totalCarbs || 0,
                    carbsGoal: Math.round(caloriesGoal * 0.5 / 4),
                    fat: todayRes?.totalFat || 0,
                    fatGoal: Math.round(caloriesGoal * 0.25 / 9),
                }
            })
        } catch (e) {
            console.error('Dashboard load error', e)
        } finally {
            setLoading(false)
        }
    }

    const addWater = () => {
        const newCount = Math.min(waterCount + 1, 8)
        setWaterCount(newCount)
        const today = new Date().toISOString().split('T')[0]
        localStorage.setItem(`water_${today}`, newCount.toString())
    }

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse p-1">
                <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                <div className="h-44 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            </div>
        )
    }

    const firstName = data?.user?.fullName?.split(' ')[0] || 'Teman'
    const caloriesRemaining = Math.max(0, (data?.stats.caloriesGoal || 0) - (data?.stats.calories || 0))

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 11) return 'Selamat Pagi'
        if (hour < 15) return 'Selamat Siang'
        if (hour < 18) return 'Selamat Sore'
        return 'Selamat Malam'
    }

    const mealTypes = [
        { key: 'breakfast', icon: Sunrise, title: 'Sarapan', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        { key: 'lunch', icon: Sun, title: 'Makan Siang', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10' },
        { key: 'dinner', icon: Moon, title: 'Makan Malam', color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-500/10' },
        { key: 'snack', icon: Apple, title: 'Camilan', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    ]

    return (
        <div className="space-y-6 pb-24 md:pb-6">
            {/* Header - Simple & Clean */}
            <div className="pt-2">
                <p className="text-gray-500 dark:text-gray-400 text-sm">{getGreeting()},</p>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{firstName}! 👋</h1>
                <p className="text-xs text-gray-400 mt-1">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>

            {/* Calorie Card - Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-5 text-white"
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-emerald-100 text-xs font-medium">Kalori Hari Ini</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-4xl font-bold">{data?.stats.calories || 0}</span>
                            <span className="text-emerald-200 text-sm">/ {data?.stats.caloriesGoal} kkal</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-emerald-100 text-xs">Sisa</p>
                        <p className="text-2xl font-bold">{caloriesRemaining}</p>
                    </div>
                </div>

                {/* Progress */}
                <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-4">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((data?.stats.calories || 0) / (data?.stats.caloriesGoal || 1)) * 100, 100)}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-white rounded-full"
                    />
                </div>

                {/* Macros - Inline */}
                <div className="flex justify-between">
                    <MacroItem label="Protein" value={data?.stats.protein || 0} goal={data?.stats.proteinGoal || 80} />
                    <MacroItem label="Karbo" value={data?.stats.carbs || 0} goal={data?.stats.carbsGoal || 250} />
                    <MacroItem label="Lemak" value={data?.stats.fat || 0} goal={data?.stats.fatGoal || 55} />
                </div>
            </motion.div>

            {/* Quick Actions - Horizontal Scroll Style */}
            {/* Quick Actions - Centered Grid */}
            <div className="grid grid-cols-4 gap-4 px-2 mb-6">
                <QuickAction href="/dashboard/food-log/add" icon={Plus} label="Catat" color="bg-emerald-500" />
                <QuickAction href="/dashboard/food-log/photo" icon={Camera} label="Foto" color="bg-emerald-600" />
                <QuickAction href="/dashboard/chat" icon={Sparkles} label="AI Chat" color="bg-teal-600" />
                <QuickAction href="/dashboard/settings/weight" icon={Weight} label="Timbang" color="bg-green-600" />
            </div>

            {/* Food Log Section - Simplified UI */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-emerald-500" />
                        Log Makan
                    </h2>
                    <Link href="/dashboard/food-log" className="text-xs text-emerald-600 font-medium flex items-center hover:underline">
                        Lihat Semua <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="space-y-1">
                    {mealTypes.map((meal) => {
                        const items = data?.todayLogs?.filter(log => log.mealType === meal.key) || []
                        const totalCal = items.reduce((sum, item) => sum + (item.calories || 0), 0)
                        const Icon = meal.icon

                        return (
                            <Link
                                key={meal.key}
                                href={`/dashboard/food-log/add?meal=${meal.key}`}
                                className="flex items-center justify-between p-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 rounded-xl group transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 ${meal.bg} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <Icon className={`w-5 h-5 ${meal.color}`} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">{meal.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {items.length > 0 ? `${items.length} item • ${totalCal} kkal` : 'Belum ada'}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-200 group-hover:text-emerald-600 group-hover:bg-emerald-100 transition-all">
                                    <Plus className="w-5 h-5" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Water & Streak Row */}
            <div className="grid grid-cols-2 gap-3">
                {/* Water */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <Droplets className="w-5 h-5 text-emerald-500" />
                        <span className="text-xs text-gray-500 font-medium">{waterCount}/8</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Air Minum</p>
                    <div className="flex gap-1 mb-3">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-colors ${i < waterCount ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={addWater}
                        disabled={waterCount >= 8}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                        {waterCount >= 8 ? '✓ Tercapai' : '+ Tambah'}
                    </button>
                </div>

                {/* Streak */}
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-4 text-white">
                    <Flame className="w-5 h-5 mb-3" />
                    <p className="text-xs text-emerald-100 mb-1">Streak</p>
                    <p className="text-3xl font-bold">{data?.user?.streakDays || 0}</p>
                    <p className="text-xs text-emerald-200">hari berturut</p>
                </div>
            </div>

            {/* Daily Tip - Minimal */}
            <div className="bg-emerald-950 rounded-2xl p-4 text-white">
                <div className="flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                        <p className="font-semibold text-sm mb-1">{dailyTip.title}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{dailyTip.tip}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MacroItem({ label, value, goal }: { label: string; value: number; goal: number }) {
    return (
        <div className="text-center">
            <p className="text-emerald-100 text-[10px] mb-0.5">{label}</p>
            <p className="font-semibold text-sm">{value}<span className="text-emerald-200 text-xs">/{goal}g</span></p>
        </div>
    )
}

function QuickAction({ href, icon: Icon, label, color }: { href: string; icon: any; label: string; color: string }) {
    return (
        <Link href={href} className="flex flex-col items-center gap-2 min-w-[72px]">
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
        </Link>
    )
}
