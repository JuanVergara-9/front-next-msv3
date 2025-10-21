"use client"

import { useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
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
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { ReviewsService, type ReviewItem } from "@/lib/services/reviews.service"
import { ProvidersService } from "@/lib/services/providers.service"
import { Header } from "@/components/Header"

interface ProviderProfilePageProps {
  providerProfile?: any
}

export function ProviderProfilePage({ providerProfile: propProviderProfile }: ProviderProfilePageProps) {
  const { user, logout } = useAuth()
  const isOwner = !!user && !!propProviderProfile && Number(user.id) === Number(propProviderProfile.user_id)
  const { toast } = useToast()
  const [reviews, setReviews] = useState<ReviewItem[]>([])
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
  const maxCommentLength = 2000
  const maxPhotos = 6

  function isValidUrl(url: string): boolean {
    try {
      const u = new URL(url)
      return u.protocol === 'http:' || u.protocol === 'https:'
    } catch {
      return false
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
      profile.categories.forEach(cat => {
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
      ratingAvg: profile.rating || 4.5,
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

  useEffect(() => {
    let cancelled = false
    async function loadReviews() {
      if (!providerIdNum) return
      try {
        setLoadingReviews(true)
        const [list, summary] = await Promise.all([
          ReviewsService.listByProvider(providerIdNum, { limit: 20, offset: 0 }),
          ReviewsService.getSummary(providerIdNum),
        ])
        if (cancelled) return
        setReviews(list.items || [])
        setReviewsCount(summary.summary.count || list.count || 0)
        setAvgRating(summary.summary.avgRating || 0)
        setPhotosRate(summary.summary.photosRate || 0)
      } catch (e) {
        // Silenciar en UI, opcionalmente loguear
        console.warn('Error loading reviews', e)
      } finally {
        if (!cancelled) setLoadingReviews(false)
      }
    }
    loadReviews()
    return () => {
      cancelled = true
    }
  }, [providerIdNum])

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
      await ReviewsService.create({ providerId: providerIdNum, rating: newRating, comment: newComment || undefined, photos: photoUrls.length ? photoUrls : undefined })
      toast({ title: "¡Gracias!", description: "Tu reseña fue enviada" })
      setIsDialogOpen(false)
      setNewRating(0)
      setNewComment("")
      setPhotoUrls([])
      // recargar
      const [list, summary] = await Promise.all([
        ReviewsService.listByProvider(providerIdNum, { limit: 20, offset: 0 }),
        ReviewsService.getSummary(providerIdNum),
      ])
      setReviews(list.items || [])
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
      } catch {}
      toast({ title: 'Error', description: message })
    } finally {
      setSubmitting(false)
    }
  }

  if (!providerData) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2F66F5] via-[#3b82f6] to-[#2563EB]">
      <Header city={`${providerData.city}, ${providerData.province}`} />

      <div className="glass-effect min-h-[calc(100vh-80px)]">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header Principal */}
        <Card className="rounded-2xl shadow-xl border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
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
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-[#111827] text-balance">
                      {providerData.firstName} {providerData.lastName}
                    </h1>
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                      {providerData.categories && providerData.categories.length > 0 ? (
                        providerData.categories.map((cat: any, index: number) => (
                          <Badge key={cat.id || index} className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                            <Wrench className="h-4 w-4 mr-1" />
                            {cat.name}
                          </Badge>
                        ))
                      ) : (
                        <Badge className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
                          <Wrench className="h-4 w-4 mr-1" />
                          {providerData.category}
                        </Badge>
                      )}
                      {providerData.isLicensed && (
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          <BadgeCheck className="h-3 w-3 mr-1" />
                          Matriculado
                        </Badge>
                      )}
                      {providerData.isVerified && (
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          <Shield className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                      {providerData.emergencyAvailable && (
                        <Badge variant="outline" className="border-orange-500 text-orange-700">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Atiende urgencias
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 text-[#6B7280] flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {providerData.city}, {providerData.province}
                        </span>
                      </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full w-fit">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold text-[#111827]">{Number(avgRating || providerData.ratingAvg).toFixed(1)}</span>
                      <span className="text-[#6B7280]">· {reviewsCount || providerData.reviewsCount90d} reseñas</span>
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:w-64">
                {!isOwner && (
                  <>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                      onClick={() => {
                        if (providerData.whatsapp) {
                          const message = encodeURIComponent("Hola 👋, te contacto desde miservicio. Vi tu perfil y me interesa tu servicio, quería hacerte una consulta rápida.")
                          window.open(`https://wa.me/${providerData.whatsapp}?text=${message}`, "_blank")
                        }
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contactar por WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white bg-transparent"
                      onClick={() => {
                        if (providerData.phone) {
                          window.open(`tel:${providerData.phone}`, "_blank")
                        }
                      }}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Llamar
                    </Button>
                    <Button variant="outline">Enviar consulta</Button>
                  </>
                )}
                {isOwner && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-lg">Editar perfil</Button>
                    </DialogTrigger>
                    <DialogContent aria-describedby={undefined} className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Editar perfil</DialogTitle>
                      </DialogHeader>
                      <EditProviderForm initial={propProviderProfile} onSaved={() => window.location.reload()} />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de contenido */}
        <Tabs defaultValue="informacion" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-xl shadow-lg">
            <TabsTrigger
              value="informacion"
              className="data-[state=active]:bg-[#2563EB] data-[state=active]:text-white"
            >
              Información
            </TabsTrigger>
            <TabsTrigger value="resenas" className="data-[state=active]:bg-[#2563EB] data-[state=active]:text-white">
              Reseñas
            </TabsTrigger>
            <TabsTrigger value="galeria" className="data-[state=active]:bg-[#2563EB] data-[state=active]:text-white">
              Galería
            </TabsTrigger>
          </TabsList>

          <TabsContent value="informacion" className="space-y-6">
            {/* Descripción */}
            <Card className="rounded-2xl shadow-lg border-0">
              <CardHeader>
                <h2 className="text-xl font-semibold text-[#111827]">Descripción</h2>
              </CardHeader>
              <CardContent>
                <p className="text-[#6B7280] leading-relaxed">{providerData.description}</p>
              </CardContent>
            </Card>

            {/* Servicios y precios — ocultado por pedido del producto */}

            {/* Disponibilidad y zona */}
            <Card className="rounded-2xl shadow-lg border-0">
              <CardHeader>
                <h2 className="text-xl font-semibold text-[#111827]">Disponibilidad y zona</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-[#111827] mb-2">Horarios</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Lun-Vie 8:00-18:00</Badge>
                      <Badge variant="outline">Sáb 9:00-13:00</Badge>
                      <Badge variant="outline">Urgencias 24hs</Badge>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#111827] mb-2">Zona de trabajo</h3>
                    <p className="text-[#6B7280]">Opera en San Rafael y alrededores (radio de 20km)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card className="rounded-2xl shadow-lg border-0">
              <CardHeader>
                <h2 className="text-xl font-semibold text-[#111827]">Información</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-[#6B7280]" />
                    <div>
                      <p className="text-sm text-[#6B7280]">Años de experiencia</p>
                      <p className="font-semibold text-[#111827]">{providerData.yearsExperience} años</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-[#6B7280]" />
                    <div>
                      <p className="text-sm text-[#6B7280]">Medios de pago</p>
                      <p className="font-semibold text-[#111827]">Efectivo, Transferencia</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#6B7280]" />
                    <div>
                      <p className="text-sm text-[#6B7280]">Miembro desde</p>
                      <p className="font-semibold text-[#111827]">{providerData.memberSince}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resenas" className="space-y-6">
            {/* Resumen de reseñas */}
            <Card className="rounded-2xl shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#111827]">{providerData.ratingAvg}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-[#6B7280] mt-1">{providerData.reviewsCount90d} reseñas (90 días)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#6B7280]">{photosRate}% con fotos</p>
                    <p className="text-sm text-[#6B7280]">Reseñas (90 días): {reviewsCount}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="border-[#2563EB] text-[#2563EB]">
                    Todas
                  </Badge>
                  <Badge variant="outline">Con fotos</Badge>
                  <Badge variant="outline">★ 5</Badge>
                  <Badge variant="outline">★ 1-2</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Lista de reseñas */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="rounded-2xl shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={"/placeholder.svg"} alt="Usuario" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-[#111827]">Usuario</span>
                          <span className="text-sm text-[#6B7280]">{new Date(review.created_at).toLocaleDateString()}</span>
                          {(review.photos && review.photos.length > 0) && <Camera className="h-4 w-4 text-[#6B7280]" />}
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
                          <p className="text-[#6B7280] leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!loadingReviews && reviews.length === 0 && (
                <p className="text-center text-[#6B7280]">Aún no hay reseñas</p>
              )}
            </div>

            {/* Crear reseña */}
            {user ? (
              <div className="text-center">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white">Escribir una reseña</Button>
                  </DialogTrigger>
                  <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                      <DialogTitle>Escribir una reseña</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        {[1,2,3,4,5].map((s) => (
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
                        <label className="block text-sm font-medium text-[#111827]">Fotos (URLs, opcional)</label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={newPhotoUrl}
                            onChange={(e) => setNewPhotoUrl(e.target.value)}
                            placeholder="https://ejemplo.com/foto.jpg"
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
                              if (photoUrls.length >= maxPhotos) {
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
                          >Agregar</Button>
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
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleSubmitReview}
                        disabled={submitting || !newRating}
                        className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
                      >
                        {submitting ? 'Enviando...' : 'Enviar reseña'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="text-center">
                <Button asChild className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white">
                  <a href="/auth/login">Iniciar sesión para escribir una reseña</a>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="galeria" className="space-y-6">
            <Card className="rounded-2xl shadow-lg border-0">
              <CardHeader>
                <h2 className="text-xl font-semibold text-[#111827]">Galería de trabajos</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {providerData.photos.map((photo: string, index: number) => (
                    <div key={index} className="aspect-video rounded-xl overflow-hidden shadow-lg">
                      <img
                        src={photo || "/placeholder.svg"}
                        alt={`Trabajo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sección de proveedores similares removida para evitar datos mock */}
        </div>
      </div>

      {/* Botón fijo en mobile: solo visible si NO es el dueño */}
      {!isOwner && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:hidden">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
            onClick={() => {
              if (providerData.whatsapp) {
                const message = encodeURIComponent("Hola 👋, te contacto desde miservicio. Vi tu perfil y me interesa tu servicio, quería hacerte una consulta rápida.")
                window.open(`https://wa.me/${providerData.whatsapp}?text=${message}`, "_blank")
              }
            }}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Contactar por WhatsApp
          </Button>
        </div>
      )}
    </div>
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
      try { msg = JSON.parse(e?.message)?.error?.message || msg } catch {}
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
                  try { msg = JSON.parse(e?.message)?.error?.message || msg } catch {}
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
                  try { msg = JSON.parse(e?.message)?.error?.message || msg } catch {}
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

