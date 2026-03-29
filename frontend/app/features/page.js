"use client"

import { motion } from "framer-motion"
import ParticleGrid from "../../components/ParticleGrid"

const features = [
  { icon: "📊", title: "Consistency Index Score", desc: "A unified 0–100 score tracking academic, behavioral, and temporal stability across subjects.", color: "aurora" },
  { icon: "📉", title: "Subject-wise Variance Detection", desc: "Detect subjects where performance deviates most, flagging sudden drops and cross-subject instability.", color: "ember" },
  { icon: "🔬", title: "Behavioral Drift Detection", desc: "Isolation Forest-powered anomaly detection identifies LMS inactivity and assignment delay patterns.", color: "neon" },
  { icon: "🔮", title: "What-If Analysis", desc: "Simulate changes to attendance, scores, or behavior to preview risk score impact before acting.", color: "plasma" },
  { icon: "🎯", title: "Intervention Tracking", desc: "Assign, track, and evaluate interventions with measurable outcome metrics per student.", color: "mint" },
  { icon: "⚖️", title: "Fairness & Bias Monitoring", desc: "Automated disparate impact analysis ensures equitable treatment across demographics.", color: "aurora" },
  { icon: "🧠", title: "Explainable Predictions", desc: "Every flag comes with feature contributions, decision tree paths, and human-readable summaries.", color: "neon" },
  { icon: "🔔", title: "Smart Alerts", desc: "Severity-aware notifications highlight the students who need attention most urgently.", color: "ember" },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
}

export default function FeaturesPage() {
  return (
    <main className="relative overflow-hidden">
      <ParticleGrid />

      <section className="section max-w-6xl mx-auto relative">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gradient-to-r from-aurora/60 to-transparent" />
            <p className="text-xs uppercase tracking-[0.3em] text-aurora/80 font-medium">Platform</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-display mt-3">Features</h1>
          <p className="text-white/50 mt-4 leading-relaxed">
            A comprehensive toolkit for consistent, explainable, and fair academic decision-making — trusted by institutions worldwide.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-12">
          {features.map((f, i) => (
            <motion.div key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="glass card card-hover group relative overflow-hidden"
            >
              {/* Corner glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${f.color}/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Index */}
              <span className="absolute top-4 right-4 text-xs font-display text-white/10 group-hover:text-aurora/20 transition-colors">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="relative inline-block mb-3">
                <span className="text-2xl block relative z-10">{f.icon}</span>
                <div className="absolute inset-0 scale-150 bg-aurora/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <h3 className="text-lg font-display group-hover:text-aurora transition-colors">{f.title}</h3>
              <p className="mt-2 text-white/50 text-sm leading-relaxed">{f.desc}</p>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aurora/0 group-hover:via-aurora/30 to-transparent transition-all duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 glass card bg-cta-gradient text-center py-12"
        >
          <h2 className="text-2xl font-display">Ready to see these features in action?</h2>
          <p className="text-white/50 mt-3 max-w-lg mx-auto text-sm">Start using InsightU to experience the full power of AI-driven student analytics.</p>
          <div className="mt-6 flex justify-center gap-4">
            <a href="/signup" className="btn-primary">Get Started →</a>
            <a href="/how-it-works" className="btn-outline">See Pipeline →</a>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
