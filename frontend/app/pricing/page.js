"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import ParticleGrid from "../../components/ParticleGrid"

export default function GetStartedPage() {
  const roles = [
    { role: "Student", icon: "🎓", desc: "Track your performance, view AI-generated insights, and get personalized improvement plans.", color: "aurora", features: ["Consistency Index", "AI Explanations", "Recovery Plan", "Study Materials"] },
    { role: "Faculty", icon: "👨‍🏫", desc: "Monitor students, run predictions, manage study materials, and view risk distributions.", color: "neon", features: ["Student Monitoring", "ML Predictions", "Risk Analytics", "Material Upload"] },
    { role: "Admin", icon: "🛡️", desc: "Full system oversight — user management, model metrics, fairness monitoring, and configuration.", color: "mint", features: ["User Management", "System Analytics", "Fairness Monitor", "Configuration"] },
  ]

  const steps = [
    { num: "1", title: "Create an account", desc: "Students can sign up freely from the signup page" },
    { num: "2", title: "Get assigned", desc: "Your institution's admin will set up faculty and assign students" },
    { num: "3", title: "Start exploring", desc: "Access your personalized dashboard with AI-powered insights" },
  ]

  return (
    <main className="relative overflow-hidden">
      <ParticleGrid />

      <section className="section max-w-6xl mx-auto relative">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gradient-to-r from-aurora/60 to-transparent" />
            <p className="text-xs uppercase tracking-[0.3em] text-aurora/80 font-medium">Get Started</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-display mt-3">Start Using InsightU</h1>
          <p className="text-white/50 mt-4 leading-relaxed">
            InsightU provides role-based dashboards tailored for students, faculty, and administrators. Each role unlocks a unique set of AI-powered tools.
          </p>
        </div>

        {/* How it works */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-10 glass card bg-cta-gradient">
          <h3 className="font-display text-base mb-4 flex items-center gap-2">
            <span className="text-lg">⚡</span>
            How It Works
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {steps.map((s) => (
              <div key={s.num} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-aurora/10 border border-aurora/20 flex items-center justify-center text-aurora text-sm font-display flex-shrink-0">{s.num}</div>
                <div>
                  <p className="text-sm font-medium text-white/80">{s.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {roles.map((r, i) => (
            <motion.div
              key={r.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass card card-hover group relative overflow-hidden flex flex-col"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${r.color}/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <span className="text-3xl mb-3 block">{r.icon}</span>
              <h3 className="text-xl font-display group-hover:text-aurora transition-colors">{r.role} Dashboard</h3>
              <p className="text-white/50 text-sm mt-2 leading-relaxed">{r.desc}</p>

              <div className="mt-4 space-y-1.5">
                {r.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-white/40">
                    <svg className="w-3 h-3 text-mint flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    {f}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link className="btn-primary" href="/signup">Create Your Account →</Link>
          <p className="text-white/30 text-sm mt-4">Already have an account? <Link href="/login" className="text-aurora hover:text-white transition-colors">Sign in</Link></p>
        </div>
      </section>
    </main>
  )
}
