"use client"

import { useRef, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, Flame, Zap, Settings, ChevronRight, ChevronLeft, Loader2, Leaf, Droplets } from "lucide-react"
import { ProvidersService } from "@/lib/services/providers.service"
import { Category } from "@/types/api"
import { useRouter } from "next/navigation"

// Mapeo de iconos por slug de categoría
const iconMap: Record<string, any> = {
  'plomeria': Wrench,
  'gasistas': Flame,
  'electricidad': Zap,
  'jardineria': Leaf,
  'mantenimiento-limpieza-piletas': Droplets,
  'reparacion-electrodomesticos': Settings,
  'default': Settings
}

const quickCategories = ["Urgente", "Más solicitados", "Mejor valorados", "Cerca de ti"]

export function CategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    console.log('Categories state updated:', categories.length, categories)
  }, [categories])

  const loadCategories = async () => {
    try {
      setLoading(true)
      console.log('Loading categories...')
      const categoriesData = await ProvidersService.getCategories()
      console.log('Categories loaded:', categoriesData)
      setCategories(categoriesData)
    } catch (err) {
      console.error('Error loading categories:', err)
      setError('Error al cargar las categorías')
    } finally {
      setLoading(false)
    }
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" })
    }
  }

  const handleCategoryClick = (category: Category) => {
    router.push(`/categorias/${category.slug}`)
  }

  const getIconComponent = (slug: string) => {
    return iconMap[slug] || iconMap['default']
  }

  if (loading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando categorías...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadCategories} variant="outline">
              Reintentar
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 text-balance">
            ¿Qué necesitás hoy?
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto text-balance">
            Elegí un oficio y encontrá profesionales cerca de tu zona
          </p>
        </div>

        {/* Quick Filters */}
        <div className="mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700">Filtros rápidos:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-[#007bff] hover:text-white transition-colors cursor-pointer border-0"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </Card>
        </div>

        {/* Categories Carousel */}
        {categories.length > 0 ? (
          <div className="relative mb-12">
            {/* Left Arrow */}
            <Button
              variant="outline"
              size="sm"
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 p-0 rounded-full border-gray-200 hover:border-[#007bff] hover:bg-[#007bff] hover:text-white transition-all bg-white shadow-lg -translate-x-6"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Right Arrow */}
            <Button
              variant="outline"
              size="sm"
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 p-0 rounded-full border-gray-200 hover:border-[#007bff] hover:bg-[#007bff] hover:text-white transition-all bg-white shadow-lg translate-x-6"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Carousel Container */}
            <div ref={scrollRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-8">
              {categories.map((category) => {
                const IconComponent = getIconComponent(category.slug)
                return (
                  <Card
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="group flex-shrink-0 w-72 snap-center p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:ring-2 hover:ring-[#007bff]/20"
                  >
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-[#007bff]/10 flex items-center justify-center group-hover:bg-[#007bff]/20 transition-colors">
                        <IconComponent className="h-8 w-8 text-[#007bff] stroke-2" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center space-y-3">
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight">{category.name}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Profesionales verificados cerca de tu zona
                      </p>

                      {/* CTA */}
                      <div className="pt-2">
                        <div className="inline-flex items-center gap-1 text-[#007bff] font-medium text-sm group-hover:gap-2 transition-all">
                          Ver {category.name.toLowerCase()}
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay categorías disponibles</p>
            <Button 
              onClick={loadCategories} 
              variant="outline" 
              className="mt-4"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => router.push('/categorias')}
            className="bg-[#007bff] hover:bg-[#0056b3] text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            Ver todos los rubros
          </Button>
        </div>
      </div>
    </section>
  )
}
