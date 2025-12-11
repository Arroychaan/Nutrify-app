'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Utensils,
  Heart,
  Sparkles,
  Globe,
  BarChart3,
  MessageSquare,
  ChevronRight,
  Check
} from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <img src="/icon.svg" alt="Nutrify" className="w-9 h-9" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Nutrify</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold py-2 px-4 rounded-xl text-sm hover:opacity-90 transition-opacity"
              >
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Powered by Gemini AI
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                Perencanaan Nutrisi
                <span className="block bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Berbasis Budaya Indonesia
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                AI personal nutritionist yang memahami makanan lokal Indonesia,
                kondisi kesehatan, dan preferensi budaya Anda.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-8 rounded-2xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all text-lg"
                >
                  Mulai Sekarang
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-lg"
                >
                  Pelajari Lebih Lanjut
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-500">1000+</div>
                <div className="text-xs sm:text-sm text-gray-500">Makanan Lokal</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-500">AI</div>
                <div className="text-xs sm:text-sm text-gray-500">Gemini Powered</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-500">100%</div>
                <div className="text-xs sm:text-sm text-gray-500">Gratis</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Semua yang Anda butuhkan untuk perjalanan kesehatan yang lebih baik
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Utensils,
                title: 'Makanan Lokal',
                description: 'Database 1000+ makanan Indonesia dengan nilai nutrisi akurat',
                color: 'emerald'
              },
              {
                icon: Heart,
                title: 'Sesuai Kondisi Medis',
                description: 'Rekomendasi disesuaikan dengan diabetes, hipertensi, dll',
                color: 'red'
              },
              {
                icon: Sparkles,
                title: 'AI-Powered',
                description: 'Gemini AI untuk rekomendasi nutrisi personal yang akurat',
                color: 'violet'
              },
              {
                icon: Globe,
                title: 'Berbasis Budaya',
                description: 'Menghormati preferensi budaya dan agama dalam setiap saran',
                color: 'blue'
              },
              {
                icon: BarChart3,
                title: 'Tracking Lengkap',
                description: 'Pantau kalori, makronutrien, berat badan, dan progres Anda',
                color: 'amber'
              },
              {
                icon: MessageSquare,
                title: 'Chat AI',
                description: 'Konsultasi langsung dengan AI nutritionist kapan saja',
                color: 'teal'
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
              >
                <div className={`w-12 h-12 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-500`} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Mengapa Memilih Nutrify?
              </h2>
              <div className="space-y-4">
                {[
                  'Database makanan Indonesia yang lengkap dan akurat',
                  'AI memahami kondisi kesehatan seperti diabetes & hipertensi',
                  'Rekomendasi sesuai budaya dan pantangan agama',
                  'Gratis sepenuhnya tanpa biaya tersembunyi',
                  'Antarmuka yang mudah digunakan',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{benefit}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white"
            >
              <h3 className="text-2xl font-bold mb-4">Mulai Perjalanan Sehat Anda</h3>
              <p className="text-emerald-100 mb-6">
                Daftar sekarang dan dapatkan rencana nutrisi personal yang disesuaikan dengan profil kesehatan Anda.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
              >
                Daftar Gratis Sekarang
                <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/icon.svg" alt="Nutrify" className="w-10 h-10" />
              <div>
                <h3 className="font-bold text-lg">Nutrify</h3>
                <p className="text-gray-400 text-sm">Partner Kesehatanmu</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/help" className="hover:text-white transition-colors">Bantuan</Link>
              <Link href="/about" className="hover:text-white transition-colors">Tentang</Link>
              <Link href="/auth/login" className="hover:text-white transition-colors">Masuk</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>© 2025 Nutrify. Dibuat dengan ❤️ di Indonesia</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
