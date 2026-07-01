'use client'

import React, { useState } from 'react'
import { X, Download, Share2, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateAndShareImage } from '@/lib/utils/share-service'
import StreakShareCard from './StreakShareCard'
import DailySummaryShareCard from './DailySummaryShareCard'
import { useTranslation } from '@/lib/AppContext'

interface ShareModalProps {
    isOpen: boolean
    onClose: () => void
    type: 'streak' | 'daily_summary'
    data: any
}

export default function ShareModal({ isOpen, onClose, type, data }: ShareModalProps) {
    const { t } = useTranslation()
    const [isSharing, setIsSharing] = useState(false)

    const handleShare = async () => {
        setIsSharing(true)
        const elementId = type === 'streak' ? 'streak-share-card' : 'daily-share-card'
        const fileName = type === 'streak' ? `aiate-streak-${data.streakDays}` : `aiate-daily-${data.date}`

        try {
            await generateAndShareImage(elementId, fileName)
        } catch (error) {
            console.error('Share failed', error)
        } finally {
            setIsSharing(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-white/20 relative"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 hover:text-gray-900 transition-colors z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8 text-center bg-gray-50 dark:bg-gray-700/30">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">🎨</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('dashboard.share.title')}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            {t('dashboard.share.subtitle')}
                        </p>
                    </div>

                    <div className="p-6">
                        <button
                            onClick={handleShare}
                            disabled={isSharing}
                            className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-lg transition-all ${isSharing
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
                                }`}
                        >
                            {isSharing ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>{t('dashboard.share.preparing')}</span>
                                </>
                            ) : (
                                <>
                                    {typeof navigator.share === 'function' ? <Share2 className="w-6 h-6" /> : <Download className="w-6 h-6" />}
                                    <span>{typeof navigator.share === 'function' ? t('dashboard.share.shareNow') : t('dashboard.share.download')}</span>
                                </>
                            )}
                        </button>
                    </div>

                </motion.div>
            </motion.div>

            {/* Hidden Cards for Image Generation */}
            <div className="fixed top-0 left-0 pointer-events-none z-[-1]">
                {type === 'streak' && (
                    <StreakShareCard
                        id="streak-share-card"
                        streakDays={data.streakDays}
                        userName={data.userName}
                    />
                )}
                {type === 'daily_summary' && (
                    <DailySummaryShareCard
                        id="daily-share-card"
                        date={data.date}
                        calories={data.stats.calories}
                        protein={data.stats.protein}
                        carbs={data.stats.carbs}
                        fat={data.stats.fat}
                    />
                )}
            </div>
        </AnimatePresence>
    )
}
