import React from 'react'

interface DailySummaryShareCardProps {
    id: string
    date: string
    calories: number
    protein: number
    carbs: number
    fat: number
}

import { useTranslation } from '@/lib/AppContext'

/* ... imports ... */

export default function DailySummaryShareCard({
    id,
    date,
    calories,
    protein,
    carbs,
    fat
}: DailySummaryShareCardProps) {
    const { t } = useTranslation()

    return (
        <div
            id={id}
            className="fixed left-[-9999px] top-0 w-[600px] h-[600px]" // Hidden but rendered
        >
            <div className="w-full h-full bg-white p-12 flex flex-col relative overflow-hidden text-gray-900 border-8 border-emerald-500">

                {/* Background Watermark */}
                <div className="absolute -bottom-20 -right-20 text-emerald-50 opacity-20 transform -rotate-12">
                    <span className="text-[300px] font-black">N</span>
                </div>

                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold text-emerald-600 tracking-wider">NUTRIFY</h1>
                        <p className="text-gray-400 font-bold tracking-[0.2em] text-sm mt-1">{t('dashboard.share.dailySummary').toUpperCase()}</p>
                    </div>
                    <div className="bg-emerald-600 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg">
                        {date}
                    </div>
                </div>

                {/* Main Stats */}
                <div className="flex-1 flex flex-col justify-center items-center mb-12">
                    <p className="text-gray-400 font-bold tracking-widest text-sm mb-4">{t('dashboard.share.totalIntake').toUpperCase()}</p>
                    <div className="flex items-baseline">
                        <span className="text-9xl font-black text-gray-900 leading-none">{Math.round(calories)}</span>
                        <span className="text-4xl font-medium text-gray-400 ml-2">{t('units.kcal') || 'kcal'}</span>
                    </div>
                </div>

                {/* Macros */}
                <div className="bg-gray-50 rounded-3xl p-8 flex justify-between relative z-10">
                    <MacroItem label={t('dashboard.protein').toUpperCase()} value={Math.round(protein)} unit="g" color="text-emerald-600" />
                    <div className="w-px bg-gray-200" />
                    <MacroItem label={t('dashboard.carbs').toUpperCase()} value={Math.round(carbs)} unit="g" color="text-amber-500" />
                    <div className="w-px bg-gray-200" />
                    <MacroItem label={t('dashboard.fat').toUpperCase()} value={Math.round(fat)} unit="g" color="text-rose-500" />
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-gray-400 text-sm font-medium">{t('dashboard.share.join')}</p>
                </div>
            </div>
        </div>
    )
}

function MacroItem({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
    return (
        <div className="flex flex-col items-center px-4 w-1/3">
            <span className={`text-5xl font-bold ${color} mb-1`}>{value}{unit}</span>
            <span className="text-gray-400 font-bold text-xs tracking-wider">{label}</span>
        </div>
    )
}
