'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { authApi, chatApi, mealPlanApi } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles, AlertCircle, Info } from 'lucide-react'

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  createdAt?: string
}

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | undefined>(undefined)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [userSummary, setUserSummary] = useState<string>('')
  const [error, setError] = useState<string>('')
  const endRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initial load - Fetch context only once
  useEffect(() => {
    const loadContext = async () => {
      try {
        const [meRes, plans] = await Promise.all([
          authApi.me().catch(() => null),
          mealPlanApi.list().catch(() => [])
        ])

        if (!meRes) return

        const user = meRes.data || meRes
        const parts = []

        if (user.fullName) parts.push(user.fullName)
        if (user.culture) parts.push(`Budaya: ${user.culture}`)
        if (user.medicalConditions?.length > 0) parts.push(`Kondisi: ${user.medicalConditions.join(', ')}`)
        if (Array.isArray(plans) && plans.length > 0) parts.push('Meal Plan: Aktif')

        setUserSummary(parts.join(' • '))
      } catch (e) {
        console.error('Failed to load chat context', e)
      }
    }

    loadContext()
  }, []) // Empty dependency array = run once on mount

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending])

  const onSend = async () => {
    if (!canSend) return
    setError('')
    const content = input.trim()
    setInput('')

    // Optimistic UI update
    const newUserMsg: Message = { role: 'user', content }
    setMessages((prev) => [...prev, newUserMsg])
    setSending(true)

    try {
      const resp = await chatApi.sendMessage({ conversationId, message: content })
      const cid = resp?.conversationId ?? conversationId
      if (!conversationId && cid) setConversationId(cid)

      const assistantMsg: Message = {
        role: 'assistant',
        content: resp?.message ?? 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.'
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Gagal mengirim pesan. Silakan coba lagi.')
      // Remove optimistic message on failure? Or keep it and show error? 
      // Keeping it allows user to copy-paste.
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const suggestions = [
    "Buatkan meal plan rendah karbohidrat",
    "Apa makanan yang baik untuk darah tinggi?",
    "Resep sarapan sehat dan praktis",
    "Ganti menu makan siang hari ini"
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] rounded-3xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 relative">
      {/* Header */}
      <div className="px-6 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white leading-tight">Asisten AI Nutrify</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Didukung oleh Gemini Pro
            </p>
          </div>
        </div>
        {userSummary && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-300 max-w-sm truncate border border-gray-100 dark:border-gray-600">
            <Info className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{userSummary}</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth">
        {/* Welcome State */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-70">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-2">
              <Sparkles className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Apa yang bisa saya bantu?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Saya bisa membantu membuat rencana makan, menghitung gizi, atau memberikan saran kesehatan sesuai profil Anda.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); }}
                  className="text-left text-sm p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition text-gray-600 dark:text-gray-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${m.role === 'user'
              ? 'bg-emerald-500 text-white rounded-br-none'
              : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
              }`}>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0 mt-1">
                <User className="w-5 h-5" />
              </div>
            )}
          </motion.div>
        ))}
        {sending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Tanya soal nutrisi, resep, atau meal plan..."
            disabled={sending}
            className="w-full pl-5 pr-14 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
          <button
            onClick={onSend}
            disabled={!canSend}
            className="absolute right-2 p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-all shadow-md shadow-emerald-500/20 disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          AI dapat membuat kesalahan. Selalu konsultasikan masalah medis serius ke dokter.
        </p>
      </div>
    </div>
  )
}
