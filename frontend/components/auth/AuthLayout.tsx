import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface AuthLayoutProps {
  children: React.ReactNode
  type: 'login' | 'register'
}

export function AuthLayout({ children, type }: AuthLayoutProps) {
  const isLogin = type === 'login'

  return (
    <div className="flex min-h-screen bg-paper-light font-body overflow-hidden">
      
      {/* Brand Panel - Left for register, Right for login */}
      <div className={`hidden lg:flex lg:w-1/2 relative bg-paper-craft shadow-scrapbook border-r-4 border-ink flex-col justify-center px-12 ${isLogin ? 'order-2 border-l-4 border-r-0' : 'order-1'}`}>
        
        {/* Tape Decor */}
        <Image src="/assets/scrapbook/washi-tape-sage.png" alt="tape" width={150} height={50} className={`absolute top-10 ${isLogin ? 'right-10 rotate-12' : 'left-10 -rotate-12'} opacity-80 mix-blend-multiply`} />
        
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col h-full py-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group w-max">
            <span className="text-3xl font-editorial font-bold text-ink border-b-2 border-ink group-hover:text-twilight transition-colors">AI Ate Indonesia</span>
          </Link>
          
          <div className="mt-auto mb-auto relative">
            {/* Collage Element */}
            <div className="absolute -top-12 -right-16 transform rotate-6 opacity-40 z-0 pointer-events-none">
               <Image src="/assets/scrapbook/circle-highlight-thin.svg" alt="highlight" width={200} height={200} />
            </div>

            <h2 className="text-4xl md:text-5xl font-editorial text-ink whitespace-pre-line mb-6 relative z-10">
              {isLogin ? 'Selamat datang\nkembali.' : 'Mulai jurnal\nkesehatanmu.'}
            </h2>
            <p className="text-ink-2 font-handwritten text-3xl max-w-sm relative z-10">
              {isLogin 
                ? 'Lanjutkan progres diet berbasis pangan lokal Nusantara hari ini.' 
                : 'Bergabunglah dengan revolusi sehat Nusantara.'}
            </p>
            
            {/* Arrow Doodle */}
            <Image src="/assets/scrapbook/arrow-point-right.png" alt="arrow" width={60} height={60} className={`mt-8 opacity-70 ${isLogin ? 'transform rotate-180 -scale-y-100' : ''}`} />
          </div>
          
          <div className="mt-auto pt-8 flex justify-between items-end">
            <p className="text-ink-3 font-handwritten text-xl">
              © {new Date().getFullYear()} AI Ate Indonesia.
            </p>
            <Image src="/assets/scrapbook/stamp-gold.png" alt="stamp" width={80} height={80} className="opacity-80 rotate-12 mix-blend-multiply" />
          </div>
        </div>
      </div>
      
      {/* Form Panel */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative bg-paper-light ${isLogin ? 'order-1' : 'order-2'}`}>
        
        {/* Subtle background noise/stain */}
        <Image src="/assets/scrapbook/coffee-ring-stain.png" alt="stain" width={300} height={300} className="absolute top-10 right-10 opacity-10 mix-blend-multiply pointer-events-none" />

        <div className="w-full max-w-md mx-auto relative z-10">
          
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <Link href="/" className="inline-block border-b-2 border-ink">
              <span className="text-3xl font-editorial font-bold text-ink tracking-tight">AI Ate Indonesia</span>
            </Link>
          </div>
          
          {/* Card-like paper container for form */}
          <div className="bg-white p-8 md:p-10 shadow-scrapbook relative border border-surface-2 transform rotate-1">
            <Image src="/assets/scrapbook/clear-tape-piece.png" alt="tape" width={100} height={30} className="absolute -top-3 left-1/2 -translate-x-1/2 mix-blend-multiply opacity-60" />
            <div className="transform -rotate-1">
              {children}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
