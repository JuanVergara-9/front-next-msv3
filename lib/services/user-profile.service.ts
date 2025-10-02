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
}

