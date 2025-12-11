'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    User,
    Mail,
    Calendar,
    Save,
    Loader2
} from 'lucide-react'
import { authApi } from '@/lib/api'
import Toast from '@/components/Toast'

export default function ProfileSettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as any })
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        dateOfBirth: '',
        gender: '',
        phoneNumber: ''
    })

    useEffect(() => {
        loadUser()
    }, [])

    const loadUser = async () => {
        try {
            const res = await authApi.me()
            const user = res.data || res
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                gender: user.gender || '',
                phoneNumber: user.phoneNumber || ''
            })
        } catch (error) {
            console.error('Failed to load user', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            await authApi.updateProfile(formData)
            setToast({ isVisible: true, message: 'Profil berhasil diperbarui! ✅', type: 'success' })
        } catch (error: any) {
            setToast({
                isVisible: true,
                message: error.response?.data?.error?.message || 'Gagal menyimpan',
                type: 'error'
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-xl mx-auto animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
            </div>
        )
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Saya</h1>
                        <p className="text-sm text-gray-500">Edit informasi personal</p>
                    </div>
                </div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-5"
                >
                    {/* Full Name */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                            <User className="w-4 h-4" /> Nama Lengkap
                        </label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Nama lengkap Anda"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-600 border-none rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Tanggal Lahir
                        </label>
                        <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Jenis Kelamin
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, gender: 'male' })}
                                className={`p-3 rounded-xl font-medium transition-all ${formData.gender === 'male'
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    }`}
                            >
                                👨 Laki-laki
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, gender: 'female' })}
                                className={`p-3 rounded-xl font-medium transition-all ${formData.gender === 'female'
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    }`}
                            >
                                👩 Perempuan
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Save Button */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Simpan Perubahan
                        </>
                    )}
                </motion.button>
            </div>
        </>
    )
}
