'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Lightbulb, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function TipCard() {
  return (
    <Card className="p-6 bg-primary-dark text-white border-none relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <Lightbulb className="w-5 h-5 text-accent-light" />
        <span className="text-sm font-bold uppercase tracking-wider text-primary-subtle">Tip AI Hari Ini</span>
      </div>
      
      <p className="text-body-md leading-relaxed mb-6 flex-1 relative z-10">
        Karena kamu ada keturunan diabetes, lebih baik ganti nasi putih dengan nasi merah atau singkong rebus untuk sarapan pagi ini.
      </p>
      
      <Link href="/chat" className="inline-flex items-center gap-2 text-sm font-medium text-primary-subtle hover:text-white transition-colors relative z-10">
        Tanya lebih lanjut <ArrowRight className="w-4 h-4" />
      </Link>
    </Card>
  )
}
