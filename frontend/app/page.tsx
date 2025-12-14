'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Utensils,
  Heart,
  Sparkles,
  Globe,
  BarChart3,
  MessageSquare,
  ChevronRight,
  Leaf,
  ArrowRight
} from 'lucide-react'
import { GradientButton } from '@/components/ui/GradientButton'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Decorative Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-32 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-teal-200/30 dark:bg-teal-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-cyan-200/30 dark:bg-cyan-900/20 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Nutrify</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm px-4 py-2 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold py-2.5 px-5 rounded-2xl text-sm hover:opacity-90 transition-opacity shadow-lg"
            >
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-sm">
                <Sparkles className="w-4 h-4" />
                Powered by Gemini AI
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-[1.1] mb-6">
                Perjalanan Sehat
                <span className="block mt-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  Dimulai dari Sini
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                AI nutritionist personal yang memahami makanan Indonesia,
                kondisi kesehatanmu, dan preferensi budayamu.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                <Link href="/auth/register">
                  <GradientButton className="text-lg px-8 py-4 w-full sm:w-auto" icon={ArrowRight}>
                    Mulai Sekarang
                  </GradientButton>
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-4 px-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-lg shadow-sm w-full sm:w-auto"
                >
                  Lihat Fitur
                </Link>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              className="grid grid-cols-3 gap-4 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <StatCard value="1000+" label="Makanan" emoji="🍛" />
              <StatCard value="AI" label="Gemini" emoji="✨" />
              <StatCard value="100%" label="Gratis" emoji="🎉" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Semua yang Kamu Butuhkan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
              Fitur lengkap untuk mendukung perjalanan sehatmu
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={Utensils}
              title="1000+ Makanan Lokal"
              description="Database lengkap makanan Indonesia dengan nilai nutrisi akurat"
              color="emerald"
              delay={0}
            />
            <FeatureCard
              icon={Heart}
              title="Personalisasi Medis"
              description="Disesuaikan dengan kondisi diabetes, hipertensi, dan lainnya"
              color="rose"
              delay={0.1}
            />
            <FeatureCard
              icon={Sparkles}
              title="AI-Powered"
              description="Gemini AI memberikan rekomendasi nutrisi yang akurat"
              color="violet"
              delay={0.2}
            />
            <FeatureCard
              icon={Globe}
              title="Berbasis Budaya"
              description="Menghormati preferensi budaya dan agama Anda"
              color="blue"
              delay={0.3}
            />
            <FeatureCard
              icon={BarChart3}
              title="Tracking Lengkap"
              description="Pantau kalori, makronutrien, dan progres berat badan"
              color="amber"
              delay={0.4}
            />
            <FeatureCard
              icon={MessageSquare}
              title="Chat AI"
              description="Konsultasi langsung dengan AI nutritionist kapan saja"
              color="teal"
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-2xl mb-6">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Mulai Perjalanan Sehatmu
              </h2>
              <p className="text-emerald-100 mb-8 max-w-md mx-auto">
                Daftar gratis dan dapatkan rencana nutrisi personal dari AI
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold py-4 px-8 rounded-2xl hover:shadow-xl transition-all"
              >
                Daftar Gratis Sekarang
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 sm:px-6 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Nutrify</h3>
                <p className="text-gray-500 text-sm">Partner Kesehatanmu</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/help" className="hover:text-gray-900 dark:hover:text-white transition-colors">Bantuan</Link>
              <Link href="/about" className="hover:text-gray-900 dark:hover:text-white transition-colors">Tentang</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-400">
            <p>© 2025 Nutrify. Dibuat dengan ❤️ di Indonesia</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

// Stat Card Component
function StatCard({ value, label, emoji }: { value: string; label: string; emoji: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs sm:text-sm text-gray-500">{label}</div>
    </div>
  )
}

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, color, delay }: { icon: any; title: string; description: string; color: string; delay: number }) {
  const colors: Record<string, { bg: string; icon: string; border: string }> = {
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-500', border: 'border-emerald-100 dark:border-emerald-800/30' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', icon: 'text-rose-500', border: 'border-rose-100 dark:border-rose-800/30' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'text-violet-500', border: 'border-violet-100 dark:border-violet-800/30' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-500', border: 'border-blue-100 dark:border-blue-800/30' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-500', border: 'border-amber-100 dark:border-amber-800/30' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', icon: 'text-teal-500', border: 'border-teal-100 dark:border-teal-800/30' },
  }
  const c = colors[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={`${c.bg} ${c.border} border rounded-3xl p-6 hover:shadow-lg transition-shadow cursor-default`}
    >
      <div className={`w-12 h-12 ${c.bg} rounded-2xl flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${c.icon}`} />
      </div>
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}
