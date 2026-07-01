import React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface StepProgressProps {
  currentStep: number
  steps: string[]
}

export function StepProgress({ currentStep, steps }: StepProgressProps) {
  const totalSteps = steps.length
  return (
    <div className="w-full flex items-center justify-between relative mb-12">
      {/* Background Line */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-border -z-10" />
      
      {/* Active Line */}
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary -z-10 transition-all duration-500 ease-in-out" 
        style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
      />
      
      {steps.map((label, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isUpcoming = stepNum > currentStep

        return (
          <div key={label} className="flex flex-col items-center gap-2 bg-bg-base px-2">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors duration-300",
              isCompleted ? "bg-primary text-white" :
              isActive ? "bg-primary text-white" :
              "bg-bg-base border-2 border-border text-border-strong"
            )}>
              {isCompleted ? <Check className="w-3.5 h-3.5" /> : isActive ? <div className="w-2 h-2 bg-white rounded-full" /> : null}
            </div>
            <span className={cn(
              "text-caption absolute top-8 font-medium transition-colors",
              isCompleted || isActive ? "text-text-primary" : "text-text-muted"
            )}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
