"use client"

import { Star, MapPin } from "lucide-react"
import type { ProviderWithDetails } from "@/types/api"

export function ProviderCard({ provider, onContact }: { provider: ProviderWithDetails; onContact?: (p: ProviderWithDetails) => void }) {
  const displayName = provider.full_name || [provider.first_name, provider.last_name].filter(Boolean).join(' ')
  const avatar = (provider as any).avatar_url || "/placeholder.svg"

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
          <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
            {displayName}
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

      {onContact && (
        <button
          onClick={() => onContact(provider)}
          className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-2xl hover:shadow-lg transition-all duration-200 font-semibold premium-shadow"
        >
          Contactar ahora
        </button>
      )}
    </div>
  )
}


