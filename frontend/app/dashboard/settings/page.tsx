'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    User,
    Settings,
    Bell,
    Scale,
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
                <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
                <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
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

                {/* User Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <Link href="/dashboard/settings/profile" className="flex items-center gap-4 group">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                {user?.fullName || 'Pengguna'}
                            </h2>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                    </Link>
                </motion.div>

                {/* Account & Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-emerald-500" />
                            Akun & Profil
                        </h3>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        <SettingsLink
                            href="/dashboard/settings/profile"
                            icon={<User className="w-5 h-5 text-blue-500" />}
                            title="Profil Saya"
                            description="Nama, email, tanggal lahir"
                        />
                        <SettingsLink
                            href="/dashboard/settings/weight"
                            icon={<Scale className="w-5 h-5 text-purple-500" />}
                            title="Berat Badan & Target"
                            description="Berat saat ini, target, tinggi badan"
                        />
                        <SettingsLink
                            href="/dashboard/settings/health"
                            icon={<Heart className="w-5 h-5 text-red-500" />}
                            title="Kondisi Kesehatan"
                            description="Alergi, kondisi medis, diet"
                        />
                        <SettingsLink
                            href="/dashboard/settings/goals"
                            icon={<Target className="w-5 h-5 text-orange-500" />}
                            title="Target Nutrisi"
                            description="Target kalori, protein, karbo, lemak"
                        />
                    </div>
                </motion.div>

                {/* Notifications Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Bell className="w-5 h-5 text-emerald-500" />
                            Notifikasi
                        </h3>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        <SettingsLink
                            href="/dashboard/notifications"
                            icon={<Bell className="w-5 h-5 text-amber-500" />}
                            title="Pengaturan Notifikasi"
                            description="Pengingat makan, streak, tips harian"
                        />
                    </div>
                </motion.div>

                {/* Appearance Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Palette className="w-5 h-5 text-emerald-500" />
                            Tampilan
                        </h3>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                                    {isDarkMode ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900 dark:text-white">Mode Gelap</p>
                                    <p className="text-xs text-gray-500">{isDarkMode ? 'Aktif' : 'Nonaktif'}</p>
                                </div>
                            </div>
                            <div className={`relative w-12 h-7 rounded-full transition-colors ${isDarkMode ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </button>

                        <SettingsLink
                            href="/dashboard/settings/language"
                            icon={<Globe className="w-5 h-5 text-blue-500" />}
                            title="Bahasa"
                            description="Indonesia"
                        />
                    </div>
                </motion.div>

                {/* Security Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-500" />
                            Keamanan & Privasi
                        </h3>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        <SettingsLink
                            href="/dashboard/settings/password"
                            icon={<Lock className="w-5 h-5 text-green-500" />}
                            title="Ubah Password"
                            description="Perbarui kata sandi akun Anda"
                        />
                        <SettingsLink
                            href="/dashboard/settings/privacy"
                            icon={<Shield className="w-5 h-5 text-indigo-500" />}
                            title="Privasi Data"
                            description="Kelola data dan ekspor"
                        />
                    </div>
                </motion.div>

                {/* Help Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-emerald-500" />
                            Bantuan
                        </h3>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        <SettingsLink
                            href="/help"
                            icon={<HelpCircle className="w-5 h-5 text-blue-500" />}
                            title="Pusat Bantuan"
                            description="FAQ dan panduan penggunaan"
                        />
                        <SettingsLink
                            href="/about"
                            icon={<Info className="w-5 h-5 text-gray-500" />}
                            title="Tentang Aplikasi"
                            description="Versi 1.0.0"
                        />
                    </div>
                </motion.div>

                {/* Danger Zone */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                >
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Keluar dari Akun
                    </button>

                    <button
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                        Hapus Akun
                    </button>
                </motion.div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 pt-4">
                    Nutrify © 2024. Semua hak dilindungi.
                </p>
            </div>
        </>
    )
}

// Settings Link Component
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
            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {title}
                    </p>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
        </Link>
    )
}
