"use client"

import { useRef, useEffect, useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, Flame, Zap, Settings, ChevronRight, ChevronLeft, Loader2, Leaf, Droplets, Hammer, Paintbrush } from "lucide-react"
import { ProvidersService } from "@/lib/services/providers.service"
import { Category, ProviderWithDetails } from "@/types/api"
import { useRouter } from "next/navigation"
import { ProviderCarouselCard } from "./ProviderCarouselCard"
import { motion, AnimatePresence } from "framer-motion"


// Componente de carrusel con scroll nativo, movimiento automático continuo y efecto infinito
function ProviderCarousel({ providers }: { providers: ProviderWithDetails[] }) {
  const [isPaused, setIsPaused] = useState(false)

  if (providers.length === 0) {
    return null
  }

  // Asegurar que haya suficientes proveedores para cubrir el ancho del carrusel
  const baseProviders: ProviderWithDetails[] = []
  while (baseProviders.length < Math.max(providers.length, 3)) {
    baseProviders.push(...providers)
  }
  const normalizedProviders = baseProviders.slice(0, Math.max(providers.length, 3))

  // Duplicar dos veces para lograr efecto infinito continuo
  const loopProviders = useMemo(
    () => [...normalizedProviders, ...normalizedProviders],
    [normalizedProviders]
  )

  const durationSeconds = Math.max(normalizedProviders.length * 8, 30)

  return (
    <motion.div 
      className="mb-12 relative overflow-x-hidden infinite-scroll-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="flex gap-6 provider-marquee px-4 -mx-4 py-2 pb-6"
        style={{
          animationDuration: `${durationSeconds}s`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setTimeout(() => setIsPaused(false), 800)}
      >
        {loopProviders.map((provider, index) => (
          <motion.div 
            key={`${provider.id}-${index}`} 
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.3, 
              delay: (index % normalizedProviders.length) * 0.05 
            }}
          >
            <ProviderCarouselCard provider={provider} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Mapeo de iconos por slug de categoría
const iconMap: Record<string, any> = {
  'plomeria': Wrench,
  'gasistas': Flame,
  'electricidad': Zap,
  'jardineria': Leaf,
  'mantenimiento-limpieza-piletas': Droplets,
  'reparacion-electrodomesticos': Settings,
  'carpinteria': Hammer,
  'pintura': Paintbrush,
  'default': Settings
}

const quickCategories = ["Urgente", "Más solicitados", "Mejor valorados", "Cerca de ti"]

export function CategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [providers, setProviders] = useState<ProviderWithDetails[]>([])
  const [providersLoaded, setProvidersLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    loadCategories()
    loadProviders()
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

  const loadProviders = async () => {
    try {
      let location: { lat: number; lng: number } | null = null

      try {
        location = await ProvidersService.getCurrentLocation()
        console.log('Location obtained:', location)
      } catch (locationError) {
        console.warn('Could not get location:', locationError)
      }

      // Primero intentar con ubicación si está disponible
      let searchParams: any = { limit: 20 }
      if (location) {
        searchParams.lat = location.lat
        searchParams.lng = location.lng
        searchParams.radius_km = 50
      }

      console.log('Searching providers with params:', searchParams)
      let response = await ProvidersService.searchProviders(searchParams)
      let providersData = Array.isArray(response.providers) ? response.providers : []
      console.log('Providers found with location:', providersData.length)

      // Si no hay resultados con ubicación, intentar sin restricciones de ubicación
      if (providersData.length === 0 && location) {
        console.log('No providers found with location, trying without location restrictions')
        searchParams = { limit: 20 }
        response = await ProvidersService.searchProviders(searchParams)
        providersData = Array.isArray(response.providers) ? response.providers : []
        console.log('Providers found without location:', providersData.length)
        location = null // Reset location para no calcular distancias
      }

      let enrichedProviders = providersData
      if (providersData.length > 0) {
        try {
          enrichedProviders = await ProvidersService.enrichWithReviewSummaries(providersData)
          console.log('Providers enriched with reviews:', enrichedProviders.length)
        } catch (summaryError) {
          console.warn('Could not enrich providers with review summaries:', summaryError)
        }
      }

      const transformedProviders = enrichedProviders.map((provider) => ({
        ...provider,
        full_name: `${provider.first_name ?? ''} ${provider.last_name ?? ''}`.trim(),
        rating: Number((provider as any).rating) || 0,
        review_count: Number((provider as any).review_count) || 0,
        distance_km:
          location && provider.lat && provider.lng
            ? ProvidersService.calculateDistance(
                location.lat,
                location.lng,
                Number(provider.lat),
                Number(provider.lng)
              )
            : undefined,
        categories: (() => {
          const cats: string[] = []
          // Agregar categoría principal si existe
          if (provider.category?.name) {
            cats.push(provider.category.name)
          }
          // Agregar categorías many-to-many si existen
          if (Array.isArray((provider as any).categories)) {
            (provider as any).categories.forEach((cat: any) => {
              const catName = typeof cat === 'string' ? cat : cat?.name
              if (catName && !cats.includes(catName)) {
                cats.push(catName)
              }
            })
          }
          return cats
        })(),
        avatar_url: (provider as any).avatar_url,
      }))

      // Randomizar el orden de los proveedores
      const shuffledProviders = [...transformedProviders].sort(() => Math.random() - 0.5)
      
      console.log('Transformed providers:', shuffledProviders.length)
      setProviders(shuffledProviders)
    } catch (err) {
      console.error('Error loading providers:', err)
      setProviders([])
    } finally {
      setProvidersLoaded(true)
    }
  }

  // Función para verificar la posición del scroll
  const checkScrollPosition = () => {
    if (!scrollRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    const isAtStart = scrollLeft <= 0
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1 // -1 para manejar errores de redondeo
    
    setCanScrollLeft(!isAtStart)
    setCanScrollRight(!isAtEnd)
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" })
      // Verificar posición después de un breve delay para que el scroll se complete
      setTimeout(checkScrollPosition, 300)
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" })
      // Verificar posición después de un breve delay para que el scroll se complete
      setTimeout(checkScrollPosition, 300)
    }
  }

  // Verificar posición del scroll cuando cambian las categorías o al hacer scroll
  useEffect(() => {
    if (!scrollRef.current || categories.length === 0) return
    
    // Esperar un momento para que el DOM se actualice completamente
    const timeoutId = setTimeout(() => {
      checkScrollPosition()
    }, 100)
    
    const handleScroll = () => {
      checkScrollPosition()
    }
    
    scrollRef.current.addEventListener('scroll', handleScroll)
    
    // También verificar cuando cambia el tamaño de la ventana
    const handleResize = () => {
      setTimeout(checkScrollPosition, 100)
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      clearTimeout(timeoutId)
      if (scrollRef.current) {
        scrollRef.current.removeEventListener('scroll', handleScroll)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [categories])

  const handleCategoryClick = (category: Category) => {
    router.push(`/categorias/${category.slug}`)
  }

  const getIconComponent = (slug: string) => {
    return iconMap[slug] || iconMap['default']
  }

  if (loading) {
    return (
      <motion.section 
        className="py-12 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-8 w-8 mx-auto mb-4" />
            </motion.div>
            <motion.p 
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Cargando categorías...
            </motion.p>
          </div>
        </div>
      </motion.section>
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
    <motion.section 
      className="py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 text-balance"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            ¿Qué necesitás hoy?
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto text-balance"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Elegí un oficio y encontrá profesionales cerca de tu zona
          </motion.p>
        </motion.div>

        {/* Providers Carousel - Infinite Scroll */}
        <AnimatePresence mode="wait">
        {!providersLoaded ? (
            <motion.div 
              className="mb-12 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-6 w-6 text-gray-400" />
              </motion.div>
            </motion.div>
        ) : providers.length > 0 ? (
            <motion.div
              key="carousel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
          <ProviderCarousel providers={providers} />
            </motion.div>
        ) : (
            <motion.div 
              className="mb-12 text-center text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
            Todavía no hay profesionales destacados disponibles en tu zona.
            </motion.div>
        )}
        </AnimatePresence>

        {/* Quick Filters */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700">Filtros rápidos:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickCategories.map((category, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: 0.5 + index * 0.05 
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                  variant="secondary"
                  className="whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-[#007bff] hover:text-white transition-colors cursor-pointer border-0"
                >
                  {category}
                </Badge>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Categories Carousel */}
        <AnimatePresence mode="wait">
        {categories.length > 0 ? (
            <motion.div 
              className="relative mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
            {/* Left Arrow - Solo visible si puede hacer scroll a la izquierda */}
            <AnimatePresence>
              {canScrollLeft && (
                <motion.div
                  key="left-arrow"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={scrollLeft}
                    className="w-12 h-12 p-0 rounded-full border-gray-200 hover:border-[#007bff] hover:bg-[#007bff] hover:text-white transition-all bg-white shadow-lg -translate-x-6 hover:scale-110 active:scale-95"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right Arrow - Solo visible si puede hacer scroll a la derecha */}
            <AnimatePresence>
              {canScrollRight && (
                <motion.div
                  key="right-arrow"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={scrollRight}
                    className="w-12 h-12 p-0 rounded-full border-gray-200 hover:border-[#007bff] hover:bg-[#007bff] hover:text-white transition-all bg-white shadow-lg translate-x-6 hover:scale-110 active:scale-95"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Carousel Container */}
            <div ref={scrollRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 pt-4 px-8 items-stretch">
                {categories.map((category, index) => {
                const IconComponent = getIconComponent(category.slug)
                return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.8 + index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-shrink-0"
                    >
                  <Card
                    onClick={() => handleCategoryClick(category)}
                    className="group w-72 snap-center p-6 bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-[#007bff]/20 h-full flex flex-col"
                  >
                    {/* Icon */}
                    <motion.div 
                      className="flex justify-center mb-4"
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="w-16 h-16 rounded-full bg-[#007bff]/10 flex items-center justify-center group-hover:bg-[#007bff]/20 transition-colors flex-shrink-0">
                        <IconComponent className="h-8 w-8 text-[#007bff] stroke-2" />
                      </div>
                    </motion.div>

                    {/* Content */}
                    <div className="text-center space-y-3 flex-grow flex flex-col">
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight min-h-[3.5rem] flex items-center justify-center">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed flex-grow flex items-center justify-center">
                        Profesionales verificados cerca de tu zona
                      </p>

                      {/* CTA */}
                      <div className="pt-2 mt-auto">
                        <motion.div 
                          className="inline-flex items-center gap-1 text-[#007bff] font-medium text-sm"
                          whileHover={{ gap: 8 }}
                          transition={{ duration: 0.2 }}
                        >
                          Ver {category.name.toLowerCase()}
                          <ChevronRight className="h-4 w-4" />
                        </motion.div>
                      </div>
                    </div>
                  </Card>
                    </motion.div>
                )
              })}
            </div>
            </motion.div>
        ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
            <p className="text-gray-500 text-lg">No hay categorías disponibles</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
            <Button 
              onClick={loadCategories} 
              variant="outline" 
              className="mt-4"
            >
              Reintentar
            </Button>
              </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

        {/* View All Button */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
          <Button
            size="lg"
            onClick={() => router.push('/categorias')}
            className="bg-[#007bff] hover:bg-[#0056b3] text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            Ver todos los rubros
          </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}
