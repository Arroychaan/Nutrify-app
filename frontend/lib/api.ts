import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
