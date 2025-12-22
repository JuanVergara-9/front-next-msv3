"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Building2, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AuthService } from "@/lib/services/auth.service"

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de verificación no proporcionado')
      return
    }

    const verify = async () => {
      try {
        // La AuthService.verifyEmail ya fue actualizada a POST anteriormente
        await AuthService.verifyEmail(token)
        setStatus('success')
        setMessage('¡Tu cuenta ha sido verificada con éxito!')
      } catch (error: any) {
        setStatus('error')
        setMessage(error.message || 'El enlace es inválido o ha expirado')
      }
    }

    verify()
  }, [token])

  return (
    <Card className="w-full max-w-[480px] shadow-2xl border-0">
      <CardHeader className="text-center pb-6 pt-8">
        <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Building2 className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificación de Cuenta</h1>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        {status === 'loading' && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Verificando tu cuenta...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Cuenta verificada!</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
            <Link href="/auth/login">
              <Button
                className="w-full h-12 text-white font-medium"
                style={{ backgroundColor: "#2563EB" }}
              >
                Ir al Login
              </Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de verificación</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
            <Link href="/auth/register">
              <Button
                className="w-full h-12 text-white font-medium"
                style={{ backgroundColor: "#2563EB" }}
              >
                Intentar registrarse nuevamente
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#2F66F5" }}>
      <Suspense fallback={
        <Card className="w-full max-w-[480px] shadow-2xl border-0">
          <CardContent className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </CardContent>
        </Card>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  )
}

