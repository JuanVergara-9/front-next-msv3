"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MapPin, Camera, AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import toast from "react-hot-toast"

const CATEGORIES = [
    "Gasista", "Plomería", "Electricista", "Pintura", "Carpintería",
    "Reparación de Electrodomésticos", "Construcción", "Limpieza", "Jardinería", "Informática"
]

export default function NuevoPedidoPage() {
    const [loading, setLoading] = useState(false)
    const [gettingLocation, setGettingLocation] = useState(false)
    const [city, setCity] = useState("San Rafael, Mendoza")

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        lat: null as number | null,
        lng: null as number | null,
        locationName: "",
        photos: [] as File[]
    })

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.lat || !formData.lng) {
            toast.error("Es obligatorio incluir la ubicación exacta del pedido.")
            return
        }

        setLoading(true)
        // Simulación de envío
        setTimeout(() => {
            setLoading(false)
            toast.success("¡Pedido publicado! Estamos buscando profesionales cerca tuyo.")
            // Redirigir a mis pedidos
            window.location.href = "/pedidos"
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-muted/30 pb-12">
            <Header city={city} />

            <main className="max-w-3xl mx-auto px-4 py-8">
                <Link href="/pedidos" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Pedidos
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="premium-shadow-lg border-none">
                        <CardHeader className="bg-primary text-primary-foreground rounded-t-3xl pt-8 pb-10">
                            <CardTitle className="text-2xl font-bold">Publicar Nueva Necesidad</CardTitle>
                            <CardDescription className="text-primary-foreground/80">
                                Describí lo que necesitás y los profesionales de tu zona se postularán.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 -mt-6 bg-card rounded-3xl">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">¿Qué necesitás hoy? (Título)</Label>
                                    <Input
                                        id="title"
                                        placeholder="Ej: Reparar goteo bajo bacha de cocina"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="h-12 rounded-xl"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Oficio / Rubro</Label>
                                        <Select required onValueChange={val => setFormData({ ...formData, category: val })}>
                                            <SelectTrigger className="h-12 rounded-xl">
                                                <SelectValue placeholder="Seleccioná una categoría" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Ubicación del Pedido</Label>
                                        {formData.lat ? (
                                            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl border border-green-200">
                                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                                <span className="text-sm font-medium truncate">{formData.locationName}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setFormData({ ...formData, lat: null, lng: null })}
                                                    className="ml-auto text-xs"
                                                >
                                                    Cambiar
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleGetLocation}
                                                disabled={gettingLocation}
                                                className="w-full h-12 rounded-xl border-dashed flex items-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
                                            >
                                                {gettingLocation ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                )}
                                                {gettingLocation ? "Obteniendo ubicación..." : "Usar mi ubicación actual (GPS)"}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Detalles de la tarea</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Explicá lo más detallado posible el problema para recibir presupuestos exactos..."
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="rounded-xl resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Fotos (Opcional)</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <label className="border-2 border-dashed border-border rounded-2xl aspect-square flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted/50 transition-colors">
                                            <Camera className="w-8 h-8 text-muted-foreground opacity-50" />
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Subir</span>
                                            <input type="file" className="hidden" accept="image/*" multiple />
                                        </label>
                                    </div>
                                </div>

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
                                    <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
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
