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
    heightCm: number
    currentWeightKg: number
  }) => {
    const response = await api.post('/api/v1/auth/register', data)
    // Backend returns { success: true, data: { accessToken, ... } }
    const token = response.data.data?.accessToken || response.data.accessToken || response.data.token
    if (token) {
      localStorage.setItem('token', token)
    }
    return response.data
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/v1/auth/login', data)
    // Backend returns { success: true, data: { accessToken, ... } }
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
}

// Meal Plan API
export const mealPlanApi = {
  list: async () => {
    const response = await api.get('/api/v1/meal-plans')
    // Backend typically returns { success, data: [...] }
    return response.data?.data ?? response.data
  },
}

// Chat API
export const chatApi = {
  sendMessage: async (payload: { conversationId?: string; message: string }) => {
    const response = await api.post('/api/v1/chat/messages', payload)
    return response.data?.data ?? response.data
  },
  listConversations: async (params?: { page?: number; pageSize?: number }) => {
    const response = await api.get('/api/v1/chat/conversations', { params })
    return response.data?.data ?? response.data
  },
  getConversation: async (conversationId: string) => {
    const response = await api.get(`/api/v1/chat/conversations/${conversationId}`)
    return response.data?.data ?? response.data
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
    const response = await api.get('/api/v1/food-logs/today')
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
}
