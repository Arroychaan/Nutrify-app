import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, Check } from 'lucide-react'

export function StreakWidget() {
    const [streakDays, setStreakDays] = useState(0)
    const [days, setDays] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const api = await import('@/lib/api')

                // 1. Get user streak
                try {
                    const userRes = await api.authApi.me()
                    if (userRes && userRes.data) {
                        setStreakDays(userRes.data.streakDays || 0)
                    }
                } catch (e) {
                    console.error('Failed to fetch user streak', e)
                }

                // 2. Get 7-day history
                const end = new Date()
                const start = new Date()
                start.setDate(end.getDate() - 6) // Last 7 days including today

                try {
                    const summaryRes = await api.foodLogApi.getSummary(start.toISOString(), end.toISOString())
                    const history = summaryRes || [] // Array of daily summaries

                    // Map history to a lookup map
                    const historyMap: Record<string, boolean> = {}
                    if (Array.isArray(history)) {
                        history.forEach((h: any) => {
                            // Check if valid log exists (calories > 0 or mealsLogged > 0)
                            if (h.mealsLogged > 0 || h.calories > 0) {
                                historyMap[h.date] = true
                            }
                        })
                    }

                    // Generate display days
                    const generatedDays = Array.from({ length: 7 }).map((_, i) => {
                        const date = new Date()
                        date.setDate(date.getDate() - (6 - i))
                        const dateStr = date.toISOString().split('T')[0]
                        const isToday = i === 6

                        let status = 'upcoming' // Default for future or empty

                        if (historyMap[dateStr]) {
                            status = 'completed'
                        } else if (isToday) {
                            status = 'current'
                        } else {
                            // Past day with no log
                            status = 'missed' // Or just keep neutral if we don't want to shame
                        }

                        return {
                            label: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date),
                            status: status,
                            date: date
                        }
                    })
                    setDays(generatedDays)

                } catch (e) {
                    console.error('Failed to fetch history', e)
                    // Fallback to empty state
                    const fallbackDays = Array.from({ length: 7 }).map((_, i) => {
                        const date = new Date()
                        date.setDate(date.getDate() - (6 - i))
                        return {
                            label: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date),
                            status: i === 6 ? 'current' : 'upcoming',
                            date: date
                        }
                    })
                    setDays(fallbackDays)
                }

            } catch (error) {
                console.error('Error in StreakWidget', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Initial render / loading safeguard
    if (loading && days.length === 0) {
        // Render skeleton or simplified view
        const fallbackDays = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - i))
            return {
                label: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date),
                status: 'upcoming',
                date: date
            }
        })
        // Temporary use fallback while loading to avoid layout shift or empty
        // In real app, cleaner to wait or use skeleton. 
        // For now, let's just initialize state with this logic outside useEffect or accept re-render.
    }


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-100 dark:border-neutral-800"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-500">
                        <Flame className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-display">
                            Runtunan {streakDays} Hari
                        </h3>
                        <p className="text-neutral-500 text-sm">
                            Catat makanan tiap hari agar konsisten!
                        </p>
                    </div>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold">
                    {streakDays > 0 ? 'Sesuai Jalur' : 'Ayo Mulai!'}
                </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => (
                    <div key={index} className="flex flex-col items-center gap-3">
                        {/* Circle Status */}
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300
                        ${day.status === 'completed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : ''}
                        ${day.status === 'current' ? 'bg-white border-2 border-emerald-500 text-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-900/20' : ''}
                        ${day.status === 'upcoming' || day.status === 'missed' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600' : ''}
                    `}>
                            {day.status === 'completed' && <Check className="w-5 h-5 sm:w-6 sm:h-6" />}
                            {day.status === 'current' && <span className="font-bold text-xs">TDY</span>}
                            {(day.status === 'upcoming' || day.status === 'missed') && <span className="text-xs font-medium">{day.label}</span>}
                        </div>

                        {/* Label below */}
                        <span className={`text-xs font-medium ${day.status === 'current' || day.status === 'completed' ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
                            {day.label}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
