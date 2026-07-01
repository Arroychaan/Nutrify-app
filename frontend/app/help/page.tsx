'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    HelpCircle,
    ChevronDown,
    MessageSquare,
    Mail,
    Utensils,
    Camera,
    Target,
    Bot,
    Scale,
    Bell
} from 'lucide-react'

const faqs = [
    {
        category: 'Umum',
        items: [
            {
                question: 'Apa itu AI Ate Indonesia?',
                answer: 'AI Ate Indonesia adalah aplikasi pelacak nutrisi yang membantu Anda memantau asupan makanan harian, membuat meal plan yang dipersonalisasi, dan memberikan saran kesehatan berdasarkan profil Anda.'
            },
            {
                question: 'Apakah AI Ate Indonesia gratis?',
                answer: 'Ya! AI Ate Indonesia gratis untuk digunakan dengan semua fitur dasar. Kami mungkin akan menambahkan fitur premium di masa depan, tetapi fitur inti akan tetap gratis.'
            }
        ]
    },
    {
        category: 'Log Makan',
        items: [
            {
                question: 'Bagaimana cara mencatat makanan?',
                answer: 'Anda dapat mencatat makanan dengan 3 cara: (1) Ketik nama makanan secara manual, (2) Foto makanan dan AI akan mengenalinya, (3) Pilih dari riwayat makanan Anda sebelumnya.'
            },
            {
                question: 'Apakah AI bisa mengenali makanan Indonesia?',
                answer: 'Ya! AI kami dilatih khusus untuk mengenali berbagai makanan Indonesia seperti nasi goreng, rendang, soto, gado-gado, dan ratusan makanan lokal lainnya.'
            },
            {
                question: 'Bagaimana jika AI salah mengenali makanan?',
                answer: 'Anda selalu dapat mengedit hasil pengenalan AI sebelum menyimpan. Semakin sering Anda menggunakan aplikasi, semakin akurat hasil pengenalan.'
            }
        ]
    },
    {
        category: 'Target & Nutrisi',
        items: [
            {
                question: 'Bagaimana target kalori dihitung?',
                answer: 'Target kalori dihitung menggunakan formula Mifflin-St Jeor berdasarkan berat badan, tinggi badan, usia, jenis kelamin, dan tingkat aktivitas Anda.'
            },
            {
                question: 'Apakah target bisa disesuaikan manual?',
                answer: 'Saat ini target dihitung otomatis. Anda dapat mengubahnya dengan memperbarui data fisik dan tingkat aktivitas di Pengaturan > Berat Badan & Target.'
            }
        ]
    },
    {
        category: 'Meal Plan',
        items: [
            {
                question: 'Bagaimana meal plan dibuat?',
                answer: 'Meal plan dibuat oleh AI berdasarkan target kalori, preferensi budaya, kondisi kesehatan (seperti diabetes atau hipertensi), dan alergi makanan Anda.'
            },
            {
                question: 'Bisa minta ganti menu?',
                answer: 'Tentu! Anda dapat meminta AI untuk mengganti menu tertentu melalui fitur Chat AI dengan pesan seperti "Ganti menu makan siang hari ini dengan yang lebih ringan".'
            }
        ]
    },
    {
        category: 'Chat AI',
        items: [
            {
                question: 'Apa saja yang bisa ditanyakan ke AI?',
                answer: 'AI dapat membantu: membuat meal plan, saran makanan sesuai kondisi kesehatan, informasi nutrisi, resep sehat, dan tips kesehatan umum.'
            },
            {
                question: 'Apakah AI menggantikan dokter?',
                answer: 'Tidak. AI memberikan informasi umum tentang nutrisi. Untuk masalah kesehatan serius, selalu konsultasikan dengan dokter atau ahli gizi profesional.'
            }
        ]
    }
]

export default function HelpPage() {
    const [openCategory, setOpenCategory] = useState<string | null>('Umum')
    const [openQuestion, setOpenQuestion] = useState<string | null>(null)

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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pusat Bantuan</h1>
                        <p className="text-sm text-gray-500">FAQ dan panduan penggunaan</p>
                    </div>
                </div>

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white text-center mb-8"
                >
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HelpCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Ada pertanyaan?</h2>
                    <p className="text-emerald-100">Temukan jawaban di FAQ atau hubungi kami</p>
                </motion.div>

                {/* FAQ Categories */}
                <div className="space-y-4">
                    {faqs.map((category, catIndex) => (
                        <motion.div
                            key={category.category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: catIndex * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenCategory(openCategory === category.category ? null : category.category)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <span className="font-bold text-gray-900 dark:text-white">{category.category}</span>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openCategory === category.category ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {openCategory === category.category && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-4 space-y-2">
                                            {category.items.map((item) => (
                                                <div key={item.question} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                                                    <button
                                                        onClick={() => setOpenQuestion(openQuestion === item.question ? null : item.question)}
                                                        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                    >
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.question}</span>
                                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${openQuestion === item.question ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    <AnimatePresence>
                                                        {openQuestion === item.question && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <p className="px-3 pb-3 text-sm text-gray-500 dark:text-gray-400">
                                                                    {item.answer}
                                                                </p>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center"
                >
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Masih butuh bantuan?</h3>
                    <p className="text-sm text-gray-500 mb-4">Tim kami siap membantu Anda</p>
                    <div className="flex justify-center gap-3">
                        <a
                            href="mailto:support@aiate.app"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            Email Kami
                        </a>
                        <Link
                            href="/dashboard/chat"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Chat AI
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
