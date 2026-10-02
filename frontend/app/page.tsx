'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  User, 
  KeyRound, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Mail, 
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Flame,
  Scale,
  Ruler,
  Calendar,
  Compass,
  Check,
  Dumbbell,
  Heart
} from 'lucide-react'
import { authApi } from '@/lib/api'

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password'

export default function UnifiedAuthPage() {
  const router = useRouter()
  
  // Form Modes & Query Parameters
  const [mode, setMode] = useState<AuthMode>('login')
  const [queryToken, setQueryToken] = useState<string | null>(null)

  // Form Fields State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Onboarding States
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(1)
  
  // Onboarding Answers State
  const [spicyTolerance, setSpicyTolerance] = useState<'low' | 'medium' | 'high' | ''>('')
  const [targetDiet, setTargetDiet] = useState<'reduce_rice' | 'medical' | 'fast_weight' | ''>('')
  const [age, setAge] = useState('')
  const [religion, setReligion] = useState('')
  const [height, setHeight] = useState('165')
  const [weight, setWeight] = useState('60')

  // UI States
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const slides = [
    '/assets/login-register/slide1.jpg',
    '/assets/login-register/slide2.jpg',
    '/assets/login-register/slide3.jpg',
    '/assets/login-register/slide4.jpg',
    '/assets/login-register/slide5.jpg',
  ]

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)

  // Check login session & read query params on mount
  useEffect(() => {
    const existingToken = localStorage.getItem('token')
    if (existingToken && !showOnboarding) {
      router.push('/dashboard')
      return
    }

    // Auto-remove any active service worker in development environment to prevent caching bugs
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'development') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) console.log('[Dev] Stale ServiceWorker successfully unregistered');
          })
        }
      })
    }

    const params = new URLSearchParams(window.location.search)
    const modeParam = params.get('mode')
    const tokenParam = params.get('token')

    if (modeParam === 'reset-password' && tokenParam) {
      setMode('reset-password')
      setQueryToken(tokenParam)
    } else if (modeParam === 'verify' && tokenParam) {
      verifyEmailToken(tokenParam)
    }
  }, [router, showOnboarding])

  // Slide Auto Transition
  useEffect(() => {
    const timer = setInterval(nextSlide, 4500)
    return () => clearInterval(timer)
  }, [])

  // Auto verify email
  const verifyEmailToken = async (token: string) => {
    setLoading(true)
    setError('')
    try {
      await authApi.verifyEmail(token)
      setSuccessMessage('Verifikasi email berhasil! Silakan masuk ke akun Anda.')
      setMode('login')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Tautan verifikasi salah atau kedaluwarsa.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!email && mode !== 'reset-password') {
      setError('Email wajib diisi.')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (mode !== 'reset-password' && !emailRegex.test(email)) {
      setError('Format email tidak valid.')
      return
    }

    if (mode === 'login') {
      if (!password) {
        setError('Password wajib diisi.')
        return
      }
      
      setLoading(true)
      try {
        await authApi.login({ email, password })
        setSuccessMessage('Berhasil masuk! Mengarahkan...')
        setTimeout(() => router.push('/dashboard'), 800)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Email atau password salah.')
        setLoading(false)
      }
    }

    else if (mode === 'register') {
      if (!fullName) {
        setError('Nama lengkap wajib diisi.')
        return
      }
      if (password.length < 6) {
        setError('Password minimal harus 6 karakter.')
        return
      }
      if (password !== confirmPassword) {
        setError('Konfirmasi password tidak cocok.')
        return
      }

      setLoading(true)
      try {
        // Bug #5 Fix: Always send heightCm & currentWeightKg (DB schema requires NOT NULL).
        // We use sensible defaults here; the user will update them in onboarding Step 4.
        await authApi.register({
          email,
          password,
          fullName,
          heightCm: 165,
          currentWeightKg: 60,
        })
        setSuccessMessage('Registrasi berhasil! Memuat kuesioner onboarding...')
        
        setTimeout(() => {
          setSuccessMessage('')
          setShowOnboarding(true)
          setOnboardingStep(1)
          setLoading(false)
        }, 1200)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Registrasi gagal. Email mungkin sudah terdaftar.')
        setLoading(false)
      }
    }

    else if (mode === 'forgot-password') {
      setLoading(true)
      try {
        await authApi.forgotPassword(email)
        setSuccessMessage('Tautan pemulihan sandi telah dikirim ke email Anda.')
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal mengirim email pemulihan sandi.')
      } finally {
        setLoading(false)
      }
    }

    else if (mode === 'reset-password') {
      if (password.length < 6) {
        setError('Password baru minimal harus 6 karakter.')
        return
      }
      if (password !== confirmPassword) {
        setError('Konfirmasi password baru tidak cocok.')
        return
      }
      if (!queryToken) {
        setError('Token reset password tidak ditemukan.')
        return
      }

      setLoading(true)
      try {
        await authApi.resetPassword(queryToken, password)
        setSuccessMessage('Password berhasil diatur ulang! Silakan masuk kembali.')
        setMode('login')
        setPassword('')
        setConfirmPassword('')
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal mengatur ulang password. Token kedaluwarsa.')
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle Onboarding Completion
  const handleOnboardingSubmit = async () => {
    setError('')
    setSuccessMessage('')
    setLoading(true)

    const dob = age ? new Date(new Date().getFullYear() - Number(age), 0, 1).toISOString() : undefined
    
    const spicyText = 
      spicyTolerance === 'low' ? 'Pedas: Rendah' :
      spicyTolerance === 'medium' ? 'Pedas: Sedang' : 'Pedas: Tinggi'

    const dietText = 
      targetDiet === 'reduce_rice' ? 'Diet: Kurang Nasi' :
      targetDiet === 'medical' ? 'Diet: Kondisi Medis (Tanpa Santan/Kolesterol)' : 'Diet: Turun Berat Badan Cepat'

    try {
      await authApi.updateProfile({
        heightCm: Number(height),
        currentWeightKg: Number(weight),
        dateOfBirth: dob,
        religion: religion || undefined,
        dietaryRestrictions: [spicyText, dietText]
      })

      setSuccessMessage('Profil kesehatan berhasil dikonfigurasi! Selamat datang!')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan profil kuesioner Anda.')
      setLoading(false)
    }
  }

  const calculateBMR = () => {
    const w = Number(weight) || 60
    const h = Number(height) || 165
    const a = Number(age) || 20
    const bmr = 10 * w + 6.25 * h - 5 * a + 5
    return Math.round(bmr * 1.35)
  }

  const changeMode = (newMode: AuthMode) => {
    setError('')
    setSuccessMessage('')
    setPassword('')
    setConfirmPassword('')
    setMode(newMode)
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#FAF8F5] font-body selection:bg-sage/20 text-ink">
      
      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 pb-24 md:pb-28">
        <div className="flex w-full max-w-[935px] items-center justify-center gap-12">
        
        {/* LEFT SIDE: iPhone Mockup (Only visible on md desktop) */}
        <div className="relative hidden md:block w-[380px] h-[590px] flex-shrink-0 select-none pointer-events-none">
          
          {/* Titanium iPhone 15 Pro Casing Mockup */}
          <div className="relative mx-auto w-[290px] h-[590px] bg-zinc-950 rounded-[48px] p-[10px] shadow-2xl border-[3.5px] border-zinc-800 ring-4 ring-zinc-900/90 shadow-zinc-950/40">
            
            {/* Dynamic Island Notch */}
            <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-30 flex items-center justify-between px-3.5 shadow-inner">
              <div className="w-1.5 h-1.5 bg-[#080808] rounded-full border border-white/5" />
              <div className="w-2.5 h-2.5 bg-[#050515] rounded-full border border-white/5 flex items-center justify-center">
                <div className="w-1 h-1 bg-[#0d0d35] rounded-full" />
              </div>
            </div>
            
            {/* Speaker Mesh */}
            <div className="absolute top-[9px] left-1/2 -translate-x-1/2 w-9 h-[2px] bg-zinc-800 rounded-full z-30" />
            
            {/* Screen Container with force-clipping attributes to prevent image spill */}
            <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-[#2A241D] z-20 [transform:translateZ(0)] [mask-image:webkit-radial-gradient(white,black)] isolation-auto">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <Image
                    src={slide}
                    alt={`Slideshow ${index + 1}`}
                    fill
                    className="object-cover"
                    style={{ objectFit: 'cover' }}
                    priority={index === 0}
                  />
                </div>
              ))}
              
              {/* Subtle glass screen reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 z-20 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Instagram-Style Card Auth Area */}
        <div className="w-full max-w-[350px] flex flex-col gap-3 flex-shrink-0 animate-scale-in">
          
          {/* CARD 1: Main Form Box */}
          <div className="bg-white border border-surface-2 rounded-xl p-8 flex flex-col items-center shadow-[0_2px_8px_rgba(30,24,16,0.03)]">
            
            {/* Brand Wordmark Logo */}
            <div className="mb-8 select-none pointer-events-none">
              <Image 
                src="/assets/login-register/ai-ate-logo-login-register.svg" 
                alt="AI Ate Nusantara" 
                width={190} 
                height={55} 
                className="object-contain" 
                priority
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="w-full mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-red-700 text-xs font-semibold leading-normal animate-scale-in">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="w-full mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-700 text-xs font-semibold leading-normal animate-scale-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* 1. ONBOARDING QUESTIONS IN CARD 1 */}
            {showOnboarding ? (
              <div className="w-full space-y-5 animate-scale-in">
                
                {/* Onboarding Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-ink-3 uppercase tracking-wider">
                    <span>Profil Nusantara</span>
                    <span>Langkah {onboardingStep} dari 5</span>
                  </div>
                  <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sage transition-all duration-350 ease-out" 
                      style={{ width: `${(onboardingStep / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* STEP 1: Spicy */}
                {onboardingStep === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-250">
                    <div>
                      <h2 className="text-base font-bold font-display tracking-tight text-ink flex items-center gap-1.5">
                        <Flame className="w-5 h-5 text-orange-500 animate-pulse" /> Seberapa Tangguh Ketahanan Pedasmu?
                      </h2>
                      <p className="text-[10px] text-ink-3 mt-0.5">Filter ketangguhan sambal lokalmu.</p>
                    </div>

                    <div className="space-y-2">
                      {[
                        { key: 'low', label: 'Paling ngga bisa ngrasain pedas' },
                        { key: 'medium', label: 'Pedas nya yang sedang sedang aja' },
                        { key: 'high', label: 'Pecinta pedas, sekelas Tanboy Kun' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setSpicyTolerance(item.key as any)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                            spicyTolerance === item.key 
                              ? 'border-sage bg-sage/5 text-sage shadow-sm' 
                              : 'border-surface-2 hover:border-sage/40 hover:bg-[#FAF8F5] text-ink-2'
                          }`}
                        >
                          <span>{item.label}</span>
                          {spicyTolerance === item.key && <Check className="w-4 h-4 text-sage flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: Dietary Target */}
                {onboardingStep === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-250">
                    <div>
                      <h2 className="text-base font-bold font-display tracking-tight text-ink flex items-center gap-1.5">
                        <Dumbbell className="w-5 h-5 text-sage" /> Target Diet Skala Nusantara:
                      </h2>
                      <p className="text-[10px] text-ink-3 mt-0.5">Tentukan porsi dan restriksi lauk warteg.</p>
                    </div>

                    <div className="space-y-2">
                      {[
                        { key: 'reduce_rice', label: 'Kurangi Porsi Nasi (Nasi setengah)' },
                        { key: 'medical', label: 'Kondisi Medis (Tanpa Santan/Kolesterol)' },
                        { key: 'fast_weight', label: 'Turun BB Cepat (Tanpa siksa lidah)' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setTargetDiet(item.key as any)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                            targetDiet === item.key 
                              ? 'border-sage bg-sage/5 text-sage shadow-sm' 
                              : 'border-surface-2 hover:border-sage/40 hover:bg-[#FAF8F5] text-ink-2'
                          }`}
                        >
                          <span>{item.label}</span>
                          {targetDiet === item.key && <Check className="w-4 h-4 text-sage flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: Age & Religion */}
                {onboardingStep === 3 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-250">
                    <div>
                      <h2 className="text-base font-bold font-display tracking-tight text-ink flex items-center gap-1.5">
                        <Calendar className="w-5 h-5 text-sage" /> Detail Profil Diri
                      </h2>
                      <p className="text-[10px] text-ink-3 mt-0.5">Bantu kami menyeleksi menu halal.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className="w-4 h-4 text-ink-3" />
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          required
                          placeholder="Masukkan Umur (Tahun)"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full h-11 pl-10 pr-4 bg-white border border-surface-2 rounded-xl outline-none focus:border-sage transition-all text-xs font-semibold text-ink placeholder:text-ink-3 placeholder:font-normal"
                        />
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Compass className="w-4 h-4 text-ink-3" />
                        </div>
                        <select
                          value={religion}
                          onChange={(e) => setReligion(e.target.value)}
                          className="w-full h-11 pl-10 pr-4 bg-white border border-surface-2 rounded-xl outline-none focus:border-sage transition-all text-xs font-semibold text-ink appearance-none cursor-pointer"
                        >
                          <option value="">Pilih Agama (Opsional)</option>
                          <option value="Islam">Islam (Sembunyikan Babi)</option>
                          <option value="Kristen">Kristen</option>
                          <option value="Katolik">Katolik</option>
                          <option value="Hindu">Hindu</option>
                          <option value="Buddha">Buddha</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Height & Weight */}
                {onboardingStep === 4 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-250">
                    <div>
                      <h2 className="text-base font-bold font-display tracking-tight text-ink flex items-center gap-1.5">
                        <Scale className="w-5 h-5 text-sage" /> Tinggi & Berat Badan
                      </h2>
                      <p className="text-[10px] text-ink-3 mt-0.5">Digunakan untuk kalkulasi metabolisme.</p>
                    </div>

                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold text-ink">
                          <span>Tinggi Badan</span>
                          <span className="text-sage">{height} cm</span>
                        </div>
                        <input
                          type="range"
                          min="120"
                          max="220"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="w-full h-1 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-sage"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold text-ink">
                          <span>Berat Badan</span>
                          <span className="text-sage">{weight} kg</span>
                        </div>
                        <input
                          type="range"
                          min="35"
                          max="150"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="w-full h-1 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-sage"
                        />
                      </div>

                      {/* dynamic BMR */}
                      <div className="bg-sage/5 border border-sage/10 rounded-xl p-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-sage/70 tracking-wider">Target Kalori</p>
                          <p className="font-extrabold text-ink-2 mt-0.5">{calculateBMR()} kkal/hari</p>
                        </div>
                        <Heart className="w-6 h-6 text-sage/40 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Summary */}
                {onboardingStep === 5 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-250">
                    <div>
                      <h2 className="text-base font-bold font-display tracking-tight text-ink flex items-center gap-1.5">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" /> Ringkasan Profilmu
                      </h2>
                      <p className="text-[10px] text-ink-3 mt-0.5">Konfirmasi target diet Nusantara Anda.</p>
                    </div>

                    <div className="bg-[#FAF8F5] border border-surface-2 rounded-xl p-3.5 space-y-2 text-xs font-semibold text-ink-2">
                      <div className="flex justify-between border-b border-surface-2/60 pb-1.5">
                        <span className="font-normal text-ink-3">Sambal</span>
                        <span>{spicyTolerance === 'low' ? 'Rendah' : spicyTolerance === 'medium' ? 'Sedang' : 'Tinggi'}</span>
                      </div>
                      <div className="flex justify-between border-b border-surface-2/60 pb-1.5">
                        <span className="font-normal text-ink-3">Pola Diet</span>
                        <span>{targetDiet === 'reduce_rice' ? 'Kurang Nasi' : targetDiet === 'medical' ? 'Medis' : 'Turun BB'}</span>
                      </div>
                      <div className="flex justify-between border-b border-surface-2/60 pb-1.5">
                        <span className="font-normal text-ink-3">Diri</span>
                        <span>{age} Thn / {religion || 'Lewati'}</span>
                      </div>
                      <div className="flex justify-between pb-0.5">
                        <span className="font-normal text-ink-3">Fisik</span>
                        <span>{height}cm / {weight}kg</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Onboarding Nav */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-surface-2">
                  <button
                    type="button"
                    onClick={() => setOnboardingStep((prev) => Math.max(1, prev - 1))}
                    disabled={onboardingStep === 1 || loading}
                    className="h-10 px-4 border border-surface-2 text-ink-2 hover:border-sage hover:text-sage text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Kembali
                  </button>

                  {onboardingStep < 5 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (onboardingStep === 1 && !spicyTolerance) {
                          setError('Harap pilih ketahanan pedasmu.')
                          return
                        }
                        if (onboardingStep === 2 && !targetDiet) {
                          setError('Harap pilih target dietmu.')
                          return
                        }
                        if (onboardingStep === 3 && (!age || Number(age) < 1 || Number(age) > 120)) {
                          setError('Harap masukkan umur yang valid.')
                          return
                        }
                        setError('')
                        setOnboardingStep((prev) => prev + 1)
                      }}
                      className="h-10 px-5 bg-sage hover:bg-[#2c4e39] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      Lanjut
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOnboardingSubmit}
                      disabled={loading}
                      className="h-10 px-5 bg-sage hover:bg-[#2c4e39] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all disabled:opacity-60"
                    >
                      {loading ? 'Menyimpan...' : 'Selesai'}
                    </button>
                  )}
                </div>

              </div>
            ) : (
              
              // 2. INSTAGRAM LOGIN / REGISTER FIELDS
              <form onSubmit={handleSubmit} className="space-y-3 w-full">
                
                {/* Full Name (Register Only) */}
                {mode === 'register' && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-ink-3 group-focus-within:text-sage transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Nama Lengkap"
                      disabled={loading}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 bg-[#fafafa] border border-surface-2 rounded-lg outline-none focus:border-sage transition-all text-xs font-semibold text-ink placeholder:text-ink-3 placeholder:font-normal [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#fafafa_inset]"
                    />
                  </div>
                )}

                {/* Email Input (Ignored in Reset Mode) */}
                {mode !== 'reset-password' && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-ink-3 group-focus-within:text-sage transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Alamat Email"
                      disabled={loading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 bg-[#fafafa] border border-surface-2 rounded-lg outline-none focus:border-sage transition-all text-xs font-semibold text-ink placeholder:text-ink-3 placeholder:font-normal [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#fafafa_inset]"
                    />
                  </div>
                )}

                {/* Password Input (Login, Register, Reset) */}
                {mode !== 'forgot-password' && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <KeyRound className="w-4 h-4 text-ink-3 group-focus-within:text-sage transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder={mode === 'reset-password' ? 'Password Baru' : 'Password'}
                      disabled={loading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-10 pl-10 pr-10 bg-[#fafafa] border border-surface-2 rounded-lg outline-none focus:border-sage transition-all text-xs font-semibold text-ink placeholder:text-ink-3 placeholder:font-normal [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#fafafa_inset]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-3 hover:text-ink transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {/* Confirm Password Input (Register, Reset) */}
                {(mode === 'register' || mode === 'reset-password') && (
                  <div className="relative group animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <KeyRound className="w-4 h-4 text-ink-3 group-focus-within:text-sage transition-colors" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Konfirmasi Password"
                      disabled={loading}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-10 pl-10 pr-10 bg-[#fafafa] border border-surface-2 rounded-lg outline-none focus:border-sage transition-all text-xs font-semibold text-ink placeholder:text-ink-3 placeholder:font-normal [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#fafafa_inset]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-3 hover:text-ink transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {/* Forgot Password Trigger */}
                {mode === 'login' && (
                  <div className="flex justify-end pt-0.5">
                    <button 
                      type="button"
                      onClick={() => changeMode('forgot-password')}
                      disabled={loading}
                      className="text-[11px] font-semibold text-[#0095f6] hover:underline"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[36px] mt-2 bg-sage hover:bg-[#2c4e39] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all disabled:opacity-60 shadow-sm"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {mode === 'login' && 'Masuk'}
                      {mode === 'register' && 'Daftar'}
                      {mode === 'forgot-password' && 'Kirim Link Pemulihan'}
                      {mode === 'reset-password' && 'Atur Ulang Sandi'}
                    </>
                  )}
                </button>

                {/* Instagram style divider 'OR' */}
                {(mode === 'login' || mode === 'register') && (
                  <div className="flex items-center gap-3 py-4">
                    <div className="flex-1 h-[1px] bg-surface-2" />
                    <span className="text-[10px] font-bold text-ink-3 uppercase tracking-wider">Atau</span>
                    <div className="flex-1 h-[1px] bg-surface-2" />
                  </div>
                )}

                {/* Google login Simulation */}
                {(mode === 'login' || mode === 'register') && (
                  <button
                    type="button"
                    onClick={() => {
                      setError('Fitur masuk dengan Google sedang dalam pengembangan.')
                    }}
                    className="w-full h-[36px] border border-surface-2 hover:bg-surface-2/20 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-ink-2 transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" width="16" height="16">
                      <path fill="#ea4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.465 0-6.285-2.82-6.285-6.285 0-3.465 2.82-6.285 6.285-6.285 1.5 0 2.868.525 3.945 1.485l3.075-3.075C19.125 1.95 15.93 1 12.24 1 6.03 1 1 6.03 1 12.24s5.03 11.24 11.24 11.24c5.895 0 10.965-4.26 10.965-11.24 0-.765-.075-1.5-.21-2.205H12.24z"/>
                    </svg>
                    Masuk dengan Google
                  </button>
                )}
              </form>
            )}

            {/* Back to Login (Forgot Mode only) */}
            {(mode === 'forgot-password' || mode === 'reset-password') && (
              <button
                type="button"
                onClick={() => changeMode('login')}
                className="mt-6 text-xs font-bold text-sage hover:underline"
              >
                Kembali ke Halaman Masuk
              </button>
            )}

          </div>

          {/* CARD 2: Switch Form Mode Link */}
          {!showOnboarding && (
            <div className="bg-white border border-surface-2 rounded-xl p-5 flex items-center justify-center text-xs font-semibold text-ink-2 shadow-[0_2px_8px_rgba(30,24,16,0.03)]">
              {mode === 'login' ? (
                <>
                  Belum punya akun?{' '}
                  <button 
                    onClick={() => changeMode('register')} 
                    className="text-[#0095f6] font-bold ml-1 hover:underline"
                  >
                    Daftar
                  </button>
                </>
              ) : (
                <>
                  Sudah punya akun?{' '}
                  <button 
                    onClick={() => changeMode('login')} 
                    className="text-[#0095f6] font-bold ml-1 hover:underline"
                  >
                    Masuk
                  </button>
                </>
              )}
            </div>
          )}

        </div>

      </div>

      </div>

      {/* FOOTER AREA (Positioned naturally in flex flow, avoiding overlays) */}
      <div className="w-full px-8 pb-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-surface-2 bg-white/50 backdrop-blur-md z-30">
        <div className="flex flex-col items-center sm:items-start gap-0.5 select-none pointer-events-none">
           <Image 
             src="/assets/login-register/ai-ate-logo-login-register.svg" 
             alt="AI Ate Indonesia" 
             width={140} 
             height={38} 
             className="object-contain opacity-80" 
           />
        </div>

        {/* Footer Navigation Links */}
        <div className="flex flex-wrap justify-center sm:justify-end gap-x-3 gap-y-1 text-[10px] font-bold text-ink-3 hover:[&>a]:text-sage hover:[&>a]:underline transition-all">
          <Link href="#about">Tentang</Link>
          <span className="text-surface-3">|</span>
          <Link href="#pricing">Harga</Link>
          <span className="text-surface-3">|</span>
          <Link href="#privacy">Privasi Pengguna</Link>
          <span className="text-surface-3">|</span>
          <Link href="#terms">Kebijakan Layanan</Link>
        </div>
      </div>

    </div>
  )
}
