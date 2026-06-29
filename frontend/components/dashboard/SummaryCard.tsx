'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

export function SummaryCard() {
    const [data, setData] = useState({
        calories: { current: 0, target: 2000, percentage: 0 },
        macros: [
            { label: 'Protein', current: 0, target: 140, unit: 'g', color: 'bg-secondary' },
            { label: 'Karbo', current: 0, target: 280, unit: 'g', color: 'bg-accent' },
            { label: 'Lemak', current: 0, target: 85, unit: 'g', color: 'bg-primary-action' }
        ]
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await import('@/lib/api').then(m => m.foodLogApi.getTodaySummary())
                if (response) {
                    setData({
                        calories: {
                            current: response.caloriesConsumed || 0,
                            target: response.calorieTarget || 2000,
                            percentage: response.percentageUsed || 0
                        },
                        macros: [
                            { label: 'Protein', current: response.macros?.protein || 0, target: 140, unit: 'g', color: 'bg-secondary' },
                            { label: 'Karbo', current: response.macros?.carbs || 0, target: 280, unit: 'g', color: 'bg-accent' },
                            { label: 'Lemak', current: response.macros?.fat || 0, target: 85, unit: 'g', color: 'bg-primary-action' }
                        ]
                    })
                }
            } catch (error) {
                console.error('Failed to fetch summary:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Calculate circle stroke
    const radius = 90
    const circumference = 2 * Math.PI * radius
    const visualPercentage = Math.min(data.calories.percentage, 100)
    const strokeDashoffset = circumference - (visualPercentage / 100) * circumference

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 text-neutral-900 dark:text-white relative overflow-hidden shadow-sm border border-neutral-100 dark:border-neutral-800"
        >
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Background Gradient Blur */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-action-50 dark:bg-primary-action-950/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
                {/* Circle Progress */}
                <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                    {/* SVG Ring */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="10"
                            fill="transparent"
                            className="text-neutral-100 dark:text-neutral-800"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="10"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="text-primary-action transition-all duration-1000 ease-out"
                        />
                    </svg>

                    {/* Inner Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">SISA GIZI</span>
                        <span className="text-4xl font-bold font-display text-neutral-900 dark:text-white mt-1">
                            {Math.max(0, data.calories.target - data.calories.current).toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 mt-1">kkal</span>
                    </div>
                </div>

                {/* Macros */}
                <div className="flex-1 w-full space-y-6">
                    {data.macros.map((macro: { label: string; current: number; target: number; unit: string; color: string }) => (
                        <div key={macro.label}>
                            <div className="flex justify-between items-end mb-2">
                                <span className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">{macro.label}</span>
                                <div className="text-xs">
                                    <span className="font-bold text-neutral-900 dark:text-white">{macro.current}{macro.unit}</span>
                                    <span className="text-neutral-400 dark:text-neutral-500"> / {macro.target}{macro.unit}</span>
                                </div>
                            </div>
                            {/* Progress Bar */}
                            <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((macro.current / macro.target) * 100, 100)}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className={`h-full ${macro.color} rounded-full`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Burned Info */}
            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-action-50 dark:bg-primary-action-950/20 flex items-center justify-center text-primary-action">
                    <Flame className="w-4 h-4 fill-current" />
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                    <span className="text-neutral-900 dark:text-white font-bold">{data.calories.current.toLocaleString('id-ID')} kkal</span> dikonsumsi dari target {data.calories.target.toLocaleString('id-ID')} kkal hari ini
                </p>
            </div>
        </motion.div>
    )
}
