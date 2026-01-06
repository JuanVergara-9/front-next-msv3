"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Building2, Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import { AuthService } from "@/lib/services/auth.service"

export default function EmailSentPage() {
  const { user } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [resendMessage, setResendMessage] = useState('')

  const handleResend = async () => {
    if (!user) return
    
    setIsResending(true)
    setResendStatus('idle')
    setResendMessage('')
    
    try {
      await AuthService.sendVerificationEmail()
      setResendStatus('success')
      setResendMessage('Email de verificación reenviado exitosamente')
    } catch (error: any) {
      setResendStatus('error')
      setResendMessage(error.message || 'Error al reenviar el email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="w-full max-w-[480px]"
    >
      <Card className="shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border-slate-100 rounded-[32px] overflow-hidden">
        <CardHeader className="text-center pb-2 pt-10 px-8">
          <motion.div 
            className="mx-auto mb-6 w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Building2 className="w-8 h-8 text-primary" />
          </motion.div>
          <motion.h1 
            className="text-3xl font-black text-[#0e315d] mb-3 tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Verificá tu correo
          </motion.h1>
          <motion.p 
            className="text-slate-500 font-medium leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Te enviamos un enlace para activar tu cuenta
          </motion.p>
        </CardHeader>

        <CardContent className="px-8 md:px-10 pb-10 pt-6">
          <div className="text-center py-4">
            <div className="mx-auto mb-6 w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center">
              <Mail className="w-10 h-10 text-emerald-600" />
            </div>
            
            <h2 className="text-xl font-black text-[#0e315d] mb-3">
              Revisá tu bandeja
            </h2>
            
            <p className="text-slate-500 mb-2 font-medium text-sm">
              Enviamos un enlace de verificación a:
            </p>
            <p className="text-[#0e315d] font-black mb-8 text-lg">
              {user?.email || 'tu correo electrónico'}
            </p>
            
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 text-left">
              <p className="text-xs text-[#0e315d] font-black uppercase tracking-widest mb-3">
                ¿No recibiste el email?
              </p>
              <ul className="text-xs text-slate-500 space-y-2 font-medium">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  Revisá tu carpeta de spam
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  Verificá que el correo sea el correcto
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  El enlace expira en 24 horas
                </li>
              </ul>
            </div>

            {resendStatus === 'success' && (
              <motion.div 
                className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-emerald-700 text-xs font-bold text-left">{resendMessage}</p>
              </motion.div>
            )}

            {resendStatus === 'error' && (
              <motion.div 
                className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <p className="text-red-700 text-xs font-bold text-left">{resendMessage}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              <Button
                onClick={handleResend}
                disabled={isResending}
                variant="outline"
                className="w-full h-14 border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95 disabled:opacity-70"
              >
                {isResending ? 'Reenviando...' : 'Reenviar email'}
              </Button>
              
              <Link href="/" className="block w-full">
                <Button
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  Continuar al inicio
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
}

