"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { apiLogin, setToken, getCurrentUser, setCachedUser } from "../../lib/api"

const rotating = [
  { stat: "12,500+", label: "Students monitored across 50+ institutions" },
  { stat: "86%", label: "Prediction accuracy with explainable models" },
  { stat: "78%", label: "Intervention success rate" },
  { stat: "6 weeks", label: "Earlier risk detection on average" },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = await apiLogin(email, password)
      setToken(data.access_token)
      const user = await getCurrentUser()
      setCachedUser(user)
      if (user.role === "admin") router.push("/admin")
      else if (user.role === "faculty") router.push("/faculty")
      else router.push("/student")
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-hero items-center justify-center">
        <div className="orb w-[400px] h-[400px] bg-aurora/20 top-[20%] left-[10%]" />
        <div className="orb w-[300px] h-[300px] bg-neon/15 bottom-[20%] right-[10%]" style={{ animationDelay: "3s" }} />

        {/* Grid overlay */}
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
          <h2 className="text-3xl font-display leading-snug">Welcome back to your <span className="text-gradient">academic intelligence</span> platform.</h2>
          <p className="text-white/40 mt-4 leading-relaxed">Monitor student performance consistency, get explainable AI predictions, and drive meaningful interventions.</p>

          {/* Rotating stats */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            {rotating.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]"
              >
                <div className="text-lg font-display text-gradient">{r.stat}</div>
                <p className="text-xs text-white/30 mt-0.5">{r.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora to-neon flex items-center justify-center text-ink font-bold text-xs">
              iU
            </div>
            <span className="text-lg font-display">InsightU</span>
          </div>

          <h1 className="text-4xl font-display">Sign In</h1>
          <p className="text-white/50 mt-2 text-lg">Enter your credentials to access your dashboard.</p>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-base flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm text-white/60 mb-2 uppercase tracking-wider">Email</label>
              <input
                className="input-field"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2 uppercase tracking-wider">Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                  Signing In...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <p className="mt-8 text-base text-white/50 text-center">
            Don't have an account?{" "}
            <Link href="/signup" className="text-aurora hover:text-white transition-colors">Create one free →</Link>
          </p>

          <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <p className="font-medium text-sm text-white/60 mb-1 flex items-center gap-2">
              <span className="text-sm">💡</span>
              New here?
            </p>
            <p className="text-sm text-white/40">
              Students can <Link href="/signup" className="text-aurora hover:underline">create a free account</Link>. Faculty and admin accounts are created by your institution's administrator.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
