'use client'

import { useState, useEffect } from 'react'
import { authApi } from '@/lib/api'
import { GradientButton } from '@/components/ui/GradientButton'
import { Shield, Smartphone, ArrowLeft, Check, Lock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SecurityPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [is2FAEnabled, setIs2FAEnabled] = useState(false)
    const [setupData, setSetupData] = useState<{ secret: string; qrCodeUrl: string } | null>(null)
    const [verificationCode, setVerificationCode] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        loadUser()
    }, [])

    const loadUser = async () => {
        try {
            const res = await authApi.me()
            const user = res.data || res
            setIs2FAEnabled(user.isTwoFactorEnabled || false)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleStartSetup = async () => {
        setError('')
        try {
            const res = await authApi.generate2FA()
            setSetupData(res)
        } catch (e: any) {
            setError(e.response?.data?.message || 'Gagal memulai setup 2FA')
        }
    }

    const handleVerifySetup = async () => {
        setError('')
        try {
            await authApi.verify2FA(verificationCode)
            setSuccess('Autentikasi 2 Faktor berhasil diaktifkan!')
            setSetupData(null)
            setIs2FAEnabled(true)
            setVerificationCode('')
        } catch (e: any) {
            setError(e.response?.data?.message || 'Kode verifikasi salah')
        }
    }

    const handleDisable = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        try {
            await authApi.disable2FA(password)
            setSuccess('Autentikasi 2 Faktor berhasil dinonaktifkan')
            setIs2FAEnabled(false)
            setPassword('')
        } catch (e: any) {
            setError(e.response?.data?.message || 'Gagal menonaktifkan 2FA. Cek password Anda.')
        }
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-8">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <Link href="/dashboard/settings" className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Keamanan</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola keamanan akun Anda</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${is2FAEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Two-Factor Authentication (2FA)</h2>
                            {is2FAEnabled && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">Aktif</span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Tambahkan lapisan keamanan ekstra dengan kode verifikasi setiap kali Anda login.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-xl border border-emerald-100">
                        {success}
                    </div>
                )}

                {/* State: 2FA Disabled & Setup not started */}
                {!is2FAEnabled && !setupData && (
                    <div className="mt-4">
                        <GradientButton onClick={handleStartSetup}>
                            Aktifkan 2FA
                        </GradientButton>
                    </div>
                )}

                {/* State: Setup in progress */}
                {!is2FAEnabled && setupData && (
                    <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                1. Scan QR Code ini dengan aplikasi Authenticator Anda (Google Authenticator, Authy, dll).
                            </p>
                            <div className="flex justify-center bg-white p-4 rounded-xl inline-block mx-auto mb-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <Image
                                    src={setupData.qrCodeUrl}
                                    alt="2FA QR Code"
                                    width={192}
                                    height={192}
                                    className="w-48 h-48"
                                    unoptimized
                                />
                            </div>
                            <p className="text-xs text-gray-400 font-mono select-all">
                                Secret: {setupData.secret}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                2. Masukkan kode 6 digit dari aplikasi.
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-center tracking-widest font-mono text-lg"
                                    placeholder="000 000"
                                />
                                <button
                                    onClick={handleVerifySetup}
                                    disabled={verificationCode.length !== 6}
                                    className="px-6 py-2 bg-emerald-500 text-white rounded-xl disabled:opacity-50 font-medium"
                                >
                                    Verifikasi
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* State: 2FA Enabled (Disable Option) */}
                {is2FAEnabled && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Nonaktifkan 2FA</h3>
                        <form onSubmit={handleDisable} className="flex gap-3 items-end">
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">Konfirmasi Password Anda</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm"
                                        placeholder="Password saat ini"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={!password}
                                className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors cursor-pointer border border-red-100"
                            >
                                Nonaktifkan
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}
