"use client"

import { Star, MapPin, Eye, BadgeCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ProviderWithDetails } from "@/types/api"
import { normalizeFullName, normalizeCity } from "@/lib/utils"

export function ProviderCard({ provider, onContact }: { provider: ProviderWithDetails; onContact?: (p: ProviderWithDetails) => void }) {
  const router = useRouter()
  const displayName = normalizeFullName(
    provider.full_name,
    provider.first_name,
    provider.last_name
  )
  const normalizedCity = normalizeCity(provider.city)
  const avatar = (provider as any).avatar_url || "/placeholder.svg"

  const handleViewProfile = () => {
    router.push(`/proveedores/${provider.id}`)
  }

  const handleContactClick = () => {
    if (onContact) {
      onContact(provider)
    } else {
      // Si no hay función onContact, redirigir al perfil
      router.push(`/proveedores/${provider.id}`)
    }
  }

  return (
    <div className="bg-card rounded-3xl p-6 premium-shadow border border-border/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group flex flex-col h-full">
      <div className="flex gap-4 mb-4 flex-1">
        <div className="relative">
          <img
            src={avatar}
            alt={displayName}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/10"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="mb-1.5 min-h-[1.75rem] flex flex-col justify-start">
            <div className="flex items-start gap-2 flex-wrap">
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors break-words leading-tight flex-1 min-w-0">
                {displayName}
              </h3>
              {(provider as any).is_licensed && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-green-300 text-green-700 bg-green-50 shrink-0 mt-0.5">
                  <BadgeCheck className="h-3 w-3" /> Matriculado
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
            {((provider as any).rating > 0) ? (
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-yellow-700">{Number((provider as any).rating).toFixed(1)}</span>
                {((provider as any).review_count > 0) && (
                  <span className="text-xs text-yellow-600">({(provider as any).review_count})</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                <Star className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">(0)</span>
              </div>
            )}
            {((provider as any).distance_km != null || normalizedCity) && (
              <div className="flex items-center gap-1">
                {normalizedCity && <MapPin className="h-3 w-3" />}
                <span className="font-medium">
                  {[
                    (provider as any).distance_km != null && `${Number((provider as any).distance_km).toFixed(1)} km`,
                    normalizedCity
                  ].filter(Boolean).join(' • ')}
                </span>
              </div>
            )}
          </div>
          <div className="min-h-[2.5rem]">
            {provider.description ? (
              <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{provider.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground line-clamp-2 text-pretty opacity-0 pointer-events-none">&#8203;</p>
            )}
          </div>
        </div>
      </div>

      {provider.categories?.length ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {provider.categories.map((category) => (
            <span key={category} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium border border-primary/20">
              {category}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex gap-3">
        <button
          onClick={handleViewProfile}
          className="flex-1 py-3 bg-white border border-primary text-primary rounded-2xl hover:bg-primary/10 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-200 ease-out font-semibold flex items-center justify-center gap-2 cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          Ver perfil
        </button>
          <button
          onClick={handleContactClick}
          className="group/contact relative flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-2xl font-semibold premium-shadow cursor-pointer hover:shadow-2xl hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-200 ease-out overflow-hidden"
          >
          <span className="relative z-10">Contactar</span>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover/contact:opacity-100 transition-opacity duration-200"></div>
          </button>
      </div>
    </div>
  )
}


