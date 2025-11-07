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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#2F66F5" }}>
      <Card className="w-full max-w-[480px] shadow-2xl border-0">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifica tu correo</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Hemos enviado un enlace de verificación a tu correo electrónico
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <div className="text-center py-6">
            <div className="mx-auto mb-6 w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
            
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Revisa tu bandeja de entrada
            </h2>
            
            <p className="text-gray-600 mb-2">
              Hemos enviado un enlace de verificación a:
            </p>
            <p className="text-gray-900 font-medium mb-6">
              {user?.email || 'tu correo electrónico'}
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-700 mb-2">
                <strong>¿No recibiste el email?</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Revisa tu carpeta de spam o correo no deseado</li>
                <li>Verifica que el correo sea el correcto</li>
                <li>El enlace expira en 24 horas</li>
              </ul>
            </div>

            {resendStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-700">{resendMessage}</p>
              </div>
            )}

            {resendStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{resendMessage}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleResend}
                disabled={isResending}
                variant="outline"
                className="w-full h-12 font-medium"
              >
                {isResending ? 'Reenviando...' : 'Reenviar email de verificación'}
              </Button>
              
              <Link href="/" className="block">
                <Button
                  className="w-full h-12 text-white font-medium"
                  style={{ backgroundColor: "#2563EB" }}
                >
                  Continuar al inicio
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

