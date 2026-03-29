"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import ParticleGrid from "../../components/ParticleGrid"

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  return (
    <main className="relative overflow-hidden">
      <ParticleGrid />

      <section className="section max-w-6xl mx-auto relative">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gradient-to-r from-aurora/60 to-transparent" />
            <p className="text-xs uppercase tracking-[0.3em] text-aurora/80 font-medium">Get In Touch</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-display mt-3">Contact</h1>
          <p className="text-white/50 mt-4 leading-relaxed">
            Have questions about InsightU? Want to learn more about deploying it at your institution? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass card"
          >
            {sent ? (
              <div className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                  <span className="text-5xl mb-4 block">✅</span>
                </motion.div>
                <h3 className="font-display text-lg">Message Sent!</h3>
                <p className="text-white/50 text-sm mt-2">We'll get back to you within 24 hours.</p>
                <button onClick={() => setSent(false)} className="btn-ghost mt-4 text-aurora text-xs">Send Another →</button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4">
                <div>
                  <label className="block text-xs text-white/50 mb-2 uppercase tracking-wider">Name</label>
                  <input className="input-field" placeholder="Your Name" required />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2 uppercase tracking-wider">Email</label>
                  <input className="input-field" type="email" placeholder="you@institution.edu" required />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2 uppercase tracking-wider">Institution</label>
                  <input className="input-field" placeholder="University / College Name" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2 uppercase tracking-wider">Message</label>
                  <textarea className="input-field min-h-[120px] resize-none" placeholder="Tell us about your needs..." required />
                </div>
                <button type="submit" className="btn-primary w-full text-center">Send Message →</button>
              </form>
            )}
          </motion.div>

          <div className="space-y-5">
            {[
              { icon: "📧", title: "Email", content: "contact@insightu.ai", sub: "Typical response within 24 hours" },
              { icon: "🏢", title: "Headquarters", content: "InsightU Technologies", sub: "Serving institutions worldwide" },
              { icon: "🕐", title: "Support Hours", content: "Mon–Fri, 9am–6pm IST", sub: "Enterprise support available 24/7" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="glass card card-hover"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aurora/20 to-aurora/5 border border-aurora/20 flex items-center justify-center text-sm">{item.icon}</div>
                  <h3 className="font-display text-sm">{item.title}</h3>
                </div>
                <p className="text-white/70 text-sm ml-12">{item.content}</p>
                <p className="text-white/30 text-xs ml-12 mt-1">{item.sub}</p>
              </motion.div>
            ))}

            {/* Trust section */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass card bg-cta-gradient"
            >
              <h3 className="font-display text-sm mb-3">Why institutions choose InsightU</h3>
              <div className="space-y-2">
                {[
                  "Fully explainable AI predictions",
                  "Built-in fairness monitoring",
                  "Easy CSV & API integration",
                  "Dedicated onboarding support",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-white/50">
                    <svg className="w-3.5 h-3.5 text-mint flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}
