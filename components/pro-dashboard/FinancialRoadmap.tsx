"use client"

import { FileText, CreditCard, Shield, Sparkles } from "lucide-react"

const MILESTONES = [
  {
    level: "CONFIABLE",
    threshold: 401,
    icon: FileText,
    title: "Historial financiero verificable",
    description: "Un registro formal de tus ingresos y tu actividad profesional.",
  },
  {
    level: "EXCELENTE",
    threshold: 601,
    icon: CreditCard,
    title: "Acceso a microcréditos",
    description: "Créditos rápidos basados en tu historial de trabajo en miservicio.",
  },
  {
    level: "ELITE",
    threshold: 801,
    icon: Shield,
    title: "Adelanto de ingresos + Seguros",
    description: "Recibí tu dinero antes y protegé tus herramientas de trabajo.",
  },
]

type Props = {
  currentScore: number
  currentLevel: string
}

export function FinancialRoadmap({ currentScore, currentLevel }: Props) {
  const levelOrder = ["NUEVO", "EN_DESARROLLO", "CONFIABLE", "EXCELENTE", "ELITE"]
  const currentIdx = levelOrder.indexOf(currentLevel)

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tu camino financiero</h3>
      </div>

      <div className="space-y-4">
        {MILESTONES.map((ms) => {
          const msIdx = levelOrder.indexOf(ms.level)
          const isUnlocked = currentIdx >= msIdx
          const isNext = !isUnlocked && (currentIdx === msIdx - 1 || (currentIdx < msIdx && MILESTONES.findIndex(m => levelOrder.indexOf(m.level) > currentIdx) === MILESTONES.indexOf(ms)))
          const Icon = ms.icon

          return (
            <div
              key={ms.level}
              className={`flex gap-4 p-4 rounded-xl border transition-all ${
                isUnlocked
                  ? "bg-emerald-50/50 border-emerald-200"
                  : isNext
                    ? "bg-indigo-50/50 border-indigo-200"
                    : "bg-slate-50 border-slate-100 opacity-60"
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${
                isUnlocked ? "bg-emerald-100 text-emerald-600" : isNext ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-800">{ms.title}</span>
                  {isUnlocked && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">Desbloqueado</span>
                  )}
                  {isNext && (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full uppercase">Próximo</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{ms.description}</p>
                {!isUnlocked && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Necesitás <strong className="text-slate-600">{Math.max(0, ms.threshold - currentScore)} pts</strong> más
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-slate-400 text-center mt-4">
        Seguí creciendo para desbloquear estos beneficios
      </p>
    </div>
  )
}
