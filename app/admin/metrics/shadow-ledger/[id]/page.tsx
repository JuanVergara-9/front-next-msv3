"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { isAdmin } from "@/lib/utils/admin"
import { AuthService } from "@/lib/services/auth.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Briefcase,
  DollarSign,
  Receipt,
  Clock,
  Ghost,
  Timer,
  AlertCircle,
  Info,
  Shield,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Star,
  CreditCard,
  UserCheck,
  Zap,
  RefreshCw,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const SHADOW_LEDGER_API_URL =
  process.env.NEXT_PUBLIC_TICKETS_API_URL || "https://notification-service2-production.up.railway.app/api/v1"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"

type Provider = {
  id: number
  first_name: string
  last_name: string
  category?: { name: string }
}

type WorkerScoring = {
  totalCompletedJobs: number
  totalGMV: number
  ticketPromedio: number | null
  daysSinceLastJob: number | null
  ghostingRate: number
  avgResponseTimeMinutes: number | null
}

type CreditEvent = {
  id: number
  provider_id: number
  event_type: string
  category: string
  score_impact: number
  amount: number | null
  metadata: Record<string, unknown>
  source: string
  created_at: string
}

type CreditScoreSnapshot = {
  id: number
  score: number
  level: string
  transactional_score: number
  behavioral_score: number
  reputation_score: number
  financial_score: number
  total_events: number
  calculated_at: string
}

type CreditScoreData = {
  current: {
    score: number
    level: string
    transactional_score: number
    behavioral_score: number
    reputation_score: number
    financial_score: number
    total_events: number
    calculated_at: string | null
  }
  dimension_breakdown: Record<string, { total_impact: number; event_count: number }>
  recent_events: CreditEvent[]
  score_history: CreditScoreSnapshot[]
}

type CreditHistoryData = {
  events: CreditEvent[]
  total: number
}

const formatARS = (amount: number | null) => {
  if (amount === null || amount === undefined) return "—"
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount)
}

const LEVEL_CONFIG: Record<string, { color: string; bg: string; ring: string }> = {
  NUEVO: { color: "text-slate-500", bg: "bg-slate-100", ring: "ring-slate-300" },
  EN_DESARROLLO: { color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-300" },
  CONFIABLE: { color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-300" },
  EXCELENTE: { color: "text-purple-600", bg: "bg-purple-50", ring: "ring-purple-300" },
  ELITE: { color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-400" },
}

const EVENT_CONFIG: Record<string, { icon: typeof Briefcase; label: string; color: string }> = {
  JOB_COMPLETED: { icon: CheckCircle2, label: "Trabajo Completado", color: "text-emerald-500" },
  JOB_GHOSTED: { icon: Ghost, label: "Ghosting", color: "text-red-500" },
  JOB_CANCELLED: { icon: XCircle, label: "Trabajo Cancelado", color: "text-amber-500" },
  PAYMENT_REPORTED: { icon: DollarSign, label: "Monto Reportado", color: "text-green-600" },
  FAST_RESPONSE: { icon: Zap, label: "Respuesta Rápida", color: "text-blue-500" },
  SLOW_RESPONSE: { icon: Timer, label: "Respuesta Lenta", color: "text-amber-500" },
  REVIEW_POSITIVE: { icon: Star, label: "Reseña Positiva", color: "text-emerald-500" },
  REVIEW_NEGATIVE: { icon: Star, label: "Reseña Negativa", color: "text-red-500" },
  REVIEW_NEUTRAL: { icon: Star, label: "Reseña Neutral", color: "text-slate-400" },
  IDENTITY_VERIFIED: { icon: UserCheck, label: "Identidad Verificada", color: "text-indigo-600" },
  LEAD_PAID: { icon: CreditCard, label: "Lead Pagado", color: "text-emerald-500" },
  LEAD_DEBT: { icon: CreditCard, label: "Lead en Deuda", color: "text-red-400" },
  DEBT_PAID: { icon: CheckCircle2, label: "Deuda Pagada", color: "text-emerald-600" },
  PRO_ACTIVATED: { icon: Shield, label: "PRO Activado", color: "text-purple-600" },
  CREDIT_PURCHASED: { icon: CreditCard, label: "Créditos Comprados", color: "text-blue-500" },
}

function ScoreRing({ score, level }: { score: number; level: string }) {
  const pct = Math.min(100, (score / 1000) * 100)
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (pct / 100) * circumference
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.NUEVO

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-slate-100" />
          <circle
            cx="60" cy="60" r="54" fill="none" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${config.color.replace("text-", "stroke-")} transition-all duration-1000`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-900">{score}</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">/ 1000</span>
        </div>
      </div>
      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${config.bg} ${config.color}`}>
        {level.replace("_", " ")}
      </span>
    </div>
  )
}

function DimensionBar({ label, value, maxAbsolute }: { label: string; value: number; maxAbsolute: number }) {
  const isPositive = value >= 0
  const absPct = maxAbsolute > 0 ? Math.min(100, (Math.abs(value) / maxAbsolute) * 100) : 0

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-slate-600 capitalize">{label}</span>
        <span className={`font-bold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
          {isPositive ? "+" : ""}{value}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isPositive ? "bg-emerald-400" : "bg-red-400"}`}
          style={{ width: `${absPct}%` }}
        />
      </div>
    </div>
  )
}

