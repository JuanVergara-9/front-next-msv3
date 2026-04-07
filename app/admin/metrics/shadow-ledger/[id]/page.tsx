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
} from "lucide-react"

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

const formatARS = (amount: number | null) => {
  if (amount === null || amount === undefined) return "—"
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function WorkerFinancialProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const workerId = params?.id as string

  const [mounted, setMounted] = useState(false)
  const [provider, setProvider] = useState<Provider | null>(null)
  const [scoring, setScoring] = useState<WorkerScoring | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
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

        const [providerRes, scoringRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/providers/${workerId}`, { headers }),
          fetch(`${SHADOW_LEDGER_API_URL}/metrics/worker-scoring/${workerId}`),
        ])

        if (!providerRes.ok) throw new Error("No se pudo obtener el perfil del trabajador")
        if (!scoringRes.ok) throw new Error("No se pudo obtener el scoring del trabajador")

        const providerData = await providerRes.json()
        const scoringData = await scoringRes.json()

        if (!cancelled) {
          setProvider(providerData)
          setScoring(scoringData)
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Error desconocido")
      } finally {
        if (!cancelled) setIsLoadingData(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [user, workerId])

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

  /* ── Color helpers ── */
  const ghostColor = (rate: number) =>
    rate < 10 ? "text-emerald-500" : "text-red-500"

  const responseColor = (mins: number | null) => {
    if (mins === null) return "text-slate-400"
    if (mins < 30) return "text-emerald-500"
    if (mins < 60) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-8">
      {/* Header */}
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
              Nivel 2 — Perfil Financiero Individual
            </p>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ── Sección A: Dimensión Transaccional ── */}
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
                <p className="text-sm text-slate-500 font-medium">Trabajos Completados</p>
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
                <p className="text-sm text-slate-500 font-medium">GMV Total</p>
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
                <p className="text-sm text-slate-500 font-medium">Ticket Promedio</p>
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

        {/* ── Sección B: Señales de Comportamiento ── */}
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
                <p className="text-sm text-slate-500 font-medium">Último Trabajo</p>
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
                <p className="text-sm text-slate-500 font-medium">Ghosting Rate</p>
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
                <p className="text-sm text-slate-500 font-medium">Tiempo de Respuesta</p>
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

      </main>
    </div>
  )
}
