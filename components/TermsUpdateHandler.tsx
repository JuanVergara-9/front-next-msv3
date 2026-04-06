"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, FileText, Check, MessageSquare, PlusCircle, Sparkles, Bot } from "lucide-react"

const TERMS_VERSION = "2026-03-16"
const STORAGE_KEY = "miservicio_terms_accepted"

export function TermsUpdateHandler() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
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

  if (!isOpen) return null

  return (
    <>
      {/* Overlay oscuro */}
      <div className="fixed inset-0 z-50 bg-black/50" aria-hidden="true" />

      {/*
        Mobile  → bottom sheet: pegado al fondo, sube desde abajo, bordes redondeados arriba
        Desktop → modal centrado: igual que antes
      */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-title"
        className="
          fixed z-50 bg-white flex flex-col
          bottom-0 left-0 right-0
          rounded-t-3xl
          max-h-[88dvh] w-full
          sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
          sm:rounded-3xl sm:max-w-[500px] sm:max-h-[90dvh]
        "
      >
        {/* Tirón visual (solo mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto flex-1 px-6 pt-4 pb-2">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-4">
            <div className="bg-amber-100 p-3 rounded-full mb-3">
              <Sparkles className="h-7 w-7 text-amber-600" />
            </div>
            <h2 id="terms-title" className="text-xl font-black text-[#0e315d]">
              ¡Nuevo diseño y más funciones!
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Renovamos miservicio para que encontrar soluciones sea más rápido y seguro.
            </p>
          </div>

          {/* Features */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100">
            <div className="flex gap-3 p-3">
              <div className="h-8 w-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <PlusCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-[#0e315d] text-sm">Publicá tus Pedidos</p>
                <p className="text-xs text-slate-500 mt-0.5">Describí lo que necesitás y dejá que los profesionales se postulen.</p>
              </div>
            </div>

            <div className="flex gap-3 p-3">
              <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-[#0e315d] text-sm">Chat Propio</p>
                <p className="text-xs text-slate-500 mt-0.5">Hablá directo con los trabajadores desde la app.</p>
              </div>
            </div>

            <div className="flex gap-3 p-3">
              <div className="h-8 w-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-[#0e315d] text-sm">¿Sos trabajador? Verificate</p>
                <p className="text-xs text-slate-500 mt-0.5">Obtené tu insignia y generá más confianza con tus clientes.</p>
              </div>
            </div>

            <div className="flex gap-3 p-3">
              <div className="h-8 w-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-[#0e315d] text-sm">Chatbot con IA por WhatsApp</p>
                <p className="text-xs text-slate-500 mt-0.5">Asistente disponible cuando lo necesites.</p>
              </div>
            </div>
          </div>

          {/* Legal links */}
          <p className="text-center text-xs text-slate-400 mt-3 px-2">
            Actualizamos nuestros Términos y Política de Privacidad.
          </p>
          <div className="flex justify-center gap-4 text-xs font-bold mt-1 pb-2">
            <Link href="/legal/terminos" className="text-primary hover:underline flex items-center gap-1" target="_blank">
              <FileText className="h-3 w-3" /> Términos
            </Link>
            <Link href="/legal/privacidad" className="text-primary hover:underline flex items-center gap-1" target="_blank">
              <FileText className="h-3 w-3" /> Privacidad
            </Link>
          </div>
        </div>

        {/* Botón — siempre visible, nunca se corta */}
        <div className="px-6 pt-4 border-t border-slate-100 bg-white shrink-0 pb-safe">
          <Button
            onClick={handleAccept}
            className="w-full bg-[#0e315d] hover:bg-[#0e315d]/90 text-white font-bold rounded-xl h-12 shadow-lg text-base"
          >
            <Check className="h-5 w-5 mr-2" />
            ¡Entendido, vamos!
          </Button>
        </div>
      </div>
    </>
  )
}
