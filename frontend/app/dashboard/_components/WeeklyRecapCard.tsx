'use client'

import React from 'react'
import Image from 'next/image'
import ScrapbookFrame from './ScrapbookFrame'

interface WeeklyRecapCardProps {
  weekLabel: string
  totalCalories: number
  savedCalories: number
  totalSpent: number
  savedMoney: number
  topFood: string
  streakDays: number
  rotation?: number
}

export default function WeeklyRecapCard({
  weekLabel,
  totalCalories,
  savedCalories,
  totalSpent,
  savedMoney,
  topFood,
  streakDays,
  rotation = 0,
}: WeeklyRecapCardProps) {
  return (
    <ScrapbookFrame
      rotation={rotation}
      clipType="black"
      tapeType="grid"
      className="w-full"
    >
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sage/10 border border-sage/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-sage" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="12" height="11" rx="2" />
                <path d="M2 7h12M5 1v3M11 1v3" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3 className="text-xs font-bold text-ink-2 uppercase tracking-wider">AI Weekly Recap</h3>
              <p className="text-[10px] text-ink-3">{weekLabel}</p>
            </div>
          </div>

          {/* AI badge */}
          <div className="px-2 py-1 rounded-full bg-premium/10 border border-premium/20">
            <span className="text-[9px] font-bold text-premium">🤖 AI</span>
          </div>
        </div>

        {/* Highlight stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-sage/5 border border-sage/10 rounded-2xl p-3">
            <p className="text-[9px] text-sage/70 uppercase font-bold tracking-wider mb-1">Kalori Tercatat</p>
            <p className="text-xl font-extrabold text-sage leading-none">
              {totalCalories.toLocaleString()}
              <span className="text-[10px] font-medium text-sage/60 ml-0.5">kkal</span>
            </p>
          </div>
          <div className="bg-twilight/5 border border-twilight/10 rounded-2xl p-3">
            <p className="text-[9px] text-twilight/70 uppercase font-bold tracking-wider mb-1">Hemat Kalori</p>
            <p className="text-xl font-extrabold text-twilight leading-none">
              {savedCalories.toLocaleString()}
              <span className="text-[10px] font-medium text-twilight/60 ml-0.5">kkal</span>
            </p>
          </div>
          <div className="bg-gold/5 border border-gold/10 rounded-2xl p-3">
            <p className="text-[9px] text-gold/70 uppercase font-bold tracking-wider mb-1">Pengeluaran</p>
            <p className="text-xl font-extrabold text-gold leading-none">
              Rp{totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="bg-status-success/5 border border-status-success/10 rounded-2xl p-3">
            <p className="text-[9px] text-status-success/70 uppercase font-bold tracking-wider mb-1">Hemat Uang</p>
            <p className="text-xl font-extrabold text-status-success leading-none">
              Rp{savedMoney.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Top food & streak */}
        <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-white border border-surface-3 flex items-center justify-center flex-shrink-0">
            <Image
              src="/assets/scrapbook/love-like.svg"
              alt=""
              width={24}
              height={24}
              className="opacity-60"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-ink-3 font-medium">Makanan Favorit Minggu Ini</p>
            <p className="text-xs font-extrabold text-ink truncate">{topFood}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-ink-3 font-medium">Streak</p>
            <p className="text-xs font-extrabold text-twilight">{streakDays} Hari 🔥</p>
          </div>
        </div>

        {/* Scribble highlight */}
        <div className="flex justify-center pointer-events-none">
          <Image
            src="/assets/scrapbook/underline-zigzag.svg"
            alt=""
            width={100}
            height={6}
            className="opacity-25"
          />
        </div>
      </div>
    </ScrapbookFrame>
  )
}