"use client"

import { motion } from "framer-motion"

const dataNodes = [
  { x: 15, y: 20, label: "GPA", value: "3.2", color: "#7dd3fc", delay: 0 },
  { x: 75, y: 15, label: "Risk", value: "42%", color: "#f97316", delay: 0.3 },
  { x: 50, y: 50, label: "CI", value: "68", color: "#a78bfa", delay: 0.6, large: true },
  { x: 20, y: 70, label: "Attend", value: "78%", color: "#34d399", delay: 0.9 },
  { x: 80, y: 65, label: "Drift", value: "↑", color: "#f472b6", delay: 1.2 },
  { x: 45, y: 85, label: "Delay", value: "4d", color: "#ef4444", delay: 1.5 },
]

const connections = [
  [0, 2], [1, 2], [2, 3], [2, 4], [3, 5], [4, 5],
]

export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square">
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-aurora/10"
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        {connections.map(([from, to], i) => (
          <motion.line
            key={i}
            x1={dataNodes[from].x} y1={dataNodes[from].y}
            x2={dataNodes[to].x} y2={dataNodes[to].y}
            stroke="rgba(125,211,252,0.15)"
            strokeWidth="0.3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
          />
        ))}

        {/* Data flow particles along connections */}
        {connections.map(([from, to], i) => (
          <motion.circle
            key={`p-${i}`}
            r="0.8"
            fill="#7dd3fc"
            initial={{ opacity: 0 }}
            animate={{
              cx: [dataNodes[from].x, dataNodes[to].x],
              cy: [dataNodes[from].y, dataNodes[to].y],
              opacity: [0, 0.8, 0],
            }}
            transition={{ duration: 2.5, delay: 2 + i * 0.6, repeat: Infinity, repeatDelay: 3 }}
          />
        ))}
      </svg>

      {/* Data nodes */}
      {dataNodes.map((node, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: node.delay + 0.5, duration: 0.8 }}
        >
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `1px solid ${node.color}30` }}
            animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 3, delay: node.delay, repeat: Infinity }}
          />

          {/* Node */}
          <div
            className={`relative ${node.large ? "w-20 h-20" : "w-14 h-14"} rounded-full flex flex-col items-center justify-center`}
            style={{
              background: `radial-gradient(circle, ${node.color}15, ${node.color}05)`,
              border: `1px solid ${node.color}30`,
              boxShadow: `0 0 20px ${node.color}15`,
            }}
          >
            <span className="text-xs font-display" style={{ color: node.color }}>{node.value}</span>
            <span className="text-[8px] text-white/30 mt-0.5 uppercase tracking-wider">{node.label}</span>
          </div>
        </motion.div>
      ))}

      {/* Center label */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        style={{ pointerEvents: "none" }}
      >
        <div className="absolute inset-0 -m-8 rounded-full bg-neon/5 blur-2xl" />
      </motion.div>
    </div>
  )
}
