"use client"

import { useState, useEffect, useRef } from "react"
import { ProvidersService } from '@/lib/services/providers.service'
import { UserProfileService } from '@/lib/services/user-profile.service'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '../components/Header'
import { ProviderCard } from '../components/ProviderCard'
import type { ProviderWithDetails } from '../types/api'
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from "react-hot-toast"
import { InsightsService } from '@/lib/services/insights.service'
import { MetricsService } from '@/lib/services/metrics.service'
import { OrdersService, type Order } from '@/lib/services/orders.service'
import {
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
  Laptop,
  Sparkles,
  Flower2,
  Droplets,
  Flame,
  Search,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Star as StarIcon,
  MessageSquare,
  ArrowRight
} from "lucide-react"

// Componente de efecto typewriter para oficios
const TypewriterText = ({ words, className = "" }: { words: string[]; className?: string }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(150)

  useEffect(() => {
    const currentWord = words[currentWordIndex]

    if (!isDeleting && currentText === currentWord) {
      // Pausa antes de empezar a borrar
      setTimeout(() => setIsDeleting(true), 2000)
      return
    }

    if (isDeleting && currentText === "") {
      // Cambiar a la siguiente palabra
      setIsDeleting(false)
      setCurrentWordIndex((prev) => (prev + 1) % words.length)
      setTypingSpeed(150)
      return
    }

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setCurrentText(currentWord.substring(0, currentText.length - 1))
        setTypingSpeed(75) // Más rápido al borrar
      } else {
        setCurrentText(currentWord.substring(0, currentText.length + 1))
        setTypingSpeed(150) // Velocidad normal al escribir
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed])

  return (
    <span className={className}>
      {currentText}
    </span>
  )
}

// Categories with icons for the UI
// Categories with outline icons for modern look
const CATEGORIES_WITH_ICONS = [
  { name: "Plomería", icon: Droplets, slug: "plomeria", count: "15 profesionales" },
  { name: "Gasistas", icon: Flame, slug: "gasistas", count: "8 profesionales" },
  { name: "Electricidad", icon: Zap, slug: "electricidad", count: "12 profesionales" },
  { name: "Jardinería", icon: Flower2, slug: "jardineria", count: "10 profesionales" },
  { name: "Piletas", icon: Droplets, slug: "mantenimiento-limpieza-piletas", count: "6 profesionales" },
  { name: "Técnicos", icon: Zap, slug: "reparacion-electrodomesticos", count: "14 profesionales" },
  { name: "Carpintería", icon: Hammer, slug: "carpinteria", count: "9 profesionales" },
  { name: "Pintura", icon: Paintbrush, slug: "pintura", count: "11 profesionales" }
]

// --- Hand-drawn elements ---
const HandDrawnArrow = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M10 50 Q 30 10 90 40 M 90 40 L 75 30 M 90 40 L 80 55" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <animate attributeName="stroke-dasharray" from="0, 150" to="150, 0" dur="1.5s" fill="freeze" />
    </path>
  </svg>
)

const HighlighterCircle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 60" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M10 30 Q 50 5 100 10 Q 150 15 190 40 Q 150 55 100 50 Q 50 45 15 35" stroke="#ff7b00" strokeWidth="3" strokeLinecap="round" opacity="0.4" fill="#ff7b00" fillOpacity="0.1">
      <animate attributeName="stroke-dashoffset" from="500" to="0" dur="2s" />
    </path>
  </svg>
)

