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
import { motion, AnimatePresence } from "framer-motion"

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
    first_name: '',
    last_name: '',
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
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
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
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-[#2F66F5] via-[#3b82f6] to-[#2563EB] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
        >
          <div className="mx-auto mb-4 w-12 h-12 relative">
            <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
          </div>
          <motion.p 
            className="text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Cargando perfil...
          </motion.p>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-[#2F66F5] via-[#3b82f6] to-[#2563EB]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header fijo */}
      <motion.header 
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-white/20 px-4 py-3"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#2563EB]">miservicio</h1>
          <div className="flex items-center gap-2">
            <nav className="hidden sm:block text-sm text-gray-600">
              <span>Inicio</span> / <span className="text-[#2563EB]">Perfil de Usuario</span>
            </nav>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
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
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Contenido principal con efecto glass */}
      <div className="glass-effect min-h-[calc(100vh-80px)]">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header Principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="rounded-2xl shadow-xl border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <motion.div 
                  className="relative inline-block"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 200, delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                >
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
                    <motion.button
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="absolute -bottom-1 -right-1 cursor-pointer bg-[#2563EB] text-white rounded-full p-2 shadow-lg hover:bg-[#1d4ed8] transition-colors z-10"
                      title="Cambiar foto de perfil"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Camera className="h-4 w-4" />
                    </motion.button>
                  )}
                </motion.div>

                <motion.div 
                  className="flex-1 text-center md:text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <motion.h1 
                      className="text-3xl font-bold text-[#111827] text-balance"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      {getDisplayName()}
                    </motion.h1>
                  </div>
                  {!isProvider && (
                    <div className="flex justify-center md:justify-start mb-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(!isEditing)}
                          className="h-8 px-3 cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          {isEditing ? 'Cancelar edición' : 'Editar perfil'}
                        </Button>
                      </motion.div>
                    </div>
                  )}
                  <motion.div 
                    className="flex items-center justify-center md:justify-start gap-4 text-[#6B7280] mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="flex flex-wrap gap-2 justify-center md:justify-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    {[
                      <Badge key="member" className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                        <Calendar className="h-3 w-3 mr-1" />
                        Miembro desde {formatMemberSince(userProfile?.created_at || user?.created_at)}
                      </Badge>,
                      <Badge key="email" variant="outline" className={user.isEmailVerified ? "border-green-500 text-green-600" : "border-yellow-500 text-yellow-600"}>
                        {user.isEmailVerified ? 'Email verificado' : 'Email pendiente'}
                      </Badge>,
                      !user.isEmailVerified && (
                        <Badge 
                          key="verify"
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
                      ),
                      <Badge key="type" variant="outline" className="border-blue-500 text-blue-600">
                        {isProvider ? 'Proveedor' : 'Usuario'}
                      </Badge>
                    ].filter(Boolean).map((badge, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                      >
                        {badge}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Formulario de edición */}
        <AnimatePresence>
          {!isProvider && isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="rounded-2xl shadow-lg border-0">
              <CardHeader>
                <h2 className="text-xl font-semibold text-[#111827]">Editar perfil</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="block mb-2">Nombre</Label>
                    <Input
                      id="first_name"
                      value={editForm.first_name}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      placeholder="Ej: Juan"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="block mb-2">Apellido</Label>
                    <Input
                      id="last_name"
                      value={editForm.last_name}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      placeholder="Ej: Pérez"
                      className="bg-white"
                    />
                  </div>
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
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        // Restaurar valores originales
                        if (userProfile) {
                          setEditForm({
                            first_name: userProfile.first_name || '',
                            last_name: userProfile.last_name || '',
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
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white cursor-pointer"
                    >
                      {isSaving ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-4 w-4 border-b-2 border-white mr-2 rounded-full"
                          />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA: Convertirse en proveedor */}
        <AnimatePresence>
          {!isProvider && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <Card className="rounded-2xl shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                      <h3 className="text-xl font-semibold text-[#111827] mb-1">¿Ofrecés servicios profesionales?</h3>
                      <p className="text-[#6B7280]">Crea tu perfil y empezá a recibir clientes hoy mismo.</p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        className="h-11 px-6 text-white"
                        style={{ backgroundColor: "#2563EB" }}
                        onClick={() => router.push('/auth/register?provider=1')}
                      >
                        Convertirme en proveedor
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actividad */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <h2 className="text-xl font-semibold text-[#111827]">Actividad</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <motion.div 
                  className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <motion.div 
                    className="text-3xl font-bold text-[#2563EB] mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.2, type: "spring", stiffness: 200 }}
                  >
                    {userData.reviewsPublished}
                  </motion.div>
                  <div className="text-[#6B7280] font-medium">Reseñas publicadas</div>
                </motion.div>
                <motion.div 
                  className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.15 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <motion.div 
                    className="text-3xl font-bold text-green-600 mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.25, type: "spring", stiffness: 200 }}
                  >
                    {userData.contactsLast30Days}
                  </motion.div>
                  <div className="text-[#6B7280] font-medium">Contactos a proveedores (30 días)</div>
                </motion.div>
              </div>

              <h3 className="text-lg font-semibold text-[#111827] mb-4">Reseñas publicadas</h3>
              <AnimatePresence mode="wait">
                {userData.reviews && userData.reviews.length > 0 ? (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {userData.reviews.map((review, index) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 1.3 + index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                      >
                        <Card className="rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
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
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    className="text-center py-8 text-[#6B7280]"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Aún no has publicado reseñas</p>
                    <p className="text-sm">Cuando contactes con proveedores, podrás calificar su servicio aquí.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferencias */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
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
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 1.5 + index * 0.05 }}
                          whileHover={{ scale: 1.1, y: -2 }}
                        >
                          <Badge variant="outline" className="border-[#2563EB] text-[#2563EB]">
                            {category}
                          </Badge>
                        </motion.div>
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
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 1.6 + index * 0.05 }}
                          whileHover={{ scale: 1.1, y: -2 }}
                        >
                          <Badge variant="outline" className="border-gray-400 text-gray-600">
                            <MapPin className="h-3 w-3 mr-1" />
                            {city}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#6B7280] text-sm">Aún no has buscado en ciudades específicas.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacidad */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.7 }}
        >
          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-r from-gray-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.8, type: "spring", stiffness: 200 }}
                >
                  <Shield className="h-5 w-5 text-[#2563EB] mt-0.5" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#111827] mb-2">Privacidad</h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed mb-4">
                    Tu email permanece privado y solo es visible para ti. Tu nombre de usuario se genera automáticamente 
                    a partir de tu email para proteger tu identidad. Tus datos están seguros y encriptados.
                  </p>
                  <motion.div 
                    className="flex flex-wrap gap-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Link 
                      href="/sobre" 
                      className="text-[#2563EB] hover:text-[#1d4ed8] text-sm font-medium transition-colors"
                    >
                      Más sobre miservicio
                    </Link>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
                    src={previewUrl || undefined}
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
      </motion.div>
  )
}

