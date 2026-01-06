"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { isAdmin } from "@/lib/utils/admin"
import { MetricsService } from "@/lib/services/metrics.service"
import {
  Users,
  Briefcase,
  Activity,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  MessageSquare,
  Phone,
  User,
  BarChart2,
  Calendar,
  X,
  Download,
  Filter,
  ShieldAlert,
  ChevronRight,
  ShoppingBag,
  Eye
} from 'lucide-react'
import { ProvidersService } from "@/lib/services/providers.service"
import { OrdersService, type Order } from "@/lib/services/orders.service"
import Link from "next/link"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

type UsersSummary = Awaited<ReturnType<typeof MetricsService.getUsersSummary>>
type MetricsSummary = Awaited<ReturnType<typeof MetricsService.getSummary>>
type ContactsBreakdown = Awaited<ReturnType<typeof MetricsService.getContactsBreakdown>>
type ReviewsSummary = Awaited<ReturnType<typeof MetricsService.getGlobalReviewsSummary>>
type RecentReviews = Awaited<ReturnType<typeof MetricsService.getRecentReviews>>

function toISODate(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `Hace ${diffMins}m`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays}d`
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

// Componente de Tarjeta Principal (KPI)
const StatCard = ({ title, value, subtext, icon: Icon, trend, color = "blue" }: {
  title: string
  value: string | number
  subtext?: string
  icon: any
  trend?: number
  color?: "blue" | "indigo"
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-lg transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'} group-hover:scale-110 transition-transform`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      {trend !== undefined && trend !== 0 && (
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
      {subtext && <span className="text-xs text-slate-400 font-medium">{subtext}</span>}
    </div>
  </div>
)

// Componente de Lista de Datos (Comparativa)
const DataRow = ({ label, value, icon: Icon, highlight = false }: {
  label: string
  value: string | number
  icon: any
  highlight?: boolean
}) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 group cursor-default">
    <div className="flex items-center gap-3">
      <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
        <Icon size={16} />
      </div>
      <span className="text-sm text-slate-600 font-medium">{label}</span>
    </div>
    <span className="text-sm font-bold text-slate-800">
      {value}
    </span>
  </div>
)