// --- How It Works ---
const HowItWorks = () => {
  const steps = [
    {
      title: "Describí tu necesidad",
      desc: "Publicá lo que necesitás resolver en pocos pasos y 100% gratis.",
      icon: (
        <div className="relative">
          <MessageSquare className="w-8 h-8 text-primary" />
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-black text-white">1</div>
        </div>
      )
    },
    {
      title: "Recibí presupuestos",
      desc: "Los mejores profesionales locales te enviarán sus propuestas en minutos.",
      icon: (
        <div className="relative">
          <TrendingUp className="w-8 h-8 text-emerald-600" />
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-black text-white">2</div>
        </div>
      )
    },
    {
      title: "Elegí y resolvé",
      desc: "Compará perfiles, calificaciones y elegí al profesional que más te guste.",
      icon: (
        <div className="relative">
          <CheckCircle2 className="w-8 h-8 text-secondary" />
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-black text-white">3</div>
        </div>
      )
    }
  ]

  return (
    <section className="py-20 px-4 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          <h2 className="text-4xl font-black text-[#0e315d] mb-4">¿Cómo funciona <span className="text-primary italic font-serif">miservicio</span>?</h2>
          <p className="text-[#0d519b]/60 text-lg font-medium">Resolver problemas en tu hogar nunca fue tan fácil.</p>
          <HighlighterCircle className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-64 h-auto pointer-events-none opacity-50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting lines for desktop */}
          <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-slate-100 -z-10" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center text-center space-y-4 p-8 rounded-[40px] hover:bg-slate-50 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <div className="w-20 h-20 bg-white shadow-xl rounded-3xl flex items-center justify-center border border-slate-50">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-[#0e315d]">{step.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const TrustSection = () => {
  const pillars = [
    {
      title: "Identidad Validada",
      desc: "Profesionales con perfiles verificados para tu total tranquilidad.",
      icon: <ShieldCheck className="w-10 h-10 text-emerald-600" />
    },
    {
      title: "Privacidad Segura",
      desc: "Tu contacto y ubicación están protegidos bajo estándares de seguridad.",
      icon: <CheckCircle2 className="w-10 h-10 text-primary" />
    },
    {
      title: "Soporte Local",
      desc: "Estamos en San Rafael para acompañarte en cada paso del proceso.",
      icon: <MessageSquare className="w-10 h-10 text-secondary" />
    }
  ]

  return (
    <section className="py-20 px-4 bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => (
            <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                {pillar.icon}
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0e315d] mb-2">{pillar.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Subcomponents

const ActiveMarketplaceHero = ({
  city,
  isProvider
}: {
  city: string
  isProvider: boolean
}) => {
  const [stats, setStats] = useState({ resolved_this_month: 0, avg_rating: 0, total_providers: 500 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [orderStats, reviewStats, providersRes] = await Promise.all([
          OrdersService.getStats().catch(() => ({ resolved_this_month: 0, total_orders: 0 })),
          MetricsService.getGlobalReviewsSummary().catch(() => ({ summary: { avgRating: 0 } })),
          ProvidersService.searchProviders({ limit: 1 }).catch(() => ({ total: 500 }))
        ]);
        setStats({
          resolved_this_month: orderStats.resolved_this_month,
          avg_rating: reviewStats.summary?.avgRating || 0,
          total_providers: providersRes.total || 500
        });
      } catch (e) {
        console.error('Error fetching stats:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const resolvedText = stats.resolved_this_month > 0
    ? `Más de ${stats.resolved_this_month} pedidos resueltos este mes`
    : 'Plataforma en crecimiento';
  const ratingText = stats.avg_rating > 0
    ? `${stats.avg_rating.toFixed(1)}/5 Calificación promedio`
    : 'Profesionales verificados';

  return (
    <motion.section
      className="relative pt-24 pb-20 px-4 border-b border-slate-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Dynamic Background Wrapper - contained */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[#f8fdff]" />
        <div className="absolute inset-0 technical-grid" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -ml-64 -mb-64" />
        {/* Organic blob */}
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }} />
      </div>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative">
        <div className="flex-1 flex flex-col items-start text-left z-10">
          {/* Elite Badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-2xl text-xs font-black mb-10 shadow-sm border border-slate-300 text-[#0e315d] uppercase tracking-widest"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-[#0e315d]">{resolvedText}</span>
          </motion.div>

          {/* Extreme Conversion Headline - 70% Width */}
          <motion.div
            className="max-w-[800px] text-left mb-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-5xl md:text-7xl font-black text-[#0e315d] mb-6 leading-[1.1] tracking-tight">
              Resolvé cualquier problema en tu hogar <span className="text-primary italic font-serif">hoy.</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#0d519b]/80 font-medium max-w-2xl text-balance relative">
              Publicá tu necesidad y recibí presupuestos de <span className="font-bold text-[#0e315d]">profesionales locales</span> en <span className="font-bold text-[#0e315d]">minutos</span>.
              <span className="relative inline-block ml-1">
                <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md transform rotate-2 inline-block shadow-sm border border-emerald-100/50">100% Gratis.</span>
                <HighlighterCircle className="absolute inset-0 -m-2 opacity-30 pointer-events-none" />
              </span>
            </p>
          </motion.div>

          {/* Main XL Action Button */}
          <motion.div
            className="w-full max-w-md"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {isProvider ? (
              <Link href="/pedidos" className="w-full">
                <Button
                  className="w-full h-20 text-xl font-black rounded-2xl bg-[#0e315d] hover:bg-[#0e315d]/90 text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 gap-3"
                >
                  Ir a buscar trabajos
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </Link>
            ) : (
              <div className="relative group">
                <Link href="/pedidos/nuevo" className="w-full">
                  <Button
                    className="w-full h-20 text-2xl font-black rounded-2xl bg-[#ff7b00] hover:bg-[#e66e00] text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 gap-3 border-b-4 border-[#cc5f00]"
                  >
                    Publicar Pedido Gratis
                    <PlusCircle className="w-7 h-7" />
                  </Button>
                </Link>
                {/* Hand drawn arrow pointing to button */}
                <div className="hidden lg:block absolute -right-24 top-0 w-20 h-20 text-[#ff7b00] transform rotate-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <HandDrawnArrow className="w-full h-full" />
                  <span className="absolute -bottom-4 left-0 text-[10px] font-black uppercase tracking-tighter whitespace-nowrap bg-amber-400 text-white px-2 py-0.5 rounded rotate-[-5deg]">¡Es gratis!</span>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap justify-start gap-6 text-[#0e315d] font-bold text-sm uppercase tracking-wider">
              <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-slate-200">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> +{stats.total_providers} Profesionales
              </div>
              <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-slate-200">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                4.9/5 Promedio
              </div>
            </div>
          </motion.div>
        </div>

        {/* Human Factor Image - Desktop Only */}
        <motion.div
          className="hidden md:block flex-1 relative z-20"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="relative z-10 w-full max-w-md ml-auto">
            <div className="absolute inset-0 bg-primary/20 rounded-[40px] blur-3xl -z-10 transform translate-x-4 translate-y-4" />
            <img
              src="/hero_professional.png"
              alt="Profesional trabajando"
              className="w-full h-auto rounded-[40px] shadow-2xl grayscale-[0.2] hover:grayscale-0 transition-all duration-700 hover:scale-[1.02] -mb-12 border-4 border-white/50 backdrop-blur-sm"
            />
            {/* Trust Badges */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-black text-[#0e315d] uppercase leading-none">Verificado</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Sistema de confianza</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

const RecentOrdersFeed = ({ city }: { city: string }) => {
  const [orders, setOrders] = useState<{ id: number; category_name: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await OrdersService.getPublicRecentOrders(6);
        setOrders(data.orders || []);
      } catch (e) {
        console.error('Error fetching recent orders:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // Helper to format relative time
  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const orderDate = new Date(dateString);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Recién';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return 'Hace más de un día';
  };

  if (loading) {
    return (
      <section className="py-12 bg-slate-50 border-y border-slate-200/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="h-6 w-64 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-6 px-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-72 h-32 bg-white border border-slate-100 p-5 rounded-[24px] animate-pulse shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (orders.length === 0) return null;

  const displayItems = orders.map(o => ({
    time: formatRelativeTime(o.created_at),
    service: o.category_name,
    zone: city.split(',')[0] || 'tu zona'
  }));

  return (
    <section className="py-12 bg-slate-50 border-y border-slate-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <h3 className="text-[#0e315d] text-lg font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Pedidos recientes en {city.split(',')[0] || "tu zona"}
        </h3>
      </div>

      <div className="relative">
        <div className="animate-marquee whitespace-nowrap gap-6 py-4">
          {[...displayItems, ...displayItems, ...displayItems, ...displayItems].map((item, i) => (
            <div
              key={i}
              className="inline-block w-72 bg-white border border-slate-200 p-5 rounded-[24px] shadow-sm hover:shadow-md transition-shadow align-top whitespace-normal mr-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {item.time}
                </span>
              </div>
              <p className="text-[#0e315d] font-bold text-lg leading-tight">
                Pedido de <span className="text-primary">{item.service}</span> en <span className="text-slate-500">{item.zone}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


const SkeletonCard = () => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-pulse flex flex-col h-full">
    <div className="flex gap-4 mb-4 flex-1">
      <div className="w-16 h-16 bg-gray-200 rounded-2xl flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3 mt-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
      </div>
    </div>
    <div className="mb-4 flex gap-2">
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
    </div>
    <div className="flex gap-3 mt-auto">
      <div className="flex-1 h-12 bg-gray-200 rounded-2xl"></div>
      <div className="flex-1 h-12 bg-gray-200 rounded-2xl"></div>
    </div>
  </div>
)


const EmptyState = ({ onSearchCityWide, onViewCategories }: { onSearchCityWide: () => void; onViewCategories: () => void }) => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 premium-shadow">
      <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-foreground mb-3">¡Aún no hay proveedores en tu zona!</h3>
    <p className="text-muted-foreground mb-6 max-w-md mx-auto text-pretty">
      Estamos trabajando para traer los mejores profesionales a tu área.
      Mientras tanto, probá con otros términos de búsqueda.
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button onClick={onSearchCityWide} className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium cursor-pointer">
        Buscar en toda la ciudad
      </button>
      <button onClick={onViewCategories} className="px-6 py-3 border border-primary text-primary rounded-xl hover:bg-primary/10 transition-colors font-medium cursor-pointer">
        Ver categorías
      </button>
    </div>
  </div>
)

// Categories section removed from Home per product decision

const ProvidersList = ({
  providers,
  loading,
  onContact,
  onSearchCityWide,
  onViewCategories,
}: {
  providers: ProviderWithDetails[]
  loading: boolean
  onContact: (provider: ProviderWithDetails) => void
  onSearchCityWide: () => void
  onViewCategories: () => void
}) => (
  <motion.section
    className="px-4 py-4 flex-1"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.6 }}
  >
    <div className="max-w-7xl mx-auto">
      <motion.h2
        className="text-lg font-semibold text-foreground mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        Cerca de mí
      </motion.h2>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="md:hidden -mx-4 px-4 overflow-x-auto">
              <div className="flex snap-x snap-mandatory snap-always space-x-4 pr-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="min-w-[85%] snap-center"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                  >
                    <SkeletonCard />
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <SkeletonCard />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : providers.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EmptyState onSearchCityWide={onSearchCityWide} onViewCategories={onViewCategories} />
          </motion.div>
        ) : (
          <motion.div
            key="providers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="md:hidden -mx-4 px-4 overflow-x-auto pb-4">
              <div className="flex snap-x snap-mandatory snap-always space-x-4 pr-4 pb-2 items-stretch">
                {providers.map((provider, index) => (
                  <motion.div
                    key={provider.id}
                    className="min-w-[85%] snap-center h-full"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <ProviderCard provider={provider} onContact={onContact} />
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
              {providers.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  className="h-full"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1, type: "spring", stiffness: 100 }}
                >
                  <ProviderCard provider={provider} onContact={onContact} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.section>
)


// Componente de botón de feedback reutilizable
const FeedbackButton = () => {
  const { user } = useAuth()
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'bug' as 'bug' | 'feature_request' | 'complaint' | 'other',
    subject: '',
    message: '',
  })

  // Si no hay usuario, mostrar igual pero manejar el submit
  // if (!user) return null

  return (
    <>
      <button
        onClick={() => setIsFeedbackModalOpen(true)}
        className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
      >
        Reportar problema
      </button>

      {/* Modal para reportar problema */}
      <Dialog
        open={isFeedbackModalOpen}
        onOpenChange={(open) => {
          setIsFeedbackModalOpen(open)
          if (!open) {
            setFeedbackForm({
              type: 'bug',
              subject: '',
              message: '',
            })
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reportar problema</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-type">Tipo de reporte</Label>
              <Select
                value={feedbackForm.type}
                onValueChange={(value: 'bug' | 'feature_request' | 'complaint' | 'other') =>
                  setFeedbackForm({ ...feedbackForm, type: value })
                }
              >
                <SelectTrigger id="feedback-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Error o bug</SelectItem>
                  <SelectItem value="feature_request">Solicitud de funcionalidad</SelectItem>
                  <SelectItem value="complaint">Queja o problema</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-subject">Asunto</Label>
              <Input
                id="feedback-subject"
                value={feedbackForm.subject}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, subject: e.target.value })}
                placeholder="Describe brevemente el problema"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-message">Mensaje</Label>
              <Textarea
                id="feedback-message"
                value={feedbackForm.message}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                placeholder="Describe el problema o sugerencia en detalle"
                rows={6}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsFeedbackModalOpen(false)}
                disabled={isSubmittingFeedback}
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  if (!feedbackForm.subject.trim() || !feedbackForm.message.trim()) {
                    toast.error('Por favor completa todos los campos')
                    return
                  }

                  try {
                    setIsSubmittingFeedback(true)
                    await UserProfileService.submitFeedback(feedbackForm)
                    toast.success('Reporte enviado correctamente. Gracias por tu feedback.')
                    setIsFeedbackModalOpen(false)
                    setFeedbackForm({
                      type: 'bug',
                      subject: '',
                      message: '',
                    })
                  } catch (error: any) {
                    console.error('Error submitting feedback:', error)
                    toast.error(error?.message || 'Error al enviar el reporte. Intenta nuevamente.')
                  } finally {
                    setIsSubmittingFeedback(false)
                  }
                }}
                disabled={isSubmittingFeedback || !feedbackForm.subject.trim() || !feedbackForm.message.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmittingFeedback ? 'Enviando...' : 'Enviar reporte'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Main component
export default function MiservicioHome() {
  const { user, isProvider } = useAuth()
  const router = useRouter()
  const [city, setCity] = useState<string>("")
  const [query, setQuery] = useState<string>("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [stats, setStats] = useState({ total_providers: 0 })

  useEffect(() => {
    ProvidersService.searchProviders({ limit: 1 }).then(res => {
      setStats({ total_providers: res.total || 500 })
    }).catch(() => setStats({ total_providers: 500 }))
  }, [])

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [providers, setProviders] = useState<ProviderWithDetails[]>([])
  const [filtered, setFiltered] = useState<ProviderWithDetails[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const handleSearchCityWide = async () => {
    try {
      setLoading(true)
      const searchParams: any = { limit: 24 }
      // Buscar por ciudad actual si la tenemos resuelta
      if (city && city.includes(',')) {
        searchParams.city = city.split(',')[0].trim()
      }
      const response = await ProvidersService.searchProviders(searchParams)
      let transformedProviders = response.providers.map(provider => ({
        ...provider,
        full_name: `${provider.first_name} ${provider.last_name}`,
        rating: provider.rating || 0,
        review_count: provider.review_count || 0,
        distance_km: undefined,
        categories: provider.category ? [provider.category.name] : [],
        avatar_url: (provider as any).avatar_url,
      }))

      transformedProviders = await ProvidersService.enrichWithReviewSummaries(transformedProviders)
      setProviders(transformedProviders)
      setFiltered(transformedProviders)
    } catch (e) {
      console.warn('City-wide search failed:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleViewCategories = () => {
    window.location.href = '/categorias'
  }

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // 1) Intentar obtener ubicación del usuario
        let location: { lat: number; lng: number } | null = null
        try {
          location = await ProvidersService.getCurrentLocation()
          setUserLocation(location)
        } catch (locationError) {
          console.warn('Could not get location:', locationError)
        }

        // 2) Preparar parámetros de búsqueda (usar la variable local para no depender del setState)
        const searchParams: any = { limit: 6 }
        if (location) {
          searchParams.lat = location.lat
          searchParams.lng = location.lng
          searchParams.radius_km = 50 // 50km radius
        }

        // 3) Resolver en paralelo: reverse geocoding (si hay coords) y providers
        const [cityName, response] = await Promise.all([
          location
            ? ProvidersService.getCityFromCoords(location.lat, location.lng).catch(() => 'Mi ubicación')
            : Promise.resolve('San Rafael, Mendoza'),
          ProvidersService.searchProviders(searchParams),
        ])

        setCity(cityName || 'San Rafael, Mendoza')

        // 4) Transform backend data to UI format (usar location local para distancia)
        let transformedProviders = response.providers.map(provider => ({
          ...provider,
          full_name: `${provider.first_name} ${provider.last_name}`,
          rating: provider.rating || 0,
          review_count: provider.review_count || 0,
          distance_km: location
            ? ProvidersService.calculateDistance(
              location.lat,
              location.lng,
              provider.lat || 0,
              provider.lng || 0
            )
            : undefined,
          categories: provider.category ? [provider.category.name] : [],
          avatar_url: (provider as any).avatar_url,
        }))

        transformedProviders = await ProvidersService.enrichWithReviewSummaries(transformedProviders)

        // 4b) Fallback: si no hay resultados cerca, probar por ciudad detectada
        if (transformedProviders.length === 0 && (cityName || '').includes(',')) {
          try {
            const onlyCity = (cityName || '').split(',')[0].trim()
            if (onlyCity) {
              const r2 = await ProvidersService.searchProviders({ city: onlyCity, limit: 6 })
              transformedProviders = r2.providers.map(provider => ({
                ...provider,
                full_name: `${provider.first_name} ${provider.last_name}`,
                rating: provider.rating || 0,
                review_count: provider.review_count || 0,
                distance_km: undefined,
                categories: provider.category ? [provider.category.name] : [],
                avatar_url: (provider as any).avatar_url,
              }))

              transformedProviders = await ProvidersService.enrichWithReviewSummaries(transformedProviders)
            }
          } catch (e) {
            console.warn('City fallback failed', e)
          }
        }

        setProviders(transformedProviders)
        setFiltered(transformedProviders)
      } catch (err) {
        console.warn('Error loading data from backend:', err)
        // No usar datos mock; dejar lista vacía para validación
        setProviders([])
        setFiltered([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter providers based on query and category
  useEffect(() => {
    let result = providers

    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      result = result.filter(
        (provider) =>
          provider.full_name.toLowerCase().includes(searchTerm) ||
          (provider.description && provider.description.toLowerCase().includes(searchTerm)) ||
          provider.categories.some((cat) => cat.toLowerCase().includes(searchTerm)),
      )
    }

    if (activeCategory) {
      result = result.filter((provider) => provider.categories.includes(activeCategory))
    }

    setFiltered(result)
  }, [query, activeCategory, providers])

  const handleSearch = async () => {
    if (!query.trim()) return

    void InsightsService.trackSearch({
      query: query.trim(),
      city,
      category: activeCategory ?? undefined,
      userId: user?.id ?? undefined,
    })

    // Si ya hay proveedores filtrados localmente, simplemente hacer scroll a los resultados
    // El filtro en tiempo real ya está funcionando
    if (filtered.length > 0) {
      // Hacer scroll suave a la sección de proveedores
      // Buscar el h2 que contiene "Cerca de mí" y hacer scroll a su sección padre
      const headings = Array.from(document.querySelectorAll('h2'))
      const cercaHeading = headings.find(h2 => h2.textContent?.includes('Cerca de mí'))
      if (cercaHeading) {
        const section = cercaHeading.closest('section')
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
      return
    }

    // Si no hay proveedores filtrados, hacer búsqueda en el backend
    try {
      setLoading(true)
      const searchParams: any = {
        query: query.trim()
      }

      if (userLocation) {
        searchParams.lat = userLocation.lat
        searchParams.lng = userLocation.lng
        searchParams.radius_km = 50
      }

      const response = await ProvidersService.searchProviders(searchParams)

      let transformedProviders = response.providers.map(provider => ({
        ...provider,
        full_name: `${provider.first_name} ${provider.last_name}`,
        rating: provider.rating || 0,
        review_count: provider.review_count || 0,
        distance_km: userLocation ?
          ProvidersService.calculateDistance(
            userLocation.lat,
            userLocation.lng,
            provider.lat || 0,
            provider.lng || 0
          ) : undefined,
        categories: provider.category ? [provider.category.name] : [],
        avatar_url: (provider as any).avatar_url
      }))

      transformedProviders = await ProvidersService.enrichWithReviewSummaries(transformedProviders)

      setProviders(transformedProviders)
      setFiltered(transformedProviders)
    } catch (err) {
      console.warn('Error searching, using current providers:', err)
      // En caso de error en búsqueda, mantener los proveedores actuales
      // No mostrar error, solo log en consola
    } finally {
      setLoading(false)
    }
  }

  const handleContact = (provider: ProviderWithDetails) => {
    if (!user) {
      const next = `/proveedores/${provider.id}`
      router.push(`/auth/login?next=${encodeURIComponent(next)}`)
      return
    }
    const primaryCategory = provider.categories?.[0]
    const baseTracking = {
      providerId: provider.id,
      city: provider.city,
      category: primaryCategory,
      userId: user?.id ?? undefined,
    }
    if (provider.whatsapp_e164) {
      void InsightsService.trackContactClick({
        ...baseTracking,
        channel: 'whatsapp',
      })
      const message = encodeURIComponent("Hola! Te contacto desde https://miservicio.ar. Vi tu perfil y me interesa tu servicio, quería hacerte una consulta rápida.")
      window.open(`https://wa.me/${provider.whatsapp_e164}?text=${message}`, "_blank")
    } else if (provider.phone_e164) {
      void InsightsService.trackContactClick({
        ...baseTracking,
        channel: 'phone',
      })
      window.open(`tel:${provider.phone_e164}`, "_blank")
    } else if (provider.contact_email) {
      void InsightsService.trackContactClick({
        ...baseTracking,
        channel: 'form',
      })
      window.open(`mailto:${provider.contact_email}`, "_blank")
    } else {
      // Si no hay datos de contacto, redirigir al perfil donde pueden ver más información
      router.push(`/proveedores/${provider.id}`)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Algo salió mal</h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }



  const isFilteredView = query.trim().length > 0 || !!activeCategory

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 sm:pb-0 font-sans home-bg-vignette">
      <Header city={city} />

      <ActiveMarketplaceHero city={city} isProvider={!!isProvider} />

      <HowItWorks />

      <RecentOrdersFeed city={city} />

      <main className="flex-1 py-12 px-4 space-y-20">
        {/* Prominent Search Bar */}
        <section className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-[#0e315d]">¿Qué necesitás hoy?</h2>
            <p className="text-slate-500 font-medium text-lg">Buscá entre más de {stats.total_providers} profesionales recomendados.</p>
          </div>
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-primary/20 rounded-[32px] blur-2xl group-hover:bg-primary/30 transition-all -z-10" />
            <div className="relative flex items-center bg-white border-2 border-slate-100 rounded-[32px] p-2 shadow-2xl focus-within:border-primary transition-all">
              <Search className="w-6 h-6 text-slate-400 ml-4" />
              <input
                type="text"
                placeholder="Ej: Plomero, Gasista, Electricista..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-lg px-4 py-3 placeholder:text-slate-300 font-medium"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                className="rounded-2xl px-8 h-12 bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg"
              >
                Buscar
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Grid - Compact and elegant */}
        <section className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-[#0e315d]">Categorías populares</h2>
            <Link href="/pedidos/nuevo" className="text-primary font-bold hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES_WITH_ICONS.map((cat, idx) => {
              return (
                <Link key={cat.name} href={`/categorias/${cat.slug}`} className="h-full">
                  <motion.div
                    className="group relative flex flex-col items-center gap-3 p-6 bg-white border border-slate-200 rounded-[32px] hover:border-primary/30 transition-all text-center cursor-pointer h-full premium-shadow-sm hover:premium-shadow-lg"
                    whileHover={{ y: -8 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-[#0e315d] group-hover:bg-[#ff7b00]/10 group-hover:text-[#ff7b00] transition-all duration-300 border border-slate-100 group-hover:border-[#ff7b00]/20">
                      <cat.icon className="w-8 h-8 stroke-[2.5px]" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-black text-[#0e315d] text-base group-hover:text-primary transition-colors">{cat.name}</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat.count}</p>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-slate-200 rounded-full group-hover:bg-[#ff7b00] transition-colors" />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Conditional role-based section */}
        <section className="max-w-7xl mx-auto">
          {isProvider ? (
            <div className="bg-[#0e315d] rounded-[40px] p-8 md:p-12 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-lg text-center md:text-left">
                  <span className="inline-block px-4 py-1.5 bg-primary/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Panel del Profesional</span>
                  <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                    Hay <span className="text-secondary">12 nuevos pedidos</span> esperando tu presupuesto.
                  </h2>
                  <p className="text-white/70 text-lg mb-8">
                    No pierdas tiempo, los clientes están activos ahora mismo en {city.split(',')[0]}.
                  </p>
                  <Link href="/pedidos">
                    <Button className="h-16 px-10 rounded-2xl bg-white text-[#0e315d] font-black text-lg hover:bg-white/90">
                      Ver Tablero de Pedidos
                    </Button>
                  </Link>
                </div>
                <div className="w-full md:w-auto grid grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
                    <p className="text-4xl font-black text-primary mb-1">3</p>
                    <p className="text-xs font-bold text-white/50 uppercase">Activas</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
                    <p className="text-4xl font-black text-secondary mb-1">12</p>
                    <p className="text-xs font-bold text-white/50 uppercase">Nuevas</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#0e315d] to-[#0d519b] rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <h2 className="text-3xl md:text-5xl font-black leading-tight">¿Sos profesional y buscás trabajo?</h2>
                  <p className="text-xl text-white/80">Unite a la red más grande de San Rafael y empezá a recibir pedidos hoy mismo.</p>
                  <div className="pt-4">
                    <Link href="/auth/register?provider=1">
                      <Button className="h-16 px-10 rounded-2xl bg-white text-[#0e315d] font-black text-lg hover:bg-white/90 shadow-xl">
                        Crear perfil profesional
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-white/10 backdrop-blur-lg p-8 rounded-[32px] border border-white/20 w-full md:w-auto">
                  <div className="space-y-4">
                    {[
                      { icon: CheckCircle2, text: "Sin comisiones por trabajo" },
                      { icon: CheckCircle2, text: "Contacto directo con el cliente" },
                      { icon: CheckCircle2, text: "Gestión fácil de pedidos" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <item.icon className="w-6 h-6 text-secondary" />
                        <span className="font-bold">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <TrustSection />
      </main>

      {/* Existing Providers search list - HIDDEN FOR CLIENTS to avoid cannibalization */}
      {isProvider && (
        <section id="providers-section" className="max-w-7xl mx-auto pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-[#0e315d]">Explorar Profesionales</h2>
              <p className="text-[#0d519b]/60 font-medium">Buscá y contactá directamente a los mejores calificados</p>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Ej: Gasista matriculado..."
                className="pl-12 h-14 rounded-2xl border-border/40 focus:ring-primary/20"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <ProvidersList
            providers={filtered}
            loading={loading}
            onContact={handleContact}
            onSearchCityWide={handleSearchCityWide}
            onViewCategories={handleViewCategories}
          />
        </section>
      )}

      <footer className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-16">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="inline-block mb-6">
                <span className="text-2xl font-black text-primary tracking-tighter">miservicio.ar</span>
              </Link>
              <p className="text-[#0d519b]/70 text-lg max-w-sm font-medium">
                La forma más rápida y segura de encontrar profesionales de confianza para tu hogar.
              </p>
            </div>
            <div>
              <h4 className="font-black text-[#0e315d] mb-6 uppercase tracking-widest text-xs">Páginas</h4>
              <ul className="space-y-4 font-bold text-[#0d519b]/60">
                <li><Link href="/pedidos/nuevo" className="hover:text-primary transition-colors">Publicar Pedido</Link></li>
                <li><Link href="/sobre" className="hover:text-primary transition-colors">Sobre nosotros</Link></li>
                <li><Link href="/legal/terminos" className="hover:text-primary transition-colors">Términos</Link></li>
                <li><Link href="/legal/privacidad" className="hover:text-primary transition-colors">Privacidad</Link></li>
              </ul>
            </div>
            <div className="flex flex-col items-center md:items-end justify-between">
              <div className="flex gap-4 mb-8">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/miservicio.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-[#0e315d] hover:bg-primary hover:text-white transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.412.56.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.013 3.584-.07 4.85c-.054 1.17-.249 1.805-.413 2.227-.217.56-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.057.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.013-4.85-.07c-1.17-.054-1.805-.249-2.227-.413-.56-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.36-1.057-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.013-3.584.07-4.85c.054-1.17.249-1.805.413-2.227.217-.56.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057-.36 2.227-.413 1.266-.057 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.28.058-2.153.264-2.918.56-.791.307-1.462.716-2.132 1.386-.67.67-1.079 1.341-1.386 2.132-.296.765-.502 1.638-.56 2.918-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.058 1.28.264 2.153.56 2.918.307.791.716 1.462 1.386 2.132.67.67 1.341 1.079 2.132 1.386.765.296 1.638.502 2.918.56 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.28-.058 2.153-.264 2.918-.56.791-.307 1.462-.716 2.132-1.386.67-.67 1.079-1.341 1.386-2.132.296-.765.502-1.638.56-2.918.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.058-1.28-.264-2.153-.56-2.918-.307-.791-.716-1.462-1.386-2.132-.67-.67-1.341-1.079-2.132-1.386-.765-.296-1.638-.502-2.918-.56-1.28-.058-1.688-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                {/* WhatsApp */}
                <a
                  href="https://wa.me/542604275924"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-[#0e315d] hover:bg-primary hover:text-white transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.433 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.892a11.826 11.826 0 00-3.481-8.414z" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/company/miservicio-app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-[#0e315d] hover:bg-primary hover:text-white transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>

              <FeedbackButton />
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <p className="text-[#0d519b]/40 font-bold text-sm">© 2025 miservicio.ar</p>
            <div className="flex items-center gap-2 text-[#0d519b]/60 font-bold text-xs uppercase tracking-widest">
              <MapPin className="w-4 h-4" /> San Rafael, Mendoza
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
