"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import DashboardShell from "../../../../components/DashboardShell"
import { apiPost } from "../../../../lib/api"

const QUICK_QUESTIONS = [
  "Why was I flagged?",
  "How can I improve?",
  "My subjects",
  "My risk score",
  "My attendance",
  "Deadline tips",
  "Find study materials",
  "How am I doing overall?",
]

function ChatBubble({ message, isUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
        isUser
          ? "bg-gradient-to-r from-aurora/20 to-neon/10 border border-aurora/20 text-white/90 rounded-br-md"
          : "bg-white/[0.04] border border-white/[0.08] text-white/70 rounded-bl-md"
      }`}>
        {!isUser && <span className="text-xs text-aurora font-medium block mb-1.5">🤖 InsightU AI</span>}
        <div className="whitespace-pre-wrap">
          {message.split("\n").map((line, li) => {
            // Render bold (**text**)
            const renderBold = (text) =>
              text.split("**").map((part, i) =>
                i % 2 === 1 ? <strong key={i} className="text-white/90">{part}</strong> : part
              )
            // Bullet point lines
            if (line.trim().startsWith("•") || line.trim().startsWith("⚠️") || line.trim().startsWith("✅") || line.trim().startsWith("🟢") || line.trim().startsWith("🟡") || line.trim().startsWith("🔴") || line.trim().startsWith("🌟")) {
              return <div key={li} className="pl-1 py-0.5">{renderBold(line)}</div>
            }
            return <div key={li}>{renderBold(line)}</div>
          })}
        </div>
      </div>
    </motion.div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { text: "Hi! 👋 I'm your InsightU AI assistant. I can help you understand your academic profile, explain why you were flagged, and suggest ways to improve.\n\nTry asking me something, or pick a quick question below!", isUser: false },
  ])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (text) => {
    if (!text.trim()) return
    const userMsg = { text: text.trim(), isUser: true }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setSending(true)
    try {
      const res = await apiPost("/chatbot/ask", { message: text.trim() })
      setMessages((prev) => [...prev, { text: res.response, isUser: false }])
    } catch (err) {
      setMessages((prev) => [...prev, { text: "Sorry, I couldn't process that. Please try again.", isUser: false }])
    } finally {
      setSending(false)
    }
  }

  return (
    <DashboardShell title="AI Assistant">
      <div className="glass card flex flex-col" style={{ minHeight: "calc(100vh - 180px)" }}>
        {/* Chat header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora/20 to-neon/10 border border-aurora/20 flex items-center justify-center text-lg">🤖</div>
          <div>
            <h3 className="font-display text-sm">InsightU AI Assistant</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-mint animate-pulse" />
              <span className="text-xs text-white/40">Online • Using your data for context</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4 min-h-[300px]">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg.text} isUser={msg.isUser} />
            ))}
          </AnimatePresence>
          {sending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-bl-md px-5 py-4">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick questions */}
        <div className="flex flex-wrap gap-2 py-3 border-t border-white/[0.06]">
          {QUICK_QUESTIONS.map((q) => (
            <button key={q} onClick={() => sendMessage(q)} disabled={sending}
              className="px-3 py-1.5 rounded-full text-xs border border-white/[0.08] text-white/40 hover:text-white hover:border-aurora/30 hover:bg-aurora/5 transition-all disabled:opacity-30"
            >{q}</button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-3 pt-3 border-t border-white/[0.06]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !sending && sendMessage(input)}
            placeholder="Ask me anything about your academic profile..."
            className="input-field flex-1"
            disabled={sending}
          />
          <button onClick={() => sendMessage(input)} disabled={sending || !input.trim()}
            className="btn-primary px-6 disabled:opacity-40"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>
    </DashboardShell>
  )
}
