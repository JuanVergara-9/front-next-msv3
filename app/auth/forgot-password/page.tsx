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
      className="min-h-screen flex items-center justify-center p-4" 
      style={{ backgroundColor: "#2F66F5" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <Card className="w-full max-w-[480px] shadow-2xl border-0">
          <CardHeader className="text-center pb-6 pt-8 px-8">
            <motion.div 
              className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Building2 className="w-8 h-8 text-blue-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Recuperar contraseña</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Ingresa tu email y te enviaremos las instrucciones para restablecer tu contraseña en miservicio.
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-center py-4"
                >
                  <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Solicitud enviada!</h2>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Si tus datos son correctos, recibirás un correo de miservicio con las instrucciones para recuperar tu cuenta.
                  </p>
                  <Link href="/auth/login">
                    <Button className="w-full h-12 text-white font-medium" style={{ backgroundColor: "#2563EB" }}>
                      Volver al Login
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  onSubmit={handleSubmit} 
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Correo Electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                        required
                      />
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <Button
                    type="submit"
                    className="w-full h-12 text-white font-medium mt-4"
                    style={{ backgroundColor: "#2563EB" }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Procesando..." : "Enviar instrucciones"}
                  </Button>

                  <div className="text-center mt-6">
                    <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver al inicio de sesión
                    </Link>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

