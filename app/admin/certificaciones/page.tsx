"use client"
import { useEffect, useState } from "react"
import { ProvidersService } from "@/lib/services/providers.service"
import { Provider } from "@/types/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import { CheckCircle2, XCircle, User, ArrowLeft, Loader2, GraduationCap } from "lucide-react"
import Link from "next/link"

export default function AdminCertificacionesPage() {
  const [pending, setPending] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Provider | null>(null)
  const [reason, setReason] = useState("")
  const [processing, setProcessing] = useState(false)
  const [markAntecedentes, setMarkAntecedentes] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await ProvidersService.getPendingCertifications()
      setPending(data)
    } catch (error) {
      console.error(error)
      toast.error("Error cargando certificaciones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleDecision = async (status: "verified" | "rejected") => {
    if (!selected) return
    if (status === "rejected" && !reason.trim()) {
      toast.error("Ingresá un motivo")
      return
    }

    try {
      setProcessing(true)
      await ProvidersService.reviewCertification(
        selected.id,
        status,
        reason || undefined,
        status === "verified" ? markAntecedentes : undefined
      )
      toast.success(status === "verified" ? "Certificación aprobada" : "Rechazada")
      setSelected(null)
      setReason("")
      setMarkAntecedentes(false)
      loadData()
    } catch {
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-violet-600" />
            Certificaciones pendientes
          </h1>
          <p className="text-gray-500">Validá matrícula o credencial; opcionalmente marcá antecedentes verificados.</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        <Link href="/admin/verificaciones" className="text-primary underline">Ir a verificación de identidad (DNI)</Link>
      </p>

      {loading ? (
        <div className="p-10 text-center">
          <Loader2 className="animate-spin mx-auto h-8 w-8" />
        </div>
      ) : pending.length === 0 ? (
        <Card className="bg-gray-50 border-dashed py-12 text-center text-gray-500">
          <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2"/>
          <h3 className="text-lg font-medium">Todo al día</h3>
          <p>No hay certificaciones pendientes.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pending.map(p => (
            <Card key={p.id} onClick={() => setSelected(p)} className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-violet-400">
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
                <Badge variant="secondary" className="bg-violet-100 text-violet-800">Matrícula / credencial</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Revisar credencial: {selected?.first_name} {selected?.last_name}</DialogTitle>
            <DialogDescription>
              Compará el nombre con el DNI ya validado. Si coincide y el documento es legítimo, aprobá.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-gray-50 rounded-lg flex justify-center">
            <a
              href={(selected as any)?.certification_doc_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block border rounded bg-white max-h-[70vh] overflow-auto"
            >
              {(selected as any)?.certification_doc_url ? (
                <img
                  src={(selected as any)?.certification_doc_url}
                  alt="Credencial"
                  className="max-w-full object-contain"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-gray-400">Sin imagen</div>
              )}
            </a>
          </div>

          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="antecedentes"
              checked={markAntecedentes}
              onCheckedChange={(c) => setMarkAntecedentes(!!c)}
            />
            <Label htmlFor="antecedentes" className="text-sm font-normal cursor-pointer">
              Marcar antecedentes verificados (escudo dorado en el perfil público)
            </Label>
          </div>

          <div className="space-y-4">
            <Textarea
              placeholder="Motivo de rechazo (solo si rechazás)…"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
            <DialogFooter className="gap-2">
              <Button variant="destructive" disabled={processing} onClick={() => handleDecision("rejected")}>
                <XCircle className="mr-2 h-4 w-4"/> Rechazar
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" disabled={processing} onClick={() => handleDecision("verified")}>
                <CheckCircle2 className="mr-2 h-4 w-4"/> Aprobar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
