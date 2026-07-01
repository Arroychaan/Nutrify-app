'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Edit2, Plus, Trash2, Lightbulb } from 'lucide-react'

export default function BudgetPage() {
  const [showModal, setShowModal] = useState(false)

  const weeklyData = [
    { day: 'Sen', budget: 50000, actual: 42000 },
    { day: 'Sel', budget: 50000, actual: 48000 },
    { day: 'Rab', budget: 50000, actual: 55000 },
    { day: 'Kam', budget: 50000, actual: 35000 },
    { day: 'Jum', budget: 50000, actual: 0 },
    { day: 'Sab', budget: 75000, actual: 0 },
    { day: 'Min', budget: 75000, actual: 0 },
  ]

  const transactions = [
    { id: 1, date: '27 Mei 2025', name: 'Nasi Rendang Padang', amount: 25000, category: 'Makan Siang', color: 'bg-sage/10 text-sage' },
    { id: 2, date: '27 Mei 2025', name: 'Bubur Ayam', amount: 12000, category: 'Sarapan', color: 'bg-twilight/10 text-twilight' },
    { id: 3, date: '26 Mei 2025', name: 'Sate Ayam Madura', amount: 35000, category: 'Makan Malam', color: 'bg-premium/10 text-premium' },
    { id: 4, date: '26 Mei 2025', name: 'Kopi Hitam', amount: 7000, category: 'Camilan', color: 'bg-ink/10 text-ink' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-display text-ink mb-1">Anggaran Makan</h1>
          <p className="text-ink-2">Pantau dan kelola pengeluaran harianmu.</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Catat Pengeluaran
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 relative group">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="text-ink-3 hover:text-ink transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-ink-3 font-bold uppercase mb-2">Budget Bulan Ini</p>
          <p className="text-3xl font-display text-ink">Rp 1.200.000</p>
        </Card>

        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-3 font-bold uppercase mb-2">Sudah Digunakan</p>
            <p className="text-3xl font-display text-ink">Rp 487.500</p>
            <p className="text-xs text-ink-3 mt-1">38% dari total budget</p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-surface-2"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-twilight"
                strokeWidth="4"
                strokeDasharray="38, 100"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-ink-3 font-bold uppercase mb-2">Estimasi Sisa Bulan</p>
          <p className="text-3xl font-display text-sage">Rp 712.500</p>
          <p className="text-xs text-ink-3 mt-1">Sisa hari: 14 hari</p>
        </Card>
      </div>

      {/* Insight Card */}
      <Card className="p-4 border-twilight/30 bg-twilight/5 flex gap-4 items-start">
        <div className="w-10 h-10 rounded-full bg-twilight/20 text-twilight flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-ink mb-1">Insight Anggaran</h4>
          <p className="text-sm text-ink-2">Minggu lalu kamu hemat <strong>Rp 45.000</strong> dari budget. Pertahankan kebiasaan ini dengan memilih lebih banyak opsi tempe dan tahu!</p>
        </div>
      </Card>

      {/* Chart & Transactions Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="font-bold text-ink mb-6">Tren Mingguan</h3>
          <div className="h-64 w-full text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0DFD8" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#849687' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#849687' }} tickFormatter={(val) => `Rp ${val / 1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(26,33,27,0.08)' }} 
                  formatter={(val) => `Rp ${val.toLocaleString('id-ID')}`}
                />
                <Bar dataKey="budget" name="Budget" fill="#A0BAA5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="actual" name="Aktual" fill="#789B7B" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-surface-2 flex justify-between items-center">
            <h3 className="font-bold text-ink">Transaksi Terakhir</h3>
            <span className="text-sm text-twilight font-medium cursor-pointer hover:underline">Lihat Semua</span>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-2/50 text-ink-3">
                <tr>
                  <th className="font-medium p-4">Tanggal</th>
                  <th className="font-medium p-4">Menu</th>
                  <th className="font-medium p-4">Kategori</th>
                  <th className="font-medium p-4 text-right">Jumlah (Rp)</th>
                  <th className="font-medium p-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-2">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="p-4 text-ink-2">{t.date}</td>
                    <td className="p-4 font-medium text-ink">{t.name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.color}`}>{t.category}</span>
                    </td>
                    <td className="p-4 text-right font-medium text-ink">{t.amount.toLocaleString('id-ID')}</td>
                    <td className="p-4 text-right">
                      <button className="text-ink-3 hover:text-danger transition-colors p-1 rounded-md hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal Overlay (Simplified Example) */}
      {showModal && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 animate-scale-in">
            <h2 className="text-xl font-bold font-display text-ink mb-4">Catat Pengeluaran</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-2 mb-1.5">Nama Makanan</label>
                <input type="text" className="w-full h-10 px-3 rounded-lg border border-surface-2 outline-none focus:border-sage" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-2 mb-1.5">Jumlah (Rp)</label>
                <input type="number" className="w-full h-10 px-3 rounded-lg border border-surface-2 outline-none focus:border-sage" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-2 mb-1.5">Kategori</label>
                <select className="w-full h-10 px-3 rounded-lg border border-surface-2 outline-none focus:border-sage">
                  <option>Sarapan</option>
                  <option>Makan Siang</option>
                  <option>Makan Malam</option>
                  <option>Camilan</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 border-surface-2 text-ink-2" onClick={() => setShowModal(false)}>Batal</Button>
                <Button variant="primary" className="flex-1" onClick={() => setShowModal(false)}>Simpan</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
