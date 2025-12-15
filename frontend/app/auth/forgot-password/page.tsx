'use client'

import Link from 'next/link'
import { useState } from 'react'
import { authApi } from '@/lib/api'
import { motion } from 'framer-motion'
import { ArrowLeft, Leaf, Mail } from 'lucide-react'
import { GradientButton } from '@/components/ui/GradientButton'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        try {
            await authApi.forgotPassword(email)
            setMessage('Jika email terdaftar, kami akan mengirimkan link reset password.')
        } catch (err: any) {
            setError('Gagal mengirim permintaan. Silakan coba lagi nanti.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Leaf className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white font-display">Nutrify</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-display">Lupa Password?</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Masukkan email Anda untuk menerima link reset password.
                    </p>
                </div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700"
                >
                    {message ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">{message}</p>
                            <Link href="/auth/login">
                                <GradientButton className="w-full">Kembali ke Login</GradientButton>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                                    placeholder="nama@email.com"
                                />
                            </div>

                            <GradientButton type="submit" isLoading={loading} className="w-full">
                                Kirim Link Reset
                            </GradientButton>

                            <div className="text-center">
                                <Link
                                    href="/auth/login"
                                    className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Kembali ke Login
                                </Link>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
