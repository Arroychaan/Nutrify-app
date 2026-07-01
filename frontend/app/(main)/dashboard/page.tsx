'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Check, ChevronRight } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useAppStore } from '@/lib/store'

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false)
  const store = useAppStore()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Dynamic Date
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  
  // Real Recharts logic based on Store
  // Note: For MVP demo, if no calories consumed yet, we show a default layout so chart isn't empty,
  // but let's just make it dynamic based on mock macros.
  const nutritionData = [
    { name: 'Karbohidrat', value: 45, color: '#E07A5F' },
    { name: 'Protein', value: 25, color: '#789B7B' },
    { name: 'Lemak', value: 20, color: '#A0BAA5' },
    { name: 'Serat', value: 10, color: '#F3C9BA' },
  ]

  const recommendations = [
    { id: 1, name: 'Nasi Rendang Padang', region: 'Sumatera Barat', cal: 730, price: 'Rp 25.000', tag: 'Tinggi Protein', color: 'bg-twilight/10 text-twilight', img: '/assets/3d-foods/Nasi-padang.png' },
    { id: 2, name: 'Bubur Ayam', region: 'Jawa', cal: 380, price: 'Rp 15.000', tag: 'Rendah Kalori', color: 'bg-sage/10 text-sage', img: '/assets/3d-foods/bubur.png' },
    { id: 3, name: 'Sate Ayam Madura', region: 'Jawa Timur', cal: 420, price: 'Rp 20.000', tag: 'Tinggi Protein', color: 'bg-premium/10 text-premium', img: '/assets/3d-foods/sate-ayam.png' },
    { id: 4, name: 'Ikan Bakar', region: 'Sulawesi', cal: 310, price: 'Rp 35.000', tag: 'Rendah Lemak', color: 'bg-ink/10 text-ink', img: '/assets/3d-foods/ikan-bakar.png' },
  ]

  if (!isClient) return null // Prevent hydration mismatch on persist

  const caloriePercentage = Math.min(100, (store.caloriesConsumed / store.dailyCalorieTarget) * 100)
  const budgetPercentage = Math.min(100, (store.budgetSpent / store.dailyBudget) * 100)

  return (
    <div className="space-y-8 pb-10">
      {/* Row 1 - Greeting */}
      <div>
        <h1 className="text-3xl font-editorial font-bold text-ink mb-1">Selamat pagi, {store.fullName} 🌿</h1>
        <p className="text-ink-2 font-medium">{today}</p>
      </div>

      {/* Row 2 - Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 relative overflow-hidden">
          <p className="text-sm text-ink-3 font-bold uppercase tracking-wider mb-2">Kalori Hari Ini</p>
          <p className="text-3xl font-editorial font-bold text-ink mb-3">{store.caloriesConsumed.toLocaleString('id-ID')} <span className="text-sm font-body font-normal text-ink-3">/ {store.dailyCalorieTarget.toLocaleString('id-ID')} kkal</span></p>
          <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
            <div className="h-full bg-sage rounded-full transition-all duration-1000 ease-out" style={{ width: `${caloriePercentage}%` }} />
          </div>
        </Card>
        
        <Card className="p-5 relative overflow-hidden">
          <p className="text-sm text-ink-3 font-bold uppercase tracking-wider mb-2">Budget Tersisa</p>
          <p className="text-3xl font-editorial font-bold text-ink mb-3">Rp {Math.max(0, store.dailyBudget - store.budgetSpent).toLocaleString('id-ID')} <span className="text-sm font-body font-normal text-ink-3">/ Rp {store.dailyBudget.toLocaleString('id-ID')}</span></p>
          <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
            <div className="h-full bg-twilight rounded-full transition-all duration-1000 ease-out" style={{ width: `${budgetPercentage}%` }} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-3 font-bold uppercase tracking-wider mb-2">Streak Makan Sehat</p>
            <p className="text-3xl font-editorial font-bold text-ink">{store.streakDays} <span className="text-sm font-body text-ink-3 font-normal">hari</span></p>
            <p className="text-xs text-ink-3 mt-1 font-medium">berturut-turut</p>
          </div>
          <div className="w-14 h-14 relative flex-shrink-0">
             <Image src="/assets/badges/medali-7-streak.png" alt="Streak Medal" fill className="object-contain" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-3 font-bold uppercase tracking-wider mb-2">Skor Nutrisi</p>
            <p className="text-3xl font-editorial font-bold text-ink">87 <span className="text-sm font-body font-normal text-ink-3">/ 100</span></p>
            <p className="text-xs text-sage mt-1 font-medium">Sangat Baik</p>
          </div>
          <div className="w-14 h-14 relative flex-shrink-0 opacity-80">
             <Image src="/assets/scrapbook/stamp-gold.png" alt="Stamp" fill className="object-contain" />
          </div>
        </Card>
      </div>

      {/* Row 3 - Meal Plan & Nutrition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card className="p-6 h-full border border-border/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-editorial font-bold text-ink">Rencana Makan Hari Ini</h2>
              <Link href="/meal-plan" className="text-sm text-sage hover:text-sage-light font-bold uppercase tracking-wider transition-colors">Kelola</Link>
            </div>
            
            <div className="space-y-4">
              {/* Fake visual items mapped to real assets */}
              <div className="flex items-center gap-4 p-4 bg-surface-2 rounded-2xl border border-surface transition-transform hover:scale-[1.01]">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 flex items-center justify-center border border-border/40">
                  <Image src="/assets/3d-foods/bubur.png" alt="Bubur" fill className="object-contain p-1" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-ink-3 mb-0.5 font-bold uppercase tracking-wider">Sarapan</p>
                  <p className="font-bold text-ink font-editorial text-lg">Bubur Ayam Jawa</p>
                  <p className="text-sm text-ink-2">320 kkal • Rp 15.000</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-sage text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-surface-2 rounded-2xl border border-surface transition-transform hover:scale-[1.01]">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 flex items-center justify-center border border-border/40">
                  <Image src="/assets/3d-foods/Nasi-padang.png" alt="Nasi Padang" fill className="object-contain p-1" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-ink-3 mb-0.5 font-bold uppercase tracking-wider">Makan Siang</p>
                  <p className="font-bold text-ink font-editorial text-lg">Nasi Padang Sehat</p>
                  <p className="text-sm text-ink-2">450 kkal • Rp 25.000</p>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-surface bg-white text-surface flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-ink-3" />
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-surface border border-ink-3/20 border-dashed rounded-2xl cursor-pointer hover:bg-surface-2 transition-colors">
                <div className="w-16 h-16 rounded-xl bg-surface-2 flex items-center justify-center flex-shrink-0 text-ink-3">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-ink-3 mb-0.5 font-bold uppercase tracking-wider">Makan Malam</p>
                  <p className="font-bold text-ink font-editorial text-lg">Belum Direncanakan</p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-6 py-6 border-ink-3/30 text-ink-2 hover:bg-surface-2 hover:text-ink font-bold uppercase tracking-widest text-xs">
              Tambah Porsi Makan
            </Button>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="p-6 h-full flex flex-col border border-border/50">
            <h2 className="text-2xl font-editorial font-bold text-ink mb-6">Distribusi Makro</h2>
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[220px]">
              
              {/* Dynamic Recharts Implementation with inner text overlay */}
              <div className="absolute inset-0 z-10 flex items-center justify-center flex-col pointer-events-none">
                 <p className="text-sm text-ink-3 font-bold uppercase tracking-widest">Total</p>
                 <p className="text-4xl font-editorial font-bold text-ink">{store.caloriesConsumed || 770}</p>
                 <p className="text-xs text-ink-3">kkal</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={nutritionData}
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={4}
                    >
                      {nutritionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full mt-2">
                {nutritionData.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-ink-2">{item.name}</span>
                    </div>
                    <span className="font-bold text-ink text-sm">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 4 - Recommendations (Real Assets) */}
      <div>
        <h2 className="text-2xl font-editorial font-bold text-ink mb-6">Kurasi Nutrisi Untukmu</h2>
        <div className="flex overflow-x-auto gap-6 pb-6 snap-x scrollbar-hide">
          {recommendations.map(item => (
            <Card key={item.id} className="min-w-[280px] snap-start border border-border/50 hover:shadow-lg transition-all duration-300 group overflow-hidden">
              <div className="h-40 bg-surface-2 relative flex items-center justify-center p-4">
                 {/* Real 3D Asset mapping */}
                 <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-700">
                    <Image src={item.img} alt={item.name} fill className="object-contain drop-shadow-lg" />
                 </div>
              </div>
              <div className="p-5 bg-white">
                <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full mb-3 uppercase tracking-wider ${item.color}`}>
                  {item.tag}
                </span>
                <h3 className="font-editorial font-bold text-xl text-ink mb-1 truncate">{item.name}</h3>
                <p className="text-xs font-medium text-ink-3 mb-5 uppercase tracking-widest">{item.region} • {item.cal} kkal</p>
                
                <div className="flex items-center justify-between">
                   <p className="font-bold text-ink">{item.price}</p>
                   <Button variant="outline" size="sm" className="h-8 border-ink text-ink hover:bg-ink hover:text-white uppercase text-[10px] font-bold tracking-widest px-4">
                     Pilih
                   </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
