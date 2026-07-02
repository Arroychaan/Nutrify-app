import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if exists
// Add token to requests if exists
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Add response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, clear token and redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Prevent infinite loops if already on auth pages
        if (!window.location.pathname.startsWith('/auth/')) {
          localStorage.removeItem('token')
          window.location.href = '/auth/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: async (data: {
    email: string
    password: string
    fullName: string
    heightCm?: number
    currentWeightKg?: number
  }) => {
    const response = await api.post('/api/v1/auth/register', data)
    // Backend returns { success: true, data: { accessToken, ... } }
    const token = response.data.data?.accessToken || response.data.accessToken || response.data.token
    if (token) {
      localStorage.setItem('token', token)
    }
    return response.data
  },

  login: async (data: any) => {
    const response = await api.post('/api/v1/auth/login', data)
    // Backend returns { success: true, data: { accessToken, ... } }
    const token = response.data.data?.accessToken || response.data.accessToken || response.data.token
    if (token) {
      localStorage.setItem('token', token)
    }
    return response.data
  },

  generate2FA: async () => {
    const response = await api.post('/api/v1/auth/2fa/generate')
    return response.data?.data
  },

  verify2FA: async (token: string) => {
    const response = await api.post('/api/v1/auth/2fa/verify', { token })
    return response.data
  },

  disable2FA: async (password: string) => {
    const response = await api.post('/api/v1/auth/2fa/disable', { password })
    return response.data
  },

  restore: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/v1/auth/restore', data)
    const token = response.data.data?.accessToken || response.data.accessToken || response.data.token
    if (token) {
      localStorage.setItem('token', token)
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
  },

  me: async () => {
    const response = await api.get('/api/v1/auth/me')
    return response.data
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/api/v1/auth/profile', data)
    return response.data
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/api/v1/auth/password', { currentPassword, newPassword })
    return response.data
  },

  deleteAccount: async () => {
    const response = await api.delete('/api/v1/auth/account')
    return response.data
  },

  verifyEmail: async (token: string) => {
    const response = await api.get('/api/v1/auth/verify-email', { params: { token } })
    return response.data
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/api/v1/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/api/v1/auth/reset-password', { token, newPassword })
    return response.data
  },
}

// Meal Plan API
export const mealPlanApi = {
  list: async () => {
    const response = await api.get('/api/v1/meal-plans')
    // Backend typically returns { success, data: [...] }
    return response.data?.data ?? response.data
  },

  getShoppingList: async (mealPlanId: string) => {
    const response = await api.get(`/api/v1/meal-plans/${mealPlanId}/shopping-list`)
    return response.data?.data ?? response.data
  },
}

// Chat API
export const chatApi = {
  sendMessage: async (payload: { conversationId?: string; message: string }) => {
    const response = await api.post('/api/v1/chat/messages', payload)
    return response.data?.data ?? response.data
  },

  getHistory: async () => {
    const response = await api.get('/api/v1/chat/conversations')
    return response.data?.data ?? response.data
  },

  getConversation: async (id: string) => {
    const response = await api.get(`/api/v1/chat/conversations/${id}`)
    return response.data?.data ?? response.data
  },

  deleteConversation: async (id: string) => {
    const response = await api.delete(`/api/v1/chat/conversations/${id}`)
    return response.data
  },
}

// Food Log API
export const foodLogApi = {
  // Create new food log
  create: async (data: {
    mealType: string
    foodName: string
    portion?: string
    notes?: string
    calories?: number
    proteinG?: number
    carbsG?: number
    fatG?: number
  }) => {
    const response = await api.post('/api/v1/food-logs', data)
    return response.data?.data ?? response.data
  },

  // Get food logs by date
  getByDate: async (date?: string) => {
    const response = await api.get('/api/v1/food-logs', { params: { date } })
    return response.data?.data ?? response.data
  },

  // Get today's summary
  getTodaySummary: async () => {
    const now = new Date()
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)

    const response = await api.get('/api/v1/food-logs/today', {
      params: {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      }
    })
    return response.data?.data ?? response.data
  },

  // Get summary for date range
  getSummary: async (startDate?: string, endDate?: string) => {
    const response = await api.get('/api/v1/food-logs/summary', { params: { startDate, endDate } })
    return response.data?.data ?? response.data
  },

  // Update food log
  update: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/food-logs/${id}`, data)
    return response.data?.data ?? response.data
  },

  // Delete food log
  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/food-logs/${id}`)
    return response.data
  },

  // Water Tracking
  updateWater: async (count: number, date?: string) => {
    const response = await api.put('/api/v1/food-logs/water', { count, date })
    return response.data?.data ?? response.data
  },

  getWater: async (date?: string) => {
    const response = await api.get('/api/v1/food-logs/water', { params: { date } })
    return response.data?.data ?? response.data
  },
}

