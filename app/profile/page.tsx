"use client"

import { useAuth } from "@/contexts/AuthContext"
import { UserProfilePage } from "@/components/UserProfilePage"
import { ProviderProfilePage } from "@/components/ProviderProfilePage"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { user, isLoading, isProvider, providerProfile } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2F66F5] via-[#3b82f6] to-[#2563EB] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2F66F5] via-[#3b82f6] to-[#2563EB] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No estás autenticado</h1>
          <p className="text-white/80 mb-6">Inicia sesión para ver tu perfil</p>
          <a 
            href="/auth/login" 
            className="bg-white text-[#2563EB] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Iniciar sesión
          </a>
        </div>
      </div>
    )
  }

  // Renderizar el perfil según el tipo de usuario
  if (isProvider) {
    return <ProviderProfilePage providerProfile={providerProfile || undefined} />
  }

  return <UserProfilePage />
}