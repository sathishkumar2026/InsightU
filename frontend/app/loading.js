export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        {/* Logo */}
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora to-neon flex items-center justify-center text-ink font-bold text-lg">
            iU
          </div>
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-xl border border-aurora/20 animate-pulse-ring" />
          <div className="absolute inset-0 rounded-xl border border-aurora/20 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-aurora to-neon rounded-full animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
        </div>

        <p className="text-sm text-white/40">Loading InsightU...</p>
      </div>
    </div>
  )
}
