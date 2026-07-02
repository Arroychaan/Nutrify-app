'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, RefreshCw, Eye, EyeOff, Award, ChevronDown, Check } from 'lucide-react'
import { useAppStore, FoodItem } from '@/lib/store'
import { cn } from '@/lib/utils'

interface BoundingBox {
  id: string
  label: string
  cal: number
  protein: number
  carbs: number
  fat: number
  top: string // percentage
  left: string // percentage
  width: string // percentage
  height: string // percentage
}

interface AIPolaroidPostProps {
  id: string
  author: {
    name: string
    avatar: string
    handle: string
    goal: string
    streak: number
  }
  foodName: string
  imageUrl: string
  calories: number
  protein: number
  carbs: number
  fat: number
  price: number
  timeAgo: string
  description: string
  boundingBoxes: BoundingBox[]
  tapeStyle?: 'sage' | 'terracotta' | 'grid' | 'clear'
  onShowReceipt: (foodData: any) => void
}

export function AIPolaroidPost({
  id,
  author,
  foodName,
  imageUrl,
  calories,
  protein,
  carbs,
  fat,
  price,
  timeAgo,
  description,
  boundingBoxes,
  tapeStyle = 'sage',
  onShowReceipt
}: AIPolaroidPostProps) {
  const store = useAppStore()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 50) + 12)
  const [isScanning, setIsScanning] = useState(false)
  const [showReplateDialog, setShowReplateDialog] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('lunch')
  const [replateSuccess, setReplateSuccess] = useState(false)

  // Tape assets mapper
  const tapeImages = {
    sage: '/assets/scrapbook/washi-tape-sage.png',
    terracotta: '/assets/scrapbook/washi-tape-terracota.png',
    grid: '/assets/scrapbook/washi-tape-grid.png',
    clear: '/assets/scrapbook/clear-tape-piece.png',
  }

  const handleLike = () => {
    if (liked) {
      setLiked(false)
      setLikesCount(prev => prev - 1)
    } else {
      setLiked(true)
      setLikesCount(prev => prev + 1)
    }
  }

  const handleReplate = async () => {
    try {
      const foodItem: FoodItem = {
        id: `replate-${Date.now()}`,
        name: foodName,
        cal: calories,
        protein: protein,
        carbs: carbs,
        fat: fat,
        price: price,
        image: imageUrl,
        category: 'replate'
      }

      await store.addFoodToMeal(selectedMealType, foodItem)
      
      // If it has a price, add transaction
      if (price > 0) {
        await store.addTransaction(foodName, price, 'Makanan')
      }

      setReplateSuccess(true)
      setTimeout(() => {
        setReplateSuccess(false)
        setShowReplateDialog(false)
      }, 1500)
    } catch (err) {
      console.error('Failed to replate:', err)
    }
  }

  return (
    <div className="bg-surface dark:bg-surface-2 border border-border/60 rounded-3xl p-5 shadow-card relative">
      
      {/* Decorative Washi Tape on top */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-7 z-20 pointer-events-none select-none opacity-90">
        <Image 
          src={tapeImages[tapeStyle]} 
          alt="Washi Tape" 
          fill
          className="object-contain transform rotate-1"
        />
      </div>

      {/* Author Header */}
      <div className="flex items-center justify-between mb-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-surface-2 dark:bg-surface-3 border border-border/40 overflow-hidden relative">
              <Image 
                src={author.avatar || '/assets/scrapbook/approved-pin.png'} 
                alt={author.name}
                fill
                className="object-cover"
              />
            </div>
            {author.streak > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-gold text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-surface flex items-center gap-0.5">
                🔥 {author.streak}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-sm text-ink leading-tight">{author.name}</p>
              <span className="text-[10px] bg-sage/10 text-sage dark:text-sage-light px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {author.goal}
              </span>
            </div>
            <p className="text-xs text-ink-3">@{author.handle}</p>
          </div>
        </div>
        <span className="text-xs text-ink-3 font-medium">{timeAgo}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-ink-2 mb-4 leading-relaxed font-medium">
        {description}
      </p>

      {/* Physical Polaroid Card Container */}
      <div className="bg-[#FAF8F5] dark:bg-[#eae6db] p-4 pb-6 rounded-lg shadow-polaroid border border-[#D5CEBF] relative overflow-hidden select-none">
        
        {/* Polaroid Corners Overlay for styling */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-black/10 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-black/10 pointer-events-none" />
        
        {/* Main Image Container */}
        <div className="relative aspect-[4/3] w-full bg-black/10 rounded overflow-hidden border border-black/5 group">
          <Image
            src={imageUrl}
            alt={foodName}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />

          {/* Glowing Bounding Boxes (AI Scan Overlay) */}
          <AnimatePresence>
            {isScanning && (
              <>
                {/* Green Laser Scan Line Animation */}
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: ['0%', '98%', '0%'] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#7FD49A] to-transparent shadow-[0_0_12px_#7FD49A] z-10 pointer-events-none"
                />
                
                {/* Bounding Boxes */}
                {boundingBoxes.map((box, index) => (
                  <motion.div
                    key={box.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    style={{
                      top: box.top,
                      left: box.left,
                      width: box.width,
                      height: box.height,
                    }}
                    className="absolute border-2 border-dashed border-[#7FD49A] bg-[#3D6B4F]/10 z-10 rounded shadow-[0_0_8px_rgba(127,212,154,0.3)] group/box pointer-events-auto"
                  >
                    {/* Bounding box hover details pill */}
                    <div className="absolute -top-7 left-0 bg-[#1E1810]/90 backdrop-blur-sm border border-[#7FD49A]/50 text-white rounded-full px-2 py-0.5 flex items-center gap-1.5 shadow-float scale-90 md:scale-100 origin-bottom-left transition-transform group-hover/box:scale-110 pointer-events-none whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7FD49A] animate-ping" />
                      <span className="text-[10px] font-bold tracking-wide">
                        {box.label} • <span className="text-[#7FD49A]">{box.cal} kkal</span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Custom stamp over photo */}
          <div className="absolute bottom-3 right-3 w-14 h-14 z-20 pointer-events-none rotate-[12deg] drop-shadow-md select-none opacity-85">
            <Image 
              src="/assets/scrapbook/approved-pin.png" 
              alt="Stamp"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Polaroid Caption Footer */}
        <div className="mt-4 flex items-center justify-between font-handwritten text-xl text-ink-2 px-1">
          <span className="truncate max-w-[70%]">{foodName}</span>
          <span className="text-sage font-bold shrink-0">{calories} kkal</span>
        </div>
      </div>

      {/* Micro Info (Macros Summary) */}
      <div className="mt-4 flex gap-3 text-[11px] font-bold text-ink-3 px-1">
        <span className="bg-surface-2 dark:bg-surface-3 px-2.5 py-1 rounded-lg">P: {protein}g</span>
        <span className="bg-surface-2 dark:bg-surface-3 px-2.5 py-1 rounded-lg">K: {carbs}g</span>
        <span className="bg-surface-2 dark:bg-surface-3 px-2.5 py-1 rounded-lg">L: {fat}g</span>
        <span className="bg-surface-2 dark:bg-surface-3 px-2.5 py-1 rounded-lg text-sage dark:text-sage-light">Rp {price.toLocaleString('id-ID')}</span>
      </div>

      {/* Social Action Footer */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-ink-2 px-1">
        <div className="flex gap-4">
          <button 
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 hover:text-twilight transition-colors p-1 rounded-lg hover:bg-surface-2 dark:hover:bg-surface-3",
              liked && "text-twilight"
            )}
          >
            <Heart className="w-5 h-5" fill={liked ? "currentColor" : "none"} />
            <span className="text-xs font-bold">{likesCount}</span>
          </button>

          <button 
            onClick={() => onShowReceipt({ foodName, calories, protein, carbs, fat, price, image: imageUrl })}
            className="flex items-center gap-1.5 hover:text-[#E8A838] transition-colors p-1 rounded-lg hover:bg-surface-2 dark:hover:bg-surface-3 text-xs font-bold"
          >
            <Award className="w-5 h-5" />
            Struk Makro
          </button>
        </div>

        <div className="flex gap-2">
          {/* Scan Toggle button */}
          <button 
            onClick={() => setIsScanning(!isScanning)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all border",
              isScanning 
                ? "bg-sage text-white border-sage shadow-glow" 
                : "bg-surface-2 hover:bg-surface-3 dark:bg-surface-3 dark:hover:bg-border/60 text-ink border-transparent"
            )}
          >
            {isScanning ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            AI Scanner
          </button>

          {/* Re-plate Button */}
          <button 
            onClick={() => setShowReplateDialog(true)}
            className="flex items-center gap-1.5 bg-twilight hover:bg-twilight-light text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Re-Plate
          </button>
        </div>
      </div>

      {/* RE-PLATE DIALOG MODAL / SLIDE-IN */}
      <AnimatePresence>
        {showReplateDialog && (
          <div className="absolute inset-0 bg-surface/95 dark:bg-surface-2/95 z-30 rounded-3xl p-6 flex flex-col justify-center items-center backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
            {replateSuccess ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center text-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-sage text-white flex items-center justify-center shadow-glow mb-2">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-editorial font-bold text-ink">Piring Tercatat! 🍽️</h3>
                <p className="text-sm text-ink-2 font-medium">Berhasil ditambahkan ke menu {selectedMealType === 'breakfast' ? 'Sarapan' : selectedMealType === 'lunch' ? 'Makan Siang' : selectedMealType === 'dinner' ? 'Makan Malam' : 'Camilan'}</p>
              </motion.div>
            ) : (
              <div className="w-full max-w-xs flex flex-col gap-4 text-center">
                <div>
                  <h3 className="text-lg font-editorial font-bold text-ink">Atur Piring Anda</h3>
                  <p className="text-xs text-ink-3 font-medium mt-1">Tambahkan menu &ldquo;{foodName}&rdquo; ke jurnal makan hari ini</p>
                </div>

                <div className="space-y-2">
                  {[
                    { type: 'breakfast', label: 'Sarapan 🌅' },
                    { type: 'lunch', label: 'Makan Siang ☀️' },
                    { type: 'dinner', label: 'Makan Malam 🌙' },
                    { type: 'snacks', label: 'Camilan 🥨' }
                  ].map((meal) => (
                    <button
                      key={meal.type}
                      onClick={() => setSelectedMealType(meal.type as any)}
                      className={cn(
                        "w-full py-2.5 px-4 rounded-xl border font-bold text-sm transition-all flex items-center justify-between",
                        selectedMealType === meal.type
                          ? "bg-sage/10 border-sage text-sage"
                          : "bg-surface-2 hover:bg-surface-3 dark:bg-surface-3 dark:hover:bg-border/50 border-transparent text-ink-2"
                      )}
                    >
                      <span>{meal.label}</span>
                      {selectedMealType === meal.type && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2.5 mt-2">
                  <button
                    onClick={() => setShowReplateDialog(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border hover:bg-surface-2 dark:hover:bg-surface-3 text-ink-2 font-bold text-xs"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleReplate}
                    className="flex-1 py-2.5 bg-twilight hover:bg-twilight-light text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Konfirmasi
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
