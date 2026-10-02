'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

interface AiPersonaCardProps {
  userName?: string
  currentMeal?: string
  suggestedCalories?: number
}

const GREETINGS = [
  'Pagi {name}! Udah sarapan belum? Yuk catat menu pagimu biar aku bantu atur gizinya ✨',
  'Halo {name}! Tadi siang makan apa? Aku lihat kamu belum input makan siang nih~',
  '{name}, jangan lupa minum air ya! Target kamu hari ini masih kurang 4 gelas 💧',
  'Wah {name}, streak kamu udah 5 hari lho! Semangat terus ya! 🔥',
  '{name}, aku punya rekomendasi menu makan malam nih: Pepes ikan + tumis kangkung, cuma 380 kkal. Mau?',
  'Malam {name}! Udah waktunya evaluasi makan hari ini. Yuk kita review bareng 📋',
]

export default function AiPersonaCard({
  userName = 'Sobat',
  currentMeal,
  suggestedCalories,
}: AiPersonaCardProps) {
  const [greeting, setGreeting] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const randomGreeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
    setGreeting(randomGreeting.replace('{name}', userName))

    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [userName])

  return (
    <div
      className={`relative bg-gradient-to-br from-[#FDFBF7] to-[#F4F0E6] border border-surface-2 rounded-3xl p-4 overflow-hidden shadow-card
        transition-all duration-slow cursor-pointer hover:shadow-float
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {/* Coffee ring stain watermark */}
      <div className="absolute -top-6 -right-8 w-28 h-28 z-0 pointer-events-none opacity-15">
        <Image
          src="/assets/scrapbook/coffee-ring-stain.png"
          alt=""
          width={112}
          height={112}
          className="object-contain"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-start gap-3">
        {/* Maskot + speech bubble */}
        <div className="flex-shrink-0 relative">
          <div className="w-14 h-14 rounded-2xl bg-sage/10 border border-sage/20 flex items-center justify-center overflow-hidden shadow-inner">
            <Image
              src="/assets/brand/maskot.svg"
              alt="AI Ate"
              width={44}
              height={44}
              className="object-contain"
            />
          </div>
          {/* Push pin kecil di maskot */}
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 z-20 pointer-events-none">
            <Image
              src="/assets/scrapbook/push-pin-green.png"
              alt=""
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
        </div>

        {/* Speech bubble */}
        <div className="flex-1 relative">
          <Image
            src="/assets/scrapbook/speech-bubble-handdrawn-left.svg"
            alt=""
            width={20}
            height={14}
            className="absolute -left-1.5 top-3 w-5 h-3.5 z-0 opacity-60"
          />
          <div className="relative z-10 bg-white border border-surface-2 rounded-2xl rounded-tl-sm p-3 shadow-sm">
            <p className="text-xs font-medium text-ink-2 leading-relaxed">{greeting}</p>

            {/* Action hint */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] font-bold text-sage uppercase tracking-wider">
                Tanya AI Ate
              </span>
              <svg className="w-3 h-3 text-sage animate-pulse-ring" viewBox="0 0 12 12" fill="currentColor">
                <path d="M4.5 2.5a.5.5 0 011 0v4.793l2.146-2.147a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 11.708-.708L4.5 7.293V2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Staple di pojok kanan atas */}
      <div className="absolute top-1 right-3 w-5 h-5 z-20 pointer-events-none opacity-60 rotate-[-8deg]">
        <Image
          src="/assets/scrapbook/staple-single.png"
          alt=""
          width={20}
          height={20}
          className="object-contain"
        />
      </div>
    </div>
  )
}