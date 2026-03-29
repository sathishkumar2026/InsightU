"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import ParticleGrid from "../../components/ParticleGrid"

const cases = [
  {
    icon: "👨‍🏫",
    title: "Faculty",
    desc: "Identify students showing inconsistent performance patterns. View explainable risk scores, drill into feature contributions, and assign targeted support actions — all from a single dashboard.",
    highlights: ["Risk-ranked student list", "Explainable AI insights", "Intervention assignment", "Class-wide analytics"],
    color: "aurora",
    cta: { label: "Get Started →", href: "/signup" },
    quote: "InsightU saves me hours of manual analysis every week.",
  },
  {
    icon: "🎓",
    title: "Students",
    desc: "Understand why you've been flagged with transparent explanations. Track your consistency index, see recovery projections, and take control of your academic trajectory.",
    highlights: ["Personal consistency score", "Clear reasoning", "Recovery timeline", "Self-improvement tools"],
    color: "neon",
    cta: { label: "Get Started →", href: "/signup" },
    quote: "I finally understand what I need to focus on to improve.",
  },
  {
    icon: "🏛️",
    title: "Institutions",
    desc: "Monitor risk distribution across departments, track intervention effectiveness at scale, and ensure fairness with built-in bias detection tools.",
    highlights: ["Department-level analytics", "Outcome tracking", "Fairness monitoring", "ROI measurement"],
    color: "mint",
    cta: { label: "Get Started →", href: "/signup" },
    quote: "We reduced dropout rates by 23% in just one semester.",
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.5 } }),
}

export default function UseCasesPage() {
  return (
    <main className="relative overflow-hidden">
      <ParticleGrid />

      <section className="section max-w-6xl mx-auto relative">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gradient-to-r from-aurora/60 to-transparent" />
            <p className="text-xs uppercase tracking-[0.3em] text-aurora/80 font-medium">Who It's For</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-display mt-3">Use Cases</h1>
          <p className="text-white/50 mt-4 leading-relaxed">
            InsightU serves every stakeholder in the academic ecosystem — from individual students to institutional leadership.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {cases.map((c, i) => (
            <motion.div key={c.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="glass card card-hover group flex flex-col relative overflow-hidden"
            >
              {/* Corner glow */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${c.color}/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <span className="text-4xl mb-4 block">{c.icon}</span>
              <h3 className="text-xl font-display group-hover:text-aurora transition-colors">{c.title}</h3>
              <p className="text-white/50 text-sm mt-3 leading-relaxed">{c.desc}</p>

              <ul className="mt-4 space-y-1.5">
                {c.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm text-white/40">
                    <svg className="w-3 h-3 text-mint flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    {h}
                  </li>
                ))}
              </ul>

              {/* Quote */}
              <div className="mt-auto pt-5 mt-5 border-t border-white/[0.06]">
                <p className="text-xs text-white/40 italic">"{c.quote}"</p>
              </div>

              <Link href={c.cta.href} className="mt-4 text-xs text-aurora hover:text-white transition-colors font-medium">
                {c.cta.label}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Impact metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 glass card bg-cta-gradient"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-display">Proven Impact Across Institutions</h2>
            <p className="text-white/50 mt-2 text-sm">Real results from InsightU deployments</p>
          </div>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { value: "23%", label: "Reduced Dropout Rate" },
              { value: "6 weeks", label: "Earlier Risk Detection" },
              { value: "78%", label: "Intervention Success" },
              { value: "92%", label: "Faculty Adoption" },
            ].map((m, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-display text-gradient">{m.value}</div>
                <p className="text-xs text-white/40 mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  )
}