// Notification API
export const notificationApi = {
  // Get VAPID public key
  getVapidKey: async () => {
    const response = await api.get('/api/v1/notifications/vapid-key')
    return response.data?.data ?? response.data
  },

  // Subscribe to push notifications
  subscribe: async (subscription: {
    endpoint: string
    keys: { p256dh: string; auth: string }
    platform?: string
    browser?: string
  }) => {
    const response = await api.post('/api/v1/notifications/subscribe', subscription)
    return response.data?.data ?? response.data
  },

  // Unsubscribe from push notifications
  unsubscribe: async (endpoint: string) => {
    const response = await api.delete('/api/v1/notifications/subscribe', { data: { endpoint } })
    return response.data?.data ?? response.data
  },

  // Get notification settings
  getSettings: async () => {
    const response = await api.get('/api/v1/notifications/settings')
    return response.data?.data ?? response.data
  },

  // Update notification settings
  updateSettings: async (settings: {
    mealReminders?: boolean
    streakReminders?: boolean
    goalProgress?: boolean
    dailyTips?: boolean
    weeklyReport?: boolean
    breakfastTime?: string
    lunchTime?: string
    dinnerTime?: string
  }) => {
    const response = await api.put('/api/v1/notifications/settings', settings)
    return response.data?.data ?? response.data
  },

  // Get notification history
  getHistory: async (limit?: number, offset?: number) => {
    const response = await api.get('/api/v1/notifications/history', { params: { limit, offset } })
    return response.data?.data ?? response.data
  },

  // Send test notification
  sendTest: async () => {
    const response = await api.post('/api/v1/notifications/test')
    return response.data?.data ?? response.data
  },

  // In-App Notifications
  getAll: async (params?: { limit?: number; unreadOnly?: boolean }) => {
    const response = await api.get('/api/v1/notifications', { params })
    return response.data?.data ?? response.data
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/api/v1/notifications/${id}/read`)
    return response.data
  },

  markAllAsRead: async () => {
    const response = await api.put('/api/v1/notifications/read-all')
    return response.data
  },
}

// Biomarker API
export const biomarkerApi = {
  getWeightHistory: async () => {
    // Returns { success: true, data: [{id, weightKg, recordedAt}, ...] }
    const response = await api.get('/api/v1/biomarkers/weight/history')
    return response.data?.data ?? response.data
  },

  logWeight: async (data: { weightKg: number; date?: string }) => {
    const response = await api.post('/api/v1/biomarkers/weight', data)
    return response.data?.data ?? response.data
  },
}

// Food Database API
export const foodApi = {
  search: async (params: { q?: string; category?: string; limit?: number; offset?: number }) => {
    const response = await api.get('/api/v1/foods/search', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/v1/foods/${id}`)
    return response.data?.data ?? response.data
  },
}

// User Targets API
export const userTargetsApi = {
  get: async () => {
    const response = await api.get('/api/v1/user-targets')
    return response.data?.data ?? response.data
  },

  update: async (data: { dailyCalorieTarget?: number; dailyBudget?: number }) => {
    const response = await api.put('/api/v1/user-targets', data)
    return response.data?.data ?? response.data
  },
}

// Transactions API
export const transactionsApi = {
  getAll: async () => {
    const response = await api.get('/api/v1/transactions')
    return response.data?.data ?? response.data
  },

  getToday: async () => {
    const response = await api.get('/api/v1/transactions/today')
    return response.data?.data ?? response.data
  },

  create: async (data: { name: string; amount: number; category: string }) => {
    const response = await api.post('/api/v1/transactions', data)
    return response.data?.data ?? response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/transactions/${id}`)
    return response.data
  },
}
