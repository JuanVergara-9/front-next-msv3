"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Lock, Eye, EyeOff, CheckCircle2, Building2 } from "lucide-react"
import Link from "next/link"
import { AuthService } from "@/lib/services/auth.service"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      toast.error("Token de recuperación no válido")
      return
    }

    if (newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await AuthService.resetPassword(token, newPassword)
      setIsSuccess(true)
      toast.success("Contraseña actualizada con éxito")
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (err: any) {
      console.error("Reset password error:", err)
      setError(err.message || "Error al restablecer la contraseña")
      toast.error(err.message || "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-[480px] shadow-2xl border-0">
        <CardContent className="p-12 text-center">
          <p className="text-gray-600 mb-6">El enlace de recuperación es inválido o ha expirado.</p>
          <Link href="/auth/forgot-password">
            <Button className="w-full" style={{ backgroundColor: "#2563EB" }}>Solicitar uno nuevo</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-[480px] shadow-2xl border-0">
      <CardHeader className="text-center pb-6 pt-8 px-8">
        <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Building2 className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nueva contraseña</h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          Ingresa tu nueva clave para acceder a tu cuenta de miservicio.
        </p>
      </CardHeader>

      <CardContent className="px-8 pb-10">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Éxito!</h2>
              <p className="text-gray-600 mb-6">Tu contraseña ha sido actualizada.</p>
              <p className="text-sm text-gray-500 mb-8">Redirigiendo al login...</p>
              <Link href="/auth/login">
                <Button className="w-full h-12 text-white font-medium" style={{ backgroundColor: "#2563EB" }}>
                  Ir al Login ahora
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              onSubmit={handleSubmit} 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="space-y-2">
                <Label htmlFor="newPassword" style={{ fontSize: "14px" }} className="font-medium text-gray-700">
                  Nueva Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                    placeholder="Al menos 8 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" style={{ fontSize: "14px" }} className="font-medium text-gray-700">
                  Confirmar Nueva Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                    placeholder="Repite tu contraseña"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button
                type="submit"
                className="w-full h-12 text-white font-medium mt-6"
                style={{ backgroundColor: "#2563EB" }}
                disabled={isLoading}
              >
                {isLoading ? "Actualizando..." : "Restablecer contraseña"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#2F66F5" }}>
      <Suspense fallback={
        <Card className="w-full max-w-[480px] shadow-2xl border-0">
          <CardContent className="p-12 text-center text-gray-500">
            Cargando...
          </CardContent>
        </Card>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  )
}

