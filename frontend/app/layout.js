import "./globals.css"
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google"
import ConditionalNavFooter from "../components/ConditionalNavFooter"

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" })
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-body" })

export const metadata = {
  title: "InsightU — Explainable AI Platform for Student Performance Analytics",
  description: "InsightU is an AI-powered platform for student performance consistency analysis with explainable predictions, early intervention, fairness monitoring, and data-driven academic success tracking. Trusted by 50+ institutions.",
  keywords: "explainable AI, student performance, academic analytics, early intervention, consistency tracking, machine learning, education technology",
  openGraph: {
    title: "InsightU — Explainable AI Platform",
    description: "Detect inconsistency early. Explain it clearly. Intervene effectively.",
    type: "website",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-ink text-white font-body antialiased noise">
        <ConditionalNavFooter>{children}</ConditionalNavFooter>
      </body>
    </html>
  )
}
