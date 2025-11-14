"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { authApi, chatApi, mealPlanApi } from "@/lib/api";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Halo, saya Nutrify — Ahli Gizi profesional Anda. Saya siap membantu rencana makan, edukasi gizi AKG, dan menyesuaikan saran berdasarkan profil serta meal plan Anda. Ada yang ingin ditanyakan?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [userSummary, setUserSummary] = useState<string>("");
  const [error, setError] = useState<string>("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch minimal context for header (user + meal plan existence)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [meRes, plans] = await Promise.all([authApi.me(), mealPlanApi.list().catch(() => [])]);
        const user = meRes?.data ?? meRes; // backend sometimes wraps
        const name = user?.fullName || user?.email || "Pengguna";
        const culture = user?.culture ? `, budaya ${user.culture}` : "";
        const conditions = Array.isArray(user?.medicalConditions) && user.medicalConditions.length > 0
          ? ` | Kondisi: ${user.medicalConditions.join(", ")}`
          : "";
        const hasPlan = Array.isArray(plans) && plans.length > 0 ? ` | Meal plan: aktif` : " | Meal plan: belum ada";
        if (mounted) setUserSummary(`${name}${culture}${conditions}${hasPlan}`);
      } catch (e) {
        // ignore header context failures
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  const onSend = async () => {
    if (!canSend) return;
    setError("");
    const content = input.trim();
    setInput("");
    const newUserMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, newUserMsg]);
    setSending(true);

    try {
      const resp = await chatApi.sendMessage({ conversationId, message: content });
      const cid = resp?.conversationId ?? conversationId;
      if (!conversationId && cid) setConversationId(cid);
      const assistantMsg: Message = { role: "assistant", content: resp?.message ?? "(tidak ada balasan)" };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || "Gagal mengirim pesan. Coba lagi.");
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center gradient-primary text-white font-bold">N</div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">Nutrify — Ahli Gizi Profesional</span>
            <span className="text-xs text-gray-500">Berbasis AKG Indonesia • Mengutamakan makanan lokal • Kontekstual sesuai profil Anda</span>
            {userSummary && <span className="text-xs text-gray-500">Konteks: {userSummary}</span>}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
              m.role === "user"
                ? "bg-[rgb(var(--primary))] text-white"
                : "bg-white border border-gray-200 text-gray-900"
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed text-sm">{m.content}</div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-gray-200 p-3 bg-white">
        {error && (
          <div className="mb-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tanya apa saja seputar gizi, AKG, atau sesuaikan meal plan Anda..."
            className="flex-1 input-field !border-gray-200"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={sending}
          />
          <button
            className={`btn-primary ${!canSend ? "opacity-60 cursor-not-allowed" : ""}`}
            onClick={onSend}
            disabled={!canSend}
          >
            {sending ? "Mengirim..." : "Kirim"}
          </button>
        </div>
        <div className="mt-2 text-[11px] text-gray-500">
          Tips: Anda bisa minta penyesuaian budget, alergi, budaya (mis. Jawa), atau kondisi medis (mis. hipertensi).
        </div>
      </div>
    </div>
  );
}
