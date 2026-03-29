"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import DashboardShell from "../../../../components/DashboardShell"
import { apiUploadCSV, apiPost, getToken } from "../../../../lib/api"

const TABS = [
  { id: "csv", label: "CSV Upload", icon: "📄" },
  { id: "database", label: "Database Connect", icon: "🗄️" },
  { id: "manual", label: "Manual Entry", icon: "✏️" },
]

const RECORD_TYPES = [
  { value: "students", label: "Students" },
  { value: "academic", label: "Academic Records" },
  { value: "attendance", label: "Attendance Records" },
  { value: "behavioral", label: "Behavioral Logs" },
]

const CSV_SAMPLES = {
  students: "cohort,program,enrollment_date\n2024,Computer Science,2024-08-20\n2024,Physics,2024-08-20",
  academic: "student_id,subject,score,term,date\n1,Math,88,Fall,2025-09-01\n1,Physics,90,Fall,2025-09-01",
  attendance: "student_id,attended,date\n1,1,2025-09-01\n1,0,2025-09-08",
  behavioral: "student_id,assignment_delay_days,lms_inactive_days,date\n1,5,3,2025-09-01",
}

const DB_TYPES = [
  { value: "mysql", label: "MySQL", port: 3306 },
  { value: "postgresql", label: "PostgreSQL", port: 5432 },
  { value: "sqlite", label: "SQLite", port: 0 },
]



function ResultBanner({ result, onClose }) {
  if (!result) return null
  const isError = result.error || result.errors?.length > 0
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className={`rounded-xl p-4 border flex items-start justify-between gap-3 ${
        isError && !result.created
          ? "bg-danger/10 border-danger/20 text-danger"
          : "bg-mint/10 border-mint/20 text-mint"
      }`}
    >
      <div>
        {result.created != null && <p className="font-medium text-sm">✓ {result.created} records created</p>}
        {result.skipped != null && result.skipped > 0 && <p className="text-xs mt-1 opacity-70">{result.skipped} skipped</p>}
        {result.total_rows != null && <p className="text-xs mt-1 opacity-70">{result.total_rows} total rows found</p>}
        {result.error && <p className="text-sm">{result.error}</p>}
        {result.errors?.length > 0 && (
          <details className="mt-2">
            <summary className="text-xs cursor-pointer opacity-70">{result.errors.length} error(s) — click to expand</summary>
            <ul className="text-xs mt-1 space-y-0.5 opacity-60">
              {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </details>
        )}
      </div>
      <button onClick={onClose} className="text-white/40 hover:text-white text-sm">✕</button>
    </motion.div>
  )
}

/* ──────── CSV Upload Tab ──────── */
function CSVUploadTab() {
  const [recordType, setRecordType] = useState("students")
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const handleUpload = async () => {
    if (!file) return
    if (!getToken()) {
      setResult({ error: "Session expired — please log in again." })
      return
    }
    setUploading(true)
    setResult(null)
    try {
      const path = recordType === "students"
        ? "/students/upload-csv"
        : `/records/upload-csv?record_type=${recordType}`
      const res = await apiUploadCSV(path, file)
      setResult(res)
      setFile(null)
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.name.endsWith(".csv")) setFile(f)
  }

  const downloadSample = () => {
    const text = CSV_SAMPLES[recordType]
    const blob = new Blob([text], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sample_${recordType}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>{result && <ResultBanner result={result} onClose={() => setResult(null)} />}</AnimatePresence>

      {/* Record type selector */}
      <div className="glass card">
        <h3 className="text-sm font-display mb-3">Select Record Type</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RECORD_TYPES.map((t) => (
            <button key={t.value} onClick={() => { setRecordType(t.value); setFile(null); setResult(null) }}
              className={`px-3 py-2.5 rounded-xl text-sm transition-all border ${
                recordType === t.value
                  ? "bg-aurora/10 border-aurora/30 text-aurora"
                  : "border-white/[0.06] text-white/50 hover:border-white/20 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div className="glass card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-display">Upload CSV File</h3>
          <button onClick={downloadSample} className="text-xs text-aurora hover:text-white transition-colors flex items-center gap-1.5">
            <span>⬇</span> Download Sample
          </button>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 border-dashed p-8 transition-all text-center ${
            dragOver ? "border-aurora/50 bg-aurora/5" : "border-white/10 hover:border-white/20"
          }`}
        >
          <input
            type="file" accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">📎</span>
              <div className="text-left">
                <p className="text-sm text-white/80 font-medium">{file.name}</p>
                <p className="text-xs text-white/40">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-3xl block mb-2">📂</span>
              <p className="text-sm text-white/50">Drag & drop a CSV file here, or <span className="text-aurora">click to browse</span></p>
            </div>
          )}
        </div>

        <button onClick={handleUpload} disabled={!file || uploading}
          className="btn-primary w-full mt-4 text-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
              Uploading...
            </span>
          ) : `Upload ${RECORD_TYPES.find((t) => t.value === recordType)?.label} →`}
        </button>
      </div>

      {/* Sample format reference */}
      <div className="glass card">
        <h3 className="text-sm font-display mb-3">Expected CSV Format</h3>
        <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.06] overflow-x-auto">
          <pre className="text-xs text-white/50 font-mono whitespace-pre">{CSV_SAMPLES[recordType]}</pre>
        </div>
      </div>
    </div>
  )
}

