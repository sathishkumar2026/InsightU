"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getCachedUser, logout } from "../lib/api"

export default function DashboardShell({ title, children }) {
  const [user, setUser] = useState(null)
  const pathname = usePathname()

  useEffect(() => {
    const cached = getCachedUser()
    if (cached) {
      setUser(cached)
      
      // Aggressive Route Guarding
      const role = cached.role
      if (role === "student" && (pathname.startsWith("/admin") || pathname.startsWith("/faculty"))) {
        window.location.href = "/student"
      } else if (role === "faculty" && pathname.startsWith("/admin")) {
        window.location.href = "/faculty"
      }
    } else {
      // Not logged in, block dashboard access
      window.location.href = "/login"
    }
  }, [pathname])

  const links = {
    student: [
      { href: "/student", label: "Overview", icon: "📊" },
      { href: "/student/records", label: "My Records", icon: "📚" },
      { href: "/student/chat", label: "AI Assistant", icon: "🤖" },
      { href: "/student/resources", label: "Resources", icon: "📖" },
    ],
    faculty: [
      { href: "/faculty", label: "Overview", icon: "📊" },
      { href: "/faculty/upload", label: "Manage Data", icon: "📁" },
      { href: "/faculty/materials", label: "Study Materials", icon: "📚" },
    ],
    admin: [
      { href: "/admin", label: "Overview", icon: "📊" },
      { href: "/admin/users", label: "Users", icon: "👥" },
      { href: "/admin/assignments", label: "Assignments", icon: "🔗" },
      { href: "/admin/config", label: "Config", icon: "⚙️" },
      { href: "/admin/audit", label: "Audit Log", icon: "📋" },
      { href: "/admin/upload", label: "Manage Data", icon: "📁" },
    ],
  }

  const navLinks = user ? (links[user.role] || links.student) : links.student

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U"

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col glass-strong border-r border-white/[0.06] sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora to-neon flex items-center justify-center text-ink font-bold text-xs">
                iU
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-mint status-dot" />
            </div>
            <span className="font-display text-lg group-hover:text-aurora transition-colors">InsightU</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((l) => {
            const isActive = pathname === l.href
            return (
              <Link key={l.href} href={l.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative ${
                  isActive
                    ? "text-white bg-white/[0.06] border border-white/[0.08]"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-aurora" />
                )}
                <span className="text-base">{l.icon}</span>
                {l.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/[0.06]">
          {user && (
            <div className="px-3 py-2 mb-2 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-aurora/20 to-neon/10 border border-white/10 flex items-center justify-center text-xs font-medium text-aurora">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-white/40 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-ink/80 backdrop-blur-xl border-b border-white/[0.06] px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display">{title}</h1>
            {user && <p className="text-xs text-white/40 mt-0.5">Welcome back, {user.name}</p>}
          </div>
          <div className="flex items-center gap-3">
            {/* System status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/40">
              <div className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
              System Online
            </div>
            <div className="lg:hidden flex items-center gap-3">
              <Link href="/" className="btn-ghost text-xs">Home</Link>
              <button onClick={logout} className="btn-ghost text-xs text-white/40">Logout</button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 bg-grid-dense">
          <div className="max-w-6xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
