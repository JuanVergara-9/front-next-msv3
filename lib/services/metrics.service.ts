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
    return apiFetch(`/api/v1/metrics/summary?${usp.toString()}`, { cacheTtlMs: 0 })
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
    return apiFetch(`/api/v1/metrics/contacts-breakdown?${usp.toString()}`, { cacheTtlMs: 0 })
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
    // Fetch user summary from auth-service and provider summary from provider-service in parallel
    const [userSummary, providerSummary] = await Promise.all([
      apiFetch<{
        totalUsers: number
        clientsRegistered: number
        workersRegistered: number
        adminsRegistered: number
        activeUsers30d: number
        activeClients30d: number
        activeWorkers30d: number
      }>('/api/v1/auth/admin/users-summary', { cacheTtlMs: 0 }),
      apiFetch<{ total: number; active: number }>('/api/v1/providers/stats/summary', { cacheTtlMs: 0 })
        .catch(() => ({ total: 0, active: 0 }))
    ]);

    // Merge logic: Use provider service counts for workers
    return {
      ...userSummary,
      workersRegistered: providerSummary.total,
      activeWorkers30d: providerSummary.active
    };
  }

  static async getUsersSummaryWithHistory(): Promise<{
    current: {
      totalUsers: number
      clientsRegistered: number
      workersRegistered: number
      adminsRegistered: number
      activeUsers30d: number
      activeClients30d: number
      activeWorkers30d: number
    }
    weeklyChange: {
      totalUsers: number
      clientsRegistered: number
      workersRegistered: number
    }
  }> {
    // Obtener resumen actual
    const current = await this.getUsersSummary();

    // Por ahora, simular el cambio semanal (en producción esto vendría del backend)
    // Puedes implementar un endpoint específico para esto más adelante
    const weeklyChange = {
      totalUsers: Math.floor(current.totalUsers * 0.05), // 5% de crecimiento simulado
      clientsRegistered: Math.floor(current.clientsRegistered * 0.04),
      workersRegistered: Math.floor(current.workersRegistered * 0.03)
    };

    return {
      current,
      weeklyChange
    };
  }

  static async getGlobalReviewsSummary(): Promise<{
    summary: { count: number; avgRating: number; photosRate: number }
  }> {
    return apiFetch(`/api/v1/reviews/stats/summary`, { cacheTtlMs: 0 })
  }

  static async getRecentReviews(limit: number = 3): Promise<{
    reviews: Array<{
      id: number
      user_id: number
      provider_id: number
      rating: number
      comment: string
      photos: string[]
      created_at: string
      user_name: string
      user_avatar: string | null
    }>
  }> {
    return apiFetch(`/api/v1/reviews/recent?limit=${limit}`, { cacheTtlMs: 0 })
  }
}

