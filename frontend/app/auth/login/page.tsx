'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, Loader2, Leaf, Sparkles } from 'lucide-react'
import { GradientButton } from '@/components/ui/GradientButton'
import { GlassCard } from '@/components/ui/GlassCard'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authApi.login(formData)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Cek email dan password Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 -left-48 w-96 h-96 bg-emerald-200/40 dark:bg-emerald-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-48 w-[500px] h-[500px] bg-teal-200/40 dark:bg-teal-900/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-cyan-200/30 dark:bg-cyan-900/20 rounded-full blur-3xl" />

      {/* Left Panel - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12">
        <div className="max-w-md">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-gray-900 dark:text-white">Nutrify</span>
          </Link>

          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Selamat Datang
            <span className="block text-emerald-500">Kembali! 👋</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
            Lanjutkan perjalanan sehatmu dengan Nutrify.
            AI nutritionist personal yang memahami kebutuhanmu.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="!p-4 bg-white/40 dark:bg-gray-800/40">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">1000+</div>
              <div className="text-gray-500 text-sm">Makanan Lokal</div>
            </GlassCard>
            <GlassCard className="!p-4 bg-white/40 dark:bg-gray-800/40">
              <div className="flex items-center gap-1 text-2xl font-bold text-gray-900 dark:text-white mb-1">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                AI
              </div>
              <div className="text-gray-500 text-sm">Powered</div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Mobile Header */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Nutrify</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Masuk
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Belum punya akun?{' '}
                <Link href="/auth/register" className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
                  Daftar gratis
                </Link>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="nama@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3.5 pr-12 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <GradientButton type="submit" isLoading={loading} className="w-full">
                Masuk
              </GradientButton>
            </form>
          </div>

          {/* Bottom Link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
