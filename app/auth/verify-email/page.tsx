"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Building2, CheckCircle2, XCircle, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AuthService } from "@/lib/services/auth.service"

export default function VerifyEmailPage() {
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
        await AuthService.verifyEmail(token)
        setStatus('success')
        setMessage('¡Tu correo electrónico ha sido verificado exitosamente!')
        // Actualizar el usuario en el contexto si está autenticado
        setTimeout(() => {
          router.push('/profile')
        }, 3000)
      } catch (error: any) {
        setStatus('error')
        setMessage(error.message || 'Error al verificar el email')
      }
    }

    verify()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#2F66F5" }}>
      <Card className="w-full max-w-[480px] shadow-2xl border-0">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificación de Email</h1>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Verificando tu correo electrónico...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Verificación exitosa!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500 mb-6">Serás redirigido a tu perfil en unos segundos...</p>
              <Button
                onClick={() => router.push('/profile')}
                className="w-full h-12 text-white font-medium"
                style={{ backgroundColor: "#2563EB" }}
              >
                Ir a mi perfil
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error en la verificación</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/profile')}
                  variant="outline"
                  className="w-full h-12 font-medium"
                >
                  Ir a mi perfil
                </Button>
                <Link href="/auth/login" className="block">
                  <Button
                    className="w-full h-12 text-white font-medium"
                    style={{ backgroundColor: "#2563EB" }}
                  >
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

