'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { User, KeyRound, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'

type AuthMode = 'login' | 'register'

export default function UnifiedAuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const slides = [
    '/assets/login-register/slide1.jpg',
    '/assets/login-register/slide2.jpg',
    '/assets/login-register/slide3.jpg',
    '/assets/login-register/slide4.jpg',
    '/assets/login-register/slide5.jpg',
  ]

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-display selection:bg-sage/30">
      
      {/* LEFT SIDE: Image Showcase with Carousel */}
      <div className="relative hidden lg:block lg:w-[55%] h-full bg-ink">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={slide}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
        
        {/* Soft Gradient Overlay for better UI visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

        {/* Carousel Controls */}
        <div className="absolute bottom-12 inset-x-0 z-20 flex items-center justify-between px-12">
          <button 
            onClick={prevSlide}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all transform hover:-translate-x-1"
          >
            <ChevronLeft className="w-8 h-8" strokeWidth={1.5} />
          </button>
          
          <div className="flex gap-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-500 rounded-full ${
                  index === currentSlide 
                    ? 'w-8 h-2.5 bg-white' 
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button 
            onClick={nextSlide}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all transform hover:translate-x-1"
          >
            <ChevronRight className="w-8 h-8" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="w-full lg:w-[45%] h-full relative flex flex-col justify-between bg-[#FAFAFA]">
        
        {/* Pattern Background */}
        <div 
          className="absolute inset-0 opacity-[0.04] z-0 pointer-events-none mix-blend-multiply"
          style={{
            backgroundImage: "url('/assets/login-register/pattern-background.svg')",
            backgroundSize: '400px',
            backgroundRepeat: 'repeat'
          }}
        />

        <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-16 xl:px-24 relative z-10 w-full max-w-2xl mx-auto">
          
          {/* Top Pill Toggle (Login / Register) */}
          <div className="mb-12">
            <div className="bg-[#FFD25B]/20 rounded-full p-1.5 flex items-center justify-center relative overflow-hidden border border-[#FFD25B]/30 shadow-sm">
               <div 
                  className={`absolute inset-y-1.5 w-[calc(50%-6px)] bg-[#FFD25B] rounded-full transition-transform duration-500 ease-spring shadow-sm ${
                    mode === 'login' ? 'left-1.5' : 'translate-x-full left-[4.5px]'
                  }`}
               />
               <button 
                 onClick={() => setMode('login')}
                 className={`relative z-10 w-32 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${
                   mode === 'login' ? 'text-ink' : 'text-ink/50 hover:text-ink/80'
                 }`}
               >
                 Login
               </button>
               <button 
                 onClick={() => setMode('register')}
                 className={`relative z-10 w-32 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${
                   mode === 'register' ? 'text-ink' : 'text-ink/50 hover:text-ink/80'
                 }`}
               >
                 Register
               </button>
            </div>
          </div>

          {/* Form Area */}
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" key={mode}>
            <form className="space-y-6 w-full" onSubmit={(e) => e.preventDefault()}>
              
              {/* Name/Email Input */}

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-6 h-6 text-ink/40 group-focus-within:text-sage transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder={mode === 'login' ? 'Email atau Username' : 'Nama Lengkap'}
                  className="w-full h-14 pl-14 pr-4 bg-white border-2 border-surface-2 rounded-2xl outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all text-ink font-medium placeholder:text-ink/40 placeholder:font-normal shadow-sm"
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="w-6 h-6 text-ink/40 group-focus-within:text-sage transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan Password Disini"
                  className="w-full h-14 pl-14 pr-12 bg-white border-2 border-surface-2 rounded-2xl outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all text-ink font-medium placeholder:text-ink/40 placeholder:font-normal shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-ink/40 hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm Password (Only Register) */}
              {mode === 'register' && (
                <div className="relative group animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="w-6 h-6 text-ink/40 group-focus-within:text-sage transition-colors" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Masukkan Password yang Sama"
                    className="w-full h-14 pl-14 pr-12 bg-white border-2 border-surface-2 rounded-2xl outline-none focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all text-ink font-medium placeholder:text-ink/40 placeholder:font-normal shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-ink/40 hover:text-ink transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                className={`w-full h-14 mt-4 rounded-2xl text-white font-bold text-lg tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ${
                  mode === 'login' 
                    ? 'bg-gradient-to-r from-[#4A7C82] to-[#3D696E] hover:from-[#3D696E] hover:to-[#31565A]' // Refined Teal
                    : 'bg-gradient-to-r from-[#F26C2A] to-[#E55B19] hover:from-[#E55B19] hover:to-[#D44A08]' // Refined Orange
                }`}
              >
                {mode === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            </form>

            {/* Switch Mode Link */}
            <p className="text-center mt-8 text-ink-2 font-medium">
              {mode === 'login' ? (
                <>
                  Pengguna Baru? <button onClick={() => setMode('register')} className="text-[#4A7C82] font-bold hover:underline">Klik Untuk Daftar</button>
                </>
              ) : (
                <>
                  Sudah Punya Akun? <button onClick={() => setMode('login')} className="text-[#F26C2A] font-bold hover:underline">Masuk</button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 w-full px-8 pb-8 pt-4 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-surface-2 bg-white/50 backdrop-blur-md">
          {/* Brand Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start">
             <Image 
               src="/assets/login-register/ai-ate-logo-login-register.svg" 
               alt="AI Ate Indonesia - Diet Lokal Bergizi" 
               width={220} 
               height={60} 
               className="object-contain" 
             />
          </div>

          {/* Footer Links */}
          <div className="flex flex-wrap justify-center md:justify-end gap-x-3 gap-y-1 text-[11px] font-bold text-ink hover:[&>a]:text-sage hover:[&>a]:underline transition-colors">
            <Link href="/about">Tentang</Link>
            <span className="text-surface-2">|</span>
            <Link href="/services">Layanan</Link>
            <span className="text-surface-2">|</span>
            <Link href="/pricing">Harga</Link>
            <span className="text-surface-2">|</span>
            <Link href="/faq">Faq</Link>
            <span className="text-surface-2">|</span>
            <Link href="/terms">Kebijakan Layanan</Link>
            <span className="text-surface-2">|</span>
            <Link href="/privacy">Privasi Pengguna</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
