'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Language, t as translate } from './translations'

type Theme = 'light' | 'dark' | 'system'
type Units = 'metric' | 'imperial'

interface AppSettings {
  language: Language
  theme: Theme
  units: Units
}

interface AppContextType {
  // Settings
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => void

  // Theme
  isDarkMode: boolean

  // Translation helper
  t: (key: string) => string

  // Units conversion helpers
  formatWeight: (kg: number) => string
  formatHeight: (cm: number) => string
  parseWeight: (value: number) => number // converts to kg
  parseHeight: (value: number) => number // converts to cm
}

const defaultSettings: AppSettings = {
  language: 'id',
  theme: 'light',
  units: 'metric',
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (e) {
        console.error('Failed to parse app settings', e)
      }
    }
  }, [])

  // Apply theme changes
  useEffect(() => {
    if (!mounted) return

    const applyTheme = (dark: boolean) => {
      setIsDarkMode(dark)
      if (dark) {
        document.documentElement.classList.add('dark')
        document.documentElement.style.colorScheme = 'dark'
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.style.colorScheme = 'light'
      }
    }

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mediaQuery.matches)

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      applyTheme(settings.theme === 'dark')
    }
  }, [settings.theme, mounted])

  // Apply language changes
  useEffect(() => {
    if (!mounted) return
    document.documentElement.lang = settings.language
  }, [settings.language, mounted])

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem('appSettings', JSON.stringify(updated))
      return updated
    })
  }

  // Translation helper bound to current language
  const t = (key: string): string => {
    return translate(key, settings.language)
  }

  // Unit conversion helpers
  const formatWeight = (kg: number): string => {
    if (settings.units === 'imperial') {
      const lb = kg * 2.20462
      return `${lb.toFixed(1)} lb`
    }
    return `${kg.toFixed(1)} kg`
  }

  const formatHeight = (cm: number): string => {
    if (settings.units === 'imperial') {
      const totalInches = cm / 2.54
      const feet = Math.floor(totalInches / 12)
      const inches = Math.round(totalInches % 12)
      return `${feet}'${inches}"`
    }
    return `${cm.toFixed(0)} cm`
  }

  const parseWeight = (value: number): number => {
    if (settings.units === 'imperial') {
      return value / 2.20462 // lb to kg
    }
    return value
  }

  const parseHeight = (value: number): number => {
    if (settings.units === 'imperial') {
      return value * 2.54 // inches to cm
    }
    return value
  }



  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        isDarkMode,
        t,
        formatWeight,
        formatHeight,
        parseWeight,
        parseHeight,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Hook for just getting settings without the full context
export function useSettings() {
  const { settings, updateSettings } = useApp()
  return { settings, updateSettings }
}

// Hook for just translations
export function useTranslation() {
  const { t, settings } = useApp()
  return { t, language: settings.language }
}

// Hook for theme
export function useTheme() {
  const { isDarkMode, settings, updateSettings } = useApp()
  return {
    isDarkMode,
    theme: settings.theme,
    setTheme: (theme: Theme) => updateSettings({ theme }),
  }
}
