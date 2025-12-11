'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Globe,
    Check
} from 'lucide-react'
import Toast from '@/components/Toast'

const languages = [
    { id: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', available: true },
    { id: 'en', name: 'English', flag: '🇺🇸', available: false },
    { id: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾', available: false },
]

export default function LanguageSettingsPage() {
    const router = useRouter()
    const [selectedLang, setSelectedLang] = useState('id')
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as any })

    const handleSelectLanguage = (langId: string) => {
        const lang = languages.find(l => l.id === langId)
        if (!lang?.available) {
            setToast({
                isVisible: true,
                message: 'Bahasa ini akan segera tersedia!',
                type: 'info'
            })
            return
        }
        setSelectedLang(langId)
        setToast({
            isVisible: true,
            message: 'Bahasa berhasil diubah! ✅',
            type: 'success'
        })
    }

    return (
        <>
            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />

            <div className="max-w-xl mx-auto space-y-6 pb-24 md:pb-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bahasa</h1>
                        <p className="text-sm text-gray-500">Pilih bahasa aplikasi</p>
                    </div>
                </div>

                {/* Language List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    {languages.map((lang, index) => (
                        <button
                            key={lang.id}
                            onClick={() => handleSelectLanguage(lang.id)}
                            className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${index !== languages.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">{lang.flag}</span>
                                <div className="text-left">
                                    <p className={`font-semibold ${lang.available ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                        {lang.name}
                                    </p>
                                    {!lang.available && (
                                        <p className="text-xs text-gray-400">Segera hadir</p>
                                    )}
                                </div>
                            </div>
                            {selectedLang === lang.id && lang.available && (
                                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </motion.div>

                {/* Info */}
                <p className="text-center text-xs text-gray-400">
                    Bahasa lain akan ditambahkan di pembaruan mendatang
                </p>
            </div>
        </>
    )
}
