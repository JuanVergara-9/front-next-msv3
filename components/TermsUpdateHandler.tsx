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
      {/* Overlay oscuro — z-[200] para estar sobre el BottomNavBar (z-[100]) */}
      <div className="fixed inset-0 z-[200] bg-black/50" aria-hidden="true" />

      {/* Modal centrado en todas las pantallas */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-title"
        className="fixed z-[201] bg-white flex flex-col rounded-3xl shadow-xl
          top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[calc(100%-2rem)] max-w-[420px]
          max-h-[calc(100dvh-8rem)]"
      >

        {/* Contenido — sin scroll, todo visible */}
        <div className="px-5 pt-4 pb-3">
          {/* Header compacto */}
          <div className="flex flex-col items-center text-center mb-3">
            <div className="bg-amber-100 p-2.5 rounded-full mb-2">
              <Sparkles className="h-6 w-6 text-amber-600" />
            </div>
            <h2 id="terms-title" className="text-lg font-black text-[#0e315d] leading-tight">
              ¡Nuevo diseño y más funciones!
            </h2>
          </div>

          {/* Features — solo títulos + iconos */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100 mb-3">
            {[
              { icon: PlusCircle,   bg: "bg-blue-100",    color: "text-blue-600",    label: "Publicá tus Pedidos" },
              { icon: MessageSquare,bg: "bg-emerald-100",  color: "text-emerald-600", label: "Chat Propio" },
              { icon: ShieldCheck,  bg: "bg-purple-100",  color: "text-purple-600",  label: "Verificá tu identidad" },
              { icon: Bot,          bg: "bg-green-100",   color: "text-green-600",   label: "Chatbot IA por WhatsApp" },
            ].map(({ icon: Icon, bg, color, label }) => (
              <div key={label} className="flex items-center gap-3 px-3 py-2.5">
                <div className={`h-7 w-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <p className="font-semibold text-[#0e315d] text-sm">{label}</p>
              </div>
            ))}
          </div>

          {/* Legal links */}
          <div className="flex justify-center gap-4 text-xs font-bold text-slate-400">
            <Link href="/legal/terminos" className="hover:text-primary flex items-center gap-1" target="_blank">
              <FileText className="h-3 w-3" /> Términos
            </Link>
            <Link href="/legal/privacidad" className="hover:text-primary flex items-center gap-1" target="_blank">
              <FileText className="h-3 w-3" /> Privacidad
            </Link>
          </div>
        </div>

        {/* Botón */}
        <div className="px-5 pt-3 pb-5 border-t border-slate-100 bg-white shrink-0 rounded-b-3xl">
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
