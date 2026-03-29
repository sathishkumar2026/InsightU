"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { apiSignup, setToken, setCachedUser } from "../../lib/api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

const benefits = [
  { icon: "🧠", text: "Explainable AI predictions for every student" },
  { icon: "📊", text: "Real-time consistency tracking and analytics" },
  { icon: "🎯", text: "Personalized intervention recommendations" },
  { icon: "⚖️", text: "Built-in fairness and bias monitoring" },
  { icon: "🔍", text: "Transparent decision paths — no black boxes" },
]

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [setupKey, setSetupKey] = useState("")
  const [showAdminSetup, setShowAdminSetup] = useState(false)
  const [adminExists, setAdminExists] = useState(true) // hide by default until we know

  useEffect(() => {
    fetch(`${API_BASE}/auth/setup-status`)
      .then(r => r.json())
      .then(data => setAdminExists(data.admin_exists))
      .catch(() => setAdminExists(true)) // on error, hide to be safe
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (showAdminSetup && !setupKey.trim()) {
      setError("Please enter the setup key.")
      return
    }
    setLoading(true)
    try {
      const data = await apiSignup(name, email, password, "student", showAdminSetup ? setupKey : null)
      setToken(data.access_token)
      setCachedUser({ id: data.id, name: data.name, email: data.email, role: data.role })
      if (data.role === "admin") router.push("/admin")
      else router.push("/student")
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-hero items-center justify-center">
        <div className="orb w-[400px] h-[400px] bg-neon/20 top-[15%] right-[15%]" />
        <div className="orb w-[300px] h-[300px] bg-aurora/15 bottom-[25%] left-[10%]" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="relative z-10 px-12 max-w-lg">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora to-neon flex items-center justify-center text-ink font-bold text-sm">
                iU
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-mint status-dot" />
            </div>
            <span className="text-2xl font-display">InsightU</span>
          </div>
          <h2 className="text-3xl font-display leading-snug">Join <span className="text-gradient">InsightU</span> and start making data-driven academic decisions.</h2>
          <p className="text-white/40 mt-4 leading-relaxed">Create your free account to access AI-powered consistency tracking, explainable predictions, and intervention tools.</p>

          <div className="mt-10 space-y-3">
            {benefits.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-sm">{b.icon}</div>
                <span className="text-sm text-white/50">{b.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-amber-400 text-sm">★</span>
              ))}
            </div>
            <span className="text-xs text-white/30">Trusted by 50+ institutions</span>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora to-neon flex items-center justify-center text-ink font-bold text-xs">iU</div>
            <span className="text-lg font-display">InsightU</span>
          </div>

          <h1 className="text-4xl font-display">Create Account</h1>
          <p className="text-white/50 mt-2 text-lg">Get started with your free InsightU account.</p>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-base flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm text-white/60 mb-2 uppercase tracking-wider">Full Name</label>
              <input className="input-field" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2 uppercase tracking-wider">Email</label>
              <input className="input-field" type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-2 uppercase tracking-wider">Password</label>
              <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {/* Admin bootstrap toggle — only show if no admin exists yet */}
            {!adminExists && (
              <div className="pt-1">
                <button type="button" onClick={() => { setShowAdminSetup(!showAdminSetup); if (showAdminSetup) setSetupKey("") }}
                  className="text-xs text-white/25 hover:text-aurora/60 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[10px]">{showAdminSetup ? "▼" : "▶"}</span>
                  Institution admin? Enter setup key
                </button>
                {showAdminSetup && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.2 }} className="mt-3">
                    <input className="input-field" type="password" placeholder="Enter admin setup key" value={setupKey} onChange={(e) => setSetupKey(e.target.value)} required />
                    <p className="text-xs text-white/20 mt-1.5">One-time key to create the first admin. After that, admins create other accounts from the dashboard.</p>
                  </motion.div>
                )}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : "Create Account →"}
            </button>
          </form>

          <p className="mt-8 text-base text-white/50 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-aurora hover:text-white transition-colors">Sign in →</Link>
          </p>
        </motion.div>
      </div>
    </main>
  )
}
