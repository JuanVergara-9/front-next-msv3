"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Star, MapPin, MessageCircle, SlidersHorizontal, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProvidersService } from "@/lib/services/providers.service"
import type { Category, ProviderWithDetails } from "@/types/api"
import { useAuth } from "@/contexts/AuthContext"
import { ProviderCard } from "@/components/ProviderCard"

export default function ProvidersByCategoryPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [providers, setProviders] = useState<ProviderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeCategory = useMemo(() => {
    const slug = (params?.slug || "").toString()
    return categories.find(c => c.slug === slug) || null
  }, [params?.slug, categories])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const cats = await ProvidersService.getCategories()
        setCategories(Array.isArray(cats) ? cats : [])

        const slug = (params?.slug || "").toString()
        const cat = cats.find(c => c.slug === slug)
        if (!cat) {
          setError("Categoría no encontrada")
          setProviders([])
          return
        }

        const res = await ProvidersService.searchProviders({ category_slug: slug, limit: 24, offset: 0 })
        const raw = Array.isArray((res as any)?.providers) ? (res as any).providers : []
        // Normalizar: asegurar categories como string[] y full_name presente
        const normalized = raw.map((p: any) => {
          const categoryNames = Array.isArray(p?.categories)
            ? p.categories.map((c: any) => typeof c === 'string' ? c : (c?.name || '')).filter(Boolean)
            : (p?.category && p.category.name ? [p.category.name] : [])
          return {
            ...p,
            full_name: p.full_name || [p.first_name, p.last_name].filter(Boolean).join(' '),
            categories: categoryNames,
          }
        })
        setProviders(normalized)
      } catch (e: any) {
        console.error(e)
        setError("No se pudieron cargar los proveedores")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [params?.slug])

  const title = activeCategory ? `${activeCategory.name} en tu zona` : "Profesionales"
  const totalText = providers?.length ? `${providers.length} profesionales disponibles` : undefined

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="glass-effect border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-balance">{title}</h1>
                {totalText && <p className="text-muted-foreground">{totalText}</p>}
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center text-gray-600">Cargando...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : providers.length === 0 ? (
          <div className="text-center text-gray-600">No hay proveedores disponibles en esta categoría.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p as any} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="px-8 bg-transparent" onClick={() => router.refresh()}>
            Recargar
          </Button>
        </div>
      </div>
    </div>
  )
}