/* ──────── Database Connect Tab ──────── */
function DatabaseConnectTab() {
  const [dbType, setDbType] = useState("mysql")
  const [host, setHost] = useState("localhost")
  const [port, setPort] = useState(3306)
  const [database, setDatabase] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [testing, setTesting] = useState(false)
  const [connected, setConnected] = useState(null)
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState("")
  const [importType, setImportType] = useState("students")
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)

  const connPayload = { db_type: dbType, host, port, database, username, password }

  const handleTest = async () => {
    setTesting(true)
    setConnected(null)
    setResult(null)
    try {
      const res = await apiPost("/students/test-db", connPayload)
      setConnected(res.success)
      if (res.success) {
        setTables(res.tables)
        if (res.tables.length > 0) setSelectedTable(res.tables[0])
      } else {
        setResult({ error: res.error || "Connection failed" })
      }
    } catch (err) {
      setConnected(false)
      setResult({ error: err.message })
    } finally {
      setTesting(false)
    }
  }

  const handleImport = async () => {
    if (!selectedTable) return
    if (!getToken()) {
      setResult({ error: "Session expired — please log in again." })
      return
    }
    setImporting(true)
    setResult(null)
    try {
      let path, body
      if (importType === "students") {
        path = "/students/import-db"
        body = { ...connPayload, table_name: selectedTable }
      } else {
        path = "/records/import-db"
        body = {
          ...connPayload,
          table_name: selectedTable,
          record_type: importType,
          col_student_id: "student_id",
          col_date: "date",
          col_subject: "subject",
          col_score: "score",
          col_term: "term",
          col_attended: "attended",
          col_assignment_delay: "assignment_delay_days",
          col_lms_inactive: "lms_inactive_days",
        }
      }
      const res = await apiPost(path, body)
      setResult(res)
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>{result && <ResultBanner result={result} onClose={() => setResult(null)} />}</AnimatePresence>

      {/* Connection form */}
      <div className="glass card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon/20 to-neon/5 border border-neon/20 flex items-center justify-center text-sm">🗄️</div>
          <div>
            <h3 className="font-display text-sm">Database Connection</h3>
            <p className="text-xs text-white/40">Connect to your college's database to import student records</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          {DB_TYPES.map((t) => (
            <button key={t.value}
              onClick={() => { setDbType(t.value); setPort(t.port); setConnected(null); setTables([]) }}
              className={`px-3 py-2.5 rounded-xl text-sm transition-all border ${
                dbType === t.value
                  ? "bg-neon/10 border-neon/30 text-neon"
                  : "border-white/[0.06] text-white/50 hover:border-white/20"
              }`}
            >{t.label}</button>
          ))}
        </div>

        {dbType !== "sqlite" ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Host</label>
              <input value={host} onChange={(e) => setHost(e.target.value)} className="input-field" placeholder="localhost" />
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Port</label>
              <input type="number" value={port} onChange={(e) => setPort(+e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Database Name</label>
              <input value={database} onChange={(e) => setDatabase(e.target.value)} className="input-field" placeholder="college_db" />
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="input-field" placeholder="root" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Database File Path</label>
            <input value={database} onChange={(e) => setDatabase(e.target.value)} className="input-field" placeholder="/path/to/college.db" />
          </div>
        )}

        <button onClick={handleTest} disabled={testing || !database}
          className="btn-primary mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {testing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
              Testing...
            </span>
          ) : "Test Connection →"}
        </button>

        {connected === true && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-mint/10 border border-mint/20 text-mint text-sm flex items-center gap-2">
            <span>✓</span> Connected — {tables.length} table(s) found
          </div>
        )}
        {connected === false && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
            ✕ Connection failed
          </div>
        )}
      </div>

      {/* Import section (shown after successful connection) */}
      {connected === true && tables.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass card">
          <h3 className="text-sm font-display mb-4">Import Records</h3>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Source Table</label>
              <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}
                className="input-field bg-ink"
              >
                {tables.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Import As</label>
              <select value={importType} onChange={(e) => setImportType(e.target.value)}
                className="input-field bg-ink"
              >
                {RECORD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleImport} disabled={importing}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {importing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                Importing...
              </span>
            ) : `Import from "${selectedTable}" →`}
          </button>
        </motion.div>
      )}
    </div>
  )
}

