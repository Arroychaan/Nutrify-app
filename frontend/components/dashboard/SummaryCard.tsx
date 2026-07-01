'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'

export function SummaryCard() {
  return (
    <Card className="p-6">
      <h3 className="font-display text-heading-3 text-text-primary mb-6">Ringkasan Hari Ini</h3>
      
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Main Calorie Ring */}
        <div className="relative w-40 h-40 shrink-0 flex items-center justify-center rounded-full border-[12px] border-bg-muted border-t-primary border-r-primary">
          <div className="text-center">
            <span className="block text-display-md text-text-primary font-bold">1,240</span>
            <span className="block text-caption text-text-muted mt-1">/ 2,000 kcal</span>
          </div>
        </div>

        {/* Macros */}
        <div className="flex-1 w-full space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-text-secondary">Karbohidrat</span>
              <span className="font-bold text-text-primary">120 / 250g</span>
            </div>
            <Progress value={48} indicatorColor="bg-accent" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-text-secondary">Protein</span>
              <span className="font-bold text-text-primary">45 / 80g</span>
            </div>
            <Progress value={56} indicatorColor="bg-primary" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-text-secondary">Lemak</span>
              <span className="font-bold text-text-primary">30 / 60g</span>
            </div>
            <Progress value={50} indicatorColor="bg-[#EAB308]" />
          </div>
        </div>
      </div>
    </Card>
  )
}
