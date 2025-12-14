'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, Loader2, Leaf, Check } from 'lucide-react'
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

      // Don't login automatically, show verification step
      setStep(3)
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-emerald-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 -right-48 w-96 h-96 bg-teal-200/40 dark:bg-teal-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -left-48 w-[500px] h-[500px] bg-emerald-200/40 dark:bg-emerald-900/20 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-200/30 dark:bg-cyan-900/20 rounded-full blur-3xl" />

      {/* Left Panel - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12">
        <div className="max-w-md">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-gray-900 dark:text-white">Nutrify</span>
          </Link>

          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Mulai Perjalanan
            <span className="block text-emerald-500">Sehatmu! 🌱</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
            Bergabung dengan Nutrify dan dapatkan rencana nutrisi personal
            yang disesuaikan dengan kebutuhanmu.
          </p>

          {/* Benefits */}
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">{benefit}</span>
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
            {/* Progress Steps */}
            {step < 3 && (
              <div className="flex items-center gap-3 mb-8">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">Akun</span>
                </div>
                <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-700'}`} />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                    {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">Profil</span>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {step === 1 ? 'Buat Akun' : step === 2 ? 'Data Diri' : 'Cek Email Anda 📧'}
              </h2>
              {step < 3 && (
                <p className="text-gray-500 dark:text-gray-400">
                  Sudah punya akun?{' '}
                  <Link href="/auth/login" className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
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
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">✉️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Verifikasi Email Dikirim</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    Kami telah mengirimkan link verifikasi ke <strong>{formData.email}</strong>.<br />
                    Klik link tersebut untuk mengaktifkan akun Anda.
                  </p>

                  <Link
                    href="/auth/login"
                    className="inline-block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-2xl transition-colors"
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
                        placeholder="Minimal 6 karakter"
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

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3.5 pr-12 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                        placeholder="Ulangi password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <GradientButton type="button" onClick={nextStep} className="w-full">
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
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                      placeholder="Nama lengkap Anda"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="heightCm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                          className="w-full px-4 py-3.5 pr-12 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                          placeholder="170"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="currentWeightKg" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                          className="w-full px-4 py-3.5 pr-12 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                          placeholder="65"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-4 px-4 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Kembali
                    </button>
                    <GradientButton type="submit" isLoading={loading} className="flex-1">
                      Daftar
                    </GradientButton>
                  </div>
                </motion.div>
              )}
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
