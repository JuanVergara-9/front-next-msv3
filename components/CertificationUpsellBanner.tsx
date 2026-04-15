"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ProvidersService } from "@/lib/services/providers.service"
import { toast } from "sonner"
import { GraduationCap, Loader2 } from "lucide-react"
import type { Provider } from "@/types/api"

type CertStatus = Provider["certification_status"]

export function CertificationUpsellBanner({
  provider,
  onUpdated,
}: {
  provider: Pick<Provider, "is_certified" | "certification_status" | "certification_rejection_reason"> | null
  onUpdated: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  if (!provider) return null
  if (provider.is_certified) return null

  const status = (provider.certification_status || "not_submitted") as CertStatus

  if (status === "pending") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950">
        <p className="font-medium">En revisión</p>
        <p className="text-sm text-amber-900/90 mt-1">
          Nuestro equipo está validando tu documento. Te avisamos por la app cuando esté listo.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 px-4 py-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-violet-900 font-semibold">
            <GraduationCap className="h-5 w-5 shrink-0" />
            Destacate del resto
          </div>
          <p className="text-sm text-violet-900/85 mt-2 leading-relaxed">
            Subí tu credencial o matrícula y obtené la insignia de{" "}
            <strong>Profesional Verificado</strong> para ganar más confianza de los clientes.
          </p>
          {status === "rejected" && provider.certification_rejection_reason && (
            <p className="text-xs text-red-700 mt-2">
              Motivo del anterior rechazo: {provider.certification_rejection_reason}
            </p>
          )}
        </div>
        <div className="shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-label="Subir foto de credencial o matrícula"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ""
              if (!file) return
              try {
                setUploading(true)
                await ProvidersService.uploadCertificationDoc(file)
                toast.success("Documento enviado. Quedó en revisión.")
                onUpdated()
              } catch (err: any) {
                toast.error(err?.message || "No se pudo subir el archivo")
              } finally {
                setUploading(false)
              }
            }}
          />
          <Button
            type="button"
            className="bg-violet-700 hover:bg-violet-800 text-white"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subiendo…
              </>
            ) : (
              "Subir documento"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
