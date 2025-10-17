"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star, MapPin, Calendar, Shield, Eye, User as UserIcon, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useState, useEffect } from "react"
import { UserProfileService, UserProfileData } from "@/lib/services/user-profile.service"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function UserProfilePage() {
  const { user, isProvider, logout, providerProfile } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<UserProfileData>({
    reviewsPublished: 0,
    contactsLast30Days: 0,
    reviews: [],
    preferredCategories: [],
    citiesUsed: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  // Cargar datos del perfil del usuario
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        const profileData = await UserProfileService.getUserProfile(user.id)
        setUserData(profileData)
      } catch (error) {
        console.error('Error loading user profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [user])

  // Nombre a mostrar: intenta con nombres reales, luego cae al email
  const getDisplayName = () => {
    const userAny: any = user as any
    const first = (userAny && (userAny.first_name || userAny.firstName)) || (providerProfile && (providerProfile.first_name || providerProfile.firstName))
    const last = (userAny && (userAny.last_name || userAny.lastName)) || (providerProfile && (providerProfile.last_name || providerProfile.lastName))
    const full = `${first || ''} ${last || ''}`.trim()
    if (full) return full
    if (user && user.email) {
      const username = user.email.split('@')[0]
      return username.charAt(0).toUpperCase() + username.slice(1)
    }
    return 'Usuario'
  }

  // Iniciales: usa nombres si existen; si no, deriva del email
  const getInitials = () => {
    const name = getDisplayName()
    const parts = name.split(' ').filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U'
    if (user?.email) return user.email[0]?.toUpperCase() || 'U'
    return 'U'
  }

  // Función para formatear la fecha de creación
  const formatMemberSince = (createdAt: string) => {
    const date = new Date(createdAt)
    return date.getFullYear().toString()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2F66F5] via-[#3b82f6] to-[#2563EB] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No estás autenticado</h1>
          <p className="text-white/80 mb-6">Inicia sesión para ver tu perfil</p>
          <Link 
            href="/auth/login" 
            className="bg-white text-[#2563EB] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2F66F5] via-[#3b82f6] to-[#2563EB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2F66F5] via-[#3b82f6] to-[#2563EB]">
      {/* Header fijo */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-white/20 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#2563EB]">miservicio</h1>
          <div className="flex items-center gap-2">
            <nav className="hidden sm:block text-sm text-gray-600">
              <span>Inicio</span> / <span className="text-[#2563EB]">Perfil de Usuario</span>
            </nav>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              aria-label="Cerrar sesión"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido principal con efecto glass */}
      <div className="glass-effect min-h-[calc(100vh-80px)]">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header Principal */}
        <Card className="rounded-2xl shadow-xl border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src="/placeholder.svg" alt={getDisplayName()} />
                <AvatarFallback className="text-2xl bg-[#2563EB] text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-[#111827] text-balance mb-2">
                  {getDisplayName()}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-4 text-[#6B7280] mb-3">
                  <div className="flex items-center gap-1">
                    <UserIcon className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                    <Calendar className="h-3 w-3 mr-1" />
                    Miembro desde {formatMemberSince(user.created_at)}
                  </Badge>
                  <Badge variant="outline" className="border-green-500 text-green-600">
                    {user.isEmailVerified ? 'Email verificado' : 'Email pendiente'}
                  </Badge>
                  <Badge variant="outline" className="border-blue-500 text-blue-600">
                    {isProvider ? 'Proveedor' : 'Usuario'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA: Convertirse en proveedor */}
        {!isProvider && (
          <Card className="rounded-2xl shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-semibold text-[#111827] mb-1">¿Ofrecés servicios profesionales?</h3>
                  <p className="text-[#6B7280]">Crea tu perfil y empezá a recibir clientes hoy mismo.</p>
                </div>
                <Button
                  className="h-11 px-6 text-white"
                  style={{ backgroundColor: "#2563EB" }}
                  onClick={() => router.push('/auth/register?provider=1')}
                >
                  Convertirme en proveedor
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actividad */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <h2 className="text-xl font-semibold text-[#111827]">Actividad</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="text-3xl font-bold text-[#2563EB] mb-2">{userData.reviewsPublished}</div>
                <div className="text-[#6B7280] font-medium">Reseñas publicadas</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-2">{userData.contactsLast30Days}</div>
                <div className="text-[#6B7280] font-medium">Contactos a proveedores (30 días)</div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-[#111827] mb-4">Reseñas publicadas</h3>
            {userData.reviews && userData.reviews.length > 0 ? (
              <div className="space-y-4">
                {userData.reviews.map((review) => (
                  <Card key={review.id} className="rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold text-[#111827]">{review.category}</span>
                          <span className="text-[#6B7280]">•</span>
                          <span className="text-[#6B7280]">{review.providerName}</span>
                        </div>
                        <span className="text-sm text-[#6B7280]">{review.date}</span>
                      </div>
                      <p className="text-[#6B7280] leading-relaxed mb-3 line-clamp-3">{review.comment}</p>
                      <button className="text-[#2563EB] hover:text-[#1d4ed8] text-sm font-medium flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Ver perfil del proveedor
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#6B7280]">
                <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Aún no has publicado reseñas</p>
                <p className="text-sm">Cuando contactes con proveedores, podrás calificar su servicio aquí.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferencias */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <h2 className="text-xl font-semibold text-[#111827]">Preferencias</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-[#111827] mb-3">Categorías más buscadas</h3>
                {userData.preferredCategories && userData.preferredCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userData.preferredCategories.map((category, index) => (
                      <Badge key={index} variant="outline" className="border-[#2563EB] text-[#2563EB]">
                        {category}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#6B7280] text-sm">Aún no has buscado categorías específicas.</p>
                )}
              </div>

              <div>
                <h3 className="font-medium text-[#111827] mb-3">Ciudades utilizadas</h3>
                {userData.citiesUsed && userData.citiesUsed.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userData.citiesUsed.map((city, index) => (
                      <Badge key={index} variant="outline" className="border-gray-400 text-gray-600">
                        <MapPin className="h-3 w-3 mr-1" />
                        {city}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#6B7280] text-sm">Aún no has buscado en ciudades específicas.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacidad */}
        <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-r from-gray-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-[#2563EB] mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-[#111827] mb-2">Privacidad</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed mb-4">
                  Tu email permanece privado y solo es visible para ti. Tu nombre de usuario se genera automáticamente 
                  a partir de tu email para proteger tu identidad. Tus datos están seguros y encriptados.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link 
                    href="/sobre" 
                    className="text-[#2563EB] hover:text-[#1d4ed8] text-sm font-medium transition-colors"
                  >
                    Más sobre MiServicio
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}

