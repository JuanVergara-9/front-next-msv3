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
      <Card className="w-full max-w-[480px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border-slate-100 rounded-[32px] overflow-hidden">
        <CardContent className="p-12 text-center">
          <p className="text-slate-500 font-medium mb-8">El enlace de recuperación es inválido o ha expirado.</p>
          <Link href="/auth/forgot-password">
            <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl">
              Solicitar uno nuevo
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-[480px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border-slate-100 rounded-[32px] overflow-hidden">
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
          Nueva contraseña
        </motion.h1>
        <motion.p 
          className="text-slate-500 font-medium leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Ingresá tu nueva clave para acceder a tu cuenta
        </motion.p>
      </CardHeader>

      <CardContent className="px-8 md:px-10 pb-10 pt-6">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="mx-auto mb-6 w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-[#0e315d] mb-4">¡Éxito!</h2>
              <p className="text-slate-500 mb-6 font-medium">Tu contraseña ha sido actualizada correctamente.</p>
              <p className="text-xs text-slate-400 mb-8 font-bold uppercase tracking-widest">Redirigiendo al login...</p>
              <Link href="/auth/login" className="w-full">
                <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl">
                  Ir al Login ahora
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              onSubmit={handleSubmit} 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-bold text-[#0e315d] ml-1">
                  Nueva Contraseña
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-12 pr-12 h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    placeholder="Al menos 8 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-bold text-[#0e315d] ml-1">
                  Confirmar Contraseña
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    placeholder="Repetí tu contraseña"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <p className="text-red-600 text-sm font-bold">{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70"
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
    <motion.div 
      className="w-full flex justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Suspense fallback={
        <Card className="w-full max-w-[480px] shadow-2xl border-0 rounded-[32px]">
          <CardContent className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
            Cargando...
          </CardContent>
        </Card>
      }>
        <ResetPasswordContent />
      </Suspense>
    </motion.div>
  )
}

