"use client"

const LEVEL_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  NUEVO: { color: "text-slate-500", bg: "bg-slate-100", label: "Nuevo" },
  EN_DESARROLLO: { color: "text-blue-600", bg: "bg-blue-50", label: "En Desarrollo" },
  CONFIABLE: { color: "text-emerald-600", bg: "bg-emerald-50", label: "Confiable" },
  EXCELENTE: { color: "text-purple-600", bg: "bg-purple-50", label: "Excelente" },
  ELITE: { color: "text-amber-600", bg: "bg-amber-50", label: "Elite" },
}

const LEVEL_MESSAGES: Record<string, string> = {
  NUEVO: "Completá tu primer trabajo para empezar a construir tu historial.",
  EN_DESARROLLO: "Vas por buen camino. A medida que crezcas, vas a acceder a herramientas financieras exclusivas.",
  CONFIABLE: "Tu historial ya te posiciona para futuros beneficios financieros.",
  EXCELENTE: "Sos de los mejores. Próximamente: acceso a microcréditos y adelantos.",
  ELITE: "Nivel máximo. Prioridad en todos los beneficios financieros de miservicio.",
}

type Props = {
  score: number
  level: string
  nextLevel: string | null
  pointsToNextLevel: number
}

export function ScoreRing({ score, level, nextLevel, pointsToNextLevel }: Props) {
  const pct = Math.min(100, (score / 1000) * 100)
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (pct / 100) * circumference
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.NUEVO
  const message = LEVEL_MESSAGES[level] || LEVEL_MESSAGES.NUEVO

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-40 h-40">
        <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" strokeWidth="7" className="stroke-slate-100" />
          <circle
            cx="60" cy="60" r="54" fill="none" strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${config.color.replace("text-", "stroke-")} transition-all duration-1000`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-slate-900">{score}</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">/ 1000</span>
        </div>
      </div>

      <span className={`text-sm font-bold uppercase tracking-wider px-4 py-1.5 rounded-full ${config.bg} ${config.color}`}>
        {config.label}
      </span>

      {nextLevel && pointsToNextLevel > 0 && (
        <div className="w-full max-w-[240px]">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{config.label}</span>
            <span>{LEVEL_CONFIG[nextLevel]?.label || nextLevel}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.max(5, 100 - (pointsToNextLevel / (score + pointsToNextLevel)) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-1">
            Te faltan <strong className="text-slate-600">{pointsToNextLevel} pts</strong> para {LEVEL_CONFIG[nextLevel]?.label || nextLevel}
          </p>
        </div>
      )}

      <p className="text-sm text-slate-500 text-center max-w-[300px] leading-relaxed">{message}</p>
    </div>
  )
}
