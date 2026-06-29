'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, Check } from 'lucide-react'
import { GradientButton } from '@/components/ui/GradientButton'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    heightCm: '',
    currentWeightKg: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok')
      return
    }

    setLoading(true)

    try {
      await authApi.register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        heightCm: parseFloat(formData.heightCm),
        currentWeightKg: parseFloat(formData.currentWeightKg),
      })

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Harap isi semua field')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Password tidak cocok')
        return
      }
      if (formData.password.length < 6) {
        setError('Password minimal 6 karakter')
        return
      }
    }
    setError('')
    setStep(2)
  }

  const benefits = [
    'Database 1000+ makanan Indonesia',
    'AI nutritionist personal',
    'Sesuai kondisi kesehatan',
    'Gratis sepenuhnya',
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex relative overflow-hidden font-sans">
      {/* Decorative Mesh Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
        <div className="absolute top-0 -right-48 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/30 to-teal-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 -left-48 w-[600px] h-[600px] bg-gradient-to-br from-amber-200/20 to-orange-200/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-violet-200/15 to-purple-200/10 rounded-full blur-3xl" />
      </div>

      {/* Left Panel - Branding (Desktop) */}
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
            <span className="text-2xl font-display font-bold text-neutral-900 dark:text-white tracking-tight">Nutrify</span>
          </Link>

          <h1 className="text-4xl font-display font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
            Mulai Perjalanan
            <span className="block text-primary-700 dark:text-primary-500">Sehatmu! 🌱</span>
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed mb-10 font-light">
            Bergabung dengan Nutrify dan dapatkan rencana nutrisi personal
            yang disesuaikan dengan kebutuhanmu.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 group">
                <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <Check className="w-4 h-4 text-primary-700 dark:text-primary-400" />
                </div>
                <span className="text-neutral-700 dark:text-neutral-300 font-medium">{benefit}</span>
              </div>
            ))}
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
            <div className="flex justify-between items-center mb-6">
              <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Link>
            </div>
            <div className="flex items-center gap-3 mb-2 justify-center">
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
            {/* Progress Steps */}
            {step < 3 && (
              <div className="flex items-center gap-3 mb-8">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-700 dark:text-primary-400' : 'text-neutral-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                    {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">Akun</span>
                </div>
                <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-primary-600' : 'bg-neutral-100 dark:bg-neutral-800'}`} />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-700 dark:text-primary-400' : 'text-neutral-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                    {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">Profil</span>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 font-display">
                {step === 1 ? 'Buat Akun' : step === 2 ? 'Data Diri' : 'Cek Email Anda 📧'}
              </h2>
              {step < 3 && (
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Sudah punya akun?{' '}
                  <Link href="/auth/login" className="text-primary-700 dark:text-primary-400 hover:text-primary-800 font-semibold hover:underline transition-colors">
                    Masuk
                  </Link>
                </p>
              )}
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
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">✉️</span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Verifikasi Email Dikirim</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                    Kami telah mengirimkan link verifikasi ke <strong>{formData.email}</strong>.<br />
                    Klik link tersebut untuk mengaktifkan akun Anda.
                  </p>

                  <Link
                    href="/auth/login"
                    className="inline-block w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-lg shadow-primary-600/25"
                  >
                    Ke Halaman Login
                  </Link>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
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
                    <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-neutral-900 dark:text-white placeholder-neutral-400"
                        placeholder="Minimal 6 karakter"
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

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-neutral-900 dark:text-white placeholder-neutral-400"
                        placeholder="Ulangi password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <GradientButton type="button" onClick={nextStep} className="w-full py-3.5 text-base font-semibold shadow-lg shadow-primary-500/25">
                    Lanjut
                  </GradientButton>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Nama Lengkap
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-neutral-900 dark:text-white placeholder-neutral-400"
                      placeholder="Nama lengkap Anda"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="heightCm" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Tinggi Badan
                      </label>
                      <div className="relative">
                        <input
                          id="heightCm"
                          type="number"
                          step="0.01"
                          required
                          value={formData.heightCm}
                          onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                          className="w-full px-4 py-3 pr-12 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-neutral-900 dark:text-white placeholder-neutral-400"
                          placeholder="170"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">cm</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="currentWeightKg" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Berat Badan
                      </label>
                      <div className="relative">
                        <input
                          id="currentWeightKg"
                          type="number"
                          step="0.01"
                          required
                          value={formData.currentWeightKg}
                          onChange={(e) => setFormData({ ...formData, currentWeightKg: e.target.value })}
                          className="w-full px-4 py-3 pr-12 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-neutral-900 dark:text-white placeholder-neutral-400"
                          placeholder="65"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold py-3.5 px-4 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700"
                    >
                      Kembali
                    </button>
                    <GradientButton type="submit" isLoading={loading} className="flex-1 py-3.5 shadow-lg shadow-primary-500/25">
                      Daftar
                    </GradientButton>
                  </div>
                </motion.div>
              )}
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
      </div>
    </div>
  )
}
