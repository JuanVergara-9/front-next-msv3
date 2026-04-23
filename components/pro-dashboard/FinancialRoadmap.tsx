"use client"

import { FileText, CreditCard, Shield, Sparkles, Clock } from "lucide-react"

const MILESTONES = [
  {
    icon: FileText,
    title: "Historial financiero verificable",
    description: "Un registro formal de tus ingresos y tu actividad profesional.",
  },
  {
    icon: CreditCard,
    title: "Acceso a microcréditos",
    description: "Créditos rápidos basados en tu historial de trabajo en miservicio.",
  },
  {
    icon: Shield,
    title: "Adelanto de ingresos + Seguros",
    description: "Recibí tu dinero antes y protegé tus herramientas de trabajo.",
  },
]

export function FinancialRoadmap() {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tu camino financiero</h3>
        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase inline-flex items-center gap-1">
          <Clock className="w-3 h-3" /> Próximamente
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-5">
        Estamos construyendo herramientas financieras exclusivas para los trabajadores de miservicio. Mientras tanto, seguí creciendo tu nivel y tu historial.
      </p>

      <div className="space-y-4 opacity-75">
        {MILESTONES.map((ms) => {
          const Icon = ms.icon
          return (
            <div
              key={ms.title}
              className="flex gap-4 p-4 rounded-xl border bg-slate-50 border-slate-100"
            >
              <div className="p-2.5 rounded-xl shrink-0 bg-slate-100 text-slate-400">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-slate-700">{ms.title}</span>
                <p className="text-xs text-slate-500 mt-0.5">{ms.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-slate-400 text-center mt-4">
        Seguí creciendo tu nivel — te vamos a avisar cuando estos beneficios estén disponibles
      </p>
    </div>
  )
}
