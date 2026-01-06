"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShieldCheck, FileText, Check, MessageSquare, PlusCircle, Sparkles } from "lucide-react"

const TERMS_VERSION = "2026-01-06"
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
      <DialogContent className="sm:max-w-[500px] [&>button]:hidden rounded-3xl">
        <DialogHeader>
          <div className="mx-auto bg-amber-100 p-3 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-2xl font-black text-[#0e315d]">
            ¡Nuevo diseño y más funciones!
          </DialogTitle>
          <DialogDescription className="text-center pt-2 font-medium text-slate-500">
            Renovamos miservicio para que encontrar soluciones sea más rápido y seguro.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 text-sm text-gray-600">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <PlusCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-[#0e315d]">Publicá tus Pedidos</p>
                <p className="text-slate-500">Ahora podés describir lo que necesitás y dejar que los profesionales se postulen. ¡Vos elegís al mejor!</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-[#0e315d]">Chat Propio</p>
                <p className="text-slate-500">Comunicate de forma directa y segura con los trabajadores a través de nuestro nuevo chat integrado.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-[#0e315d]">¿Sos trabajador?</p>
                <p className="text-slate-500">
                  Verificá tu identidad para obtener tu insignia y generar más confianza con tus futuros clientes.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 px-4">
            Hemos actualizado nuestros documentos legales para reflejar estos cambios y proteger a nuestra comunidad:
          </p>

          <div className="flex justify-center gap-4 text-xs font-bold">
            <Link href="/legal/terminos" className="text-primary hover:underline flex items-center gap-1" target="_blank">
              <FileText className="h-3 w-3" /> Términos y Condiciones
            </Link>
            <Link href="/legal/privacidad" className="text-primary hover:underline flex items-center gap-1" target="_blank">
              <FileText className="h-3 w-3" /> Política de Privacidad
            </Link>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={handleAccept} 
            className="w-full sm:w-auto bg-[#0e315d] hover:bg-[#0e315d]/90 text-white font-bold rounded-xl h-12 min-w-[200px] shadow-lg"
          >
            <Check className="h-5 w-5 mr-2" />
            ¡Entendido, vamos!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

