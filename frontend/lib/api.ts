import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if it exists in localStorage
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
        // Prevent infinite loops if already on root page
        if (window.location.pathname !== '/') {
          localStorage.removeItem('token')
          window.location.href = '/'
        }
      }
    }
    return Promise.reject(error)
  }
)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string
  password: string
  totpCode?: string
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
  heightCm?: number
  currentWeightKg?: number
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: async (data: RegisterPayload) => {
    const response = await api.post('/api/v1/auth/register', data)
    // Backend returns { success: true, data: { accessToken, ... } }
    const token = response.data.data?.accessToken || response.data.accessToken || response.data.token
    if (token) {
      localStorage.setItem('token', token)
    }
    return response.data
  },

  login: async (data: LoginPayload) => {
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

  // Returns { success: true, data: { id, email, fullName, ... } }
  me: async () => {
    const response = await api.get('/api/v1/auth/me')
    return response.data
  },

  updateProfile: async (data: {
    heightCm?: number
    currentWeightKg?: number
    dateOfBirth?: string
    religion?: string
    dietaryRestrictions?: string[]
    fullName?: string
    gender?: string
    phoneNumber?: string
  }) => {
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

// ─── Meal Plan API ────────────────────────────────────────────────────────────

export const mealPlanApi = {
  list: async () => {
    const response = await api.get('/api/v1/meal-plans')
    return response.data?.data ?? response.data
  },

  getShoppingList: async (mealPlanId: string) => {
    const response = await api.get(`/api/v1/meal-plans/${mealPlanId}/shopping-list`)
    return response.data?.data ?? response.data
  },
}

// ─── Chat API ─────────────────────────────────────────────────────────────────

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

// ─── Food Log API ─────────────────────────────────────────────────────────────

export const foodLogApi = {
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

  getByDate: async (date?: string) => {
    const response = await api.get('/api/v1/food-logs', { params: { date } })
    return response.data?.data ?? response.data
  },

  // Bug #10 Fix: Use the correct endpoint for today's logs
  getTodaySummary: async () => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const response = await api.get('/api/v1/food-logs', { params: { date: today } })
    return response.data?.data ?? response.data
  },

  getSummary: async (startDate?: string, endDate?: string) => {
    const response = await api.get('/api/v1/food-logs/summary', { params: { startDate, endDate } })
    return response.data?.data ?? response.data
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const response = await api.put(`/api/v1/food-logs/${id}`, data)
    return response.data?.data ?? response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/food-logs/${id}`)
    return response.data
  },

  updateWater: async (count: number, date?: string) => {
    const response = await api.put('/api/v1/food-logs/water', { count, date })
    return response.data?.data ?? response.data
  },

  getWater: async (date?: string) => {
    const response = await api.get('/api/v1/food-logs/water', { params: { date } })
    return response.data?.data ?? response.data
  },
}

// ─── Notification API ─────────────────────────────────────────────────────────

export const notificationApi = {
  getVapidKey: async () => {
    const response = await api.get('/api/v1/notifications/vapid-key')
    return response.data?.data ?? response.data
  },

  subscribe: async (subscription: {
    endpoint: string
    keys: { p256dh: string; auth: string }
    platform?: string
    browser?: string
  }) => {
    const response = await api.post('/api/v1/notifications/subscribe', subscription)
    return response.data?.data ?? response.data
  },

  unsubscribe: async (endpoint: string) => {
    const response = await api.delete('/api/v1/notifications/subscribe', { data: { endpoint } })
    return response.data?.data ?? response.data
  },

  getSettings: async () => {
    const response = await api.get('/api/v1/notifications/settings')
    return response.data?.data ?? response.data
  },

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

  getHistory: async (limit?: number, offset?: number) => {
    const response = await api.get('/api/v1/notifications/history', { params: { limit, offset } })
    return response.data?.data ?? response.data
  },

  sendTest: async () => {
    const response = await api.post('/api/v1/notifications/test')
    return response.data?.data ?? response.data
  },

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

// ─── Biomarker API ────────────────────────────────────────────────────────────

export const biomarkerApi = {
  getWeightHistory: async () => {
    const response = await api.get('/api/v1/biomarkers/weight/history')
    return response.data?.data ?? response.data
  },

  logWeight: async (data: { weightKg: number; date?: string }) => {
    const response = await api.post('/api/v1/biomarkers/weight', data)
    return response.data?.data ?? response.data
  },
}

// ─── Food Database API ────────────────────────────────────────────────────────

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

// ─── User Targets API ─────────────────────────────────────────────────────────

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

// ─── Transactions API ─────────────────────────────────────────────────────────

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