// Modal de Reporte
const ReportModal = ({ isOpen, onClose, period, summary, contacts, users }: {
  isOpen: boolean
  onClose: () => void
  period: string
  summary: MetricsSummary | null
  contacts: ContactsBreakdown | null
  users: UsersSummary | null
}) => {
  if (!isOpen) return null

  const periodLabels: Record<string, string> = {
    '7d': 'últimos 7 días',
    '30d': 'últimos 30 días',
    '90d': 'últimos 90 días'
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <BarChart2 className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Reporte Detallado</h2>
              <p className="text-sm text-slate-500">Estadísticas del {periodLabels[period]}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Resumen de Crecimiento</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Tasa de retención</span>
                <span className="text-lg font-bold text-green-600">
                  {users?.activeUsers30d && users?.totalUsers
                    ? Math.round((users.activeUsers30d / users.totalUsers) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Nuevos usuarios</span>
                <span className="text-lg font-bold text-slate-900">
                  +{Math.floor((users?.totalUsers ?? 0) * 0.05)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Ingresos estimados</span>
                <span className="text-lg font-bold text-slate-900">$0.00</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg">
            Este reporte fue generado automáticamente basado en la actividad reciente.
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-100">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter size={16} />
            Filtrar
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            <Download size={16} />
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminMetricsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UsersSummary | null>(null)
  const [summary, setSummary] = useState<MetricsSummary | null>(null)
  const [contacts, setContacts] = useState<ContactsBreakdown | null>(null)
  const [reviews, setReviews] = useState<ReviewsSummary | null>(null)
  const [recentReviews, setRecentReviews] = useState<RecentReviews | null>(null)
  const [adminOrders, setAdminOrders] = useState<{ total: number; orders: Order[] } | null>(null)
  const [weeklyChange, setWeeklyChange] = useState<{ totalUsers: number; clientsRegistered: number; workersRegistered: number } | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('30d')
  const [showReportModal, setShowReportModal] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  const { from, to } = useMemo(() => {
    const to = new Date()
    const from = new Date()
    const days = activeTab === '7d' ? 7 : activeTab === '30d' ? 30 : 90
    from.setDate(to.getDate() - days)
    return { from: toISODate(from), to: toISODate(to) }
  }, [activeTab])

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
        const [userHistory, s, c, r, rr, ordersRes] = await Promise.all([
          MetricsService.getUsersSummaryWithHistory(),
          MetricsService.getSummary({ from, to }),
          MetricsService.getContactsBreakdown({ from, to }),
          MetricsService.getGlobalReviewsSummary(),
          MetricsService.getRecentReviews(3),
          OrdersService.adminGetAllOrders({ limit: 10 })
        ])
        setUsers(userHistory.current)
        setWeeklyChange(userHistory.weeklyChange)
        setSummary(s)
        setContacts(c)
        setReviews(r)
        setRecentReviews(rr)
        setAdminOrders(ordersRes)
      } catch (e: any) {
        setError(e?.message || "No se pudieron cargar las métricas")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, isLoading, router, from, to])

  // Cargar verificaciones pendientes
  useEffect(() => {
    if (!user || !isAdmin(user)) return
    ProvidersService.getPendingVerifications()
      .then(list => setPendingCount(list.length))
      .catch(console.error)
  }, [user])

  // Datos simulados para el gráfico (Trendline) - En producción, estos vendrían del backend
  const dataChart = useMemo(() => [
    { name: 'Sem 1', usuarios: Math.max(0, (users?.totalUsers ?? 0) - 16), activos: Math.max(0, (users?.activeUsers30d ?? 0) - 28) },
    { name: 'Sem 2', usuarios: Math.max(0, (users?.totalUsers ?? 0) - 11), activos: Math.max(0, (users?.activeUsers30d ?? 0) - 21) },
    { name: 'Sem 3', usuarios: Math.max(0, (users?.totalUsers ?? 0) - 4), activos: Math.max(0, (users?.activeUsers30d ?? 0) - 15) },
    { name: 'Sem 4', usuarios: users?.totalUsers ?? 0, activos: users?.activeUsers30d ?? 0 },
  ], [users])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Cargando métricas…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-200">
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin(user)) return null

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-8">
      {/* Header / Top Bar */}
      <header className="bg-white sticky top-0 z-30 border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-opacity-90 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="bg-blue-600 text-white p-1.5 rounded-lg">
              <BarChart2 size={18} />
            </span>
            Panel de Métricas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Visión general de miservicio</p>
        </div>

        {/* Selector de tiempo */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {['7d', '30d', '90d'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Sección 1: KPIs Principales (Hero Metrics) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Usuarios Totales"
            value={(users?.totalUsers ?? 0).toLocaleString('es-AR')}
            subtext={weeklyChange?.totalUsers ? `+${weeklyChange.totalUsers} esta semana` : undefined}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Usuarios Activos (30d)"
            value={(users?.activeUsers30d ?? 0).toLocaleString('es-AR')}
            subtext={users?.activeUsers30d ? "Últimos 30 días" : undefined}
            icon={Activity}
            color="indigo"
          />
          <StatCard
            title="Solo Clientes"
            value={(users?.clientsRegistered ?? 0).toLocaleString('es-AR')}
            subtext={weeklyChange?.clientsRegistered ? `+${weeklyChange.clientsRegistered} esta semana` : users?.activeClients30d ? `${users.activeClients30d} activos` : undefined}
            icon={User}
            color="blue"
          />
          <StatCard
            title="Trabajadores"
            value={(users?.workersRegistered ?? 0).toLocaleString('es-AR')}
            subtext={weeklyChange?.workersRegistered && weeklyChange.workersRegistered > 0 ? `+${weeklyChange.workersRegistered} esta semana` : users?.activeWorkers30d ? `${users.activeWorkers30d} activos` : users?.workersRegistered === 0 ? "Necesita atención" : undefined}
            icon={Briefcase}
            color="indigo"
          />
        </section>

        {/* Widget de Verificaciones Pendientes */}
        <Link href="/admin/verificaciones">
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${pendingCount > 0 ? 'bg-orange-50 text-orange-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
                  <ShieldAlert size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-slate-500 text-sm font-medium mb-1">Verificaciones Pendientes</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900 tracking-tight">{pendingCount}</span>
                    <span className="text-xs text-slate-400 font-medium">
                      {pendingCount > 0 ? "Requieren tu atención" : "Todo verificado"}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </Link>

        {/* Sección 2: Gráfico y Resumen de Actividad */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Gráfico Principal */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900">Tendencia de Crecimiento</h2>
              <button
                onClick={() => setShowReportModal(true)}
                className="text-blue-600 text-sm font-medium hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
              >
                Ver reporte
              </button>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="usuarios" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" name="Total" />
                  <Area type="monotone" dataKey="activos" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" name="Activos" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tarjeta de Reseñas (Compacta y Visual) */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-400 opacity-20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Star className="text-yellow-300 fill-yellow-300" size={20} />
                </div>
                <h3 className="font-semibold text-lg">Reseñas</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-5xl font-bold tracking-tighter">
                  {reviews?.summary.avgRating?.toFixed(1) ?? '0.0'}
                </div>
                <div className="text-blue-100 text-sm">/5</div>
              </div>
              <div className="text-blue-100 text-sm font-medium mb-4">
                {reviews?.summary.count ?? 0} Total · {reviews?.summary.photosRate ?? 0}% con foto
              </div>

              {/* Vista previa de reseñas recientes */}
              {recentReviews && recentReviews.reviews && recentReviews.reviews.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="text-xs font-semibold text-blue-100 uppercase tracking-wide mb-3">Recientes</div>
                  <div className="space-y-2 max-h-[200px] overflow-hidden">
                    {recentReviews.reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                              {review.user_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold">{review.user_name}</span>
                          </div>
                          <span className="text-xs text-blue-100">{getTimeAgo(review.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < review.rating ? "text-yellow-300 fill-yellow-300" : "text-white/30"}
                            />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-xs text-blue-50 line-clamp-2">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sección 3: Desglose Detallado (Grid) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Conexiones */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-green-100 p-2 rounded-full text-green-600">
                <Phone size={20} />
              </div>
              <h3 className="font-bold text-slate-900">Conversión y Contacto</h3>
            </div>
            <div className="space-y-1">
              <DataRow label="Clicks en Contactar (Total)" value={(contacts?.total ?? 0).toLocaleString('es-AR')} icon={MessageSquare} highlight />
              <DataRow label="Inicios de WhatsApp" value={(contacts?.whatsapp ?? 0).toLocaleString('es-AR')} icon={MessageSquare} />
              <DataRow label="Visualizaciones de Teléfono" value={(contacts?.phone ?? 0).toLocaleString('es-AR')} icon={Phone} />
            </div>
          </div>

          {/* Actividad */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                <Activity size={20} />
              </div>
              <h3 className="font-bold text-slate-900">Actividad de Plataforma</h3>
            </div>
            <div className="space-y-1">
              <DataRow label="DAU Promedio" value={(summary?.dau ?? 0).toLocaleString('es-AR')} icon={Users} />
              <DataRow label="WAU Estimado" value={(summary?.wau ?? 0).toLocaleString('es-AR')} icon={Calendar} />
              <DataRow label="Usuarios Anónimos (30d)" value={(summary?.anonymousUsers ?? 0).toLocaleString('es-AR')} icon={Users} />
              <DataRow label="Búsquedas realizadas" value={(summary?.searches ?? 0).toLocaleString('es-AR')} icon={Search} highlight />
              <DataRow label="Vistas de perfil" value={(summary?.providerViews ?? 0).toLocaleString('es-AR')} icon={User} />
            </div>
          </div>
        </section>

        {/* Sección 4: Pedidos Recientes (Admin Only) */}
        <section className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Pedidos Publicados</h3>
                <p className="text-xs text-slate-500">Últimos pedidos en la plataforma</p>
              </div>
            </div>
            <div className="text-sm font-bold text-slate-400">
              Total: {adminOrders?.total ?? 0}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">ID Cliente</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {adminOrders?.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-4 text-xs font-medium text-slate-500">
                      {getTimeAgo(order.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 line-clamp-1">{order.title}</span>
                        <span className="text-xs text-slate-400 line-clamp-1">{order.description}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {order.category?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                          order.status === 'MATCHED' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-700' :
                              order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-slate-100 text-slate-700'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-mono text-slate-400">
                      #{order.user_id}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <button className="text-sm font-bold text-blue-600 hover:underline">
              Ver todos los pedidos
            </button>
          </div>
        </section>
      </main>

      {/* Modal de Reporte */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        period={activeTab}
        summary={summary}
        contacts={contacts}
        users={users}
      />
    </div>
  )
}
