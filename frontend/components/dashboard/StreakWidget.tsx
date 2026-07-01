'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Flame } from 'lucide-react'

export function StreakWidget() {
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
  const activeDays = [true, true, true, false, false, false, false] // Example: Mon-Wed active

  return (
    <Card className="p-6 bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-heading-3 text-text-primary mb-1">Konsisten Terus!</h3>
          <p className="text-body-sm text-text-secondary">Kamu sudah mencatat kalori 3 hari berturut-turut.</p>
        </div>
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent text-white shadow-lg shadow-accent/30">
          <div className="flex flex-col items-center leading-none">
            <span className="text-lg font-bold">3</span>
            <span className="text-[10px] uppercase">Hari</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-2">
        {days.map((day, index) => (
          <div key={day} className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              activeDays[index] 
                ? 'bg-accent text-white shadow-md shadow-accent/20' 
                : 'bg-bg-surface border border-border text-text-muted'
            }`}>
              {activeDays[index] ? <Flame className="w-5 h-5" /> : null}
            </div>
            <span className={`text-xs font-medium ${activeDays[index] ? 'text-accent' : 'text-text-muted'}`}>
              {day}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
