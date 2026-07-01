'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { TrendingDown, Activity, Calendar } from 'lucide-react'

export default function ProgressPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="mb-6">
        <h1 className="text-heading-1 text-text-primary font-display mb-1">Perkembanganmu</h1>
        <p className="text-body-sm text-text-secondary">Pantau progress berat badan dan nutrisimu.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text-primary">Berat Badan (30 Hari Terakhir)</h3>
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <TrendingDown className="w-4 h-4" />
              <span>-2.5 kg</span>
            </div>
          </div>
          <div className="h-64 bg-bg-muted rounded-card flex items-center justify-center border border-border border-dashed">
            <span className="text-text-muted text-sm">[Area Grafik Interaktif]</span>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-subtle text-primary rounded-full">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-text-primary text-sm">Target Kalori Harian</h4>
                <p className="text-xs text-text-secondary">Rata-rata minggu ini</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-text-primary">1,850 kcal</span>
                <span className="text-text-muted">Target: 2,000</span>
              </div>
              <Progress value={92} indicatorColor="bg-primary" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent-subtle text-accent rounded-full">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-text-primary text-sm">Konsistensi Jurnal</h4>
                <p className="text-xs text-text-secondary">Bulan ini</p>
              </div>
            </div>
            <div className="text-display-md font-bold text-text-primary">
              24<span className="text-sm font-medium text-text-muted ml-1">/ 30 hari</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
