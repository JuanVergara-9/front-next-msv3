"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star, MapPin, Calendar, Shield, Eye, User as UserIcon, LogOut, Edit2, Camera, X, Save, Upload, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useState, useEffect, useRef, useCallback } from "react"
import { UserProfileService, UserProfileData } from "@/lib/services/user-profile.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/services/auth.service"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { ProvidersService } from "@/lib/services/providers.service"
import { apiFetch } from "@/lib/apiClient"

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
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false)
  const [preferencesLoaded, setPreferencesLoaded] = useState(false)
  const [preferencesRef, setPreferencesRef] = useState<HTMLDivElement | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
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

  // Cargar perfil básico primero (carga rápida)
  useEffect(() => {
    const loadBasicProfile = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        // Solo cargar el perfil básico primero para mostrar la UI rápidamente
        const myProfile = await UserProfileService.getMyProfile()
        
        if (myProfile?.profile) {
          const profile = myProfile.profile
          setUserProfile(profile)
          setEditForm({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            province: profile.province || '',
            city: profile.city || '',
            locality: profile.locality || '',
            address: profile.address || '',
          })
          
          // Si el perfil no tiene first_name y last_name, intentar recargar en background
          // sin bloquear la UI
          if (!profile.first_name && !profile.last_name) {
            // Hacer retry en background sin bloquear
            UserProfileService.getMyProfile()
              .then(retryProfile => {
                if (retryProfile?.profile) {
                  setUserProfile(retryProfile.profile)
                  setEditForm({
                    first_name: retryProfile.profile.first_name || '',
                    last_name: retryProfile.profile.last_name || '',
                    province: retryProfile.profile.province || '',
                    city: retryProfile.profile.city || '',
                    locality: retryProfile.profile.locality || '',
                    address: retryProfile.profile.address || '',
                  })
                }
              })
              .catch(retryError => {
                console.error('Error retrying profile load:', retryError)
              })
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
      } finally {
        // Mostrar la UI inmediatamente después de cargar el perfil básico
        setIsLoading(false)
      }
    }

    loadBasicProfile()
  }, [user])

  // Cargar estadísticas en background (no bloquea la UI)
  useEffect(() => {
    const loadStats = async () => {
      if (!user || isLoading) return
      
      try {
        setIsLoadingStats(true)
        // Intentar cargar solo estadísticas (más rápido que todo el perfil)
        try {
          const profileData = await UserProfileService.getUserProfile(user.id)
          // Actualizar solo estadísticas, no preferencias (se cargan por separado)
          setUserData(prev => ({
            ...prev,
            reviewsPublished: profileData.reviewsPublished,
            contactsLast30Days: profileData.contactsLast30Days,
            reviews: profileData.reviews,
          }))
        } catch (error) {
          // Error silencioso
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    // Esperar un poco para no competir con la carga inicial
    const timer = setTimeout(loadStats, 100)
    return () => clearTimeout(timer)
  }, [user, isLoading])

  // Función para cargar preferencias (memoizada)
  const loadPreferences = useCallback(async () => {
    if (!user || isLoadingPreferences) return

    try {
      setIsLoadingPreferences(true)
      // Intentar cargar preferencias con endpoint específico (más rápido)
      try {
        const preferences = await UserProfileService.getUserPreferences(user.id)
        setUserData(prev => ({
          ...prev,
          preferredCategories: preferences.preferredCategories,
          citiesUsed: preferences.citiesUsed,
        }))
      } catch (error) {
        // Si el endpoint específico falla, intentar con getUserProfile
        try {
          const profileData = await UserProfileService.getUserProfile(user.id)
          setUserData(prev => ({
            ...prev,
            preferredCategories: profileData.preferredCategories,
            citiesUsed: profileData.citiesUsed,
          }))
        } catch (fallbackError) {
          // Error silencioso - usar datos por defecto
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setIsLoadingPreferences(false)
    }
  }, [user, isLoadingPreferences])

  // Lazy load de preferencias cuando la sección es visible (Intersection Observer)
  useEffect(() => {
    if (!preferencesRef || preferencesLoaded || !user) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !preferencesLoaded) {
            setPreferencesLoaded(true)
            loadPreferences()
          }
        })
      },
      { threshold: 0.1, rootMargin: '100px' } // Cargar 100px antes de que sea visible
    )

    observer.observe(preferencesRef)

    return () => {
      if (preferencesRef) {
        observer.unobserve(preferencesRef)
      }
    }
  }, [preferencesRef, preferencesLoaded, user, loadPreferences])

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

  // Función para detectar si faltan campos opcionales del perfil
  const hasIncompleteProfile = () => {
    if (isProvider && providerProfile) {
      // Para proveedores, verificar campos de ubicación
      const missingFields = []
      if (!providerProfile.province) missingFields.push('provincia')
      if (!providerProfile.city) missingFields.push('ciudad')
      if (!providerProfile.locality) missingFields.push('localidad')
      if (!providerProfile.address) missingFields.push('dirección')
      return missingFields.length > 0
    } else if (userProfile) {
      // Para usuarios, verificar campos de ubicación
      const missingFields = []
      if (!userProfile.province) missingFields.push('provincia')
      if (!userProfile.city) missingFields.push('ciudad')
      if (!userProfile.locality) missingFields.push('localidad')
      if (!userProfile.address) missingFields.push('dirección')
      return missingFields.length > 0
    }
    return false
  }

  // Función para formatear la fecha de creación (MM/YYYY)
  const formatMemberSince = (createdAt: string | undefined) => {
    // Priorizar created_at del perfil de usuario, luego del user
    // Sequelize devuelve created_at en snake_case cuando se usa underscored: true
    const dateString = createdAt || userProfile?.created_at || (userProfile as any)?.createdAt || user?.created_at
    
    if (!dateString) {
      return 'N/A'
    }
    
    try {
      const date = new Date(dateString)
      
      if (isNaN(date.getTime())) {
        return 'N/A'
      }
      
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${month}/${year}`
    } catch (error) {
      return 'N/A'
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    try {
      setIsSaving(true)
      const updated = await UserProfileService.updateProfile(editForm)
      if (updated?.profile) {
        setUserProfile(updated.profile)
        setIsEditing(false)
        toast.success('Perfil actualizado correctamente')
      } else {
        // Recargar el perfil completo después de actualizar
        const myProfile = await UserProfileService.getMyProfile()
        if (myProfile?.profile) {
          setUserProfile(myProfile.profile)
          setIsEditing(false)
          toast.success('Perfil actualizado correctamente')
        }
      }
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast.error(error?.message || 'Error al guardar el perfil. Intenta nuevamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido')
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
      if (updated) {
        // El backend devuelve { profile: {...} }, así que updated ya es el perfil
        setUserProfile(updated)
        // También recargar el perfil completo para asegurar que todo esté actualizado
        try {
          const myProfile = await UserProfileService.getMyProfile()
          if (myProfile?.profile) {
            setUserProfile(myProfile.profile)
          }
        } catch (reloadError) {
          console.error('Error reloading profile:', reloadError)
          // Si falla el reload, al menos usar lo que vino en la respuesta
        }
        // Cerrar modal y limpiar estado
        setIsAvatarModalOpen(false)
        setSelectedFile(null)
        setPreviewUrl(null)
        toast.success('Avatar actualizado correctamente')
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      toast.error(error?.message || 'Error al subir la imagen. Intenta nuevamente.')
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
        toast.success('Avatar eliminado correctamente')
      }
    } catch (error: any) {
      console.error('Error deleting avatar:', error)
      toast.error(error?.message || 'Error al eliminar la imagen. Intenta nuevamente.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Función para autocompletar ubicación usando geolocalización
  const handleAutoFillLocation = async () => {
    try {
      setIsLoadingLocation(true)
      // Obtener ubicación actual
      const location = await ProvidersService.getCurrentLocation()
      
      // Obtener ciudad y provincia desde coordenadas usando apiFetch
      const data = await apiFetch<{ city: string; province: string }>(
        `/api/v1/geo/reverse?lat=${location.lat}&lng=${location.lng}`,
        { cacheTtlMs: 0 } // No cachear para obtener datos frescos
      )
      
      // Autocompletar solo si los campos están vacíos
      setEditForm(prev => ({
        ...prev,
        city: prev.city || data.city || '',
        province: prev.province || data.province || '',
      }))
      
      toast.success('Ubicación autocompletada correctamente')
    } catch (error: any) {
      console.error('Error autocompletando ubicación:', error)
      if (error.message?.includes('not supported') || error.message?.includes('permission') || error.message?.includes('Geolocation')) {
        toast.error('Por favor, permite el acceso a tu ubicación para autocompletar')
      } else {
        toast.error('No se pudo obtener tu ubicación. Puedes completarla manualmente.')
      }
    } finally {
      setIsLoadingLocation(false)
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
      <header 
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-white/20 px-4 py-3"
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
      </header>

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
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg" key={userProfile?.avatar_url || 'no-avatar'}>
                    {userProfile?.avatar_url ? (
                      <AvatarImage 
                        src={userProfile.avatar_url} 
                        alt={getDisplayName()}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder.svg'
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
                      <Badge key="member" className="bg-[#2563EB] text-white">
                        <Calendar className="h-3 w-3 mr-1" />
                        Miembro desde {formatMemberSince(userProfile?.created_at || user?.created_at)}
                      </Badge>,
                      <Badge key="type" variant="outline" className="border-blue-500 text-blue-600">
                        {isProvider ? 'Proveedor' : 'Usuario'}
                      </Badge>
                    ].map((badge, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
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

        {/* Banner para completar perfil */}
        {hasIncompleteProfile() && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="rounded-2xl shadow-lg border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#111827] mb-2">
                      Termina de configurar tu perfil
                    </h3>
                    <p className="text-[#6B7280] text-sm">
                      Completa tu información de ubicación (provincia, ciudad, localidad y dirección) para mejorar tu experiencia en la plataforma.
                    </p>
                  </div>
                  {!isProvider && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white whitespace-nowrap"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar perfil
                      </Button>
                    </motion.div>
                  )}
                  {isProvider && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => router.push('/proveedores/editar')}
                        className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white whitespace-nowrap"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar perfil
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

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
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#111827]">Editar perfil</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoFillLocation}
                    disabled={isLoadingLocation}
                    className="flex items-center gap-2"
                  >
                    {isLoadingLocation ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-4 w-4 border-b-2 border-current rounded-full"
                        />
                        Obteniendo...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4" />
                        Usar mi ubicación
                      </>
                    )}
                  </Button>
                </div>
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
                    <Label htmlFor="city" className="block mb-2">Ciudad o Departamento</Label>
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
                    {isLoadingStats ? (
                      <div className="inline-block h-8 w-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      userData.reviewsPublished
                    )}
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
                    {isLoadingStats ? (
                      <div className="inline-block h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      userData.contactsLast30Days
                    )}
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
                            <button 
                              onClick={() => router.push(`/proveedores/${review.providerId}`)}
                              className="text-[#2563EB] hover:text-[#1d4ed8] text-sm font-medium flex items-center gap-1 transition-colors"
                            >
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

        {/* Preferencias - Lazy loaded */}
        <motion.div
          ref={setPreferencesRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <h2 className="text-xl font-semibold text-[#111827]">Preferencias</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-[#111827] mb-3">Categorías más buscadas</h3>
                  {isLoadingPreferences ? (
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"
                        />
                      ))}
                    </div>
                  ) : userData.preferredCategories && userData.preferredCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {userData.preferredCategories.map((category, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          whileHover={{ scale: 1.05, y: -2 }}
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
                  {isLoadingPreferences ? (
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-6 w-28 bg-gray-200 rounded-full animate-pulse"
                        />
                      ))}
                    </div>
                  ) : userData.citiesUsed && userData.citiesUsed.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {userData.citiesUsed.map((city, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          whileHover={{ scale: 1.05, y: -2 }}
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

