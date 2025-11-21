import { apiFetch } from '../apiClient'

type ContactChannel = 'whatsapp' | 'phone' | 'form'

type TrackEventPayload = {
  type: 'contact_click' | 'user_search' | 'provider_view'
  providerId?: number | null
  channel?: ContactChannel
  query?: string
  city?: string | null
  category?: string | null
  userId?: number | null
}

function getOrCreateId(key: string, generator: () => string): string {
  if (typeof window === 'undefined') return generator()
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const v = generator()
  localStorage.setItem(key, v)
  return v
}

function uuid(): string {
  // Simple UUID v4 generator for client-side
  // Not cryptographically secure, acceptable for analytics ids
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function slugifyCity(city: string | undefined | null): string {
  const s = (city || '').toString().trim().toLowerCase()
  if (!s) return 'unknown'
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export class InsightsService {
  static getAnonymousId(): string {
    return getOrCreateId('anonymousId', uuid)
  }
  static getSessionId(): string {
    // Reset sessionId when a new tab loads
    if (typeof window === 'undefined') return uuid()
    const sid = sessionStorage.getItem('sessionId')
    if (sid) return sid
    const v = uuid()
    sessionStorage.setItem('sessionId', v)
    return v
  }

  private static normalizeCategory(category: string | null | undefined): string | undefined {
    if (!category) return undefined
    const value = category.toString().trim().toLowerCase()
    if (!value) return undefined
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || undefined
  }

  private static async sendEvent(event: TrackEventPayload): Promise<void> {
    // Verificar si el tracking está explícitamente deshabilitado
    const disableTracking = process.env.NEXT_PUBLIC_DISABLE_TRACKING === 'true'
    if (disableTracking) {
      console.log('[Insights] Tracking deshabilitado por NEXT_PUBLIC_DISABLE_TRACKING=true')
      return
    }
    
    // Solo deshabilitar en desarrollo local (cuando hostname es localhost Y gateway es local)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ''
      const isLocalGateway = gatewayUrl.includes('localhost') || gatewayUrl.includes('127.0.0.1')
      
      if (isLocalhost && isLocalGateway) {
        console.log('[Insights] Tracking deshabilitado en desarrollo local', { hostname, gatewayUrl })
        return
      }
      
      // Log para debugging en producción
      if (!isLocalhost) {
        console.log('[Insights] Modo producción detectado, tracking habilitado', { hostname, gatewayUrl })
      }
    }

    const anonymousId = this.getAnonymousId()
    const sessionId = this.getSessionId()
    const citySlug = slugifyCity(event.city)
    const categorySlug = this.normalizeCategory(event.category ?? undefined)
    const ingestKey = process.env.NEXT_PUBLIC_INSIGHTS_INGEST_KEY

    try {
      console.log('[Insights] Enviando evento:', { type: event.type, providerId: event.providerId, channel: event.channel })
      const response = await apiFetch<{ ok: boolean }>(`/api/v1/events`, {
        method: 'POST',
        headers: {
          ...(ingestKey ? { 'x-insights-key': ingestKey } : {}),
        },
        body: JSON.stringify({
          events: [
            {
              type: event.type,
              anonymousId,
              sessionId,
              city: citySlug,
              category: categorySlug,
              providerId:
                typeof event.providerId === 'number' && Number.isFinite(event.providerId)
                  ? event.providerId
                  : undefined,
              query: event.query ? event.query.toString().slice(0, 160) : undefined,
              channel: event.channel,
              userId: event.userId ?? undefined,
              device: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            },
          ],
        }),
      })
      console.log('[Insights] Evento enviado exitosamente:', response)
    } catch (e: any) {
      // Log más detallado para debugging
      console.error('[Insights] Error al enviar evento:', {
        type: event.type,
        error: e?.message || e,
        status: e?.status,
        response: e?.response
      })
    }
  }

  static async trackContactClick(params: {
    providerId: number
    channel: ContactChannel
    city?: string
    category?: string
    userId?: number | null
  }): Promise<void> {
    await this.sendEvent({
      type: 'contact_click',
      providerId: params.providerId,
      channel: params.channel,
      city: params.city,
      category: params.category,
      userId: params.userId ?? undefined,
    })
  }

  static async trackSearch(params: {
    query: string
    city?: string
    category?: string | null
    userId?: number | null
  }): Promise<void> {
    if (!params.query.trim()) return
    await this.sendEvent({
      type: 'user_search',
      query: params.query,
      city: params.city,
      category: params.category ?? undefined,
      userId: params.userId ?? undefined,
    })
  }

  static async trackProviderView(params: {
    providerId: number
    city?: string
    category?: string | null
    userId?: number | null
  }): Promise<void> {
    await this.sendEvent({
      type: 'provider_view',
      providerId: params.providerId,
      city: params.city,
      category: params.category ?? undefined,
      userId: params.userId ?? undefined,
    })
  }
}


