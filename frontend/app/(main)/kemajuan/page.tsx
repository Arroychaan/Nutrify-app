'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Calendar, ChevronDown, ArrowDownRight, ArrowUpRight, Trophy, Lock } from 'lucide-react'

export default function ProgressPage() {
  const [dateRange, setDateRange] = useState('Bulan Ini')

  const calorieData = [
    { day: '1', cal: 1850 }, { day: '5', cal: 1780 }, { day: '10', cal: 1900 },
    { day: '15', cal: 1650 }, { day: '20', cal: 1720 }, { day: '25', cal: 1800 },
    { day: '30', cal: 1750 },
  ]

  const budgetData = [
    { day: 'Minggu 1', spent: 320000 },
    { day: 'Minggu 2', spent: 280000 },
    { day: 'Minggu 3', spent: 350000 },
    { day: 'Minggu 4', spent: 250000 },
  ]

  const nutritionData = [
    { name: 'Karbohidrat', value: 50, color: '#E07A5F' },
    { name: 'Protein', value: 25, color: '#789B7B' },
    { name: 'Lemak', value: 15, color: '#A0BAA5' },
    { name: 'Serat', value: 10, color: '#F3C9BA' },
  ]

  const badges = [
    { id: 1, title: 'Pejuang Tempe 🥊', desc: 'Konsumsi tempe 7 hari berturut-turut', date: '12 Mei 2025', locked: false, icon: '🌿' },
    { id: 2, title: 'Raja Hemat 👑', desc: 'Sisa budget lebih dari 20% bulan ini', date: '1 Mei 2025', locked: false, icon: '💰' },
    { id: 3, title: 'Master Serat 🥬', desc: 'Mencapai target serat harian selama 14 hari', date: '', locked: true, icon: '🥗' },
    { id: 4, title: 'Bebas Gula 🚫', desc: 'Tidak konsumsi gula tambahan selama seminggu', date: '', locked: true, icon: '🍭' },
  ]

  // Streak Calendar 7x4 Grid Mock
  const streakCells = Array.from({ length: 28 }, (_, i) => {
    if (i < 12) return 'bg-sage'; // On track
    if (i < 15) return 'bg-twilight'; // Partial/Gold
    if (i < 18) return 'bg-surface-2'; // Missed/Light gray
    return 'bg-white border border-surface-2'; // Future/White
  })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-display text-ink mb-1">Kemajuanmu</h1>
          <p className="text-ink-2">Pantau pencapaian kesehatan dan anggaranmu.</p>
        </div>
        <div className="relative">
          <button className="flex items-center gap-2 bg-white border border-surface-2 px-4 py-2 rounded-xl text-sm font-medium text-ink shadow-sm">
            <Calendar className="w-4 h-4 text-ink-3" />
            {dateRange}
            <ChevronDown className="w-4 h-4 text-ink-3 ml-2" />
          </button>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-sm text-ink-3 mb-2 font-bold uppercase">Berat Badan</p>
          <div className="flex items-end gap-3 mb-1">
            <p className="text-3xl font-display text-ink">64.5 <span className="text-sm font-body font-normal text-ink-3">kg</span></p>
            <div className="flex items-center text-sage text-sm font-bold bg-sage/10 px-2 py-0.5 rounded-full mb-1">
              <ArrowDownRight className="w-3 h-3 mr-0.5" /> 1.2 kg
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-ink-3 mb-2 font-bold uppercase">Konsistensi Diet</p>
          <div className="flex items-end gap-3 mb-1">
            <p className="text-3xl font-display text-ink">78%</p>
            <p className="text-sm text-ink-3 mb-1 font-medium">Hari on-track</p>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-ink-3 mb-2 font-bold uppercase">Kalori Rata-rata</p>
          <div className="flex items-end gap-3 mb-1">
            <p className="text-3xl font-display text-ink">1.480</p>
            <p className="text-sm text-ink-3 mb-1 font-medium">kkal / hari</p>
          </div>
        </Card>

        <Card className="p-5 border-twilight-light/50 bg-twilight/5">
          <p className="text-sm text-twilight font-bold uppercase mb-2">Efisiensi Budget</p>
          <div className="flex items-end gap-3 mb-1">
            <p className="text-3xl font-display text-twilight">145k</p>
            <div className="flex items-center text-twilight text-sm font-bold mb-1">
              <ArrowDownRight className="w-3 h-3 mr-0.5" /> Hemat bln ini
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Calorie Line Chart */}
        <Card className="p-6">
          <h3 className="font-bold text-ink mb-6">Asupan Kalori</h3>
          <div className="h-64 w-full text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calorieData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0DFD8" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#849687' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#849687' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(26,33,27,0.08)' }} 
                />
                <ReferenceLine y={1800} stroke="#E07A5F" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Target: 1800', fill: '#E07A5F', fontSize: 12 }} />
                <Line type="monotone" dataKey="cal" stroke="#789B7B" strokeWidth={3} dot={{ fill: '#789B7B', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Budget Trend Area Chart */}
        <Card className="p-6">
          <h3 className="font-bold text-ink mb-6">Tren Pengeluaran Makan</h3>
          <div className="h-64 w-full text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={budgetData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E07A5F" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#E07A5F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0DFD8" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#849687' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#849687' }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(26,33,27,0.08)' }} 
                  formatter={(val: number) => `Rp ${val.toLocaleString('id-ID')}`}
                />
                <Area type="monotone" dataKey="spent" stroke="#E07A5F" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Nutrition Pie Chart */}
        <Card className="p-6 flex flex-col xl:col-span-1">
          <h3 className="font-bold text-ink mb-6">Distribusi Nutrisi Rata-rata</h3>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nutritionData}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {nutritionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 w-full sm:w-auto">
              {nutritionData.map(item => (
                <div key={item.name} className="flex items-center justify-between gap-6">
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

        {/* Streak Calendar */}
        <Card className="p-6 xl:col-span-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-ink">Kalender Streak</h3>
            <span className="text-sm font-medium text-sage bg-sage/10 px-3 py-1 rounded-full">12 Hari Terpanjang</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-7 gap-2">
              {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, i) => (
                <div key={i} className="text-center text-xs font-bold text-ink-3 mb-2">{day}</div>
              ))}
              {streakCells.map((colorClass, i) => (
                <div 
                  key={i} 
                  className={`w-10 h-10 rounded-xl ${colorClass} transition-all duration-500 animate-scale-in`}
                  style={{ animationDelay: `${i * 10}ms` }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-4 justify-center mt-6 text-xs text-ink-3">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-sage" /> Sesuai Target</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-twilight" /> Parsial</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-surface-2" /> Terlewat</div>
          </div>
        </Card>
      </div>

      {/* Achievement Badges */}
      <div>
        <h2 className="text-xl font-bold text-ink font-display mb-4">Pencapaianmu</h2>
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
          {badges.map(badge => (
            <Card key={badge.id} className={`min-w-[280px] snap-start p-5 ${badge.locked ? 'bg-surface-2 border-transparent' : 'border-surface-2 bg-white'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 ${badge.locked ? 'bg-surface text-ink-3 grayscale' : 'bg-twilight/10 shadow-glow'}`}>
                  {badge.locked ? <Lock className="w-6 h-6" /> : badge.icon}
                </div>
                <div>
                  <h3 className={`font-bold mb-1 ${badge.locked ? 'text-ink-3' : 'text-ink'}`}>{badge.title}</h3>
                  <p className="text-xs text-ink-2 mb-2 leading-relaxed">{badge.desc}</p>
                  {!badge.locked && <p className="text-[10px] font-bold text-sage uppercase tracking-wider">{badge.date}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

    </div>
  )
}
