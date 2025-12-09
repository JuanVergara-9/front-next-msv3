"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldCheck, ShieldAlert, Clock, Upload, X, CheckCircle2, AlertCircle } from "lucide-react"
import { ProvidersService } from "@/lib/services/providers.service"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

interface IdentityVerificationCardProps {
  providerProfile: {
    identity_status?: 'not_submitted' | 'pending' | 'verified' | 'rejected'
    identity_rejection_reason?: string | null
  }
  onUpdate?: () => void
}

export function IdentityVerificationCard({ providerProfile, onUpdate }: IdentityVerificationCardProps) {
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<{
    dniFront: File | null
    dniBack: File | null
    selfie: File | null
  }>({
    dniFront: null,
    dniBack: null,
    selfie: null
  })
  const [previews, setPreviews] = useState<{
    dniFront: string | null
    dniBack: string | null
    selfie: string | null
  }>({
    dniFront: null,
    dniBack: null,
    selfie: null
  })

  const dniFrontRef = useRef<HTMLInputElement>(null)
  const dniBackRef = useRef<HTMLInputElement>(null)
  const selfieRef = useRef<HTMLInputElement>(null)

  const status = providerProfile.identity_status || 'not_submitted'

  const handleFileSelect = (type: 'dniFront' | 'dniBack' | 'selfie', file: File | null) => {
    if (!file) {
      setFiles(prev => ({ ...prev, [type]: null }))
      setPreviews(prev => ({ ...prev, [type]: null }))
      return
    }

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 5MB')
      return
    }

    setFiles(prev => ({ ...prev, [type]: file }))
    
    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviews(prev => ({ ...prev, [type]: e.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!files.dniFront || !files.dniBack || !files.selfie) {
      toast.error('Subí los tres documentos requeridos')
      return
    }

    try {
      setUploading(true)
      await ProvidersService.uploadIdentityDocs({
        dniFront: files.dniFront,
        dniBack: files.dniBack,
        selfie: files.selfie
      })
      
      toast.success('Documentos subidos correctamente. Están siendo revisados.')
      
      // Limpiar formulario
      setFiles({ dniFront: null, dniBack: null, selfie: null })
      setPreviews({ dniFront: null, dniBack: null, selfie: null })
      
      // Resetear inputs
      if (dniFrontRef.current) dniFrontRef.current.value = ''
      if (dniBackRef.current) dniBackRef.current.value = ''
      if (selfieRef.current) selfieRef.current.value = ''
      
      // Notificar al padre para refrescar datos
      if (onUpdate) {
        setTimeout(() => {
          onUpdate()
        }, 1000)
      }
    } catch (error: any) {
      console.error('Error uploading identity docs:', error)
      let message = 'Error al subir documentos'
      try {
        const parsed = JSON.parse(error.message)
        message = parsed?.error?.message || message
      } catch {}
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
        return {
          icon: ShieldCheck,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badge: (
            <Badge className="bg-green-600 text-white">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Identidad Verificada
            </Badge>
          ),
          message: 'Tu identidad ha sido verificada por el equipo de miservicio. Tu perfil muestra una insignia de verificado.'
        }
      case 'pending':
        return {
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          badge: (
            <Badge className="bg-orange-600 text-white">
              <Clock className="h-3 w-3 mr-1" />
              En Revisión
            </Badge>
          ),
          message: 'Tus documentos están siendo revisados por el equipo de miservicio. Te notificaremos cuando se complete la verificación.'
        }
      case 'rejected':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badge: (
            <Badge className="bg-red-600 text-white">
              <AlertCircle className="h-3 w-3 mr-1" />
              Rechazado
            </Badge>
          ),
          message: providerProfile.identity_rejection_reason 
            ? `Tu solicitud fue rechazada: ${providerProfile.identity_rejection_reason}`
            : 'Tu solicitud fue rechazada. Podés volver a enviar los documentos.'
        }
      default:
        return {
          icon: ShieldAlert,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badge: null,
          message: 'Verificá tu identidad para ganar la confianza de los clientes. Subí una foto de tu DNI (frente y dorso) y una selfie.'
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`rounded-2xl shadow-lg border-2 ${statusConfig.borderColor}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
              </div>
              <div>
                <CardTitle className="text-xl">Verificación de Identidad</CardTitle>
                <CardDescription>
                  Validá tu identidad para mostrar una insignia de verificado
                </CardDescription>
              </div>
            </div>
            {statusConfig.badge}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className={statusConfig.bgColor}>
            <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
            <AlertDescription className={statusConfig.color}>
              {statusConfig.message}
            </AlertDescription>
          </Alert>

          <AnimatePresence mode="wait">
            {(status === 'not_submitted' || status === 'rejected') && (
              <motion.div
                key="upload-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* DNI Frente */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#111827]">
                      DNI Frente *
                    </label>
                    <div className="relative">
                      <input
                        ref={dniFrontRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect('dniFront', e.target.files?.[0] || null)}
                        className="hidden"
                        id="dni-front"
                      />
                      <label
                        htmlFor="dni-front"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#2563EB] hover:bg-gray-50 transition-colors"
                      >
                        {previews.dniFront ? (
                          <div className="relative w-full h-full">
                            <img
                              src={previews.dniFront}
                              alt="DNI Frente"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleFileSelect('dniFront', null)
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Hacé clic para subir</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* DNI Dorso */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#111827]">
                      DNI Dorso *
                    </label>
                    <div className="relative">
                      <input
                        ref={dniBackRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect('dniBack', e.target.files?.[0] || null)}
                        className="hidden"
                        id="dni-back"
                      />
                      <label
                        htmlFor="dni-back"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#2563EB] hover:bg-gray-50 transition-colors"
                      >
                        {previews.dniBack ? (
                          <div className="relative w-full h-full">
                            <img
                              src={previews.dniBack}
                              alt="DNI Dorso"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleFileSelect('dniBack', null)
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Hacé clic para subir</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Selfie */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#111827]">
                      Selfie con DNI *
                    </label>
                    <div className="relative">
                      <input
                        ref={selfieRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect('selfie', e.target.files?.[0] || null)}
                        className="hidden"
                        id="selfie"
                      />
                      <label
                        htmlFor="selfie"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#2563EB] hover:bg-gray-50 transition-colors"
                      >
                        {previews.selfie ? (
                          <div className="relative w-full h-full">
                            <img
                              src={previews.selfie}
                              alt="Selfie"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleFileSelect('selfie', null)
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Hacé clic para subir</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Recomendaciones:</strong>
                  </p>
                  <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc list-inside">
                    <li>Las fotos deben ser claras y legibles</li>
                    <li>El DNI debe estar completo y visible</li>
                    <li>En la selfie, sostené tu DNI junto a tu rostro</li>
                    <li>Formato: JPG, PNG (máximo 5MB por archivo)</li>
                  </ul>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={uploading || !files.dniFront || !files.dniBack || !files.selfie}
                  className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
                >
                  {uploading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Upload className="h-4 w-4" />
                      </motion.div>
                      Subiendo documentos...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Enviar para verificación
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
