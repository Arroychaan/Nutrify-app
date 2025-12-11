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
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] relative bg-gray-50/50 dark:bg-gray-900">
      {/* Header - Fixed Top */}
      <div className="fixed top-0 left-0 right-0 md:left-72 z-40 px-6 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Bot className="w-6 h-6" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white leading-tight">Nutrify Assistant</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Online</p>
            </div>
          </div>
        </div>
        {userSummary && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50">
            <Info className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[200px]">{userSummary}</span>
          </div>
        )}
      </div>

      {/* Messages Area - Adjusted for Fixed Header/Footer */}
      <div className="flex-1 overflow-y-auto pt-24 pb-24 px-4 space-y-6 scroll-smooth">
        {/* Welcome State */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full pt-10 text-center space-y-4 opacity-100">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl rotate-3 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-gray-800 rounded-xl -rotate-6 flex items-center justify-center shadow-md">
                <span className="text-xl">🥗</span>
              </div>
            </div>

            <div className="max-w-md space-y-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Halo, ada yang bisa dibantu?</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tanyakan rencana makan atau tips kesehatan.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 w-full max-w-sm px-4">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); }}
                  className="text-left text-xs p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-sm transition-all group"
                >
                  <span className="text-gray-600 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{s}</span>
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
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-auto mb-1">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${m.role === 'user'
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-none shadow-emerald-500/10'
              : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
              }`}>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </motion.div>
        ))}
        {sending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-auto mb-1">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Fixed Bottom Input Area */}
      <div className="fixed bottom-[80px] md:bottom-4 left-0 right-0 md:left-72 p-4 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 z-30">
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 mx-auto max-w-3xl px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-xl flex items-center gap-2 shadow-sm border border-red-100 dark:border-red-900/50">
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
        <div className="max-w-3xl mx-auto relative flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-gray-700">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ketik pesan..."
            disabled={sending}
            className="w-full pl-4 py-3 bg-transparent border-none focus:ring-0 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <button
            onClick={onSend}
            disabled={!canSend}
            className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-xl transition-all shadow-sm transform active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
