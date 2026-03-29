"use client"

import { motion } from "framer-motion"

export default function FeatureCard({ icon, title, description, index }) {
  return (
    <div className="glass card card-hover group relative overflow-hidden">
      {/* Animated corner glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-aurora/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Index number */}
      {typeof index === "number" && (
        <span className="absolute top-4 right-4 text-xs font-display text-white/10 group-hover:text-aurora/20 transition-colors">
          {String(index + 1).padStart(2, "0")}
        </span>
      )}

      {/* Icon with glow */}
      <div className="relative inline-block mb-3">
        <span className="text-2xl block relative z-10">{icon || "✦"}</span>
        <div className="absolute inset-0 scale-150 bg-aurora/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <h3 className="text-lg font-display group-hover:text-aurora transition-colors duration-200">{title}</h3>
      <p className="mt-2 text-white/50 text-sm leading-relaxed">{description}</p>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aurora/0 group-hover:via-aurora/30 to-transparent transition-all duration-500" />
    </div>
  )
}
