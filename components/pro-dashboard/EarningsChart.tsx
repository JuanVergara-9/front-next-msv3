"use client"

import { DollarSign, TrendingUp, TrendingDown, Briefcase, Trophy } from "lucide-react"

type MonthlyEarning = { month: string; earnings: number; jobs: number }

type Props = {
  monthly: MonthlyEarning[]
  thisMonth: number
  lastMonth: number
  totalEarned: number
  avgTicket: number
  bestMonth: { month: string; earnings: number } | null
  jobsThisMonth: number
  jobsLastMonth: number
}

const formatARS = (amount: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount)

const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-")
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  return `${months[Number(m) - 1]} ${y.slice(2)}`
}

function Delta({ current, previous, label }: { current: number; previous: number; label: string }) {
  if (previous === 0 && current === 0) return <span className="text-xs text-slate-400">{label}</span>
  const isUp = current >= previous
  const pct = previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isUp ? "text-emerald-600" : "text-red-500"}`}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {pct > 0 ? "+" : ""}{pct}% vs mes anterior
    </span>
  )
}

export function EarningsChart({ monthly, thisMonth, lastMonth, totalEarned, avgTicket, bestMonth, jobsThisMonth, jobsLastMonth }: Props) {
  const maxEarnings = Math.max(1, ...monthly.map(m => m.earnings))

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><DollarSign className="w-4 h-4" /></div>
            <span className="text-xs font-medium text-slate-500">Este mes</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{formatARS(thisMonth)}</p>
          <Delta current={thisMonth} previous={lastMonth} label="vs mes anterior" />
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Briefcase className="w-4 h-4" /></div>
            <span className="text-xs font-medium text-slate-500">Trabajos este mes</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{jobsThisMonth}</p>
          <Delta current={jobsThisMonth} previous={jobsLastMonth} label="vs mes anterior" />
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><DollarSign className="w-4 h-4" /></div>
            <span className="text-xs font-medium text-slate-500">Ticket promedio</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{formatARS(avgTicket)}</p>
          <span className="text-xs text-slate-400">Por trabajo</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600"><Trophy className="w-4 h-4" /></div>
            <span className="text-xs font-medium text-slate-500">Total acumulado</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{formatARS(totalEarned)}</p>
          {bestMonth && (
            <span className="text-xs text-slate-400">Mejor mes: {monthLabel(bestMonth.month)}</span>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      {monthly.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Ingresos mensuales</h3>
          <div className="flex items-end gap-2 h-32">
            {monthly.map(m => {
              const heightPct = Math.max(6, (m.earnings / maxEarnings) * 100)
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-slate-500">{formatARS(m.earnings)}</span>
                  <div
                    className="w-full bg-indigo-500 rounded-t-md transition-all duration-500 min-h-[4px]"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-slate-400">{monthLabel(m.month)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
