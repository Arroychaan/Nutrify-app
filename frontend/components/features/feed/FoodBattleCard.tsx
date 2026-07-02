'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Flame, AlertCircle } from 'lucide-react'
import { useAppStore, FoodItem } from '@/lib/store'
import { cn } from '@/lib/utils'

interface FoodBattleCardProps {
  id: string
  title: string
  optionA: {
    name: string
    cal: number
    protein: number
    carbs: number
    fat: number
    price: number
    img: string
    verdict: string
    isHealthy: boolean
  }
  optionB: {
    name: string
    cal: number
    protein: number
    carbs: number
    fat: number
    price: number
    img: string
    verdict: string
    isHealthy: boolean
  }
  initialVotesA?: number
  initialVotesB?: number
}

export function FoodBattleCard({
  id,
  title,
  optionA,
  optionB,
  initialVotesA = 142,
  initialVotesB = 98
}: FoodBattleCardProps) {
  const store = useAppStore()
  const [votedOption, setVotedOption] = useState<'A' | 'B' | null>(null)
  const [showLogConfirm, setShowLogConfirm] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('lunch')
  const [logSuccess, setLogSuccess] = useState(false)

  const totalVotes = initialVotesA + initialVotesB + (votedOption ? 1 : 0)
  const votesA = initialVotesA + (votedOption === 'A' ? 1 : 0)
  const votesB = initialVotesB + (votedOption === 'B' ? 1 : 0)

  const percentA = Math.round((votesA / totalVotes) * 100)
  const percentB = Math.round((votesB / totalVotes) * 100)

  const handleVote = (option: 'A' | 'B') => {
    if (votedOption) return
    setVotedOption(option)
  }

  const handleLogSelection = async () => {
    try {
      const selected = votedOption === 'A' ? optionA : optionB
      const foodItem: FoodItem = {
        id: `battle-${Date.now()}`,
        name: selected.name,
        cal: selected.cal,
        protein: selected.protein,
        carbs: selected.carbs,
        fat: selected.fat,
        price: selected.price,
        image: selected.img,
        category: 'battle'
      }

      await store.addFoodToMeal(selectedMealType, foodItem)
      
      if (selected.price > 0) {
        await store.addTransaction(selected.name, selected.price, 'Makanan')
      }

      setLogSuccess(true)
      setTimeout(() => {
        setLogSuccess(false)
        setShowLogConfirm(false)
      }, 1500)
    } catch (err) {
      console.error('Failed to log battle food:', err)
    }
  }

  return (
    <div className="bg-surface dark:bg-surface-2 border border-border/60 rounded-3xl p-5 shadow-card relative overflow-hidden">
      
      {/* Background Graphic Element (Drawn Underline or Bracket) */}
      <div className="absolute top-2 right-4 opacity-10 pointer-events-none select-none">
        <span className="text-8xl font-black italic">VS</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-twilight animate-pulse" />
        <span className="text-xs font-bold text-twilight uppercase tracking-widest">{title}</span>
      </div>

      <h3 className="text-xl font-editorial font-bold text-ink mb-6">
        Pertarungan Gizi Harian: Mana Pilihan Sehatmu? 🥊
      </h3>

      {/* Battle Columns Grid */}
      <div className="grid grid-cols-2 gap-4 relative">
        
        {/* Center VS circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-twilight text-white font-black text-xs italic flex items-center justify-center border-4 border-surface dark:border-surface-2 z-10 shadow-md">
          VS
        </div>

        {/* Option A */}
        <div 
          onClick={() => handleVote('A')}
          className={cn(
            "p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-between cursor-pointer text-center relative overflow-hidden group",
            votedOption === 'A' 
              ? "bg-sage/5 border-sage shadow-md"
              : votedOption 
                ? "bg-stone-50/50 dark:bg-stone-900/30 border-transparent opacity-60 pointer-events-none" 
                : "bg-surface-2 dark:bg-surface-3 border-transparent hover:border-ink-3/40 hover:scale-[1.01]"
          )}
        >
          {/* Card tape visual */}
          <div className="absolute -top-1 w-12 h-4 opacity-50 z-20 pointer-events-none">
            <Image src="/assets/scrapbook/clear-tape-piece.png" alt="Tape" fill className="object-contain" />
          </div>

          <div className="w-24 h-24 relative overflow-hidden rounded-xl bg-white dark:bg-stone-800 p-1 shrink-0 border border-border/40 transition-transform group-hover:scale-105">
            <Image src={optionA.img} alt={optionA.name} fill className="object-contain p-1" />
          </div>

          <div className="mt-3 w-full">
            <h4 className="font-bold text-xs text-ink leading-tight truncate max-w-full">{optionA.name}</h4>
            <p className="text-[10px] text-ink-3 font-bold uppercase tracking-wider mt-1">{optionA.cal} kkal</p>
          </div>

          {/* Vote Percentage overlay */}
          <AnimatePresence>
            {votedOption && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mt-2.5 pt-2.5 border-t border-dashed border-border/60"
              >
                <div className="text-xl font-editorial font-bold text-sage">{percentA}%</div>
                <div className="text-[9px] text-ink-3 font-bold uppercase tracking-widest mt-0.5">Community Vote</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Option B */}
        <div 
          onClick={() => handleVote('B')}
          className={cn(
            "p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-between cursor-pointer text-center relative overflow-hidden group",
            votedOption === 'B' 
              ? "bg-sage/5 border-sage shadow-md"
              : votedOption 
                ? "bg-stone-50/50 dark:bg-stone-900/30 border-transparent opacity-60 pointer-events-none" 
                : "bg-surface-2 dark:bg-surface-3 border-transparent hover:border-ink-3/40 hover:scale-[1.01]"
          )}
        >
          {/* Card tape visual */}
          <div className="absolute -top-1 w-12 h-4 opacity-50 z-20 pointer-events-none">
            <Image src="/assets/scrapbook/clear-tape-piece.png" alt="Tape" fill className="object-contain" />
          </div>

          <div className="w-24 h-24 relative overflow-hidden rounded-xl bg-white dark:bg-stone-800 p-1 shrink-0 border border-border/40 transition-transform group-hover:scale-105">
            <Image src={optionB.img} alt={optionB.name} fill className="object-contain p-1" />
          </div>

          <div className="mt-3 w-full">
            <h4 className="font-bold text-xs text-ink leading-tight truncate max-w-full">{optionB.name}</h4>
            <p className="text-[10px] text-ink-3 font-bold uppercase tracking-wider mt-1">{optionB.cal} kkal</p>
          </div>

          {/* Vote Percentage overlay */}
          <AnimatePresence>
            {votedOption && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mt-2.5 pt-2.5 border-t border-dashed border-border/60"
              >
                <div className="text-xl font-editorial font-bold text-sage">{percentB}%</div>
                <div className="text-[9px] text-ink-3 font-bold uppercase tracking-widest mt-0.5">Community Vote</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* AI Coach verdict & actions display */}
      <AnimatePresence>
        {votedOption && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-6 border-t border-border/40 pt-4"
          >
            {/* Verdict box */}
            <div className="bg-surface-2 dark:bg-surface-3 p-4 rounded-2xl flex items-start gap-3 border border-border/40">
              <AlertCircle className="w-5 h-5 text-sage shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-sage uppercase tracking-widest">Komentar AI Coach</span>
                <p className="text-xs text-ink-2 font-medium leading-relaxed mt-1.5">
                  {votedOption === 'A' ? optionA.verdict : optionB.verdict}
                </p>
              </div>
            </div>

            {/* Quick Log Action */}
            <div className="mt-4 flex justify-between items-center bg-sage/5 dark:bg-sage-muted/10 p-3 rounded-2xl border border-sage/20">
              <span className="text-xs font-bold text-ink-2">Tertarik memakannya hari ini?</span>
              <button 
                onClick={() => setShowLogConfirm(true)}
                className="bg-sage hover:bg-sage-light text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md transition-colors"
              >
                Catat Menu Ini
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK LOG MEAL DIALOG */}
      <AnimatePresence>
        {showLogConfirm && (
          <div className="absolute inset-0 bg-surface/95 dark:bg-surface-2/95 z-30 rounded-3xl p-6 flex flex-col justify-center items-center backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
            {logSuccess ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center text-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-sage text-white flex items-center justify-center shadow-glow mb-2">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-editorial font-bold text-ink">Menu Dicatat!</h3>
                <p className="text-sm text-ink-2 font-medium">Ditambahkan ke menu {selectedMealType === 'breakfast' ? 'Sarapan' : selectedMealType === 'lunch' ? 'Makan Siang' : selectedMealType === 'dinner' ? 'Makan Malam' : 'Camilan'}</p>
              </motion.div>
            ) : (
              <div className="w-full max-w-xs flex flex-col gap-4 text-center">
                <div>
                  <h3 className="text-lg font-editorial font-bold text-ink">Catat Menu Pilihan</h3>
                  <p className="text-xs text-ink-3 font-medium mt-1">Tambahkan &ldquo;{votedOption === 'A' ? optionA.name : optionB.name}&rdquo; ke jurnal hari ini</p>
                </div>

                <div className="space-y-2">
                  {[
                    { type: 'breakfast', label: 'Sarapan 🌅' },
                    { type: 'lunch', label: 'Makan Siang ☀️' },
                    { type: 'dinner', label: 'Makan Malam 🌙' },
                    { type: 'snacks', label: 'Camilan 🥨' }
                  ].map((meal) => (
                    <button
                      key={meal.type}
                      onClick={() => setSelectedMealType(meal.type as any)}
                      className={cn(
                        "w-full py-2.5 px-4 rounded-xl border font-bold text-sm transition-all flex items-center justify-between",
                        selectedMealType === meal.type
                          ? "bg-sage/10 border-sage text-sage"
                          : "bg-surface-2 hover:bg-surface-3 dark:bg-surface-3 dark:hover:bg-border/50 border-transparent text-ink-2"
                      )}
                    >
                      <span>{meal.label}</span>
                      {selectedMealType === meal.type && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2.5 mt-2">
                  <button
                    onClick={() => setShowLogConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border hover:bg-surface-2 dark:hover:bg-surface-3 text-ink-2 font-bold text-xs"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleLogSelection}
                    className="flex-1 py-2.5 bg-twilight hover:bg-twilight-light text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Konfirmasi
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