/* ──────── Manual Entry Tab ──────── */
function ManualEntryTab() {
  const [recordType, setRecordType] = useState("students")
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)

  // Student fields
  const [cohort, setCohort] = useState("")
  const [program, setProgram] = useState("")
  const [enrollDate, setEnrollDate] = useState("")
  const [userEmail, setUserEmail] = useState("")

  // Academic fields
  const [studentId, setStudentId] = useState("")
  const [subject, setSubject] = useState("")
  const [score, setScore] = useState("")
  const [term, setTerm] = useState("")
  const [date, setDate] = useState("")

  // Attendance fields
  const [attended, setAttended] = useState(true)

  // Behavioral fields
  const [delay, setDelay] = useState("")
  const [inactive, setInactive] = useState("")

  const resetFields = () => {
    setCohort(""); setProgram(""); setEnrollDate(""); setUserEmail("")
    setStudentId(""); setSubject(""); setScore(""); setTerm(""); setDate("")
    setAttended(true); setDelay(""); setInactive("")
  }

  const handleSave = async () => {
    if (!getToken()) {
      setResult({ error: "Session expired — please log in again." })
      return
    }
    setSaving(true)
    setResult(null)
    try {
      let path, body
      if (recordType === "students") {
        path = "/students/"
        body = {
          cohort: cohort || null,
          program: program || null,
          enrollment_date: enrollDate || null,
          user_email: userEmail || null,
        }
      } else if (recordType === "academic") {
        path = "/records/academic"
        body = { student_id: +studentId, subject, score: +score, term, date }
      } else if (recordType === "attendance") {
        path = "/records/attendance"
        body = { student_id: +studentId, attended, date }
      } else {
        path = "/records/behavioral"
        body = {
          student_id: +studentId,
          assignment_delay_days: +delay,
          lms_inactive_days: +inactive,
          date,
        }
      }
      await apiPost(path, body)
      setResult({ created: 1 })
      resetFields()
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>{result && <ResultBanner result={result} onClose={() => setResult(null)} />}</AnimatePresence>

      <div className="glass card">
        <h3 className="text-sm font-display mb-3">Record Type</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RECORD_TYPES.map((t) => (
            <button key={t.value} onClick={() => { setRecordType(t.value); resetFields(); setResult(null) }}
              className={`px-3 py-2.5 rounded-xl text-sm transition-all border ${
                recordType === t.value
                  ? "bg-aurora/10 border-aurora/30 text-aurora"
                  : "border-white/[0.06] text-white/50 hover:border-white/20"
              }`}
            >{t.label}</button>
          ))}
        </div>
      </div>

      <div className="glass card">
        <h3 className="text-sm font-display mb-4">Enter Details</h3>

        {recordType === "students" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Cohort</label>
                <input value={cohort} onChange={(e) => setCohort(e.target.value)} className="input-field" placeholder="e.g. 2024" />
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Program</label>
                <input value={program} onChange={(e) => setProgram(e.target.value)} className="input-field" placeholder="e.g. Computer Science" />
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Enrollment Date</label>
                <input type="date" value={enrollDate} onChange={(e) => setEnrollDate(e.target.value)} className="input-field" />
              </div>
            </div>
            <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.06]">
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">🔗 Link to User Email (optional)</label>
              <input value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="input-field" placeholder="e.g. ava@consistiq.edu — links student to their login" />
              <p className="text-xs text-white/25 mt-1.5">If provided, this student's data will appear on that user's student dashboard</p>
            </div>
          </div>
        )}

        {recordType === "academic" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Student ID</label>
              <input type="number" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="input-field" placeholder="1" />
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Subject</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" placeholder="e.g. Math" />
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Score</label>
              <input type="number" value={score} onChange={(e) => setScore(e.target.value)} className="input-field" placeholder="88" />
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Term</label>
              <input value={term} onChange={(e) => setTerm(e.target.value)} className="input-field" placeholder="e.g. Fall" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
            </div>
          </div>
        )}

        {recordType === "attendance" && (
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Student ID</label>
              <input type="number" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="input-field" placeholder="1" />
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Attended</label>
              <div className="flex gap-3 mt-1">
                <button onClick={() => setAttended(true)} className={`px-4 py-2 rounded-xl text-sm border ${attended ? "bg-mint/10 border-mint/30 text-mint" : "border-white/[0.06] text-white/40"}`}>✓ Yes</button>
                <button onClick={() => setAttended(false)} className={`px-4 py-2 rounded-xl text-sm border ${!attended ? "bg-danger/10 border-danger/30 text-danger" : "border-white/[0.06] text-white/40"}`}>✕ No</button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
            </div>
          </div>
        )}

        {recordType === "behavioral" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Student ID</label>
              <input type="number" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="input-field" placeholder="1" />
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Assignment Delay (days)</label>
              <input type="number" value={delay} onChange={(e) => setDelay(e.target.value)} className="input-field" placeholder="5" />
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">LMS Inactive (days)</label>
              <input type="number" value={inactive} onChange={(e) => setInactive(e.target.value)} className="input-field" placeholder="3" />
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
            </div>
          </div>
        )}

        <button onClick={handleSave} disabled={saving}
          className="btn-primary w-full mt-5 text-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
              Saving...
            </span>
          ) : `Save ${RECORD_TYPES.find((t) => t.value === recordType)?.label.replace(/s$/, "")} →`}
        </button>
      </div>
    </div>
  )
}






