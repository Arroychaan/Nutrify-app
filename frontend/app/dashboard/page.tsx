'use client'

import { useEffect, useState, useCallback } from 'react'
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
    Sparkles,
    Share2,
    ChefHat,
    LineChart,
    Info
} from 'lucide-react'
import { authApi, foodLogApi } from '@/lib/api'
import StreakCard from '@/components/features/streak/StreakCard'
import ShareModal from '@/components/features/sharing/ShareModal'
import { useTranslation } from '@/lib/AppContext'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import TDEEExplanationModal from '@/components/features/dashboard/TDEEExplanationModal'
import { Skeleton } from '@/components/ui/Skeleton'

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
    const { t } = useTranslation()
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [waterCount, setWaterCount] = useState(0)
    const [dailyTip] = useState(() => dailyTips[Math.floor(Math.random() * dailyTips.length)])

    // Share & Modal State
    const [shareModalOpen, setShareModalOpen] = useState(false)
    const [shareType, setShareType] = useState<'streak' | 'daily_summary'>('streak')
    const [shareData, setShareData] = useState<any>(null)
    const [showTDEEModal, setShowTDEEModal] = useState(false)

    // Move loadDashboardData to useCallback to fix lint warning
    const loadDashboardData = useCallback(async () => {
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
                    calories: Number(todayRes?.totalCalories) || 0,
                    caloriesGoal: Number(caloriesGoal),
                    protein: Number(todayRes?.totalProtein) || 0,
                    proteinGoal: Math.round((Number(user.currentWeightKg) || 65) * 1.6),
                    carbs: Number(todayRes?.totalCarbs) || 0,
                    carbsGoal: Math.round(caloriesGoal * 0.5 / 4),
                    fat: Number(todayRes?.totalFat) || 0,
                    fatGoal: Math.round(caloriesGoal * 0.25 / 9),
                }
            })
        } catch (e) {
            console.error('Dashboard load error', e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const loadWater = async () => {
            try {
                const res = await foodLogApi.getWater()
                if (res?.count) setWaterCount(res.count)
            } catch (e) {
                console.error('Failed to load water', e)
            }
        }
        loadWater()
    }, [])

    useEffect(() => {
        loadDashboardData()
    }, [loadDashboardData])

    const addWater = async () => {
        const newCount = Math.min(waterCount + 1, 8)
        setWaterCount(newCount) // Optimistic update
        try {
            await foodLogApi.updateWater(newCount)
        } catch (e) {
            console.error('Failed to sync water', e)
            setWaterCount(waterCount) // Revert on error
        }
    }

    const handleStreakShare = () => {
        setShareType('streak')
        setShareData({
            streakDays: data?.user?.streakDays || 0,
            userName: data?.user?.fullName?.split(' ')[0] || 'Friend'
        })
        setShareModalOpen(true)
    }

    const handleDailyShare = () => {
        setShareType('daily_summary')
        setShareData({
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            stats: data?.stats
        })
        setShareModalOpen(true)
    }

    if (loading) {
        return (
            <div className="space-y-8 pb-24 md:pb-12 max-w-5xl mx-auto pt-2">
                {/* Header Skeleton */}
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64 rounded-xl" />
                        <Skeleton className="h-6 w-96 rounded-lg" />
                    </div>
                    <Skeleton className="hidden md:block w-12 h-12 rounded-full" />
                </div>

                {/* Hero Card Skeleton */}
                <Skeleton className="h-[280px] w-full rounded-[32px]" />

                {/* Features Grid Skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-[24px]" />
                    ))}
                </div>
            </div>
        )
    }

    const firstName = data?.user?.fullName?.split(' ')[0] || 'Teman'
    const currentCalories = data?.stats.calories || 0
    const goalCalories = data?.stats.caloriesGoal || 0
    const calorieDiff = goalCalories - currentCalories
    const isOver = calorieDiff < 0
    const absDiff = Math.abs(calorieDiff)

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 11) return 'Selamat Pagi'
        if (hour < 15) return 'Selamat Siang'
        if (hour < 18) return 'Selamat Sore'
        return 'Selamat Malam'
    }

    return (
        <div className="space-y-8 pb-24 md:pb-12 max-w-5xl mx-auto">
            {/* Header - Simple & Clean */}
            <div className="pt-2 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                        {getGreeting()}, <span className="text-emerald-500">{firstName}</span> 👋
                    </h1>
                    <p className={`mt-1 text-lg ${isOver ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                        {goalCalories === 0
                            ? "Belum ada target kalori. Silakan atur profilmu."
                            : isOver
                                ? `⚠️ Perhatian! Asupanmu melebihi target sebesar ${absDiff} kcal.`
                                : `Kamu masih butuh ${absDiff} kcal lagi untuk mencapai target.`}
                    </p>
                </div>
                <div className="hidden md:block">
                    <div className="w-12 h-12 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center">
                        <span className="text-xl font-bold text-emerald-600">{firstName[0]}</span>
                    </div>
                </div>
            </div>

            {/* Calorie Card - Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-[32px] p-6 md:p-8 text-white relative shadow-xl ${isOver ? 'bg-gradient-to-br from-red-500 to-orange-600 shadow-red-500/20' : 'bg-gradient-primary shadow-emerald-500/20'}`}
            >
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                        <div>
                            <p className="text-white/80 font-medium mb-1 flex items-center gap-2">
                                <Flame className="w-4 h-4" /> {t('dashboard.caloriesToday')}
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-display font-bold">{currentCalories}</span>
                                <div className="flex items-center gap-1 group cursor-pointer" onClick={() => setShowTDEEModal(true)}>
                                    <span className="text-white/60 text-lg">/ {goalCalories} kcal</span>
                                    <Info className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 items-center">
                            <div className={`backdrop-blur-md rounded-2xl px-4 py-2 text-center min-w-[100px] ${isOver ? 'bg-red-500/30' : 'bg-white/20'}`}>
                                <p className="text-white/80 text-xs mb-1">{isOver ? 'Kelebihan' : 'Sisa'}</p>
                                <p className="text-xl font-bold">{absDiff}</p>
                            </div>
                            <button
                                onClick={handleDailyShare}
                                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-all"
                            >
                                <Share2 className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="h-3 bg-black/20 rounded-full overflow-hidden mb-8">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(((data?.stats.calories || 0) / (data?.stats.caloriesGoal || 1)) * 100, 100)}%` }}
                            transition={{ duration: 0.8 }}
                            className={`h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] ${isOver ? 'bg-red-400' : 'bg-white'}`}
                        />
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-3 gap-4">
                        <MacroItem label={t('dashboard.protein')} value={data?.stats.protein || 0} goal={data?.stats.proteinGoal || 80} color="bg-emerald-400" />
                        <MacroItem label={t('dashboard.carbs')} value={data?.stats.carbs || 0} goal={data?.stats.carbsGoal || 250} color="bg-teal-400" />
                        <MacroItem label={t('dashboard.fat')} value={data?.stats.fat || 0} goal={data?.stats.fatGoal || 55} color="bg-green-400" />
                    </div>
                </div>
            </motion.div>

            {/* Main Menu Grid - The "Hub" */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <FeatureCard
                    title="Generate Meal Plan"
                    subtitle="Rencana makan harian"
                    icon={ChefHat}
                    gradient="from-emerald-600 to-teal-600"
                    href="/dashboard/meal-plan"
                />
                <FeatureCard
                    title="AI Dietician"
                    subtitle="Konsultasi gizi"
                    icon={Sparkles}
                    gradient="from-emerald-500 to-emerald-700"
                    href="/dashboard/chat"
                />
                <FeatureCard
                    title="Jurnal Makanan"
                    subtitle="Catat kalori & makro"
                    icon={Camera}
                    gradient="from-teal-500 to-cyan-600"
                    href="/dashboard/food-log/add"
                />
                <FeatureCard
                    title="Lihat Progress"
                    subtitle="Pantau berat badan"
                    icon={LineChart}
                    gradient="from-cyan-600 to-blue-700"
                    href="/dashboard/progress"
                />
            </div>

            {/* Water & Streak Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Water - Spans 7 cols */}
                <GlassCard className="md:col-span-7 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Droplets className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Air Minum</h3>
                                <p className="text-xs text-gray-500">Target: 8 gelas/hari</p>
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{waterCount}<span className="text-gray-400 text-lg">/8</span></span>
                    </div>

                    <div className="flex gap-2 mb-6 h-12 items-end">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: '30%' }}
                                animate={{ height: i < waterCount ? '100%' : '30%' }}
                                className={`flex-1 rounded-t-lg transition-colors ${i < waterCount ? 'bg-blue-500' : 'bg-blue-100 dark:bg-gray-700'}`}
                            />
                        ))}
                    </div>

                    <GradientButton
                        onClick={addWater}
                        disabled={waterCount >= 8}
                        variant="accent" // Reusing accent for water temporarily or define blue variant
                        className="w-full bg-blue-600 shadow-blue-500/20"
                    >
                        {waterCount >= 8 ? `Target Tercapai! 🎉` : `+ Tambah Gelas`}
                    </GradientButton>
                </GlassCard>

                {/* Streak - Spans 5 cols */}
                <div className="md:col-span-5">
                    <StreakCard streakDays={data?.user?.streakDays || 0} onShare={handleStreakShare} />
                </div>
            </div>

            {/* Daily Tip */}
            <div className="bg-emerald-900/5 border border-emerald-900/10 rounded-2xl p-4 flex gap-4 items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xl">💡</span>
                </div>
                <div>
                    <p className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">{dailyTip.title}</p>
                    <p className="text-sm text-emerald-800/70 dark:text-emerald-200/70">{dailyTip.tip}</p>
                </div>
            </div>

            <ShareModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                type={shareType}
                data={shareData}
            />

            <TDEEExplanationModal
                isOpen={showTDEEModal}
                onClose={() => setShowTDEEModal(false)}
                user={data?.user}
                caloriesGoal={data?.stats?.caloriesGoal || 2000}
            />
        </div>
    )
}

function MacroItem({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
    const isOver = value > goal;
    const percentage = Math.min((value / goal) * 100, 100);
    const barColor = isOver ? 'bg-red-400' : color;

    return (
        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-white/80 text-xs mb-1">{label}</p>
            <p className="font-bold text-lg mb-2">{value}<span className="text-xs text-white/60 font-normal">/{goal}g</span></p>
            <div className="h-1 bg-black/20 rounded-full overflow-hidden">
                <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}

function FeatureCard({ title, subtitle, icon: Icon, gradient, href }: { title: string; subtitle: string; icon: any; gradient: string; href: string }) {
    return (
        <Link href={href} className="group relative">
            <div className={`
                absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 
                group-hover:opacity-100 rounded-[28px] blur-xl transition-opacity duration-500
            `} />
            <div className="relative bg-white dark:bg-gray-800 rounded-[24px] p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:translate-y-[-4px] transition-transform duration-300">
                <div className={`
                    w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} 
                    flex items-center justify-center mb-4 shadow-lg
                `}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white leading-tight mb-1">{title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{subtitle}</p>

                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
            </div>
        </Link>
    )
}
