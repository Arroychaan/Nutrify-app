'use client'

import { motion } from 'framer-motion'
import { Utensils, Bot, PenSquare, BarChart } from 'lucide-react'
import Link from 'next/link'

const actions = [
    {
        title: 'Rencana Makan',
        desc: 'Lihat menu minggu ini',
        icon: Utensils,
        color: 'forest',
        href: '/meal-plan'
    },
    {
        title: 'Coach AI',
        desc: 'Tanya soal nutrisi',
        icon: Bot,
        color: 'amber',
        href: '/chat'
    },
    {
        title: 'Catat Makanan',
        desc: 'Lacak kalori Anda',
        icon: PenSquare,
        color: 'terracotta',
        href: '/dashboard/food-log'
    },
    {
        title: 'Kemajuan',
        desc: 'Lihat statistik Anda',
        icon: BarChart,
        color: 'brown',
        href: '/dashboard/progress'
    }
]

const colorMap: Record<string, string> = {
    forest: 'bg-secondary-50 dark:bg-secondary-950/20 text-secondary dark:text-secondary-400',
    amber: 'bg-accent-50 dark:bg-accent-950/20 text-accent-700 dark:text-accent-400',
    terracotta: 'bg-primary-action-50 dark:bg-primary-action-950/20 text-primary-action dark:text-primary-action-400',
    brown: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
}

export function QuickActions() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, index) => (
                <Link href={action.href} key={action.title}>
                    <motion.div
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm h-full flex flex-col items-start gap-4 transition-shadow hover:shadow-lg"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[action.color]}`}>
                            <action.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-neutral-900 dark:text-white font-display mb-1">{action.title}</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{action.desc}</p>
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>
    )
}
