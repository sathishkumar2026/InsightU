"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import DashboardShell from "../../../../components/DashboardShell"
import { apiGet } from "../../../../lib/api"

const ACTION_ICONS = {
  user_created: "👤",
  user_updated: "✏️",
  user_deleted: "🗑️",
  prediction_run: "⚡",
  csv_upload: "📄",
  db_import: "🗄️",
  login: "🔐",
  default: "📋",
}

const ACTION_COLORS = {
  user_created: "text-mint",
  user_updated: "text-neon",
  user_deleted: "text-danger",
  prediction_run: "text-aurora",
  csv_upload: "text-ember",
  db_import: "text-plasma",
  login: "text-white/60",
}

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.03, duration: 0.25 } }),
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet("/users/audit-log")
        setLogs(data || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const actionTypes = ["all", ...new Set(logs.map((l) => l.action))]
  const filtered = filter === "all" ? logs : logs.filter((l) => l.action === filter)

  const formatTime = (iso) => {
    if (!iso) return "—"
    const d = new Date(iso)
    const now = new Date()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <DashboardShell title="Audit Log">
      <div className="glass card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon/20 to-neon/5 border border-neon/20 flex items-center justify-center text-sm">📋</div>
            <div>
              <h3 className="font-display text-sm">Activity History</h3>
              <p className="text-xs text-white/40">{logs.length} events recorded</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          {actionTypes.map((a) => (
            <button key={a} onClick={() => setFilter(a)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all capitalize ${
                filter === a
                  ? "bg-white/[0.06] border-white/[0.12] text-white"
                  : "border-white/[0.04] text-white/30 hover:text-white/60"
              }`}
            >
              {a === "all" ? "All" : a.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-white/10 border-t-aurora rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-3xl block mb-3">📭</span>
            <p className="text-sm text-white/40">No audit events found</p>
            <p className="text-xs text-white/20 mt-1">Actions like user creation, predictions, and imports will appear here</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((log, i) => (
              <motion.div key={log.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                className="flex items-start gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  {ACTION_ICONS[log.action] || ACTION_ICONS.default}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium capitalize ${ACTION_COLORS[log.action] || "text-white/60"}`}>
                      {log.action.replace(/_/g, " ")}
                    </span>
                    {log.user_email && (
                      <span className="text-xs text-white/30">by {log.user_email}</span>
                    )}
                  </div>
                  {log.detail && <p className="text-xs text-white/30 mt-0.5 truncate">{log.detail}</p>}
                </div>
                <span className="text-xs text-white/20 whitespace-nowrap flex-shrink-0">{formatTime(log.created_at)}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
