"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { apiFetch } from "@/lib/apiClient"
import { ScoreRing } from "@/components/pro-dashboard/ScoreRing"
import { EarningsChart } from "@/components/pro-dashboard/EarningsChart"
import { AchievementGrid } from "@/components/pro-dashboard/AchievementBadge"
import { PerformanceMetrics } from "@/components/pro-dashboard/PerformanceMetrics"
import { FinancialRoadmap } from "@/components/pro-dashboard/FinancialRoadmap"
import {
  BarChart3,
  Eye,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  Lock,
  Crown,
  Loader2,
} from "lucide-react"

const NOTIFICATION_API_URL =
  process.env.NEXT_PUBLIC_TICKETS_API_URL || "https://notification-service2-production.up.railway.app/api/v1"

type DashboardData = {
  earnings: {
    monthly: { month: string; earnings: number; jobs: number }[]
    thisMonth: number
    lastMonth: number
    totalEarned: number
    avgTicket: number
    bestMonth: { month: string; earnings: number } | null
    jobsThisMonth: number
    jobsLastMonth: number
  }
  level: {
    score: number
    level: string
    nextLevel: string | null
    pointsToNextLevel: number
    transactional: number
    behavioral: number
    reputation: number
    financial: number
    totalEvents: number
  }
  performance: {
    totalCompleted: number
    completionRate: number
    responseRate: number
    avgResponseTimeMinutes: number | null
    daysSinceLastJob: number | null
  }
  achievements: { id: string; label: string; unlocked: boolean; icon: string }[]
}

