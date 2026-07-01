'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ChevronRight, Edit2, Plus, Search, SlidersHorizontal, Check } from 'lucide-react'
import { useAppStore, FoodItem } from '@/lib/store'

// Helper for dynamic dates
const generateWeekDays = () => {
  const days = []
  const today = new Date()
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(today)
    nextDate.setDate(today.getDate() + i)
    days.push({
      label: dayNames[nextDate.getDay()],
      date: nextDate.getDate(),
      fullDate: nextDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    })
  }
  return days
}

export default function MealPlanPage() {
  const [activeDayIdx, setActiveDayIdx] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [weekDays, setWeekDays] = useState<{label: string, date: number, fullDate: string}[]>([])
  const store = useAppStore()

  useEffect(() => {
    setWeekDays(generateWeekDays())
    setIsClient(true)
  }, [])

  if (!isClient || weekDays.length === 0) return null

  // Hardcode some mock items in the store if it's empty for demonstration purposes
  const breakfastItems = store.meals.breakfast.length > 0 ? store.meals.breakfast : [
    { id: '1', name: 'Bubur Ayam Jawa', cal: 320, price: 15000, protein: 15, carbs: 45, fat: 10, image: '/assets/3d-foods/bubur.png', category: 'Sarapan' }
  ]
  
  const lunchItems = store.meals.lunch.length > 0 ? store.meals.lunch : [
    { id: '2', name: 'Nasi Rendang Padang', cal: 450, price: 25000, protein: 25, carbs: 50, fat: 20, image: '/assets/3d-foods/Nasi-padang.png', category: 'Makan Siang' }
  ]

  const meals = [
    { type: 'SARAPAN', time: '07:00', icon: '🌅', items: breakfastItems },
    { type: 'MAKAN SIANG', time: '12:30', icon: '☀️', items: lunchItems },
    { type: 'MAKAN MALAM', time: '19:00', icon: '🌙', items: store.meals.dinner }
  ]

  const calculateTotals = () => {
    let cal = 0, protein = 0, price = 0
    meals.forEach(m => m.items.forEach(item => {
      cal += item.cal
      protein += item.protein
      price += item.price
    }))
    return { cal, protein, price }
  }

  const totals = calculateTotals()

  return (
    <div className="relative pb-24">
      {/* 7-day calendar strip */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-4 snap-x scrollbar-hide w-full">
        {weekDays.map((day, idx) => (
          <div 
            key={idx}
            onClick={() => setActiveDayIdx(idx)}
            className={`min-w-[4.5rem] snap-start flex flex-col items-center justify-center py-4 px-2 rounded-[20px] cursor-pointer transition-all duration-300 ${
              activeDayIdx === idx 
                ? 'bg-ink text-white shadow-lg scale-105 transform' 
                : 'bg-white text-ink-2 hover:bg-surface-2 border border-border/50'
            }`}
          >
            <span className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${activeDayIdx === idx ? 'text-sage' : 'text-ink-3'}`}>
              {day.label}
            </span>
            <span className="text-2xl font-editorial font-bold">{day.date}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h1 className="text-3xl font-editorial font-bold text-ink mb-1">Rencana Makan</h1>
              <p className="text-ink-2 font-medium">{weekDays[activeDayIdx].fullDate}</p>
            </div>
            <Button variant="outline" size="sm" className="hidden sm:flex border-border bg-white text-ink hover:bg-surface-2 font-bold uppercase tracking-wider text-xs h-10 px-4">
              <Search className="w-4 h-4 mr-2" /> Eksplor Menu
            </Button>
          </div>

          {meals.map((meal, idx) => (
            <Card key={idx} className="overflow-hidden border-border/50">
              <div className="bg-surface-2/50 p-4 flex justify-between items-center border-b border-border/50">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{meal.icon}</span>
                  <h2 className="font-bold text-ink text-xs uppercase tracking-widest">{meal.type}</h2>
                  <span className="text-ink-3 text-xs font-medium ml-2 px-2 py-0.5 bg-white rounded-full border border-border/50">{meal.time}</span>
                </div>
                <button className="text-ink-3 hover:text-ink transition-colors flex items-center justify-center p-2 rounded-full hover:bg-white border border-transparent hover:border-border/50">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4 space-y-3 bg-white">
                {meal.items.length > 0 ? (
                  meal.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-surface rounded-2xl border border-transparent hover:border-border/50 transition-colors group cursor-pointer">
                      <div className="relative w-16 h-16 rounded-xl bg-white border border-border/40 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-contain p-1 transform group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold font-editorial text-lg text-ink">{item.name}</p>
                        <div className="flex items-center gap-3 text-xs text-ink-3 mt-1 font-medium tracking-wide">
                          <span className="text-sage">{item.cal} kkal</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>Rp {item.price.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center text-ink-3 group-hover:bg-ink group-hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 flex flex-col items-center justify-center text-center bg-surface-2/30 rounded-2xl border border-dashed border-border/50">
                    <p className="text-sm font-medium text-ink-3 mb-3">Belum ada menu direncanakan</p>
                    <Button variant="outline" size="sm" className="h-9 border-ink text-ink hover:bg-ink hover:text-white font-bold uppercase tracking-wider text-[10px]">
                      <Plus className="w-3 h-3 mr-1.5" /> Tambah Makanan
                    </Button>
                  </div>
                )}
                
                {meal.items.length > 0 && (
                  <button className="w-full mt-2 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors">
                    <Plus className="w-3 h-3" /> Tambah item lain
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Right Sidebar - Filter/Search */}
        <div className="hidden lg:block lg:col-span-4">
          <Card className="p-6 sticky top-24 border-border/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-editorial font-bold text-xl text-ink">Eksplorasi Lokal</h3>
              <SlidersHorizontal className="w-4 h-4 text-ink-3" />
            </div>
            
            <div className="relative mb-8">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
              <input 
                type="text" 
                placeholder="Cari masakan Nusantara..." 
                className="w-full bg-surface-2 border border-border/50 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all text-ink placeholder:text-ink-3"
              />
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-ink-3 uppercase tracking-widest mb-3">Filter Nutrisi</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 rounded-full bg-sage text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm">Tinggi Protein</span>
                  <span className="px-4 py-2 rounded-full bg-surface border border-border/50 text-ink-2 text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-ink-3 transition-colors">Rendah Lemak</span>
                  <span className="px-4 py-2 rounded-full bg-surface border border-border/50 text-ink-2 text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-ink-3 transition-colors">Vegetarian</span>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-ink-3 uppercase tracking-widest mb-3">Filter Daerah</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 rounded-full bg-twilight text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm">Jawa</span>
                  <span className="px-4 py-2 rounded-full bg-surface border border-border/50 text-ink-2 text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-ink-3 transition-colors">Sumatera</span>
                  <span className="px-4 py-2 rounded-full bg-surface border border-border/50 text-ink-2 text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-ink-3 transition-colors">Bali & NTT</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-twilight/5 border border-twilight/20 rounded-2xl">
              <h4 className="font-editorial font-bold text-ink mb-1">Rekomendasi Cerdas</h4>
              <p className="text-xs text-ink-2 mb-3 leading-relaxed">AI menyarankan tambahan <strong>Tempe Mendoan</strong> siang ini untuk memenuhi target protein Anda dengan harga terjangkau.</p>
              <Button size="sm" className="w-full bg-twilight hover:bg-twilight-light text-white font-bold text-[10px] uppercase tracking-widest shadow-sm">
                Lihat Rekomendasi
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky Daily Summary Bar */}
      <div className="fixed bottom-0 lg:bottom-4 inset-x-0 lg:left-64 lg:right-4 z-40 p-4">
        <div className="max-w-4xl mx-auto bg-ink text-white rounded-3xl shadow-float p-5 flex flex-col sm:flex-row justify-between items-center gap-6 border border-ink-2/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer" />
          
          <div className="flex gap-6 sm:gap-10 text-sm relative z-10 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <p className="text-ink-3 text-[10px] uppercase tracking-widest font-bold mb-1">Total Kalori</p>
              <p className="font-bold font-editorial text-2xl">{totals.cal} <span className="text-xs font-body font-medium text-ink-3">kkal</span></p>
            </div>
            <div className="w-px h-10 bg-ink-2/50" />
            <div>
              <p className="text-ink-3 text-[10px] uppercase tracking-widest font-bold mb-1">Total Protein</p>
              <p className="font-bold font-editorial text-2xl">{totals.protein} <span className="text-xs font-body font-medium text-ink-3">g</span></p>
            </div>
            <div className="w-px h-10 bg-ink-2/50 hidden sm:block" />
            <div className="hidden sm:block">
              <p className="text-ink-3 text-[10px] uppercase tracking-widest font-bold mb-1">Estimasi Biaya</p>
              <p className="font-bold font-editorial text-2xl text-sage">Rp {totals.price.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <Button variant="primary" className="w-full sm:w-auto shadow-none font-bold uppercase tracking-widest text-[10px] h-12 px-8 relative z-10 bg-white text-ink hover:bg-surface-2 border-none">
            Simpan Rencana
          </Button>
        </div>
      </div>
    </div>
  )
}
