'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
export function DashboardHeader() {
    const [greeting, setGreeting] = useState('Selamat pagi')

    useEffect(() => {
        const hrs = new Date().getHours()
        if (hrs < 12) setGreeting('Selamat pagi')
        else if (hrs < 17) setGreeting('Selamat siang')
        else if (hrs < 19) setGreeting('Selamat sore')
        else setGreeting('Selamat malam')
    }, [])

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
                    {greeting}, Achmad!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Mari jaga keseimbangan nutrisi hidangan Nusantara Anda hari ini.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <Link href="/dashboard/notifications">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 relative hover:border-primary-500/50 transition-colors"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-neutral-800" />
                    </motion.button>
                </Link>

                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                    <Calendar className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                        {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }).format(new Date())}
                    </span>
                </div>
            </div>
        </div>
    )
}
