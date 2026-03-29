"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Stats from "../components/Stats"
import FeatureCard from "../components/FeatureCard"
import SectionHeader from "../components/SectionHeader"
import ParticleGrid from "../components/ParticleGrid"
import HeroVisual from "../components/HeroVisual"
import InteractiveDemo from "../components/InteractiveDemo"

const features = [
  {
    icon: "📊",
    title: "Consistency Index",
    description: "A 0–100 score tracking stability across subjects, attendance, and behavior over time.",
  },
  {
    icon: "🔍",
    title: "Behavioral Drift Detection",
    description: "Isolation Forest-driven anomaly detection flags sudden LMS inactivity and assignment delays.",
  },
  {
    icon: "🧠",
    title: "Explainable Decisions",
    description: "Human-readable reasons, feature contribution bars, and decision tree paths for every prediction.",
  },
  {
    icon: "⚡",
    title: "What-If Simulator",
    description: "Simulate attendance or score improvements to preview how risk scores would change.",
  },
]

const testimonials = [
  {
    quote: "InsightU helped us identify at-risk students 6 weeks earlier than our previous system. The explainable AI makes it easy for faculty to trust and act on recommendations.",
    name: "Dr. Sarah Mitchell",
    role: "Dean of Student Affairs",
    org: "Pacific University",
  },
  {
    quote: "The transparency of predictions is game-changing. Students understand exactly why they were flagged and what steps to take for improvement.",
    name: "Prof. James Ruiz",
    role: "Computer Science Faculty",
    org: "Metropolitan Institute of Technology",
  },
  {
    quote: "We reduced dropout rates by 23% in the first semester of using InsightU. The intervention tracking alone is worth the investment.",
    name: "Dr. Priya Sharma",
    role: "Academic Director",
    org: "National College of Engineering",
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
}

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <ParticleGrid />

      {/* Hero */}
      <section className="relative section max-w-7xl mx-auto pt-28 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] text-sm text-white/60 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
              Explainable AI Platform — Trusted by 50+ Institutions
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display leading-[1.1] max-w-4xl">
              Detect inconsistency early.{" "}
              <span className="text-gradient">Explain it clearly.</span>{" "}
              Intervene effectively.
            </h1>
            <p className="text-white/50 mt-7 max-w-2xl text-xl leading-relaxed">
              InsightU continuously analyzes academic, behavioral, and temporal data to flag risk, explain why, and
              recommend personalized interventions — built for transparency and trust.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link className="btn-primary" href="/signup">Get Started Free →</Link>
              <Link className="btn-outline" href="/how-it-works">See the Pipeline</Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex items-center gap-6 text-white/40 text-sm">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-mint" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                No black-box models
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-5 h-5 text-mint" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Bias monitoring
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-mint" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                FERPA compliant
              </div>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="hidden lg:block"
          >
            <HeroVisual />
          </motion.div>
        </div>

        <Stats />
      </section>

      {/* Trusted By */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-12 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-white/30 mb-8">Trusted by leading educational institutions</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-14 opacity-50">
            {["Pacific University", "MIT Labs", "Stanford EdTech", "Oxford AI", "Harvard Research"].map((name) =>(
              <div key={name} className="text-base font-display text-white/50 tracking-wide">{name}</div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="section-divider max-w-4xl mx-auto" />

      {/* Features */}
      <section className="relative section max-w-7xl mx-auto">
        <SectionHeader title="Designed for proactive academic success" subtitle="Core Intelligence" />
        <div className="grid md:grid-cols-2 gap-5 mt-12">
          {features.map((f, i) => (
            <motion.div key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <FeatureCard {...f} index={i} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive Predictor */}
      <section className="relative section max-w-7xl mx-auto">
        <SectionHeader title="Try it yourself — adjust parameters and see predictions change" subtitle="Try It Live" />
        <div className="mt-12">
          <InteractiveDemo />
        </div>
      </section>

      <div className="section-divider max-w-4xl mx-auto" />

      {/* Why it works */}
      <section className="relative section max-w-7xl mx-auto">
        <SectionHeader title="Guided by explainability, not guesswork" subtitle="Why InsightU Works" />
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {[
            { icon: "🌳", title: "Transparent Models", desc: "Decision Trees & Logistic Regression reveal direct feature influence — no black-box predictions." },
            { icon: "🎯", title: "Intervention Engine", desc: "Track which interventions work and refine recommendations with real outcome data." },
            { icon: "⚖️", title: "Fairness Monitoring", desc: "Bias indicators ensure consistent, equitable outcomes across all student demographics." },
          ].map((item, i) => (
            <motion.div key={item.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="glass card card-hover group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-aurora/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="text-3xl mb-3 block">{item.icon}</span>
              <h3 className="text-lg font-display group-hover:text-aurora transition-colors">{item.title}</h3>
              <p className="text-white/50 mt-2 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="section-divider max-w-4xl mx-auto" />

      {/* Testimonials */}
      <section className="relative section max-w-7xl mx-auto">
        <SectionHeader title="What educational leaders say about InsightU" subtitle="Testimonials" />
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="glass card group relative overflow-hidden"
            >
              {/* Quote mark */}
              <span className="absolute top-4 right-4 text-4xl text-white/[0.04] font-display">"</span>

              <p className="text-white/60 text-base leading-relaxed italic relative z-10">"{t.quote}"</p>
              <div className="mt-5 pt-5 border-t border-white/[0.06] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-aurora/20 to-neon/10 border border-white/10 flex items-center justify-center text-xs font-medium text-aurora">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}, {t.org}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative section max-w-7xl mx-auto">
        <div className="glass card bg-cta-gradient text-center py-16 px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-display">Ready to transform student outcomes?</h2>
            <p className="text-white/50 mt-4 max-w-xl mx-auto text-lg">Start using InsightU to identify at-risk students, explain predictions transparently, and drive meaningful interventions.</p>
            <div className="mt-8 flex justify-center gap-4">
              <Link className="btn-primary" href="/signup">Create Free Account</Link>
              <Link className="btn-outline" href="/features">Explore Features</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
