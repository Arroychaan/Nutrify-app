'use client'

import React from 'react'

export function DashboardHeader() {
  const currentHour = new Date().getHours()
  let greeting = 'Selamat Pagi'
  if (currentHour >= 12 && currentHour < 15) greeting = 'Selamat Siang'
  else if (currentHour >= 15 && currentHour < 18) greeting = 'Selamat Sore'
  else if (currentHour >= 18) greeting = 'Selamat Malam'

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-heading-1 text-text-primary font-display mb-1">
          {greeting}, <span className="text-primary">Budi! 👋</span>
        </h1>
        <p className="text-body-sm text-text-secondary">
          Senin, 14 Agustus 2026 • Target Kalori: 2000 kcal
        </p>
      </div>
    </div>
  )
}
