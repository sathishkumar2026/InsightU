"use client"

import { motion } from "framer-motion"
import ParticleGrid from "../../components/ParticleGrid"

const steps = [
  { num: "01", title: "Data Ingestion", desc: "Upload or connect academic records, attendance logs, and behavioral data via CSV or API. The system normalizes and validates all inputs automatically.", icon: "📥", color: "#7dd3fc" },
  { num: "02", title: "Feature Engineering", desc: "Compute temporal trends, variance, sudden drops, attendance rates, and behavioral drift indicators from raw data using advanced statistical methods.", icon: "⚙️", color: "#a78bfa" },
  { num: "03", title: "Risk Prediction", desc: "Logistic Regression and Decision Trees classify students into risk categories with calibrated probability scores and confidence intervals.", icon: "🎯", color: "#f97316" },
  { num: "04", title: "Explainability Layer", desc: "Extract decision paths, feature contribution scores, and generate human-readable explanation summaries that anyone can understand.", icon: "🧠", color: "#34d399" },
  { num: "05", title: "Intervention & Tracking", desc: "Recommend personalized interventions, track outcomes over time, and feed results back to continuously refine the model.", icon: "📋", color: "#f472b6" },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.5 } }),
}

export default function HowItWorksPage() {
  return (
    <main className="relative overflow-hidden">
      <ParticleGrid />

      <section className="section max-w-6xl mx-auto relative">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gradient-to-r from-aurora/60 to-transparent" />
            <p className="text-xs uppercase tracking-[0.3em] text-aurora/80 font-medium">Pipeline</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-display mt-3">How It Works</h1>
          <p className="text-white/50 mt-4 leading-relaxed">
            A five-stage ML pipeline transforms raw academic data into explainable, actionable insights — from ingestion to intervention.
          </p>
        </div>

        <div className="mt-14 relative">
          {/* Connector line with gradient */}
          <div className="hidden md:block absolute left-[39px] top-8 bottom-8 w-px overflow-hidden">
            <div className="w-full h-full bg-gradient-to-b from-aurora/40 via-neon/30 to-plasma/40" />
            {/* Flowing particle */}
            <motion.div
              className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-transparent via-aurora to-transparent"
              animate={{ y: ["0%", "1200%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div key={step.num} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="glass card card-hover flex gap-6 items-start relative group"
              >
                {/* Step number circle */}
                <div
                  className="flex-shrink-0 w-[56px] h-[56px] rounded-2xl flex items-center justify-center font-display text-lg relative"
                  style={{
                    background: `linear-gradient(135deg, ${step.color}15, ${step.color}05)`,
                    border: `1px solid ${step.color}30`,
                  }}
                >
                  <span style={{ color: step.color }}>{step.num}</span>
                  {/* Pulse ring on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 animate-pulse-ring transition-opacity"
                    style={{ border: `1px solid ${step.color}20` }}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{step.icon}</span>
                    <h3 className="text-lg font-display group-hover:text-aurora transition-colors">{step.title}</h3>
                  </div>
                  <p className="text-white/50 text-sm mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Summary metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-3 gap-4"
        >
          {[
            { label: "Processing Time", value: "< 2s", desc: "Per student analysis" },
            { label: "Feature Count", value: "8+", desc: "Engineered features" },
            { label: "Model Accuracy", value: "86%", desc: "Cross-validated" },
          ].map((m, i) => (
            <div key={i} className="glass card text-center">
              <div className="text-2xl font-display text-gradient">{m.value}</div>
              <p className="text-sm text-white/60 mt-1">{m.label}</p>
              <p className="text-xs text-white/30 mt-0.5">{m.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>
    </main>
  )
}
