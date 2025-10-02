"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService, User } from '@/lib/services/auth.service'
import { ProvidersService } from '@/lib/services/providers.service'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isProvider: boolean
  providerProfile: any | null
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
  const [providerProfile, setProviderProfile] = useState<any | null>(null)

  // Función para verificar si el usuario tiene un perfil de proveedor
  const checkProviderProfile = async (userId: number) => {
    // Validar que el userId sea válido
    if (!userId || userId <= 0 || isNaN(userId)) {
      console.log('Invalid userId, skipping provider profile check:', userId)
      setIsProvider(false)
      setProviderProfile(null)
      return
    }

    try {
      console.log('Checking provider profile for user:', userId)
      const profile = await ProvidersService.getMyProviderProfile()
      console.log('Provider profile result:', profile)
      if (profile) {
        console.log('User has provider profile, setting isProvider to true')
        setIsProvider(true)
        setProviderProfile(profile)
      } else {
        console.log('User does not have provider profile, setting isProvider to false')
        setIsProvider(false)
        setProviderProfile(null)
      }
    } catch (error) {
      console.error('Error checking provider profile:', error)
      console.error('Error details:', error.response?.data || error.message)
      setIsProvider(false)
      setProviderProfile(null)
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
            // Verificar si tiene perfil de proveedor
            await checkProviderProfile(currentUser.id)
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Verificar perfil de proveedor cuando el usuario cambie
  useEffect(() => {
    if (user && user.id && !isProvider) {
      // Verificar perfil de proveedor con un pequeño delay para evitar problemas de timing
      const timeoutId = setTimeout(() => {
        checkProviderProfile(user.id)
      }, 2000) // Aumentar el delay para dar tiempo a que se complete el registro
      
      return () => clearTimeout(timeoutId)
    }
  }, [user, isProvider])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const authData = await AuthService.login({ email, password })
      setUser(authData.user)
      // Verificar si tiene perfil de proveedor
      await checkProviderProfile(authData.user.id)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const authData = await AuthService.register({ email, password })
      setUser(authData.user)
      // No verificar perfil de proveedor inmediatamente después del registro
      // Se verificará cuando se cargue la página principal
    } catch (error) {
      throw error
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
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = AuthService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        // Verificar si tiene perfil de proveedor
        await checkProviderProfile(currentUser.id)
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
    checkProviderProfile,
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

