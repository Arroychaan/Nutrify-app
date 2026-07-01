'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Sparkles, Send, Leaf, ArrowDown } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const mockResponses = [
  "Berdasarkan profil kalori Anda, saya sarankan mencoba ikan bakar laut dengan sambal dabu-dabu. Sangat tinggi protein, kaya omega-3, dan rendah lemak jahat.",
  "Tentu! Untuk anggaran Rp 25.000, Anda bisa mendapatkan gado-gado komplit dengan telur rebus. Pastikan bumbu kacangnya dipisah agar Anda bisa mengontrol kalori.",
  "Menurut catatan hari ini, Anda masih kekurangan 30g protein. Mari tambahkan dada ayam fillet atau tempe mendoan (panggang) di menu makan malam nanti.",
  "Saya menganalisis pola makan Anda minggu ini. Keren sekali! Anda berhasil mempertahankan streak 12 hari bebas minuman manis. Pertahankan ya, Budi!"
]

export default function AINutrisiPage() {
  const store = useAppStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Halo ${store.fullName}! Saya AI Nutritionist pribadimu. Berdasarkan target ${store.dailyCalorieTarget} kkal kamu hari ini, apa yang ingin kita rencanakan?`
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const simulateAIResponse = () => {
    setIsTyping(true)
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
    
    setTimeout(() => {
      setIsTyping(false)
      const newMessageId = Date.now().toString()
      setMessages(prev => [...prev, { id: newMessageId, role: 'assistant', content: '', isStreaming: true }])
      
      let i = 0
      const words = randomResponse.split(' ')
      
      const interval = setInterval(() => {
        if (i < words.length) {
          setMessages(prev => prev.map(msg => {
            if (msg.id === newMessageId) {
              return { ...msg, content: msg.content + (i === 0 ? '' : ' ') + words[i] }
            }
            return msg
          }))
          i++
          scrollToBottom()
        } else {
          clearInterval(interval)
          setMessages(prev => prev.map(msg => msg.id === newMessageId ? { ...msg, isStreaming: false } : msg))
        }
      }, 70) // Streaming speed
      
    }, 1200) // Initial delay to "think"
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    simulateAIResponse()
  }

  const handleChipClick = (text: string) => {
    if (isTyping) return
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    simulateAIResponse()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative pb-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-editorial font-bold text-ink mb-1">AI Konsultan</h1>
          <div className="bg-sage/10 text-sage border border-sage/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mt-1 shadow-sm">
            Tersambung
          </div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col bg-white border border-border/50 overflow-hidden relative shadow-sm">
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide">
          <div className="text-center pb-4">
            <span className="text-[10px] font-bold text-ink-3 uppercase tracking-widest bg-surface-2 px-4 py-1.5 rounded-full border border-border/50">Sesi Terenkripsi End-to-End</span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-sage-muted flex items-center justify-center shrink-0 border border-border/50 shadow-sm relative overflow-hidden">
                  <Leaf className="w-4 h-4 text-ink relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/30" />
                </div>
              )}
              
              <div className={`p-4 rounded-2xl max-w-[85%] sm:max-w-[75%] ${
                msg.role === 'user' 
                  ? 'bg-ink text-white rounded-tr-none shadow-md' 
                  : 'bg-surface-2 text-ink rounded-tl-none border border-border/50'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                  {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-sage animate-pulse align-middle" />}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-sage-muted flex items-center justify-center shrink-0 border border-border/50">
                <Leaf className="w-4 h-4 text-ink" />
              </div>
              <div className="bg-surface-2 p-4 rounded-2xl rounded-tl-none border border-border/50 flex items-center gap-1.5 h-12 w-20">
                <div className="w-1.5 h-1.5 bg-ink-3 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-ink-3 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-ink-3 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border/50 bg-white">
          <div className="flex gap-2 overflow-x-auto mb-4 pb-2 snap-x scrollbar-hide">
            {['Analisis asupan hari ini', 'Resep dada ayam murah', 'Pengganti nasi putih', 'Ide menu sarapan 300 kkal'].map((chip, idx) => (
              <button 
                key={idx} 
                onClick={() => handleChipClick(chip)}
                disabled={isTyping}
                className="snap-start whitespace-nowrap bg-surface-2 hover:bg-sage hover:text-white text-ink-2 text-xs px-4 py-2 rounded-full font-bold transition-all border border-border/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {chip}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
                placeholder="Tanya apapun seputar nutrisi, diet, atau resep..." 
                className="w-full bg-surface-2 border border-border/50 rounded-full pl-5 pr-14 py-3.5 text-sm font-medium outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all text-ink placeholder:text-ink-3 disabled:opacity-70" 
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-ink text-white rounded-full flex items-center justify-center hover:bg-ink-2 transition-colors disabled:opacity-50 disabled:bg-ink-3"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
