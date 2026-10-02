'use client'

import React from 'react'
import Image from 'next/image'

interface ScrapbookFrameProps {
  children: React.ReactNode
  rotation?: number // random rotation between -2 to 2
  clipType?: 'silver' | 'gold' | 'red' | 'black'
  tapeType?: 'grid' | 'sage' | 'terracotta'
  corner?: boolean
  className?: string
  onClick?: () => void
}

const CLIP_SRC: Record<string, string> = {
  silver: '/assets/scrapbook/paper-clip-silver.png',
  gold: '/assets/scrapbook/paper-clip-gold.png',
  red: '/assets/scrapbook/paper-clip-red.png',
  black: '/assets/scrapbook/paper-clip-black.png',
}

const TAPE_SRC: Record<string, string> = {
  grid: '/assets/scrapbook/washi-tape-grid.png',
  sage: '/assets/scrapbook/washi-tape-sage.png',
  terracotta: '/assets/scrapbook/washi-tape-terracota.png',
}

export default function ScrapbookFrame({
  children,
  rotation = 1,
  clipType = 'silver',
  tapeType = 'sage',
  corner = true,
  className = '',
  onClick,
}: ScrapbookFrameProps) {
  const rot = rotation % 2 === 0 ? rotation : rotation * -0.6
  const tapeRot = (rotation * 4) % 8 - 3

  return (
    <div
      onClick={onClick}
      className={`relative bg-white border border-surface-2 rounded-2xl shadow-scrapbook transition-all duration-normal cursor-pointer
        hover:shadow-float hover:-translate-y-0.5
        ${className}`}
      style={{
        transform: `rotate(${rot}deg)`,
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
      }}
    >
      {/* Paper Clip di atas */}
      <div
        className="absolute -top-6 left-8 w-12 h-16 z-20 pointer-events-none"
        style={{ transform: `rotate(${rot * -2}deg)` }}
      >
        <Image
          src={CLIP_SRC[clipType] || CLIP_SRC.silver}
          alt="paper clip"
          width={48}
          height={64}
          className="object-contain drop-shadow-md"
        />
      </div>

      {/* Washi Tape di samping kiri atas */}
      <div
        className="absolute -top-3 -left-3 w-16 h-8 z-10 pointer-events-none opacity-80"
        style={{ transform: `rotate(${tapeRot}deg)` }}
      >
        <Image
          src={TAPE_SRC[tapeType] || TAPE_SRC.sage}
          alt="washi tape"
          width={64}
          height={32}
          className="object-cover"
        />
      </div>

      {/* Photo Corner vintage (bawah kanan) */}
      {corner && (
        <div className="absolute -bottom-2 -right-2 w-10 h-10 z-10 pointer-events-none opacity-70">
          <Image
            src="/assets/scrapbook/photo-corner-vintage.png"
            alt="photo corner"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
      )}

      {/* Konten */}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  )
}