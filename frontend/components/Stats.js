"use client"

import AnimatedCounter from "./AnimatedCounter"

export default function Stats() {
  const stats = [
    { label: "Students Monitored", value: 12500, suffix: "+", icon: "👥" },
    { label: "Early Risks Caught", value: 934, suffix: "", icon: "🎯" },
    { label: "Intervention Success", value: 78, suffix: "%", icon: "📈" },
    { label: "Institutions Served", value: 50, suffix: "+", icon: "🏛️" },
  ]
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
      {stats.map((s) => (
        <div key={s.label} className="glass card card-hover text-center group relative overflow-hidden">
          {/* Glow on hover */}
          <div className="absolute inset-0 bg-glow-aurora opacity-0 group-hover:opacity-30 transition-opacity duration-500" />

          <div className="relative z-10">
            <span className="text-xl mb-2 block">{s.icon}</span>
            <div className="text-3xl font-display text-gradient">
              <AnimatedCounter value={s.value} />{s.suffix}
            </div>
            <div className="text-white/40 text-sm mt-2">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
