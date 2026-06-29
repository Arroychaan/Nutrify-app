'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { notificationApi } from '@/lib/api'
import Toast from '@/components/Toast'
import {
  Bell,
  Clock,
  Zap,
  Target,
  Lightbulb,
  FileText,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Save,
  ChevronRight
} from 'lucide-react'

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

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const data = await notificationApi.getSettings()
      if (data && data.settings) {
        setSettings(data.settings)
        setPushEnabled(data.pushEnabled)
      }
    } catch (error) {
      console.error('Failed to load notification settings', error)
      showToast('Gagal memuat pengaturan notifikasi', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)

      if (permission !== 'granted') {
        showToast('Izin ditolak. Silakan aktifkan notifikasi di pengaturan browser Anda.', 'warning')
        return
      }

      const { publicKey } = await notificationApi.getVapidKey()
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

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
      showToast('Notifikasi push diaktifkan! 🔔', 'success')
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
      showToast('Pengaturan berhasil disimpan! ✅', 'success')
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
      showToast('Notifikasi tes terkirim! Cek perangkat Anda.', 'success')
    } catch (error) {
      console.error('Failed to send test notification', error)
      showToast('Gagal mengirim notifikasi tes', 'error')
    }
  }

  const toggleSetting = (key: keyof NotificationSettingsData) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const updateTime = (key: 'breakfastTime' | 'lunchTime' | 'dinnerTime', value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded"></div>
      </div>
    )
  }

  return (
    <>
      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={hideToast} />

      <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-emerald-500" />
              Notifikasi
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">
              Atur preferensi pemberitahuan untuk perjalanan sehatmu.
            </p>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 transition shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>

        {/* Push Notification Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative"
        >
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Smartphone className="w-48 h-48 text-emerald-500 transform rotate-12 translate-x-12 -translate-y-6" />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Notifikasi Push
                </h2>
                {permissionStatus === 'granted' && pushEnabled ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                  </span>
                ) : permissionStatus === 'denied' ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full border border-red-200">
                    <XCircle className="w-3.5 h-3.5" /> Diblokir
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                    Tidak Aktif
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                Dapatkan update real-time langsung di perangkat Anda untuk pengingat makan, motivasi streak, dan tips nutrisi harian.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {pushEnabled && (
                <button
                  onClick={sendTestNotification}
                  className="flex-1 md:flex-none px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition active:scale-95"
                >
                  Kirim Tes
                </button>
              )}
              {pushEnabled ? (
                <button
                  onClick={unsubscribeFromPush}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 font-bold rounded-xl text-sm hover:bg-red-100 transition active:scale-95"
                >
                  Nonaktifkan
                </button>
              ) : (
                <button
                  onClick={subscribeToPush}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-500 text-white font-bold rounded-xl text-sm hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" /> Aktifkan Push
                </button>
              )}
            </div>
          </div>

          {!pushSupported && (
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-start gap-4 text-amber-800 dark:text-amber-200 text-sm border border-amber-100 dark:border-amber-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Browser tidak didukung</p>
                <p>Browser Anda saat ini tidak mendukung notifikasi push web. Mohon gunakan Chrome, Firefox, atau Edge terbaru.</p>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Notification Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Preferensi Notifikasi
              </h2>
            </div>

            <div className="p-4 space-y-2">
              <SettingToggle
                label="Pengingat Makan"
                description="Ingatkan waktu sarapan, makan siang, dan malam."
                icon={<Clock className="w-5 h-5 text-emerald-500" />}
                checked={settings.mealReminders}
                onChange={() => toggleSetting('mealReminders')}
              />
              <SettingToggle
                label="Peringatan Streak"
                description="Notifikasi agar tidak lupa mencatat dan menjaga streak."
                icon={<Zap className="w-5 h-5 text-orange-500" />}
                checked={settings.streakReminders}
                onChange={() => toggleSetting('streakReminders')}
              />
              <SettingToggle
                label="Progres Mingguan"
                description="Update mingguan tentang target berat badan & kalori."
                icon={<Target className="w-5 h-5 text-purple-500" />}
                checked={settings.goalProgress}
                onChange={() => toggleSetting('goalProgress')}
              />
              <SettingToggle
                label="Tips Harian"
                description="Saran nutrisi ringan setiap pagi."
                icon={<Lightbulb className="w-5 h-5 text-yellow-500" />}
                checked={settings.dailyTips}
                onChange={() => toggleSetting('dailyTips')}
              />
              <SettingToggle
                label="Laporan Aktivitas"
                description="Ringkasan mingguan aktivitas dan nutrisi Anda."
                icon={<FileText className="w-5 h-5 text-blue-500" />}
                checked={settings.weeklyReport}
                onChange={() => toggleSetting('weeklyReport')}
              />
            </div>
          </motion.div>

          {/* Meal Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm h-fit self-start transition-all duration-300 ${!settings.mealReminders ? 'opacity-60 pointer-events-none grayscale-[0.5]' : ''}`}
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Jadwal Makan
              </h2>
              {!settings.mealReminders && (
                <span className="text-[10px] font-bold text-white bg-gray-400 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Off
                </span>
              )}
            </div>

            <div className="p-6 space-y-6 relative">
              {/* Timeline Line */}
              <div className="absolute left-[34px] top-10 bottom-10 w-0.5 bg-gray-100 dark:bg-gray-700 -z-10 bg-gradient-to-b from-emerald-100 via-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-900/10"></div>

              <TimeInput
                label="Sarapan"
                value={settings.breakfastTime}
                onChange={(value) => updateTime('breakfastTime', value)}
                icon="🌅"
                color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
              />
              <TimeInput
                label="Makan Siang"
                value={settings.lunchTime}
                onChange={(value) => updateTime('lunchTime', value)}
                icon="☀️"
                color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
              />
              <TimeInput
                label="Makan Malam"
                value={settings.dinnerTime}
                onChange={(value) => updateTime('dinnerTime', value)}
                icon="🌙"
                color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
              />
            </div>

            <div className="px-6 pb-6 pt-2">
              <p className="text-xs text-gray-400 text-center italic">
                Notifikasi akan dikirim tepat pada waktu yang ditentukan.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

// ------ Helper Components ------

function SettingToggle({
  label,
  description,
  icon,
  checked,
  onChange,
}: {
  label: string
  description: string
  icon: React.ReactNode
  checked: boolean
  onChange: () => void
}) {
  return (
    <div
      onClick={onChange}
      className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
    >
      <div className={`mt-0.5 p-2.5 rounded-xl transition-colors ${checked ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 group-hover:bg-white dark:group-hover:bg-gray-700'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">{label}</p>
          <div
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-600'}`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-[90%]">{description}</p>
      </div>
    </div>
  )
}

function TimeInput({
  label,
  value,
  onChange,
  icon,
  color
}: {
  label: string
  value: string
  onChange: (value: string) => void
  icon: string
  color: string
}) {
  return (
    <div className="relative z-10 flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 flex items-center justify-center rounded-xl text-lg ${color}`}>
          {icon}
        </div>
        <span className="font-bold text-gray-700 dark:text-gray-200 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{label}</span>
      </div>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer"
      />
    </div>
  )
}

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

function getBrowserName(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const userAgent = navigator.userAgent
  if (userAgent.includes('Chrome')) return 'chrome'
  if (userAgent.includes('Firefox')) return 'firefox'
  if (userAgent.includes('Safari')) return 'safari'
  if (userAgent.includes('Edge')) return 'edge'
  return 'unknown'
}
