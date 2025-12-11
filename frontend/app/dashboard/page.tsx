'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
    Activity,
    Utensils,
    MessageSquare,
    ChevronRight,
    Flame,
    Droplets,
    Plus,
    Minus,
    Camera,
    Scale,
    TrendingUp,
    TrendingDown,
    Footprints,
    Zap,
    Target,
    Award,
    Lightbulb,
    Sunrise,
    Sun,
    Moon,
    Apple,
    BarChart3,
    ScanLine,
    Heart
} from 'lucide-react'
import { authApi, foodLogApi } from '@/lib/api'

// Types
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
        water: number
        waterGoal: number
        streak: number
        steps: number
        stepsGoal: number
        caloriesBurned: number
    }
}

// Daily tips rotation
const dailyTips = [
    { title: "Minum Air Putih", tip: "Mulai hari dengan segelas air hangat untuk membangunkan metabolisme tubuh.", category: "Hidrasi" },
    { title: "Makan Perlahan", tip: "Kunyah makanan 20-30 kali sebelum menelan untuk pencernaan yang lebih baik.", category: "Kebiasaan" },
    { title: "Sarapan Berprotein", tip: "Protein di pagi hari membantu menjaga rasa kenyang lebih lama.", category: "Nutrisi" },
    { title: "Sayur Setiap Makan", tip: "Tambahkan sayuran di setiap porsi makan untuk serat dan vitamin.", category: "Nutrisi" },
    { title: "Tidur Cukup", tip: "Kurang tidur dapat meningkatkan hormon lapar dan keinginan makan berlebih.", category: "Kesehatan" },
]

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [waterCount, setWaterCount] = useState(0)
    const [showWaterCelebration, setShowWaterCelebration] = useState(false)
    const [dailyTip] = useState(() => dailyTips[Math.floor(Math.random() * dailyTips.length)])

    // Load water count from localStorage on mount
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0]
        const savedWater = localStorage.getItem(`water_${today}`)
        if (savedWater) {
            setWaterCount(parseInt(savedWater, 10))
        }
    }, [])

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            const [userRes, todayRes] = await Promise.all([
                authApi.me().catch(() => ({ data: { fullName: 'Pengguna', currentWeightKg: 0, targetWeightKg: 0, heightCm: 0 } })),
                foodLogApi.getTodaySummary().catch((e) => {
                    console.error('Food log error:', e)
                    return null
                })
            ])

            const user = userRes.data || userRes

            // Use backend calculated calorie target, or fallback to 2000
            const caloriesGoal = todayRes?.calorieTarget || 2000
            const proteinGoal = Math.round((user.currentWeightKg || 65) * 1.6) || 80
            const carbsGoal = Math.round(caloriesGoal * 0.5 / 4) || 250
            const fatGoal = Math.round(caloriesGoal * 0.25 / 9) || 55

            // Extract data - handle both direct fields and nested macros
            const totalCalories = todayRes?.totalCalories || todayRes?.caloriesConsumed || 0
            const totalProtein = todayRes?.totalProtein || todayRes?.macros?.protein || 0
            const totalCarbs = todayRes?.totalCarbs || todayRes?.macros?.carbs || 0
            const totalFat = todayRes?.totalFat || todayRes?.macros?.fat || 0

            setData({
                user,
                todayLogs: todayRes?.logs || [],
                stats: {
                    calories: totalCalories,
                    caloriesGoal,
                    protein: totalProtein,
                    proteinGoal,
                    carbs: totalCarbs,
                    carbsGoal,
                    fat: totalFat,
                    fatGoal,
                    water: waterCount,
                    waterGoal: 8,
                    streak: user.streakDays || 0,
                    steps: 0, // Placeholder - would come from health API
                    stepsGoal: 10000,
                    caloriesBurned: 0
                }
            })
        } catch (e) {
            console.error('Dashboard load error', e)
            setData({
                user: { fullName: 'Pengguna', currentWeightKg: 65, targetWeightKg: 60, heightCm: 170 },
                todayLogs: [],
                stats: {
                    calories: 0, caloriesGoal: 2000,
                    protein: 0, proteinGoal: 80,
                    carbs: 0, carbsGoal: 250,
                    fat: 0, fatGoal: 55,
                    water: 0, waterGoal: 8,
                    streak: 0,
                    steps: 0, stepsGoal: 10000,
                    caloriesBurned: 0
                }
            })
        } finally {
            setLoading(false)
        }
    }

    const addWater = () => {
        const newCount = Math.min(waterCount + 1, 8)
        setWaterCount(newCount)

        // Save to localStorage
        const today = new Date().toISOString().split('T')[0]
        localStorage.setItem(`water_${today}`, newCount.toString())

        // Show celebration when goal reached
        if (newCount === 8) {
            setShowWaterCelebration(true)
            setTimeout(() => setShowWaterCelebration(false), 4000)
        }
    }

    const removeWater = () => {
        const newCount = Math.max(waterCount - 1, 0)
        setWaterCount(newCount)

        // Save to localStorage
        const today = new Date().toISOString().split('T')[0]
        localStorage.setItem(`water_${today}`, newCount.toString())
    }

    const calculateBMI = () => {
        if (!data?.user?.heightCm || !data?.user?.currentWeightKg) return 0
        const heightM = data.user.heightCm / 100
        return data.user.currentWeightKg / (heightM * heightM)
    }

    const getBMIStatus = (bmi: number) => {
        if (bmi < 18.5) return { label: 'Kurus', color: 'text-amber-600', bg: 'bg-amber-100' }
        if (bmi < 25) return { label: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-100' }
        if (bmi < 30) return { label: 'Gemuk', color: 'text-orange-600', bg: 'bg-orange-100' }
        return { label: 'Obesitas', color: 'text-red-600', bg: 'bg-red-100' }
    }

    if (loading) return <DashboardSkeleton />

    const firstName = data?.user?.fullName?.split(' ')[0] || 'Teman'
    const bmi = calculateBMI()
    const bmiStatus = getBMIStatus(bmi)
    const caloriesRemaining = Math.max(0, (data?.stats.caloriesGoal || 0) - (data?.stats.calories || 0))
    const caloriesPercent = Math.min(((data?.stats.calories || 0) / (data?.stats.caloriesGoal || 1)) * 100, 100)

    const mealsByType = {
        breakfast: data?.todayLogs?.filter(log => log.mealType === 'breakfast') || [],
        lunch: data?.todayLogs?.filter(log => log.mealType === 'lunch') || [],
        dinner: data?.todayLogs?.filter(log => log.mealType === 'dinner') || [],
        snack: data?.todayLogs?.filter(log => log.mealType === 'snack') || [],
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 11) return 'Selamat Pagi'
        if (hour < 15) return 'Selamat Siang'
        if (hour < 18) return 'Selamat Sore'
        return 'Selamat Malam'
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-24 md:pb-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">{getGreeting()},</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {firstName}! 👋
                    </h1>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium bg-white dark:bg-gray-800 px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <span>📅</span>
                    <span className="text-gray-700 dark:text-gray-300">
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ========== LEFT COLUMN (2/3) ========== */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 1. KALORI HARIAN - Hero Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-500/25"
                    >
                        {/* Decorative */}
                        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-20 translate-x-20" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-12 -translate-x-12" />

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                                <div>
                                    <p className="text-emerald-100 font-medium mb-2 flex items-center gap-2">
                                        <Flame className="w-4 h-4" /> Kalori Hari Ini
                                    </p>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-5xl md:text-6xl font-bold">{data?.stats.calories || 0}</span>
                                        <span className="text-xl text-emerald-100">/ {data?.stats.caloriesGoal} kkal</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="bg-white/20 backdrop-blur-md rounded-2xl px-5 py-3 text-center">
                                        <p className="text-xs text-emerald-100 mb-1">Sisa</p>
                                        <p className="text-2xl font-bold">{caloriesRemaining}</p>
                                        <p className="text-xs text-emerald-100">kkal</p>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="h-4 bg-black/20 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${caloriesPercent}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-white rounded-full"
                                    />
                                </div>
                                <p className="text-xs text-emerald-100 mt-2 text-right">{Math.round(caloriesPercent)}% tercapai</p>
                            </div>

                            {/* 2. MACROS */}
                            <div className="grid grid-cols-3 gap-3">
                                <MacroCard
                                    label="Protein"
                                    value={data?.stats.protein || 0}
                                    goal={data?.stats.proteinGoal || 80}
                                    unit="g"
                                    color="from-blue-400 to-blue-500"
                                />
                                <MacroCard
                                    label="Karbo"
                                    value={data?.stats.carbs || 0}
                                    goal={data?.stats.carbsGoal || 250}
                                    unit="g"
                                    color="from-amber-400 to-orange-500"
                                />
                                <MacroCard
                                    label="Lemak"
                                    value={data?.stats.fat || 0}
                                    goal={data?.stats.fatGoal || 55}
                                    unit="g"
                                    color="from-pink-400 to-rose-500"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* 3. LOG MAKAN HARI INI */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                <Utensils className="w-5 h-5 text-emerald-500" />
                                Log Makan Hari Ini
                            </h2>
                            <Link href="/dashboard/food-log" className="text-sm text-emerald-600 font-medium hover:underline flex items-center gap-1">
                                Lihat Semua <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            <MealSection
                                icon={<Sunrise className="w-5 h-5 text-amber-500" />}
                                title="Sarapan"
                                items={mealsByType.breakfast}
                                bgColor="bg-amber-50 dark:bg-amber-900/20"
                            />
                            <MealSection
                                icon={<Sun className="w-5 h-5 text-orange-500" />}
                                title="Makan Siang"
                                items={mealsByType.lunch}
                                bgColor="bg-orange-50 dark:bg-orange-900/20"
                            />
                            <MealSection
                                icon={<Moon className="w-5 h-5 text-indigo-500" />}
                                title="Makan Malam"
                                items={mealsByType.dinner}
                                bgColor="bg-indigo-50 dark:bg-indigo-900/20"
                            />
                            <MealSection
                                icon={<Apple className="w-5 h-5 text-emerald-500" />}
                                title="Camilan"
                                items={mealsByType.snack}
                                bgColor="bg-emerald-50 dark:bg-emerald-900/20"
                            />
                        </div>
                    </motion.div>

                    {/* 8. QUICK ACTIONS */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Aksi Cepat
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <QuickActionCard
                                href="/dashboard/food-log/add"
                                icon={<Plus className="w-6 h-6" />}
                                title="Catat Makan"
                                color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                            />
                            <QuickActionCard
                                href="/dashboard/food-log/photo"
                                icon={<Camera className="w-6 h-6" />}
                                title="Foto Makanan"
                                color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                            />
                            <QuickActionCard
                                href="/dashboard/settings/weight"
                                icon={<Scale className="w-6 h-6" />}
                                title="Timbang Badan"
                                color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                            />
                        </div>
                    </motion.div>

                    {/* 9. TIPS HARIAN */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Lightbulb className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-bold">
                                    💡 Tips Harian
                                </span>
                                <span className="text-xs text-gray-400">{dailyTip.category}</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{dailyTip.title}</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">{dailyTip.tip}</p>
                        </div>
                    </motion.div>
                </div>

                {/* ========== RIGHT COLUMN (1/3) ========== */}
                <div className="space-y-6">

                    {/* 4. WATER TRACKER */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden"
                    >
                        {/* Celebration Overlay */}
                        <AnimatePresence>
                            {showWaterCelebration && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 z-20 flex flex-col items-center justify-center text-white p-4"
                                >
                                    {/* Confetti */}
                                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                        {[...Array(20)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{
                                                    y: -20,
                                                    x: Math.random() * 200 - 100,
                                                    rotate: 0,
                                                    opacity: 1
                                                }}
                                                animate={{
                                                    y: 300,
                                                    rotate: Math.random() * 360,
                                                    opacity: 0
                                                }}
                                                transition={{
                                                    duration: 2 + Math.random(),
                                                    delay: Math.random() * 0.5,
                                                    ease: 'easeOut'
                                                }}
                                                className="absolute text-2xl"
                                                style={{ left: `${Math.random() * 100}%` }}
                                            >
                                                {['💧', '✨', '🎉', '💦', '⭐'][Math.floor(Math.random() * 5)]}
                                            </motion.div>
                                        ))}
                                    </div>

                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', delay: 0.2 }}
                                        className="text-6xl mb-4"
                                    >
                                        🎊
                                    </motion.div>
                                    <motion.h3
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-2xl font-bold text-center mb-2"
                                    >
                                        Yeay! Luar Biasa! 🌟
                                    </motion.h3>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-center text-cyan-100"
                                    >
                                        Kamu sudah minum 8 gelas hari ini!<br />
                                        Tetap terhidrasi ya! 💪
                                    </motion.p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Droplets className="w-5 h-5 text-cyan-500" />
                                Air Minum
                            </h3>
                            <span className={`text-sm font-semibold ${waterCount >= 8 ? 'text-cyan-500' : 'text-gray-500'}`}>
                                {waterCount}/8 gelas
                            </span>
                        </div>

                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={false}
                                    animate={i < waterCount ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                    className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${i < waterCount
                                        ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600'
                                        }`}
                                >
                                    <Droplets className={`w-5 h-5 ${i < waterCount ? 'text-white' : ''}`} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Water action buttons */}
                        <div className="flex gap-2">
                            {/* Minus button */}
                            <button
                                onClick={removeWater}
                                disabled={waterCount === 0}
                                className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 font-bold rounded-xl transition-all flex items-center justify-center active:scale-95"
                                title="Kurangi gelas"
                            >
                                <Minus className="w-5 h-5" />
                            </button>

                            {/* Main action button */}
                            {waterCount >= 8 ? (
                                <div className="flex-1 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold rounded-xl text-center flex items-center justify-center gap-2">
                                    <span>✅</span>
                                    Target Tercapai!
                                </div>
                            ) : (
                                <button
                                    onClick={addWater}
                                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-cyan-500/25"
                                >
                                    <Plus className="w-5 h-5" />
                                    Tambah Gelas
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* 5. STREAK */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 opacity-20">
                            <Flame className="w-32 h-32 -translate-y-4 translate-x-4" />
                        </div>
                        <div className="relative z-10 text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Flame className="w-8 h-8" fill="currentColor" />
                            </div>
                            <p className="text-orange-100 text-sm mb-1">Streak Harian</p>
                            <p className="text-4xl font-bold mb-1">{data?.stats.streak || 0}</p>
                            <p className="text-orange-100 text-sm">hari berturut-turut</p>
                            {(data?.stats.streak || 0) >= 7 && (
                                <div className="mt-3 flex items-center justify-center gap-1 text-yellow-200">
                                    <Award className="w-4 h-4" />
                                    <span className="text-xs font-medium">Minggu Sempurna! 🏆</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* 6. BERAT BADAN */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Scale className="w-5 h-5 text-purple-500" />
                                Berat Badan
                            </h3>
                            <Link href="/dashboard/profile" className="text-xs text-emerald-600 font-medium">
                                Edit
                            </Link>
                        </div>

                        <div className="text-center mb-4">
                            <p className="text-4xl font-bold text-gray-900 dark:text-white">
                                {data?.user?.currentWeightKg || '--'}
                                <span className="text-lg text-gray-400 font-normal"> kg</span>
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                {data?.user?.targetWeightKg && data?.user?.currentWeightKg !== data?.user?.targetWeightKg && (
                                    <>
                                        {data.user.currentWeightKg > data.user.targetWeightKg ? (
                                            <TrendingDown className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <TrendingUp className="w-4 h-4 text-blue-500" />
                                        )}
                                        <span className="text-sm text-gray-500">
                                            {Math.abs(data.user.currentWeightKg - data.user.targetWeightKg).toFixed(1)} kg lagi
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between text-sm">
                            <div className="text-center">
                                <p className="text-gray-400">Target</p>
                                <p className="font-bold text-gray-900 dark:text-white">{data?.user?.targetWeightKg || '--'} kg</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-400">Progress</p>
                                <p className="font-bold text-emerald-600">
                                    {data?.user?.targetWeightKg && data?.user?.currentWeightKg
                                        ? `${Math.round((1 - Math.abs(data.user.currentWeightKg - data.user.targetWeightKg) / data.user.targetWeightKg) * 100)}%`
                                        : '--%'
                                    }
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* 7. BMI */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Heart className="w-5 h-5 text-red-500" />
                                Status BMI
                            </h3>
                            <span className={`px-3 py-1 ${bmiStatus.bg} ${bmiStatus.color} rounded-full text-xs font-bold`}>
                                {bmiStatus.label}
                            </span>
                        </div>

                        <div className="text-center mb-4">
                            <p className="text-4xl font-bold text-gray-900 dark:text-white">
                                {bmi > 0 ? bmi.toFixed(1) : '--'}
                            </p>
                            <p className="text-sm text-gray-400">kg/m²</p>
                        </div>

                        {/* BMI Scale */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Kurus</span>
                                <span>Normal</span>
                                <span>Gemuk</span>
                            </div>
                            <div className="h-3 w-full rounded-full overflow-hidden flex">
                                <div className="w-1/4 bg-amber-300" />
                                <div className="w-1/4 bg-emerald-400" />
                                <div className="w-1/4 bg-orange-400" />
                                <div className="w-1/4 bg-red-400" />
                            </div>
                            {/* BMI Indicator */}
                            {bmi > 0 && (
                                <div className="relative h-2">
                                    <div
                                        className="absolute w-3 h-3 bg-gray-900 dark:bg-white rounded-full -top-1 transform -translate-x-1/2"
                                        style={{ left: `${Math.min(Math.max((bmi - 15) / 20 * 100, 0), 100)}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* 10. AKTIVITAS */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                            <Footprints className="w-5 h-5 text-green-500" />
                            Aktivitas Hari Ini
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                        <Footprints className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{data?.stats.steps?.toLocaleString() || 0}</p>
                                        <p className="text-xs text-gray-400">langkah</p>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-400">
                                    / {(data?.stats.stepsGoal || 10000).toLocaleString()}
                                </span>
                            </div>

                            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${Math.min((data?.stats.steps || 0) / (data?.stats.stepsGoal || 10000) * 100, 100)}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Kalori terbakar</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {data?.stats.caloriesBurned || 0} kkal
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

// ========== COMPONENTS ==========

function MacroCard({ label, value, goal, unit, color }: { label: string; value: number; goal: number; unit: string; color: string }) {
    const percent = Math.min((value / goal) * 100, 100)
    return (
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
            <p className="text-xs text-emerald-100 mb-1">{label}</p>
            <p className="text-xl font-bold">{value}<span className="text-sm">{unit}</span></p>
            <div className="mt-2 h-1.5 bg-black/20 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: `${percent}%` }} />
            </div>
            <p className="text-[10px] text-emerald-100 mt-1">{Math.round(percent)}% / {goal}{unit}</p>
        </div>
    )
}

function MealSection({ icon, title, items, bgColor }: { icon: React.ReactNode; title: string; items: any[]; bgColor: string }) {
    const totalCalories = items.reduce((sum, item) => sum + (item.calories || 0), 0)

    return (
        <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center`}>
                    {icon}
                </div>
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                    <p className="text-xs text-gray-500">
                        {items.length > 0 ? `${items.length} item • ${totalCalories} kkal` : 'Belum ada'}
                    </p>
                </div>
            </div>
            <Link
                href={`/dashboard/food-log/add?meal=${title.toLowerCase().replace(' ', '')}`}
                className="w-9 h-9 bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl flex items-center justify-center text-gray-400 hover:text-emerald-600 transition-colors"
            >
                <Plus className="w-5 h-5" />
            </Link>
        </div>
    )
}

function QuickActionCard({ href, icon, title, color }: { href: string; icon: React.ReactNode; title: string; color: string }) {
    return (
        <Link href={href}>
            <div className="group bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col items-center gap-3 text-center">
                <div className={`p-3 rounded-xl ${color} transition-transform group-hover:scale-110`}>
                    {icon}
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {title}
                </span>
            </div>
        </Link>
    )
}

function DashboardSkeleton() {
    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
            <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-[2rem]" />
                    <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
                </div>
                <div className="space-y-6">
                    <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
                    <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
                    <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
                </div>
            </div>
        </div>
    )
}
