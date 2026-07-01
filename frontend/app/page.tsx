'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Elegant Fade-in component for Editorial style (slower, graceful)
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number, className?: string }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    const currentRef = ref.current
    if (currentRef) observer.observe(currentRef)
    return () => {
      if (currentRef) observer.unobserve(currentRef)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="min-h-screen overflow-hidden bg-surface relative selection:bg-sage/20 selection:text-ink">
      
      {/* Subtle Texture Overlay - gives depth without clutter */}
      <div className="fixed inset-0 pointer-events-none z-0 mix-blend-multiply opacity-[0.03] bg-[url('/assets/scrapbook/paper-recycled.jpg')] bg-repeat"></div>

      {/* Editorial Navbar - Minimalist */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 ${scrolled ? 'bg-surface/90 backdrop-blur-md py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-[90rem] mx-auto px-6 sm:px-12 flex justify-between items-center border-b border-ink/10 pb-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8">
               <Image src="/assets/brand/Logogram.svg" alt="AI Ate Logo" fill className="object-contain" />
            </div>
            <span className="font-editorial text-2xl font-bold text-ink tracking-tight">AI Ate.</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-12 font-editorial italic text-lg text-ink/70">
            <Link href="#edisi" className="hover:text-ink transition-colors">Edisi Jurnal</Link>
            <Link href="#kurasi" className="hover:text-ink transition-colors">Kurasi Nutrisi</Link>
            <Link href="#langganan" className="hover:text-ink transition-colors">Langganan</Link>
          </div>
          
          <div className="flex items-center gap-6 font-editorial">
            <Link href="/auth/login" className="hidden sm:block text-ink/70 hover:text-ink transition-colors text-lg italic">
              Masuk
            </Link>
            <Link href="/auth/register" className="bg-ink text-surface px-6 py-2 rounded-none hover:bg-ink-2 transition-colors border border-ink text-lg uppercase tracking-widest text-sm">
              Mulai
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Magazine Cover Style */}
      <section className="relative min-h-screen pt-32 pb-20 px-6 sm:px-12 flex items-center justify-center">
        <div className="max-w-[90rem] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Huge Typography */}
          <div className="col-span-1 lg:col-span-7">
            <FadeIn>
              <div className="font-editorial italic text-sage text-xl mb-6">Vol. 1 — Inovasi Pangan Lokal</div>
            </FadeIn>
            
            <FadeIn delay={200}>
              <h1 className="text-[12vw] lg:text-[7.5rem] leading-[0.85] font-editorial text-ink tracking-tighter mb-8">
                Cita Rasa <br />
                <span className="italic text-ink-2">Nusantara.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={400} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mt-12 border-t border-ink/20 pt-8">
              <div>
                <p className="font-body text-ink-2 leading-relaxed text-sm uppercase tracking-widest mb-2 font-bold">Visi Kami</p>
                <p className="font-editorial text-lg text-ink leading-snug">Menghadirkan kecerdasan buatan ke meja makan Anda, dengan kearifan resep lokal.</p>
              </div>
              <div>
                <p className="font-body text-ink-2 leading-relaxed text-sm uppercase tracking-widest mb-2 font-bold">Pendekatan</p>
                <p className="font-editorial text-lg text-ink leading-snug">Gizi yang dipersonalisasi secara presisi, ramah kantong, dan divalidasi secara medis.</p>
              </div>
            </FadeIn>
          </div>
          
          {/* Right Column: Hero Art Piece */}
          <div className="col-span-1 lg:col-span-5 relative flex justify-center lg:justify-end">
            <FadeIn delay={600} className="relative w-full max-w-[500px] aspect-[3/4]">
              {/* Frame */}
              <div className="absolute inset-0 border border-ink/10 bg-surface-2 p-4">
                <div className="relative w-full h-full border border-ink/5 bg-surface overflow-hidden group">
                  {/* Subtle Stamp Watermark */}
                  <div className="absolute top-4 right-4 z-10 opacity-30 mix-blend-multiply w-20 h-20 rotate-12">
                     <Image src="/assets/scrapbook/stamp-gold.png" alt="Stamp" fill className="object-contain" />
                  </div>
                  
                  {/* Hero 3D Asset */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-[2000ms] ease-out">
                      <Image src="/assets/3d-foods/Nasi-padang.png" alt="Nasi Padang" fill className="object-contain drop-shadow-2xl" priority />
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-surface to-transparent">
                    <p className="font-editorial italic text-2xl text-ink">Nasi Padang Sehat</p>
                    <div className="w-12 h-[1px] bg-ink mt-2 mb-2"></div>
                    <p className="font-body text-xs text-ink-2 uppercase tracking-widest">450 Kkal • Tinggi Protein</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Marquee or Separator */}
      <div className="border-y border-ink/10 py-6 overflow-hidden flex items-center bg-surface-2">
        <div className="font-editorial italic text-2xl text-ink/60 whitespace-nowrap px-4 tracking-wider flex gap-12">
          <span>Keakuratan Medis</span>
          <span className="text-sage">•</span>
          <span>100% Pangan Lokal</span>
          <span className="text-sage">•</span>
          <span>Kecerdasan Buatan Terdepan</span>
          <span className="text-sage">•</span>
          <span>Personalisasi Sempurna</span>
          <span className="text-sage">•</span>
          <span>Keakuratan Medis</span>
        </div>
      </div>

      {/* Editorial Features - 3 Columns Layout */}
      <section id="kurasi" className="py-32 px-6 sm:px-12 bg-surface relative z-10">
        <div className="max-w-[90rem] mx-auto">
          <FadeIn>
            <div className="mb-20">
              <h2 className="text-5xl lg:text-7xl font-editorial text-ink tracking-tight mb-6">Kurasi <br/><span className="italic text-ink-2">Masa Depan.</span></h2>
              <div className="w-24 h-[1px] bg-ink"></div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
            
            {/* Feature 1 */}
            <FadeIn delay={100}>
              <div className="border-t border-ink/20 pt-6">
                <span className="block font-editorial text-5xl text-ink/20 mb-6 italic">01</span>
                <h3 className="text-3xl font-editorial font-bold text-ink mb-4">Pustaka Nusantara</h3>
                <p className="text-ink-2 font-body leading-relaxed mb-8">Dari tempe mendoan hingga cakalang fufu. Kami telah mengkurasi dan menghitung nilai gizi dari 1.200+ resep otentik Indonesia secara akurat.</p>
                <div className="relative w-full aspect-square bg-surface-2 border border-ink/10 p-8 flex items-center justify-center">
                  <Image src="/assets/3d-foods/sate-ayam.png" alt="Sate Ayam" fill className="object-contain p-8 hover:scale-110 transition-transform duration-[1500ms]" />
                </div>
              </div>
            </FadeIn>

            {/* Feature 2 */}
            <FadeIn delay={200}>
              <div className="border-t border-ink/20 pt-6">
                <span className="block font-editorial text-5xl text-ink/20 mb-6 italic">02</span>
                <h3 className="text-3xl font-editorial font-bold text-ink mb-4">Asisten Cerdas</h3>
                <p className="text-ink-2 font-body leading-relaxed mb-8">Bukan sekadar pencatat kalori. AI kami menganalisis kondisi medis, anggaran, dan preferensi lidah Anda untuk menyusun menu ideal.</p>
                <div className="relative w-full aspect-square bg-surface-2 border border-ink/10 p-8 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[url('/assets/brand/Pattern-Brand.svg')] bg-cover mix-blend-multiply"></div>
                  <Image src="/assets/illustrations/ai-bingung.png" alt="AI Assistant" fill className="object-contain p-12 hover:-rotate-3 transition-transform duration-[1500ms]" />
                </div>
              </div>
            </FadeIn>

            {/* Feature 3 */}
            <FadeIn delay={300}>
              <div className="border-t border-ink/20 pt-6">
                <span className="block font-editorial text-5xl text-ink/20 mb-6 italic">03</span>
                <h3 className="text-3xl font-editorial font-bold text-ink mb-4">Pantauan Medis</h3>
                <p className="text-ink-2 font-body leading-relaxed mb-8">Dilengkapi dengan validasi ahli gizi, sistem kami akan memperingatkan jika sebuah menu berpotensi memicu masalah kesehatan Anda.</p>
                <div className="relative w-full aspect-square bg-surface-2 border border-ink/10 p-8 flex items-center justify-center">
                   <div className="relative w-32 h-32">
                     <Image src="/assets/badges/medali-kalori-streak.png" alt="Medical Badge" fill className="object-contain drop-shadow-xl" />
                   </div>
                </div>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* Pricing - Minimalist Table/Block */}
      <section id="langganan" className="py-32 px-6 sm:px-12 bg-surface-2 border-y border-ink/10">
        <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          <div className="flex flex-col justify-center">
            <FadeIn>
              <h2 className="text-5xl lg:text-7xl font-editorial text-ink tracking-tight mb-8">Berlangganan <br/><span className="italic text-ink-2">Edisi Jurnal.</span></h2>
              <p className="text-xl font-editorial text-ink-2 max-w-md leading-relaxed mb-12">
                Pilih edisi yang sesuai dengan kedalaman perjalanan diet dan gaya hidup Anda.
              </p>
              <div className="hidden lg:block">
                 <Image src="/assets/brand/Wordmark.svg" alt="Wordmark" width={180} height={40} className="opacity-50" />
              </div>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <FadeIn delay={100} className="bg-surface border border-ink/20 p-10 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-editorial font-bold text-ink mb-2">Edisi Standar</h3>
                <div className="w-8 h-[1px] bg-ink mb-6"></div>
                <div className="text-4xl font-editorial text-ink mb-8">Gratis</div>
                <ul className="space-y-4 font-body text-sm text-ink-2 mb-12">
                  <li className="flex items-start gap-4">
                    <span className="block mt-1 w-1 h-1 bg-ink rounded-full"></span> 
                    Akses 500+ resep dasar Nusantara
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="block mt-1 w-1 h-1 bg-ink rounded-full"></span> 
                    Pencatatan kalori manual harian
                  </li>
                </ul>
              </div>
              <Link href="/auth/register" className="block text-center border border-ink py-4 uppercase tracking-widest text-xs font-bold hover:bg-ink hover:text-surface transition-colors">
                Mulai Membaca
              </Link>
            </FadeIn>

            <FadeIn delay={200} className="bg-ink text-surface border border-ink p-10 flex flex-col justify-between relative">
              <div className="absolute top-0 right-0 p-4">
                 <Image src="/assets/scrapbook/stamp-gold.png" alt="Premium" width={60} height={60} className="opacity-80 rotate-[15deg]" />
              </div>
              <div>
                <h3 className="text-2xl font-editorial font-bold text-surface mb-2">Edisi Premium</h3>
                <div className="w-8 h-[1px] bg-surface mb-6"></div>
                <div className="text-4xl font-editorial text-surface mb-8">Rp 49rb<span className="text-lg italic text-surface/60">/bln</span></div>
                <ul className="space-y-4 font-body text-sm text-surface-2 mb-12">
                  <li className="flex items-start gap-4">
                    <span className="block mt-1 w-1 h-1 bg-sage-light rounded-full"></span> 
                    Analisis AI Nutrisi Personal 24/7
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="block mt-1 w-1 h-1 bg-sage-light rounded-full"></span> 
                    Rencana Menu 30 Hari Otomatis
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="block mt-1 w-1 h-1 bg-sage-light rounded-full"></span> 
                    Kesesuaian Data Rekam Medis
                  </li>
                </ul>
              </div>
              <Link href="/auth/register" className="block text-center bg-surface text-ink border border-surface py-4 uppercase tracking-widest text-xs font-bold hover:bg-surface-2 transition-colors">
                Berlangganan
              </Link>
            </FadeIn>
          </div>

        </div>
      </section>

      {/* Footer - Editorial Colophon */}
      <footer className="bg-surface pt-24 pb-12 px-6 sm:px-12 border-t-[8px] border-ink">
        <div className="max-w-[90rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          
          <div className="md:col-span-2">
            <h2 className="font-editorial text-4xl text-ink tracking-tight mb-6">AI Ate<span className="italic">.</span></h2>
            <p className="text-ink-2 font-editorial italic text-xl max-w-md leading-relaxed">
              Sebuah terbitan kesehatan digital yang memadukan keindahan resep warisan leluhur dengan kecerdasan teknologi komputasi presisi.
            </p>
          </div>
          
          <div>
            <h4 className="font-body text-xs font-bold uppercase tracking-widest text-ink mb-8">Indeks</h4>
            <ul className="space-y-3 font-editorial text-lg text-ink-2">
              <li><Link href="#kurasi" className="hover:text-ink hover:italic transition-all">Kurasi & Fitur</Link></li>
              <li><Link href="#langganan" className="hover:text-ink hover:italic transition-all">Berlangganan</Link></li>
              <li><Link href="/auth/login" className="hover:text-ink hover:italic transition-all">Masuk Akun</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-body text-xs font-bold uppercase tracking-widest text-ink mb-8">Redaksi</h4>
            <ul className="space-y-3 font-editorial text-lg text-ink-2">
              <li>halo@aiate.id</li>
              <li>@aiate.indonesia</li>
              <li>Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>

        <div className="max-w-[90rem] mx-auto border-t border-ink/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-body text-ink-3 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} AI Ate Indonesia. Hak cipta dilindungi.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-ink transition-colors">Privasi</Link>
            <Link href="#" className="hover:text-ink transition-colors">Ketentuan</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
