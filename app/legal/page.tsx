import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, FileText, ChevronRight, Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Centro Legal - miservicio',
  description: 'Términos, condiciones y políticas de privacidad de miservicio',
}

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#0e315d] mb-4 tracking-tight">
            Centro Legal
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            En miservicio priorizamos la transparencia y la seguridad de nuestra comunidad. 
            Aquí podés consultar nuestras políticas actualizadas.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/legal/terminos">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group cursor-pointer h-full flex flex-col">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-[#0e315d] mb-3">Términos y Condiciones</h2>
              <p className="text-slate-500 font-medium mb-6 flex-1">
                Reglas de uso de la plataforma, responsabilidades y funcionamiento del servicio de pedidos.
              </p>
              <div className="flex items-center text-primary font-bold gap-2">
                Leer términos <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/legal/privacidad">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group cursor-pointer h-full flex flex-col">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-[#0e315d] mb-3">Política de Privacidad</h2>
              <p className="text-slate-500 font-medium mb-6 flex-1">
                Cómo recopilamos, protegemos y utilizamos tus datos personales y tu reputación digital.
              </p>
              <div className="flex items-center text-primary font-bold gap-2">
                Leer política <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>

        {/* Footer info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-400 font-medium">
            Última actualización global: 22 de Febrero de 2026
          </p>
          <div className="mt-8 p-6 bg-slate-100/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 leading-relaxed">
              Al utilizar miservicio a través de la web o WhatsApp, aceptás automáticamente estas condiciones. 
              Si tenés dudas, escribinos a <a href="mailto:app.miservicio@gmail.com" className="text-primary hover:underline">app.miservicio@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
