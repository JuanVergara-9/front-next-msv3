"use client"

import { Star, MapPin, Eye, BadgeCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ProviderWithDetails } from "@/types/api"

export function ProviderCard({ provider, onContact }: { provider: ProviderWithDetails; onContact?: (p: ProviderWithDetails) => void }) {
  const router = useRouter()
  const displayName = provider.full_name || [provider.first_name, provider.last_name].filter(Boolean).join(' ')
  const avatar = (provider as any).avatar_url || "/placeholder.svg"

  const handleViewProfile = () => {
    router.push(`/proveedores/${provider.id}`)
  }

  return (
    <div className="bg-card rounded-3xl p-6 premium-shadow border border-border/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
      <div className="flex gap-4 mb-4">
        <div className="relative">
          <img
            src={avatar}
            alt={displayName}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/10"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-2">
            {displayName}
            {(provider as any).is_licensed && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-green-300 text-green-700 bg-green-50 shrink-0">
                <BadgeCheck className="h-3 w-3" /> Matriculado
              </span>
            )}
          </h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-yellow-700">{(provider as any).rating?.toFixed ? (provider as any).rating.toFixed(1) : ((provider as any).rating || 4.8)}</span>
            </div>
            {(provider as any).distance_km != null && (
              <>
                <span>•</span>
                <span>{Number((provider as any).distance_km).toFixed(1)} km</span>
              </>
            )}
            {provider.city && (
              <>
                <span>•</span>
                <span className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" />{provider.city}</span>
              </>
            )}
          </div>
          {provider.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{provider.description}</p>
          )}
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
          className="flex-1 py-3 bg-white border border-primary text-primary rounded-2xl hover:bg-primary/10 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Ver perfil
        </button>
        {onContact && (
          <button
            onClick={() => onContact(provider)}
            className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-2xl hover:shadow-lg transition-all duration-200 font-semibold premium-shadow"
          >
            Contactar
          </button>
        )}
      </div>
    </div>
  )
}


