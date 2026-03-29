"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import DashboardShell from "../../../../components/DashboardShell"
import { apiGet, apiDelete, apiUploadMaterial, getToken } from "../../../../lib/api"

const FILE_TYPE_ICONS = {
  pdf: "📕", docx: "📘", doc: "📘", pptx: "📙", ppt: "📙",
  xlsx: "📗", xls: "📗", csv: "📊", txt: "📄", png: "🖼️", jpg: "🖼️", jpeg: "🖼️",
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function ResultBanner({ result, onClose }) {
  if (!result) return null
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className={`rounded-xl p-4 border flex items-start justify-between gap-3 ${
        result.error ? "bg-danger/10 border-danger/20 text-danger" : "bg-mint/10 border-mint/20 text-mint"
      }`}
    >
      <span className="text-sm">{result.error ? `✕ ${result.error}` : `✓ ${result.success}`}</span>
      <button onClick={onClose} className="text-white/40 hover:text-white text-sm">✕</button>
    </motion.div>
  )
}

export default function StudyMaterialsPage() {
  const [subject, setSubject] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState("everyone")
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMaterials = async () => {
    try {
      const data = await apiGet("/materials/")
      setMaterials(data || [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { fetchMaterials() }, [])

  const handleUpload = async () => {
    if (!file || !subject.trim() || !title.trim()) return
    if (!getToken()) { setResult({ error: "Session expired — please log in again." }); return }
    setUploading(true)
    setResult(null)
    try {
      // Build FormData manually to include visibility
      const token = getToken()
      const form = new FormData()
      form.append("file", file)
      form.append("subject", subject.trim())
      form.append("title", title.trim())
      form.append("description", description.trim())
      form.append("visibility", visibility)
      const res = await fetch("http://localhost:8000/api/v1/materials/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || "Upload failed")
      }
      setResult({ success: `"${title}" uploaded successfully (${visibility === "everyone" ? "visible to all students" : "visible to your students"})` })
      setFile(null); setSubject(""); setTitle(""); setDescription("")
      fetchMaterials()
    } catch (err) {
      setResult({ error: err.message })
    } finally { setUploading(false) }
  }

  const handleDelete = async (id) => {
    try {
      await apiDelete(`/materials/${id}`)
      setMaterials((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      setResult({ error: err.message })
    }
  }

  return (
    <DashboardShell title="Study Materials">
      <AnimatePresence>
        {result && <ResultBanner result={result} onClose={() => setResult(null)} />}
      </AnimatePresence>

      {/* Upload form */}
      <div className="glass card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-plasma/20 to-plasma/5 border border-plasma/20 flex items-center justify-center text-sm">📚</div>
          <div>
            <h3 className="font-display text-sm">Upload Study Material</h3>
            <p className="text-xs text-white/40">Share notes, slides, and documents with students</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Subject *</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" placeholder="e.g. Mathematics" />
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="e.g. Calculus Chapter 3 Notes" />
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Description (optional)</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" placeholder="Brief description of the material" />
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Visibility *</label>
            <div className="flex gap-2">
              <button onClick={() => setVisibility("everyone")}
                className={`flex-1 px-3 py-2.5 rounded-xl text-xs transition-all border text-center ${
                  visibility === "everyone"
                    ? "bg-mint/10 border-mint/30 text-mint"
                    : "border-white/[0.08] text-white/40 hover:text-white/70"
                }`}
              >🌐 Everyone</button>
              <button onClick={() => setVisibility("my_students")}
                className={`flex-1 px-3 py-2.5 rounded-xl text-xs transition-all border text-center ${
                  visibility === "my_students"
                    ? "bg-aurora/10 border-aurora/30 text-aurora"
                    : "border-white/[0.08] text-white/40 hover:text-white/70"
                }`}
              >👨‍🎓 My Students</button>
            </div>
            <p className="text-[10px] text-white/25 mt-1.5">
              {visibility === "everyone"
                ? "All students on the platform can access this material"
                : "Only students enrolled in this subject can access this material"
              }
            </p>
          </div>
        </div>

        {/* File drop zone */}
        <div className={`relative rounded-xl border-2 border-dashed p-6 transition-all text-center mb-4 ${
          file ? "border-plasma/30 bg-plasma/5" : "border-white/10 hover:border-white/20"
        }`}>
          <input type="file" accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">📎</span>
              <div className="text-left">
                <p className="text-sm text-white/80 font-medium">{file.name}</p>
                <p className="text-xs text-white/40">{formatSize(file.size)}</p>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-2xl block mb-1">📁</span>
              <p className="text-sm text-white/50">Drop a file here or <span className="text-plasma">click to browse</span></p>
              <p className="text-xs text-white/25 mt-1">PDF, DOCX, PPTX, TXT, XLSX, images • Max 20 MB</p>
            </div>
          )}
        </div>

        <button onClick={handleUpload} disabled={!file || !subject.trim() || !title.trim() || uploading}
          className="btn-primary w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
              Uploading...
            </span>
          ) : "Upload Material →"}
        </button>
      </div>

      {/* Existing materials */}
      <div className="glass card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aurora/20 to-aurora/5 border border-aurora/20 flex items-center justify-center text-sm">📋</div>
          <div>
            <h3 className="font-display text-sm">Uploaded Materials</h3>
            <p className="text-xs text-white/40">{materials.length} file(s) available</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-white/30 text-sm">Loading...</div>
        ) : materials.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-3xl block mb-2">📂</span>
            <p className="text-sm text-white/40">No materials uploaded yet</p>
            <p className="text-xs text-white/25 mt-1">Upload your first study material above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {materials.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-4 bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.06] hover:bg-white/[0.05] transition-all">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xl">{FILE_TYPE_ICONS[m.file_type] || "📄"}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-white/80 font-medium truncate">{m.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/40">{m.subject} • {formatSize(m.file_size)}</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] ${
                        m.visibility === "everyone"
                          ? "bg-mint/10 text-mint border border-mint/20"
                          : "bg-aurora/10 text-aurora border border-aurora/20"
                      }`}>
                        {m.visibility === "everyone" ? "🌐 Everyone" : "👨‍🎓 My Students"}
                      </span>
                    </div>
                    {m.description && <p className="text-xs text-white/25 mt-0.5 truncate">{m.description}</p>}
                  </div>
                </div>
                <button onClick={() => handleDelete(m.id)}
                  className="text-xs text-danger/60 hover:text-danger px-2 py-1 rounded-lg hover:bg-danger/10 transition-all shrink-0"
                >🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
