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
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🥗</span>
              <span className="text-xl sm:text-2xl font-bold text-green-600">Nutrify</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-green-600 font-medium transition text-sm sm:text-base"
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
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6"
            variants={fadeInUp}
          >
            Perencanaan Nutrisi Personal
            <span className="block text-green-600 mt-2">Berbasis Budaya Indonesia</span>
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto"
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
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-green-600 font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-lg border-2 border-green-600 transition text-base sm:text-lg"
            >
              Pelajari Lebih Lanjut
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto" variants={fadeInUp}>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">1000+</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Makanan Lokal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">AI</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Gemini Powered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">100%</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Gratis</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        className="bg-white py-12 sm:py-20"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12"
            variants={fadeInUp}
          >
            Fitur Unggulan
          </motion.h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <motion.div className="bg-green-50 p-6 sm:p-8 rounded-xl hover:shadow-lg transition" variants={fadeInUp}>
              <div className="text-4xl sm:text-5xl mb-4">🍛</div>
              <h3 className="font-bold text-lg sm:text-xl mb-3">Makanan Lokal</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Rencana makan menggunakan bahan makanan lokal Indonesia yang mudah ditemukan dan terjangkau
              </p>
            </motion.div>
            
            <motion.div className="bg-green-50 p-6 sm:p-8 rounded-xl hover:shadow-lg transition" variants={fadeInUp}>
              <div className="text-4xl sm:text-5xl mb-4">🏥</div>
              <h3 className="font-bold text-lg sm:text-xl mb-3">Disesuaikan Medis</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Mempertimbangkan kondisi kesehatan, alergi, dan pantangan medis Anda secara personal
              </p>
            </motion.div>
            
            <motion.div className="bg-green-50 p-6 sm:p-8 rounded-xl hover:shadow-lg transition" variants={fadeInUp}>
              <div className="text-4xl sm:text-5xl mb-4">🤖</div>
              <h3 className="font-bold text-lg sm:text-xl mb-3">AI-Powered</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Menggunakan Gemini AI untuk memberikan rekomendasi nutrisi yang akurat dan personal
              </p>
            </motion.div>

            <motion.div className="bg-green-50 p-6 sm:p-8 rounded-xl hover:shadow-lg transition" variants={fadeInUp}>
              <div className="text-4xl sm:text-5xl mb-4">🌏</div>
              <h3 className="font-bold text-lg sm:text-xl mb-3">Berbasis Budaya</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Menghormati preferensi budaya dan agama Anda dalam setiap rekomendasi makanan
              </p>
            </motion.div>

            <motion.div className="bg-green-50 p-6 sm:p-8 rounded-xl hover:shadow-lg transition" variants={fadeInUp}>
              <div className="text-4xl sm:text-5xl mb-4">📊</div>
              <h3 className="font-bold text-lg sm:text-xl mb-3">Tracking Lengkap</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Monitor progres kesehatan, berat badan, dan biomarker Anda secara berkala
              </p>
            </motion.div>

            <motion.div className="bg-green-50 p-6 sm:p-8 rounded-xl hover:shadow-lg transition" variants={fadeInUp}>
              <div className="text-4xl sm:text-5xl mb-4">💬</div>
              <h3 className="font-bold text-lg sm:text-xl mb-3">Chat AI</h3>
              <p className="text-sm sm:text-base text-gray-600">
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
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6"
            variants={fadeInUp}
          >
            Siap Memulai Perjalanan Sehat Anda?
          </motion.h2>
          <motion.p 
            className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8"
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
              <span className="text-3xl">🥗</span>
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
