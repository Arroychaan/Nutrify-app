'use client'

import React from 'react'
import Image from 'next/image'
import ScrapbookFrame from './ScrapbookFrame'

interface AchievementCardProps {
  type: 'streak' | 'badge' | 'challenge'
  title: string
  description: string
  badgeImage?: string
  streakDays?: number
  rotation?: number
  onShare?: () => void
}

const BADGE_IMAGES: Record<string, string> = {
  '7-streak': '/assets/badges/medali-7-streak.png',
  'kalori-streak': '/assets/badges/medali-kalori-streak.png',
  'new-user': '/assets/badges/medali-new-user.png',
  'scan': '/assets/badges/medali-scan.png',
}

export default function AchievementCard({
  type,
  title,
  description,
  badgeImage,
  streakDays,
  rotation = -1,
  onShare,
}: AchievementCardProps) {
  const badgeSrc = badgeImage ? BADGE_IMAGES[badgeImage] || badgeImage : '/assets/badges/medali-7-streak.png'

  return (
    <ScrapbookFrame
      rotation={rotation}
      clipType="gold"
      tapeType="terracotta"
      className="w-full"
    >
      <div className="p-5 text-center space-y-3">
        {/* Vintage stamp badge */}
        <div className="relative mx-auto w-20 h-20">
          <Image
            src="/assets/scrapbook/stamp-gold.png"
            alt=""
            width={80}
            height={80}
            className="absolute inset-0 w-full h-full object-contain opacity-30"
          />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <Image
              src={badgeSrc}
              alt={title}
              width={56}
              height={56}
              className="object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Trophy icon type */}
        {type === 'streak' && streakDays && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
            <span className="text-lg leading-none">🔥</span>
            <span className="text-xs font-extrabold text-gold">{streakDays} Hari Streak!</span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-base font-bold font-display text-ink leading-tight">{title}</h3>
        <p className="text-xs text-ink-2 leading-relaxed">{description}</p>

        {/* Gold paper clip + action */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            onClick={onShare}
            className="px-4 py-2 rounded-xl bg-gold text-white text-[11px] font-bold hover:bg-[#d4952a] transition-all shadow-sm"
          >
            Bagikan Pencapaian 🎉
          </button>
        </div>

        {/* Date stamp vintage di bawah */}
        <div className="flex justify-center pointer-events-none">
          <Image
            src="/assets/scrapbook/date-stamp-vintage.png"
            alt=""
            width={60}
            height={20}
            className="opacity-40"
          />
        </div>
      </div>
    </ScrapbookFrame>
  )
}