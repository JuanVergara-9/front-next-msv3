"use client"

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
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
  const lastValidatedAt = useRef<number>(0)

  const clearSession = useCallback(() => {
    setUser(null)
    setIsProvider(false)
    setProviderProfile(null)
  }, [])

  const fetchProviderProfile = async () => {
    try {
      const profile = await ProvidersService.getMyProviderProfile()
      if (profile) {
        setProviderProfile(profile)
        setIsProvider(true)
      } else {
        setProviderProfile(null)
        setIsProvider(false)
      }
    } catch (error) {
      console.warn('Could not fetch provider profile details:', error)
    }
  }

  const validateSession = useCallback(async () => {
    if (!AuthService.isAuthenticated()) {
      clearSession()
      return
    }

    try {
      const freshUser = await AuthService.getMe()
      setUser(freshUser)
      setIsProvider(!!freshUser.isProvider)
      lastValidatedAt.current = Date.now()
      void fetchProviderProfile()
    } catch {
      // Token inválido/expirado → limpiar TODO: React state + localStorage.
      // El interceptor ya intentó refresh; si también falló, redirige a /login.
      // Limpiamos localStorage aquí también para evitar estado zombie donde
      // React dice "no autenticado" pero localStorage dice "sí autenticado".
      AuthService.clearSession()
      clearSession()
    }
  }, [clearSession])

  // Validar sesión al montar la app
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      await validateSession()
      if (!cancelled) setIsLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [validateSession])

  // Revalidar la sesión cuando el usuario vuelve a la tab después de un rato
  useEffect(() => {
    const STALE_THRESHOLD_MS = 5 * 60 * 1000 // 5 min

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return
      const elapsed = Date.now() - lastValidatedAt.current
      if (elapsed > STALE_THRESHOLD_MS) {
        void validateSession()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [validateSession])

  // Escuchar el evento de logout forzado desde el interceptor (silentLogoutAndRedirect)
  useEffect(() => {
    const onForcedLogout = () => clearSession()
    window.addEventListener('auth:logout', onForcedLogout)
    return () => window.removeEventListener('auth:logout', onForcedLogout)
  }, [clearSession])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const authData = await AuthService.login({ email, password })
      setUser(authData.user)
      setIsProvider(!!authData.user.isProvider)
      lastValidatedAt.current = Date.now()
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
      lastValidatedAt.current = Date.now()
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await AuthService.logout()
      clearSession()
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const freshUser = await AuthService.getMe()
      setUser(freshUser)
      setIsProvider(!!freshUser.isProvider)
      lastValidatedAt.current = Date.now()
    } catch {
      // Si falla, intentar al menos con datos locales
      const currentUser = AuthService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setIsProvider(!!currentUser.isProvider)
      }
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
    checkProviderProfile: async () => { await fetchProviderProfile() }
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