/* ──────── Main Page ──────── */
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function ManageDataPage() {
  const [activeTab, setActiveTab] = useState("csv")
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState(null)

  const handleRunPredictions = async () => {
    setRunning(true)
    setRunResult(null)
    try {
      const res = await apiPost("/predictions/run")
      setRunResult(res)
    } catch (err) {
      setRunResult({ error: err.message })
    } finally {
      setRunning(false)
    }
  }

  return (
    <DashboardShell title="Manage Data">
      {/* Tab switcher */}
      <div className="glass card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aurora/20 to-neon/10 border border-aurora/20 flex items-center justify-center text-sm">📁</div>
          <div>
            <h3 className="font-display text-sm">Import Student Records</h3>
            <p className="text-xs text-white/40">Choose how you'd like to add data to InsightU</p>
          </div>
        </div>
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all border ${
                activeTab === tab.id
                  ? "bg-white/[0.06] border-white/[0.12] text-white"
                  : "border-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} variants={fadeIn} initial="hidden" animate="visible">
          {activeTab === "csv" && <CSVUploadTab />}
          {activeTab === "database" && <DatabaseConnectTab />}
          {activeTab === "manual" && <ManualEntryTab />}
        </motion.div>
      </AnimatePresence>

      {/* Run Predictions — after importing data */}
      <div className="glass card bg-cta-gradient">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-aurora/20 to-neon/10 border border-aurora/20 flex items-center justify-center text-lg">⚡</div>
            <div>
              <h3 className="font-display text-sm">Run ML Predictions</h3>
              <p className="text-xs text-white/40">After importing data, run predictions on all students</p>
            </div>
          </div>
          <button onClick={handleRunPredictions} disabled={running}
            className="btn-primary whitespace-nowrap disabled:opacity-50"
          >
            {running ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                Running Pipeline...
              </span>
            ) : "Run Predictions →"}
          </button>
        </div>
        {runResult && !runResult.error && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-mint/10 border border-mint/20 text-mint text-sm flex items-center gap-2">
            <span>✓</span> Generated {runResult.generated} predictions successfully
          </div>
        )}
        {runResult?.error && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">{runResult.error}</div>
        )}
      </div>
    </DashboardShell>
  )
}

