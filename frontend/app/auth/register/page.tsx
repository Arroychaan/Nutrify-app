'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    goal: '',
    allergies: [] as string[],
    termsAccepted: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const allergyOptions = ['Seafood', 'Kacang', 'Gluten', 'Susu', 'Telur', 'Tidak ada']

  const toggleAllergy = (a: string) => {
    if (a === 'Tidak ada') {
      setFormData({ ...formData, allergies: ['Tidak ada'] })
      return
    }
    
    let newAllergies = formData.allergies.filter(item => item !== 'Tidak ada')
    if (newAllergies.includes(a)) {
      newAllergies = newAllergies.filter(item => item !== a)
    } else {
      newAllergies.push(a)
    }
    setFormData({ ...formData, allergies: newAllergies })
  }

  const getPasswordStrength = () => {
    const p = formData.password
    if (!p) return 0
    let score = 0
    if (p.length > 5) score++
    if (p.length > 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    return score
  }
  
  const strength = getPasswordStrength()
  const strengthColors = ['bg-surface-2', 'bg-danger', 'bg-warning', 'bg-[#A0BAA5]', 'bg-sage']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok')
      return
    }
    if (!formData.termsAccepted) {
      setError('Anda harus menyetujui Syarat & Ketentuan')
      return
    }

    setLoading(true)
    try {
      await authApi.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout type="register">
      <div className="w-full">
        <h1 className="text-3xl font-editorial font-bold text-ink mb-2">Buat Akun</h1>
        <p className="text-ink-2 mb-8">Bergabunglah dan mulai perjalanan sehatmu hari ini.</p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink-2 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              required
              className="w-full h-12 px-4 rounded-xl border border-surface-2 bg-white focus:border-sage focus:ring-1 focus:ring-sage outline-none transition-all text-ink"
              placeholder="Budi Santoso"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-2 mb-1.5">Email</label>
            <input
              type="email"
              required
              className="w-full h-12 px-4 rounded-xl border border-surface-2 bg-white focus:border-sage focus:ring-1 focus:ring-sage outline-none transition-all text-ink"
              placeholder="budi@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-2 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full h-12 px-4 rounded-xl border border-surface-2 bg-white focus:border-sage focus:ring-1 focus:ring-sage outline-none transition-all text-ink pr-12"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {/* Strength meter */}
            {formData.password && (
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map(level => (
                  <div key={level} className={`h-1.5 w-full rounded-full ${strength >= level ? strengthColors[strength] : 'bg-surface-2'}`} />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-2 mb-1.5">Konfirmasi Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                className="w-full h-12 px-4 rounded-xl border border-surface-2 bg-white focus:border-sage focus:ring-1 focus:ring-sage outline-none transition-all text-ink pr-12"
                placeholder="Ulangi password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.confirmPassword && formData.confirmPassword === formData.password && (
              <p className="text-sage text-xs mt-1.5 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Password cocok</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-2 mb-1.5">Tujuan Diet</label>
            <select 
              required
              className="w-full h-12 px-4 rounded-xl border border-surface-2 bg-white focus:border-sage focus:ring-1 focus:ring-sage outline-none transition-all text-ink appearance-none"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            >
              <option value="" disabled>Pilih tujuan...</option>
              <option value="weight_loss">Turunkan berat badan</option>
              <option value="healthy">Makan lebih sehat</option>
              <option value="budget">Kelola anggaran makan</option>
              <option value="habit">Bangun kebiasaan sehat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-2 mb-2">Alergi (Opsional)</label>
            <div className="flex flex-wrap gap-2">
              {allergyOptions.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAllergy(a)}
                  className={`px-4 py-2 text-sm rounded-full border transition-all ${
                    formData.allergies.includes(a) 
                      ? 'bg-sage text-white border-sage' 
                      : 'bg-white text-ink-2 border-surface-2 hover:border-sage'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input 
              type="checkbox" 
              id="terms" 
              className="mt-1 accent-sage w-4 h-4"
              checked={formData.termsAccepted}
              onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
            />
            <label htmlFor="terms" className="text-sm text-ink-2">
              Saya setuju dengan <Link href="#" className="text-twilight hover:underline">Syarat & Ketentuan</Link> serta <Link href="#" className="text-twilight hover:underline">Kebijakan Privasi</Link>.
            </label>
          </div>

          <Button type="submit" variant="primary" className="w-full py-4 mt-6 text-lg" isLoading={loading}>
            Buat Akun
          </Button>

          <div className="relative py-4 flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-surface-2" />
            <span className="relative bg-white px-4 text-sm text-ink-3">atau</span>
          </div>

          <Button type="button" variant="outline" className="w-full bg-white text-ink border-surface-2 hover:bg-surface-2">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Daftar dengan Google
          </Button>

          <p className="text-center text-sm text-ink-2 mt-8">
            Sudah punya akun? <Link href="/auth/login" className="text-twilight font-bold hover:underline">Masuk</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}
