// Force redeploy - Quote Fixes
import React from 'react'

interface StreakShareCardProps {
    id: string
    userName: string
    streakDays: number
}

import { useTranslation } from '@/lib/AppContext'

/* ... imports ... */

export default function StreakShareCard({ id, userName, streakDays }: StreakShareCardProps) {
    const { t } = useTranslation()

    return (
        <div
            id={id}
            className="fixed left-[-9999px] top-0 w-[600px] h-[600px]" // Hidden but rendered
        >
            <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-700 p-12 flex flex-col items-center justify-between text-white relative overflow-hidden">

                {/* Decorative Circles */}
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white opacity-10 rounded-full" />
                <div className="absolute bottom-[-30px] left-[-30px] w-32 h-32 bg-white opacity-10 rounded-full" />

                {/* Header */}
                <div className="flex items-center gap-3 z-10">
                    <div className="bg-white/20 p-2 rounded-xl">
                        {/* Leaf Icon equivalent */}
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2.69l5.74 5.74c.84.84.84 2.21 0 3.05l-5.74 5.74-5.74-5.74c-.84-.84-.84-2.21 0-3.05L12 2.69z" />
                        </svg>
                    </div>
                    <span className="text-3xl font-bold tracking-widest font-editorial">AI Ate Indonesia</span>
                </div>

                {/* Main Content */}
                <div className="flex flex-col items-center z-10">
                    <div className="bg-white text-emerald-600 w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-2xl mb-8">
                        <span className="text-6xl">🔥</span>
                        <span className="text-8xl font-black leading-none mt-2">{streakDays}</span>
                        <span className="text-lg font-bold tracking-widest text-emerald-800">{t('dashboard.days').toUpperCase()}</span>
                    </div>

                    <h2 className="text-3xl font-bold mb-2">{t('dashboard.share.greatJob')}, {userName}!</h2>
                    <p className="text-emerald-100 text-xl italic text-center max-w-md">
                        &quot;{t('dashboard.share.quote')}&quot;
                    </p>
                </div>

                {/* Footer */}
                <div className="bg-white/20 px-6 py-2 rounded-full z-10">
                    <span className="font-medium tracking-wide">{t('dashboard.share.join')}</span>
                </div>
            </div>
        </div>
    )
}
