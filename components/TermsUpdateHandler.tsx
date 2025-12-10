"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShieldCheck, FileText, Check } from "lucide-react"

const TERMS_VERSION = "2025-12-10"
const STORAGE_KEY = "miservicio_terms_accepted"

export function TermsUpdateHandler() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Mostrar solo si la versión no fue aceptada en este navegador
    const acceptedVersion = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    if (acceptedVersion !== TERMS_VERSION) {
      const timer = setTimeout(() => setIsOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, TERMS_VERSION)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] [&>button]:hidden">
        <DialogHeader>
          <div className="mx-auto bg-blue-100 p-3 rounded-full mb-4">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-gray-900">
            ¡Hacemos miservicio más seguro!
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Hemos lanzado la nueva <strong>Verificación de Identidad</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 text-sm text-gray-600">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <span className="text-green-600 font-bold text-xs">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Para Proveedores</p>
                <p>
                  Ahora podés validar tu identidad y obtener la insignia{" "}
                  <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Verificado
                  </span>{" "}
                  para generar más confianza.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <span className="text-green-600 font-bold text-xs">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Para Clientes</p>
                <p>Buscá la insignia de verificación al contratar. Significa que hemos revisado el documento de identidad del profesional.</p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 px-4">
            Debido a estas mejoras, hemos actualizado nuestros documentos legales. Al continuar, aceptás los nuevos:
          </p>

          <div className="flex justify-center gap-4 text-xs font-medium">
            <Link href="/legal/terminos" className="text-blue-600 hover:underline flex items-center gap-1" target="_blank">
              <FileText className="h-3 w-3" /> Términos y Condiciones
            </Link>
            <Link href="/legal/privacidad" className="text-blue-600 hover:underline flex items-center gap-1" target="_blank">
              <FileText className="h-3 w-3" /> Política de Privacidad
            </Link>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button onClick={handleAccept} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]">
            <Check className="h-4 w-4 mr-2" />
            Entendido y Acepto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

