"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import DashboardShell from "../../../components/DashboardShell"
import { TrendChart } from "../../../components/ChartCard"
import { apiGet } from "../../../lib/api"

function CircularGauge({ value, size = 180, stroke = 10, label }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const color = value >= 75 ? "#34d399" : value >= 50 ? "#f97316" : "#ef4444"

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-display" style={{ color }}>{Math.round(value)}</span>
          <span className="text-xs text-white/40 mt-1">/ 100</span>
        </div>
      </div>
      {label && <p className="text-sm text-white/50 mt-3">{label}</p>}
    </div>
  )
}

function MetricCard({ icon, label, value, sub, accent = "aurora" }) {
  const accentColors = {
    aurora: "from-aurora/20 to-aurora/5 border-aurora/20 text-aurora",
    danger: "from-danger/20 to-danger/5 border-danger/20 text-danger",
    ember: "from-ember/20 to-ember/5 border-ember/20 text-ember",
    mint: "from-mint/20 to-mint/5 border-mint/20 text-mint",
    neon: "from-neon/20 to-neon/5 border-neon/20 text-neon",
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

function FlagItem({ icon, title, detail, severity }) {
  const sevColors = { high: "border-l-danger bg-danger/5", medium: "border-l-ember bg-ember/5", low: "border-l-mint bg-mint/5" }
  return (
    <div className={`border-l-[3px] rounded-r-xl px-4 py-3 ${sevColors[severity] || sevColors.medium}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <h4 className="text-sm font-medium text-white/80">{title}</h4>
      </div>
      <p className="text-xs text-white/40 mt-1 ml-6">{detail}</p>
    </div>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
}

export default function StudentDashboard() {
  const [prediction, setPrediction] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [records, setRecords] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const pred = await apiGet("/predictions/me")
        if (pred && !pred.error) {
          setPrediction(pred)
          setExplanation({
            summary_text: pred.summary_text,
            feature_contributions: pred.feature_contributions,
            rule_path: pred.rule_path,
          })
        } else if (pred?.error === "no_prediction") {
          setError(pred.message)
        } else if (pred?.error === "no_student") {
          setError("No student record is linked to your account. Contact your faculty.")
        }
      } catch (err) {
        setError("Could not load predictions. Please try again later.")
      }
      try {
        const rec = await apiGet("/records/me")
        if (rec && !rec.error) setRecords(rec)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  // Real data only — no fakes
  const trend = records?.academic?.length > 0
    ? records.academic.slice(0, 8).reverse().map((r) => ({ name: r.subject?.slice(0, 6) || r.date, score: r.score }))
    : []

  const hasPrediction = prediction && !prediction.error
  const consistencyIndex = hasPrediction ? prediction.consistency_index : 0
  const riskScore = hasPrediction ? prediction.risk_score : 0
  const flags = hasPrediction ? (prediction.flags || []) : []

  const getRiskInfo = (risk) => {
    if (risk >= 0.7) return { label: "High Risk", accent: "danger", icon: "🔴" }
    if (risk >= 0.4) return { label: "Medium Risk", accent: "ember", icon: "🟡" }
    return { label: "Low Risk", accent: "mint", icon: "🟢" }
  }
  const riskInfo = getRiskInfo(riskScore)

  const features = explanation?.feature_contributions || []
  const summaryText = explanation?.summary_text || ""

  return (
    <DashboardShell title="Student Dashboard">
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-aurora animate-spin" />
            </div>
            <p className="text-sm text-white/40">Loading your dashboard...</p>
          </div>
        </div>
      ) : !hasPrediction ? (
        /* ── Empty State — no fake data ── */
        <div className="space-y-5">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <div className="glass card text-center py-16">
              <span className="text-6xl block mb-6">📊</span>
              <h2 className="font-display text-xl mb-3">No Data Available Yet</h2>
              <p className="text-sm text-white/40 max-w-md mx-auto leading-relaxed">
                {error || "Your dashboard will populate once your faculty imports your records and runs the ML prediction pipeline."}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-5 py-3 border border-white/[0.06]">
                  <span className="text-lg">1️⃣</span>
                  <span className="text-xs text-white/50">Faculty imports your records</span>
                </div>
                <span className="text-white/20 hidden sm:block">→</span>
                <div className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-5 py-3 border border-white/[0.06]">
                  <span className="text-lg">2️⃣</span>
                  <span className="text-xs text-white/50">Faculty runs ML predictions</span>
                </div>
                <span className="text-white/20 hidden sm:block">→</span>
                <div className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-5 py-3 border border-white/[0.06]">
                  <span className="text-lg">3️⃣</span>
                  <span className="text-xs text-white/50">Your dashboard shows results</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <div className="glass card bg-cta-gradient">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💡</span>
                <h3 className="font-display text-sm">While you wait</h3>
              </div>
              <p className="text-sm text-white/40">
                Check out the <strong className="text-white/70">AI Assistant</strong> to learn how InsightU works, or browse <strong className="text-white/70">Resources</strong> for study strategies!
              </p>
            </div>
          </motion.div>
        </div>
      ) : (
        /* ── Real Data Dashboard ── */
        <>
          {/* Top Row: Gauge + Metrics */}
          <div className="grid lg:grid-cols-12 gap-5">
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
              className="lg:col-span-4 glass card flex flex-col items-center justify-center py-8"
            >
              <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-4">Consistency Index</p>
              <CircularGauge value={consistencyIndex} />
              <div className="mt-4 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${consistencyIndex >= 75 ? "bg-mint" : consistencyIndex >= 50 ? "bg-ember" : "bg-danger"} animate-pulse`} />
                <span className="text-xs text-white/40">
                  {consistencyIndex >= 75 ? "Stable" : consistencyIndex >= 50 ? "Needs Attention" : "Inconsistent"}
                </span>
              </div>
            </motion.div>

            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
              <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
                <MetricCard icon={riskInfo.icon} label="Risk Level" value={riskInfo.label}
                  sub={`Probability: ${(riskScore * 100).toFixed(0)}%`} accent={riskInfo.accent} />
              </motion.div>
              <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                <MetricCard icon="⚠️" label="Active Flags" value={flags.length}
                  sub="Issues detected" accent={flags.length > 2 ? "danger" : "ember"} />
              </motion.div>
              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
                <MetricCard icon="📅" label="Attendance" value={records?.summary?.attendance_rate ? `${records.summary.attendance_rate}%` : "—"}
                  sub="Your attendance rate" accent={(records?.summary?.attendance_rate || 0) >= 80 ? "mint" : "danger"} />
              </motion.div>
              <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
                <MetricCard icon="📊" label="Avg Score" value={records?.summary?.avg_score || "—"}
                  sub="Across all subjects" accent="neon" />
              </motion.div>
            </div>
          </div>

          {/* Performance Trend */}
          {trend.length > 0 && (
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
              <TrendChart data={trend} title="📊 Your Subject Scores" />
            </motion.div>
          )}

          {/* AI Explanation */}
          {summaryText && (
            <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
              <div className="glass card">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon/20 to-neon/5 border border-neon/20 flex items-center justify-center text-sm">🧠</div>
                  <div>
                    <h3 className="font-display text-sm">AI Explanation</h3>
                    <p className="text-xs text-white/40">Why you were flagged by InsightU</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-white/[0.03] to-transparent rounded-xl p-5 border border-white/[0.06] mb-6">
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">💬</span>
                    <p className="text-white/60 text-sm leading-relaxed italic">"{summaryText}"</p>
                  </div>
                </div>
                {features.length > 0 && (
                  <>
                    <h4 className="text-xs text-white/40 uppercase tracking-wider mb-4">Feature Contributions</h4>
                    <div className="space-y-4">
                      {features.slice(0, 5).map((f, i) => {
                        const weight = Math.abs(f.weight || f.value || 0.3)
                        const isNeg = f.direction === "negative" || f.direction === "increase"
                        const barColor = isNeg ? "from-danger/60 via-ember to-ember" : "from-mint/60 to-mint"
                        const labelMap = {
                          attendance_trend: { name: "Attendance Trend", icon: "📉" },
                          sudden_score_drop: { name: "Sudden Score Drop", icon: "⚡" },
                          sudden_drop: { name: "Sudden Score Drop", icon: "⚡" },
                          assignment_delays: { name: "Assignment Delays", icon: "⏰" },
                          academic_variance: { name: "Academic Variance", icon: "📊" },
                          behavioral_delay_mean: { name: "Behavioral Delays", icon: "⏰" },
                          behavioral_inactive_mean: { name: "LMS Inactivity", icon: "💤" },
                        }
                        const info = labelMap[f.feature] || { name: f.feature, icon: "📋" }
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between text-sm mb-1.5">
                              <div className="flex items-center gap-2">
                                <span>{info.icon}</span>
                                <span className="text-white/70 font-medium">{info.name}</span>
                              </div>
                              <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${isNeg ? "bg-danger/10 text-danger" : "bg-mint/10 text-mint"}`}>
                                {isNeg ? "−" : "+"}{(weight * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(weight * 120, 100)}%` }}
                                transition={{ duration: 0.8, delay: 0.1 * i }}
                                className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Active Flags */}
          {flags.length > 0 && (
            <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
              <div className="glass card">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ember/20 to-ember/5 border border-ember/20 flex items-center justify-center text-sm">🚩</div>
                  <div>
                    <h3 className="font-display text-sm">Active Flags</h3>
                    <p className="text-xs text-white/40">Issues requiring attention</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {flags.map((flag, i) => (
                    <FlagItem key={i} icon="⚠️" title={flag.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                      detail="This factor is contributing to your risk assessment"
                      severity={i < 2 ? "high" : "medium"} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </DashboardShell>
  )
}
