"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, Building2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  // Validar dominio de email
  const validateEmailDomain = (email: string): boolean => {
    const invalidDomains = ['email.com', 'mail.com', 'test.com', 'example.com']
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain) return false
    if (invalidDomains.includes(domain)) {
      return false
    }
    return domain.includes('.') && domain.split('.').length >= 2
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ingresa un correo electrónico válido"
    } else if (!validateEmailDomain(formData.email)) {
      newErrors.email = "El dominio del correo electrónico no es válido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Por favor completa todos los campos correctamente')
      return
    }

    setIsLoading(true)
    setErrors({}) // Limpiar errores anteriores
    
    try {
      await login(formData.email, formData.password)
      toast.success('¡Bienvenido! Sesión iniciada correctamente')
      const next = searchParams.get('next')
      router.push(next && next.startsWith('/') ? next : '/')
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.message || 'Error al iniciar sesión. Intenta nuevamente.'
      setErrors({ 
        general: errorMessage
      })
      toast.error(errorMessage)
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
            ¡Hola de nuevo!
          </motion.h1>
          <motion.p 
            className="text-slate-500 font-medium leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Ingresá tus datos para continuar
          </motion.p>
        </CardHeader>

        <CardContent className="px-8 md:px-10 pb-10 pt-6">
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <AnimatePresence>
              {errors.general && (
                <motion.div 
                  className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <p className="text-red-600 text-sm font-bold">{errors.general}</p>
                </motion.div>
              )}
            </AnimatePresence>

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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`pl-12 h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium ${errors.email ? "border-red-300 bg-red-50/30" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs font-bold ml-1 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold text-[#0e315d] ml-1">
                Contraseña
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`pl-12 pr-12 h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium ${errors.password ? "border-red-300 bg-red-50/30" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs font-bold ml-1 mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 px-1">
              <div className="flex items-center space-x-2 group cursor-pointer">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: !!checked })}
                  className="rounded-md border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer group-hover:text-slate-700 transition-colors">
                  Recordarme
                </Label>
              </div>
              <Link href="/auth/forgot-password" px-1 className="text-xs font-bold text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Ingresar"}
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-slate-400">
                <span className="px-4 bg-white text-slate-400">o continuar con</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button type="button" variant="outline" className="h-14 border-slate-200 rounded-2xl hover:bg-slate-50 font-bold text-slate-600 transition-all active:scale-95 bg-white shadow-sm">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-2" alt="Google" />
                Google
              </Button>
              <Button type="button" variant="outline" className="h-14 border-slate-200 rounded-2xl hover:bg-slate-50 font-bold text-slate-600 transition-all active:scale-95 bg-white shadow-sm">
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5 mr-2" alt="Facebook" />
                Facebook
              </Button>
            </div>

            <p className="text-center text-sm font-medium text-slate-500 mt-8">
              ¿No tenés una cuenta?{" "}
              <Link href={`/auth/register${searchParams.get('next') ? `?next=${encodeURIComponent(searchParams.get('next') as string)}` : ''}`} className="text-primary font-black hover:underline">
                Regístrate ahora
              </Link>
            </p>
          </motion.form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
  )
}
