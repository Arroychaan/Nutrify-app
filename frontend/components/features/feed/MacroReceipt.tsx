'use client'

import React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Download, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MacroReceiptProps {
  isOpen: boolean
  onClose: () => void
  foodData: {
    foodName: string
    calories: number
    protein: number
    carbs: number
    fat: number
    price: number
    image?: string
  } | null
}

export function MacroReceipt({ isOpen, onClose, foodData }: MacroReceiptProps) {
  if (!foodData) return null

  // Current Date/Time
  const dateTimeStr = new Date().toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  // Simulated transaction/receipt number
  const receiptNo = `ATE-${Math.floor(100000 + Math.random() * 900000)}`

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Receipt Modal Card */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-full max-w-sm z-10 overflow-hidden"
          >
            {/* The Physical Receipt Container */}
            <div 
              className="bg-white text-stone-900 p-6 md:p-8 font-mono shadow-float relative mx-auto"
              style={{
                backgroundImage: "url('/assets/scrapbook/crumpled-paper-light.jpg')",
                backgroundSize: 'cover',
                backgroundBlendMode: 'multiply',
                backgroundColor: '#FAF9F6'
              }}
            >
              {/* Paper Top Jagged Edge Border using CSS clip-path */}
              <div 
                className="absolute top-0 inset-x-0 h-3 bg-stone-300 pointer-events-none"
                style={{
                  clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%, 100% 100%, 0% 100%)',
                  transform: 'scaleY(-1)'
                }}
              />

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center pt-3 pb-4 border-b border-dashed border-stone-400">
                <h2 className="text-lg font-black tracking-wider text-emerald-800">AI ATE INDONESIA</h2>
                <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest mt-1">Diet Lokal Bergizi Nusantara</p>
                <p className="text-[10px] text-stone-500 mt-2">KONSULTASI DIET DIGITAL</p>
              </div>

              {/* Meta Info */}
              <div className="py-4 text-xs text-stone-600 space-y-1 border-b border-dashed border-stone-400">
                <div className="flex justify-between">
                  <span>STRUK NO:</span>
                  <span className="font-bold text-stone-800">{receiptNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>WAKTU:</span>
                  <span>{dateTimeStr}</span>
                </div>
                <div className="flex justify-between">
                  <span>STATUS:</span>
                  <span className="text-emerald-700 font-bold">AKG COMPLIANT ✔</span>
                </div>
              </div>

              {/* Food Items list */}
              <div className="py-4 space-y-3 text-xs border-b border-dashed border-stone-400">
                <div className="flex justify-between font-bold text-stone-800 border-b border-stone-300 pb-1.5 text-[10px]">
                  <span>NAMA ASUPAN</span>
                  <div className="flex gap-8">
                    <span>KKAL</span>
                    <span>HARGA</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-start text-stone-800">
                  <span className="truncate max-w-[150px] font-bold uppercase">{foodData.foodName}</span>
                  <div className="flex gap-8 shrink-0">
                    <span className="font-bold">{foodData.calories}</span>
                    <span className="font-bold">Rp {foodData.price.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div className="text-[10px] text-stone-500 italic">Porsi standar Indonesia tervalidasi model RAG</div>
              </div>

              {/* Macro Nutrients breakdown */}
              <div className="py-4 border-b border-dashed border-stone-400">
                <p className="text-[10px] font-bold text-stone-600 tracking-wider mb-3">RINCIAN MAKRONUTRISI:</p>
                <div className="space-y-3.5">
                  {/* Protein */}
                  <div>
                    <div className="flex justify-between text-xs text-stone-800 font-bold mb-1">
                      <span>PROTEIN</span>
                      <span>{foodData.protein}g</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600" style={{ width: `${Math.min(100, (foodData.protein / 50) * 100)}%` }} />
                    </div>
                  </div>

                  {/* Carbs */}
                  <div>
                    <div className="flex justify-between text-xs text-stone-800 font-bold mb-1">
                      <span>KARBOHIDRAT</span>
                      <span>{foodData.carbs}g</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (foodData.carbs / 225) * 100)}%` }} />
                    </div>
                  </div>

                  {/* Fat */}
                  <div>
                    <div className="flex justify-between text-xs text-stone-800 font-bold mb-1">
                      <span>LEMAK</span>
                      <span>{foodData.fat}g</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: `${Math.min(100, (foodData.fat / 60) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="py-4 text-sm font-bold text-stone-800 space-y-2 border-b border-dashed border-stone-400">
                <div className="flex justify-between">
                  <span>TOTAL ENERGI:</span>
                  <span className="text-emerald-700 text-base">{foodData.calories} kkal</span>
                </div>
                <div className="flex justify-between">
                  <span>TOTAL BIAYA:</span>
                  <span>Rp {foodData.price.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Retro QR or Barcode */}
              <div className="flex flex-col items-center justify-center pt-6 pb-2 text-center">
                {/* Simulated CSS barcode */}
                <div className="w-48 h-8 flex items-center justify-center overflow-hidden gap-0.5 opacity-80 mb-2">
                  {[1,3,2,1,4,2,3,1,2,4,1,2,3,1,4,2,1,3,2,1,4,2,3,1,2,4,1].map((width, idx) => (
                    <div 
                      key={idx} 
                      className="bg-black h-full" 
                      style={{ width: `${width}px` }}
                    />
                  ))}
                </div>
                <span className="text-[9px] text-stone-500 font-bold tracking-widest">{receiptNo}</span>

                <p className="text-[9px] text-stone-500 mt-4 leading-relaxed font-bold">
                  SIMPAN STRUK INI SEBAGAI DIARY MAKAN KAMU.<br />
                  SHARE DI INSTAGRAM/TIKTOK DAN TAG @AIATEINDONESIA!
                </p>
              </div>

              {/* Custom Retro Stamp overlay */}
              <div className="absolute bottom-16 right-4 w-16 h-16 pointer-events-none rotate-[-15deg] opacity-75 select-none z-10">
                <Image 
                  src="/assets/scrapbook/stamp-gold.png" 
                  alt="Retro Stamp" 
                  fill
                  className="object-contain"
                />
              </div>

              {/* Paper Bottom Jagged Edge Border */}
              <div 
                className="absolute bottom-0 inset-x-0 h-3 bg-stone-300 pointer-events-none"
                style={{
                  clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%, 100% 100%, 0% 100%)'
                }}
              />
            </div>

            {/* Action buttons under receipt */}
            <div className="mt-4 flex gap-3 w-full justify-center">
              <button 
                onClick={() => {
                  alert("Gambar struk siap dibagikan! (Simulasi ekspor gambar berhasil)")
                }}
                className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-stone-800 shadow-md transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Bagikan Struk
              </button>
              <button 
                onClick={() => {
                  alert("Struk berhasil diunduh ke Galeri!")
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Download className="w-4 h-4" />
                Unduh Gambar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
