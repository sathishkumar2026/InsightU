"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import DashboardShell from "../../../../components/DashboardShell"
import { apiGet, apiPost, apiPut, apiDelete } from "../../../../lib/api"

const ROLES = ["student", "faculty", "admin"]
const ROLE_COLORS = {
  student: "bg-mint/10 text-mint border-mint/20",
  faculty: "bg-neon/10 text-neon border-neon/20",
  admin: "bg-plasma/10 text-plasma border-plasma/20",
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState(null)

  // Create form
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("student")
  const [password, setPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)

  // Edit form
  const [editName, setEditName] = useState("")
  const [editRole, setEditRole] = useState("")
  const [editPassword, setEditPassword] = useState("")

  const loadUsers = async () => {
    try {
      const data = await apiGet("/users/")
      setUsers(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadUsers() }, [])

  const handleCreate = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setResult({ error: "All fields are required" })
      return
    }
    if (password.length < 6) {
      setResult({ error: "Password must be at least 6 characters" })
      return
    }
    setSaving(true); setResult(null)
    try {
      await apiPost("/users/", { name: name.trim(), email: email.trim(), role, password })
      setResult({ success: `User ${email} created successfully` })
      setName(""); setEmail(""); setPassword(""); setRole("student")
      setShowCreate(false)
      loadUsers()
    } catch (e) { setResult({ error: e.message }) }
    finally { setSaving(false) }
  }

  const handleUpdate = async (userId) => {
    setSaving(true); setResult(null)
    try {
      const body = {}
      if (editName) body.name = editName
      if (editRole) body.role = editRole
      if (editPassword) body.password = editPassword
      await apiPut(`/users/${userId}`, body)
      setResult({ success: "User updated" })
      setEditId(null)
      loadUsers()
    } catch (e) { setResult({ error: e.message }) }
    finally { setSaving(false) }
  }

  const handleDelete = async (userId, userEmail) => {
    if (!confirm(`Delete user ${userEmail}? This cannot be undone.`)) return
    setResult(null)
    try {
      await apiDelete(`/users/${userId}`)
      setResult({ success: `User ${userEmail} deleted` })
      loadUsers()
    } catch (e) { setResult({ error: e.message }) }
  }

  const startEdit = (u) => {
    setEditId(u.id)
    setEditName(u.name)
    setEditRole(u.role)
    setEditPassword("")
  }

  return (
    <DashboardShell title="User Management">
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

      {/* Header + Create button */}
      <div className="glass card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aurora/20 to-neon/10 border border-aurora/20 flex items-center justify-center text-sm">👥</div>
          <div>
            <h3 className="font-display text-sm">All Users</h3>
            <p className="text-xs text-white/40">{users.length} registered users</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm">
          {showCreate ? "Cancel" : "+ New User"}
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <div className="glass card">
              <h3 className="text-sm font-display mb-4">Create New User</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="john@university.edu" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Role</label>
                  <div className="flex gap-2">
                    {ROLES.map((r) => (
                      <button key={r} onClick={() => setRole(r)}
                        className={`px-3 py-2 rounded-xl text-sm border capitalize transition-all ${
                          role === r ? ROLE_COLORS[r] + " border" : "border-white/[0.06] text-white/40"
                        }`}
                      >{r}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" />
                </div>
              </div>
              <button onClick={handleCreate} disabled={saving || !name || !email || !password}
                className="btn-primary mt-4 disabled:opacity-40"
              >
                {saving ? "Creating..." : "Create User →"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-white/10 border-t-aurora rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass card">
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="text-left py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">User</th>
                  <th className="text-left py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Email</th>
                  <th className="text-center py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Role</th>
                  <th className="text-center py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Joined</th>
                  <th className="text-right py-3.5 px-4 text-xs text-white/40 uppercase tracking-wider font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr key={u.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                    className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    {editId === u.id ? (
                      <>
                        <td className="py-3 px-4">
                          <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field text-sm py-1.5" />
                        </td>
                        <td className="py-3 px-4 text-white/40">{u.email}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-1">
                            {ROLES.map((r) => (
                              <button key={r} onClick={() => setEditRole(r)}
                                className={`px-2 py-1 rounded-lg text-xs border capitalize ${
                                  editRole === r ? ROLE_COLORS[r] : "border-white/[0.06] text-white/30"
                                }`}
                              >{r}</button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)}
                            className="input-field text-sm py-1.5" placeholder="new password (optional)" />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleUpdate(u.id)} className="px-3 py-1.5 rounded-lg bg-mint/10 text-mint text-xs border border-mint/20 hover:bg-mint/20">Save</button>
                            <button onClick={() => setEditId(null)} className="px-3 py-1.5 rounded-lg text-white/40 text-xs border border-white/[0.06] hover:text-white">Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora/20 to-neon/10 border border-white/10 flex items-center justify-center text-xs font-medium">
                              {u.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-white/70 font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-white/40">{u.email}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-white/30 text-xs">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => startEdit(u)} className="px-3 py-1.5 rounded-lg text-white/40 text-xs border border-white/[0.06] hover:text-white hover:border-white/20 transition-all">Edit</button>
                            <button onClick={() => handleDelete(u.id, u.email)} className="px-3 py-1.5 rounded-lg text-danger/60 text-xs border border-danger/10 hover:text-danger hover:border-danger/30 transition-all">Delete</button>
                          </div>
                        </td>
                      </>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
