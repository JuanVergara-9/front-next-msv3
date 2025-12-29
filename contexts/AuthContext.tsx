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
        setIsProvider(true)
      }
    } catch (error) {
      console.warn('Could not fetch provider profile details:', error)
    }
  }

  // Verificar si el usuario está autenticado al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          const currentUser = AuthService.getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
            setIsProvider(!!currentUser.isProvider)

            // Si es proveedor, cargar perfil detallado en background
            if (currentUser.isProvider) {
              void fetchProviderProfile()
            }
          }
        }
      } catch (error: any) {
        console.error('Error checking auth:', error)
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

      if (authData.user.isProvider) {
        await fetchProviderProfile()
      }
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

