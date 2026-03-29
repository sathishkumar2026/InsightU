"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import DashboardShell from "../../../../components/DashboardShell"
import { apiGet } from "../../../../lib/api"

const API_BASE = "http://localhost:8000/api/v1"

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.3 } }),
}

const FILE_TYPE_ICONS = {
  pdf: "📕", docx: "📘", doc: "📘", pptx: "📙", ppt: "📙",
  xlsx: "📗", xls: "📗", csv: "📊", txt: "📄", png: "🖼️", jpg: "🖼️", jpeg: "🖼️",
}

const STUDY_TIP_SECTIONS = [
  {
    title: "Study Strategies", icon: "📝", description: "Evidence-based techniques to improve your learning",
    items: [
      { title: "Active Recall", desc: "Test yourself on material instead of just re-reading notes. Use flashcards or practice questions.", icon: "🧠" },
      { title: "Spaced Repetition", desc: "Review material at increasing intervals: 1 day, 3 days, 1 week, 2 weeks.", icon: "📅" },
      { title: "Feynman Technique", desc: "Explain concepts in simple terms. If you can't, you don't understand it well enough.", icon: "💡" },
      { title: "Interleaving", desc: "Mix different subjects while studying instead of focusing on one topic for hours.", icon: "🔄" },
    ],
  },
  {
    title: "Time Management", icon: "⏰", description: "Organize your day for maximum productivity",
    items: [
      { title: "Pomodoro Technique", desc: "Work in 25-minute focused bursts, then take 5-minute breaks. After 4 rounds, take a 15-minute break.", icon: "🍅" },
      { title: "Priority Matrix", desc: "Categorize tasks as urgent/important. Do urgent+important first, schedule important but not urgent.", icon: "📊" },
      { title: "Two-Minute Rule", desc: "If a task takes less than 2 minutes, do it immediately instead of adding it to your to-do list.", icon: "⚡" },
      { title: "Weekly Planning", desc: "Every Sunday, plan your week. Block out study time, classes, and assignment deadlines.", icon: "📋" },
    ],
  },
  {
    title: "Assignment Success", icon: "📋", description: "Tips for submitting quality work on time",
    items: [
      { title: "Break It Down", desc: "Split large assignments into small daily tasks. A 10-page paper becomes 2 pages per day.", icon: "✂️" },
      { title: "Start Early", desc: "Begin assignments the day they're given. Even 15 minutes of initial work reduces procrastination.", icon: "🚀" },
      { title: "Set Buffer Deadlines", desc: "Set your personal deadline 2 days before the actual due date for review time.", icon: "🛡️" },
      { title: "Use Templates", desc: "Create reusable templates for common assignment types to speed up your workflow.", icon: "📄" },
    ],
  },
  {
    title: "Mental Health & Wellbeing", icon: "🧘", description: "Take care of yourself to perform your best",
    items: [
      { title: "Sleep Hygiene", desc: "Aim for 7-9 hours. Consistent sleep schedules improve memory consolidation.", icon: "😴" },
      { title: "Regular Exercise", desc: "Even 20 minutes of walking boosts concentration and reduces anxiety.", icon: "🏃" },
      { title: "Seek Help Early", desc: "If you're struggling, reach out to counseling services before it becomes overwhelming.", icon: "🤝" },
      { title: "Digital Detox", desc: "Set specific times to disconnect from social media during study sessions.", icon: "📱" },
    ],
  },
  {
    title: "Campus Support", icon: "🏫", description: "Available resources at your institution",
    items: [
      { title: "Academic Advising", desc: "Meet with your advisor to discuss course load, academic plans, and career goals.", icon: "🗺️" },
      { title: "Tutoring Center", desc: "Free peer tutoring available for most subjects. Drop-in or schedule appointments.", icon: "👨‍🏫" },
      { title: "Writing Center", desc: "Get help with essays, reports, and research papers at any stage of writing.", icon: "✍️" },
      { title: "Study Groups", desc: "Form or join study groups through your department or student organizations.", icon: "👥" },
    ],
  },
]

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso) {
  if (!iso) return ""
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

/* ──────── Study Materials Tab ──────── */
function StudyMaterialsContent() {
  const [materials, setMaterials] = useState([])
  const [subjects, setSubjects] = useState([])
  const [activeSubject, setActiveSubject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [mats, subs] = await Promise.all([
          apiGet("/materials/"),
          apiGet("/materials/subjects"),
        ])
        setMaterials(mats || [])
        setSubjects(subs || [])
      } catch { } finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = activeSubject
    ? materials.filter((m) => m.subject === activeSubject)
    : materials

  const handleDownload = (id, filename) => {
    const token = localStorage.getItem("insightu_token")
    const link = document.createElement("a")
    link.href = `${API_BASE}/materials/${id}/download`
    link.setAttribute("download", filename)
    // For authenticated download, use fetch + blob
    fetch(`${API_BASE}/materials/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-aurora animate-spin" />
          </div>
          <p className="text-sm text-white/40">Loading materials...</p>
        </div>
      </div>
    )
  }

  if (materials.length === 0) {
    return (
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <div className="glass card text-center py-12">
          <span className="text-4xl block mb-3">📂</span>
          <h3 className="font-display text-sm mb-1">No Study Materials Yet</h3>
          <p className="text-xs text-white/40 max-w-sm mx-auto">
            Your faculty hasn't uploaded any study materials yet. Check back soon, or ask them to share notes and resources through InsightU.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Subject filter chips */}
      {subjects.length > 1 && (
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSubject(null)}
              className={`px-3.5 py-2 rounded-xl text-xs transition-all border ${
                !activeSubject
                  ? "bg-aurora/10 border-aurora/30 text-aurora"
                  : "border-white/[0.06] text-white/40 hover:text-white hover:border-white/20"
              }`}
            >All Subjects ({materials.length})</button>
            {subjects.map((s) => (
              <button key={s} onClick={() => setActiveSubject(s)}
                className={`px-3.5 py-2 rounded-xl text-xs transition-all border ${
                  activeSubject === s
                    ? "bg-aurora/10 border-aurora/30 text-aurora"
                    : "border-white/[0.06] text-white/40 hover:text-white hover:border-white/20"
                }`}
              >{s} ({materials.filter((m) => m.subject === s).length})</button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Materials grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((m, i) => (
          <motion.div key={m.id} custom={i + 1} variants={fadeUp} initial="hidden" animate="visible">
            <div className="glass card group hover:border-white/[0.12] transition-all h-full flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-plasma/20 to-plasma/5 border border-plasma/20 flex items-center justify-center text-lg shrink-0">
                  {FILE_TYPE_ICONS[m.file_type] || "📄"}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate">{m.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-aurora/10 text-aurora border border-aurora/20">{m.subject}</span>
                    <span className="text-[10px] text-white/25 uppercase">{m.file_type}</span>
                  </div>
                </div>
              </div>
              {m.description && <p className="text-xs text-white/40 leading-relaxed mb-3">{m.description}</p>}
              <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/[0.04]">
                <div className="text-[10px] text-white/25">
                  <span>by {m.faculty_name}</span> · <span>{formatSize(m.file_size)}</span> · <span>{formatDate(m.uploaded_at)}</span>
                </div>
                <button onClick={() => handleDownload(m.id, m.filename)}
                  className="text-xs text-aurora hover:text-white px-2.5 py-1 rounded-lg hover:bg-aurora/10 border border-transparent hover:border-aurora/20 transition-all"
                >⬇ Download</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ──────── Study Tips Tab ──────── */
function StudyTipsContent() {
  return (
    <div className="space-y-5">
      {STUDY_TIP_SECTIONS.map((section, si) => (
        <motion.div key={section.title} custom={si} variants={fadeUp} initial="hidden" animate="visible">
          <div className="glass card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aurora/20 to-aurora/5 border border-aurora/20 flex items-center justify-center text-sm">{section.icon}</div>
              <div>
                <h3 className="font-display text-sm">{section.title}</h3>
                <p className="text-xs text-white/40">{section.description}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {section.items.map((item, i) => (
                <div key={i} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] hover:bg-white/[0.05] transition-all group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{item.icon}</span>
                    <h4 className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{item.title}</h4>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ──────── Main Page ──────── */
const TABS = [
  { id: "materials", label: "Study Materials", icon: "📚" },
  { id: "tips", label: "Study Tips", icon: "💡" },
]

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState("materials")

  return (
    <DashboardShell title="Resources">
      {/* Header */}
      <div className="glass card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mint/20 to-mint/5 border border-mint/20 flex items-center justify-center text-sm">📖</div>
            <div>
              <h3 className="font-display text-sm">Student Resources</h3>
              <p className="text-xs text-white/40">Study materials from your faculty & curated success strategies</p>
            </div>
          </div>
          <div className="flex gap-2">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs transition-all border ${
                  activeTab === tab.id
                    ? "bg-white/[0.06] border-white/[0.12] text-white"
                    : "border-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                }`}
              >
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "materials" && <StudyMaterialsContent />}
          {activeTab === "tips" && <StudyTipsContent />}
        </motion.div>
      </AnimatePresence>
    </DashboardShell>
  )
}
