"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getToken, getCachedUser, logout } from "../lib/api"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const token = getToken()
    if (token) {
      const cached = getCachedUser()
      if (cached) setUser(cached)
    }
  }, [])

  const dashboardPath = user
    ? user.role === "admin" ? "/admin" : user.role === "faculty" ? "/faculty" : "/student"
    : null

  const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/explainable-ai", label: "Explainable AI" },
    { href: "/use-cases", label: "Use Cases" },
  ]

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U"

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "bg-ink/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-lg shadow-black/20" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora to-neon flex items-center justify-center text-ink font-bold text-sm">
              iU
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-mint status-dot" />
          </div>
          <span className="text-lg font-display tracking-tight group-hover:text-aurora transition-colors">InsightU</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-1 items-center">
          {navLinks.map((l) => (
            <Link key={l.href} className="nav-link px-3 py-2 rounded-lg hover:bg-white/5" href={l.href}>{l.label}</Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link className="btn-ghost" href={dashboardPath}>Dashboard</Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora/20 to-neon/10 border border-white/10 flex items-center justify-center text-xs font-medium text-aurora">
                  {initials}
                </div>
                <button onClick={logout} className="btn-ghost text-white/40 hover:text-white text-xs">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link className="btn-ghost" href="/login">Sign In</Link>
              <Link className="btn-primary" href="/signup">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden relative w-8 h-8 flex flex-col justify-center gap-1.5" onClick={() => setMobileOpen(!mobileOpen)}>
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-1" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-1" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-ink/95 backdrop-blur-2xl border-t border-white/[0.06] overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {navLinks.map((l) => (
                <Link key={l.href} className="nav-link py-2" href={l.href} onClick={() => setMobileOpen(false)}>{l.label}</Link>
              ))}
              <div className="border-t border-white/10 pt-3 mt-2 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link className="btn-ghost text-left" href={dashboardPath}>Dashboard</Link>
                    <button onClick={logout} className="btn-ghost text-left text-white/50">Logout</button>
                  </>
                ) : (
                  <>
                    <Link className="btn-ghost text-left" href="/login">Sign In</Link>
                    <Link className="btn-primary text-center" href="/signup">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
