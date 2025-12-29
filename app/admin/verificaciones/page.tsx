"use client"
import { useEffect, useState } from "react"
import { ProvidersService } from "@/lib/services/providers.service"
import { Provider } from "@/types/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"
import { CheckCircle2, XCircle, User, ArrowLeft, Loader2, ShieldAlert } from "lucide-react"
import Link from "next/link"

export default function AdminVerificationsPage() {
  const [pending, setPending] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Provider | null>(null)
  const [reason, setReason] = useState("")
  const [processing, setProcessing] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await ProvidersService.getPendingVerifications()
      setPending(data)
    } catch (error) {
      console.error(error)
      toast.error("Error cargando solicitudes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleDecision = async (status: 'verified' | 'rejected') => {
    if (!selected) return
    if (status === 'rejected' && !reason.trim()) {
      toast.error("Ingresá un motivo")
      return
    }
    
    try {
      setProcessing(true)
      await ProvidersService.reviewIdentity(selected.id, status, reason)
      toast.success(status === 'verified' ? "Verificado" : "Rechazado")
      setSelected(null)
      setReason("")
      loadData()
    } catch (e) {
      toast.error("Error al procesar")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/metrics">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Solicitudes de Verificación</h1>
          <p className="text-gray-500">Validá la identidad de los trabajadores</p>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center">
          <Loader2 className="animate-spin mx-auto h-8 w-8" />
        </div>
      ) : pending.length === 0 ? (
        <Card className="bg-gray-50 border-dashed py-12 text-center text-gray-500">
          <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2"/>
          <h3 className="text-lg font-medium">Todo al día</h3>
          <p>No hay verificaciones pendientes.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pending.map(p => (
            <Card key={p.id} onClick={() => setSelected(p)} className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-orange-400">
              <CardHeader className="flex flex-row gap-4 items-center">
                <div className="h-12 w-12 bg-gray-100 rounded-full overflow-hidden">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={`${p.first_name} ${p.last_name}`} className="object-cover h-full w-full"/>
                  ) : (
                    <User className="h-6 w-6 m-3 text-gray-400"/>
                  )}
                </div>
                <div>
                  <CardTitle className="text-base">{p.first_name} {p.last_name}</CardTitle>
                  <div className="text-xs text-gray-400">{p.contact_email}</div>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">Pendiente de revisión</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL DE REVISIÓN */}
      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Revisando identidad: {selected?.first_name} {selected?.last_name}</DialogTitle>
            <DialogDescription>Compará la selfie con el DNI.</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            {/* AQUI MOSTRAR LAS IMAGENES - Usar <a> para ver en grande */}
            {['identity_dni_front_url', 'identity_dni_back_url', 'identity_selfie_url'].map((field, i) => (
              <div key={field} className="flex flex-col gap-2">
                <span className="font-bold text-sm text-center">{['DNI Frente', 'DNI Dorso', 'Selfie'][i]}</span>
                <a href={(selected as any)?.[field]} target="_blank" rel="noopener noreferrer" className="block border rounded bg-white h-64 relative hover:opacity-90 transition">
                  {(selected as any)?.[field] ? (
                    <img src={(selected as any)?.[field]} alt={['DNI Frente', 'DNI Dorso', 'Selfie'][i]} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No disponible
                    </div>
                  )}
                </a>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-4">
            {reason.length > 0 && <p className="text-xs text-red-500">Se rechazará con este motivo.</p>}
            <Textarea 
              placeholder="Motivo de rechazo (requerido solo si rechazás)..." 
              value={reason} 
              onChange={e => setReason(e.target.value)} 
            />
            <DialogFooter className="gap-2">
              <Button variant="destructive" disabled={processing} onClick={() => handleDecision('rejected')}>
                <XCircle className="mr-2 h-4 w-4"/> Rechazar
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" disabled={processing} onClick={() => handleDecision('verified')}>
                <CheckCircle2 className="mr-2 h-4 w-4"/> Aprobar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

