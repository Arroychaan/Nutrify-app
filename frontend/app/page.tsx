'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="navLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#24B47E"/>
                      <stop offset="100%" stopColor="#1a8f63"/>
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="50" fill="url(#navLogoGradient)"/>
                  <path d="M30 70 L30 30 L40 30 L60 55 L60 30 L70 30 L70 70 L60 70 L40 45 L40 70 Z" fill="white"/>
                  <ellipse cx="72" cy="28" rx="6" ry="10" fill="#86efac" transform="rotate(45, 72, 28)"/>
                </svg>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">Nutrify</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition text-sm sm:text-base"
              >
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition text-sm sm:text-base"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="text-center">
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6"
            variants={fadeInUp}
          >
            Perencanaan Nutrisi Personal
            <span className="block text-green-600 dark:text-green-400 mt-2">Berbasis Budaya Indonesia</span>
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            Mendukung kesehatan Anda dengan makanan lokal dan tradisional Indonesia yang sesuai dengan kondisi medis dan preferensi budaya Anda.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12 sm:mb-16"
            variants={fadeInUp}
          >
            <Link
              href="/auth/register"
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-lg transition text-base sm:text-lg"
            >
              Mulai Sekarang Gratis
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-green-600 dark:text-green-400 font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-lg border-2 border-green-600 dark:border-green-500 transition text-base sm:text-lg"
            >
              Pelajari Lebih Lanjut
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto" variants={fadeInUp}>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">1000+</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Makanan Lokal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">AI</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Gemini Powered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">100%</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Gratis</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        className="bg-white dark:bg-gray-800 py-12 sm:py-20"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-8 sm:mb-12"
            variants={fadeInUp}
          >
            Fitur Unggulan
          </motion.h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <motion.div className="bg-green-50 dark:bg-green-900/20 p-6 sm:p-8 rounded-xl hover:shadow-lg transition" variants={fadeInUp}>
              <div className="text-4xl sm:text-5xl mb-4">🍛</div>
              <h3 className="font-bold text-lg sm:text-xl mb-3 text-gray-900 dark:text-white">Makanan Lokal</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Rencana makan menggunakan bahan makanan lokal Indonesia yang mudah ditemukan dan terjangkau
              </p>
            </motion.div>
            
            <motion.div className="bg-green-50 dark:bg-green-900/20 p-6 sm:p-8 rounded-xl hover:shadow-lg transition" variants={fadeInUp}>
              <div className="text-4xl sm:text-5xl mb-4">🏥</div>
              <h3 className="font-bold text-lg sm:text-xl mb-3 text-gray-900 dark:text-white">Disesuaikan Medis</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Mempertimbangkan kondisi kesehatan, alergi, dan pantangan medis Anda secara personal
              </p>
            </motion.div>
            
            <motion.div className="bg-green-50 dark:bg-green-900/20 p-6 sm:p-8 rounded-xl hover:shadow-lg transition" variants={fadeInUp}>
              <div className="text-4xl sm:text-5xl mb-4">🤖</div>
              <h3 className="font-bold text-lg sm:text-xl mb-3 text-gray-900 dark:text-white">AI-Powered</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Menggunakan Gemini AI untuk memberikan rekomendasi nutrisi yang akurat dan personal
              </p>
            </motion.div>

            <motion.div className="bg-green-50 dark:bg-green-900/20 p-6 sm:p-8 rounded-xl hover:shadow-lg transition" variants={fadeInUp}>
              <div className="text-4xl sm:text-5xl mb-4">🌏</div>
              <h3 className="font-bold text-lg sm:text-xl mb-3 text-gray-900 dark:text-white">Berbasis Budaya</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Menghormati preferensi budaya dan agama Anda dalam setiap rekomendasi makanan
              </p>
            </motion.div>

            <motion.div className="bg-green-50 dark:bg-green-900/20 p-6 sm:p-8 rounded-xl hover:shadow-lg transition" variants={fadeInUp}>
              <div className="text-4xl sm:text-5xl mb-4">📊</div>
              <h3 className="font-bold text-lg sm:text-xl mb-3 text-gray-900 dark:text-white">Tracking Lengkap</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Monitor progres kesehatan, berat badan, dan biomarker Anda secara berkala
              </p>
            </motion.div>

            <motion.div className="bg-green-50 dark:bg-green-900/20 p-6 sm:p-8 rounded-xl hover:shadow-lg transition" variants={fadeInUp}>
              <div className="text-4xl sm:text-5xl mb-4">💬</div>
              <h3 className="font-bold text-lg sm:text-xl mb-3 text-gray-900 dark:text-white">Chat AI</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Konsultasi langsung dengan AI nutritionist kapan saja Anda butuhkan
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-12 sm:py-20"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6"
            variants={fadeInUp}
          >
            Siap Memulai Perjalanan Sehat Anda?
          </motion.h2>
          <motion.p 
            className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8"
            variants={fadeInUp}
          >
            Daftar sekarang dan dapatkan rencana nutrisi personal gratis!
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link
              href="/auth/register"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 sm:py-4 px-8 sm:px-12 rounded-lg transition text-base sm:text-lg"
            >
              Daftar Gratis Sekarang
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#24B47E"/>
                      <stop offset="100%" stopColor="#1a8f63"/>
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="50" fill="url(#footerLogoGradient)"/>
                  <path d="M30 70 L30 30 L40 30 L60 55 L60 30 L70 30 L70 70 L60 70 L40 45 L40 70 Z" fill="white"/>
                  <ellipse cx="72" cy="28" rx="6" ry="10" fill="#86efac" transform="rotate(45, 72, 28)"/>
                </svg>
              </div>
              <span className="text-xl sm:text-2xl font-bold">Nutrify</span>
            </div>
            <p className="text-sm sm:text-base text-gray-400 mb-4">
              Perencanaan Nutrisi Personal Berbasis Budaya Indonesia
            </p>
            <div className="text-xs sm:text-sm text-gray-500">
              <p>© 2025 Nutrify. All rights reserved.</p>
              <p className="mt-2">Backend API: <code className="bg-gray-800 px-2 py-1 rounded">http://localhost:3001</code></p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
