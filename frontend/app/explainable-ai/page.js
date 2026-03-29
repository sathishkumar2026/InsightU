"use client"

import { motion } from "framer-motion"
import ParticleGrid from "../../components/ParticleGrid"

export default function ExplainableAIPage() {
  const contributions = [
    { feature: "Attendance Trend", value: -0.34, direction: "negative", label: "Declined 18% over 30 days", icon: "📉" },
    { feature: "Sudden Score Drop", value: -0.28, direction: "negative", label: "Physics down 27 points", icon: "⚡" },
    { feature: "Assignment Delays", value: -0.22, direction: "negative", label: "Avg delay increased to 8 days", icon: "⏰" },
    { feature: "Academic Variance", value: -0.11, direction: "negative", label: "Cross-subject instability", icon: "📊" },
    { feature: "LMS Activity", value: 0.05, direction: "positive", label: "Login frequency stable", icon: "💻" },
  ]

  const maxAbs = Math.max(...contributions.map((c) => Math.abs(c.value)))

  const principles = [
    { icon: "🔍", title: "Transparency", desc: "Every prediction shows exactly which features influenced the outcome and by how much." },
    { icon: "🌳", title: "Interpretable Models", desc: "We use Decision Trees and Logistic Regression — models that produce human-readable rules." },
    { icon: "🛡️", title: "No Black Boxes", desc: "Unlike deep learning, our models explain themselves. No hidden layers, no opaque decisions." },
    { icon: "⚖️", title: "Fairness Built-In", desc: "Disparate impact analysis runs automatically to detect and prevent demographic biases." },
  ]

  return (
    <main className="relative overflow-hidden">
      <ParticleGrid />

      <section className="section max-w-6xl mx-auto relative">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gradient-to-r from-aurora/60 to-transparent" />
            <p className="text-xs uppercase tracking-[0.3em] text-aurora/80 font-medium">Transparency</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-display mt-3">Explainable AI</h1>
          <p className="text-white/50 mt-4 leading-relaxed">
            Every prediction is backed by readable explanations, decision rules, and feature contribution scores. No black-box models — ever.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {principles.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass card card-hover group text-center"
            >
              <span className="text-2xl block mb-3">{p.icon}</span>
              <h3 className="font-display text-sm group-hover:text-aurora transition-colors">{p.title}</h3>
              <p className="text-xs text-white/40 mt-2 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="section-divider my-12" />

        {/* Example explanation */}
        <h2 className="text-2xl font-display mb-8">Example: Student Risk Analysis</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="glass card"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aurora/20 to-aurora/5 border border-aurora/20 flex items-center justify-center text-sm">📊</div>
              <div>
                <h3 className="font-display text-sm">Feature Contributions</h3>
                <p className="text-xs text-white/40">How each factor influenced this student's risk score</p>
              </div>
            </div>
            <div className="space-y-3">
              {contributions.map((c, i) => (
                <div key={c.feature}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70 flex items-center gap-2">
                      <span className="text-sm">{c.icon}</span>
                      {c.feature}
                    </span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${c.direction === "negative" ? "bg-danger/10 text-danger" : "bg-mint/10 text-mint"}`}>
                      {c.value > 0 ? "+" : ""}{c.value.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(Math.abs(c.value) / maxAbs) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.1 * i }}
                      className={`h-full rounded-full ${c.direction === "negative" ? "bg-gradient-to-r from-ember/60 to-ember" : "bg-gradient-to-r from-mint/60 to-mint"}`}
                    />
                  </div>
                  <p className="text-xs text-white/30 mt-0.5">{c.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glass card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon/20 to-neon/5 border border-neon/20 flex items-center justify-center text-sm">💬</div>
                <div>
                  <h3 className="font-display text-sm">AI Summary</h3>
                  <p className="text-xs text-white/40">Natural language explanation</p>
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                <p className="text-white/70 text-sm leading-relaxed italic">
                  "This student was flagged because attendance dropped by 18% over the last 30 days, Physics marks declined by 27 points, and assignment submission delays increased to an average of 8 days. Behavioral drift was also detected."
                </p>
              </div>
            </div>

            <div className="glass card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mint/20 to-mint/5 border border-mint/20 flex items-center justify-center text-sm">🌳</div>
                <div>
                  <h3 className="font-display text-sm">Decision Path</h3>
                  <p className="text-xs text-white/40">How the model reached its conclusion</p>
                </div>
              </div>
              <div className="text-sm text-white/60 space-y-2 font-mono bg-white/[0.02] rounded-xl p-4 border border-white/[0.06]">
                <div className="flex items-start gap-2">
                  <span className="text-aurora text-xs mt-1">▸</span>
                  <span><span className="text-aurora">IF</span> attendance_trend <span className="text-ember">&lt; -0.10</span></span>
                </div>
                <div className="flex items-start gap-2 pl-5">
                  <span className="text-neon text-xs mt-1">▸</span>
                  <span><span className="text-neon">AND</span> sudden_drop <span className="text-ember">&gt; 15</span></span>
                </div>
                <div className="flex items-start gap-2 pl-10">
                  <span className="text-plasma text-xs mt-1">▸</span>
                  <span><span className="text-plasma">AND</span> variance <span className="text-ember">&gt; 40</span></span>
                </div>
                <div className="mt-3 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 flex items-center gap-2">
                  <span className="text-danger">→</span>
                  <span className="text-danger font-semibold">HIGH RISK</span>
                  <span className="text-danger/60 text-xs ml-auto">confidence: 0.82</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
