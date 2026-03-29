"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export default function InteractiveDemo() {
  const [attendance, setAttendance] = useState(72)
  const [scoreDrop, setScoreDrop] = useState(25)
  const [submissions, setSubmissions] = useState(65)

  // Simple risk calculation for demo
  const attendanceRisk = Math.max(0, (90 - attendance) / 90) * 40
  const dropRisk = Math.min(scoreDrop / 50, 1) * 35
  const submissionRisk = Math.max(0, (80 - submissions) / 80) * 25

  const riskScore = Math.min(Math.round(attendanceRisk + dropRisk + submissionRisk), 100)
  const consistencyIndex = Math.max(0, 100 - riskScore)

  const getRiskLevel = (score) => {
    if (score >= 70) return { label: "High Risk", color: "#ef4444", bg: "bg-danger/10", border: "border-danger/20" }
    if (score >= 40) return { label: "Medium Risk", color: "#f97316", bg: "bg-ember/10", border: "border-ember/20" }
    return { label: "Low Risk", color: "#34d399", bg: "bg-mint/10", border: "border-mint/20" }
  }

  const risk = getRiskLevel(riskScore)

  const factors = [
    { name: "Attendance Rate", value: attendance, set: setAttendance, min: 30, max: 100, unit: "%", icon: "📅" },
    { name: "Score Drop (pts)", value: scoreDrop, set: setScoreDrop, min: 0, max: 50, unit: "pts", icon: "📉" },
    { name: "On-time Submissions", value: submissions, set: setSubmissions, min: 20, max: 100, unit: "%", icon: "📝" },
  ]

  const explanations = []
  if (attendance < 85) explanations.push({ text: `Attendance at ${attendance}% — below 85% threshold`, severity: "negative" })
  if (scoreDrop > 15) explanations.push({ text: `Score dropped ${scoreDrop} points — exceeds safe range`, severity: "negative" })
  if (submissions < 70) explanations.push({ text: `On-time submissions at ${submissions}% — needs improvement`, severity: "negative" })
  if (attendance >= 85) explanations.push({ text: `Attendance at ${attendance}% — meets expectations`, severity: "positive" })
  if (scoreDrop <= 15) explanations.push({ text: `Score change of ${scoreDrop}pts — within normal range`, severity: "positive" })
  if (submissions >= 70) explanations.push({ text: `Submission rate at ${submissions}% — on track`, severity: "positive" })

  return (
    <div className="glass-glow card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora/20 to-neon/10 border border-aurora/20 flex items-center justify-center text-lg">⚡</div>
        <div>
          <h3 className="font-display text-base">What-If Simulator</h3>
          <p className="text-xs text-white/40">Adjust student parameters and watch predictions update in real-time</p>
        </div>
        <span className="ml-auto text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-md bg-mint/10 text-mint border border-mint/20">INTERACTIVE</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="space-y-5">
          {factors.map((f) => (
            <div key={f.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60 flex items-center gap-2">
                  <span>{f.icon}</span>
                  {f.name}
                </span>
                <span className="text-sm font-display text-white/80">{f.value}{f.unit}</span>
              </div>
              <input
                type="range"
                min={f.min}
                max={f.max}
                value={f.value}
                onChange={(e) => f.set(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-aurora [&::-webkit-slider-thumb]:shadow-glow-sm
                  [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125"
              />
            </div>
          ))}
        </div>

        {/* Result */}
        <div className="space-y-4">
          {/* Gauges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Consistency Index</p>
              <motion.div
                className="text-3xl font-display"
                style={{ color: consistencyIndex >= 60 ? "#34d399" : consistencyIndex >= 40 ? "#f97316" : "#ef4444" }}
                key={consistencyIndex}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {consistencyIndex}
              </motion.div>
              <p className="text-[10px] text-white/30 mt-1">/ 100</p>
            </div>
            <div className={`rounded-xl p-4 border text-center ${risk.bg} ${risk.border}`}>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Risk Level</p>
              <motion.div
                className="text-3xl font-display"
                style={{ color: risk.color }}
                key={riskScore}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {riskScore}%
              </motion.div>
              <p className="text-[10px] mt-1" style={{ color: risk.color }}>{risk.label}</p>
            </div>
          </div>

          {/* AI Explanation */}
          <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.06]">
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              🧠 AI Explanation
            </p>
            <div className="space-y-1.5">
              {explanations.slice(0, 4).map((exp, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${exp.severity === "negative" ? "bg-ember" : "bg-mint"}`} />
                  <span className="text-white/50">{exp.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
