'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Droplet, Plus, Minus } from 'lucide-react'

export function HydrationCard() {
  const [glasses, setGlasses] = useState(3)
  const target = 8

  return (
    <Card className="p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#DBEAFE] rounded-full text-[#3B82F6]">
            <Droplet className="w-5 h-5" />
          </div>
          <h3 className="font-display text-heading-3 text-text-primary">Hidrasi</h3>
        </div>
        <p className="text-body-sm text-text-secondary mb-6">Target: {target} gelas (2L)</p>
      </div>

      <div className="flex flex-col items-center">
        <div className="text-display-md font-bold text-text-primary mb-1">{glasses}</div>
        <div className="text-caption text-text-muted mb-6">Gelas diminum</div>

        <div className="flex items-center gap-4 w-full">
          <Button 
            variant="secondary" 
            size="sm" 
            className="rounded-full w-10 h-10 p-0 shrink-0" 
            onClick={() => setGlasses(Math.max(0, glasses - 1))}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <div className="flex-1 flex justify-center gap-1">
            {Array.from({ length: target }).map((_, i) => (
              <div 
                key={i} 
                className={`w-2.5 h-8 rounded-full transition-colors ${i < glasses ? 'bg-[#3B82F6]' : 'bg-bg-muted'}`}
              />
            ))}
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            className="rounded-full w-10 h-10 p-0 shrink-0" 
            onClick={() => setGlasses(Math.min(target, glasses + 1))}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
