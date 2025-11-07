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
    const invalidDomains = ['correo.com', 'email.com', 'mail.com', 'test.com', 'example.com']
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
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({}) // Limpiar errores anteriores
    
    try {
      await login(formData.email, formData.password)
      const next = searchParams.get('next')
      router.push(next && next.startsWith('/') ? next : '/')
    } catch (error: any) {
      console.error('Login error:', error)
      setErrors({ 
        general: error.message || 'Error al iniciar sesión. Intenta nuevamente.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#2F66F5" }}>
      <Card className="w-full max-w-[480px] shadow-2xl border-0">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido a miservicio</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            La plataforma que conecta clientes con los mejores profesionales
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`pl-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.email ? "border-red-500" : ""}`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-red-500 text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`pl-10 pr-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.password ? "border-red-500" : ""}`}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-red-500 text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: !!checked })}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Recordarme
                </Label>
              </div>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-white font-medium mt-6"
              style={{ backgroundColor: "#2563EB" }}
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">o continuar con</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" className="h-12 border-gray-300 hover:bg-gray-50 hover:text-gray-900 bg-transparent text-gray-700">
                Google
              </Button>
              <Button type="button" variant="outline" className="h-12 border-gray-300 hover:bg-gray-50 hover:text-gray-900 bg-transparent text-gray-700">
                Facebook
              </Button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              ¿No tienes una cuenta?{" "}
              <Link href={`/auth/register${searchParams.get('next') ? `?next=${encodeURIComponent(searchParams.get('next') as string)}` : ''}`} className="text-blue-600 hover:text-blue-800 font-medium">
                Regístrate
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
