import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center relative">
        {/* Background glow */}
        <div className="absolute inset-0 -m-20 bg-glow-aurora opacity-20 blur-3xl" />

        <div className="relative z-10">
          <div className="text-8xl md:text-9xl font-display text-gradient mb-4 animate-float">404</div>
          <h1 className="text-2xl font-display">Page Not Found</h1>
          <p className="text-white/40 mt-3 max-w-md mx-auto">The page you're looking for doesn't exist or has been moved.</p>

          <div className="mt-8 flex justify-center gap-4">
            <Link href="/" className="btn-primary">Back to Home</Link>
            <Link href="/features" className="btn-outline">Explore Features</Link>
          </div>

          <div className="mt-8 flex justify-center gap-6 text-xs text-white/30">
            <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Get Started</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
