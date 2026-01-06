"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Mail, ArrowLeft, CheckCircle2, Building2 } from "lucide-react"
import Link from "next/link"
import { AuthService } from "@/lib/services/auth.service"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Por favor ingresa tu email")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await AuthService.forgotPassword(email)
      setIsSuccess(true)
      toast.success("Solicitud enviada con éxito")
    } catch (err: any) {
      console.error("Forgot password error:", err)
      setError(err.message || "Error al procesar la solicitud")
      toast.error(err.message || "Ocurrió un error")
    } finally {
      setIsLoading(false)
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
            Recuperar cuenta
          </motion.h1>
          <motion.p 
            className="text-slate-500 font-medium leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Te enviaremos las instrucciones para restablecer tu contraseña
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
                <h2 className="text-2xl font-black text-[#0e315d] mb-4">¡Solicitud enviada!</h2>
                <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                  Si tus datos son correctos, recibirás un correo con los pasos para recuperar tu acceso.
                </p>
                <Link href="/auth/login" className="w-full">
                  <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl">
                    Volver al Login
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
                  <Label htmlFor="email" className="text-sm font-bold text-[#0e315d] ml-1">
                    Correo Electrónico
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ej: juan@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
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
                  {isLoading ? "Enviando..." : "Enviar instrucciones"}
                </Button>

                <div className="text-center pt-2">
                  <Link href="/auth/login" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio de sesión
                  </Link>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
  )
}

