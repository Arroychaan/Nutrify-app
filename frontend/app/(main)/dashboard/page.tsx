'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Plus, Check, ChevronRight, Flame, Send, Camera, 
  Award, MessageCircle, Heart, Share2, Sparkles, 
  TrendingUp, RefreshCw, X, AlertCircle, Bookmark, Star 
} from 'lucide-react'
import { useAppStore, FoodItem } from '@/lib/store'
import { AIPolaroidPost } from '@/components/features/feed/AIPolaroidPost'
import { MacroReceipt } from '@/components/features/feed/MacroReceipt'
import { FoodBattleCard } from '@/components/features/feed/FoodBattleCard'
import { CircularProgress } from '@/components/ui/CircularProgress'
import { cn } from '@/lib/utils'

interface StoryUser {
  name: string
  avatar: string
  handle: string
  goal: string
  ringColor: string // CSS color class for the border ring
  progress: number // target completion percentage
  streak: number
  meals: { name: string; cal: number; time: string }[]
  notes: string
}

export default function DashboardPage() {
  const store = useAppStore()
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState<'untukAnda' | 'squad'>('untukAnda')
  const [inputPostText, setInputPostText] = useState('')
  const [selectedReceiptFood, setSelectedReceiptFood] = useState<any | null>(null)
  const [selectedStoryUser, setSelectedStoryUser] = useState<StoryUser | null>(null)
  const [coachGreetingActive, setCoachGreetingActive] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    // Fetch user targets and food logs
    store.fetchInitialData()
  }, [])

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Handle Quick Log Posting
  const handleQuickLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputPostText.trim()) return

    const query = inputPostText.toLowerCase().trim()
    let foodName = inputPostText
    let cal = 300
    let protein = 15
    let carbs = 40
    let fat = 8
    let price = 15000
    let img = '/assets/3d-foods/apel.png'

    // Extract price if written like "Rp 15.000" or "15000"
    const priceMatch = query.match(/(?:rp\s*)?(\d+(?:\.\d+)?)/)
    if (priceMatch) {
      const parsedVal = parseInt(priceMatch[1].replace(/\./g, ''))
      if (parsedVal > 1000 && parsedVal < 1000000) {
        price = parsedVal
      }
    }

    // Interactive parser for Indonesian food tags
    if (query.includes('sate') || query.includes('sate ayam')) {
      foodName = 'Sate Ayam Madura'
      cal = 380
      protein = 24
      carbs = 18
      fat = 12
      img = '/assets/3d-foods/sate-ayam.png'
    } else if (query.includes('padang') || query.includes('nasi padang') || query.includes('rendang')) {
      foodName = 'Nasi Padang Lauk Rendang'
      cal = 555
      protein = 28
      carbs = 62
      fat = 18
      img = '/assets/3d-foods/Nasi-padang.png'
    } else if (query.includes('bubur') || query.includes('bubur ayam')) {
      foodName = 'Bubur Ayam Sehat'
      cal = 320
      protein = 10
      carbs = 45
      fat = 8
      img = '/assets/3d-foods/bubur.png'
    } else if (query.includes('ikan bakar') || query.includes('ikan')) {
      foodName = 'Ikan Bakar Rica'
      cal = 310
      protein = 32
      carbs = 8
      fat = 10
      img = '/assets/3d-foods/ikan-bakar.png'
    } else if (query.includes('pisang')) {
      foodName = 'Pisang Ambon'
      cal = 105
      protein = 1.3
      carbs = 27
      fat = 0.3
      img = '/assets/3d-foods/pisang.png'
    }

    // Clean name from price matching if necessary
    foodName = foodName.replace(/(?:rp\.?\s*)?\d+(?:\.\d+)?/gi, '').trim()
    if (!foodName) {
      foodName = inputPostText
    }

    // Detect meal category based on current hours
    const hour = new Date().getHours()
    let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks' = 'lunch'
    if (hour < 11) mealType = 'breakfast'
    else if (hour >= 18) mealType = 'dinner'
    else if (hour >= 15 && hour < 18) mealType = 'snacks'

    try {
      const newFood: FoodItem = {
        id: `quick-${Date.now()}`,
        name: foodName,
        cal,
        protein,
        carbs,
        fat,
        price,
        image: img,
        category: 'quick-log'
      }

      await store.addFoodToMeal(mealType, newFood)
      if (price > 0) {
        await store.addTransaction(foodName, price, 'Makanan')
      }

      triggerToast(`🍽️ Berhasil mencatat "${foodName}" (${cal} kkal) ke menu harian!`)
      setInputPostText('')
    } catch (err) {
      console.error(err)
      triggerToast('❌ Gagal mencatat makanan. Coba lagi.')
    }
  }

  // Simulated friends / squad story data
  const storyUsers: StoryUser[] = [
    {
      name: 'Coach NutriAI',
      avatar: '/assets/scrapbook/stamp-gold.png',
      handle: 'CoachNutriAI',
      goal: 'DIET COACH',
      ringColor: 'from-[#7FD49A] to-[#3D6B4F]',
      progress: 100,
      streak: 99,
      meals: [
        { name: 'Gado-gado Tanpa Lontong', cal: 280, time: '08:00' },
        { name: 'Jus Alpukat Tanpa Gula', cal: 150, time: '12:30' }
      ],
      notes: 'Makan sehat bukan berarti menyiksa. Tetap pilih bahan lokal yang padat gizi ya!'
    },
    {
      name: 'Siti Rahma',
      avatar: '/assets/scrapbook/approved-pin.png',
      handle: 'sitirahma',
      goal: 'TURUN BB',
      ringColor: 'from-[#F0A0D0] to-[#E090C0]',
      progress: 92,
      streak: 14,
      meals: [
        { name: 'Oatmeal Pisang Kayu Manis', cal: 240, time: '07:15' },
        { name: 'Sate Ayam Tanpa Lemak (5 tusuk)', cal: 180, time: '13:00' },
        { name: 'Apel Hijau', cal: 80, time: '16:00' }
      ],
      notes: 'Streak 14 hari tanpa gorengan tepung! Perjuangan berbuah manis, celana mulai longgar 🥳'
    },
    {
      name: 'Budi Santoso',
      avatar: '/assets/scrapbook/approved-pin.png',
      handle: 'budis',
      goal: 'JAGA BB',
      ringColor: 'from-[#E07A5F] to-[#C4603A]',
      progress: 75,
      streak: 8,
      meals: [
        { name: 'Bubur Ayam Jawa', cal: 320, time: '07:30' },
        { name: 'Nasi Padang Rendang Sehat', cal: 555, time: '12:45' }
      ],
      notes: 'Tetap bisa makan enak di RM Padang asal porsi nasi dikontrol dan singkong rebus diperbanyak.'
    },
    {
      name: 'Dewi Lestari',
      avatar: '/assets/scrapbook/approved-pin.png',
      handle: 'dewi.les',
      goal: 'JANTUNG SEHAT',
      ringColor: 'from-red-500 to-rose-700',
      progress: 115, // over limit warning
      streak: 4,
      meals: [
        { name: 'Soto Betawi Kuah Santan', cal: 520, time: '08:30' },
        { name: 'Kerupuk Putih (3 pcs)', cal: 300, time: '12:00' },
        { name: 'Es Teh Manis', cal: 120, time: '13:00' }
      ],
      notes: 'Waduh, hari ini khilaf makan Soto Betawi bersantan dan kerupuk. Cincin makro saya langsung merah 🙈'
    },
    {
      name: 'Andi Wijaya',
      avatar: '/assets/scrapbook/approved-pin.png',
      handle: 'andiw',
      goal: 'SEHAT & HEMAT',
      ringColor: 'from-stone-400 to-stone-600',
      progress: 42,
      streak: 0,
      meals: [
        { name: 'Roti Gandum & Telur Rebus', cal: 210, time: '07:00' }
      ],
      notes: 'Berusaha tetap konsisten logging makanan lokal di warteg dekat kantor.'
    }
  ]

  if (!isClient) return null

  // Macro progress calculations
  const caloriePercentage = Math.min(100, (store.caloriesConsumed / store.dailyCalorieTarget) * 100)
  const budgetPercentage = Math.min(100, (store.budgetSpent / store.dailyBudget) * 100)
  
  // Custom mock values for macros since store database schema is simple
  const mockCarbs = Math.round(store.caloriesConsumed * 0.55 / 4)
  const mockProtein = Math.round(store.caloriesConsumed * 0.20 / 4)
  const mockFat = Math.round(store.caloriesConsumed * 0.25 / 9)

  return (
    <div className="pb-10 font-body">
      
      {/* 3-Column Layout Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CENTER COLUMN (THE SOCIAL DIET FEED): occupies 8 columns on desktop */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Story Bar Header (Macro Rings) */}
          <div className="bg-surface dark:bg-surface-2 border border-border/60 rounded-3xl p-4 shadow-card overflow-hidden">
            <p className="text-[10px] font-bold text-ink-3 uppercase tracking-wider mb-3 px-1">Grup Diet Nusantara (Squad)</p>
            <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide snap-x">
              {storyUsers.map((user) => (
                <div 
                  key={user.handle}
                  onClick={() => setSelectedStoryUser(user)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer snap-start shrink-0 select-none group"
                >
                  {/* Glowing macro status border around avatar */}
                  <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr transition-transform duration-300 group-hover:scale-105"
                       style={{
                         backgroundImage: `linear-gradient(to tr, ${user.progress > 100 ? '#C0392B, #C0392B' : user.progress > 85 ? '#3D6B4F, #7FD49A' : '#E8A838, #E07A5F'})`
                       }}
                  >
                    <div className="w-full h-full rounded-full bg-surface dark:bg-surface-2 p-[2px]">
                      <div className="w-full h-full rounded-full bg-surface-2 dark:bg-surface-3 relative overflow-hidden">
                        <Image 
                          src={user.avatar} 
                          alt={user.name} 
                          fill 
                          className="object-contain p-1"
                        />
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-ink truncate max-w-[70px] leading-tight text-center">
                    {user.name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Post / Quick Log Input Box (X Style) */}
          <div className="bg-surface dark:bg-surface-2 border border-border/60 rounded-3xl p-5 shadow-card">
            <div className="flex gap-4 items-start">
              {/* My Avatar */}
              <div className="w-10 h-10 rounded-full bg-sage-muted text-white flex-shrink-0 flex items-center justify-center font-bold font-editorial text-sm relative border border-border/40 overflow-hidden shadow-sm">
                <span>{store.fullName ? store.fullName[0].toUpperCase() : 'S'}</span>
              </div>

              {/* Feed composition form */}
              <form onSubmit={handleQuickLogSubmit} className="flex-1 space-y-3">
                <textarea
                  value={inputPostText}
                  onChange={(e) => setInputPostText(e.target.value)}
                  placeholder="Makan apa hari ini? Tulis 'Nasi Padang Rp 25000' atau 'Sate Ayam'..."
                  className="w-full min-h-[70px] bg-transparent text-ink placeholder:text-ink-3 outline-none resize-none font-medium text-sm border-b border-border/40 focus:border-sage transition-colors pb-2"
                />

                <div className="flex justify-between items-center pt-1.5">
                  <div className="flex gap-2 text-sage hover:[&>button]:bg-sage/10 hover:[&>button]:text-sage transition-all">
                    <button 
                      type="button"
                      onClick={() => alert("Kamera / Unggah Foto: Fitur AI Visual model RAG terintegrasi (Fase MVP).")}
                      className="p-2 rounded-full bg-surface-2 dark:bg-surface-3 text-ink-2 hover:text-ink transition-colors"
                      title="Upload Photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] text-ink-3 font-bold bg-surface-2 dark:bg-surface-3 px-3 py-2 rounded-full self-center">
                      Auto-Extract Kalori & Budget
                    </span>
                  </div>

                  <button 
                    type="submit"
                    disabled={!inputPostText.trim()}
                    className="bg-ink dark:bg-ink-2 text-white hover:bg-sage hover:shadow-glow disabled:opacity-50 disabled:bg-ink-3 disabled:shadow-none font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow transition-all duration-300"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Catat Piring
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Feed Tabs: Untuk Anda vs Squad */}
          <div className="flex gap-3 border-b border-border/40 pb-2">
            <button
              onClick={() => setActiveTab('untukAnda')}
              className={cn(
                "pb-2.5 px-4 font-bold text-xs uppercase tracking-widest relative transition-all duration-300",
                activeTab === 'untukAnda' ? "text-sage" : "text-ink-3 hover:text-ink-2"
              )}
            >
              Untuk Anda
              {activeTab === 'untukAnda' && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('squad')}
              className={cn(
                "pb-2.5 px-4 font-bold text-xs uppercase tracking-widest relative transition-all duration-300",
                activeTab === 'squad' ? "text-sage" : "text-ink-3 hover:text-ink-2"
              )}
            >
              Squad
              {activeTab === 'squad' && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage" />
              )}
            </button>
          </div>

          {/* Feed Post Content Container */}
          <div className="space-y-6">
            
            {activeTab === 'untukAnda' ? (
              <>
                {/* POST 1: AIPolaroidPost - Nasi Padang */}
                <AIPolaroidPost
                  id="post-nasi-padang"
                  author={{
                    name: 'Budi Santoso',
                    avatar: '/assets/scrapbook/approved-pin.png',
                    handle: 'budis',
                    goal: 'JAGA BB',
                    streak: 8
                  }}
                  foodName="Nasi Padang Sehat"
                  imageUrl="/assets/photos/nasi-padang.jpg"
                  calories={555}
                  protein={28}
                  carbs={62}
                  fat={18}
                  price={25000}
                  timeAgo="2 jam yang lalu"
                  description="Makan siang berfaedah di RM Padang dekat kantor. Triknya: minta nasi setengah porsi saja, ambil lauk rendang sapi (buang kuah santan berlebih), lalu minta daun singkong rebus porsi double! AI Ate mendeteksinya dengan presisi tinggi. Sikat!"
                  boundingBoxes={[
                    { id: 'bb1', label: 'Rendang Sapi', cal: 320, protein: 22, carbs: 4, fat: 16, top: '25%', left: '20%', width: '35%', height: '30%' },
                    { id: 'bb2', label: 'Nasi Putih setengah porsi', cal: 180, protein: 4, carbs: 40, fat: 0.5, top: '48%', left: '42%', width: '40%', height: '35%' },
                    { id: 'bb3', label: 'Daun Singkong Rebus', cal: 55, protein: 2, carbs: 18, fat: 1.5, top: '15%', left: '50%', width: '30%', height: '25%' }
                  ]}
                  tapeStyle="sage"
                  onShowReceipt={(data) => setSelectedReceiptFood(data)}
                />

                {/* POST 2: FoodBattleCard - Ayam Goreng vs Geprek */}
                <FoodBattleCard
                  id="battle-ayam"
                  title="TANTANGAN ADU MAKANAN"
                  optionA={{
                    name: 'Ayam Goreng Bumbu Kuning',
                    cal: 260,
                    protein: 22,
                    carbs: 2,
                    fat: 14,
                    price: 15000,
                    img: '/assets/scrapbook/ayam-goreng.png',
                    verdict: 'Ayam Goreng Tradisional bumbu kuning diungkep tanpa tepung, mengandung lemak jenuh sedang. Sangat aman dan direkomendasikan untuk program defisit kalori Anda!',
                    isHealthy: true
                  }}
                  optionB={{
                    name: 'Ayam Geprek Sambal Korek',
                    cal: 480,
                    protein: 24,
                    carbs: 35,
                    fat: 32,
                    price: 18000,
                    img: '/assets/scrapbook/ayam-geprek.png',
                    verdict: 'Ayam Geprek dibalut tepung tebal, digoreng deep-fry, lalu disiram minyak goreng panas pada sambalnya. Kandungan lemak jenuh dan sodiumnya sangat tinggi. Hindari jika sedang program penurunan kolesterol!',
                    isHealthy: false
                  }}
                  initialVotesA={156}
                  initialVotesB={89}
                />

                {/* POST 3: Threads-style AI Coach Thread */}
                <div className="bg-surface dark:bg-surface-2 border border-border/60 rounded-3xl p-5 shadow-card font-body relative overflow-hidden">
                  {/* Decorative bracket graphic */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none select-none">
                    <Image src="/assets/scrapbook/bracket-curly-handdrawn-right2.svg" alt="bracket" fill className="object-contain" />
                  </div>

                  <div className="flex gap-4 items-start">
                    {/* Coach Avatar */}
                    <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex-shrink-0 flex items-center justify-center font-bold relative border border-border/40 overflow-hidden shadow-sm">
                      <Image src="/assets/scrapbook/stamp-gold.png" alt="Coach AI" fill className="object-contain p-0.5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-ink leading-tight">Coach NutriAI 🌿</span>
                        <span className="text-[8px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Dietician
                        </span>
                      </div>
                      <span className="text-xs text-ink-3">@CoachNutriAI</span>

                      <p className="text-sm text-ink-2 font-medium leading-relaxed mt-3 whitespace-pre-line">
                        Halo Sobat Nusantara! Makan siang sehat di warteg dengan budget Rp 15.000 itu sangat bisa lho. Ini kombinasi piring emas racikan saya:
                        
                        1. Nasi Putih setengah piring (~100 kkal)
                        2. Ikan Kembung Bakar (~180 kkal - tinggi protein & Omega 3)
                        3. Tumis Kangkung / Capcay (~70 kkal)
                        
                        Tips tambahan: Minta kuah dipisah dan hindari gorengan tepung agar kalori harian Anda tidak bocor!
                      </p>

                      {/* Social counts & actions */}
                      <div className="mt-4 pt-3 border-t border-border/30 flex items-center gap-6 text-xs text-ink-3 font-bold">
                        <button className="flex items-center gap-1.5 hover:text-twilight p-1 rounded hover:bg-surface-2 dark:hover:bg-surface-3 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span>145</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-sage p-1 rounded hover:bg-surface-2 dark:hover:bg-surface-3 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>24</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-gold p-1 rounded hover:bg-surface-2 dark:hover:bg-surface-3 transition-colors">
                          <Share2 className="w-4 h-4" />
                          <span>Bagikan</span>
                        </button>
                      </div>

                      {/* Nested comment line thread style */}
                      <div className="mt-4 pl-4 border-l-2 border-border/80 space-y-4">
                        <div className="flex gap-3 items-start text-xs">
                          <div className="w-6 h-6 rounded-full bg-surface-3 overflow-hidden relative border shrink-0">
                            <Image src="/assets/scrapbook/approved-pin.png" alt="Siti" fill className="object-cover" />
                          </div>
                          <div>
                            <span className="font-bold text-ink">Siti Rahma</span>
                            <p className="text-ink-2 mt-0.5 leading-relaxed font-medium">Bener banget coach! Ikan kembung lokal itu gizinya bersaing sama salmon tapi harganya merakyat bgt 😂</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* POST 4: AIPolaroidPost - Sate Ayam */}
                <AIPolaroidPost
                  id="post-sate-ayam"
                  author={{
                    name: 'Siti Rahma',
                    avatar: '/assets/scrapbook/approved-pin.png',
                    handle: 'sitirahma',
                    goal: 'TURUN BB',
                    streak: 14
                  }}
                  foodName="Sate Ayam Madura"
                  imageUrl="/assets/3d-foods/sate-ayam.png"
                  calories={380}
                  protein={24}
                  carbs={18}
                  fat={12}
                  price={20000}
                  timeAgo="4 jam yang lalu"
                  description="Camilan sore padat protein setelah jogging keliling lapangan: Sate ayam 5 tusuk tanpa kulit, bumbu kacangnya minta dipisah jadi cuman dicocol dikit-dikit aja. Praktis, murah, dan tetap sesuai program diet!"
                  boundingBoxes={[
                    { id: 'bb4', label: 'Sate Daging Ayam (5 tusuk)', cal: 240, protein: 20, carbs: 2, fat: 6, top: '25%', left: '15%', width: '65%', height: '35%' },
                    { id: 'bb5', label: 'Bumbu Kacang Tipis', cal: 140, protein: 4, carbs: 16, fat: 6, top: '20%', left: '60%', width: '25%', height: '25%' }
                  ]}
                  tapeStyle="terracotta"
                  onShowReceipt={(data) => setSelectedReceiptFood(data)}
                />
              </>
            ) : (
              // SQUAD ONLY TAB: Show mock posts of friends
              <div className="space-y-6">
                
                {/* Post by Dewi Lestari */}
                <div className="bg-surface dark:bg-surface-2 border border-border/60 rounded-3xl p-5 shadow-card relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-500/10 border-2 border-rose-500 overflow-hidden relative">
                        <Image src="/assets/scrapbook/approved-pin.png" alt="Dewi" fill className="object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-sm text-ink">Dewi Lestari</p>
                          <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase">Target Lewat ⚠</span>
                        </div>
                        <p className="text-xs text-ink-3">@dewi.les</p>
                      </div>
                    </div>
                    <span className="text-xs text-ink-3 font-medium">3 jam yang lalu</span>
                  </div>
                  <p className="text-sm text-ink-2 leading-relaxed mb-4 font-medium">
                    Hari ini khilaf banget makan Soto Betawi kuah santan penuh daging berlemak ditambah kerupuk putih 3 biji. Cincin makro di profil langsung teriak oranye-merah 😭 besok harus kembali defisit kalori dan olahraga lebih ekstra!
                  </p>
                  
                  {/* Photo of Soto Betawi */}
                  <div className="bg-[#FAF8F5] dark:bg-[#eae6db] p-4 pb-6 rounded-lg border border-[#D5CEBF] relative max-w-sm mx-auto shadow-polaroid">
                    <div className="relative aspect-[4/3] w-full rounded overflow-hidden bg-black/10">
                      <Image src="/assets/photos/photo-warteg.png" alt="Soto Betawi" fill className="object-cover" />
                    </div>
                    <div className="mt-4 flex items-center justify-between font-handwritten text-lg text-ink-2 px-1">
                      <span>Soto Betawi + Kerupuk</span>
                      <span className="text-rose-600 font-bold">820 kkal</span>
                    </div>
                  </div>
                </div>

                {/* Post by Andi Wijaya */}
                <div className="bg-surface dark:bg-surface-2 border border-border/60 rounded-3xl p-5 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-300 overflow-hidden relative">
                        <Image src="/assets/scrapbook/approved-pin.png" alt="Andi" fill className="object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-sm text-ink">Andi Wijaya</p>
                          <span className="text-[9px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full font-bold uppercase">Mulai Sehat</span>
                        </div>
                        <p className="text-xs text-ink-3">@andiw</p>
                      </div>
                    </div>
                    <span className="text-xs text-ink-3 font-medium">5 jam yang lalu</span>
                  </div>
                  <p className="text-sm text-ink-2 leading-relaxed mb-2 font-medium">
                    Sarapan sederhana budget mahasiswa: 2 lembar roti gandum panggang kering ditambah 2 butir telur rebus setengah matang tabur garam merica. Sehat, murah, kenyang sampai makan siang!
                  </p>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN (WIDGET DETAILS PANEL): occupies 4 columns on desktop */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CARD 1: TODAY'S MACRO FUEL PROGRESS */}
          <Card className="p-6 border border-border/50 bg-surface dark:bg-surface-2">
            <h3 className="text-lg font-editorial font-bold text-ink mb-5 flex items-center justify-between">
              <span>Bahan Bakar Gizi</span>
              <span className="text-xs font-body text-ink-3 font-bold uppercase tracking-wider">HARI INI</span>
            </h3>

            {/* Circular Progress Ring */}
            <div className="flex flex-col items-center justify-center relative py-2">
              <CircularProgress
                value={store.caloriesConsumed}
                max={store.dailyCalorieTarget}
                size={160}
                strokeWidth={10}
                color={caloriePercentage > 100 ? 'secondary' : 'primary'}
                showValue={false}
              >
                <div className="text-center">
                  <p className="text-[10px] text-ink-3 font-bold uppercase tracking-widest">Asupan</p>
                  <p className="text-3xl font-editorial font-bold text-ink leading-tight">
                    {store.caloriesConsumed}
                  </p>
                  <p className="text-[10px] text-ink-3 font-bold mt-0.5">
                    / {store.dailyCalorieTarget} kkal
                  </p>
                </div>
              </CircularProgress>
            </div>

            {/* Remaining budget progress bar */}
            <div className="mt-6 space-y-2 pt-4 border-t border-border/40">
              <div className="flex justify-between items-baseline text-xs font-bold">
                <span className="text-ink-2 uppercase tracking-wide">Budget Makanan</span>
                <span className="text-ink text-sm">
                  Rp {store.budgetSpent.toLocaleString('id-ID')} <span className="text-[10px] text-ink-3 font-normal">/ Rp {store.dailyBudget.toLocaleString('id-ID')}</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-surface-2 dark:bg-surface-3 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    budgetPercentage > 90 ? "bg-rose-500" : "bg-twilight"
                  )} 
                  style={{ width: `${budgetPercentage}%` }} 
                />
              </div>
              <p className="text-[10px] text-ink-3 font-bold text-right">
                Sisa Anggaran: Rp {Math.max(0, store.dailyBudget - store.budgetSpent).toLocaleString('id-ID')}
              </p>
            </div>

            {/* Macros Mini bars */}
            <div className="grid grid-cols-3 gap-2.5 mt-6 pt-4 border-t border-border/40 text-center">
              <div className="bg-surface-2 dark:bg-surface-3 p-2 rounded-xl border border-border/40">
                <p className="text-[9px] font-black text-ink-3 uppercase tracking-wider">Karbo</p>
                <p className="font-bold text-sm text-ink font-editorial mt-0.5">{mockCarbs}g</p>
                <span className="text-[8px] text-amber-600 font-bold">55%</span>
              </div>
              <div className="bg-surface-2 dark:bg-surface-3 p-2 rounded-xl border border-border/40">
                <p className="text-[9px] font-black text-ink-3 uppercase tracking-wider">Protein</p>
                <p className="font-bold text-sm text-ink font-editorial mt-0.5">{mockProtein}g</p>
                <span className="text-[8px] text-sage font-bold">20%</span>
              </div>
              <div className="bg-surface-2 dark:bg-surface-3 p-2 rounded-xl border border-border/40">
                <p className="text-[9px] font-black text-ink-3 uppercase tracking-wider">Lemak</p>
                <p className="font-bold text-sm text-ink font-editorial mt-0.5">{mockFat}g</p>
                <span className="text-[8px] text-rose-500 font-bold">25%</span>
              </div>
            </div>
          </Card>

          {/* CARD 2: DIET STREAK WIDGET WITH INTERACTIVE MEDAL */}
          <Card className="p-5 flex items-center justify-between border border-border/50 bg-surface dark:bg-surface-2 relative overflow-hidden">
            {/* Scrapbook staple visual */}
            <div className="absolute top-0 right-4 w-6 h-5 opacity-40 pointer-events-none select-none">
              <Image src="/assets/scrapbook/staple-single.png" alt="Staple" fill className="object-contain" />
            </div>

            <div>
              <p className="text-[10px] text-ink-3 font-bold uppercase tracking-wider mb-1">Streak Makan Sehat</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-editorial font-bold text-ink leading-tight">{store.streakDays}</span>
                <span className="text-xs text-ink-3 font-bold">hari beruntun</span>
              </div>
              <p className="text-[9px] text-[#3D6B4F] dark:text-[#7FD49A] font-bold mt-1">Luar biasa! Pertahankan streak Anda 🔥</p>
            </div>
            
            <div className="w-16 h-16 relative flex-shrink-0 drop-shadow-md select-none transform rotate-[8deg] hover:rotate-0 transition-transform">
              <Image 
                src="/assets/badges/medali-7-streak.png" 
                alt="Streak Medal" 
                fill 
                className="object-contain" 
              />
            </div>
          </Card>

          {/* CARD 3: INDONESIA DIET TRENDING HASHTAGS (X Style) */}
          <Card className="p-5 border border-border/50 bg-surface dark:bg-surface-2">
            <h4 className="text-xs font-bold text-ink-3 uppercase tracking-wider mb-3">Tren Nutrisi Nusantara</h4>
            <div className="space-y-3.5">
              {[
                { tag: '#NasiPadangSehat', count: '12.4K logs', cal: '550 kkal average' },
                { tag: '#DefisitKalori', count: '8.9K posts', cal: 'Tips lokal tersedia' },
                { tag: '#GorenganHacks', count: '5.2K logs', cal: 'Air Fryer tips' },
                { tag: '#IkanKembungKlub', count: '3.1K posts', cal: 'Sumber Protein Murah' }
              ].map((trend) => (
                <div 
                  key={trend.tag}
                  className="cursor-pointer hover:bg-surface-2 dark:hover:bg-surface-3 p-1 rounded transition-colors group"
                  onClick={() => alert(`Membuka tren untuk ${trend.tag}`)}
                >
                  <span className="text-xs font-bold text-[#3D6B4F] dark:text-[#7FD49A] block group-hover:underline">
                    {trend.tag}
                  </span>
                  <div className="flex justify-between text-[10px] text-ink-3 font-semibold mt-0.5">
                    <span>{trend.count}</span>
                    <span>{trend.cal}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* CARD 4: DIET SQUAD LEADERBOARD */}
          <Card className="p-5 border border-border/50 bg-surface dark:bg-surface-2 relative overflow-hidden">
            {/* Scrapbook pin decoration */}
            <div className="absolute top-2 left-2 w-5 h-5 opacity-40 pointer-events-none select-none">
              <Image src="/assets/scrapbook/paper-clip-gold.png" alt="clip" fill className="object-contain" />
            </div>

            <h4 className="text-xs font-bold text-ink-3 uppercase tracking-wider mb-4 text-center">Peringkat Gizi Pekan Ini</h4>
            
            <div className="space-y-3">
              {[
                { rank: 1, name: 'Siti Rahma', pts: 890, active: false },
                { rank: 2, name: 'Budi Santoso', pts: 850, active: false },
                { rank: 3, name: store.fullName || 'Budi (Anda)', pts: 810, active: true },
                { rank: 4, name: 'Andi Wijaya', pts: 740, active: false }
              ].map((player) => (
                <div 
                  key={player.name}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all border",
                    player.active 
                      ? "bg-sage/10 border-sage text-sage" 
                      : "bg-surface-2 dark:bg-surface-3 border-transparent text-ink-2"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0",
                      player.rank === 1 ? "bg-[#E8A838]" : player.rank === 2 ? "bg-stone-400" : "bg-stone-500"
                    )}>
                      {player.rank}
                    </span>
                    <span className="truncate max-w-[120px]">{player.name}</span>
                  </div>
                  <span className="font-editorial text-ink shrink-0">{player.pts} pts</span>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

      {/* 🧾 MODAL DIALOG STRU STRU RECEIPT */}
      <MacroReceipt
        isOpen={selectedReceiptFood !== null}
        onClose={() => setSelectedReceiptFood(null)}
        foodData={selectedReceiptFood}
      />

      {/* 📓 MODAL STORY SCRAPBOOK USER */}
      <AnimatePresence>
        {selectedStoryUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStoryUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Scrapbook Lined Paper Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-stone-900 w-full max-w-sm rounded-3xl p-6 md:p-8 font-body shadow-float relative border-8 border-sage-muted overflow-hidden z-10"
              style={{
                backgroundImage: "url('/assets/scrapbook/notebook-lined-paper.jpg')",
                backgroundSize: 'cover',
                backgroundBlendMode: 'multiply',
                backgroundColor: '#FAF8F5'
              }}
            >
              {/* Paper decorations */}
              <div className="absolute top-4 left-4 w-12 h-6 pointer-events-none select-none opacity-80">
                <Image src="/assets/scrapbook/washi-tape-sage.png" alt="tape" fill className="object-contain" />
              </div>
              <div className="absolute top-3 right-3">
                <button 
                  onClick={() => setSelectedStoryUser(null)}
                  className="p-1.5 hover:bg-black/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-stone-800" />
                </button>
              </div>

              {/* Title Header */}
              <div className="text-center mt-4 mb-6">
                <span className="font-handwritten text-3xl text-emerald-800 font-bold block rotate-[-2deg]">
                  Buku Harian Makan
                </span>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-widest block mt-1">
                  {selectedStoryUser.name} (@{selectedStoryUser.handle})
                </span>
              </div>

              {/* Lined paper listing */}
              <div className="space-y-4 font-handwritten text-2xl text-stone-800 min-h-[180px] pl-2 pt-2 select-none">
                
                <div className="border-b border-blue-200/50 pb-2">
                  <span className="text-sm font-sans font-bold text-stone-500 block uppercase tracking-wider">Kondisi & Goal:</span>
                  <span className="text-emerald-700 font-bold font-sans text-sm">{selectedStoryUser.goal} • 🔥 {selectedStoryUser.streak} HARI STREAK</span>
                </div>

                {selectedStoryUser.meals.map((meal, index) => (
                  <div key={index} className="flex justify-between border-b border-blue-200/50 pb-1.5 leading-relaxed">
                    <span className="truncate max-w-[200px]">{index + 1}. {meal.name}</span>
                    <span className="text-emerald-800 font-bold shrink-0">{meal.cal} kkal</span>
                  </div>
                ))}

                <div className="pt-2 border-b border-blue-200/50 pb-3">
                  <span className="text-sm font-sans font-bold text-stone-500 block uppercase tracking-wider">Catatan Harian:</span>
                  <p className="text-xl text-stone-600 leading-normal italic mt-1 font-medium font-handwritten">
                    &ldquo;{selectedStoryUser.notes}&rdquo;
                  </p>
                </div>
              </div>

              {/* Gold Stamp Overlay */}
              <div className="absolute bottom-6 right-6 w-20 h-20 opacity-80 pointer-events-none rotate-[15deg]">
                <Image src="/assets/scrapbook/stamp-gold.png" alt="approved stamp" fill className="object-contain" />
              </div>

              <div className="mt-8 text-center pt-2">
                <span className="text-[10px] font-sans font-bold text-stone-400 tracking-wider">AKG HEALTH DIARY • POWERED BY AI ATE</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔔 CUSTOM TOAST POPUP */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-24 md:bottom-8 left-1/2 z-50 bg-[#1E1810] text-white py-3.5 px-6 rounded-2xl shadow-float border border-[#7FD49A]/30 text-sm font-bold flex items-center gap-2 max-w-md w-[90vw]"
          >
            <Sparkles className="w-4 h-4 text-[#7FD49A] animate-pulse shrink-0" />
            <span className="flex-1 leading-tight">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
