'use client'

import React from 'react'
import BottomNav from './_components/BottomNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-body selection:bg-sage/20 text-ink">
      {/* Background paper texture */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] bg-repeat"
        style={{
          backgroundImage: 'url(/assets/scrapbook/notebook-lined-paper.jpg)',
          backgroundSize: '400px',
        }}
      />

      {/* Main content */}
      <main className="relative z-10 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}