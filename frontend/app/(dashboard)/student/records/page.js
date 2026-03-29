"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import DashboardShell from "../../../../components/DashboardShell"
import { apiGet } from "../../../../lib/api"

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
}

export default function MyRecordsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("academic")

  useEffect(() => {
    async function load() {
      try {
        const rec = await apiGet("/records/me")
        if (rec && !rec.error) setData(rec)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const summary = data?.summary || {}
  const getScoreColor = (v) => v >= 75 ? "text-mint" : v >= 50 ? "text-ember" : "text-danger"

  return (
    <DashboardShell title="My Records">
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-white/10 border-t-aurora rounded-full animate-spin" />
        </div>
      ) : !data || data.error ? (
        <div className="glass card text-center py-16">
          <span className="text-4xl block mb-4">📭</span>
          <h3 className="font-display text-lg">No Records Found</h3>
          <p className="text-sm text-white/40 mt-2">No student record is linked to your account yet.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Avg Score", value: summary.avg_score || "—", icon: "📊", accent: "aurora" },
              { label: "Attendance", value: `${summary.attendance_rate || 0}%`, icon: "📅", accent: summary.attendance_rate >= 80 ? "mint" : "danger" },
              { label: "Avg Delay", value: `${summary.avg_delay || 0}d`, icon: "⏰", accent: summary.avg_delay <= 3 ? "mint" : "ember" },
              { label: "Records", value: summary.total_academic || 0, icon: "📚", accent: "neon" },
            ].map((m, i) => (
              <motion.div key={m.label} custom={i} variants={fadeUp} initial="hidden" animate="visible">
                <div className="glass card card-hover">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider">{m.label}</p>
                      <div className="text-3xl font-display mt-2">{m.value}</div>
                    </div>
                    <span className="text-2xl">{m.icon}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tab selector */}
          <div className="glass card">
            <div className="flex gap-2">
              {[
                { id: "academic", label: "Academic", icon: "📝", count: data.academic?.length },
                { id: "attendance", label: "Attendance", icon: "📅", count: data.attendance?.length },
                { id: "behavioral", label: "Behavioral", icon: "🧠", count: data.behavioral?.length },
              ].map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all ${
                    tab === t.id ? "bg-white/[0.06] border-white/[0.12] text-white" : "border-transparent text-white/40 hover:text-white/70"
                  }`}
                >
                  <span>{t.icon}</span> {t.label} <span className="text-xs text-white/30">({t.count || 0})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Academic Records */}
          {tab === "academic" && (
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
              <div className="glass card">
                {data.academic?.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/[0.02]">
                          <th className="text-left py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider">Subject</th>
                          <th className="text-center py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider">Score</th>
                          <th className="text-center py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider">Term</th>
                          <th className="text-right py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.academic.map((r, i) => (
                          <tr key={r.id} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                            <td className="py-3.5 px-4 text-white/70 font-medium">{r.subject}</td>
                            <td className={`py-3.5 px-4 text-center font-display text-lg ${getScoreColor(r.score)}`}>{r.score}</td>
                            <td className="py-3.5 px-4 text-center text-white/40">{r.term || "—"}</td>
                            <td className="py-3.5 px-4 text-right text-white/30 text-xs">{r.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-white/30 py-8">No academic records yet</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Attendance */}
          {tab === "attendance" && (
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
              <div className="glass card">
                {data.attendance?.length > 0 ? (
                  <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                    {data.attendance.map((r) => (
                      <div key={r.id} title={`${r.date}: ${r.attended ? "Present" : "Absent"}`}
                        className={`w-full aspect-square rounded-lg border flex items-center justify-center text-sm ${
                          r.attended ? "bg-mint/10 border-mint/20 text-mint" : "bg-danger/10 border-danger/20 text-danger"
                        }`}
                      >
                        {r.attended ? "✓" : "✕"}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-white/30 py-8">No attendance records yet</p>
                )}
                {data.attendance?.length > 0 && (
                  <div className="mt-4 flex items-center gap-4 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-mint/30" /><span className="text-xs text-white/40">Present</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-danger/30" /><span className="text-xs text-white/40">Absent</span></div>
                    <span className="ml-auto text-xs text-white/40">{summary.attendance_rate}% attendance rate</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Behavioral */}
          {tab === "behavioral" && (
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
              <div className="glass card">
                {data.behavioral?.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/[0.02]">
                          <th className="text-left py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider">Date</th>
                          <th className="text-center py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider">Assignment Delay</th>
                          <th className="text-center py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider">LMS Inactive</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.behavioral.map((r) => (
                          <tr key={r.id} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                            <td className="py-3.5 px-4 text-white/40 text-xs">{r.date}</td>
                            <td className={`py-3.5 px-4 text-center font-display ${r.assignment_delay_days > 5 ? "text-danger" : "text-mint"}`}>{r.assignment_delay_days}d</td>
                            <td className={`py-3.5 px-4 text-center font-display ${r.lms_inactive_days > 5 ? "text-danger" : "text-mint"}`}>{r.lms_inactive_days}d</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-white/30 py-8">No behavioral records yet</p>
                )}
              </div>
            </motion.div>
          )}
        </>
      )}
    </DashboardShell>
  )
}
