"use client"

import { motion } from "framer-motion"

export default function SectionHeader({ title, subtitle }) {
  return (
    <div className="max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-10 bg-gradient-to-r from-aurora/60 to-transparent" />
          <p className="text-sm uppercase tracking-[0.3em] text-aurora/80 font-medium">{subtitle}</p>
        </div>
        <h2 className="text-4xl md:text-5xl font-display leading-tight">{title}</h2>
      </motion.div>
    </div>
  )
}
