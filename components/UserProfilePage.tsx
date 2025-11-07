"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star, MapPin, Calendar, Shield, Eye, User as UserIcon, LogOut, Edit2, Camera, X, Save, Upload, Trash2, Mail } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { UserProfileService, UserProfileData } from "@/lib/services/user-profile.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/services/auth.service"

interface UserProfile {
  id?: number
  user_id?: number
  first_name?: string | null
  last_name?: string | null
  province?: string | null
  city?: string | null
  locality?: string | null
  address?: string | null
  avatar_url?: string | null
  phone_e164?: string | null
  created_at?: string
  updated_at?: string
}

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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [editForm, setEditForm] = useState({
    province: '',
    city: '',
    locality: '',
    address: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Cargar datos del perfil del usuario
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        const [profileData, myProfile] = await Promise.all([
          UserProfileService.getUserProfile(user.id),
          UserProfileService.getMyProfile()
        ])
        setUserData(profileData)
        if (myProfile?.profile) {
          const profile = myProfile.profile
          console.log('Loaded user profile:', profile)
          console.log('Profile created_at:', profile.created_at, 'createdAt:', profile.createdAt)
          console.log('All profile keys:', Object.keys(profile))
          setUserProfile(profile)
          setEditForm({
            province: profile.province || '',
            city: profile.city || '',
            locality: profile.locality || '',
            address: profile.address || '',
          })
          
          // Si el perfil no tiene first_name y last_name, intentar recargar después de un breve delay
          // Esto puede pasar si el registro aún no ha completado la actualización del perfil
          if (!profile.first_name && !profile.last_name) {
            console.log('Profile missing first_name/last_name, retrying after delay...')
            setTimeout(async () => {
              try {
                const retryProfile = await UserProfileService.getMyProfile()
                if (retryProfile?.profile) {
                  console.log('Retry loaded user profile:', retryProfile.profile)
                  setUserProfile(retryProfile.profile)
                }
              } catch (retryError) {
                console.error('Error retrying profile load:', retryError)
              }
            }, 1000)
          }
        } else {
          console.warn('No profile found in myProfile response:', myProfile)
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [user])

  // Nombre a mostrar: usa el perfil del usuario primero
  const getDisplayName = () => {
    if (userProfile?.first_name || userProfile?.last_name) {
      const fullName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
      if (fullName) return fullName
    }
    // Si no hay nombre en el perfil, intentar obtenerlo del email como fallback
    if (user && user.email) {
      const username = user.email.split('@')[0]
      return username.charAt(0).toUpperCase() + username.slice(1)
    }
    return 'Usuario'
  }

  // Iniciales: usa nombres si existen; si no, deriva del email
  const getInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase()
    }
    if (userProfile?.first_name) {
      return userProfile.first_name[0]?.toUpperCase() || 'U'
    }
    if (user?.email) return user.email[0]?.toUpperCase() || 'U'
    return 'U'
  }

  // Función para formatear la fecha de creación (MM/YYYY)
  const formatMemberSince = (createdAt: string | undefined) => {
    // Priorizar created_at del perfil de usuario, luego del user
    // Sequelize devuelve created_at en snake_case cuando se usa underscored: true
    const dateString = createdAt || userProfile?.created_at || (userProfile as any)?.createdAt || user?.created_at
    
    if (!dateString) {
      console.warn('No created_at found:', { 
        userProfileCreatedAt: userProfile?.created_at,
        userCreatedAt: user?.created_at,
        passedCreatedAt: createdAt,
        fullUserProfile: userProfile 
      })
      return 'N/A'
    }
    
    try {
      console.log('Parsing date:', dateString, 'Type:', typeof dateString)
      const date = new Date(dateString)
      console.log('Parsed date:', date, 'isValid:', !isNaN(date.getTime()))
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString)
        return 'N/A'
      }
      
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      const formatted = `${month}/${year}`
      console.log('Formatted date:', formatted)
      return formatted
    } catch (error) {
      console.error('Error formatting date:', error, 'dateString:', dateString)
      return 'N/A'
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    try {
      setIsSaving(true)
      const updated = await UserProfileService.updateProfile(editForm)
      console.log('Profile updated:', updated)
      if (updated?.profile) {
        setUserProfile(updated.profile)
        setIsEditing(false)
      } else {
        // Recargar el perfil completo después de actualizar
        const myProfile = await UserProfileService.getMyProfile()
        if (myProfile?.profile) {
          setUserProfile(myProfile.profile)
          setIsEditing(false)
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error al guardar el perfil. Intenta nuevamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido')
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUploadAvatar = async () => {
    if (!selectedFile || !user) return

    try {
      setIsUploadingAvatar(true)
      const updated = await UserProfileService.uploadAvatar(selectedFile)
      console.log('Avatar upload response:', updated)
      if (updated) {
        // El backend devuelve { profile: {...} }, así que updated ya es el perfil
        console.log('Setting userProfile with:', updated)
        setUserProfile(updated)
        // También recargar el perfil completo para asegurar que todo esté actualizado
        try {
          const myProfile = await UserProfileService.getMyProfile()
          console.log('Reloaded profile after upload:', myProfile)
          if (myProfile?.profile) {
            setUserProfile(myProfile.profile)
            console.log('Updated userProfile avatar_url:', myProfile.profile.avatar_url)
          }
        } catch (reloadError) {
          console.error('Error reloading profile:', reloadError)
          // Si falla el reload, al menos usar lo que vino en la respuesta
        }
        // Cerrar modal y limpiar estado
        setIsAvatarModalOpen(false)
        setSelectedFile(null)
        setPreviewUrl(null)
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Error al subir la imagen. Intenta nuevamente.')
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteAvatar = async () => {
    if (!user) return
    try {
      setIsUploadingAvatar(true)
      const updated = await UserProfileService.deleteAvatar()
      console.log('Avatar delete response:', updated)
      if (updated) {
        // El backend devuelve { profile: {...} }, así que updated ya es el perfil
        setUserProfile(updated)
        // También recargar el perfil completo para asegurar que todo esté actualizado
        const myProfile = await UserProfileService.getMyProfile()
        if (myProfile?.profile) {
          setUserProfile(myProfile.profile)
        }
        // Cerrar modal y limpiar estado
        setIsAvatarModalOpen(false)
        setSelectedFile(null)
        setPreviewUrl(null)
      }
    } catch (error) {
      console.error('Error deleting avatar:', error)
      alert('Error al eliminar la imagen. Intenta nuevamente.')
    } finally {
      setIsUploadingAvatar(false)
    }
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
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg" key={userProfile?.avatar_url || 'no-avatar'}>
                  {userProfile?.avatar_url ? (
                    <AvatarImage 
                      src={userProfile.avatar_url} 
                      alt={getDisplayName()}
                      onError={(e) => {
                        console.error('Error loading avatar image:', userProfile.avatar_url)
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder.svg'
                      }}
                      onLoad={() => {
                        console.log('Avatar image loaded successfully:', userProfile.avatar_url)
                      }}
                    />
                  ) : null}
                  <AvatarFallback className="text-2xl bg-[#2563EB] text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {!isProvider && (
                  <button
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="absolute -bottom-1 -right-1 cursor-pointer bg-[#2563EB] text-white rounded-full p-2 shadow-lg hover:bg-[#1d4ed8] transition-colors z-10"
                    title="Cambiar foto de perfil"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-[#111827] text-balance">
                    {getDisplayName()}
                  </h1>
                </div>
                {!isProvider && (
                  <div className="flex justify-center md:justify-start mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="h-8 px-3 cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      {isEditing ? 'Cancelar edición' : 'Editar perfil'}
                    </Button>
                  </div>
                )}
                <div className="flex items-center justify-center md:justify-start gap-4 text-[#6B7280] mb-3">
                  <div className="flex items-center gap-1">
                    <UserIcon className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                    <Calendar className="h-3 w-3 mr-1" />
                    Miembro desde {formatMemberSince(userProfile?.created_at || user?.created_at)}
                  </Badge>
                  <Badge variant="outline" className={user.isEmailVerified ? "border-green-500 text-green-600" : "border-yellow-500 text-yellow-600"}>
                    {user.isEmailVerified ? 'Email verificado' : 'Email pendiente'}
                  </Badge>
                  {!user.isEmailVerified && (
                    <Badge 
                      variant="outline" 
                      className="border-blue-500 text-blue-600 cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={async () => {
                        try {
                          await AuthService.sendVerificationEmail()
                          alert('Email de verificación enviado. Revisa tu bandeja de entrada.')
                        } catch (error: any) {
                          alert(error.message || 'Error al enviar el email de verificación')
                        }
                      }}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Reenviar verificación
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-blue-500 text-blue-600">
                    {isProvider ? 'Proveedor' : 'Usuario'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario de edición */}
        {!isProvider && (
          <div
            className={`overflow-hidden transition-all duration-400 ease-in-out ${
              isEditing ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <Card className="rounded-2xl shadow-lg border-0">
              <CardHeader>
                <h2 className="text-xl font-semibold text-[#111827]">Editar perfil</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province" className="block mb-2">Provincia</Label>
                    <Input
                      id="province"
                      value={editForm.province}
                      onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                      placeholder="Ej: Mendoza"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="block mb-2">Ciudad</Label>
                    <Input
                      id="city"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      placeholder="Ej: San Rafael"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locality" className="block mb-2">Localidad</Label>
                    <Input
                      id="locality"
                      value={editForm.locality}
                      onChange={(e) => setEditForm({ ...editForm, locality: e.target.value })}
                      placeholder="Ej: Centro"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="block mb-2">Dirección</Label>
                    <Input
                      id="address"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      placeholder="Ej: Calle 123"
                      className="bg-white"
                    />
                  </div>
                </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    // Restaurar valores originales
                    if (userProfile) {
                      setEditForm({
                        province: userProfile.province || '',
                        city: userProfile.city || '',
                        locality: userProfile.locality || '',
                        address: userProfile.address || '',
                      })
                    }
                  }}
                  disabled={isSaving}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

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
                    Más sobre miservicio
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Modal para subir/quitar foto de perfil */}
      <Dialog 
        open={isAvatarModalOpen} 
        onOpenChange={(open) => {
          setIsAvatarModalOpen(open)
          if (!open) {
            // Limpiar estado al cerrar el modal
            setSelectedFile(null)
            setPreviewUrl(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar foto de perfil</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Zona de arrastrar y soltar */}
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${isDragging 
                  ? 'border-[#2563EB] bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
                ${previewUrl ? 'border-solid border-[#2563EB]' : ''}
              `}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Vista previa"
                    className="mx-auto max-h-48 rounded-lg object-cover"
                  />
                  <p className="text-sm text-gray-600">
                    {selectedFile?.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Arrastra una imagen aquí
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      o haz clic para seleccionar
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-file-input"
                  />
                  <label
                    htmlFor="avatar-file-input"
                    className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 cursor-pointer transition-colors"
                  >
                    Seleccionar archivo
                  </label>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <Button
                onClick={handleUploadAvatar}
                disabled={!selectedFile || isUploadingAvatar}
                className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
              >
                {isUploadingAvatar ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir foto
                  </>
                )}
              </Button>
              
              {userProfile?.avatar_url && (
                <Button
                  onClick={handleDeleteAvatar}
                  disabled={isUploadingAvatar}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Quitar foto
                </Button>
              )}
            </div>

            {selectedFile && (
              <Button
                onClick={() => {
                  setSelectedFile(null)
                  setPreviewUrl(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                variant="ghost"
                className="w-full text-sm"
              >
                Cancelar selección
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

