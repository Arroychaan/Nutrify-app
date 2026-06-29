import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Droplet, CheckCircle2, Plus, Minus, Loader2 } from 'lucide-react'

export function HydrationCard() {
    const [hydration, setHydration] = useState({
        current: 0,
        target: 2000,
        count: 0 // glass count
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const response = await import('@/lib/api').then(m => m.foodLogApi.getWater())
            if (response && response.data) {
                setHydration({
                    current: response.data.volumeMl || 0,
                    target: (response.data.target || 8) * 250,
                    count: response.data.count || 0
                })
            }
        } catch (error) {
            console.error('Failed to fetch hydration:', error)
        }
    }

    const updateWater = async (increment: number) => {
        if (loading) return
        const newCount = Math.max(0, hydration.count + increment)

        // Optimistic update
        setHydration(prev => ({
            ...prev,
            count: newCount,
            current: newCount * 250
        }))

        setLoading(true)
        try {
            const api = await import('@/lib/api')
            await api.foodLogApi.updateWater(newCount)
        } catch (error) {
            console.error('Failed to update water', error)
            loadData() // Revert on error
        } finally {
            setLoading(false)
        }
    }

    const percentage = Math.min((hydration.current / hydration.target) * 100, 100)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between h-full"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-display">Hidrasi</h3>
                    <p className="text-sm text-neutral-500">Target Harian: {hydration.target}ml</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-500">
                    <Droplet className="w-5 h-5 fill-current" />
                </div>
            </div>

            {/* Water Visualization */}
            <div className="relative h-40 w-full bg-blue-50 dark:bg-blue-900/10 rounded-2xl overflow-hidden mb-6 border border-blue-100 dark:border-blue-800/20 group">
                <motion.div
                    initial={{ height: '0%' }}
                    animate={{ height: `${percentage}%` }}
                    transition={{ duration: 1.5, type: 'spring', bounce: 0.2 }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 opacity-90 w-full"
                />

                {/* Controls Overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 dark:bg-black/20 backdrop-blur-[1px]">
                    <button
                        onClick={() => updateWater(-1)}
                        className="p-3 bg-white dark:bg-neutral-800 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all text-blue-600 dark:text-blue-400 disabled:opacity-50"
                        disabled={hydration.count <= 0}
                    >
                        <Minus className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => updateWater(1)}
                        className="p-3 bg-white dark:bg-neutral-800 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all text-blue-600 dark:text-blue-400"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>

                <div className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                    {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                    {hydration.current}ml
                </div>

                {/* Count Badge */}
                <div className="absolute top-3 left-3 bg-white/80 dark:bg-black/50 backdrop-blur-sm text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                    {hydration.count} Gelas
                </div>
            </div>

            <div className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 border transition-colors
                ${percentage >= 100
                    ? 'bg-secondary-50 dark:bg-secondary-950/20 text-secondary border-secondary-200 dark:border-secondary-900'
                    : 'bg-background-50 dark:bg-neutral-850/50 text-text-muted border-border-warm dark:border-neutral-800'
                }`}
            >
                {percentage >= 100 ? <CheckCircle2 className="w-5 h-5 text-secondary" /> : <Droplet className="w-5 h-5 text-text-muted" />}
                <span className="font-semibold text-sm">
                    {percentage >= 100 ? 'Target Hidrasi Tercapai!' : 'Belum Mencapai Target Hidrasi'}
                </span>
            </div>
        </motion.div>
    )
}