export default function WorkerFinancialProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const workerId = params?.id as string

  const [mounted, setMounted] = useState(false)
  const [provider, setProvider] = useState<Provider | null>(null)
  const [scoring, setScoring] = useState<WorkerScoring | null>(null)
  const [creditScore, setCreditScore] = useState<CreditScoreData | null>(null)
  const [creditHistory, setCreditHistory] = useState<CreditHistoryData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || isLoading) return
    if (!user || !isAdmin(user)) router.push("/")
  }, [user, isLoading, router, mounted])

  useEffect(() => {
    if (!user || !isAdmin(user) || !workerId) return
    let cancelled = false

    async function fetchData() {
      setIsLoadingData(true)
      setError(null)
      try {
        const token = AuthService.getAccessToken() || ""
        const headers = { Authorization: `Bearer ${token}` }

        const [providerRes, scoringRes, creditScoreRes, creditHistoryRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/providers/${workerId}`, { headers }),
          fetch(`${SHADOW_LEDGER_API_URL}/metrics/worker-scoring/${workerId}`),
          fetch(`${SHADOW_LEDGER_API_URL}/metrics/credit-score/${workerId}`),
          fetch(`${SHADOW_LEDGER_API_URL}/metrics/credit-history/${workerId}?limit=30`),
        ])

        if (!providerRes.ok) throw new Error("No se pudo obtener el perfil del trabajador")
        if (!scoringRes.ok) throw new Error("No se pudo obtener el scoring del trabajador")

        const providerData = await providerRes.json()
        const scoringData = await scoringRes.json()
        const creditScoreData = creditScoreRes.ok ? await creditScoreRes.json() : null
        const creditHistoryData = creditHistoryRes.ok ? await creditHistoryRes.json() : null

        if (!cancelled) {
          setProvider(providerData)
          setScoring(scoringData)
          setCreditScore(creditScoreData)
          setCreditHistory(creditHistoryData)
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error desconocido"
        if (!cancelled) setError(message)
      } finally {
        if (!cancelled) setIsLoadingData(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [user, workerId])

  async function handleRecalculate() {
    setIsRecalculating(true)
    try {
      const res = await fetch(`${SHADOW_LEDGER_API_URL}/metrics/credit-score/${workerId}/recalculate`, { method: "POST" })
      if (res.ok) {
        const refreshed = await fetch(`${SHADOW_LEDGER_API_URL}/metrics/credit-score/${workerId}`)
        if (refreshed.ok) setCreditScore(await refreshed.json())
      }
    } catch {
      /* silent */
    } finally {
      setIsRecalculating(false)
    }
  }

  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !isAdmin(user)) return null

  const workerName = provider
    ? `${provider.first_name ?? ""} ${provider.last_name ?? ""}`.trim() || `Trabajador #${workerId}`
    : `Trabajador #${workerId}`

  const categoryName = provider?.category?.name ?? "—"

  const ghostColor = (rate: number) =>
    rate < 10 ? "text-emerald-500" : "text-red-500"

  const responseColor = (mins: number | null) => {
    if (mins === null) return "text-slate-400"
    if (mins < 30) return "text-emerald-500"
    if (mins < 60) return "text-amber-500"
    return "text-red-500"
  }

  const MetricLabel = ({ label, tooltip }: { label: string; tooltip?: string }) => (
    <div className="flex items-center gap-1.5">
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-slate-300 hover:text-slate-500 cursor-help shrink-0" />
          </TooltipTrigger>
          <TooltipContent className="bg-slate-800 text-white border-0">
            <p className="w-[200px] text-xs leading-relaxed">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )

  const current = creditScore?.current
  const dimensions = [
    { key: "transactional", label: "Transaccional", value: current?.transactional_score ?? 0 },
    { key: "behavioral", label: "Comportamiento", value: current?.behavioral_score ?? 0 },
    { key: "reputation", label: "Reputación", value: current?.reputation_score ?? 0 },
    { key: "financial", label: "Financiero", value: current?.financial_score ?? 0 },
  ]
  const maxAbsDimension = Math.max(1, ...dimensions.map(d => Math.abs(d.value)))

  const timelineEvents = creditHistory?.events ?? creditScore?.recent_events ?? []

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-slate-50 font-sans pb-8">
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link
            href="/admin/metrics/shadow-ledger"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard General
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Worker header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">
                {isLoadingData ? "Cargando..." : workerName}
              </h1>
              <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                ID: {workerId}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {isLoadingData ? "—" : categoryName}
              <span className="mx-2 text-slate-300">·</span>
              Perfil Financiero &amp; Historial Crediticio
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ══ CREDIT SCORE SECTION ══ */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Score Crediticio
            </h2>
            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? "animate-spin" : ""}`} />
              Recalcular
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Score Ring */}
            <Card className="border-slate-100 shadow-sm lg:col-span-1">
              <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[240px]">
                {isLoadingData ? (
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ScoreRing
                      score={current?.score ?? 100}
                      level={current?.level ?? "NUEVO"}
                    />
                    <p className="text-xs text-slate-400 mt-3">
                      {current?.total_events ?? 0} eventos registrados
                    </p>
                    {current?.calculated_at && (
                      <p className="text-[10px] text-slate-300 mt-1">
                        Calculado: {new Date(current.calculated_at).toLocaleDateString("es-AR")}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Dimension Breakdown */}
            <Card className="border-slate-100 shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">Breakdown por Dimensión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {isLoadingData ? (
                  <p className="text-sm text-slate-400 text-center py-8">Cargando...</p>
                ) : (
                  dimensions.map(d => (
                    <DimensionBar key={d.key} label={d.label} value={d.value} maxAbsolute={maxAbsDimension} />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ══ Score History Mini-chart ══ */}
        {creditScore?.score_history && creditScore.score_history.length > 1 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Evolución del Score
            </h2>
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-end gap-1 h-24">
                  {[...creditScore.score_history].reverse().map((s, i) => {
                    const heightPct = Math.max(4, (s.score / 1000) * 100)
                    const levelCfg = LEVEL_CONFIG[s.level] || LEVEL_CONFIG.NUEVO
                    return (
                      <Tooltip key={s.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={`flex-1 rounded-t transition-all ${levelCfg.bg} cursor-help`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-800 text-white border-0">
                          <p className="text-xs">
                            <strong>{s.score}</strong> pts ({s.level})
                            <br />
                            {new Date(s.calculated_at).toLocaleDateString("es-AR")}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-slate-300 mt-1.5 px-0.5">
                  <span>
                    {new Date(creditScore.score_history[creditScore.score_history.length - 1].calculated_at).toLocaleDateString("es-AR")}
                  </span>
                  <span>
                    {new Date(creditScore.score_history[0].calculated_at).toLocaleDateString("es-AR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* ══ TRANSACTIONAL SECTION (existing) ══ */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Dimensión Transaccional
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>
                <MetricLabel label="Trabajos Completados" tooltip="Cantidad total de servicios finalizados exitosamente." />
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {isLoadingData ? "—" : scoring?.totalCompletedJobs ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <MetricLabel label="GMV Total" tooltip="Volumen total de dinero transaccionado. Representa el ingreso bruto declarado, sin descontar comisiones." />
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {isLoadingData ? "—" : formatARS(scoring?.totalGMV ?? null)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>
                <MetricLabel label="Ticket Promedio" tooltip="Valor promedio cobrado por cada trabajo." />
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {isLoadingData
                    ? "—"
                    : scoring?.ticketPromedio != null
                      ? formatARS(scoring.ticketPromedio)
                      : "Sin datos"}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ══ BEHAVIORAL SECTION (existing) ══ */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Señales de Comportamiento
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <MetricLabel label="Último Trabajo" />
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {isLoadingData
                    ? "—"
                    : scoring?.daysSinceLastJob != null
                      ? `Hace ${scoring.daysSinceLastJob}d`
                      : "Sin actividad"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                    <Ghost className="w-5 h-5" />
                  </div>
                </div>
                <MetricLabel label="Ghosting Rate" tooltip="Porcentaje de solicitudes asignadas que el trabajador ignoró o nunca respondió por WhatsApp." />
                <p className={`text-3xl font-bold mt-1 ${isLoadingData ? "text-slate-400" : ghostColor(scoring?.ghostingRate ?? 0)}`}>
                  {isLoadingData ? "—" : `${scoring?.ghostingRate ?? 0}%`}
                </p>
                <p className="text-xs text-slate-400 mt-1">Target: &lt; 10%</p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <Timer className="w-5 h-5" />
                  </div>
                </div>
                <MetricLabel label="Tiempo de Respuesta" tooltip="Promedio en minutos que tarda en contestar el mensaje de WhatsApp desde que se le asigna el pedido." />
                <p className={`text-3xl font-bold mt-1 ${isLoadingData ? "text-slate-400" : responseColor(scoring?.avgResponseTimeMinutes ?? null)}`}>
                  {isLoadingData
                    ? "—"
                    : scoring?.avgResponseTimeMinutes != null
                      ? `${scoring.avgResponseTimeMinutes} min`
                      : "Sin datos"}
                </p>
                <p className="text-xs text-slate-400 mt-1">Target: &lt; 30 min</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ══ CREDIT EVENTS TIMELINE ══ */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Timeline de Eventos Crediticios
            {creditHistory && <span className="text-slate-300 ml-2 normal-case font-normal">({creditHistory.total} total)</span>}
          </h2>
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="pt-4">
              {isLoadingData ? (
                <p className="text-sm text-slate-400 text-center py-8">Cargando...</p>
              ) : timelineEvents.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Sin eventos registrados aún.</p>
              ) : (
                <div className="space-y-0 divide-y divide-slate-50">
                  {timelineEvents.map(evt => {
                    const config = EVENT_CONFIG[evt.event_type] || {
                      icon: Info,
                      label: evt.event_type,
                      color: "text-slate-400",
                    }
                    const Icon = config.icon
                    const isPositive = evt.score_impact > 0

                    return (
                      <div key={evt.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <div className={`p-1.5 rounded-lg bg-slate-50 ${config.color} shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{config.label}</p>
                          <p className="text-[11px] text-slate-400">
                            {new Date(evt.created_at).toLocaleString("es-AR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {evt.amount != null && (
                              <span className="ml-2">{formatARS(Number(evt.amount))}</span>
                            )}
                            <span className="ml-2 text-slate-300">{evt.source}</span>
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1">
                          {isPositive ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                          )}
                          <span className={`text-sm font-bold ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                            {isPositive ? "+" : ""}{evt.score_impact}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

      </main>
    </div>
    </TooltipProvider>
  )
}
