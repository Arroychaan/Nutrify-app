'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, ChevronLeft, ChevronRight, Utensils } from 'lucide-react'

export default function FoodLogPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-heading-1 text-text-primary font-display mb-1">Jurnal Makanan</h1>
          <p className="text-body-sm text-text-secondary">Catat makananmu hari ini.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={ChevronLeft}></Button>
          <span className="font-medium text-text-primary">Hari Ini</span>
          <Button variant="secondary" size="sm" icon={ChevronRight}></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Sarapan', 'Makan Siang', 'Makan Malam', 'Cemilan'].map((meal) => (
          <Card key={meal} className="p-5 flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Utensils className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-text-primary">{meal}</h3>
              </div>
              <p className="text-sm text-text-muted">Belum ada catatan.</p>
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-4 justify-start text-primary hover:text-primary-dark">
              <Plus className="w-4 h-4 mr-2" /> Tambah Makanan
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
