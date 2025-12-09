"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Shield, Upload, CheckCircle2, Clock, AlertTriangle, XCircle, Loader2 } from "lucide-react"
import { ProvidersService } from "@/lib/services/providers.service"
import { toast } from "react-hot-toast"
import { motion } from "framer-motion"

interface Props {
  status: 'not_submitted' | 'pending' | 'verified' | 'rejected' | undefined
  rejectionReason?: string
  onStatusChange: () => void // Para recargar el perfil al terminar
}

export function IdentityVerificationCard({ status = 'not_submitted', rejectionReason, onStatusChange }: Props) {
  const [isUploading, setIsUploading] = useState(false)
  const [files, setFiles] = useState<{
    dniFront: File | null
    dniBack: File | null
    selfie: File | null
  }>({ dniFront: null, dniBack: null, selfie: null })

  const handleFileChange = (key: keyof typeof files) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }))
    }
  }

  const handleSubmit = async () => {
    if (!files.dniFront || !files.dniBack || !files.selfie) {
      toast.error("Por favor, subí las 3 fotos requeridas.")
      return
    }

    try {
      setIsUploading(true)
      await ProvidersService.uploadIdentityDocs({
        dniFront: files.dniFront,
        dniBack: files.dniBack,
        selfie: files.selfie
      })
      toast.success("Documentos enviados correctamente")
      setFiles({ dniFront: null, dniBack: null, selfie: null })
      onStatusChange() // Recargar estado
    } catch (error) {
      console.error(error)
      toast.error("Error al subir documentos. Intentalo de nuevo.")
    } finally {
      setIsUploading(false)
    }
  }

  // Renderizado según estado
  if (status === 'verified') {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800">¡Tu perfil está verificado!</h3>
            <p className="text-sm text-green-700">Los clientes pueden ver la insignia de confianza en tu perfil.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === 'pending') {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-800">Verificación en proceso</h3>
            <p className="text-sm text-blue-700">Estamos revisando tus documentos. Te avisaremos pronto.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-l-4 ${status === 'rejected' ? 'border-l-red-500' : 'border-l-blue-500'} shadow-md`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Verificar Identidad
            </CardTitle>
            <CardDescription>
              Aumentá la confianza de los clientes verificando que sos vos.
            </CardDescription>
          </div>
          {status === 'rejected' && (
            <Badge variant="destructive" className="flex gap-1">
              <XCircle className="h-3 w-3" /> Rechazado
            </Badge>
          )}
        </div>
        {status === 'rejected' && rejectionReason && (
          <div className="mt-2 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
            <strong>Motivo del rechazo:</strong> {rejectionReason}. Por favor, volvé a subir los documentos corregidos.
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Input DNI Frente */}
          <div className="space-y-2">
            <Label>DNI (Frente)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
              <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange('dniFront')} />
              {files.dniFront ? (
                <div className="text-sm text-green-600 font-medium truncate">{files.dniFront.name}</div>
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <Upload className="h-6 w-6 mb-1" />
                  <span className="text-xs">Subir foto</span>
                </div>
              )}
            </div>
          </div>

          {/* Input DNI Dorso */}
          <div className="space-y-2">
            <Label>DNI (Dorso)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
              <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange('dniBack')} />
              {files.dniBack ? (
                <div className="text-sm text-green-600 font-medium truncate">{files.dniBack.name}</div>
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <Upload className="h-6 w-6 mb-1" />
                  <span className="text-xs">Subir foto</span>
                </div>
              )}
            </div>
          </div>

          {/* Input Selfie */}
          <div className="space-y-2">
            <Label>Selfie con DNI</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
              <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange('selfie')} />
              {files.selfie ? (
                <div className="text-sm text-green-600 font-medium truncate">{files.selfie.name}</div>
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <Upload className="h-6 w-6 mb-1" />
                  <span className="text-xs">Subir foto</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-md text-xs text-blue-700 flex gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>Tus documentos se guardan de forma segura y solo se usan para validar tu identidad. No serán visibles públicamente.</p>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={isUploading || !files.dniFront || !files.dniBack || !files.selfie}
            className="bg-[#2563EB] text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...
              </>
            ) : "Enviar para revisión"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

