import { apiFetch } from '../apiClient'

export class MetricsService {
  static async getSummary(params: { from?: string; to?: string; city?: string; category?: string } = {}): Promise<{
    dau: number
    wau: number
    searches: number
    providerViews: number
    contacts: number
    reviews: number
    rating90d: number
    photosRate90d: number
  }> {
    const usp = new URLSearchParams()
    if (params.from) usp.set('from', params.from)
    if (params.to) usp.set('to', params.to)
    if (params.city) usp.set('city', params.city)
    if (params.category) usp.set('category', params.category)
    return apiFetch(`/api/v1/metrics/metrics/summary?${usp.toString()}`, { cacheTtlMs: 0 })
  }

  static async getContactsBreakdown(params: { from?: string; to?: string; city?: string; category?: string } = {}): Promise<{
    whatsapp: number
    phone: number
    form: number
    unknown: number
    total: number
  }> {
    const usp = new URLSearchParams()
    if (params.from) usp.set('from', params.from)
    if (params.to) usp.set('to', params.to)
    if (params.city) usp.set('city', params.city)
    if (params.category) usp.set('category', params.category)
    return apiFetch(`/api/v1/metrics/metrics/contacts-breakdown?${usp.toString()}`, { cacheTtlMs: 0 })
  }

  static async getUsersSummary(): Promise<{
    totalUsers: number
    clientsRegistered: number
    workersRegistered: number
    adminsRegistered: number
    activeUsers30d: number
    activeClients30d: number
    activeWorkers30d: number
  }> {
    return apiFetch(`/api/v1/auth/admin/users-summary`, { cacheTtlMs: 0 })
  }

  static async getGlobalReviewsSummary(): Promise<{
    summary: { count: number; avgRating: number; photosRate: number }
  }> {
    return apiFetch(`/api/v1/reviews/stats/summary`, { cacheTtlMs: 0 })
  }
}


