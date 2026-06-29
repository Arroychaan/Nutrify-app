'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, Loader2, Sparkles } from 'lucide-react'
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
  const [requires2FA, setRequires2FA] = useState(false)
  const [totpCode, setTotpCode] = useState('')
  const [isDeactivated, setIsDeactivated] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isDeactivated) {
        await authApi.restore(formData)
        // Auto login after restore
        router.push('/dashboard')
      } else {
        await authApi.login({ ...formData, totpCode: requires2FA ? totpCode : undefined })
        router.push('/dashboard')
      }
    } catch (err: any) {
      const errorCode = err.response?.data?.error?.code
      if (errorCode === '2FA_REQUIRED') {
        setRequires2FA(true)
        setError('')
      } else if (errorCode === 'ACCOUNT_DEACTIVATED') {
        setIsDeactivated(true)
        setError('')
      } else {
        setError(err.response?.data?.message || err.response?.data?.error?.message || 'Login gagal. Cek email dan password Anda.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex relative overflow-hidden font-sans">
      {/* Decorative Mesh Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
        <div className="absolute top-0 -left-48 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/30 to-teal-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 -right-48 w-[600px] h-[600px] bg-gradient-to-br from-amber-200/20 to-orange-200/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-violet-200/15 to-purple-200/10 rounded-full blur-3xl" />
      </div>

      {/* Left Panel - Branding & Stats */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12 glass-premium border-r border-neutral-200/30 dark:border-neutral-800/30">
        <div className="max-w-md">
          <Link href="/" className="flex items-center gap-3 mb-12 group">
            <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
              <Image
                src="/logorevisi.png"
                alt="Nutrify"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold font-display text-neutral-900 dark:text-white tracking-tight">Nutrify</span>
          </Link>

          <h1 className="text-4xl font-display font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
            Selamat Datang
            <span className="block text-primary-700 dark:text-primary-500">Kembali! 👋</span>
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed mb-10 font-light">
            Lanjutkan perjalanan sehatmu dengan Nutrify.
            AI nutritionist personal yang memahami kebutuhan dan budayamu.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="!p-6 bg-white/60 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700">
              <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">1000+</div>
              <div className="text-neutral-500 text-sm font-medium">Makanan Lokal</div>
            </GlassCard>
            <GlassCard className="!p-6 bg-white/60 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                <Sparkles className="w-5 h-5 text-secondary-500" />
                AI
              </div>
              <div className="text-neutral-500 text-sm font-medium">Powered Integration</div>
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
          {/* Mobile Header (only visible on small screens) */}
          <div className="lg:hidden mb-8">
            <div className="flex justify-between items-center mb-6">
              <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Link>
            </div>

            <div className="flex items-center gap-3 mb-6 justify-center">
              <div className="w-12 h-12 flex items-center justify-center">
                <Image
                  src="/logorevisi.png"
                  alt="Nutrify"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-neutral-900 dark:text-white font-display">Nutrify</span>
            </div>
          </div>

          {/* Form Card - Premium Glassmorphism */}
          <div className="glass-premium rounded-2xl p-8 md:p-10 shadow-glass-lg">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 font-display">
                {isDeactivated ? 'Pulihkan Akun?' : requires2FA ? 'Verifikasi 2 Langkah' : 'Masuk ke Akun'}
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                {isDeactivated
                  ? 'Akun Anda sedang dalam masa tenggang penghapusan. Aktifkan kembali sekarang.'
                  : requires2FA
                    ? 'Masukkan kode autentikasi dari aplikasi Authenticator Anda.'
                    : (
                      <>
                        Belum punya akun?{' '}
                        <Link href="/auth/register" className="text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-semibold transition-colors">
                          Daftar gratis
                        </Link>
                      </>
                    )}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl"
              >
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!requires2FA && !isDeactivated ? (
                <>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-neutral-900 dark:text-white placeholder-neutral-400"
                      placeholder="nama@email.com"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Password
                      </label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-xs font-medium text-primary-700 dark:text-primary-400 hover:text-primary-800 hover:underline"
                      >
                        Lupa Password?
                      </Link>
                    </div>

                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-neutral-900 dark:text-white placeholder-neutral-400"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : isDeactivated ? (
                // Restoration UI
                <div className="space-y-4">
                  <div className="p-4 bg-secondary-50 dark:bg-secondary-900/10 border border-secondary-100 dark:border-secondary-900/30 rounded-xl flex items-start gap-4">
                    <div className="bg-secondary-100 dark:bg-secondary-900/30 p-2 rounded-full shrink-0">
                      <Sparkles className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Data Anda Masih Aman</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                        Akun Anda dinonaktifkan tetapi belum dihapus permanen. Klik tombol di bawah untuk memulihkan akses.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <label htmlFor="totp" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Kode Autentikasi
                  </label>
                  <input
                    id="totp"
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-neutral-900 dark:text-white text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                  />
                </motion.div>
              )}

              <div className="space-y-3 pt-2">
                <GradientButton type="submit" isLoading={loading} className="w-full py-3.5 text-base font-semibold shadow-lg shadow-primary-500/25">
                  {isDeactivated ? 'Pulihkan Akun Saya' : requires2FA ? 'Verifikasi' : 'Masuk'}
                </GradientButton>

                {isDeactivated && (
                  <button
                    type="button"
                    onClick={() => { setIsDeactivated(false); setFormData({ email: '', password: '' }) }}
                    className="w-full py-3 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 font-medium transition-colors"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Bottom Link */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </motion.div>
      </div >
    </div >
  )
}
