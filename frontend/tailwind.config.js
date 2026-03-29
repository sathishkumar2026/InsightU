/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./pages/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#06080f",
        surface: "#0c1120",
        "surface-light": "#131a2e",
        aurora: "#7dd3fc",
        ember: "#f97316",
        mint: "#34d399",
        neon: "#a78bfa",
        plasma: "#f472b6",
        danger: "#ef4444",
        slate: { 400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a" },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
      },
      backgroundImage: {
        hero: "radial-gradient(900px 500px at 15% 15%, rgba(125,211,252,0.14), transparent 55%), radial-gradient(800px 500px at 85% 20%, rgba(167,139,250,0.12), transparent 50%), radial-gradient(600px 400px at 50% 80%, rgba(249,115,22,0.08), transparent 50%), linear-gradient(160deg, #06080f, #0c1120, #0f172a)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
        "glow-aurora": "radial-gradient(200px 200px at 50% 50%, rgba(125,211,252,0.15), transparent)",
        "glow-neon": "radial-gradient(200px 200px at 50% 50%, rgba(167,139,250,0.15), transparent)",
        "glow-mint": "radial-gradient(200px 200px at 50% 50%, rgba(52,211,153,0.15), transparent)",
        "cta-gradient": "linear-gradient(135deg, rgba(125,211,252,0.1), rgba(167,139,250,0.1), rgba(244,114,182,0.08))",
        "mesh": "radial-gradient(at 40% 20%, rgba(125,211,252,0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(167,139,250,0.08) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(52,211,153,0.06) 0px, transparent 50%), radial-gradient(at 80% 50%, rgba(244,114,182,0.05) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(125,211,252,0.08) 0px, transparent 50%)",
      },
      boxShadow: {
        glow: "0 0 30px -5px rgba(125,211,252,0.25)",
        "glow-sm": "0 0 15px -3px rgba(125,211,252,0.2)",
        "glow-lg": "0 0 60px -10px rgba(125,211,252,0.3)",
        "glow-neon": "0 0 30px -5px rgba(167,139,250,0.25)",
        "glow-ember": "0 0 30px -5px rgba(249,115,22,0.25)",
        "glow-mint": "0 0 30px -5px rgba(52,211,153,0.25)",
        "glow-plasma": "0 0 30px -5px rgba(244,114,182,0.25)",
        premium: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
        "premium-lg": "0 16px 64px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: 0.4 },
          "50%": { opacity: 1 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "slide-up": {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: 0.5 },
          "50%": { transform: "scale(1)", opacity: 0 },
          "100%": { transform: "scale(0.8)", opacity: 0 },
        },
        "mesh-drift": {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "33%": { transform: "translate(30px, -30px) rotate(120deg)" },
          "66%": { transform: "translate(-20px, 20px) rotate(240deg)" },
        },
        "data-flow": {
          "0%": { transform: "translateY(0)", opacity: 0 },
          "10%": { opacity: 1 },
          "90%": { opacity: 1 },
          "100%": { transform: "translateY(100%)", opacity: 0 },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "slide-up": "slide-up 0.6s ease-out",
        "gradient-x": "gradient-x 6s ease infinite",
        "spin-slow": "spin-slow 12s linear infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "mesh-drift": "mesh-drift 20s ease-in-out infinite",
        "data-flow": "data-flow 3s ease-in-out infinite",
        "scale-in": "scale-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
}
