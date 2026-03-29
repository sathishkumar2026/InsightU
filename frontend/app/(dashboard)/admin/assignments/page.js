"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import DashboardShell from "../../../../components/DashboardShell"
import { apiGet, apiPost, apiDelete } from "../../../../lib/api"

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
}

export default function AssignmentsPage() {
  const [teachers, setTeachers] = useState([])
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [assigned, setAssigned] = useState([])
  const [unassigned, setUnassigned] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [search, setSearch] = useState("")
  const [selectedUnassigned, setSelectedUnassigned] = useState(new Set())

  const loadTeachers = async () => {
    try {
      const data = await apiGet("/assignments/teachers")
      setTeachers(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadTeachers() }, [])

  const selectTeacher = async (teacher) => {
    setSelectedTeacher(teacher)
    setDetailLoading(true)
    setSelectedUnassigned(new Set())
    try {
      const data = await apiGet(`/assignments/teacher/${teacher.id}/students`)
      setAssigned(data.assigned || [])
      setUnassigned(data.unassigned || [])
    } catch (e) { console.error(e) }
    finally { setDetailLoading(false) }
  }

  const handleAssign = async (studentId) => {
    setResult(null)
    try {
      await apiPost("/assignments/", { teacher_id: selectedTeacher.id, student_id: studentId })
      setResult({ success: "Student assigned successfully" })
      selectTeacher(selectedTeacher)
      loadTeachers()
    } catch (e) { setResult({ error: e.message }) }
  }

  const handleBulkAssign = async () => {
    if (selectedUnassigned.size === 0) return
    setResult(null)
    try {
      const res = await apiPost("/assignments/bulk", {
        teacher_id: selectedTeacher.id,
        student_ids: Array.from(selectedUnassigned),
      })
      setResult({ success: `Assigned ${res.created} students (${res.skipped} skipped)` })
      setSelectedUnassigned(new Set())
      selectTeacher(selectedTeacher)
      loadTeachers()
    } catch (e) { setResult({ error: e.message }) }
  }

  const handleRemove = async (assignmentId) => {
    setResult(null)
    try {
      await apiDelete(`/assignments/${assignmentId}`)
      setResult({ success: "Assignment removed" })
      selectTeacher(selectedTeacher)
      loadTeachers()
    } catch (e) { setResult({ error: e.message }) }
  }

  const toggleSelect = (studentId) => {
    setSelectedUnassigned((prev) => {
      const next = new Set(prev)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  const toggleSelectAll = () => {
    const filtered = unassigned.filter((s) => {
      if (!search) return true
      return s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    })
    if (selectedUnassigned.size === filtered.length) {
      setSelectedUnassigned(new Set())
    } else {
      setSelectedUnassigned(new Set(filtered.map((s) => s.student_id)))
    }
  }

  const filteredUnassigned = unassigned.filter((s) => {
    if (!search) return true
    return (
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.program || "").toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <DashboardShell title="Teacher-Student Assignments">
      {/* Result banner */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-xl p-4 border flex items-center justify-between ${
              result.error ? "bg-danger/10 border-danger/20 text-danger" : "bg-mint/10 border-mint/20 text-mint"
            }`}
          >
            <span className="text-sm">{result.success || result.error}</span>
            <button onClick={() => setResult(null)} className="text-white/40 hover:text-white">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-white/10 border-t-aurora rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Left panel: Teacher list */}
          <div className="space-y-3">
            <div className="glass card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon/20 to-neon/5 border border-neon/20 flex items-center justify-center text-sm">👨‍🏫</div>
                <div>
                  <h3 className="font-display text-sm">Faculty Members</h3>
                  <p className="text-xs text-white/40">{teachers.length} teachers</p>
                </div>
              </div>

              <div className="space-y-2">
                {teachers.map((t, i) => (
                  <motion.button
                    key={t.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                    onClick={() => selectTeacher(t)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      selectedTeacher?.id === t.id
                        ? "bg-aurora/10 border-aurora/30 text-white"
                        : "bg-white/[0.02] border-white/[0.06] text-white/70 hover:bg-white/[0.04] hover:border-white/[0.1]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon/20 to-aurora/10 border border-white/10 flex items-center justify-center text-xs font-medium">
                          {t.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{t.name}</p>
                          <p className="text-xs text-white/40 truncate">{t.email}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-xs font-medium text-white/60">
                        {t.student_count}
                      </span>
                    </div>
                  </motion.button>
                ))}

                {teachers.length === 0 && (
                  <div className="text-center py-8 text-white/30 text-sm">
                    No faculty members found.<br />Create faculty users first.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right panel: Student assignments */}
          <div className="space-y-5">
            {!selectedTeacher ? (
              <div className="glass card flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aurora/10 to-neon/5 border border-white/[0.08] flex items-center justify-center text-2xl mb-4">🔗</div>
                <p className="text-white/40 text-sm">Select a teacher to manage student assignments</p>
              </div>
            ) : detailLoading ? (
              <div className="glass card flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-white/10 border-t-aurora rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Assigned students */}
                <div className="glass card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mint/20 to-mint/5 border border-mint/20 flex items-center justify-center text-sm">✅</div>
                      <div>
                        <h3 className="font-display text-sm">Assigned Students</h3>
                        <p className="text-xs text-white/40">{assigned.length} students under {selectedTeacher.name}</p>
                      </div>
                    </div>
                  </div>

                  {assigned.length === 0 ? (
                    <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-6 text-center">
                      <p className="text-white/30 text-sm">No students assigned yet. Use the panel below to assign students.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-white/[0.02]">
                            <th className="text-left py-3 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Student</th>
                            <th className="text-left py-3 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Program</th>
                            <th className="text-left py-3 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Cohort</th>
                            <th className="text-right py-3 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assigned.map((s, i) => (
                            <motion.tr key={s.assignment_id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                              className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-mint/20 to-mint/5 border border-white/10 flex items-center justify-center text-xs font-medium">
                                    {s.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-white/70 font-medium">{s.name}</p>
                                    <p className="text-xs text-white/30">{s.email || `ID: ${s.student_id}`}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-white/40">{s.program || "—"}</td>
                              <td className="py-3 px-4 text-white/40">{s.cohort || "—"}</td>
                              <td className="py-3 px-4 text-right">
                                <button onClick={() => handleRemove(s.assignment_id)}
                                  className="px-3 py-1.5 rounded-lg text-danger/60 text-xs border border-danger/10 hover:text-danger hover:border-danger/30 transition-all"
                                >Remove</button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Unassigned students — assign panel */}
                <div className="glass card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aurora/20 to-aurora/5 border border-aurora/20 flex items-center justify-center text-sm">➕</div>
                      <div>
                        <h3 className="font-display text-sm">Available Students</h3>
                        <p className="text-xs text-white/40">{unassigned.length} unassigned students</p>
                      </div>
                    </div>
                    {selectedUnassigned.size > 0 && (
                      <button onClick={handleBulkAssign}
                        className="btn-primary text-sm"
                      >
                        Assign {selectedUnassigned.size} Selected →
                      </button>
                    )}
                  </div>

                  {/* Search */}
                  <div className="mb-4">
                    <input
                      value={search} onChange={(e) => setSearch(e.target.value)}
                      className="input-field text-sm" placeholder="Search students by name, email, or program..."
                    />
                  </div>

                  {unassigned.length === 0 ? (
                    <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-6 text-center">
                      <p className="text-white/30 text-sm">All students are already assigned to this teacher! 🎉</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-white/[0.02]">
                            <th className="py-3 px-4 w-10">
                              <input type="checkbox"
                                checked={selectedUnassigned.size > 0 && selectedUnassigned.size === filteredUnassigned.length}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-aurora cursor-pointer"
                              />
                            </th>
                            <th className="text-left py-3 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Student</th>
                            <th className="text-left py-3 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Program</th>
                            <th className="text-left py-3 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Cohort</th>
                            <th className="text-right py-3 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUnassigned.map((s, i) => (
                            <tr key={s.student_id}
                              className={`border-t border-white/[0.04] transition-colors ${
                                selectedUnassigned.has(s.student_id) ? "bg-aurora/[0.04]" : "hover:bg-white/[0.02]"
                              }`}
                            >
                              <td className="py-3 px-4">
                                <input type="checkbox"
                                  checked={selectedUnassigned.has(s.student_id)}
                                  onChange={() => toggleSelect(s.student_id)}
                                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-aurora cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center text-xs text-white/40">
                                    {s.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-white/70 font-medium">{s.name}</p>
                                    <p className="text-xs text-white/30">{s.email || `ID: ${s.student_id}`}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-white/40">{s.program || "—"}</td>
                              <td className="py-3 px-4 text-white/40">{s.cohort || "—"}</td>
                              <td className="py-3 px-4 text-right">
                                <button onClick={() => handleAssign(s.student_id)}
                                  className="px-3 py-1.5 rounded-lg text-aurora/70 text-xs border border-aurora/20 hover:text-aurora hover:border-aurora/40 hover:bg-aurora/5 transition-all"
                                >Assign</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
