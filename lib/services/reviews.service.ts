import { apiFetch } from '../apiClient'

export interface CreateReviewRequest {
  providerId: number
  rating: number
  comment?: string
  photos?: string[]
}

export interface ReviewItem {
  id: number
  user_id: number
  provider_id: number
  rating: number
  comment?: string | null
  photos?: string[]
  created_at: string
}

export interface ReviewListResponse {
  count: number
  items: ReviewItem[]
}

export interface ReviewSummaryResponse {
  summary: {
    count: number
    avgRating: number
    photosRate: number
  }
}

export class ReviewsService {
  static async listByProvider(providerId: number, opts: { limit?: number; offset?: number } = {}): Promise<ReviewListResponse> {
    const usp = new URLSearchParams()
    if (opts.limit) usp.set('limit', String(opts.limit))
    if (opts.offset) usp.set('offset', String(opts.offset))
    return apiFetch<ReviewListResponse>(`/api/v1/providers/${providerId}/reviews?${usp.toString()}`, { cacheTtlMs: 0 })
  }

  static async getSummary(providerId: number): Promise<ReviewSummaryResponse> {
    return apiFetch<ReviewSummaryResponse>(`/api/v1/providers/${providerId}/review-summary`, { cacheTtlMs: 0 })
  }

  static async create(payload: CreateReviewRequest): Promise<{ review: ReviewItem }> {
    return apiFetch<{ review: ReviewItem }>(`/api/v1/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }
}



