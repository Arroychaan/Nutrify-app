'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { authApi, chatApi, mealPlanApi } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, Sparkles, AlertCircle, Info, History, Plus, MessageSquare, ChevronLeft, Menu, Trash2, PanelLeft } from 'lucide-react'
import Toast from '@/components/Toast'
import ConfirmationModal from '@/components/ui/ConfirmationModal'

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  createdAt?: string
}

interface Conversation {
  id: string
  topic: string
  lastMessage: string
  updatedAt: string
}

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | undefined>(undefined)
  const [messages, setMessages] = useState<Message[]>([])
  const [history, setHistory] = useState<Conversation[]>([])
  const [showHistory, setShowHistory] = useState(false) // Mobile drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true) // Desktop sidebar state
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [userSummary, setUserSummary] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as any })
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null })
  const [isDeleting, setIsDeleting] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initial load - Fetch context and history
  useEffect(() => {
    const loadData = async () => {
      try {
        const [meRes, historyRes] = await Promise.all([
          authApi.me().catch(() => null),
          chatApi.getHistory().catch(() => ({ conversations: [] }))
        ])

        if (meRes) {
          const user = meRes.data || meRes
          const parts = []
          if (user.fullName) parts.push(user.fullName)
          if (user.culture) parts.push(user.culture)
          setUserSummary(parts.join(' • '))
        }

        if (historyRes && historyRes.conversations) {
          setHistory(historyRes.conversations)
        }
      } catch (e) {
        console.error('Failed to load chat data', e)
      }
    }
    loadData()
  }, [])

  const handleLoadConversation = async (id: string) => {
    setConversationId(id)
    setShowHistory(false)
    try {
      const res = await chatApi.getConversation(id)
      setMessages(res.messages)
    } catch (e) {
      console.error('Failed to load conversation', e)
    }
  }

  const handleNewChat = () => {
    setConversationId(undefined)
    setMessages([])
    setShowHistory(false)
  }

  const handleOpenDeleteModal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteModal({ isOpen: true, id })
  }

  const confirmDelete = async () => {
    if (!deleteModal.id) return
    setIsDeleting(true)
    try {
      await chatApi.deleteConversation(deleteModal.id)
      setHistory(prev => prev.filter(c => c.id !== deleteModal.id))
      if (conversationId === deleteModal.id) {
        handleNewChat()
      }
      setToast({ isVisible: true, message: 'Percakapan dihapus', type: 'success' })
      setDeleteModal({ isOpen: false, id: null })
    } catch (error) {
      console.error('Failed to delete', error)
      setToast({ isVisible: true, message: 'Gagal menghapus percakapan', type: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

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
      const cid = resp?.conversationId

      if (!conversationId && cid) {
        setConversationId(cid)
        // Refresh history to show new chat title
        const historyRes = await chatApi.getHistory()
        if (historyRes?.conversations) setHistory(historyRes.conversations)
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: resp?.message ?? 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.'
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Gagal mengirim pesan.')
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
    "Buatkan meal plan defisit kalori",
    "Makanan pengganti nasi apa saja?",
    "Tips mengurangi gula harian",
    "Cemilan sehat untuk malam hari"
  ]

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] relative bg-gray-50/50 dark:bg-gray-900 overflow-hidden">

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        title="Hapus Percakapan"
        description="Apakah Anda yakin ingin menghapus percakapan ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* HISTORY SIDEBAR */}
      <AnimatePresence>
        {/* Mobile Drawer */}
        {showHistory && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col shadow-2xl md:hidden"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Riwayat Chat</h2>
              <button onClick={() => setShowHistory(false)} className="p-1 text-gray-500"><ChevronLeft /></button>
            </div>
            <SidebarContent
              history={history}
              conversationId={conversationId}
              onNewChat={handleNewChat}
              onSelect={handleLoadConversation}
              onDelete={handleOpenDeleteModal}
            />
          </motion.div>
        )}

        {/* Desktop Sidebar (Collapsible) */}
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden md:flex flex-col w-72 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex-shrink-0"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Riwayat Chat</h2>
            </div>
            <SidebarContent
              history={history}
              conversationId={conversationId}
              onNewChat={handleNewChat}
              onSelect={handleLoadConversation}
              onDelete={handleOpenDeleteModal}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE OVERLAY */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowHistory(false)} />
      )}

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full relative w-full min-w-0">

        {/* HEADER */}
        <div className="h-16 px-4 md:px-6 flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button onClick={() => setShowHistory(true)} className="md:hidden p-2 -ml-2 text-gray-600">
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" title="AI Ready"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">Nutrify AI</h1>
              {userSummary && <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px] md:max-w-xs">{userSummary}</span>}
            </div>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth pb-32">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-100 mt-[-50px]">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl rotate-3 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="max-w-md space-y-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ada yang bisa dibantu?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tanyakan rencana makan, kandungan nutrisi, atau tips kesehatan yang disesuaikan untukmu.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(s)}
                    className="text-left text-xs p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all group"
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
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${m.role === 'user'
                ? 'bg-emerald-500 text-white rounded-br-none shadow-emerald-500/10'
                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                }`}>
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>
              </div>
            </motion.div>
          ))}

          {sending && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* INPUT AREA */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-gray-900 dark:via-gray-900/90">
          <div className="max-w-3xl mx-auto flex items-center gap-2 bg-white dark:bg-gray-800 p-2 pl-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ketik pesan..."
              disabled={sending}
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
            />
            <button
              onClick={onSend}
              disabled={!canSend}
              className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-300 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {error && <p className="text-center text-xs text-red-500 mt-2">{error}</p>}
        </div>

      </div>
    </div>
  )
}

function SidebarContent({ history, conversationId, onNewChat, onSelect, onDelete }: any) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 justify-center py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-emerald-500/20 shadow-lg"
        >
          <Plus className="w-5 h-5" /> Chat Baru
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {history.length === 0 ? (
          <p className="text-center text-xs text-gray-400 mt-10">Belum ada riwayat</p>
        ) : (
          history.map((conv: Conversation) => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`group w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all cursor-pointer ${conversationId === conv.id ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'} border border-transparent`}
            >
              <div className="min-w-0 flex-1 mr-2">
                <p className={`font-medium truncate ${conversationId === conv.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {conv.topic === 'nutrition_education' ? 'Percakapan Baru' : (conv.topic || 'Percakapan Baru')}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage || '...'}</p>
              </div>
              <button
                onClick={(e) => onDelete(conv.id, e)}
                className={`p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ${conversationId === conv.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                title="Hapus percakapan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

