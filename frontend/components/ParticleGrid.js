"use client"

export default function ParticleGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Animated mesh gradient */}
      <div className="absolute inset-0 bg-mesh opacity-60" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Floating orbs */}
      <div className="absolute w-[600px] h-[600px] rounded-full top-[-10%] left-[-5%] bg-aurora/[0.07] blur-[100px] animate-mesh-drift" />
      <div className="absolute w-[500px] h-[500px] rounded-full top-[20%] right-[-10%] bg-neon/[0.06] blur-[100px] animate-mesh-drift" style={{ animationDelay: "7s" }} />
      <div className="absolute w-[400px] h-[400px] rounded-full bottom-[-5%] left-[30%] bg-mint/[0.05] blur-[100px] animate-mesh-drift" style={{ animationDelay: "14s" }} />

      {/* Subtle dot pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.15]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(125,211,252,0.5)" />
          </pattern>
          <radialGradient id="fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="dotmask">
            <rect width="100%" height="100%" fill="url(#fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" mask="url(#dotmask)" />
      </svg>
    </div>
  )
}
