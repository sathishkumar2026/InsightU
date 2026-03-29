"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar } from "recharts"

const customTooltipStyle = {
  backgroundColor: "rgba(12, 17, 32, 0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  padding: "8px 12px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
}

export function TrendChart({ data, title = "Performance Trend" }) {
  return (
    <div className="glass card">
      <h3 className="font-display mb-4 text-sm text-white/70">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="auroraGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
            <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={customTooltipStyle} labelStyle={{ color: "#94a3b8" }} itemStyle={{ color: "#7dd3fc" }} />
            <Area type="monotone" dataKey="score" stroke="#7dd3fc" strokeWidth={2} fill="url(#auroraGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function RiskPie({ data, title = "Risk Distribution" }) {
  const colors = ["#ef4444", "#f97316", "#34d399"]
  return (
    <div className="glass card">
      <h3 className="font-display mb-4 text-sm text-white/70">{title}</h3>
      <div className="h-56 flex items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={customTooltipStyle} labelStyle={{ color: "#94a3b8" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2 ml-2 mr-4">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm whitespace-nowrap">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="text-white/60">{entry.name}</span>
              <span className="text-white/40 text-xs ml-auto">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function BarChartCard({ data, title, dataKey = "value", barColor = "#7dd3fc" }) {
  return (
    <div className="glass card">
      <h3 className="font-display mb-4 text-sm text-white/70">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
            <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={customTooltipStyle} labelStyle={{ color: "#94a3b8" }} />
            <Bar dataKey={dataKey} fill={barColor} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