type VisibilityData = {
  viewsThisMonth: number
  contactsThisMonth: number
  viewsLastMonth: number
  contactsLastMonth: number
  conversionRate: number
  totalViews: number
  totalContacts: number
}

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return null
  const isUp = current >= previous
  const pct = previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isUp ? "text-emerald-600" : "text-red-500"}`}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {pct > 0 ? "+" : ""}{pct}%
    </span>
  )
}

function VisibilitySection({ data, isPro }: { data: VisibilityData | null; isPro: boolean }) {
  if (!isPro) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="absolute inset-0 backdrop-blur-sm bg-white/60 z-10 flex flex-col items-center justify-center gap-3">
          <Lock className="w-8 h-8 text-slate-400" />
          <p className="text-sm font-medium text-slate-600">Exclusivo para PRO</p>
          <p className="text-xs text-slate-400 text-center max-w-[220px]">
            Hacete PRO para ver cuánta gente visita tu perfil y te contacta
          </p>
        </div>
        <div className="opacity-30 pointer-events-none">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Mi Visibilidad</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border p-4"><div className="h-16" /></div>
            <div className="bg-white rounded-xl border p-4"><div className="h-16" /></div>
            <div className="bg-white rounded-xl border p-4"><div className="h-16" /></div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-900">Mi Visibilidad</h2>
        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">PRO</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></div>
            <span className="text-xs font-medium text-slate-500">Visitas al perfil</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{data.viewsThisMonth}</p>
          <Delta current={data.viewsThisMonth} previous={data.viewsLastMonth} />
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><MousePointerClick className="w-4 h-4" /></div>
            <span className="text-xs font-medium text-slate-500">Contactos recibidos</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{data.contactsThisMonth}</p>
          <Delta current={data.contactsThisMonth} previous={data.contactsLastMonth} />
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600"><BarChart3 className="w-4 h-4" /></div>
            <span className="text-xs font-medium text-slate-500">Conversión</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{data.conversionRate}%</p>
          <span className="text-xs text-slate-400">Contactos / Visitas</span>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-2">
        Tu perfil fue visto {data.viewsThisMonth} veces este mes. Los PRO reciben 3x más visitas.
      </p>
    </div>
  )
}

function MiNegocioContent() {
  const { user, isProvider, providerProfile } = useAuth()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [visibility, setVisibility] = useState<VisibilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const providerId = providerProfile?.id
  const isPro = !!providerProfile?.is_pro

  useEffect(() => {
    if (!isProvider || !providerId) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }

        const dashboardPromise = fetch(
          `${NOTIFICATION_API_URL}/metrics/worker-dashboard/${providerId}`,
          { headers, cache: "no-store" }
        ).then(r => {
          if (!r.ok) throw new Error(`Dashboard HTTP ${r.status}`)
          return r.json()
        })

        const visibilityPromise = isPro
          ? apiFetch<VisibilityData>(
              `/api/v1/metrics/provider-visibility/${providerId}`,
              { cacheTtlMs: 0 }
            ).catch(() => null)
          : Promise.resolve(null)

        const [dashData, visData] = await Promise.all([dashboardPromise, visibilityPromise])
        setDashboard(dashData)
        setVisibility(visData)
      } catch (err: any) {
        console.error("[MiNegocio] Error:", err)
        setError(err.message || "Error al cargar datos")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isProvider, providerId, isPro])

  if (!isProvider) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <Lock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-slate-900 mb-1">Acceso exclusivo para trabajadores</h1>
          <p className="text-sm text-slate-500 mb-4">Registrate como trabajador para acceder a tu dashboard financiero.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  if (!providerProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500">Cargando tu perfil...</p>
        </div>
      </div>
    )
  }

  if (!providerProfile.is_pro) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50/50">
        <div className="text-center max-w-md">
          <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Mi Negocio es exclusivo PRO</h1>
          <p className="text-sm text-slate-600 mb-6">
            Esta sección muestra métricas y tu camino financiero cuando tengas el plan PRO activo.
          </p>
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            Ir a mi perfil
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500">Cargando tu negocio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!dashboard) return null

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Mi Negocio</h1>
              {isPro && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
                  <Crown className="w-3 h-3" /> PRO
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {providerProfile?.first_name}, mirá lo que construiste.
            </p>
          </div>
        </div>

        {/* Section 1: Mi Facturación */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Mi Facturación</h2>
          </div>
          <EarningsChart
            monthly={dashboard.earnings.monthly}
            thisMonth={dashboard.earnings.thisMonth}
            lastMonth={dashboard.earnings.lastMonth}
            totalEarned={dashboard.earnings.totalEarned}
            avgTicket={dashboard.earnings.avgTicket}
            bestMonth={dashboard.earnings.bestMonth}
            jobsThisMonth={dashboard.earnings.jobsThisMonth}
            jobsLastMonth={dashboard.earnings.jobsLastMonth}
          />
        </section>

        {/* Section 2: Mi Nivel */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Mi Nivel</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <ScoreRing
              score={dashboard.level.score}
              level={dashboard.level.level}
              nextLevel={dashboard.level.nextLevel}
              pointsToNextLevel={dashboard.level.pointsToNextLevel}
            />
            <div className="mt-6">
              <AchievementGrid achievements={dashboard.achievements} />
            </div>
          </div>
        </section>

        {/* Section 3: Mi Rendimiento */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Mi Rendimiento</h2>
          </div>
          <PerformanceMetrics
            totalCompleted={dashboard.performance.totalCompleted}
            completionRate={dashboard.performance.completionRate}
            responseRate={dashboard.performance.responseRate}
            avgResponseTimeMinutes={dashboard.performance.avgResponseTimeMinutes}
            daysSinceLastJob={dashboard.performance.daysSinceLastJob}
          />
        </section>

        {/* Section 4: Mi Visibilidad (PRO only) */}
        <section>
          <VisibilitySection data={visibility} isPro={isPro} />
        </section>

        {/* Section 5: Tu Camino Financiero */}
        <section className="bg-white rounded-2xl border border-slate-100 p-6">
          <FinancialRoadmap />
        </section>
      </div>
    </div>
  )
}

export default function MiNegocioPage() {
  return (
    <ProtectedRoute>
      <MiNegocioContent />
    </ProtectedRoute>
  )
}
