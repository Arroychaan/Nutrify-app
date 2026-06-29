'use client'

import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { HydrationCard } from '@/components/dashboard/HydrationCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { StreakWidget } from '@/components/dashboard/StreakWidget'
import { TipCard } from '@/components/dashboard/TipCard'

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <DashboardHeader />

            {/* Top Section: Summary & Hydration */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2">
                    <SummaryCard />
                </div>
                <div className="lg:col-span-1">
                    <HydrationCard />
                </div>
            </div>

            {/* Middle Section: Quick Actions */}
            <QuickActions />

            {/* Bottom Section: Streak & Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2">
                    <StreakWidget />
                </div>
                <div className="lg:col-span-1">
                    <TipCard />
                </div>
            </div>
        </div>
    )
}
