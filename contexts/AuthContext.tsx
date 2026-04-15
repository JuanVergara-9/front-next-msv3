"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService, User } from '@/lib/services/auth.service'
import { ProvidersService } from '@/lib/services/providers.service'
import type { Provider } from '@/types/api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isProvider: boolean
  providerProfile: Provider | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  checkProviderProfile: (userId: number) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProvider, setIsProvider] = useState(false)
  const [providerProfile, setProviderProfile] = useState<Provider | null>(null)

  // Función para obtener el perfil detallado del proveedor
  const fetchProviderProfile = async () => {
    try {
      const profile = await ProvidersService.getMyProviderProfile()
      if (profile) {
        setProviderProfile(profile)
        setIsProvider(true) // Pisa cualquier valor stale del JWT/localStorage: la DB manda
      } else {
        setProviderProfile(null)
        setIsProvider(false)
      }
    } catch (error) {
      console.warn('Could not fetch provider profile details:', error)
    }
  }

  // Verificar si el usuario está autenticado al cargar la app.
  // Siempre valida el token contra el servidor para evitar que tokens
  // expirados en localStorage provoquen errores AUTH.FORBIDDEN en la UI.
  useEffect(() => {
    const checkAuth = async () => {
      // Sin token en localStorage → no hay sesión, evita llamada de red innecesaria
      if (!AuthService.isAuthenticated()) {
        setIsLoading(false)
        return
      }

      try {
        // Valida el token activo contra el servidor; si expiró, lanza un error
        const freshUser = await AuthService.getMe()
        setUser(freshUser)
        setIsProvider(!!freshUser.isProvider)
        void fetchProviderProfile()
      } catch {
        // Token expirado o revocado → limpiar sesión silenciosamente
        // El interceptor de apiClient ya habrá intentado el refresh y habrá
        // redirigido a /login si tampoco era válido. Aquí solo limpiamos estado local.
        setUser(null)
        setIsProvider(false)
        setProviderProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const authData = await AuthService.login({ email, password })
      setUser(authData.user)
      setIsProvider(!!authData.user.isProvider)

      // Cargar perfil de proveedor para asegurar estado actualizado
      await fetchProviderProfile()
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const authData = await AuthService.register({ email, password })
      setUser(authData.user)
      setIsProvider(!!authData.user.isProvider)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await AuthService.logout()
      setUser(null)
      setIsProvider(false)
      setProviderProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = AuthService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setIsProvider(!!currentUser.isProvider)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isProvider,
    providerProfile,
    login,
    register,
    logout,
    refreshUser,
    checkProviderProfile: async () => { await fetchProviderProfile() } // Mantener compatibilidad de interfaz
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

