'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { notificationApi } from '@/lib/api'
import Toast from '@/components/Toast'

interface NotificationSettingsData {
  mealReminders: boolean
  streakReminders: boolean
  goalProgress: boolean
  dailyTips: boolean
  weeklyReport: boolean
  breakfastTime: string
  lunchTime: string
  dinnerTime: string
}

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default')
  const [settings, setSettings] = useState<NotificationSettingsData>({
    mealReminders: true,
    streakReminders: true,
    goalProgress: true,
    dailyTips: true,
    weeklyReport: true,
    breakfastTime: '07:00',
    lunchTime: '12:00',
    dinnerTime: '19:00',
  })
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' })

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ isVisible: true, message, type })
  }

  const hideToast = () => setToast({ ...toast, isVisible: false })

  // Check if push notifications are supported
  useEffect(() => {
    const checkPushSupport = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setPushSupported(true)
        
        // Check current permission
        if ('Notification' in window) {
          setPermissionStatus(Notification.permission)
        }
      } else {
        setPushSupported(false)
        setPermissionStatus('unsupported')
      }
    }

    checkPushSupport()
  }, [])

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        const data = await notificationApi.getSettings()
        setSettings(data.settings)
        setPushEnabled(data.pushEnabled)
      } catch (error) {
        console.error('Failed to load notification settings', error)
        showToast('Gagal memuat pengaturan notifikasi', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)

      if (permission !== 'granted') {
        showToast('Izin notifikasi ditolak. Aktifkan di pengaturan browser.', 'warning')
        return
      }

      // Get VAPID public key
      const { publicKey } = await notificationApi.getVapidKey()

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      // Send subscription to server
      const subscriptionJson = subscription.toJSON()
      await notificationApi.subscribe({
        endpoint: subscriptionJson.endpoint!,
        keys: {
          p256dh: subscriptionJson.keys!.p256dh,
          auth: subscriptionJson.keys!.auth,
        },
        platform: 'web',
        browser: getBrowserName(),
      })

      setPushEnabled(true)
      showToast('Notifikasi push berhasil diaktifkan! 🔔', 'success')
    } catch (error: any) {
      console.error('Failed to subscribe to push', error)
      showToast(error.message || 'Gagal mengaktifkan notifikasi push', 'error')
    }
  }, [])

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        await notificationApi.unsubscribe(subscription.endpoint)
      }

      setPushEnabled(false)
      showToast('Notifikasi push dinonaktifkan', 'info')
    } catch (error) {
      console.error('Failed to unsubscribe from push', error)
      showToast('Gagal menonaktifkan notifikasi push', 'error')
    }
  }, [])

  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true)
      await notificationApi.updateSettings(settings)
      showToast('Pengaturan notifikasi tersimpan! ✅', 'success')
    } catch (error) {
      console.error('Failed to save settings', error)
      showToast('Gagal menyimpan pengaturan', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Send test notification
  const sendTestNotification = async () => {
    try {
      await notificationApi.sendTest()
      showToast('Notifikasi test dikirim! Cek notifikasi kamu.', 'success')
    } catch (error) {
      console.error('Failed to send test notification', error)
      showToast('Gagal mengirim notifikasi test', 'error')
    }
  }

  // Toggle setting
  const toggleSetting = (key: keyof NotificationSettingsData) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Update time setting
  const updateTime = (key: 'breakfastTime' | 'lunchTime' | 'dinnerTime', value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#24B47E]"></div>
      </div>
    )
  }

  return (
    <>
      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={hideToast} />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔔 Pengaturan Notifikasi</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Atur reminder dan notifikasi untuk membantu journey sehatmu
          </p>
        </div>

        {/* Push Notification Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Push Notification</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Terima notifikasi langsung di browser/device kamu
              </p>
            </div>
            <div className="flex items-center gap-2">
              {permissionStatus === 'granted' && pushEnabled ? (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  Aktif ✓
                </span>
              ) : permissionStatus === 'denied' ? (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                  Diblokir
                </span>
              ) : (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                  Nonaktif
                </span>
              )}
            </div>
          </div>

          {!pushSupported ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                ⚠️ Browser kamu tidak mendukung push notification. Coba gunakan Chrome atau Firefox.
              </p>
            </div>
          ) : permissionStatus === 'denied' ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">
                ❌ Izin notifikasi diblokir. Untuk mengaktifkan, buka pengaturan browser dan izinkan notifikasi untuk situs ini.
              </p>
            </div>
          ) : (
            <div className="flex gap-3">
              {pushEnabled ? (
                <>
                  <button
                    onClick={sendTestNotification}
                    className="flex-1 px-4 py-2 bg-[#24B47E] text-white rounded-lg font-medium hover:bg-[#1a8a5e] transition-colors"
                  >
                    🧪 Kirim Test
                  </button>
                  <button
                    onClick={unsubscribeFromPush}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Nonaktifkan
                  </button>
                </>
              ) : (
                <button
                  onClick={subscribeToPush}
                  className="w-full px-4 py-3 bg-[#24B47E] text-white rounded-lg font-medium hover:bg-[#1a8a5e] transition-colors"
                >
                  🔔 Aktifkan Push Notification
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Notification Types Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Jenis Notifikasi</h2>

          <div className="space-y-4">
            {/* Meal Reminders */}
            <SettingToggle
              label="🍽️ Reminder Makan"
              description="Ingatkan waktu sarapan, makan siang, dan makan malam"
              checked={settings.mealReminders}
              onChange={() => toggleSetting('mealReminders')}
            />

            {/* Streak Reminders */}
            <SettingToggle
              label="🔥 Reminder Streak"
              description="Ingatkan untuk log makanan agar streak tidak putus"
              checked={settings.streakReminders}
              onChange={() => toggleSetting('streakReminders')}
            />

            {/* Goal Progress */}
            <SettingToggle
              label="🎯 Progress Goal"
              description="Update progress menuju target kalori/berat badan"
              checked={settings.goalProgress}
              onChange={() => toggleSetting('goalProgress')}
            />

            {/* Daily Tips */}
            <SettingToggle
              label="💡 Tips Harian"
              description="Tips nutrisi dan kesehatan setiap hari"
              checked={settings.dailyTips}
              onChange={() => toggleSetting('dailyTips')}
            />

            {/* Weekly Report */}
            <SettingToggle
              label="📊 Laporan Mingguan"
              description="Rangkuman nutrisi dan progress setiap minggu"
              checked={settings.weeklyReport}
              onChange={() => toggleSetting('weeklyReport')}
            />
          </div>
        </motion.div>

        {/* Meal Times Card */}
        {settings.mealReminders && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Jadwal Reminder Makan</h2>

            <div className="space-y-4">
              <TimeInput
                label="🌅 Sarapan"
                value={settings.breakfastTime}
                onChange={(value) => updateTime('breakfastTime', value)}
              />

              <TimeInput
                label="☀️ Makan Siang"
                value={settings.lunchTime}
                onChange={(value) => updateTime('lunchTime', value)}
              />

              <TimeInput
                label="🌙 Makan Malam"
                value={settings.dinnerTime}
                onChange={(value) => updateTime('dinnerTime', value)}
              />
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full py-3 bg-[#24B47E] text-white rounded-xl font-semibold hover:bg-[#1a8a5e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Menyimpan...' : '💾 Simpan Pengaturan'}
          </button>
        </motion.div>
      </div>
    </>
  )
}

// Toggle Component
function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-[#24B47E]' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

// Time Input Component
function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-900 dark:text-white">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#24B47E] focus:border-transparent"
      />
    </div>
  )
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray as Uint8Array<ArrayBuffer>
}

// Helper function to get browser name
function getBrowserName(): string {
  const userAgent = navigator.userAgent
  if (userAgent.includes('Chrome')) return 'chrome'
  if (userAgent.includes('Firefox')) return 'firefox'
  if (userAgent.includes('Safari')) return 'safari'
  if (userAgent.includes('Edge')) return 'edge'
  return 'unknown'
}
