import React from 'react'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { DashboardNavbar } from '@/components/layout/DashboardNavbar'
import { ClientStoreInit } from '@/components/layout/ClientStoreInit'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg-base font-body text-text-primary selection:bg-sage/30">
      <ClientStoreInit />
      {/* Desktop Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Navbar */}
        <DashboardNavbar />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth pb-28 lg:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  )
}
