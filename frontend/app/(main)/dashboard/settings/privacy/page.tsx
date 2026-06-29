'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Shield,
    Download,
    Trash2,
    Eye,
    EyeOff,
    FileText,
    Database,
    Loader2
} from 'lucide-react'
import { authApi } from '@/lib/api'
import Toast from '@/components/Toast'

export default function PrivacySettingsPage() {
    const router = useRouter()
    const [exporting, setExporting] = useState(false)
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as any })

    const handleExportData = async () => {
        setExporting(true)
        try {
            // Simulate export - in real implementation would call backend
            await new Promise(resolve => setTimeout(resolve, 2000))
            setToast({
                isVisible: true,
                message: 'Data Anda akan dikirim ke email dalam beberapa menit',
                type: 'success'
            })
        } catch (error) {
            setToast({
                isVisible: true,
                message: 'Gagal mengekspor data',
                type: 'error'
            })
        } finally {
            setExporting(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (confirm('PERINGATAN: Ini akan menghapus akun Anda secara permanen. Lanjutkan?')) {
            if (confirm('Apakah Anda benar-benar yakin? Tindakan ini tidak dapat dibatalkan.')) {
                try {
                    await authApi.deleteAccount()
                    authApi.logout()
                    router.push('/')
                } catch (error) {
                    setToast({
                        isVisible: true,
                        message: 'Gagal menghapus akun',
                        type: 'error'
                    })
                }
            }
        }
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Privasi Data</h1>
                        <p className="text-sm text-gray-500">Kelola data dan privasi Anda</p>
                    </div>
                </div>

                {/* Data Management */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4"
                >
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Database className="w-5 h-5 text-emerald-500" />
                        Pengelolaan Data
                    </h3>

                    <div className="space-y-3">
                        <button
                            onClick={handleExportData}
                            disabled={exporting}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Download className="w-5 h-5 text-blue-500" />
                                <div className="text-left">
                                    <p className="font-medium text-gray-900 dark:text-white">Ekspor Data Saya</p>
                                    <p className="text-xs text-gray-500">Unduh semua data Anda dalam format JSON</p>
                                </div>
                            </div>
                            {exporting && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                        </button>

                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <div className="flex items-center gap-3 mb-2">
                                <FileText className="w-5 h-5 text-purple-500" />
                                <p className="font-medium text-gray-900 dark:text-white">Kebijakan Privasi</p>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">
                                Kami menjaga privasi data Anda dengan serius. Data kesehatan dan nutrisi Anda disimpan dengan aman dan tidak dibagikan kepada pihak ketiga.
                            </p>
                            <a
                                href="/privacy-policy"
                                className="text-xs text-emerald-600 hover:underline font-medium"
                            >
                                Baca Kebijakan Privasi Lengkap →
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* Data Usage */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-emerald-500" />
                        Penggunaan Data
                    </h3>

                    <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                            <p>Data nutrisi harian Anda digunakan untuk memberikan rekomendasi personalisasi.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                            <p>Kondisi kesehatan digunakan untuk menyesuaikan saran makanan dan meal plan.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                            <p>Data tidak pernah dijual atau dibagikan ke pengiklan.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Danger Zone */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-red-50 dark:bg-red-900/20 rounded-3xl p-6 border border-red-100 dark:border-red-900/30"
                >
                    <h3 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mb-4">
                        <Trash2 className="w-5 h-5" />
                        Zona Berbahaya
                    </h3>

                    <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                        Menghapus akun akan menghapus semua data Anda secara permanen, termasuk log makanan, meal plan, dan riwayat chat AI.
                    </p>

                    <button
                        onClick={handleDeleteAccount}
                        className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-5 h-5" />
                        Hapus Akun Permanen
                    </button>
                </motion.div>
            </div>
        </>
    )
}
