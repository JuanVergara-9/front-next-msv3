"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { BottomNavBar } from "@/components/BottomNavBar"
import { ProvidersService } from "@/lib/services/providers.service"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Plus, Search, MapPin, Clock, Camera } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Link from "next/link"
import { OrdersService, Order, Postulation } from "@/lib/services/orders.service"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


// Postulation Modal Component
const PostulationModal = ({
    job,
    isOpen,
    onClose,
    onSubmit,
    remainingSlots
}: {
    job: any,
    isOpen: boolean,
    onClose: () => void,
    onSubmit: (data: { message: string, budget?: number }) => void,
    remainingSlots: number
}) => {
    const [message, setMessage] = useState("")
    const [budget, setBudget] = useState("")
    const QUICK_REPLIES = [
        "Puedo pasar a verlo hoy mismo sin compromiso.",
        "Tengo los materiales disponibles para arrancar ya.",
        "Cuento con herramientas propias y experiencia en esto.",
        "El presupuesto incluye mano de obra y materiales básicos."
    ]

    const isBlocked = remainingSlots <= 0

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        Postularme a: <span className="text-primary">{job?.title}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Slots Indicator */}
                    <div className={`p-4 rounded-2xl flex items-center justify-between ${isBlocked ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            <span className="font-bold">{isBlocked ? 'Sin cupos disponibles' : 'Cupos de postulación'}</span>
                        </div>
                        <div className="flex gap-1">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${i <= remainingSlots ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {isBlocked ? (
                        <div className="bg-muted p-6 rounded-2xl text-center">
                            <p className="text-muted-foreground mb-4">Ya tenés 3 postulaciones activas. Debes esperar a que los clientes respondan o que los pedidos expiren para postularte a nuevos trabajos.</p>
                            <Button variant="outline" className="w-full" onClick={onClose}>Entendido</Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Tu presupuesto (Opcional)</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                                        <Input
                                            id="budget"
                                            placeholder="Ej: 15000"
                                            className="pl-8 h-12 rounded-xl"
                                            type="number"
                                            value={budget}
                                            onChange={(e) => setBudget(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Tu mensaje para el cliente</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Contale por qué sos la mejor opción..."
                                        className="min-h-[120px] rounded-xl resize-none"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </div>

                                {/* Quick Replies */}
                                <div className="flex flex-wrap gap-2">
                                    {QUICK_REPLIES.map((reply, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setMessage(prev => (prev ? prev + " " + reply : reply))}
                                            className="text-[10px] md:text-xs bg-slate-100 hover:bg-primary/10 text-slate-900 font-bold px-3 py-1.5 rounded-full transition-colors border border-slate-300"
                                        >
                                            + {reply}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={onClose}>Cancelar</Button>
                                <Button
                                    className="flex-1 h-12 rounded-xl bg-primary text-white font-bold"
                                    onClick={() => onSubmit({ message, budget: budget ? Number(budget) : undefined })}
                                    disabled={!message.trim()}
                                >
                                    Confirmar Postulación
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function PedidosPage() {
    const { user, isProvider } = useAuth()
    const [city, setCity] = useState<string>("San Rafael, Mendoza")
    const [activeTab, setActiveTab] = useState(isProvider ? "feed" : "mis-pedidos")
    const [feedOrders, setFeedOrders] = useState<Order[]>([])
    const [myOrders, setMyOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedJob, setSelectedJob] = useState<any>(null)
    const [isPostulating, setIsPostulating] = useState(false)
    const [remainingSlots, setRemainingSlots] = useState(3)

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true)
            try {
                // Location
                const location = await ProvidersService.getCurrentLocation()
                const cityName = await ProvidersService.getCityFromCoords(location.lat, location.lng)
                setCity(cityName || "San Rafael, Mendoza")

                // Feed if provider
                if (isProvider) {
                    const feed = await OrdersService.getFeed()
                    setFeedOrders(feed)

                    // Count active postulations
                    // Extract from my postulations if we had a dedicated endpoint, 
                    // for now calculating from 3 - count of 'SENT' but we don't have all postulations here.
                    // The backend will enforce it anyway.
                }

                // Customer orders
                const mine = await OrdersService.getMyOrders()
                setMyOrders(mine)
            } catch (err) {
                console.error("Error loading data:", err)
            } finally {
                setLoading(false)
            }
        }
        loadInitialData()
    }, [isProvider])

    const handlePostulate = (job: any) => {
        setSelectedJob(job)
        setIsPostulating(true)
    }

    const handleSubmitPostulation = async (data: { message: string, budget?: number }) => {
        try {
            await OrdersService.postulate(selectedJob.id, data)
            toast.success("¡Postulación enviada correctamente!")
            setIsPostulating(false)
            setRemainingSlots(prev => prev - 1)
            // Refresh feed
            const feed = await OrdersService.getFeed()
            setFeedOrders(feed)
        } catch (err: any) {
            toast.error(err.message || "Error al enviar la postulación.")
        }
    }

    const handleAcceptPostulation = async (orderId: number, postulationId: number) => {
        try {
            await OrdersService.acceptPostulation(orderId, postulationId)
            toast.success("¡Propuesta aceptada! El profesional ha sido notificado.")
            // Refresh my orders
            const mine = await OrdersService.getMyOrders()
            setMyOrders(mine)
        } catch (err: any) {
            toast.error(err.message || "Error al aceptar la propuesta.")
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col pb-20 sm:pb-0 underline-offset-4">
            <Header city={city} />

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-extrabold text-foreground mb-2">Tablero de Pedidos</h1>
                    <p className="text-muted-foreground">Gestioná tus solicitudes o encontrá nuevas oportunidades de trabajo.</p>
                </header>

                <Tabs
                    defaultValue={isProvider ? "feed" : "mis-pedidos"}
                    className="w-full"
                    onValueChange={setActiveTab}
                    value={activeTab}
                >
                    <div className="flex items-center justify-between mb-6">
                        {isProvider ? (
                            <TabsList className="grid grid-cols-2 w-full sm:w-[400px]">
                                <TabsTrigger value="feed" className="flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    Explorar Trabajos
                                </TabsTrigger>
                                <TabsTrigger value="mis-pedidos" className="flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4" />
                                    Mis Pedidos
                                </TabsTrigger>
                            </TabsList>
                        ) : (
                            <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-4 py-2 rounded-xl">
                                <ClipboardList className="w-5 h-5" />
                                <span>Mis Pedidos</span>
                            </div>
                        )}

                        {activeTab === "mis-pedidos" && (
                            <Link href="/pedidos/nuevo" className="hidden sm:block">
                                <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    <span>Nuevo Pedido</span>
                                </Button>
                            </Link>
                        )}
                    </div>

                    {isProvider && (
                        <TabsContent value="feed" className="space-y-6">
                            {/* Summary for Professionals */}
                            <div className="flex flex-col md:flex-row gap-4 mb-8">
                                <Card className="flex-1 bg-primary/5 border-primary/20">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-4 text-primary">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold">Trabajos en {city.split(',')[0]}</h3>
                                                <p className="text-sm opacity-80">Hay pedidos activos esperándote.</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Slots Counter in Feed */}
                                <Card className="bg-card border-border/50">
                                    <CardContent className="pt-6 flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider text-right">Cupos disponibles</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-black text-foreground">{remainingSlots} / 3</span>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className={`w-2 h-2 rounded-full ${i <= remainingSlots ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid gap-4">
                                {feedOrders.length > 0 ? (
                                    feedOrders.map((job) => (
                                        <motion.div
                                            key={job.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ scale: 1.005 }}
                                        >
                                            <Card className="overflow-hidden hover:shadow-lg transition-all border-border/50 premium-shadow">
                                                <div className="flex flex-col md:flex-row">
                                                    <div className="w-full md:w-56 h-40 bg-muted relative overflow-hidden group">
                                                        {job.images && job.images[0] ? (
                                                            <img src={job.images[0]} alt={job.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                                                <Camera className="w-8 h-8 opacity-20" />
                                                            </div>
                                                        )}
                                                        <Badge className="absolute top-2 left-2 bg-primary text-white premium-shadow">
                                                            {job.category?.name}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex-1 p-6">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h3 className="text-2xl font-black text-[#0e315d] group-hover:text-primary transition-colors leading-tight">{job.title}</h3>
                                                            <Badge variant={job.status === "PENDING" ? "default" : "secondary"} className="font-bold">
                                                                {job.status === "PENDING" ? "Abierto" : "En negociación"}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-foreground font-medium text-sm line-clamp-2 mb-4">{job.description}</p>
                                                        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#0e315d] font-bold">
                                                            <span className="flex items-center gap-1.5">
                                                                <MapPin className="w-4 h-4 text-primary" />
                                                                {city.split(',')[0]}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock className="w-4 h-4 text-primary" />
                                                                Recién publicado
                                                            </span>
                                                            {job.budget_estimate && (
                                                                <span className="text-2xl font-black text-primary bg-primary/5 px-3 py-1 rounded-xl border border-primary/20 shadow-sm">${job.budget_estimate}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="p-6 bg-muted/30 border-t md:border-t-0 md:border-l border-border/50 flex flex-row md:flex-col justify-center gap-3">
                                                        <Button
                                                            className="flex-1 md:w-36 h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg"
                                                            onClick={() => handlePostulate(job)}
                                                            disabled={job.status !== 'PENDING' && job.status !== 'MATCHED'}
                                                        >
                                                            Postularme
                                                        </Button>
                                                        <Button variant="ghost" className="flex-1 md:w-36 h-12 font-medium">Ver detalles</Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-16 bg-muted/20 rounded-[32px] border-2 border-dashed border-border/50">
                                        <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-10" />
                                        <h3 className="text-xl font-bold mb-2">No hay pedidos en tu zona por ahora</h3>
                                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                            Te avisaremos apenas alguien publique un pedido que coincida con tu rubro.
                                        </p>
                                        <Button variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary/5">
                                            Activar notificaciones
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    )}

                    <TabsContent value="mis-pedidos">
                        {myOrders.length > 0 ? (
                            <div className="grid gap-6">
                                {myOrders.map((order) => (
                                    <Card key={order.id} className="overflow-hidden border-border/50">
                                        <CardHeader className="bg-muted/30">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-xl">{order.title}</CardTitle>
                                                    <CardDescription>
                                                        Publicado el {new Date(order.created_at).toLocaleDateString()} • {order.category?.name}
                                                    </CardDescription>
                                                </div>
                                                <Badge variant={order.status === 'IN_PROGRESS' ? 'success' : 'default' as any}>
                                                    {order.status === 'PENDING' ? 'Buscando profesionales' :
                                                        order.status === 'MATCHED' ? 'Propuestas recibidas' :
                                                            order.status === 'IN_PROGRESS' ? 'En curso' : 'Completado'}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <p className="text-sm text-muted-foreground mb-6">{order.description}</p>

                                            <div className="space-y-4">
                                                <h4 className="font-bold flex items-center gap-2">
                                                    <Plus className="w-4 h-4 text-primary" />
                                                    Propuestas ({order.postulations?.length || 0})
                                                </h4>

                                                {order.postulations && order.postulations.length > 0 ? (
                                                    <div className="grid gap-3">
                                                        {order.postulations.map((p) => (
                                                            <div key={p.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 justify-between items-center transition-all ${p.status === 'ACCEPTED' ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card border-border/50'}`}>
                                                                <div className="flex items-center gap-4 flex-1">
                                                                    <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                                                                        <AvatarImage src={p.provider?.avatar_url} />
                                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                                            {p.provider?.first_name?.[0]}{p.provider?.last_name?.[0]}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <p className="font-black text-lg text-[#0e315d]">{p.provider?.first_name} {p.provider?.last_name}</p>
                                                                        <p className="text-sm text-foreground/80 line-clamp-2 italic font-medium">"{p.message}"</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-6">
                                                                    {p.budget && (
                                                                        <div className="text-right">
                                                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Presupuesto</p>
                                                                            <p className="font-black text-primary">${p.budget}</p>
                                                                        </div>
                                                                    )}

                                                                    {order.status !== 'IN_PROGRESS' && order.status !== 'COMPLETED' ? (
                                                                        <Button
                                                                            size="sm"
                                                                            className="rounded-xl px-6 bg-primary text-white font-bold"
                                                                            onClick={() => handleAcceptPostulation(order.id, p.id)}
                                                                        >
                                                                            Aceptar
                                                                        </Button>
                                                                    ) : p.status === 'ACCEPTED' && (
                                                                        <Badge className="bg-primary text-white">Elegido</Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="bg-muted/30 p-8 rounded-2xl text-center">
                                                        <p className="text-sm text-muted-foreground">Estamos buscando a los profesionales ideales cerca tuyo. Te avisaremos apenas alguien se postule.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-muted/20 rounded-[32px] border-2 border-dashed border-border/50">
                                <ClipboardList className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-20" />
                                <h3 className="text-2xl font-bold mb-3">No tenés pedidos activos</h3>
                                <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-lg leading-relaxed">
                                    ¿Necesitás resolver algo? Publicá tu pedido y recibí presupuestos de profesionales locales.
                                </p>
                                <Link href="/pedidos/nuevo">
                                    <Button className="bg-primary text-white scale-110 h-14 px-10 rounded-2xl font-extrabold text-xl premium-shadow-lg active:scale-95 transition-all">
                                        Publicar mi primer pedido
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <PostulationModal
                    job={selectedJob}
                    isOpen={isPostulating}
                    onClose={() => setIsPostulating(false)}
                    onSubmit={handleSubmitPostulation}
                    remainingSlots={remainingSlots}
                />
            </main>

            <div className="sm:hidden">
                <BottomNavBar />
            </div>
        </div>
    )
}
