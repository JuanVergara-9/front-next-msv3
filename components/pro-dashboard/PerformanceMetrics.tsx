"use client"

import { Star, Zap, CheckCircle2, Clock } from "lucide-react"

type Props = {
  totalCompleted: number
  completionRate: number
  responseRate: number
  avgResponseTimeMinutes: number | null
  daysSinceLastJob: number | null
}

function MetricCard({ icon: Icon, label, value, detail, color }: {
  icon: typeof Star
  label: string
  value: string
  detail?: string
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {detail && <p className="text-xs text-slate-400 mt-0.5">{detail}</p>}
    </div>
  )
}

export function PerformanceMetrics({ totalCompleted, completionRate, responseRate, avgResponseTimeMinutes, daysSinceLastJob }: Props) {
  const responseTimeLabel = avgResponseTimeMinutes != null
    ? avgResponseTimeMinutes < 30 ? "Excelente" : avgResponseTimeMinutes < 60 ? "Bueno" : "A mejorar"
    : "Sin datos"

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        icon={CheckCircle2}
        label="Trabajos completados"
        value={String(totalCompleted)}
        color="bg-emerald-50 text-emerald-600"
      />
      <MetricCard
        icon={Zap}
        label="Tasa de respuesta"
        value={`${responseRate}%`}
        detail={responseRate >= 95 ? "Excelente" : responseRate >= 80 ? "Buena" : "A mejorar"}
        color="bg-blue-50 text-blue-600"
      />
      <MetricCard
        icon={Clock}
        label="Velocidad de respuesta"
        value={avgResponseTimeMinutes != null ? `${avgResponseTimeMinutes} min` : "—"}
        detail={responseTimeLabel}
        color="bg-purple-50 text-purple-600"
      />
      <MetricCard
        icon={Star}
        label="Último trabajo"
        value={daysSinceLastJob != null ? `Hace ${daysSinceLastJob}d` : "—"}
        detail={daysSinceLastJob != null && daysSinceLastJob <= 7 ? "Activo" : daysSinceLastJob != null ? "Volvé pronto" : "Sin actividad"}
        color="bg-amber-50 text-amber-600"
      />
    </div>
  )
}
