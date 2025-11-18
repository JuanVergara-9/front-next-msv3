"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { isAdmin } from "@/lib/utils/admin"
import { MetricsService } from "@/lib/services/metrics.service"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

type UsersSummary = Awaited<ReturnType<typeof MetricsService.getUsersSummary>>
type MetricsSummary = Awaited<ReturnType<typeof MetricsService.getSummary>>
type ContactsBreakdown = Awaited<ReturnType<typeof MetricsService.getContactsBreakdown>>
type ReviewsSummary = Awaited<ReturnType<typeof MetricsService.getGlobalReviewsSummary>>

function toISODate(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function AdminMetricsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UsersSummary | null>(null)
  const [summary, setSummary] = useState<MetricsSummary | null>(null)
  const [contacts, setContacts] = useState<ContactsBreakdown | null>(null)
  const [reviews, setReviews] = useState<ReviewsSummary | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const { from, to } = useMemo(() => {
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - 30)
    return { from: toISODate(from), to: toISODate(to) }
  }, [])

  useEffect(() => {
    if (isLoading) return
    if (!user || !isAdmin(user)) {
      router.push("/")
      return
    }
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [u, s, c, r] = await Promise.all([
          MetricsService.getUsersSummary(),
          MetricsService.getSummary({ from, to }),
          MetricsService.getContactsBreakdown({ from, to }),
          MetricsService.getGlobalReviewsSummary(),
        ])
        setUsers(u)
        setSummary(s)
        setContacts(c)
        setReviews(r)
      } catch (e: any) {
        setError(e?.message || "No se pudieron cargar las métricas")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, isLoading, router, from, to])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando métricas…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin(user)) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-[#111827]">Métricas (últimos 30 días)</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KPI title="Usuarios totales" value={users?.totalUsers} />
          <KPI title="Clientes registrados" value={users?.clientsRegistered} />
          <KPI title="Trabajadores registrados" value={users?.workersRegistered} />
          <KPI title="Usuarios activos (30d)" value={users?.activeUsers30d} />
          <KPI title="Clientes activos (30d)" value={users?.activeClients30d} />
          <KPI title="Trabajadores activos (30d)" value={users?.activeWorkers30d} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <h2 className="text-lg font-semibold text-[#111827]">Conexiones</h2>
              <p className="text-sm text-[#6B7280]">Clicks en Contactar</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row label="Total" value={contacts?.total} />
              <Row label="WhatsApp" value={contacts?.whatsapp} />
              <Row label="Ver teléfono" value={contacts?.phone} />
              <Row label="Formulario web" value={contacts?.form} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <h2 className="text-lg font-semibold text-[#111827]">Actividad</h2>
              <p className="text-sm text-[#6B7280]">Promedios</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row label="DAU promedio" value={summary?.dau} />
              <Row label="WAU estimado" value={summary?.wau} />
              <Row label="Búsquedas" value={summary?.searches} />
              <Row label="Vistas de perfil" value={summary?.providerViews} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <h2 className="text-lg font-semibold text-[#111827]">Reseñas</h2>
              <p className="text-sm text-[#6B7280]">Global</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row label="Reseñas totales" value={reviews?.summary.count} />
              <Row label="Puntaje promedio" value={reviews?.summary.avgRating} suffix="/5" />
              <Row label="% con fotos" value={reviews?.summary.photosRate} suffix="%" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function KPI({ title, value }: { title: string; value: number | undefined }) {
  return (
    <Card className="rounded-2xl shadow-lg border-0">
      <CardHeader>
        <h2 className="text-sm text-[#6B7280]">{title}</h2>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[#111827]">{(value ?? 0).toLocaleString('es-AR')}</div>
      </CardContent>
    </Card>
  )
}

function Row({ label, value, suffix }: { label: string; value: number | undefined; suffix?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#6B7280]">{label}</span>
      <span className="font-semibold text-[#111827]">
        {(value ?? 0).toLocaleString('es-AR')}
        {suffix ? ` ${suffix}` : ''}
      </span>
    </div>
  )
}


