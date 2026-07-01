'use client'

import Link from 'next/link'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Leaf, CheckCircle } from 'lucide-react'
import { GradientButton } from '@/components/ui/GradientButton'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Password tidak cocok')
            setLoading(false)
            return
        }

        if (formData.newPassword.length < 8) {
            setError('Password minimal 8 karakter')
            setLoading(false)
            return
        }

        if (!token) {
            setError('Token tidak valid atau kadaluarsa. Silakan minta link reset baru.')
            setLoading(false)
            return
        }

        try {
            await authApi.resetPassword(token, formData.newPassword)
            setSuccess(true)
            setTimeout(() => {
                router.push('/auth/login')
            }, 3000)
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Gagal mereset password.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Berhasil!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Password Anda telah diperbarui. Mengalihkan ke halaman login...
                </p>
                <Link href="/auth/login">
                    <GradientButton className="w-full">Login Sekarang</GradientButton>
                </Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {!token && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-xl text-yellow-700 dark:text-yellow-400 text-sm mb-4">
                    Token reset password tidak ditemukan. Pastikan Anda membuka link dari email.
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password Baru
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-10 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                        placeholder="Minimal 8 karakter"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Konfirmasi Password
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-10 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                        placeholder="Ulangi password baru"
                    />
                </div>
            </div>

            <GradientButton type="submit" isLoading={loading} disabled={!token} className="w-full">
                Reset Password
            </GradientButton>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Leaf className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white font-display">AI Ate Indonesia</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-display">Buat Password Baru</h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700"
                >
                    <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </motion.div>
            </div>
        </div>
    )
}
