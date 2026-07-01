'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authApi.login({ email: formData.email, password: formData.password })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout type="login">
      <div className="w-full">
        <h1 className="text-3xl font-editorial font-bold text-ink mb-2">Masuk ke Akun</h1>
        <p className="text-ink-2 mb-8">Selamat datang kembali! Lanjutkan progres sehatmu hari ini.</p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink-2 mb-1.5">Email</label>
            <input
              type="email"
              required
              className="w-full h-12 px-4 rounded-xl border border-surface-2 bg-white focus:border-sage focus:ring-1 focus:ring-sage outline-none transition-all text-ink"
              placeholder="nama@email.com"
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
                placeholder="Masukkan password"
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
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="remember" 
                className="accent-sage w-4 h-4"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              />
              <label htmlFor="remember" className="text-sm text-ink-2">Ingat saya</label>
            </div>
            <Link href="#" className="text-sm text-twilight hover:underline font-medium">Lupa kata sandi?</Link>
          </div>

          <Button type="submit" variant="primary" className="w-full py-4 mt-6 text-lg" isLoading={loading}>
            {loading ? 'Memverifikasi...' : 'Masuk'}
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
            Masuk dengan Google
          </Button>

          <p className="text-center text-sm text-ink-2 mt-8">
            Belum punya akun? <Link href="/auth/register" className="text-twilight font-bold hover:underline">Daftar</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}
