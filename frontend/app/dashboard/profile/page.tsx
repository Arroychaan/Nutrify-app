'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Redirect halaman profil ke halaman settings/profile
 * Untuk menghindari duplikasi dan kebingungan user
 */
export default function ProfileRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect ke halaman profil yang konsisten
    router.replace('/dashboard/settings/profile')
  }, [router])

  // Loading state sementara redirect
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full" />
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  )
}
