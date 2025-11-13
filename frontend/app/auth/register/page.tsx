'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'

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
      
      // Auto login after register
      await authApi.login({
        email: formData.email,
        password: formData.password,
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl sm:text-5xl font-bold text-green-600 mb-2">
              🥗 Nutrify
            </h1>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Buat Akun Baru
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-semibold">
              Masuk di sini
            </Link>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center space-x-2 sm:space-x-4">
          <div className={`h-2 w-20 sm:w-32 rounded-full ${step >= 1 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          <div className={`h-2 w-20 sm:w-32 rounded-full ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {step === 1 && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="nama@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Ulangi password"
                  />
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 sm:py-3 px-4 rounded-lg transition text-sm sm:text-base"
                >
                  Lanjut
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Nama lengkap Anda"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="heightCm" className="block text-sm font-medium text-gray-700 mb-2">
                      Tinggi (cm)
                    </label>
                    <input
                      id="heightCm"
                      type="number"
                      step="0.01"
                      required
                      value={formData.heightCm}
                      onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="170"
                    />
                  </div>

                  <div>
                    <label htmlFor="currentWeightKg" className="block text-sm font-medium text-gray-700 mb-2">
                      Berat (kg)
                    </label>
                    <input
                      id="currentWeightKg"
                      type="number"
                      step="0.01"
                      required
                      value={formData.currentWeightKg}
                      onChange={(e) => setFormData({ ...formData, currentWeightKg: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="65"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 sm:py-3 px-4 rounded-lg transition text-sm sm:text-base"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 sm:py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {loading ? 'Memproses...' : 'Daftar'}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6">
            <Link
              href="/"
              className="w-full inline-flex justify-center items-center py-2 sm:py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
