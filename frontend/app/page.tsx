'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Utensils,
  HeartPulse,
  Leaf,
  BarChart3,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  ChefHat
} from 'lucide-react'
import { GradientButton } from '@/components/ui/GradientButton'

// Native FadeInOnScroll using IntersectionObserver
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-hidden selection:bg-primary-action/15 selection:text-primary-dark">
      {/* Decorative texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-noise mix-blend-multiply" />
      
      {/* Navigation */}
      <nav className="relative z-50 px-4 sm:px-6 py-6 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-surface/80 backdrop-blur-md rounded-2xl px-6 py-4 border border-border/50 shadow-warm-sm">
          {/* SVG Vector Wordmark Logo */}
          <Link href="/" className="flex items-center gap-3 group animate-fade-in">
            <svg viewBox="0 0 100 120" className="h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 8C65 20 72 32 72 45C72 60 62 72 50 72C38 72 28 60 28 45C28 32 35 20 50 8Z" fill="#C4603A"/>
              <ellipse cx="50" cy="52" rx="13" ry="17" fill="#FAF0E0" className="transition-colors duration-300 group-hover:fill-white" />
              <circle cx="50" cy="52" r="6" fill="#E8A838"/>
              <rect x="44" y="71" width="12" height="16" rx="6" fill="#C4603A"/>
            </svg>
            <span className="text-2xl font-bold tracking-tight text-primary-dark group-hover:text-primary-action transition-colors duration-300 font-display">Nutrify</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-text-secondary hover:text-primary-action font-medium text-sm transition-colors px-4 py-2"
            >
              Masuk
            </Link>
            <Link href="/auth/register">
              <GradientButton variant="primary" size="sm">
                Mulai Gratis
              </GradientButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 lg:pt-0 lg:pb-0 px-4 sm:px-6 lg:px-0 overflow-hidden lg:min-h-[85vh] flex items-center bg-background">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center relative h-full">
          
          {/* Left Column (Text) */}
          <div className="w-full lg:w-[45%] relative z-20 pt-10 pb-16 lg:py-24 lg:pr-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary-dark leading-[1.1] mb-6 font-display tracking-tight text-balance">
                Sehat Tanpa Meninggalkan <br className="hidden lg:block"/>
                <span className="text-primary-action">Masakan Nusantara.</span>
              </h1>

              <p className="text-xl text-text-secondary mb-10 leading-relaxed font-light text-balance">
                Rancang pola makan idealmu dengan AI yang memahami bahan masakan lokal dan tradisi kuliner Indonesia.
              </p>

              {/* CTA Button */}
              <div className="flex">
                <Link href="/auth/register">
                  <GradientButton variant="primary" size="lg" icon={ArrowRight}>
                    Buat Rencana Gizi
                  </GradientButton>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right Column (Visual Full Bleed) */}
          <motion.div 
            className="w-full lg:absolute lg:top-0 lg:bottom-0 lg:right-0 lg:w-[55%] h-[400px] lg:h-auto z-10"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative w-full h-full lg:rounded-l-[4rem] overflow-hidden shadow-warm-xl">
              <Image 
                src="/Nusantara.png" 
                alt="Makanan Indonesia"
                fill
                className="object-cover"
                priority
              />
              {/* Gradient overlays to blend into background */}
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 hidden lg:block" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-10 block lg:hidden" />
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent z-10 block lg:hidden" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Horizontal Batik Accent Strip */}
      <div className="h-6 w-full opacity-[0.06] pointer-events-none bg-repeat-x border-y border-border-warm/20" 
           style={{ 
             backgroundImage: 'url(/illustrations/batik-pattern.svg)', 
             backgroundSize: '24px 24px',
             backgroundPosition: 'center'
           }} 
      />

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-4 sm:px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          {/* Moved Stats inside FadeIn */}
          <FadeIn>
            <div className="flex justify-center items-center mb-24 pb-12 border-b border-border-warm">
              <div className="flex items-center gap-4 text-sm font-medium text-text-muted">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-border-warm border-2 border-surface flex items-center justify-center text-xs text-text-muted">
                      <UserIcon />
                    </div>
                  ))}
                </div>
                <p>Telah dipercaya oleh <span className="text-primary-dark font-semibold">1,000+</span> orang untuk hidup lebih sehat.</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="max-w-3xl mb-20">
              <span className="badge-action mb-6">Fitur Utama</span>
              <h2 className="text-4xl sm:text-5xl font-bold text-primary-dark mb-6 font-display tracking-tight text-balance">
                Didesain khusus untuk lidah dan kesehatan orang Indonesia
              </h2>
              <p className="text-xl text-text-secondary leading-relaxed font-light">
                Bukan sekadar penghitung kalori biasa. Nutrify memahami konteks lokal dan kondisi medis spesifik Anda secara presisi.
              </p>
            </div>
          </FadeIn>

          {/* Editorial Feature 01 */}
          <FadeIn>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mt-12">
              <div>
                <div className="text-8xl lg:text-9xl font-bold text-primary-action/10 font-display mb-4">01</div>
                <h3 className="text-3xl sm:text-4xl font-bold text-primary-dark mb-6 font-display leading-tight">Database Kuliner Lokal Paling Lengkap</h3>
                <p className="text-lg text-text-secondary leading-relaxed font-light mb-8">
                  Temukan nilai gizi dari ribuan makanan khas Indonesia. Mulai dari Nasi Padang, Gado-Gado, hingga hidangan tradisional daerah, semuanya terverifikasi secara klinis.
                </p>
              </div>
              
              <div className="relative">
                {/* Food Database Mockup */}
                <div className="bg-surface border border-border-warm rounded-2xl p-6 shadow-warm-lg max-w-md mx-auto">
                  <div className="flex items-center justify-between border-b border-border-warm pb-4 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Cari Gizi Kuliner</span>
                    <span className="badge-secondary text-[10px] px-2 py-0.5 rounded bg-secondary-50 text-secondary border border-secondary-200">1,000+ Bahan Lokal</span>
                  </div>
                  {/* Search Bar mockup */}
                  <div className="bg-background-50 border border-border-warm rounded-lg p-2.5 flex items-center gap-2 mb-4 text-sm text-text-muted">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                    <span>Nasi Padang...</span>
                  </div>
                  {/* Food Item list */}
                  <div className="space-y-3">
                    <div className="bg-background border border-border-light rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-primary-dark text-sm flex items-center gap-1.5">
                          Nasi Rendang Padang
                          <span className="text-[9px] bg-secondary-50 text-secondary border border-secondary-200 px-1 py-0.5 rounded font-medium">AI Verified</span>
                        </div>
                        <div className="text-[11px] text-text-secondary mt-0.5">Porsi sedang (1 piring)</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary-action text-sm">730 kcal</div>
                        <div className="text-[10px] text-text-muted">Karbo: 85g • Prot: 25g</div>
                      </div>
                    </div>

                    <div className="bg-background border border-border-light rounded-xl p-3 flex items-center justify-between opacity-80">
                      <div>
                        <div className="font-bold text-primary-dark text-sm flex items-center gap-1.5">
                          Gado-Gado Lontong
                          <span className="text-[9px] bg-secondary-50 text-secondary border border-secondary-200 px-1 py-0.5 rounded font-medium">AI Verified</span>
                        </div>
                        <div className="text-[11px] text-text-secondary mt-0.5">Bumbu kacang dipisah</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary-action text-sm">380 kcal</div>
                        <div className="text-[10px] text-text-muted">Karbo: 45g • Prot: 12g</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Feature 02 Highlight */}
      <section className="relative z-10 py-24 lg:py-32 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="lg:order-2">
                <div className="text-8xl lg:text-9xl font-bold text-secondary/15 font-display mb-4">02</div>
                <h3 className="text-3xl sm:text-4xl font-bold text-primary-dark mb-6 font-display leading-tight">Personalisasi Medis Otomatis</h3>
                <p className="text-lg text-text-secondary leading-relaxed font-light mb-8">
                  Atur kondisi medis Anda seperti diabetes, hipertensi, atau kolesterol. Sistem kami secara cerdas memfilter bahan makanan berbahaya dan menyarankan alternatif sehat.
                </p>
              </div>
              
              <div className="lg:order-1">
                {/* Medical Profiling Mockup */}
                <div className="bg-surface border border-border-warm rounded-2xl p-6 shadow-warm-lg max-w-md mx-auto">
                  <div className="flex items-center justify-between border-b border-border-warm pb-4 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Profil Medis Anda</span>
                    <span className="badge-action text-[10px] px-2 py-0.5 rounded bg-primary-action-50 text-primary-action border border-primary-action-200">Terproteksi</span>
                  </div>
                  <div className="space-y-4 text-left">
                    <div>
                      <label className="text-xs font-bold text-primary-dark block mb-2">Kondisi Kesehatan & Pantangan</label>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-action text-white flex items-center gap-1">
                          ✓ Diabetes Mellitus
                        </span>
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-action text-white flex items-center gap-1">
                          ✓ Kolesterol Tinggi
                        </span>
                        <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-background border border-border-warm text-text-secondary">
                          + Hipertensi
                        </span>
                      </div>
                    </div>
                    <div className="bg-primary-action-50 border border-primary-action-100 rounded-xl p-3 text-xs text-primary-action-900 leading-relaxed font-light">
                      <strong>Rekomendasi AI:</strong> Mengingat kondisi Diabetes & Kolesterol Anda, kami akan menyarankan menu rendah indeks glikemik serta membatasi santan berlebih pada resep harian Anda secara otomatis.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Feature 03 Highlight */}
      <section className="relative z-10 py-24 lg:py-32 px-4 sm:px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <div className="text-8xl lg:text-9xl font-bold text-accent/20 font-display mb-4">03</div>
                <h3 className="text-3xl sm:text-4xl font-bold text-primary-dark mb-6 font-display leading-tight">Konsultasi AI Nutritionist 24/7</h3>
                <p className="text-lg text-text-secondary leading-relaxed font-light mb-8">
                  Tanyakan kecocokan gizi, saran menu harian, atau tips pola makan langsung ke asisten nutrisi berbasis Gemini AI yang terverifikasi klinis.
                </p>
              </div>
              
              <div>
                {/* Chat Mockup */}
                <div className="bg-surface border border-border-warm rounded-2xl p-6 shadow-warm-lg max-w-md mx-auto">
                  <div className="flex items-center justify-between border-b border-border-warm pb-4 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Chat Asisten Nutrify</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                  </div>
                  <div className="space-y-3 pr-1 text-left">
                    <div className="flex flex-col items-end">
                      <div className="bg-primary-action text-white text-xs rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[85%] shadow-warm-sm">
                        Apakah aman bagi penderita diabetes makan mangga arumanis?
                      </div>
                      <span className="text-[9px] text-text-muted mt-1 mr-1">10:45 AM</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="bg-background border border-border-warm text-primary-dark text-xs rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[85%] leading-relaxed font-light">
                        Mangga arumanis memiliki indeks glikemik sedang. Aman dikonsumsi porsi kecil (50-100g) dan sebaiknya dikonsumsi bersama kacang almond untuk memperlambat lonjakan gula darah Anda.
                      </div>
                      <span className="text-[9px] text-text-muted mt-1 ml-1">Nutrify AI • 10:45 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-4 sm:px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="bg-primary-dark rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-warm-xl">
              {/* Subtle Batik Pattern Overlay */}
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay text-white" 
                   style={{ 
                     backgroundImage: 'url(/illustrations/batik-pattern.svg)', 
                     backgroundRepeat: 'repeat',
                     backgroundSize: '80px 80px' 
                   }} 
              />

              {/* Abstract Background Design */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-action rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 opacity-30" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 opacity-20" />

              <div className="relative z-10">
                <h2 className="text-4xl sm:text-5xl font-bold text-surface mb-6 font-display tracking-tight text-balance">
                  Siap mengubah cara Anda menikmati makanan?
                </h2>
                <p className="text-surface-alt/80 text-lg mb-10 max-w-xl mx-auto font-light">
                  Bergabunglah dengan ribuan pengguna lainnya yang telah menemukan keseimbangan antara kesehatan dan kelezatan hidangan Nusantara.
                </p>
                <Link href="/auth/register">
                  <GradientButton variant="primary" size="lg" className="bg-primary-action text-white">
                    Mulai Perjalanan Sehatmu
                  </GradientButton>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 pt-20 pb-10 px-4 sm:px-6 border-t border-border/60 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6 group">
                <svg viewBox="0 0 100 120" className="h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 8C65 20 72 32 72 45C72 60 62 72 50 72C38 72 28 60 28 45C28 32 35 20 50 8Z" fill="#C4603A"/>
                  <ellipse cx="50" cy="52" rx="13" ry="17" fill="#FAF0E0" className="transition-colors duration-300 group-hover:fill-white" />
                  <circle cx="50" cy="52" r="6" fill="#E8A838"/>
                  <rect x="44" y="71" width="12" height="16" rx="6" fill="#C4603A"/>
                </svg>
                <span className="text-2xl font-bold tracking-tight text-primary-dark group-hover:text-primary-action transition-colors duration-300 font-display">Nutrify</span>
              </Link>
              <p className="text-text-secondary max-w-sm font-light leading-relaxed mb-6">
                Platform nutrisi pintar yang memahami kekayaan kuliner Nusantara dan mengutamakan kesehatan holistik Anda.
              </p>
            </div>
            
            {/* Real link Category 1 */}
            <div>
              <h4 className="font-bold text-primary-dark mb-6 font-display text-sm tracking-wide uppercase">Layanan Gizi</h4>
              <ul className="space-y-4 text-text-secondary font-medium text-sm">
                <li><Link href="/auth/register" className="hover:text-primary-action transition-colors">Database Gizi Lokal</Link></li>
                <li><Link href="/auth/register" className="hover:text-primary-action transition-colors">Perencana Menu AI</Link></li>
                <li><Link href="/auth/register" className="hover:text-primary-action transition-colors">Konsultasi Nutrisi</Link></li>
              </ul>
            </div>
            
            {/* Real link Category 2 */}
            <div>
              <h4 className="font-bold text-primary-dark mb-6 font-display text-sm tracking-wide uppercase">Program Diet</h4>
              <ul className="space-y-4 text-text-secondary font-medium text-sm">
                <li><Link href="/auth/register" className="hover:text-primary-action transition-colors">Diet Diabetes Mellitus</Link></li>
                <li><Link href="/auth/register" className="hover:text-primary-action transition-colors">Diet Hipertensi</Link></li>
                <li><Link href="/auth/register" className="hover:text-primary-action transition-colors">Diet Kolesterol Tinggi</Link></li>
              </ul>
            </div>

            {/* Real link Category 3 */}
            <div>
              <h4 className="font-bold text-primary-dark mb-6 font-display text-sm tracking-wide uppercase">Edukasi & Alat</h4>
              <ul className="space-y-4 text-text-secondary font-medium text-sm">
                <li><Link href="/help" className="hover:text-primary-action transition-colors">Panduan Bahan Lokal</Link></li>
                <li><Link href="/help" className="hover:text-primary-action transition-colors">Kalkulator BMI Harian</Link></li>
                <li><Link href="/help" className="hover:text-primary-action transition-colors">Artikel Gizi Klinis</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted">
            <p>© {new Date().getFullYear()} Nutrify Indonesia. Powered by Gemini AI. Hak cipta dilindungi.</p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-border-warm flex items-center justify-center hover:bg-primary-action hover:text-white transition-colors cursor-pointer" />
              <div className="w-8 h-8 rounded-full bg-border-warm flex items-center justify-center hover:bg-primary-action hover:text-white transition-colors cursor-pointer" />
              <div className="w-8 h-8 rounded-full bg-border-warm flex items-center justify-center hover:bg-primary-action hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
