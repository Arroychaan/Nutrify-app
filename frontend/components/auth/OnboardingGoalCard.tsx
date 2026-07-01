import React from 'react'
import { cn } from '@/lib/utils'

interface OnboardingGoalCardProps {
  icon: string
  title: string
  description: string
  selected: boolean
  onClick: () => void
}

export function OnboardingGoalCard({ icon, title, description, selected, onClick }: OnboardingGoalCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer p-4 rounded-card transition-all duration-200 border-2",
        selected 
          ? "border-primary bg-primary-subtle" 
          : "border-border bg-bg-surface hover:border-border-strong hover:bg-bg-muted"
      )}
    >
      <div className="flex flex-col gap-2">
        <span className="text-3xl">{icon}</span>
        <div>
          <h4 className="font-semibold text-text-primary mb-1">{title}</h4>
          <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}
