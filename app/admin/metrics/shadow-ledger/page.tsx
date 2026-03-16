"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { isAdmin } from "@/lib/utils/admin"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeft, Users, Receipt, DollarSign, TrendingUp } from "lucide-react"

const SHADOW_LEDGER_API_URL =
  process.env.NEXT_PUBLIC_TICKETS_API_URL || "https://notification-service2-production.up.railway.app/api/v1"

type ShadowLedgerMetrics = {
  activeWorkers: number
  totalTransactions: number
  gmv: number
  retentionRate: number | null
}

export default function ShadowLedgerDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [metrics, setMetrics] = useState<ShadowLedgerMetrics>({
    activeWorkers: 0,
    totalTransactions: 0,
    gmv: 0,
    retentionRate: null,
  })
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || isLoading) return
    if (!user || !isAdmin(user)) {
      router.push("/")
      return
    }
  }, [user, isLoading, router, mounted])

  useEffect(() => {
    if (!user || !isAdmin(user)) return
    let cancelled = false
    async function fetchMetrics() {
      try {
        const res = await fetch(`${SHADOW_LEDGER_API_URL}/metrics/shadow-ledger-health`)
        if (!res.ok) throw new Error("Error al cargar métricas")
        const data = await res.json()
        if (!cancelled) {
          setMetrics({
            activeWorkers: data.activeWorkers ?? 0,
            totalTransactions: data.totalTransactions ?? 0,
            gmv: data.gmv ?? 0,
            retentionRate: data.retentionRate ?? null,
          })
        }
      } catch (e) {
        if (!cancelled) setMetrics((m) => ({ ...m }))
      } finally {
        if (!cancelled) setIsLoadingMetrics(false)
      }
    }
    fetchMetrics()
    return () => { cancelled = true }
  }, [user])

  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !isAdmin(user)) return null

  const formattedGMV = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(metrics.gmv)

  const healthMetrics = [
    {
      title: "Trabajadores Activos (30d)",
      value: isLoadingMetrics ? "Cargando..." : String(metrics.activeWorkers),
      target: "50+",
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Transacciones Totales (30d)",
      value: isLoadingMetrics ? "Cargando..." : String(metrics.totalTransactions),
      target: null,
      icon: Receipt,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "GMV (30d)",
      value: isLoadingMetrics ? "Cargando..." : formattedGMV,
      target: null,
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Retention Rate (M1 → M3)",
      value: isLoadingMetrics ? "Cargando..." : (metrics.retentionRate != null ? `${metrics.retentionRate}%` : "Falta data (M3)"),
      target: null,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-8">
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            href="/admin/metrics"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shadow Ledger Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Nivel 1 — Vista agregada. Métricas de salud y comportamiento.</p>
        </div>

        {/* Sección A: Health Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {healthMetrics.map((metric) => {
            const Icon = metric.icon
            return (
            <Card key={metric.title} className="border-slate-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2.5 rounded-lg ${metric.bg} ${metric.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {metric.target && (
                    <span className="text-xs font-medium text-slate-400">Target: {metric.target}</span>
                  )}
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">{metric.title}</h3>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{metric.value}</p>
              </CardContent>
            </Card>
            )
          })}
        </section>

        {/* Sección B y C: Placeholders para gráficos */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-100 shadow-sm w-full">
            <CardHeader>
              <CardTitle className="text-slate-900">Profundidad Transaccional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-sm">
                Histograma de transacciones por trabajador (próximamente)
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm w-full">
            <CardHeader>
              <CardTitle className="text-slate-900">Señales de Comportamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-sm">
                Tabla Ghosting y tiempos de respuesta (próximamente)
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
