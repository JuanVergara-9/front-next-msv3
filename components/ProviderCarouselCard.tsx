"use client"

import { type KeyboardEvent } from "react"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ProviderWithDetails } from "@/types/api"
import { motion } from "framer-motion"

interface ProviderCarouselCardProps {
  provider: ProviderWithDetails
}

export function ProviderCarouselCard({ provider }: ProviderCarouselCardProps) {
  const router = useRouter()
  const displayName =
    provider.full_name?.trim() ||
    [provider.first_name, provider.last_name].filter(Boolean).join(" ") ||
    "Profesional verificado"
  const avatar = (provider as any).avatar_url || "/placeholder.svg"
  // Obtener todas las categorías disponibles (combinar categoría principal y many-to-many)
  const allCategories = (() => {
    const cats: string[] = []
    // Agregar categoría principal si existe
    if (provider.category?.name) {
      cats.push(provider.category.name)
    }
    // Agregar categorías many-to-many si existen
    if (Array.isArray(provider.categories) && provider.categories.length > 0) {
      provider.categories.forEach((cat: any) => {
        const catName = typeof cat === 'string' ? cat : cat?.name
        if (catName && !cats.includes(catName)) {
          cats.push(catName)
        }
      })
    }
    return cats
  })()
  
  const primaryCategory = allCategories[0] || "Servicio"
  const rating = Number((provider as any).rating) || 0
  const reviewCount = Number((provider as any).review_count) || 0
  const hasRating = rating > 0
  const city = provider.city || provider.province || "Disponible en tu zona"

  // Mostrar hasta 2 badges visibles, el resto se muestra como "y N+"
  const visibleBadges = allCategories.slice(0, 2)
  const hiddenCount = Math.max(allCategories.length - visibleBadges.length, 0)

  const handleClick = () => {
    if (provider.id) {
      router.push(`/proveedores/${provider.id}`)
    }
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyPress}
      className="flex-shrink-0 w-56 bg-white rounded-3xl overflow-hidden shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
    >
      <motion.div 
        className="w-full h-44 bg-gray-200 relative overflow-hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <img
          src={avatar}
          alt={displayName}
          className="w-full h-full object-cover"
          draggable={false}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg"
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        <p className="absolute bottom-3 left-4 right-4 text-white text-sm font-semibold drop-shadow-sm truncate">
          {displayName}
        </p>
      </motion.div>

      <div className="bg-white px-4 pt-4 pb-5 flex flex-col h-[140px]">
        <p className="text-xs text-gray-500 uppercase tracking-wide truncate mb-3">{city}</p>

        {/* Badges de categorías - altura fija para mantener consistencia */}
        <div className="min-h-[32px] flex flex-wrap items-center gap-1.5 mb-3">
          {allCategories.length > 0 ? (
            <>
              {visibleBadges.map((badge) => (
              <span
                key={badge}
                className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium leading-none whitespace-nowrap max-w-[180px] truncate"
                title={badge}
              >
                  {badge}
                </span>
              ))}
              {hiddenCount > 0 && (
                <span className="text-xs text-gray-500 font-medium">y {hiddenCount}+</span>
              )}
            </>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium leading-none whitespace-nowrap opacity-0">
              placeholder
            </span>
          )}
        </div>

        {/* Rating - siempre al final */}
        <div className="flex items-center gap-2 mt-auto">
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              hasRating ? "bg-yellow-50 text-yellow-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            <Star className={`h-4 w-4 ${hasRating ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`} />
            <span className="font-semibold text-sm">{hasRating ? rating.toFixed(1) : "0.0"}</span>
          </div>
          <span className="text-sm text-gray-400">
            {reviewCount > 0 ? `(${reviewCount})` : "Sin reseñas"}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

