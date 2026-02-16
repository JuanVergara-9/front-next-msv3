"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { AnimatedTabSelector } from "@/components/ui/animated-tab-selector"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import toast from "react-hot-toast"
import {
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Shield,
  BadgeCheck,
  Wrench,
  Camera,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  LogOut,
  X,
  Edit,
  Clock,
  Check,
  CheckCheck,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { ReviewsService, type ReviewItem } from "@/lib/services/reviews.service"
import { ProvidersService } from "@/lib/services/providers.service"
import { InsightsService } from "@/lib/services/insights.service"
import { Header } from "@/components/Header"
import { useRouter } from "next/navigation"
import { isAdmin } from "@/lib/utils/admin"
import { EditReviewPhotosDialog } from "./EditReviewPhotosDialog"
import { motion, AnimatePresence } from "framer-motion"
import { ChatRoom } from "@/components/chat/ChatRoom"
import { ChatService, Conversation } from "@/lib/services/chat.service"
import { io } from 'socket.io-client'
import { AuthService } from '@/lib/services/auth.service'
import { SOCKET_URL } from '@/lib/apiClient'
import { OrdersService } from '@/lib/services/orders.service'

interface ProviderProfilePageProps {
  providerProfile?: any
  /** Shadow Ledger: cuando el usuario entró por Magic Link (pedido guest) */
  guestRequestId?: number
  guestWorkerId?: number
}

// Componente para mostrar imágenes de Google Photos
function GooglePhotosImage({ photoUrl, index }: { photoUrl: string; index: number }) {
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const isGooglePhotosLink = photoUrl.includes('photos.app.goo.gl')

  // Resetear loading cuando cambia la URL
  useEffect(() => {
    setLoading(true)
    setImageError(false)
  }, [photoUrl])

  if (isGooglePhotosLink) {
    // Para enlaces de Google Photos, mostrar un preview atractivo con botón
    // Google Photos no permite mostrar imágenes directamente por seguridad
    return (
      <a
        href={photoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative aspect-square rounded-lg overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all group cursor-pointer bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50"
        aria-label={`Ver foto ${index + 1} en Google Photos`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
          <div className="bg-white/90 rounded-full p-4 mb-3 group-hover:scale-110 transition-transform shadow-lg">
            <Camera className="h-10 w-10 text-blue-600" />
          </div>
          <span className="text-sm text-blue-800 font-semibold text-center mb-1">Foto en Google Photos</span>
          <span className="text-xs text-blue-600 text-center">Hacé clic para ver</span>
        </div>
        {/* Patrón de fondo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_70%)]" />
        </div>
      </a>
    )
  }

  // Para URLs directas de imágenes, mostrar la imagen normalmente
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-[#2563EB] transition-colors cursor-pointer group"
          aria-label={`Ver foto ${index + 1}`}
        >
          {loading && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
              <Camera className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <img
            src={photoUrl}
            alt={`Foto de la reseña ${index + 1}`}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setLoading(false)}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder.svg'
              setImageError(true)
              setLoading(false)
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="max-w-4xl p-0 bg-black border-0">
        <img
          src={photoUrl}
          alt={`Foto de la reseña ${index + 1}`}
          className="w-full h-full object-contain max-h-[80vh] bg-black"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder.svg'
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

export function ProviderProfilePage({ providerProfile: propProviderProfile, guestRequestId, guestWorkerId }: ProviderProfilePageProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const isOwner = !!user && !!propProviderProfile && Number(user.id) === Number(propProviderProfile.user_id)
  const { toast } = useToast()
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [matchLoading, setMatchLoading] = useState(false)
  const isGuestFlow = guestRequestId != null && guestRequestId > 0
  const [allReviews, setAllReviews] = useState<ReviewItem[]>([]) // Todas las reseñas sin filtrar
  const [reviewsCount, setReviewsCount] = useState<number>(0)
  const [avgRating, setAvgRating] = useState<number>(0)
  const [photosRate, setPhotosRate] = useState<number>(0)
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [newRating, setNewRating] = useState<number>(0)
  const [newComment, setNewComment] = useState<string>("")
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>("")
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState<boolean>(false)
  const [reviewFilter, setReviewFilter] = useState<'all' | 'positive' | 'negative'>('all')
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null)
  const [editingReviewPhotos, setEditingReviewPhotos] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>('informacion')
  const [isStartingChat, setIsStartingChat] = useState(false)
  const maxCommentLength = 2000
  const maxPhotos = 6

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatConversationId, setChatConversationId] = useState<number | null>(null)
  const [chatOtherUser, setChatOtherUser] = useState<{ name: string, avatar: string, profession: string } | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loadingConversations, setLoadingConversations] = useState(false)

  // Availability state
  const [availability, setAvailability] = useState<{ businessHours: any, emergencyAvailable: boolean } | null>(null)
  const [isAvailDialogOpen, setIsAvailDialogOpen] = useState<boolean>(false)
  const [savingAvailability, setSavingAvailability] = useState<boolean>(false)
  const dayLabels: Record<string, string> = { mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue', fri: 'Vie', sat: 'Sáb', sun: 'Dom' }

  function isValidUrl(url: string): boolean {
    try {
      const u = new URL(url)
      return u.protocol === 'http:' || u.protocol === 'https:'
    } catch {
      return false
    }
  }

  // Format message time: show hour if today, "Ayer" if yesterday, date otherwise
  function formatMessageTime(dateString: string): string {
    if (!dateString) return '';

    const messageDate = new Date(dateString);
    const now = new Date();

    // Reset hours to compare only dates
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const msgDate = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

    if (msgDate.getTime() === today.getTime()) {
      // Today: show time
      return messageDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    } else if (msgDate.getTime() === yesterday.getTime()) {
      // Yesterday
      return 'Ayer';
    } else {
      // Older: show date
      return messageDate.toLocaleDateString('es-AR');
    }
  }

  // Mapear datos del backend a la estructura esperada
  const mapProviderData = (profile: any) => {
    if (!profile) return null

    // Debug: ver qué datos recibimos del backend
    console.log('🔍 ProviderProfilePage - Datos recibidos del backend:', {
      category: profile.category,
      categories: profile.categories,
      hasCategory: !!profile.category,
      hasCategories: !!profile.categories,
      categoriesLength: profile.categories?.length
    })

    // Obtener todas las categorías (principal + múltiples)
    const allCategories: any[] = []

    // Agregar categoría principal si existe
    if (profile.category && profile.category.id) {
      allCategories.push(profile.category)
    }

    // Agregar categorías múltiples si existen
    if (profile.categories && Array.isArray(profile.categories)) {
      profile.categories.forEach((cat: any) => {
        if (cat && cat.id && !allCategories.find(c => c.id === cat.id)) {
          allCategories.push(cat)
        }
      })
    }

    const uniqueCategories = allCategories

    console.log('🔍 ProviderProfilePage - Categorías procesadas:', {
      allCategories,
      uniqueCategories,
      finalCount: uniqueCategories.length
    })

    return {
      id: profile.id?.toString() || "1",
      firstName: profile.first_name || "Usuario",
      lastName: profile.last_name || "Proveedor",
      category: uniqueCategories[0]?.name || "Servicio", // Categoría principal para compatibilidad
      categories: uniqueCategories, // Todas las categorías
      city: profile.city || "Ciudad",
      province: profile.province || "Provincia",
      ratingAvg: profile.rating || 0,
      reviewsCount90d: profile.review_count || 0,
      isVerified: profile.status === 'active',
      isLicensed: !!profile.is_licensed,
      emergencyAvailable: profile.emergency_available || false,
      description: profile.description || "Descripción no disponible",
      yearsExperience: profile.years_experience || 0,
      memberSince: profile.created_at ? new Date(profile.created_at).getFullYear().toString() : new Date().getFullYear().toString(),
      phone: profile.phone_e164 || profile.whatsapp_e164 || "",
      whatsapp: profile.whatsapp_e164 || profile.phone_e164 || "",
      avatar: profile.avatar_url || "/placeholder.svg",
      photos: Array.isArray(profile.photos) ? profile.photos : [],
      services: [],
      reviews: [], // Las reseñas se cargarían por separado
    }
  }

  // No usar datos mock. Si no hay perfil, no renderizar nada.
  const providerData = mapProviderData(propProviderProfile)

  const providerIdNum = useMemo(() => {
    const idNum = Number(providerData?.id)
    return Number.isFinite(idNum) ? idNum : null
  }, [providerData?.id])

  const primaryCategoryValue = useMemo(() => {
    if (!providerData) return undefined
    const categories = Array.isArray(providerData.categories) ? providerData.categories : []
    const first = categories[0]
    if (!first) return providerData.category || undefined
    if (typeof first === 'string') return first
    return first?.slug || first?.name || providerData.category || undefined
  }, [providerData])

  const hasTrackedViewRef = useRef(false)

  useEffect(() => {
    if (!providerIdNum || hasTrackedViewRef.current) return
    hasTrackedViewRef.current = true
    void InsightsService.trackProviderView({
      providerId: providerIdNum,
      city: providerData?.city,
      category: typeof primaryCategoryValue === 'string' ? primaryCategoryValue : undefined,
      userId: user?.id ?? undefined,
    })
  }, [providerIdNum, providerData?.city, primaryCategoryValue, user?.id])

  const loadReviews = async () => {
    if (!providerIdNum) return
    try {
      setLoadingReviews(true)
      const [list, summary] = await Promise.all([
        ReviewsService.listByProvider(providerIdNum, { limit: 20, offset: 0 }),
        ReviewsService.getSummary(providerIdNum),
      ])
      const items = list.items || []

      // Asegurar que photos sea un array
      const normalizedItems = items.map(item => ({
        ...item,
        photos: Array.isArray(item.photos) ? item.photos : (item.photos ? [item.photos] : [])
      }))

      setAllReviews(normalizedItems)
      setReviewsCount(summary.summary.count || list.count || 0)
      setAvgRating(summary.summary.avgRating || 0)
      setPhotosRate(summary.summary.photosRate || 0)
    } catch (e) {
      // Silenciar en UI, opcionalmente loguear
      console.warn('Error loading reviews', e)
    } finally {
      setLoadingReviews(false)
    }
  }

  useEffect(() => {
    if (providerIdNum) {
      loadReviews()
    }
  }, [providerIdNum]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load availability for public profile display
  useEffect(() => {
    let cancelled = false
    async function loadAvailability() {
      if (!providerIdNum) return
      try {
        const a = await ProvidersService.getProviderAvailability(providerIdNum)
        if (!cancelled) setAvailability(a)
      } catch (e) {
        console.warn('Error loading availability', e)
      }
    }
    loadAvailability()
    return () => { cancelled = true }
    loadAvailability()
    return () => { cancelled = true }
  }, [providerIdNum])

  // Load conversations if owner
  const fetchConversations = async () => {
    if (!isOwner) return;
    try {
      setLoadingConversations(true)
      const data = await ChatService.getConversations()
      setConversations(data)
    } catch (error) {
      console.error('Error loading conversations:', error)
      toast({ title: 'Error', description: 'No se pudieron cargar los mensajes' })
    } finally {
      setLoadingConversations(false)
    }
  }

  // Load conversations initially for badge to work
  useEffect(() => {
    if (isOwner) {
      fetchConversations()
    }
  }, [isOwner]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reload conversations when entering mensajes tab (for fresh data)
  useEffect(() => {
    if (isOwner && activeTab === 'mensajes') {
      fetchConversations()
    }
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // Socket listener for real-time message updates
  useEffect(() => {
    if (!isOwner) return;

    const socketUrl = SOCKET_URL;
    const token = AuthService.getAccessToken();
    
    if (!token) return;

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Provider profile socket connected for notifications');
    });

    // Listen for new messages to update conversations list
    socket.on('new_message_notification', (message: any) => {
      console.log('Received new message notification:', message);
      // Reload conversations to get updated unread counts and last message
      fetchConversations();
    });

    // Listen for message status updates
    socket.on('message_status_update', () => {
      // Reload conversations when message status changes (e.g., read)
      fetchConversations();
    });

    return () => {
      socket.disconnect();
    };
  }, [isOwner]); // eslint-disable-line react-hooks/exhaustive-deps

  // Marcar mensajes como leídos cuando se abre el chat
  useEffect(() => {
    if (isChatOpen && chatConversationId) {
      const markAsRead = async () => {
        try {
          await ChatService.markAsRead(chatConversationId)
          // Actualizar el estado local para que la badge se actualice inmediatamente
          setConversations(prev => 
            prev.map(c => 
              c.id === chatConversationId 
                ? { ...c, unreadCount: 0 }
                : c
            )
          )
        } catch (error) {
          console.error('Error marking messages as read:', error)
        }
      }
      markAsRead()
    }
  }, [isChatOpen, chatConversationId])

  function minutesToTime(m: number) {
    const h = Math.floor(m / 60).toString().padStart(2, '0')
    const mi = (m % 60).toString().padStart(2, '0')
    return `${h}:${mi}`
  }

  function formatChipsFromBH(bh: any): string[] {
    const chips: string[] = []
    if (!bh) return chips
    const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri']
    const sameWeek = weekdays.every(d => (bh[d]?.length || 0) === 1 && bh[d][0].start === 480 && bh[d][0].end === 1080)
    const satDefault = Array.isArray(bh.sat) && bh.sat.length === 1 && bh.sat[0].start === 540 && bh.sat[0].end === 780
    const sunEmpty = !Array.isArray(bh.sun) || bh.sun.length === 0
    if (sameWeek && satDefault && sunEmpty) {
      return ['Lun-Vie 8:00-18:00', 'Sáb 9:00-13:00']
    }
    const order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    for (const d of order) {
      const ranges = Array.isArray(bh[d]) ? bh[d] : []
      if (ranges.length === 0) continue
      const txt = ranges.map((r: any) => `${minutesToTime(r.start)}-${minutesToTime(r.end)}`).join(', ')
      chips.push(`${dayLabels[d]} ${txt}`)
    }
    return chips
  }

  async function handleSubmitReview() {
    if (!providerIdNum) return
    if (!newRating) {
      toast({ title: "Seleccioná una calificación", description: "Elige de 1 a 5 estrellas" })
      return
    }
    if (newComment.length > maxCommentLength) {
      toast({ title: "Comentario demasiado largo", description: `Máximo ${maxCommentLength} caracteres` })
      return
    }
    if (photoUrls.length > maxPhotos) {
      toast({ title: "Demasiadas fotos", description: `Máximo ${maxPhotos} fotos` })
      return
    }
    for (const url of photoUrls) {
      if (!isValidUrl(url)) {
        toast({ title: "URL de foto inválida", description: `Revisá: ${url}` })
        return
      }
    }
    try {
      setSubmitting(true)

      // Subir fotos a Cloudinary si hay archivos seleccionados
      let finalPhotoUrls = [...photoUrls]
      if (photoFiles.length > 0) {
        setUploadingPhotos(true)
        try {
          const uploadResult = await ReviewsService.uploadPhotos(photoFiles)
          finalPhotoUrls = [...finalPhotoUrls, ...uploadResult.photos.map(p => p.url)]
        } catch (uploadError: any) {
          toast({ title: "Error al subir fotos", description: uploadError.message || "No se pudieron subir las fotos" })
          setUploadingPhotos(false)
          setSubmitting(false)
          return
        } finally {
          setUploadingPhotos(false)
        }
      }

      await ReviewsService.create({ providerId: providerIdNum, rating: newRating, comment: newComment || undefined, photos: finalPhotoUrls.length ? finalPhotoUrls : undefined })
      toast({ title: "¡Gracias!", description: "Tu reseña fue enviada" })
      setIsDialogOpen(false)
      setNewRating(0)
      setNewComment("")
      setPhotoUrls([])
      setPhotoFiles([])
      // recargar
      const [list, summary] = await Promise.all([
        ReviewsService.listByProvider(providerIdNum, { limit: 20, offset: 0 }),
        ReviewsService.getSummary(providerIdNum),
      ])
      const items = list.items || []
      // Normalizar photos a array
      const normalizedItems = items.map(item => ({
        ...item,
        photos: Array.isArray(item.photos) ? item.photos : (item.photos ? [item.photos] : [])
      }))
      setAllReviews(normalizedItems)
      setReviewsCount(summary.summary.count || list.count || 0)
      setAvgRating(summary.summary.avgRating || 0)
      setPhotosRate(summary.summary.photosRate || 0)
    } catch (err: any) {
      let message = 'No se pudo enviar la reseña'
      const raw = err?.message || ''
      try {
        const parsed = JSON.parse(raw)
        const code = parsed?.error?.code
        if (code === 'REVIEW.NO_CONTACT_INTENT') message = 'Tenés que haber contactado al proveedor en los últimos 30 días'
        if (code === 'REVIEW.WINDOW_LIMIT') message = 'Podés publicar una reseña cada 30 días para este proveedor'
        if (code === 'GATEWAY.SERVICE_UNCONFIGURED') message = 'Servicio de reseñas no configurado'
      } catch { }
      toast({ title: 'Error', description: message })
    } finally {
      setSubmitting(false)
    }
  }

  const SHOW_GALLERY = false;

  // Filtrar reseñas según el filtro seleccionado
  const filteredReviews = useMemo(() => {
    if (reviewFilter === 'all') return allReviews
    if (reviewFilter === 'positive') return allReviews.filter(r => r.rating >= 4)
    if (reviewFilter === 'negative') return allReviews.filter(r => r.rating <= 2)
    return allReviews
  }, [allReviews, reviewFilter]);

  if (!providerData) {
    return null;
  }

  // Listen for real-time updates
  useEffect(() => {
    const token = AuthService.getAccessToken();
    if (!token) return;

    const socketUrl = SOCKET_URL;
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Connected to socket for notifications');
    });

    socket.on('new_message_notification', (message: any) => {
      console.log('New message notification:', message);

      // Update conversations list
      setConversations(prev => {
        const existingConvIndex = prev.findIndex(c => c.id === message.conversationId);

        if (existingConvIndex !== -1) {
          // Si el chat está abierto para esta conversación, no incrementar unreadCount
          const isCurrentChatOpen = isChatOpen && chatConversationId === message.conversationId;
          const currentUnreadCount = prev[existingConvIndex].unreadCount || 0;
          
          // Move to top and update last message
          const updatedConv = {
            ...prev[existingConvIndex],
            lastMessage: {
              content: message.content,
              createdAt: message.createdAt,
              senderId: message.senderId
            },
            // Solo incrementar si el chat NO está abierto
            unreadCount: isCurrentChatOpen ? currentUnreadCount : currentUnreadCount + 1,
            updatedAt: message.createdAt
          };

          const newConvs = [...prev];
          newConvs.splice(existingConvIndex, 1);
          return [updatedConv, ...newConvs];
        } else {
          // New conversation (would need to fetch details, but for now just ignore or reload)
          // Ideally we should fetch the conversation details here
          fetchConversations();
          return prev;
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchConversations, isChatOpen, chatConversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for new messages to update conversation list
  useEffect(() => {
    const token = AuthService.getAccessToken();
    if (!token) return;

    const socketUrl = SOCKET_URL;
    const { io } = require('socket.io-client');
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('new_message_notification', (message: any) => {
      setConversations(prev => {
        const existingConvIndex = prev.findIndex(c => c.id === message.conversationId);
        if (existingConvIndex !== -1) {
          // Si el chat está abierto para esta conversación, no incrementar unreadCount
          const isCurrentChatOpen = isChatOpen && chatConversationId === message.conversationId;
          const currentUnreadCount = prev[existingConvIndex].unreadCount || 0;
          
          const updatedConv = {
            ...prev[existingConvIndex],
            lastMessage: {
              content: message.content,
              createdAt: message.createdAt,
              senderId: message.senderId
            },
            // Solo incrementar si el chat NO está abierto
            unreadCount: isCurrentChatOpen ? currentUnreadCount : currentUnreadCount + 1,
            updatedAt: message.createdAt
          };
          const newConvs = [...prev];
          newConvs.splice(existingConvIndex, 1);
          return [updatedConv, ...newConvs];
        }
        // If conversation doesn't exist in list, we might want to fetch it or ignore
        // For now, we ignore to avoid complex fetching logic here
        return prev;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [isChatOpen, chatConversationId]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
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
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4 mb-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <motion.button
                            type="button"
                            aria-label="Ver foto de perfil"
                            className="rounded-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB]"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                                <AvatarImage
                                  src={providerData.avatar || "/placeholder.svg"}
                                  alt={`${providerData.firstName} ${providerData.lastName}`}
                                />
                                <AvatarFallback className="text-xl bg-[#2563EB] text-white">
                                  {providerData.firstName[0]}
                                  {providerData.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                            </motion.div>
                          </motion.button>
                        </DialogTrigger>
                        <DialogContent aria-describedby={undefined} className="max-w-2xl p-0 bg-black border-0">
                          <img
                            src={providerData.avatar || "/placeholder.svg"}
                            alt={`${providerData.firstName} ${providerData.lastName}`}
                            className="w-full h-full object-contain max-h-[80vh] bg-black"
                          />
                        </DialogContent>
                      </Dialog>
                      <motion.div
                        className="flex-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <h1 className="text-2xl font-bold text-[#111827] text-balance">
                          {providerData.firstName} {providerData.lastName}
                        </h1>
                        <motion.div
                          className="mt-2 flex flex-wrap items-center gap-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.4 }}
                        >
                          {providerData.categories && providerData.categories.length > 0 ? (
                            providerData.categories.map((cat: any, index: number) => (
                              <motion.div
                                key={cat.id || index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                                whileHover={{ scale: 1.1, y: -2 }}
                              >
                                <Badge className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                                  <Wrench className="h-4 w-4 mr-1" />
                                  {cat.name}
                                </Badge>
                              </motion.div>
                            ))
                          ) : (
                            <Badge className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                              <Wrench className="h-4 w-4 mr-1" />
                              {providerData.category}
                            </Badge>
                          )}
                          {providerData.isLicensed && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.6 }}
                              whileHover={{ scale: 1.1, y: -2 }}
                            >
                              <Badge variant="outline" className="border-green-500 text-green-700">
                                <BadgeCheck className="h-3 w-3 mr-1" />
                                Matriculado
                              </Badge>
                            </motion.div>
                          )}
                          {providerData.isVerified && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.65 }}
                              whileHover={{ scale: 1.1, y: -2 }}
                            >
                              <Badge variant="outline" className="border-green-500 text-green-700">
                                <Shield className="h-3 w-3 mr-1" />
                                Verificado
                              </Badge>
                            </motion.div>
                          )}
                          {providerData.emergencyAvailable && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.7 }}
                              whileHover={{ scale: 1.1, y: -2 }}
                            >
                              <Badge variant="outline" className="border-orange-500 text-orange-700">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Atiende urgencias
                              </Badge>
                            </motion.div>
                          )}
                        </motion.div>
                        <motion.div
                          className="mt-3 text-[#6B7280] flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.8 }}
                        >
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {providerData.city}, {providerData.province}
                            </span>
                          </div>
                          <motion.div
                            className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full w-fit"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.9, type: "spring", stiffness: 200 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold text-[#111827]">{Number(avgRating || providerData.ratingAvg).toFixed(1)}</span>
                            <span className="text-[#6B7280]">· {reviewsCount || providerData.reviewsCount90d} reseñas</span>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>

                  <motion.div
                    className="flex flex-col gap-3 md:w-64 md:flex-none md:shrink-0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {!isOwner && (
                      <>
                        {isGuestFlow && providerIdNum && (
                          <motion.div
                            whileHover={{ scale: matchLoading ? 1 : 1.05, y: matchLoading ? 0 : -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              className="bg-green-600 hover:bg-green-700 text-white shadow-lg cursor-pointer w-full"
                              disabled={matchLoading}
                              onClick={async () => {
                                if (!guestRequestId || !providerIdNum) return
                                setMatchLoading(true)
                                try {
                                  const result = await OrdersService.matchOrder(guestRequestId, providerIdNum)
                                  if (result.whatsappLink) {
                                    window.open(result.whatsappLink, "_blank")
                                  }
                                  toast.success("Listo. Se abrió WhatsApp para que coordines con el profesional.")
                                } catch (e: any) {
                                  toast({
                                    title: "Error",
                                    description: e?.message || "No se pudo completar. Intentá de nuevo.",
                                    variant: "destructive",
                                  })
                                } finally {
                                  setMatchLoading(false)
                                }
                              }}
                            >
                              {matchLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Conectando...
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  ELEGIR PROFESIONAL
                                </>
                              )}
                            </Button>
                          </motion.div>
                        )}
                        {!isGuestFlow && (
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            className="bg-green-600 hover:bg-green-700 text-white shadow-lg cursor-pointer"
                            onClick={() => {
                              if (!user) {
                                const next = window.location.pathname + window.location.search + window.location.hash
                                router.push(`/auth/login?next=${encodeURIComponent(next)}`)
                                return
                              }
                              if (providerData.whatsapp) {
                                if (providerIdNum) {
                                  void InsightsService.trackContactClick({
                                    providerId: providerIdNum,
                                    channel: 'whatsapp',
                                    city: providerData.city,
                                    category: typeof primaryCategoryValue === 'string' ? primaryCategoryValue : undefined,
                                    userId: user?.id ?? undefined,
                                  })
                                }
                                const message = encodeURIComponent("Hola! Te contacto desde https://miservicio.ar. Vi tu perfil y me interesa tu servicio, quería hacerte una consulta rápida.")
                                window.open(`https://wa.me/${providerData.whatsapp}?text=${message}`, "_blank")
                              }
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Contactar por WhatsApp
                          </Button>
                        </motion.div>
                        )}
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            className="border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white bg-transparent cursor-pointer"
                            onClick={() => {
                              if (!user) {
                                const next = window.location.pathname + window.location.search + window.location.hash
                                router.push(`/auth/login?next=${encodeURIComponent(next)}`)
                                return
                              }
                              if (providerData.phone) {
                                if (providerIdNum) {
                                  void InsightsService.trackContactClick({
                                    providerId: providerIdNum,
                                    channel: 'phone',
                                    city: providerData.city,
                                    category: typeof primaryCategoryValue === 'string' ? primaryCategoryValue : undefined,
                                    userId: user?.id ?? undefined,
                                  })
                                }
                                window.open(`tel:${providerData.phone}`, "_blank")
                              }
                            }}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Llamar
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            className="cursor-pointer relative overflow-visible"
                            disabled={isStartingChat}
                            onClick={async () => {
                              if (!user) {
                                toast({
                                  title: "Iniciá sesión",
                                  description: "Tenés que estar logueado para enviar mensajes.",
                                });
                                const next = window.location.pathname + window.location.search + window.location.hash
                                router.push(`/auth/login?next=${encodeURIComponent(next)}`)
                                return
                              }

                              if (!providerIdNum) return;

                              try {
                                setIsStartingChat(true);
                                const conversation = await ChatService.createOrGetConversation(providerIdNum);
                                
                                // Redirección explícita a la página de chat
                                router.push(`/mensajes/${conversation.id}`);
                              } catch (error) {
                                console.error('Error starting chat:', error);
                                toast({
                                  title: "Error",
                                  description: "No se pudo iniciar el chat. Intenta nuevamente.",
                                  variant: "destructive"
                                });
                              } finally {
                                setIsStartingChat(false);
                              }
                            }}
                          >
                            {isStartingChat ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Iniciando...
                              </>
                            ) : (
                              <>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Enviar mensaje
                              </>
                            )}
                            <span className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-yellow-500 text-yellow-900 shadow-sm z-10 whitespace-nowrap">
                              BETA
                            </span>
                          </Button>
                        </motion.div>
                      </>
                    )}
                    {isOwner && (
                      <div className="flex flex-col gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-lg cursor-pointer">Editar perfil</Button>
                            </motion.div>
                          </DialogTrigger>
                          <DialogContent aria-describedby={undefined} className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Editar perfil</DialogTitle>
                            </DialogHeader>
                            <EditProviderForm initial={propProviderProfile} onSaved={() => window.location.reload()} />
                          </DialogContent>
                        </Dialog>
                        <Dialog open={isAvailDialogOpen} onOpenChange={setIsAvailDialogOpen}>
                          <DialogTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button variant="outline" className="border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white cursor-pointer">Editar disponibilidad</Button>
                            </motion.div>
                          </DialogTrigger>
                          <DialogContent aria-describedby={undefined} className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Disponibilidad y urgencias</DialogTitle>
                            </DialogHeader>
                            <AvailabilityEditor
                              initial={availability || { businessHours: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }, emergencyAvailable: !!propProviderProfile?.emergency_available }}
                              onSave={async (payload) => {
                                try {
                                  setSavingAvailability(true)
                                  await ProvidersService.updateMyAvailability(payload)
                                  const a = await ProvidersService.getProviderAvailability(providerIdNum || Number(propProviderProfile?.id))
                                  setAvailability(a)
                                  setIsAvailDialogOpen(false)
                                  toast({ title: 'Disponibilidad actualizada' })
                                } catch (e: any) {
                                  let msg = 'No se pudo guardar la disponibilidad'
                                  try { msg = JSON.parse(e?.message)?.error?.message || msg } catch { }
                                  toast({ title: 'Error', description: msg })
                                } finally { setSavingAvailability(false) }
                              }}
                              saving={savingAvailability}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs de contenido */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <AnimatedTabSelector
                  value={activeTab}
                  onValueChange={setActiveTab}
                  variant="blue-white"
                  size="default"
                  options={[
                    { value: "informacion", label: "Información" },
                    { value: "resenas", label: "Reseñas" },
                    ...(SHOW_GALLERY ? [{ value: "galeria", label: "Galería" }] : []),
                    ...(isOwner ? (() => {
                      const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
                      return [{
                        value: "mensajes",
                        label: "Mensajes",
                        beta: true,
                        ...(unreadCount > 0 && { badge: unreadCount })
                      }];
                    })() : [])
                  ]}
                />
              </motion.div>

              <AnimatePresence mode="wait">
                <TabsContent value="informacion" key="informacion" className="space-y-6">
                  {/* Descripción */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="rounded-2xl shadow-lg border-0">
                      <CardHeader>
                        <h2 className="text-xl font-semibold text-[#111827]">Descripción</h2>
                      </CardHeader>
                      <CardContent>
                        <p className="text-[#6B7280] leading-relaxed">{providerData.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Servicios y precios — ocultado por pedido del producto */}

                  {/* Disponibilidad y zona */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <Card className="rounded-2xl shadow-lg border-0">
                      <CardHeader>
                        <h2 className="text-xl font-semibold text-[#111827]">Disponibilidad y zona</h2>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium text-[#111827] mb-2">Horarios</h3>
                            <div className="flex flex-wrap gap-2">
                              {formatChipsFromBH(availability?.businessHours).map((c, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3, delay: 0.2 + idx * 0.05 }}
                                  whileHover={{ scale: 1.1, y: -2 }}
                                >
                                  <Badge variant="outline">{c}</Badge>
                                </motion.div>
                              ))}
                              {availability?.emergencyAvailable && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3, delay: 0.3 }}
                                  whileHover={{ scale: 1.1, y: -2 }}
                                >
                                  <Badge variant="outline" className="border-orange-500 text-orange-700">Atiende urgencias</Badge>
                                </motion.div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium text-[#111827] mb-2">Zona de trabajo</h3>
                            <p className="text-[#6B7280]">Opera en San Rafael y alrededores (radio de 20km)</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Información adicional */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <Card className="rounded-2xl shadow-lg border-0">
                      <CardHeader>
                        <h2 className="text-xl font-semibold text-[#111827]">Información</h2>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { icon: Calendar, label: "Años de experiencia", value: `${providerData.yearsExperience} años` },
                            { icon: CreditCard, label: "Medios de pago", value: "Efectivo, Transferencia" },
                            { icon: FileText, label: "Miembro desde", value: providerData.memberSince }
                          ].map((item, index) => (
                            <motion.div
                              key={index}
                              className="flex items-center gap-3"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                              whileHover={{ scale: 1.05, x: 5 }}
                            >
                              <item.icon className="h-5 w-5 text-[#6B7280]" />
                              <div>
                                <p className="text-sm text-[#6B7280]">{item.label}</p>
                                <p className="font-semibold text-[#111827]">{item.value}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="resenas" key="resenas" className="space-y-6">
                  {/* Resumen de reseñas */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="rounded-2xl shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <motion.div
                            className="text-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                          >
                            <motion.div
                              className="text-4xl font-bold text-[#111827]"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: 0.1 }}
                            >
                              {avgRating > 0 ? avgRating.toFixed(1) : (providerData.ratingAvg || 0).toFixed(1)}
                            </motion.div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const currentRating = avgRating > 0 ? avgRating : (providerData.ratingAvg || 0)
                                return (
                                  <motion.div
                                    key={star}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.2 + star * 0.1 }}
                                  >
                                    <Star
                                      className={`h-4 w-4 ${star <= Math.round(currentRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                    />
                                  </motion.div>
                                )
                              })}
                            </div>
                            <p className="text-sm text-[#6B7280] mt-1">{reviewsCount > 0 ? reviewsCount : providerData.reviewsCount90d} reseñas (90 días)</p>
                          </motion.div>
                          <motion.div
                            className="text-right"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                          >
                            <p className="text-sm text-[#6B7280]">{photosRate}% con fotos</p>
                            <p className="text-sm text-[#6B7280]">Reseñas (90 días): {reviewsCount > 0 ? reviewsCount : providerData.reviewsCount90d}</p>
                          </motion.div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {['all', 'positive', 'negative'].map((filter, index) => (
                            <motion.button
                              key={filter}
                              onClick={() => setReviewFilter(filter as 'all' | 'positive' | 'negative')}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${reviewFilter === filter
                                ? 'bg-[#2563EB] text-white border-2 border-[#2563EB]'
                                : 'bg-white text-[#6B7280] border-2 border-gray-200 hover:border-[#2563EB] hover:text-[#2563EB]'
                                }`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {filter === 'all' ? 'Todas' : filter === 'positive' ? 'Positivas' : 'Negativas'}
                            </motion.button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Lista de reseñas */}
                  <AnimatePresence mode="wait">
                    <div className="space-y-4">
                      {filteredReviews.map((review, index) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <Card className="rounded-2xl shadow-lg border-0">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                                >
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={review.user_avatar || "/placeholder.svg"} alt={review.user_name || "Usuario"} />
                                    <AvatarFallback>
                                      {(review.user_name || 'Usuario').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                </motion.div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-[#111827]">{review.user_name || 'Usuario'}</span>
                                      <span className="text-sm text-[#6B7280]">
                                        {review.created_at ? (() => {
                                          try {
                                            const date = new Date(review.created_at)
                                            return isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })
                                          } catch {
                                            return 'Fecha no disponible'
                                          }
                                        })() : 'Fecha no disponible'}
                                      </span>
                                      {(review.photos && review.photos.length > 0) && <Camera className="h-4 w-4 text-[#6B7280]" />}
                                    </div>
                                    {isAdmin(user) && (
                                      <motion.button
                                        onClick={() => {
                                          setEditingReviewPhotos(review.photos || [])
                                          setEditingReviewId(review.id)
                                        }}
                                        className="text-[#6B7280] hover:text-[#2563EB] transition-colors flex items-center gap-1 text-sm"
                                        title="Editar fotos (Admin)"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <Edit className="h-3 w-3" />
                                        <span>Editar fotos</span>
                                      </motion.button>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                      />
                                    ))}
                                  </div>
                                  {review.comment && (
                                    <p className="text-[#6B7280] leading-relaxed mb-3">{review.comment}</p>
                                  )}
                                  {review.photos && Array.isArray(review.photos) && review.photos.length > 0 && (
                                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                                      {review.photos.map((photoUrl: string, idx: number) => {
                                        // Verificar si es un enlace de Google Photos (photos.app.goo.gl)
                                        const isGooglePhotosLink = photoUrl.includes('photos.app.goo.gl');

                                        return (
                                          <GooglePhotosImage key={idx} photoUrl={photoUrl} index={idx} />
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                      {!loadingReviews && filteredReviews.length === 0 && (
                        <p className="text-center text-[#6B7280]">
                          {reviewFilter === 'all'
                            ? 'Aún no hay reseñas'
                            : reviewFilter === 'positive'
                              ? 'No hay reseñas positivas'
                              : 'No hay reseñas negativas'}
                        </p>
                      )}
                    </div>
                  </AnimatePresence>

                  {/* Crear reseña */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="text-center mt-6"
                  >
                    {user ? (
                      <div className="text-center">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white">Escribir una reseña</Button>
                            </motion.div>
                          </DialogTrigger>
                          <DialogContent aria-describedby={undefined}>
                            <DialogHeader>
                              <DialogTitle>Escribir una reseña</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => setNewRating(s)}
                                    aria-label={`Calificación ${s}`}
                                  >
                                    <Star className={`h-6 w-6 ${s <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                  </button>
                                ))}
                              </div>
                              <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Contá tu experiencia (opcional)"
                                rows={4}
                              />
                              <div className="text-xs text-[#6B7280] text-right">{newComment.length}/{maxCommentLength}</div>

                              <div className="space-y-2 text-left">
                                <label className="block text-sm font-medium text-[#111827]">Fotos (opcional)</label>

                                {/* Input para subir archivos */}
                                <div className="space-y-2">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    aria-label="Subir fotos"
                                    onChange={(e) => {
                                      const files = Array.from(e.target.files || [])
                                      if (files.length + photoFiles.length + photoUrls.length > maxPhotos) {
                                        toast({ title: 'Límite de fotos', description: `Máximo ${maxPhotos} fotos en total` })
                                        return
                                      }
                                      setPhotoFiles(prev => [...prev, ...files])
                                      e.target.value = '' // Reset input
                                    }}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                  />
                                  {photoFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {photoFiles.map((file, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-blue-200 bg-blue-50">
                                          <span className="max-w-[200px] truncate" title={file.name}>{file.name}</span>
                                          <button
                                            type="button"
                                            aria-label={`Quitar foto ${file.name}`}
                                            onClick={() => setPhotoFiles(prev => prev.filter((_, i) => i !== idx))}
                                            className="text-blue-600 hover:text-blue-800"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Input para URLs (opcional, para compatibilidad con Google Photos) */}
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={newPhotoUrl}
                                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                                    placeholder="O ingresá una URL (ej: Google Photos)"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault()
                                        const url = newPhotoUrl.trim()
                                        if (!url) return
                                        if (!isValidUrl(url)) {
                                          toast({ title: 'URL inválida', description: 'Ingresá una URL http(s) válida' })
                                          return
                                        }
                                        if (photoUrls.length + photoFiles.length >= maxPhotos) {
                                          toast({ title: 'Límite de fotos', description: `Máximo ${maxPhotos} fotos` })
                                          return
                                        }
                                        if (photoUrls.includes(url)) {
                                          toast({ title: 'Foto duplicada', description: 'Esa URL ya está en la lista' })
                                          return
                                        }
                                        setPhotoUrls(prev => [...prev, url])
                                        setNewPhotoUrl('')
                                      }
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      const url = newPhotoUrl.trim()
                                      if (!url) return
                                      if (!isValidUrl(url)) {
                                        toast({ title: 'URL inválida', description: 'Ingresá una URL http(s) válida' })
                                        return
                                      }
                                      if (photoUrls.length + photoFiles.length >= maxPhotos) {
                                        toast({ title: 'Límite de fotos', description: `Máximo ${maxPhotos} fotos` })
                                        return
                                      }
                                      if (photoUrls.includes(url)) {
                                        toast({ title: 'Foto duplicada', description: 'Esa URL ya está en la lista' })
                                        return
                                      }
                                      setPhotoUrls(prev => [...prev, url])
                                      setNewPhotoUrl('')
                                    }}
                                  >Agregar URL</Button>
                                </div>
                                {photoUrls.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {photoUrls.map((u) => (
                                      <span key={u} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50">
                                        <span className="max-w-[200px] truncate" title={u}>{u}</span>
                                        <button
                                          type="button"
                                          aria-label={`Quitar foto ${u}`}
                                          onClick={() => setPhotoUrls(prev => prev.filter(x => x !== u))}
                                          className="text-gray-500 hover:text-gray-700"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {(photoFiles.length > 0 || photoUrls.length > 0) && (
                                  <p className="text-xs text-gray-500">
                                    {photoFiles.length + photoUrls.length} de {maxPhotos} fotos seleccionadas
                                  </p>
                                )}
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleSubmitReview}
                                disabled={submitting || uploadingPhotos || !newRating}
                                className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
                              >
                                {uploadingPhotos ? 'Subiendo fotos...' : submitting ? 'Enviando...' : 'Enviar reseña'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      <div className="text-center">
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button asChild className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white">
                            <a href="/auth/login">Iniciar sesión para escribir una reseña</a>
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>

                {SHOW_GALLERY && (
                  <TabsContent value="galeria" key="galeria" className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className="rounded-2xl shadow-lg border-0">
                        <CardHeader>
                          <h2 className="text-xl font-semibold text-[#111827]">Galería de trabajos</h2>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {providerData.photos.map((photo: string, index: number) => (
                              <motion.div
                                key={index}
                                className="aspect-video rounded-xl overflow-hidden shadow-lg"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                              >
                                <img
                                  src={photo || "/placeholder.svg"}
                                  alt={`Trabajo ${index + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-300"
                                />
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                )}

                {isOwner && (
                  <TabsContent value="mensajes" key="mensajes" className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className="rounded-2xl shadow-lg border-0">
                        <CardHeader>
                          <h2 className="text-xl font-semibold text-[#111827]">Mensajes</h2>
                        </CardHeader>
                        <CardContent>
                          {loadingConversations ? (
                            <div className="flex justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                          ) : conversations.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                              <p>No tenés mensajes todavía.</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {conversations.map((conv) => (
                                <motion.div
                                  key={conv.id}
                                  whileHover={{ scale: 1.01, backgroundColor: "rgba(249, 250, 251, 0.5)" }}
                                  whileTap={{ scale: 0.99 }}
                                  onClick={() => {
                                    setChatConversationId(conv.id)
                                    setChatOtherUser({
                                      name: `${conv.otherUser?.firstName || ''} ${conv.otherUser?.lastName || ''}`.trim() || 'Usuario',
                                      avatar: conv.otherUser?.avatarUrl || '/placeholder.svg',
                                      profession: '' // Podríamos agregar esto después si lo necesitamos
                                    })
                                    setIsChatOpen(true)
                                  }}
                                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-100 cursor-pointer transition-colors bg-white"
                                >
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={conv.otherUser?.avatarUrl} />
                                    <AvatarFallback>{conv.otherUser?.firstName?.[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                      <h3 className="font-semibold text-gray-900 truncate">
                                        {conv.otherUser?.firstName} {conv.otherUser?.lastName}
                                      </h3>
                                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                        {formatMessageTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {conv.lastMessage?.senderId === user?.id && (
                                        <CheckCheck className="w-3 h-3 text-blue-500" />
                                      )}
                                      <p className={`text-sm truncate ${(conv.unreadCount || 0) > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                                        }`}>
                                        {conv.lastMessage?.content || 'Iniciar conversación'}
                                      </p>
                                    </div>
                                  </div>
                                  {(conv.unreadCount || 0) > 0 && (
                                    <div className="flex-shrink-0 ml-2 bg-red-500 text-white text-xs font-bold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center">
                                      {conv.unreadCount}
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                )}
              </AnimatePresence>
            </Tabs>
          </motion.div>

          {/* Sección de proveedores similares removida para evitar datos mock */}
        </div>
      </div>

      {/* Diálogo para editar fotos de reseña */}
      {
        editingReviewId !== null && (
          <EditReviewPhotosDialog
            reviewId={editingReviewId}
            currentPhotos={editingReviewPhotos}
            open={editingReviewId !== null}
            onOpenChange={(open) => {
              if (!open) {
                setEditingReviewId(null)
                setEditingReviewPhotos([])
              }
            }}
            onSuccess={() => {
              loadReviews()
              setEditingReviewId(null)
              setEditingReviewPhotos([])
            }}
          />
        )
      }

      {/* Botón fijo en mobile: solo visible si NO es el dueño */}
      {
        !isOwner && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:hidden">
            {isGuestFlow && providerIdNum ? (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg cursor-pointer"
                disabled={matchLoading}
                onClick={async () => {
                  if (!guestRequestId || !providerIdNum) return
                  setMatchLoading(true)
                  try {
                    const result = await OrdersService.matchOrder(guestRequestId, providerIdNum)
                    if (result.whatsappLink) window.open(result.whatsappLink, "_blank")
                    toast.success("Listo. Se abrió WhatsApp para que coordines con el profesional.")
                  } catch (e: any) {
                    toast({
                      title: "Error",
                      description: e?.message || "No se pudo completar. Intentá de nuevo.",
                      variant: "destructive",
                    })
                  } finally {
                    setMatchLoading(false)
                  }
                }}
              >
                {matchLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    ELEGIR PROFESIONAL
                  </>
                )}
              </Button>
            ) : (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg cursor-pointer"
                onClick={() => {
                  if (!user) {
                    const next = window.location.pathname + window.location.search + window.location.hash
                    router.push(`/auth/login?next=${encodeURIComponent(next)}`)
                    return
                  }
                  if (providerData.whatsapp) {
                    if (providerIdNum) {
                      void InsightsService.trackContactClick({
                        providerId: providerIdNum,
                        channel: 'whatsapp',
                        city: providerData.city,
                        category: typeof primaryCategoryValue === 'string' ? primaryCategoryValue : undefined,
                        userId: user?.id ?? undefined,
                      })
                    }
                    const message = encodeURIComponent("Hola 👋, te contacto desde miservicio. Vi tu perfil y me interesa tu servicio, quería hacerte una consulta rápida.")
                    window.open(`https://wa.me/${providerData.whatsapp}?text=${message}`, "_blank")
                  }
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar por WhatsApp
              </Button>
            )}
          </div>
        )
      }

      {/* Render ChatRoom at the end */}
      {isChatOpen && (
        <ChatRoom
          conversationId={chatConversationId}
          currentUserId={user?.id || 0}
          provider={chatOtherUser || {
            name: `${providerData.firstName} ${providerData.lastName}`,
            avatar: providerData.avatar,
            profession: providerData.category
          }}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onMessageSent={(content) => {
            // Update conversation list optimistically
            setConversations(prev => {
              const existingConvIndex = prev.findIndex(c => c.id === chatConversationId);
              if (existingConvIndex !== -1) {
                const updatedConv = {
                  ...prev[existingConvIndex],
                  lastMessage: {
                    content,
                    createdAt: new Date().toISOString(),
                    senderId: user?.id || 0
                  },
                  updatedAt: new Date().toISOString(),
                  unreadCount: 0 // Asegurar que se mantenga en 0
                };
                const newConvs = [...prev];
                newConvs.splice(existingConvIndex, 1);
                return [updatedConv, ...newConvs];
              }
              return prev;
            });
          }}
        />
      )}
    </div >
  )
}

function EditProviderForm({ initial, onSaved }: { initial: any; onSaved: () => void }) {
  const [form, setForm] = useState<any>({
    first_name: initial?.first_name || '',
    last_name: initial?.last_name || '',
    contact_email: initial?.contact_email || '',
    phone_e164: initial?.phone_e164 || '',
    whatsapp_e164: initial?.whatsapp_e164 || '',
    description: initial?.description || '',
    province: initial?.province || '',
    city: initial?.city || '',
    years_experience: initial?.years_experience || 0,
    emergency_available: !!initial?.emergency_available,
    is_licensed: !!initial?.is_licensed,
    price_hint: initial?.price_hint || undefined,
    category_ids: initial?.categories?.map((c: any) => c.id) || initial?.category_id ? [initial.category_id] : [],
  })
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initial?.avatar_url || null)
  const [categories, setCategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const { toast } = useToast()

  // Cargar categorías disponibles
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true)
        const cats = await ProvidersService.getCategories()
        setCategories(cats)
      } catch (e) {
        console.error('Error loading categories:', e)
        toast({ title: 'Error', description: 'No se pudieron cargar las categorías' })
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [toast])

  async function save() {
    if (form.category_ids.length === 0) {
      toast({ title: 'Error', description: 'Seleccioná al menos una categoría' })
      return
    }

    try {
      setSaving(true)
      await ProvidersService.updateMyProviderProfile(form)
      toast({ title: 'Perfil actualizado' })
      onSaved()
    } catch (e: any) {
      let msg = 'No se pudo actualizar el perfil'
      try { msg = JSON.parse(e?.message)?.error?.message || msg } catch { }
      toast({ title: 'Error', description: msg })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Avatar */}
      <div className="flex items-center gap-3">
        <img
          src={avatarPreview || '/placeholder.svg'}
          alt="Avatar"
          className="h-16 w-16 rounded-full object-cover border"
        />
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0] || null
              setAvatarFile(f)
              if (f) setAvatarPreview(URL.createObjectURL(f))
            }}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                if (!avatarFile) { toast({ title: 'Elegí una imagen' }); return }
                try {
                  setSaving(true)
                  await ProvidersService.uploadMyAvatar(avatarFile)
                  toast({ title: 'Foto actualizada' })
                  onSaved()
                } catch (e: any) {
                  let msg = 'No se pudo subir la foto'
                  try { msg = JSON.parse(e?.message)?.error?.message || msg } catch { }
                  toast({ title: 'Error', description: msg })
                } finally {
                  setSaving(false)
                }
              }}
            >Subir</Button>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                try {
                  setSaving(true)
                  await ProvidersService.deleteMyAvatar()
                  setAvatarPreview(null)
                  toast({ title: 'Foto eliminada' })
                  onSaved()
                } catch (e: any) {
                  let msg = 'No se pudo eliminar la foto'
                  try { msg = JSON.parse(e?.message)?.error?.message || msg } catch { }
                  toast({ title: 'Error', description: msg })
                } finally {
                  setSaving(false)
                }
              }}
            >Eliminar</Button>
          </div>
        </div>
      </div>

      {/* Selección de categorías */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#111827]">Categorías de servicios</label>
        {loadingCategories ? (
          <p className="text-sm text-[#6B7280]">Cargando categorías...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <input
                  id={`category-${cat.id}`}
                  type="checkbox"
                  checked={form.category_ids.includes(cat.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setForm({ ...form, category_ids: [...form.category_ids, cat.id] })
                    } else {
                      setForm({ ...form, category_ids: form.category_ids.filter((id: number) => id !== cat.id) })
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <label htmlFor={`category-${cat.id}`} className="text-sm text-[#111827] cursor-pointer">
                  {cat.name}
                </label>
              </div>
            ))}
          </div>
        )}
        {form.category_ids.length === 0 && (
          <p className="text-sm text-red-600">Seleccioná al menos una categoría</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input placeholder="Nombre" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
        <Input placeholder="Apellido" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
        <Input placeholder="Email de contacto" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
        <Input placeholder="Teléfono" value={form.phone_e164} onChange={(e) => setForm({ ...form, phone_e164: e.target.value })} />
        <Input placeholder="WhatsApp" value={form.whatsapp_e164} onChange={(e) => setForm({ ...form, whatsapp_e164: e.target.value })} />
        <Input placeholder="Provincia" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
        <Input placeholder="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <Input type="number" min={0} max={80} placeholder="Años de experiencia" value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: Number(e.target.value) })} />
        <Input type="number" min={0} placeholder="Precio orientativo" value={form.price_hint ?? ''} onChange={(e) => setForm({ ...form, price_hint: Number(e.target.value) || undefined })} />
        <div className="flex items-center gap-2">
          <input id="is_licensed" type="checkbox" checked={!!form.is_licensed} onChange={(e) => setForm({ ...form, is_licensed: e.target.checked })} />
          <label htmlFor="is_licensed" className="text-sm text-[#111827]">Profesional matriculado</label>
        </div>
      </div>
      <Textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onSaved()}>Cerrar</Button>
        <Button className="bg-[#2563EB] text-white" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</Button>
      </div>
    </div>
  )
}

function AvailabilityEditor({ initial, onSave, saving }: { initial: { businessHours: any, emergencyAvailable: boolean }, onSave: (payload: { businessHours: any, emergencyAvailable: boolean }) => Promise<void> | void, saving?: boolean }) {
  const [emergency, setEmergency] = useState<boolean>(!!initial?.emergencyAvailable)
  const [days, setDays] = useState<Record<string, { enabled: boolean, start: string, end: string }>>(() => {
    const bh = initial?.businessHours || { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }
    const toHHMM = (m: number) => {
      const h = String(Math.floor(m / 60)).padStart(2, '0');
      const mi = String(m % 60).padStart(2, '0');
      return `${h}:${mi}`
    }
    const getFirst = (arr: any[]) => Array.isArray(arr) && arr[0] ? { enabled: true, start: toHHMM(arr[0].start), end: toHHMM(arr[0].end) } : { enabled: false, start: '08:00', end: '18:00' }
    return {
      mon: getFirst(bh.mon),
      tue: getFirst(bh.tue),
      wed: getFirst(bh.wed),
      thu: getFirst(bh.thu),
      fri: getFirst(bh.fri),
      sat: getFirst(bh.sat),
      sun: getFirst(bh.sun),
    }
  })

  const labels: Record<string, string> = { mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes', sat: 'Sábado', sun: 'Domingo' }

  function timeToMinutes(t: string): number { const [h, m] = t.split(':').map(Number); return Math.max(0, Math.min(1440, (h * 60) + (m || 0))) }

  async function handleSave() {
    const bh: any = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }
    for (const k of Object.keys(bh)) {
      const d = (days as any)[k]
      if (d && d.enabled) {
        const start = timeToMinutes(d.start)
        const end = timeToMinutes(d.end)
        if (start >= end) {
          toast.error(`Revisá ${labels[k]}: la hora de inicio debe ser menor que la de fin`)
          return
        }
        bh[k] = [{ start, end }]
      }
    }
    await onSave({ businessHours: bh, emergencyAvailable: emergency })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input id="emergency" type="checkbox" checked={emergency} onChange={(e) => setEmergency(e.target.checked)} />
        <label htmlFor="emergency" className="text-sm text-[#111827]">Ofrezco urgencias (atiendo rápido)</label>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {Object.keys(labels).map((k) => (
          <div key={k} className="flex items-center gap-3">
            <div className="w-24 text-sm text-[#111827]">{labels[k]}</div>
            <input type="checkbox" aria-label={`Habilitar ${labels[k]}`} checked={days[k].enabled} onChange={(e) => setDays(prev => ({ ...prev, [k]: { ...prev[k], enabled: e.target.checked } }))} />
            <input type="time" aria-label={`Hora inicio ${labels[k]}`} value={days[k].start} onChange={(e) => setDays(prev => ({ ...prev, [k]: { ...prev[k], start: e.target.value } }))} className="border rounded px-2 py-1" />
            <span className="text-[#6B7280]">a</span>
            <input type="time" aria-label={`Hora fin ${labels[k]}`} value={days[k].end} onChange={(e) => setDays(prev => ({ ...prev, [k]: { ...prev[k], end: e.target.value } }))} className="border rounded px-2 py-1" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={() => handleSave()} disabled={!!saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
      </div>
    </div>
  )
}

