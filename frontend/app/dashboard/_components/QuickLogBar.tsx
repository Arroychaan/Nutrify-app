'use client'

import React from 'react'
import Image from 'next/image'

interface MealButtonProps {
  label: string
  time: string
  icon: string // 3d food icon path
  color: string // tailwind border color on active
  onClick: () => void
}

function MealButton({ label, time, icon, color, onClick }: MealButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-surface-2/60 hover:bg-sage/10 border border-transparent hover:border-sage/30 transition-all duration-fast group min-w-[72px]"
    >
      <div className="w-10 h-10 rounded-xl bg-white border border-surface-3 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
        <Image
          src={icon}
          alt={label}
          width={36}
          height={36}
          className="object-contain"
        />
      </div>
      <span className="text-[11px] font-bold text-ink-2 group-hover:text-sage transition-colors leading-tight text-center">
        {label}
      </span>
      <span className="text-[9px] font-medium text-ink-3 leading-none">{time}</span>
    </button>
  )
}

interface QuickLogBarProps {
  onMealClick?: (mealType: string) => void
  onScanClick?: () => void
}

export default function QuickLogBar({ onMealClick, onScanClick }: QuickLogBarProps) {
  const meals = [
    { label: 'Sarapan', time: '06-09', icon: '/assets/3d-foods/bubur.png', color: 'border-amber-300' },
    { label: 'Makan Siang', time: '11-14', icon: '/assets/3d-foods/Nasi-padang.png', color: 'border-orange-400' },
    { label: 'Makan Malam', time: '17-20', icon: '/assets/3d-foods/ikan-bakar.png', color: 'border-blue-400' },
    { label: 'Camilan', time: 'kapan aja', icon: '/assets/3d-foods/pisang.png', color: 'border-yellow-400' },
  ]

  return (
    <div className="relative bg-white border border-surface-2 rounded-3xl p-4 shadow-card">
      {/* Clear tape di atas */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-6 z-10 pointer-events-none opacity-50">
        <Image
          src="/assets/scrapbook/clear-tape-piece.png"
          alt=""
          width={80}
          height={24}
          className="object-cover"
        />
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-sage/10 border border-sage/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-sage" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 1v2M6 9v2M1 6h2M9 6h2M3.5 3.5l1.5 1.5M7 7l1.5 1.5M3.5 8.5l1.5-1.5M7 5l1.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <span className="text-xs font-bold text-ink-2 uppercase tracking-wider">Catat Cepat</span>
        </div>
        
        <button
          onClick={onScanClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage text-white text-[10px] font-bold hover:bg-[#2c4e39] transition-all"
        >
          <Image
            src="/assets/icons/scan-icon.svg"
            alt="Scan"
            width={14}
            height={14}
            className="object-contain invert"
          />
          Scan AI
        </button>
      </div>

      {/* Meal Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {meals.map((meal) => (
          <MealButton
            key={meal.label}
            label={meal.label}
            time={meal.time}
            icon={meal.icon}
            color={meal.color}
            onClick={() => onMealClick?.(meal.label)}
          />
        ))}
      </div>
    </div>
  )
}