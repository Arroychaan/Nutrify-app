'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Heart,
    Github,
    Globe,
    Sparkles,
    Shield,
    Zap,
    Users
} from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link
                        href="/dashboard/settings"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tentang Nutrify</h1>
                        <p className="text-sm text-gray-500">Informasi aplikasi</p>
                    </div>
                </div>

                {/* App Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center mb-6"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
                        <span className="text-3xl font-bold text-white">N</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Nutrify</h2>
                    <p className="text-gray-500 mb-4">Partner Kesehatanmu</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Versi 1.0.0</span>
                    </div>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6"
                >
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Fitur Utama</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">AI Cerdas</p>
                                <p className="text-xs text-gray-500">Pengenalan makanan otomatis</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Zap className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">Meal Plan</p>
                                <p className="text-xs text-gray-500">Rencana makan personal</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Shield className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">Kesehatan</p>
                                <p className="text-xs text-gray-500">Sesuai kondisi medis</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Users className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">Indonesia</p>
                                <p className="text-xs text-gray-500">Makanan lokal lengkap</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Mission */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white mb-6"
                >
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        Misi Kami
                    </h3>
                    <p className="text-emerald-100 text-sm leading-relaxed">
                        Membantu masyarakat Indonesia menjalani gaya hidup sehat dengan memudahkan
                        pelacakan nutrisi dan memberikan rekomendasi makanan yang dipersonalisasi
                        berdasarkan budaya, kondisi kesehatan, dan preferensi masing-masing.
                    </p>
                </motion.div>

                {/* Tech Stack */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6"
                >
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Teknologi</h3>
                    <div className="flex flex-wrap gap-2">
                        {['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Gemini AI', 'Tailwind CSS'].map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center gap-4"
                >
                    <a
                        href="https://github.com/nutrify-app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:opacity-90 transition-opacity"
                    >
                        <Github className="w-4 h-4" />
                        GitHub
                    </a>
                    <a
                        href="https://nutrify.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                        <Globe className="w-4 h-4" />
                        Website
                    </a>
                </motion.div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-8">
                    Dibuat dengan ❤️ di Indonesia<br />
                    © 2024 Nutrify. Semua hak dilindungi.
                </p>
            </div>
        </div>
    )
}
