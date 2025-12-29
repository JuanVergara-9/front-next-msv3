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
      initial={{ opacity: 1 }}
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
          <div
            key={`${provider.id}-${index}`}
            className="flex-shrink-0"
          >
            <ProviderCarouselCard provider={provider} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ... imports
import { Skeleton } from "@/components/ui/skeleton"

// ... ProviderCarousel component ...

// Mapeo de iconos por slug de categoría (same as before)
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

interface CategoriesSectionProps {
  initialCategories?: Category[]
  initialProviders?: ProviderWithDetails[]
}

export function CategoriesSection({ initialCategories = [], initialProviders = [] }: CategoriesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  // Inicializar estado con props o arrays vacíos
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [providers, setProviders] = useState<ProviderWithDetails[]>(initialProviders)
  // Si tenemos datos iniciales, no estamos cargando (para la UI bloqueante)
  const [loading, setLoading] = useState(initialCategories.length === 0)
  const [error, setError] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Control de carga de proveedores
  const [providersLoading, setProvidersLoading] = useState(initialProviders.length === 0)

  // Estado de ciudad para el Header
  const [city, setCity] = useState<string>("Argentina")

  useEffect(() => {
    // Si no hay categorías iniciales, cargarlas
    if (initialCategories.length === 0) {
      loadCategories()
    }
  }, []) // Solo al montar

  useEffect(() => {
    // La carga de proveedores compleja (con ubicación) se puede hacer en cliente
    // Pero si ya tenemos initialProviders, podemos mostrarlos mientras
    // refina la búsqueda por ubicación.
    // Si initialProviders está vacío, cargamos.
    if (initialProviders.length === 0) {
      loadProviders()
    } else {
      // Opcional: intentar mejorar la lista con ubicación real si no se hizo en SSR
      // Por ahora confiamos en el SSR o carga diferida
      setProvidersLoading(false)
    }
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const categoriesData = await ProvidersService.getCategories()
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
      setProvidersLoading(true)
      let location: { lat: number; lng: number } | null = null

      // 1) Check localStorage cache first (shared with HomeClient)
      const LOCATION_CACHE_KEY = 'miservicio_user_location'
      const CITY_CACHE_KEY = 'miservicio_user_city'

      try {
        const cachedLocation = localStorage.getItem(LOCATION_CACHE_KEY)
        const cachedCity = localStorage.getItem(CITY_CACHE_KEY)

        if (cachedLocation) {
          location = JSON.parse(cachedLocation)
          console.log('[CategoriesSection] Using cached location:', location)
        }
        if (cachedCity) {
          setCity(cachedCity)
        }
      } catch (e) {
        console.warn('Could not read cached location:', e)
      }

      // 2) If no cache, try to get fresh location
      if (!location) {
        try {
          location = await ProvidersService.getCurrentLocation()
          // Save to cache for other components
          localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location))

          // Also get city name
          const cityName = await ProvidersService.getCityFromCoords(location.lat, location.lng).catch(() => 'Mi ubicación')
          localStorage.setItem(CITY_CACHE_KEY, cityName)
          setCity(cityName)

          console.log('[CategoriesSection] Got fresh location:', location, cityName)
        } catch (locationError) {
          console.warn('Could not get location:', locationError)
        }
      }

      // 3. Intentar con ubicación si existe
      let searchParams: any = { limit: 20 }
      if (location) {
        searchParams.lat = location.lat
        searchParams.lng = location.lng
        searchParams.radius_km = 200
      }

      let response = await ProvidersService.searchProviders(searchParams)
      let providersData = Array.isArray(response.providers) ? response.providers : []

      // 4. Fallback si no hay location o no hay resultados
      if (providersData.length === 0 && location) {
        searchParams = { limit: 20 }
        response = await ProvidersService.searchProviders(searchParams)
        providersData = Array.isArray(response.providers) ? response.providers : []
        location = null
      }

      // 3. Enriquecer
      let enrichedProviders = providersData
      if (providersData.length > 0) {
        try {
          enrichedProviders = await ProvidersService.enrichWithReviewSummaries(providersData)
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
          // ... same logic as before ...
          const cats: string[] = []
          if (provider.category?.name) cats.push(provider.category.name)
          if (Array.isArray((provider as any).categories)) {
            (provider as any).categories.forEach((cat: any) => {
              const catName = typeof cat === 'string' ? cat : cat?.name
              if (catName && !cats.includes(catName)) cats.push(catName)
            })
          }
          return cats
        })(),
        avatar_url: (provider as any).avatar_url,
      }))

      const shuffledProviders = [...transformedProviders].sort(() => Math.random() - 0.5)
      setProviders(shuffledProviders)
    } catch (err) {
      console.error('Error loading providers:', err)
      // Si falla, no sobrescribir si ya teníamos datos
      // setProviders([]) 
    } finally {
      setProvidersLoading(false)
    }
  }

  // Handle scroll logic ... (same checkScrollPosition, scrollLeft, scrollRight, useEffects)
  const checkScrollPosition = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    const isAtStart = scrollLeft <= 0
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1
    setCanScrollLeft(!isAtStart)
    setCanScrollRight(!isAtEnd)
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" })
      setTimeout(checkScrollPosition, 300)
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" })
      setTimeout(checkScrollPosition, 300)
    }
  }

  useEffect(() => {
    if (!scrollRef.current || categories.length === 0) return
    const timeoutId = setTimeout(checkScrollPosition, 100)
    const handleScroll = () => checkScrollPosition()
    scrollRef.current.addEventListener('scroll', handleScroll)
    const handleResize = () => setTimeout(checkScrollPosition, 100)
    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(timeoutId)
      if (scrollRef.current) scrollRef.current.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [categories])

  const handleCategoryClick = (category: Category) => {
    router.push(`/categorias/${category.slug}`)
  }

  const getIconComponent = (slug: string) => {
    return iconMap[slug] || iconMap['default']
  }

  // Skeleton Loading State
  if (loading) {
    return (
      <motion.section
        className="py-12 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-12 space-y-4">
            <Skeleton className="h-12 w-3/4 max-w-lg mx-auto rounded-xl" />
            <Skeleton className="h-6 w-1/2 max-w-md mx-auto rounded-lg" />
          </div>

          {/* Carousel Skeleton */}
          <div className="flex gap-6 overflow-hidden pb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-72 flex-shrink-0">
                <Skeleton className="h-80 w-full rounded-2xl" />
              </div>
            ))}
          </div>

          {/* Categories Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </motion.section>
    )
  }

  if (error) {
    // ... existing error state
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadCategories} variant="outline">Reintentar</Button>
        </div>
      </section>
    )
  }

  return (
    <section
      className="py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className="text-center mb-12"
        >
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 text-balance cascade-in cascade-delay-1"
          >
            ¿Qué necesitás hoy?
          </h1>
          <p
            className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto text-balance cascade-in cascade-delay-2"
          >
            Elegí un oficio y encontrá profesionales cerca de tu zona
          </p>
        </div>

        {/* Providers Carousel - Infinite Scroll */}
        <AnimatePresence mode="wait">
          {providersLoading && providers.length === 0 ? (
            // Skeleton for providers carousel
            <div className="mb-12 flex gap-4 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-80 flex-shrink-0">
                  <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
              ))}
            </div>
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
        <div className="mb-8 cascade-in cascade-delay-3">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700">Filtros rápidos:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickCategories.map((category, index) => (
                <div key={category}>
                  <Badge
                    variant="secondary"
                    className="whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-[#007bff] hover:text-white transition-colors cursor-pointer border-0"
                  >
                    {category}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Categories Carousel */}
        <AnimatePresence mode="wait">
          {categories.length > 0 ? (
            <div
              className="relative mb-12"
            >
              {/* Left Arrow */}
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

              {/* Right Arrow */}
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
                    <div
                      key={category.id}
                      className={`flex-shrink-0 cascade-in`}
                      style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                    >
                      <Card
                        onClick={() => handleCategoryClick(category)}
                        className="group w-72 snap-center p-6 bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-[#007bff]/20 h-full flex flex-col"
                      >
                        {/* Icon */}
                        <div
                          className="flex justify-center mb-4"
                        >
                          <div className="w-16 h-16 rounded-full bg-[#007bff]/10 flex items-center justify-center group-hover:bg-[#007bff]/20 group-hover:scale-110 transition-all duration-200 flex-shrink-0">
                            <IconComponent className="h-8 w-8 text-[#007bff] stroke-2" />
                          </div>
                        </div>

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
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-gray-500 text-lg">No hay categorías disponibles</p>
              <Button onClick={() => loadCategories()} variant="outline" className="mt-4">
                Reintentar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View All Button */}
        <div
          className="text-center"
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
        </div>
      </div>
    </section>
  )
}
