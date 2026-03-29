"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import DashboardShell from "../../../../components/DashboardShell"

const CONFIG_SECTIONS = [
  {
    title: "Risk Thresholds",
    icon: "🎯",
    description: "Define the boundaries for risk classification",
    settings: [
      { key: "high_risk_min", label: "High Risk Threshold", value: "0.70", unit: "probability", desc: "Students above this score are classified as High Risk" },
      { key: "medium_risk_min", label: "Medium Risk Threshold", value: "0.40", unit: "probability", desc: "Students between this and high threshold are Medium Risk" },
      { key: "consistency_warning", label: "Consistency Warning Level", value: "50", unit: "index", desc: "Consistency index below this triggers a warning flag" },
    ]
  },
  {
    title: "ML Pipeline",
    icon: "🧠",
    description: "Model training and inference parameters",
    settings: [
      { key: "primary_model", label: "Primary Model", value: "Logistic Regression", unit: "model", desc: "Classifier used for risk prediction" },
      { key: "explainer", label: "Explainability Method", value: "Decision Tree", unit: "model", desc: "Rule extraction for human-readable explanations" },
      { key: "drift_detector", label: "Drift Detector", value: "Isolation Forest", unit: "model", desc: "Anomaly detection for behavioral drift" },
      { key: "feature_count", label: "Engineered Features", value: "8", unit: "features", desc: "Number of features in the ML pipeline" },
    ]
  },
  {
    title: "Alert & Notification",
    icon: "🔔",
    description: "Configure when and how alerts are triggered",
    settings: [
      { key: "attendance_threshold", label: "Attendance Drop Alert", value: "-10", unit: "% trend", desc: "Alert when attendance trend drops below this" },
      { key: "score_drop_alert", label: "Sudden Score Drop", value: "15", unit: "points", desc: "Alert when a student's score drops by this many points" },
      { key: "delay_threshold", label: "Assignment Delay Alert", value: "5", unit: "days", desc: "Flag when average assignment delay exceeds this" },
    ]
  },
  {
    title: "Fairness & Compliance",
    icon: "⚖️",
    description: "Bias monitoring and regulatory compliance settings",
    settings: [
      { key: "disparate_impact", label: "Disparate Impact Threshold", value: "0.80", unit: "ratio", desc: "Minimum acceptable disparate impact ratio (FERPA)" },
      { key: "audit_retention", label: "Audit Log Retention", value: "365", unit: "days", desc: "How long to keep audit logs" },
      { key: "data_anonymize", label: "Auto-Anonymize Exports", value: "true", unit: "boolean", desc: "Strip PII from data exports automatically" },
    ]
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.3 } }),
}

export default function ConfigPage() {
  const [values, setValues] = useState(() => {
    const map = {}
    CONFIG_SECTIONS.forEach(s => s.settings.forEach(c => { map[c.key] = c.value }))
    return map
  })
  const [saved, setSaved] = useState(false)

  const handleChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }))
    setSaved(false)
  }

  const handleSave = () => {
    // In production this would POST to a config endpoint
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <DashboardShell title="System Configuration">
      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 border bg-mint/10 border-mint/20 text-mint text-sm flex items-center gap-2"
        >
          ✓ Configuration saved successfully
        </motion.div>
      )}

      {CONFIG_SECTIONS.map((section, si) => (
        <motion.div key={section.title} custom={si} variants={fadeUp} initial="hidden" animate="visible">
          <div className="glass card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aurora/20 to-aurora/5 border border-aurora/20 flex items-center justify-center text-sm">{section.icon}</div>
              <div>
                <h3 className="font-display text-sm">{section.title}</h3>
                <p className="text-xs text-white/40">{section.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              {section.settings.map((setting) => (
                <div key={setting.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-white/[0.04] last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white/70 font-medium">{setting.label}</p>
                    <p className="text-xs text-white/30 mt-0.5">{setting.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:w-48 flex-shrink-0">
                    {setting.unit === "boolean" ? (
                      <button
                        onClick={() => handleChange(setting.key, values[setting.key] === "true" ? "false" : "true")}
                        className={`px-4 py-2 rounded-xl text-sm border transition-all w-full ${
                          values[setting.key] === "true"
                            ? "bg-mint/10 border-mint/20 text-mint"
                            : "bg-white/[0.03] border-white/[0.06] text-white/40"
                        }`}
                      >
                        {values[setting.key] === "true" ? "Enabled" : "Disabled"}
                      </button>
                    ) : setting.unit === "model" ? (
                      <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/60 w-full text-center">
                        {values[setting.key]}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={values[setting.key]}
                          onChange={(e) => handleChange(setting.key, e.target.value)}
                          className="input-field text-sm py-2 w-full text-center"
                        />
                        <span className="text-xs text-white/30 whitespace-nowrap">{setting.unit}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}

      <motion.div custom={CONFIG_SECTIONS.length} variants={fadeUp} initial="hidden" animate="visible">
        <button onClick={handleSave} className="btn-primary w-full text-center">
          Save Configuration →
        </button>
      </motion.div>
    </DashboardShell>
  )
}
