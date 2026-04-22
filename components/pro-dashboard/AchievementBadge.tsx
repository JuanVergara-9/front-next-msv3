"use client"

import { Briefcase, Trophy, Star, Zap, Shield, Award } from "lucide-react"

type Achievement = {
  id: string
  label: string
  unlocked: boolean
  icon: string
}

const ICON_MAP: Record<string, typeof Briefcase> = {
  briefcase: Briefcase,
  trophy: Trophy,
  star: Star,
  zap: Zap,
  shield: Shield,
  award: Award,
}

export function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const Icon = ICON_MAP[achievement.icon] || Award
  const unlocked = achievement.unlocked

  return (
    <div className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
      unlocked
        ? "bg-white border-indigo-100 shadow-sm"
        : "bg-slate-50 border-slate-100 opacity-50"
    }`}>
      <div className={`p-2.5 rounded-full ${unlocked ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className={`text-xs font-medium text-center leading-tight ${unlocked ? "text-slate-700" : "text-slate-400"}`}>
        {achievement.label}
      </span>
      {unlocked && (
        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Desbloqueado</span>
      )}
    </div>
  )
}

export function AchievementGrid({ achievements }: { achievements: Achievement[] }) {
  const unlocked = achievements.filter(a => a.unlocked).length
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logros</h3>
        <span className="text-xs text-slate-400">{unlocked}/{achievements.length} desbloqueados</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {achievements.map(a => (
          <AchievementBadge key={a.id} achievement={a} />
        ))}
      </div>
    </div>
  )
}
