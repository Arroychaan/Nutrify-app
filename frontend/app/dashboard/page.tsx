'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { User, LogOut, ShieldCheck, Mail, Ruler, Scale, Calendar, Activity } from 'lucide-react'

interface UserData {
  id: string
  email: string
  fullName: string
  heightCm?: string | number
  currentWeightKg?: string | number
  streakDays?: number
  isVerified?: boolean
  createdAt?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (!savedToken) {
      router.push('/')
      return
    }

    const fetchUser = async () => {
      try {
        const response = await authApi.me()
        // Bug #6 Fix: authApi.me() returns { success: true, data: {...} }
        // axios interceptor gives us response.data → { success, data }
        // so we need to unwrap .data once more
        const user = response?.data ?? response
        setUserData(user)
      } catch (err) {
        console.error('Session expired or invalid token:', err)
        localStorage.removeItem('token')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleLogout = () => {
    authApi.logout()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-body">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sage border-t-transparent rounded-full animate-spin"></div>
          <p className="text-ink-2 font-medium">Memuat profil kesehatanmu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-body selection:bg-sage/20 text-ink py-16 px-4 sm:px-6">
      <div className="max-w-xl mx-auto bg-white border border-surface-2 rounded-3xl shadow-card overflow-hidden">
        
        {/* Top Accent Header */}
        <div className="bg-gradient-to-r from-sage to-[#2c4e39] px-8 py-10 text-white relative">
          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Sesi Aktif
          </div>
          
          <div className="flex items-center gap-5 mt-4">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display tracking-tight">
                Halo, {userData?.fullName || 'Pengguna'}!
              </h1>
              <p className="text-white/70 text-sm mt-1">Selamat datang kembali di AI Ate Indonesia.</p>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="p-8 space-y-6">
          
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-ink-3">Informasi Akun</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="bg-[#FDFBF7] border border-surface-2 rounded-2xl p-4 flex items-center gap-3">
                <Mail className="w-5 h-5 text-sage" />
                <div className="min-w-0">
                  <p className="text-xs text-ink-3">Email</p>
                  <p className="font-semibold text-sm truncate">{userData?.email || '-'}</p>
                </div>
              </div>

              {/* Streak */}
              <div className="bg-[#FDFBF7] border border-surface-2 rounded-2xl p-4 flex items-center gap-3">
                <Activity className="w-5 h-5 text-sage" />
                <div className="min-w-0">
                  <p className="text-xs text-ink-3">Streak</p>
                  <p className="font-semibold text-sm">{userData?.streakDays ?? 0} hari 🔥</p>
                </div>
              </div>

              {/* Tinggi Badan */}
              <div className="bg-[#FDFBF7] border border-surface-2 rounded-2xl p-4 flex items-center gap-3">
                <Ruler className="w-5 h-5 text-sage" />
                <div>
                  <p className="text-xs text-ink-3">Tinggi Badan</p>
                  <p className="font-semibold text-sm">{userData?.heightCm ? `${userData.heightCm} cm` : '-'}</p>
                </div>
              </div>

              {/* Berat Badan */}
              <div className="bg-[#FDFBF7] border border-surface-2 rounded-2xl p-4 flex items-center gap-3">
                <Scale className="w-5 h-5 text-sage" />
                <div>
                  <p className="text-xs text-ink-3">Berat Badan</p>
                  <p className="font-semibold text-sm">{userData?.currentWeightKg ? `${userData.currentWeightKg} kg` : '-'}</p>
                </div>
              </div>

              {/* Member Since */}
              <div className="bg-[#FDFBF7] border border-surface-2 rounded-2xl p-4 flex items-center gap-3 sm:col-span-2">
                <Calendar className="w-5 h-5 text-sage" />
                <div>
                  <p className="text-xs text-ink-3">Bergabung Sejak</p>
                  <p className="font-semibold text-sm">
                    {userData?.createdAt
                      ? new Date(userData.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Action */}
          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="w-full h-14 bg-gradient-to-r from-red-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" /> Keluar dari Sesi
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
