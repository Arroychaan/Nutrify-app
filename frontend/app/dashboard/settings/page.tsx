'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    User,
    Settings,
    Bell,
    Weight,
    Shield,
    Moon,
    Sun,
    LogOut,
    ChevronRight,
    Palette,
    Globe,
    Lock,
    Trash2,
    HelpCircle,
    Info,
    Heart,
    Target,
    Activity
} from 'lucide-react'
import { authApi } from '@/lib/api'
import Toast from '@/components/Toast'

export default function SettingsPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as any })

    useEffect(() => {
        loadUser()

        // Check dark mode
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}')
        const isDark = settings.theme === 'dark' ||
            (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        setIsDarkMode(isDark)
    }, [])

    const loadUser = async () => {
        try {
            const res = await authApi.me()
            setUser(res.data || res)
        } catch (error) {
            console.error('Failed to load user', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode
        setIsDarkMode(newDarkMode)

        if (newDarkMode) {
            document.documentElement.classList.add('dark')
            document.documentElement.style.colorScheme = 'dark'
        } else {
            document.documentElement.classList.remove('dark')
            document.documentElement.style.colorScheme = 'light'
        }

        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}')
        settings.theme = newDarkMode ? 'dark' : 'light'
        localStorage.setItem('appSettings', JSON.stringify(settings))

        setToast({
            isVisible: true,
            message: newDarkMode ? 'Mode Gelap aktif' : 'Mode Terang aktif',
            type: 'success'
        })
    }

    const handleLogout = () => {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            authApi.logout()
            router.push('/')
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
                    setToast({ isVisible: true, message: 'Gagal menghapus akun', type: 'error' })
                }
            }
        }
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
                <div className="mb-8 p-2 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded" />
                    </div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
                    ))}
                </div>
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

            <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola akun dan preferensi aplikasi</p>
                </div>

                {/* User Card - Minimalist */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link href="/dashboard/settings/profile" className="flex items-center gap-4 group p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-all">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                {user?.fullName || 'Pengguna'}
                            </h2>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                        <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm text-gray-300 group-hover:text-emerald-500 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </Link>
                </motion.div>

                {/* Account & Profil */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-500 ml-2 uppercase tracking-wider text-xs">Akun & Profil</h3>
                    <div className="space-y-2">
                        <SettingsLink
                            href="/dashboard/settings/profile"
                            icon={<User className="w-5 h-5 text-emerald-600" />}
                            title="Profil Saya"
                            description="Nama, email, tanggal lahir"
                        />
                        <SettingsLink
                            href="/dashboard/settings/weight"
                            icon={<Weight className="w-5 h-5 text-green-600" />}
                            title="Berat Badan & Target"
                            description="Berat saat ini, target, tinggi badan"
                        />
                        <SettingsLink
                            href="/dashboard/settings/health"
                            icon={<Heart className="w-5 h-5 text-teal-600" />}
                            title="Kondisi Kesehatan"
                            description="Alergi, kondisi medis, diet"
                        />
                        <SettingsLink
                            href="/dashboard/settings/goals"
                            icon={<Target className="w-5 h-5 text-emerald-500" />}
                            title="Target Nutrisi"
                            description="Target kalori, protein, karbo, lemak"
                        />
                    </div>
                </div>

                {/* Notifications */}
                <div className="space-y-3 pt-4">
                    <h3 className="text-sm font-semibold text-gray-500 ml-2 uppercase tracking-wider text-xs">Notifikasi</h3>
                    <div>
                        <SettingsLink
                            href="/dashboard/notifications"
                            icon={<Bell className="w-5 h-5 text-emerald-600" />}
                            title="Pengaturan Notifikasi"
                            description="Pengingat makan, streak, tips harian"
                        />
                    </div>
                </div>

                {/* Tampilan */}
                <div className="space-y-3 pt-4">
                    <h3 className="text-sm font-semibold text-gray-500 ml-2 uppercase tracking-wider text-xs">Tampilan</h3>
                    <div className="space-y-2">
                        {/* Dark Mode Toggle - Standalone */}
                        <button
                            onClick={toggleDarkMode}
                            className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-transparent hover:border-emerald-100 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                                    {isDarkMode ? <Moon className="w-5 h-5 text-emerald-600" /> : <Sun className="w-5 h-5 text-emerald-600" />}
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">Mode Gelap</p>
                                    <p className="text-xs text-gray-500">{isDarkMode ? 'Aktif' : 'Nonaktif'}</p>
                                </div>
                            </div>
                            <div className={`relative w-11 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </button>

                        <SettingsLink
                            href="/dashboard/settings/language"
                            icon={<Globe className="w-5 h-5 text-teal-600" />}
                            title="Bahasa"
                            description="Indonesia"
                        />
                    </div>
                </div>

                {/* Keamanan & Privasi */}
                <div className="space-y-3 pt-4">
                    <h3 className="text-sm font-semibold text-gray-500 ml-2 uppercase tracking-wider text-xs">Keamanan</h3>
                    <div className="space-y-2">
                        <SettingsLink
                            href="/dashboard/settings/password"
                            icon={<Lock className="w-5 h-5 text-emerald-600" />}
                            title="Ubah Password"
                            description="Perbarui kata sandi akun Anda"
                        />
                        <SettingsLink
                            href="/dashboard/settings/privacy"
                            icon={<Shield className="w-5 h-5 text-green-600" />}
                            title="Privasi Data"
                            description="Kelola data dan ekspor"
                        />
                    </div>
                </div>

                {/* Bantuan */}
                <div className="space-y-3 pt-4">
                    <h3 className="text-sm font-semibold text-gray-500 ml-2 uppercase tracking-wider text-xs">Lainnya</h3>
                    <div className="space-y-2">
                        <SettingsLink
                            href="/help"
                            icon={<HelpCircle className="w-5 h-5 text-teal-500" />}
                            title="Pusat Bantuan"
                            description="FAQ dan panduan penggunaan"
                        />
                        <SettingsLink
                            href="/about"
                            icon={<Info className="w-5 h-5 text-emerald-500" />}
                            title="Tentang Aplikasi"
                            description="Versi 1.0.0"
                        />
                    </div>
                </div>

                {/* Danger Zone - Flat Buttons */}
                <div className="space-y-3 pt-6">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        <span className="flex items-center gap-3">
                            <LogOut className="w-5 h-5" />
                            Keluar dari Akun
                        </span>
                    </button>

                    <button
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center justify-center gap-2 p-3 text-red-400 text-sm hover:text-red-600 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Hapus Akun Permanen
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 pt-8 pb-4">
                    Nutrify v1.0.0 • Made with 💚 by Arroychaan
                </p>
            </div>
        </>
    )
}

// Settings Link Component - Flat Block Style
function SettingsLink({
    href,
    icon,
    title,
    description
}: {
    href: string
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <Link
            href={href}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900 transition-all group"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                    {icon}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {title}
                    </h4>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
        </Link>
    )
}
