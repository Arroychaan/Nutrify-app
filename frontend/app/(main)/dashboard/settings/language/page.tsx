'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { useSettings } from '@/lib/AppContext'
import { t } from '@/lib/translations'

export default function LanguageSettingsPage() {
    const router = useRouter()
    const { settings, updateSettings } = useSettings()

    const handleSelectLanguage = (lang: 'id' | 'en') => {
        updateSettings({ language: lang })
        // Optional: navigate back after brief delay or stay
        // router.back()
    }

    const languages = [
        { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
        { code: 'en', name: 'English', flag: '🇬🇧' }
    ]

    return (
        <div className="max-w-2xl mx-auto pb-24 md:pb-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/dashboard/settings"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('settings.language', settings.language)}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {settings.language === 'id' ? 'Pilih bahasa aplikasi' : 'Select app language'}
                    </p>
                </div>
            </div>

            {/* Language List */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm">
                {languages.map((lang, index) => (
                    <button
                        key={lang.code}
                        onClick={() => handleSelectLanguage(lang.code as 'id' | 'en')}
                        className={`w-full flex items-center justify-between p-5 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors ${index !== languages.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">{lang.flag}</span>
                            <div className="text-left">
                                <p className={`font-semibold text-lg ${settings.language === lang.code
                                        ? 'text-emerald-600'
                                        : 'text-gray-900 dark:text-white'
                                    }`}>
                                    {lang.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {lang.code === 'id' ? 'Indonesian' : 'Inggris'}
                                </p>
                            </div>
                        </div>

                        {settings.language === lang.code && (
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                                <Check className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl flex gap-3 text-emerald-800 dark:text-emerald-200 text-sm">
                <span className="text-xl">💡</span>
                <p>
                    {settings.language === 'id'
                        ? 'Perubahan bahasa akan diterapkan langsung ke seluruh aplikasi.'
                        : 'Language changes will be applied immediately throughout the application.'}
                </p>
            </div>
        </div>
    )
}
