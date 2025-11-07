import { apiClient } from '../apiClient'

export interface UserReview {
  id: number
  rating: number
  providerName: string
  category: string
  comment: string
  date: string
  providerId: string
}

export interface UserProfileData {
  reviewsPublished: number
  contactsLast30Days: number
  reviews: UserReview[]
  preferredCategories: string[]
  citiesUsed: string[]
}

export class UserProfileService {
  private static readonly BASE_URL = '/api/v1/user-profile'

  // Obtener datos del perfil de usuario
  static async getUserProfile(userId: number): Promise<UserProfileData> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${userId}`)
      
      // El endpoint actual solo devuelve el perfil básico del usuario
      // Por ahora, retornamos datos por defecto hasta que se implemente el endpoint completo
      return {
        reviewsPublished: 0,
        contactsLast30Days: 0,
        reviews: [],
        preferredCategories: [],
        citiesUsed: []
      }
    } catch (error: any) {
      console.error('Error getting user profile:', error)
      // Retornar datos vacíos si hay error
      return {
        reviewsPublished: 0,
        contactsLast30Days: 0,
        reviews: [],
        preferredCategories: [],
        citiesUsed: []
      }
    }
  }

  // Obtener reseñas del usuario
  static async getUserReviews(userId: number): Promise<UserReview[]> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${userId}/reviews`)
      return response.data
    } catch (error: any) {
      console.error('Error getting user reviews:', error)
      return []
    }
  }

  // Obtener estadísticas de actividad del usuario
  static async getUserActivityStats(userId: number): Promise<{
    reviewsPublished: number
    contactsLast30Days: number
  }> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${userId}/stats`)
      return response.data
    } catch (error: any) {
      console.error('Error getting user activity stats:', error)
      return {
        reviewsPublished: 0,
        contactsLast30Days: 0
      }
    }
  }

  // Obtener preferencias del usuario (categorías y ciudades)
  static async getUserPreferences(userId: number): Promise<{
    preferredCategories: string[]
    citiesUsed: string[]
  }> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${userId}/preferences`)
      return response.data
    } catch (error: any) {
      console.error('Error getting user preferences:', error)
      return {
        preferredCategories: [],
        citiesUsed: []
      }
    }
  }

  // Obtener perfil completo del usuario
  static async getMyProfile(): Promise<any> {
    const response = await apiClient.get(`${this.BASE_URL}/me`)
    return response.data
  }

  // Actualizar perfil de usuario
  static async updateProfile(data: {
    first_name?: string
    last_name?: string
    phone_e164?: string
    province?: string
    city?: string
    locality?: string
    address?: string
    avatar_url?: string
    date_of_birth?: string
    public_profile?: boolean
    default_location_source?: 'gps' | 'city' | 'manual'
  }): Promise<any> {
    return apiClient.put(`${this.BASE_URL}/me`, data)
  }

  // Subir avatar de usuario (multipart/form-data, field 'file')
  static async uploadAvatar(file: File): Promise<any> {
    const base = (process.env.NEXT_PUBLIC_GATEWAY_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000').replace(/\/+$/,'')
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${base}/api/v1/user-profile/me/avatar`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      } as any,
      body: form,
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    return data.profile
  }

  // Eliminar avatar de usuario
  static async deleteAvatar(): Promise<any> {
    const base = (process.env.NEXT_PUBLIC_GATEWAY_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000').replace(/\/+$/,'')
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const res = await fetch(`${base}/api/v1/user-profile/me/avatar`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      } as any,
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    return data.profile
  }
}

