import { apiClient } from '../apiClient'

export interface User {
  id: number
  email: string
  role: string
  isEmailVerified: boolean
  isProvider: boolean
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
}

export class AuthService {
  private static readonly BASE_URL = '/api/v1/auth'
  private static readonly ACCESS_TOKEN_KEY = 'accessToken'
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken'
  private static readonly USER_KEY = 'user'

  // Guardar tokens y usuario en localStorage
  private static saveAuthData(authData: AuthResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, authData.accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authData.refreshToken)
    localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user))
  }

  // Obtener datos de autenticación del localStorage
  private static getAuthData(): { accessToken: string | null; refreshToken: string | null; user: User | null } {
    const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY)
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY)
    const userStr = localStorage.getItem(this.USER_KEY)
    const user = userStr ? JSON.parse(userStr) : null

    return { accessToken, refreshToken, user }
  }

  // Limpiar datos de autenticación
  private static clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
  }

  // Obtener token de acceso actual
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  // Obtener usuario actual
  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  // Verificar si el usuario está autenticado
  static isAuthenticated(): boolean {
    const { accessToken, user } = this.getAuthData()
    return !!(accessToken && user)
  }

  // Login
  static async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/login`, loginData)
      const authData: AuthResponse = response.data

      this.saveAuthData(authData)
      return authData
    } catch (error: any) {
      console.error('Login error:', error)

      // Extract user-friendly error message
      let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.'

      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data
      }

      throw new Error(errorMessage)
    }
  }

  // Register
  static async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/register`, registerData)
      const authData: AuthResponse = response.data

      this.saveAuthData(authData)
      return authData
    } catch (error: any) {
      console.error('Register error:', error)

      // Extract user-friendly error message
      let errorMessage = 'Error al crear la cuenta. Intenta nuevamente.'

      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data
      }

      throw new Error(errorMessage)
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      const { refreshToken } = this.getAuthData()
      if (refreshToken) {
        await apiClient.post(`${this.BASE_URL}/logout`, { refreshToken })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearAuthData()
    }
  }

  // Refresh token
  static async refreshToken(): Promise<AuthResponse> {
    try {
      const { refreshToken } = this.getAuthData()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await apiClient.post(`${this.BASE_URL}/refresh`, { refreshToken })
      const authData: AuthResponse = response.data

      this.saveAuthData(authData)
      return authData
    } catch (error: any) {
      console.error('Refresh token error:', error)
      this.clearAuthData()
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.')
    }
  }

  // Obtener información del usuario actual
  static async getMe(): Promise<User> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/me`)
      return response.data
    } catch (error: any) {
      console.error('Get me error:', error)
      throw new Error('Error al obtener información del usuario')
    }
  }

  // Enviar email de verificación
  static async sendVerificationEmail(): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/verify-email/send`)
      return response.data
    } catch (error: any) {
      console.error('Send verification email error:', error)
      throw new Error(
        error.response?.data?.error?.message ||
        'Error al enviar el email de verificación. Intenta nuevamente.'
      )
    }
  }

  // Verificar email con token
  static async verifyEmail(token: string): Promise<{ success: boolean; user?: User }> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/verify-email`, {
        params: { token }
      })
      // Actualizar usuario en localStorage si viene en la respuesta
      if (response.data.user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user))
      }
      return response.data
    } catch (error: any) {
      console.error('Verify email error:', error)
      throw new Error(
        error.response?.data?.error?.message ||
        'Error al verificar el email. El token puede ser inválido o haber expirado.'
      )
    }
  }
}