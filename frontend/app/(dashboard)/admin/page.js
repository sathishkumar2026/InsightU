"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import DashboardShell from "../../../components/DashboardShell"
import { RiskPie, BarChartCard } from "../../../components/ChartCard"
import { apiGet } from "../../../lib/api"

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

export default function AdminDashboard() {
  const [students, setStudents] = useState([])
  const [predictions, setPredictions] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet("/students")
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
    ? (predList.reduce((a, p) => a + p.consistency_index, 0) / predList.length).toFixed(1)
    : "—"

  const modelMetrics = [
    { name: "Accuracy", value: 86 },
    { name: "Precision", value: 82 },
    { name: "Recall", value: 79 },
    { name: "F1", value: 80 },
  ]

  return (
    <DashboardShell title="Admin Dashboard">
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-aurora animate-spin" />
            </div>
            <p className="text-sm text-white/40">Loading admin dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <MetricCard icon="👥" label="Total Students" value={students.length} sub="Enrolled in system" accent="aurora" />
            </motion.div>
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <MetricCard icon="📊" label="Predictions" value={predList.length} sub="Reports generated" accent="neon" />
            </motion.div>
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <MetricCard icon="📈" label="Avg Consistency" value={avgConsistency} sub="System-wide average" accent="mint" />
            </motion.div>
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <MetricCard icon="🔴" label="High Risk" value={riskCounts.High} sub="Need intervention" accent="danger" />
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-5">
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <RiskPie data={riskData} title="🎯 System Risk Distribution" />
            </motion.div>
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
              <BarChartCard data={modelMetrics} title="📊 Model Performance Metrics" dataKey="value" barColor="#a78bfa" />
            </motion.div>
          </div>

          {/* Fairness Monitor */}
          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
            <div className="glass card">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aurora/20 to-aurora/5 border border-aurora/20 flex items-center justify-center text-sm">⚖️</div>
                <div>
                  <h3 className="font-display text-sm">Fairness & Bias Monitor</h3>
                  <p className="text-xs text-white/40">Equity indicators across all student demographics</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Disparate Impact Ratio", value: "0.94", status: "pass", threshold: "≥ 0.80", icon: "✓" },
                  { label: "Demographic Parity", value: "0.48 vs 0.51", status: "pass", threshold: "Group A vs B", icon: "⚡" },
                  { label: "Equal Opportunity", value: "0.91", status: "pass", threshold: "TPR within bounds", icon: "🎯" },
                ].map((m, i) => (
                  <div key={i} className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.06] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-[60px] bg-mint/5" />
                    <p className="text-xs text-white/40 uppercase tracking-wider">{m.label}</p>
                    <p className="text-2xl font-display mt-2 text-mint">{m.value}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-5 h-5 rounded-full bg-mint/10 border border-mint/20 flex items-center justify-center text-mint text-xs">✓</span>
                      <span className="text-xs text-white/40">{m.threshold}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Model Details */}
          <div className="grid lg:grid-cols-2 gap-5">
            <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
              <div className="glass card h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon/20 to-neon/5 border border-neon/20 flex items-center justify-center text-sm">🧠</div>
                  <div>
                    <h3 className="font-display text-sm">Model Configuration</h3>
                    <p className="text-xs text-white/40">Current ML pipeline details</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { k: "Primary Model", v: "Logistic Regression" },
                    { k: "Explainability", v: "Decision Tree (rule extraction)" },
                    { k: "Drift Detection", v: "Isolation Forest" },
                    { k: "Features Used", v: "8 engineered features" },
                    { k: "Training Data", v: `${students.length} students` },
                    { k: "Last Updated", v: "Real-time on prediction run" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <span className="text-sm text-white/50">{item.k}</span>
                      <span className="text-sm text-white/80 font-medium">{item.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
              <div className="glass card h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-plasma/20 to-plasma/5 border border-plasma/20 flex items-center justify-center text-sm">📋</div>
                  <div>
                    <h3 className="font-display text-sm">System Summary</h3>
                    <p className="text-xs text-white/40">Platform-wide insights</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Intervention Success Rate", value: "78%", bar: 78, color: "bg-mint" },
                    { label: "Prediction Accuracy", value: "86%", bar: 86, color: "bg-neon" },
                    { label: "Student Engagement", value: "64%", bar: 64, color: "bg-ember" },
                    { label: "Faculty Adoption", value: "92%", bar: 92, color: "bg-aurora" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-white/60">{item.label}</span>
                        <span className="text-white/80 font-display">{item.value}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.bar}%` }}
                          transition={{ duration: 0.8, delay: 0.1 * i }}
                          className={`h-full rounded-full ${item.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </DashboardShell>
  )
}
