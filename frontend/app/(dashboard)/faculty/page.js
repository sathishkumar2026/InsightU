"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import DashboardShell from "../../../components/DashboardShell"
import { TrendChart, RiskPie } from "../../../components/ChartCard"
import { apiGet, apiPost } from "../../../lib/api"

function MetricCard({ icon, label, value, sub, accent = "aurora" }) {
  const accentColors = {
    aurora: "from-aurora/20 to-aurora/5 border-aurora/20",
    danger: "from-danger/20 to-danger/5 border-danger/20",
    ember: "from-ember/20 to-ember/5 border-ember/20",
    mint: "from-mint/20 to-mint/5 border-mint/20",
    neon: "from-neon/20 to-neon/5 border-neon/20",
    plasma: "from-plasma/20 to-plasma/5 border-plasma/20",
  }
  const c = accentColors[accent] || accentColors.aurora
  return (
    <div className="glass card card-hover group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium">{label}</p>
          <div className="text-3xl font-display mt-2">{value}</div>
          {sub && <p className="text-xs text-white/30 mt-1.5">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c} border flex items-center justify-center text-lg`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
}

export default function FacultyDashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [predictions, setPredictions] = useState({})
  const [clearing, setClearing] = useState(false)
  const [clearResult, setClearResult] = useState(null)
  const [confirmClear, setConfirmClear] = useState(null) // null | "predictions" | "all"

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet("/assignments/my-students")
        setStudents(data || [])
        const preds = {}
        for (const s of (data || []).slice(0, 10)) {
          try {
            const pred = await apiGet(`/predictions/${s.id}`)
            if (pred) preds[s.id] = pred
          } catch { }
        }
        setPredictions(preds)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleClear = async (type) => {
    setClearing(true)
    setClearResult(null)
    try {
      const token = localStorage.getItem("insightu_token")
      const del = async (path) => {
        const res = await fetch(`http://localhost:8000/api/v1${path}`, {
          method: "DELETE", headers: { Authorization: `Bearer ${token}` },
        })
        return res.json()
      }

      if (type === "predictions") {
        const r = await del("/predictions/clear")
        setClearResult({ success: `Cleared ${r.deleted_predictions} predictions & ${r.deleted_explanations} explanations` })
        setPredictions({})
      } else {
        const r = await del("/records/clear")
        setClearResult({ success: `Cleared ${r.deleted_students} students, ${r.deleted_predictions} predictions, and all records` })
        setPredictions({})
        setStudents([])
      }
      setConfirmClear(null)
    } catch (err) {
      setClearResult({ error: err.message })
    } finally {
      setClearing(false)
    }
  }

  const predList = Object.values(predictions)
  const riskCounts = { High: 0, Medium: 0, Low: 0 }
  predList.forEach((p) => {
    if (p.risk_score >= 0.7) riskCounts.High++
    else if (p.risk_score >= 0.4) riskCounts.Medium++
    else riskCounts.Low++
  })
  const riskData = [
    { name: "High", value: riskCounts.High || 1 },
    { name: "Medium", value: riskCounts.Medium || 2 },
    { name: "Low", value: riskCounts.Low || 3 },
  ]

  const avgConsistency = predList.length > 0
    ? (predList.reduce((a, p) => a + p.consistency_index, 0) / predList.length).toFixed(0)
    : "—"

  const trend = [
    { name: "Aug", score: 82 },
    { name: "Sep", score: 74 },
    { name: "Oct", score: 69 },
    { name: "Nov", score: 76 },
    { name: "Dec", score: 71 },
  ]

  const getRiskBadge = (risk) => {
    if (risk >= 0.7) return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-danger/10 text-danger border border-danger/20"><span className="w-1.5 h-1.5 rounded-full bg-danger" />High</span>
    if (risk >= 0.4) return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-ember/10 text-ember border border-ember/20"><span className="w-1.5 h-1.5 rounded-full bg-ember" />Medium</span>
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-mint/10 text-mint border border-mint/20"><span className="w-1.5 h-1.5 rounded-full bg-mint" />Low</span>
  }

  const getScoreColor = (val) => {
    if (val >= 75) return "text-mint"
    if (val >= 50) return "text-ember"
    return "text-danger"
  }

  return (
    <DashboardShell title="Faculty Dashboard">
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-aurora animate-spin" />
            </div>
            <p className="text-sm text-white/40">Loading faculty dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <MetricCard icon="👥" label="Total Students" value={students.length} sub="In your cohort" accent="aurora" />
            </motion.div>
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <MetricCard icon="📊" label="Predictions" value={predList.length} sub="Reports generated" accent="neon" />
            </motion.div>
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <MetricCard icon="📉" label="Avg Consistency" value={avgConsistency} sub="Class average" accent="ember" />
            </motion.div>
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <MetricCard icon="🔴" label="High Risk" value={riskCounts.High} sub="Immediate attention" accent="danger" />
            </motion.div>
          </div>

          {/* Data Controls */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
            <div className="glass card">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-ember/20 to-danger/10 border border-ember/20 flex items-center justify-center text-lg">🗑️</div>
                  <div>
                    <h3 className="font-display text-sm">Data Controls</h3>
                    <p className="text-xs text-white/40">Clear previous data to start fresh</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!confirmClear ? (
                    <>
                      <button onClick={() => setConfirmClear("predictions")}
                        className="px-4 py-2.5 rounded-xl text-sm border border-ember/20 text-ember hover:bg-ember/10 transition-all"
                      >Clear Predictions</button>
                      <button onClick={() => setConfirmClear("all")}
                        className="px-4 py-2.5 rounded-xl text-sm border border-danger/20 text-danger hover:bg-danger/10 transition-all"
                      >Clear All Data</button>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/50">
                        {confirmClear === "predictions" ? "Clear all predictions?" : "Clear ALL records & predictions?"}
                      </span>
                      <button onClick={() => handleClear(confirmClear)} disabled={clearing}
                        className="px-4 py-2 rounded-xl text-sm bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 transition-all"
                      >{clearing ? "Clearing..." : "Yes, Clear"}</button>
                      <button onClick={() => setConfirmClear(null)}
                        className="px-4 py-2 rounded-xl text-sm border border-white/[0.06] text-white/40 hover:text-white transition-all"
                      >Cancel</button>
                    </div>
                  )}
                </div>
              </div>
              <AnimatePresence>
                {clearResult && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`mt-3 px-4 py-2.5 rounded-xl text-sm flex items-center justify-between ${
                      clearResult.error ? "bg-danger/10 border border-danger/20 text-danger" : "bg-mint/10 border border-mint/20 text-mint"
                    }`}
                  >
                    <span>{clearResult.error ? `✕ ${clearResult.error}` : `✓ ${clearResult.success}`}</span>
                    <button onClick={() => setClearResult(null)} className="text-white/30 hover:text-white ml-3">✕</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-5">
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
              <TrendChart data={trend} title="📈 Class Average Trend" />
            </motion.div>
            <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
              <RiskPie data={riskData} title="🎯 Risk Distribution" />
            </motion.div>
          </div>

          {/* Student Table */}
          <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
            <div className="glass card">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aurora/20 to-aurora/5 border border-aurora/20 flex items-center justify-center text-sm">📋</div>
                <div>
                  <h3 className="font-display text-sm">Student Overview</h3>
                  <p className="text-xs text-white/40">{students.length} students • {predList.length} predictions</p>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="text-left py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Student</th>
                      <th className="text-left py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Program</th>
                      <th className="text-left py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Cohort</th>
                      <th className="text-center py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Consistency</th>
                      <th className="text-center py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => {
                      const pred = predictions[s.id]
                      return (
                        <tr key={s.id} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora/20 to-neon/10 border border-white/10 flex items-center justify-center text-xs font-medium">
                                {(s.name || String(s.id)).slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-white/70 font-medium">{s.name || `Student #${s.id}`}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-white/50">{s.program || "—"}</td>
                          <td className="py-3.5 px-4 text-white/50">{s.cohort || "—"}</td>
                          <td className="py-3.5 px-4 text-center">
                            {pred ? (
                              <span className={`font-display text-lg ${getScoreColor(pred.consistency_index)}`}>{Math.round(pred.consistency_index)}</span>
                            ) : (
                              <span className="text-white/20">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {pred ? getRiskBadge(pred.risk_score) : <span className="text-white/20">—</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Explainability Summary */}
          <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
            <div className="glass card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon/20 to-neon/5 border border-neon/20 flex items-center justify-center text-sm">🧠</div>
                <div>
                  <h3 className="font-display text-sm">Explainability Insights</h3>
                  <p className="text-xs text-white/40">Key factors driving risk across your students</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { factor: "Attendance Trend", pct: "38%", desc: "Most common risk factor", icon: "📉" },
                  { factor: "Score Drops", pct: "28%", desc: "Sudden declines in subjects", icon: "⚡" },
                  { factor: "Submission Delays", pct: "22%", desc: "Increasing assignment lateness", icon: "⏰" },
                ].map((f, i) => (
                  <div key={i} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{f.icon}</span>
                      <span className="text-sm text-white/70 font-medium">{f.factor}</span>
                    </div>
                    <div className="text-2xl font-display text-gradient">{f.pct}</div>
                    <p className="text-xs text-white/30 mt-1">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </DashboardShell>
  )
}
