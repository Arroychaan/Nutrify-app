'use client'

import { motion } from 'framer-motion'
import { Egg } from 'lucide-react'

export function TipCard() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-6 sm:p-8 flex items-center gap-6 h-full relative overflow-hidden"
        >
            {/* Decorative Circle */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 dark:bg-emerald-800/20 rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="w-16 h-16 bg-white dark:bg-emerald-900 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0 z-10">
                <Egg className="w-8 h-8 fill-current" />
            </div>

            <div className="z-10">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-display mb-2">
                    Sarapan Berprotein
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                    Mulai harimu dengan benar! Tinggi protein di pagi hari membuat kenyang lebih lama.
                </p>
            </div>
        </motion.div>
    )
}
