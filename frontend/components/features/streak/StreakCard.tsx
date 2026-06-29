'use client'

import React from 'react'
import { Flame } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'

interface StreakCardProps {
    streakDays: number
    onShare?: () => void
}

export default function StreakCard({ streakDays }: StreakCardProps) {
    const daysInWeek = 7
    const activeDays = Math.min(streakDays % 7 || (streakDays > 0 ? 7 : 0), 7)

    return (
        <GlassCard className="flex flex-col justify-between h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                        <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-900 dark:text-white">Mulai Streak</h3>
                        <p className="text-xs text-neutral-500">Target: 7 hari/minggu</p>
                    </div>
                </div>

                <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                    Day {streakDays > 0 ? streakDays : 1}
                </span>
            </div>

            {/* Weekly Progress Bars */}
            <div className="flex gap-2 mb-4 h-12 items-end">
                {[...Array(daysInWeek)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: '30%' }}
                        animate={{ height: i < activeDays ? '100%' : '30%' }}
                        className={`flex-1 rounded-lg transition-colors ${i < activeDays ? 'bg-orange-400' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                    />
                ))}
            </div>

            {/* Motivation text */}
            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                Catat makanan hari ini untuk memulai streak!
            </p>
        </GlassCard>
    )
}
