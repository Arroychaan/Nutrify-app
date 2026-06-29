'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Lock,
    Eye,
    EyeOff,
    Save,
    Loader2,
    ShieldCheck
} from 'lucide-react'
import { authApi } from '@/lib/api'
import Toast from '@/components/Toast'

export default function PasswordSettingsPage() {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as any })
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    })
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Password saat ini wajib diisi'
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'Password baru wajib diisi'
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password minimal 8 karakter'
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Konfirmasi password wajib diisi'
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Password tidak cocok'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) return

        try {
            setSaving(true)
            await authApi.changePassword(formData.currentPassword, formData.newPassword)
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setToast({
                isVisible: true,
                message: 'Password berhasil diubah! 🔒',
                type: 'success'
            })
        } catch (error: any) {
            setToast({
                isVisible: true,
                message: error.response?.data?.error?.message || 'Gagal mengubah password',
                type: 'error'
            })
        } finally {
            setSaving(false)
        }
    }

    const toggleShowPassword = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] })
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ubah Password</h1>
                        <p className="text-sm text-gray-500">Perbarui kata sandi akun Anda</p>
                    </div>
                </div>

                {/* Security Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 flex gap-3"
                >
                    <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-emerald-700 dark:text-emerald-300">
                        <p className="font-medium mb-1">Tips Password Aman</p>
                        <ul className="text-emerald-600 dark:text-emerald-400 space-y-1 text-xs">
                            <li>• Gunakan minimal 8 karakter</li>
                            <li>• Kombinasikan huruf besar, kecil, dan angka</li>
                            <li>• Hindari menggunakan informasi personal</li>
                        </ul>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-5"
                >
                    {/* Current Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Password Saat Ini
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={formData.currentPassword}
                                onChange={(e) => {
                                    setFormData({ ...formData, currentPassword: e.target.value })
                                    setErrors({ ...errors, currentPassword: '' })
                                }}
                                className={`w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none ${errors.currentPassword ? 'border-red-300 dark:border-red-700' : 'border-transparent'
                                    }`}
                                placeholder="Masukkan password saat ini"
                            />
                            <button
                                type="button"
                                onClick={() => toggleShowPassword('current')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.currentPassword && (
                            <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>
                        )}
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Password Baru
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={(e) => {
                                    setFormData({ ...formData, newPassword: e.target.value })
                                    setErrors({ ...errors, newPassword: '' })
                                }}
                                className={`w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none ${errors.newPassword ? 'border-red-300 dark:border-red-700' : 'border-transparent'
                                    }`}
                                placeholder="Minimal 8 karakter"
                            />
                            <button
                                type="button"
                                onClick={() => toggleShowPassword('new')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
                        )}
                        {formData.newPassword && formData.newPassword.length >= 8 && (
                            <p className="text-xs text-emerald-500 mt-1">✓ Password cukup kuat</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Konfirmasi Password Baru
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => {
                                    setFormData({ ...formData, confirmPassword: e.target.value })
                                    setErrors({ ...errors, confirmPassword: '' })
                                }}
                                className={`w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none ${errors.confirmPassword ? 'border-red-300 dark:border-red-700' : 'border-transparent'
                                    }`}
                                placeholder="Masukkan ulang password baru"
                            />
                            <button
                                type="button"
                                onClick={() => toggleShowPassword('confirm')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                        )}
                        {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                            <p className="text-xs text-emerald-500 mt-1">✓ Password cocok</p>
                        )}
                    </div>
                </motion.div>

                {/* Save Button */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
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
                            Ubah Password
                        </>
                    )}
                </motion.button>
            </div>
        </>
    )
}
