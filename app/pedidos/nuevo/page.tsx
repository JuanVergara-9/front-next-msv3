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
                const result = await ProvidersService.getCategories() as { items?: Category[] }
                setCategories(result.items || [])
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
                        locationName: "Ubicación exacta obtenida via GPS"
                    }))
                    setLocationMode('gps')
                    setGettingLocation(false)
                    toast.success("Ubicación obtenida correctamente")
                },
                (error) => {
                    console.error("Error getting location", error)
                    setGettingLocation(false)
                    toast.error("No se pudo obtener la ubicación. Por favor, permití el acceso al GPS.")
                },
                { enableHighAccuracy: true }
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

    // Common input styles with visible borders
    const inputStyles = "h-12 rounded-xl border-2 border-slate-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
    const textareaStyles = "rounded-xl border-2 border-slate-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all"

    return (
        <div className="min-h-screen bg-slate-100 pb-12">

            <main className="max-w-3xl mx-auto px-4 py-8">
                <Link href="/pedidos" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Pedidos
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="shadow-xl border-0 overflow-hidden">
                        <CardHeader className="bg-primary text-white rounded-t-2xl pt-8 pb-10">
                            <CardTitle className="text-2xl font-bold">Publicar Nueva Necesidad</CardTitle>
                            <CardDescription className="text-white/80">
                                Describí lo que necesitás y los profesionales de tu zona se postularán.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 -mt-6 bg-white rounded-t-3xl">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="font-semibold text-slate-700">¿Qué necesitás hoy? (Título)</Label>
                                    <Input
                                        id="title"
                                        placeholder="Ej: Reparar goteo bajo bacha de cocina"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className={inputStyles}
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="font-semibold text-slate-700">Oficio / Rubro</Label>
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
                                    <Label className="font-semibold text-slate-700">Ubicación del Pedido</Label>

                                    {!locationMode ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleGetLocation}
                                                disabled={gettingLocation}
                                                className="h-14 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-primary/50 text-slate-700 hover:text-primary flex items-center justify-center gap-2 transition-all"
                                            >
                                                {gettingLocation ? (
                                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                                ) : (
                                                    <MapPin className="w-5 h-5 text-primary" />
                                                )}
                                                <span className="font-medium">
                                                    {gettingLocation ? "Obteniendo..." : "Usar GPS"}
                                                </span>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleManualLocation}
                                                className="h-14 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-primary/50 text-slate-700 hover:text-primary flex items-center justify-center gap-2 transition-all"
                                            >
                                                <Edit3 className="w-5 h-5 text-primary" />
                                                <span className="font-medium">Ingresar manualmente</span>
                                            </Button>
                                        </div>
                                    ) : locationMode === 'gps' && formData.lat ? (
                                        <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-green-200 bg-green-50">
                                            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-green-700">Ubicación obtenida</p>
                                                <p className="text-sm text-green-600">{formData.locationName}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearLocation}
                                                className="text-green-700 hover:text-green-800 hover:bg-green-100"
                                            >
                                                Cambiar
                                            </Button>
                                        </div>
                                    ) : locationMode === 'manual' ? (
                                        <div className="space-y-4 p-4 rounded-xl border-2 border-slate-200 bg-slate-50">
                                            <div className="flex justify-between items-center">
                                                <p className="font-medium text-slate-700">Ingresá tu dirección</p>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={clearLocation}
                                                    className="text-slate-500 hover:text-slate-700"
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm text-slate-600">Provincia</Label>
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
                                                    <Label className="text-sm text-slate-600">Departamento / Ciudad</Label>
                                                    <Input
                                                        placeholder="Ej: San Rafael"
                                                        value={formData.department}
                                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                                        className={inputStyles}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm text-slate-600">Dirección (calle y número)</Label>
                                                <Input
                                                    placeholder="Ej: Av. San Martín 1234"
                                                    value={formData.address}
                                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                    className={inputStyles}
                                                />
                                            </div>
                                            {isLocationComplete && (
                                                <div className="flex items-center gap-2 text-green-600 pt-2">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Dirección completa</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="font-semibold text-slate-700">Detalles de la tarea</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Explicá lo más detallado posible el problema para recibir presupuestos exactos..."
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className={textareaStyles}
                                    />
                                </div>

                                {/* Photos */}
                                <div className="space-y-2">
                                    <Label className="font-semibold text-slate-700">Fotos (Opcional)</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <label className="border-2 border-dashed border-slate-300 rounded-2xl aspect-square flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 hover:border-primary/50 transition-all">
                                            <Camera className="w-8 h-8 text-slate-400" />
                                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Subir</span>
                                            <input type="file" className="hidden" accept="image/*" multiple />
                                        </label>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Publicando pedido...
                                            </div>
                                        ) : (
                                            "Publicar Pedido Ahora"
                                        )}
                                    </Button>
                                    <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Tu ubicación exacta solo será visible para los profesionales que se postulen.
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    )
}
