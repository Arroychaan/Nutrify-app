'use client'

import React, { useState } from 'react'
import { Flame, Share2, Award } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getStreakInfo } from '@/lib/utils/streak-calculator'
import { useTranslation } from '@/lib/AppContext'

interface StreakCardProps {
    streakDays: number
    onShare: () => void
}

export default function StreakCard({ streakDays, onShare }: StreakCardProps) {
    const { t } = useTranslation()
    const { message, color, bg, level, fireIntensity } = getStreakInfo(streakDays)
    const [isHovered, setIsHovered] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/20 dark:border-gray-700"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Glow Effect */}
            {streakDays > 0 && (
                <div className={`absolute -right-10 -top-10 w-32 h-32 ${bg} opacity-10 blur-3xl rounded-full`} />
            )}

            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Fire Icon Container */}
                    <div className={`relative w-14 h-14 rounded-2xl ${streakDays > 0 ? bg : 'bg-gray-100 dark:bg-gray-700'} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center`}>
                        <motion.div
                            animate={
                                streakDays > 0 ? {
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0],
                                } : {}
                            }
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Flame
                                className={`w-8 h-8 ${streakDays > 0 ? color : 'text-gray-400'}`}
                                fill={streakDays > 0 ? "currentColor" : "none"}
                            />
                        </motion.div>

                        {/* Level Badge */}
                        {streakDays >= 7 && (
                            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm">
                                {level.toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className={`text-xl font-bold ${streakDays > 0 ? color : 'text-gray-900 dark:text-white'}`}>
                                {streakDays} {t('dashboard.streak')}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-[200px] leading-tight">
                            {t(message)}
                        </p>
                    </div>
                </div>

                {/* Share Button */}
                {streakDays > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onShare}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-500 hover:text-emerald-600 transition-colors"
                        title={t('dashboard.share.title')}
                    >
                        <Share2 className="w-5 h-5" />
                    </motion.button>
                )}
            </div>
        </motion.div>
    )
}
