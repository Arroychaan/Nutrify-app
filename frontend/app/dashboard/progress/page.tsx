'use client'

import { motion } from 'framer-motion'
import { LineChart, Construction, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'

export default function ProgressPage() {
    return (
        <div className="max-w-4xl mx-auto pb-24 md:pb-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <LineChart className="w-8 h-8 text-blue-500" />
                            Progress & Biomarkers
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Pantau perkembangan kesehatan Anda dari waktu ke waktu
                        </p>
                    </div>
                </div>

                <GlassCard className="p-12 text-center border-dashed border-2 border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Construction className="w-10 h-10 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Fitur Segera Hadir!
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                        Kami sedang membangun dashboard analisis kesehatan yang canggih untuk memantau berat badan, BMI, dan nutrisi Anda.
                    </p>
                    <div className="flex justify-center">
                        <Link href="/dashboard">
                            <GradientButton variant="primary">
                                Kembali ke Dashboard
                            </GradientButton>
                        </Link>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    )
}
