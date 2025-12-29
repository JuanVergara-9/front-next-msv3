"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MapPin, Camera, AlertCircle, CheckCircle2, ArrowLeft, Loader2, Edit3 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { OrdersService } from "@/lib/services/orders.service"
import { ProvidersService } from "@/lib/services/providers.service"
import { UploadService, UploadResult } from "@/lib/services/upload.service"
import { useRouter } from "next/navigation"

const PROVINCES = [
    "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
    "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones",
    "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe",
    "Santiago del Estero", "Tierra del Fuego", "Tucumán"
]

interface Category {
    id: number
    name: string
    slug: string
}

export default function NuevoPedidoPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [gettingLocation, setGettingLocation] = useState(false)
    const [locationMode, setLocationMode] = useState<'gps' | 'manual' | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [uploadedImages, setUploadedImages] = useState<UploadResult[]>([])
    const [uploadingImage, setUploadingImage] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category_id: null as number | null,
        lat: null as number | null,
        lng: null as number | null,
        locationName: "",
        province: "",
        department: "",
        address: "",
        photos: [] as File[]
    })

    // Fetch categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const result = await ProvidersService.getCategories()
                setCategories(result)
            } catch (error) {
                console.error('Error loading categories:', error)
            }
        }
        loadCategories()
    }, [])

    const handleGetLocation = () => {
        setGettingLocation(true)
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        locationName: "Ubicación obtenida via GPS"
                    }))
                    setLocationMode('gps')
                    setGettingLocation(false)
                    toast.success("Ubicación obtenida correctamente")
                },
                (error) => {
                    setGettingLocation(false)

                    let errorMessage = "No se pudo obtener la ubicación."
                    if (error.code === 1) {
                        errorMessage = "Permiso de ubicación denegado. Por favor, permití el acceso al GPS en la configuración del navegador."
                    } else if (error.code === 2) {
                        errorMessage = "No se pudo determinar la ubicación. Verificá que el GPS esté activado."
                    } else if (error.code === 3) {
                        errorMessage = "Tiempo de espera agotado. Intentá nuevamente o ingresá la ubicación manualmente."
                    }

                    toast.error(errorMessage)
                },
                {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 300000
                }
            )
        } else {
            setGettingLocation(false)
            toast.error("Tu navegador no soporta geolocalización")
        }
    }

    const handleManualLocation = () => {
        setLocationMode('manual')
    }

    const clearLocation = () => {
        setLocationMode(null)
        setFormData(prev => ({
            ...prev,
            lat: null,
            lng: null,
            locationName: "",
            province: "",
            department: "",
            address: ""
        }))
    }

    const isLocationComplete = locationMode === 'gps'
        ? formData.lat !== null
        : (locationMode === 'manual' && formData.province && formData.department && formData.address)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (uploadedImages.length + files.length > 4) {
            toast.error("Máximo 4 fotos por pedido");
            return;
        }

        setUploadingImage(true);
        try {
            for (const file of Array.from(files)) {
                const result = await UploadService.uploadOrderImage(file);
                setUploadedImages(prev => [...prev, result]);
            }
            toast.success("Foto(s) subida(s) correctamente");
        } catch (error: any) {
            toast.error(error.message || "Error al subir la foto");
        } finally {
            setUploadingImage(false);
            e.target.value = '';
        }
    };

    const handleRemoveImage = async (index: number) => {
        const image = uploadedImages[index];
        try {
            await UploadService.deleteOrderImage(image.public_id);
            setUploadedImages(prev => prev.filter((_, i) => i !== index));
        } catch (error: any) {
            console.error('Error deleting image:', error);
            setUploadedImages(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.category_id) {
            toast.error("Seleccioná una categoría")
            return
        }

        if (!isLocationComplete) {
            toast.error("Es obligatorio incluir la ubicación del pedido.")
            return
        }

        setLoading(true)
        try {
            // For manual location, we'll use approximate coordinates (could be improved with geocoding)
            let lat = formData.lat
            let lng = formData.lng

            // If manual mode, use default coordinates for now (TODO: implement geocoding)
            if (locationMode === 'manual' && !lat) {
                // Use a placeholder - in production, this should use a geocoding API
                lat = -34.6037
                lng = -68.3297
            }

            await OrdersService.createOrder({
                title: formData.title,
                description: formData.description,
                category_id: formData.category_id,
                lat: lat!,
                lng: lng!,
                images: uploadedImages.map(img => img.url),
            })

            toast.success("¡Pedido publicado! Estamos buscando profesionales cerca tuyo.")
            router.push("/pedidos")
        } catch (error: any) {
            console.error("Error creating order:", error)
            toast.error(error.message || "Error al publicar el pedido. Intenta de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    // Modern, clean input styles with lighter placeholders
    const inputStyles = "h-12 rounded-lg border-2 border-slate-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
    const textareaStyles = "rounded-lg border-2 border-slate-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"

    return (
        <div className="min-h-screen bg-white pb-32 md:pb-12">
            {/* Minimalist Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 h-16 flex items-center gap-3">
                <Link href="/pedidos" className="p-2 -ml-2 rounded-full hover:bg-slate-50 transition-colors text-slate-700">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-slate-900 leading-tight">Publicar Necesidad</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-5 py-6 space-y-8">
                {/* Intro Text - minimal */}
                <div className="space-y-1">
                    <p className="text-slate-500 text-sm">Describí lo que necesitás para recibir presupuestos.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Title */}
                    <div className="space-y-3">
                        <Label htmlFor="title" className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                            ¿Qué necesitás hoy?
                        </Label>
                        <Input
                            id="title"
                            placeholder="Ej: Reparar pérdida de agua en cocina"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className={inputStyles}
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-3">
                        <Label htmlFor="category" className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                            Rubro / Categoría
                        </Label>
                        <Select required onValueChange={val => setFormData({ ...formData, category_id: parseInt(val) })}>
                            <SelectTrigger className={inputStyles}>
                                <SelectValue placeholder="Seleccioná una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location Section */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                            Ubicación
                        </Label>

                        {!locationMode ? (
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGetLocation}
                                    disabled={gettingLocation}
                                    className="h-14 rounded-lg border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-primary/30 text-slate-700 hover:text-primary flex flex-col items-center justify-center gap-1 transition-all"
                                >
                                    {gettingLocation ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                    ) : (
                                        <MapPin className="w-5 h-5 text-primary" />
                                    )}
                                    <span className="text-xs font-bold">Usar GPS</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleManualLocation}
                                    className="h-14 rounded-lg border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-primary/30 text-slate-700 hover:text-primary flex flex-col items-center justify-center gap-1 transition-all"
                                >
                                    <Edit3 className="w-5 h-5 text-primary" />
                                    <span className="text-xs font-bold">Manual</span>
                                </Button>
                            </div>
                        ) : locationMode === 'gps' && formData.lat ? (
                            <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-green-100 bg-green-50/50">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-green-800 text-sm">Ubicación detectada</p>
                                    <p className="text-xs text-green-600 truncate">{formData.locationName}</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearLocation}
                                    className="text-green-700 hover:text-green-800 hover:bg-green-100 h-8 px-3 rounded-lg text-xs font-bold"
                                >
                                    Cambiar
                                </Button>
                            </div>
                        ) : locationMode === 'manual' ? (
                            <div className="space-y-4 p-5 rounded-xl border-2 border-slate-100 bg-slate-50/50">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-bold text-slate-700 text-sm">Ingresá tu dirección</p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearLocation}
                                        className="text-slate-400 hover:text-slate-600 h-6 px-2 text-xs"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase">Provincia</Label>
                                        <Select
                                            value={formData.province}
                                            onValueChange={val => setFormData({ ...formData, province: val, department: "" })}
                                        >
                                            <SelectTrigger className={inputStyles}>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PROVINCES.map(p => (
                                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase">Ciudad</Label>
                                        <Input
                                            placeholder="Ej: San Rafael"
                                            value={formData.department}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            className={inputStyles}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Dirección</Label>
                                    <Input
                                        placeholder="Ej: Av. San Martín 1234"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className={inputStyles}
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <Label htmlFor="description" className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                            Detalles
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Describí tu problema con el mayor detalle posible..."
                            required
                            rows={5}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className={textareaStyles}
                        />
                    </div>

                    {/* Photos Dropzone */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                            Fotos <span className="text-slate-400 font-medium normal-case">(Opcional)</span>
                        </Label>

                        <div className="grid grid-cols-3 gap-3">
                            {uploadedImages.map((img, idx) => (
                                <div key={img.public_id} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-slate-200">
                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(idx)}
                                        className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}

                            {uploadedImages.length < 4 && (
                                <label className={`col-span-1 aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-primary/50 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {uploadingImage ? (
                                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                    ) : (
                                        <>
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Camera className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Agregar</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        disabled={uploadingImage}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Bottom Sticky CTA */}
                    {/* Fixed position adjusted to bottom-16 to sit above bottom tab bar (approx 64px) */}
                    <div className="fixed bottom-[68px] left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-slate-100 z-40 md:relative md:bottom-0 md:bg-transparent md:border-0 md:p-0">
                        <div className="max-w-2xl mx-auto">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Procesando...</span>
                                    </div>
                                ) : (
                                    "Publicar Pedido Ahora"
                                )}
                            </Button>
                        </div>
                    </div>
                    {/* Padding for sticky footer overlap on mobile */}
                    <div className="h-12 md:hidden"></div>
                </form>
            </main>
        </div>
    )
}
