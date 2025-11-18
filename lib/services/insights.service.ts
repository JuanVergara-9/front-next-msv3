import { apiFetch } from '../apiClient'

type ContactChannel = 'whatsapp' | 'phone' | 'form'

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

  static async trackContactClick(params: {
    providerId: number
    channel: ContactChannel
    city?: string
    category?: string
    userId?: number | null
  }): Promise<void> {
    const anonymousId = this.getAnonymousId()
    const sessionId = this.getSessionId()
    const citySlug = slugifyCity(params.city)
    const ingestKey = process.env.NEXT_PUBLIC_INSIGHTS_INGEST_KEY
    try {
      await apiFetch<{ ok: boolean }>(`/api/v1/events`, {
        method: 'POST',
        headers: {
          ...(ingestKey ? { 'x-insights-key': ingestKey } : {}),
        },
        body: JSON.stringify({
          events: [
            {
              type: 'contact_click',
              anonymousId,
              sessionId,
              city: citySlug,
              category: params.category,
              providerId: params.providerId,
              channel: params.channel,
              userId: params.userId ?? undefined,
              device: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            },
          ],
        }),
      })
    } catch (e) {
      // Silencioso: no debe romper UX
      console.warn('trackContactClick error', e)
    }
  }
}


