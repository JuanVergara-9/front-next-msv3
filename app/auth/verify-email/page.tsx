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
            Verificación de Email
          </motion.h1>
        </CardHeader>

        <CardContent className="px-8 md:px-10 pb-10 pt-6">
          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
              <p className="text-slate-500 font-medium">Verificando tu correo electrónico...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-4">
              <div className="mx-auto mb-6 w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-[#0e315d] mb-4">¡Verificación exitosa!</h2>
              <p className="text-slate-500 mb-6 font-medium">{message}</p>
              <p className="text-[10px] text-slate-400 mb-8 font-black uppercase tracking-widest">Serás redirigido en unos segundos...</p>
              <Button
                onClick={() => router.push('/profile')}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-lg shadow-primary/20"
              >
                Ir a mi perfil
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-4">
              <div className="mx-auto mb-6 w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-black text-[#0e315d] mb-4">Ups, algo falló</h2>
              <p className="text-slate-500 mb-8 font-medium">{message}</p>
              <div className="space-y-4">
                <Button
                  onClick={() => router.push('/profile')}
                  variant="outline"
                  className="w-full h-14 border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 shadow-sm"
                >
                  Ir a mi perfil
                </Button>
                <Link href="/auth/login" className="block w-full">
                  <Button
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-lg shadow-primary/20"
                  >
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
}

