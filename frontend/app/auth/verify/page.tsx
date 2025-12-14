'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import { motion } from 'framer-motion'
import { Check, X, Loader2, Leaf, ArrowLeft } from 'lucide-react'

export default function VerifyEmailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('Memverifikasi email Anda...')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage('Token verifikasi tidak ditemukan.')
            return
        }

        const verify = async () => {
            try {
                await authApi.verifyEmail(token)
                setStatus('success')
                setMessage('Email Anda berhasil diverifikasi! Anda sekarang dapat masuk.')
            } catch (error: any) {
                setStatus('error')
                setMessage(error.response?.data?.error?.message || 'Verifikasi gagal. Link mungkin sudah kadaluarsa atau tidak valid.')
            }
        }

        // Small delay for UX so it doesn't flash too fast
        const timer = setTimeout(() => {
            verify()
        }, 1000)

        return () => clearTimeout(timer)
    }, [token])

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-emerald-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex relative overflow-hidden">
            {/* Decorative Blobs */}
            <div className="absolute top-0 -right-48 w-96 h-96 bg-teal-200/40 dark:bg-teal-900/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -left-48 w-[500px] h-[500px] bg-emerald-200/40 dark:bg-emerald-900/20 rounded-full blur-3xl" />

            {/* Main Container */}
            <div className="w-full flex items-center justify-center px-6 py-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 text-center"
                >
                    {/* Logo */}
                    <Link href="/" className="inline-flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Leaf className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">Nutrify</span>
                    </Link>

                    {status === 'loading' && (
                        <div className="py-8">
                            <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verifikasi Email</h2>
                            <p className="text-gray-500 dark:text-gray-400">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-8">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verifikasi Berhasil!</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-8">{message}</p>

                            <Link
                                href="/auth/login"
                                className="inline-block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-2xl transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                Masuk ke Akun
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="py-8">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verifikasi Gagal</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-8">{message}</p>

                            <Link
                                href="/auth/register"
                                className="inline-block w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-4 px-4 rounded-2xl transition-colors"
                            >
                                Kembali ke Registrasi
                            </Link>
                        </div>
                    )}

                </motion.div>
            </div>
        </div>
    )
}
