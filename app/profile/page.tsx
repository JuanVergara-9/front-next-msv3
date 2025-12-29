"use client"

import { useAuth } from "@/contexts/AuthContext"
import { UserProfilePage } from "@/components/UserProfilePage"
import { ProviderProfilePage } from "@/components/ProviderProfilePage"


export default function ProfilePage() {
  const { user, isLoading, isProvider, providerProfile } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2F66F5] via-[#3b82f6] to-[#2563EB] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 relative cascade-in cascade-delay-1">
            <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-white text-lg font-medium cascade-in cascade-delay-2">
            Cargando perfil...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2F66F5] via-[#3b82f6] to-[#2563EB] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4 cascade-in cascade-delay-1">
            No estás autenticado
          </h1>
          <p className="text-white/80 mb-6 cascade-in cascade-delay-2">
            Inicia sesión para ver tu perfil
          </p>
          <a
            href="/auth/login"
            className="bg-white text-[#2563EB] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-block cascade-in cascade-delay-3"
          >
            Iniciar sesión
          </a>
        </div>
      </div>
    )
  }

  // Renderizar el perfil según el tipo de usuario
  return (
    <>
      {isProvider ? (
        <ProviderProfilePage providerProfile={providerProfile || undefined} />
      ) : (
        <UserProfilePage />
      )}
    </>
  )
}