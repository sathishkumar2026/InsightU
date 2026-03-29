"use client"

import { motion } from "framer-motion"
import ParticleGrid from "../../components/ParticleGrid"

export default function AboutPage() {
  const stack = [
    { name: "FastAPI", cat: "Backend", icon: "⚡" },
    { name: "SQLAlchemy + SQLite", cat: "Database", icon: "🗄️" },
    { name: "scikit-learn", cat: "ML", icon: "🧠" },
    { name: "Next.js 14", cat: "Frontend", icon: "▲" },
    { name: "Tailwind CSS", cat: "Styling", icon: "🎨" },
    { name: "Recharts", cat: "Visualization", icon: "📊" },
    { name: "Framer Motion", cat: "Animations", icon: "✨" },
  ]

  const metrics = [
    { value: "12,500+", label: "Students Monitored", icon: "👥" },
    { value: "86%", label: "Model Accuracy", icon: "🎯" },
    { value: "78%", label: "Intervention Success", icon: "📈" },
    { value: "50+", label: "Institutions", icon: "🏛️" },
  ]

  return (
    <main className="relative overflow-hidden">
      <ParticleGrid />

      <section className="section max-w-6xl mx-auto relative">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gradient-to-r from-aurora/60 to-transparent" />
            <p className="text-xs uppercase tracking-[0.3em] text-aurora/80 font-medium">About</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-display mt-3">About InsightU</h1>
          <p className="text-white/50 mt-4 leading-relaxed">
            InsightU is a research-backed Explainable AI platform designed to identify inconsistent student performance early and recommend targeted interventions — trusted by educational institutions worldwide.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass card text-center"
            >
              <span className="text-xl block mb-2">{m.icon}</span>
              <div className="text-2xl font-display text-gradient">{m.value}</div>
              <p className="text-xs text-white/40 mt-1">{m.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass card group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aurora/20 to-aurora/5 border border-aurora/20 flex items-center justify-center text-sm">🎯</div>
              <h3 className="font-display text-lg">Mission</h3>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              To empower educational institutions with transparent, explainable AI that proactively identifies students at risk of inconsistent performance — enabling informed, fair, and timely interventions that improve student outcomes.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass card group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon/20 to-neon/5 border border-neon/20 flex items-center justify-center text-sm">💡</div>
              <h3 className="font-display text-lg">Approach</h3>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              We use interpretable ML models — Logistic Regression, Decision Trees, and Isolation Forest — to ensure every prediction comes with human-readable explanations. No black-box models, no hidden biases. Complete transparency by design.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass card mt-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mint/20 to-mint/5 border border-mint/20 flex items-center justify-center text-sm">🛠️</div>
            <h3 className="font-display text-lg">Technology Stack</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stack.map((s) => (
              <div key={s.name} className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3 hover:border-aurora/20 transition-all group">
                <span className="text-lg">{s.icon}</span>
                <div>
                  <span className="text-white/70 text-sm font-medium">{s.name}</span>
                  <span className="text-white/30 ml-2 text-xs">({s.cat})</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass card mt-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-plasma/20 to-plasma/5 border border-plasma/20 flex items-center justify-center text-sm">📋</div>
            <h3 className="font-display text-lg">Project Details</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { k: "Title", v: "Explainable ML Model for Identifying Inconsistent Students Performance" },
              { k: "Domain", v: "Educational Technology / Explainable AI" },
              { k: "Architecture", v: "Full-stack — FastAPI + Next.js + ML Pipeline" },
              { k: "ML Models", v: "Logistic Regression, Decision Trees, Isolation Forest" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <span className="text-xs text-white/40 uppercase tracking-wider min-w-[80px] mt-0.5">{item.k}</span>
                <span className="text-sm text-white/70">{item.v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  )
}
