"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { AnimatedTabSelector } from "@/components/ui/animated-tab-selector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, Mail, Lock, Building2, User, Phone, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ProvidersService } from "@/lib/services/providers.service"
import { UserProfileService } from "@/lib/services/user-profile.service"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"

const RUBROS = ["Plomería", "Gasistas", "Electricidad", "Jardinería", "Mantenimiento y limpieza de piletas", "Reparación de electrodomésticos", "Pintura"]

// Mapeo de rubros a category_id (basado en el seeder del backend)
const RUBRO_TO_CATEGORY_ID: { [key: string]: number } = {
  "Plomería": 1,
  "Gasistas": 2,
  "Electricidad": 3,
  "Jardinería": 4,
  "Mantenimiento y limpieza de piletas": 5,
  "Reparación de electrodomésticos": 6,
  "Pintura": 8
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register, checkProviderProfile, user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("cliente")
  const [currentStep, setCurrentStep] = useState(1)

  const [clientForm, setClientForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })

  const [providerForm, setProviderForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    rubros: [] as string[], // Cambio a array para múltiples categorías
    provincia: "",
    ciudad: "",
    phone: "",
    emergencyAvailable: false,
    yearsExperience: "",
    description: "",
    acceptTerms: false,
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Validar dominio de email (verificar que no sea un dominio inválido común)
  const validateEmailDomain = (email: string): boolean => {
    const invalidDomains = ['email.com', 'mail.com', 'test.com', 'example.com']
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain) return false
    // Verificar que no sea un dominio obviamente inválido
    if (invalidDomains.includes(domain)) {
      return false
    }
    // Verificar formato básico de dominio (debe tener al menos un punto)
    return domain.includes('.') && domain.split('.').length >= 2
  }

  const validateClientForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!clientForm.firstName) newErrors.firstName = "El nombre es requerido"
    if (!clientForm.lastName) newErrors.lastName = "El apellido es requerido"
    if (!clientForm.email) {
      newErrors.email = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(clientForm.email)) {
      newErrors.email = "Ingresa un correo electrónico válido"
    } else if (!validateEmailDomain(clientForm.email)) {
      newErrors.email = "El dominio del correo electrónico no es válido"
    }
    if (!clientForm.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (clientForm.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    }
    if (clientForm.password !== clientForm.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }
    if (!clientForm.acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los términos y condiciones"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateProviderStep1 = () => {
    const newErrors: { [key: string]: string } = {}

    if (!providerForm.email) {
      newErrors.email = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(providerForm.email)) {
      newErrors.email = "Ingresa un correo electrónico válido"
    } else if (!validateEmailDomain(providerForm.email)) {
      newErrors.email = "El dominio del correo electrónico no es válido"
    }
    if (!providerForm.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (providerForm.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    }
    if (providerForm.password !== providerForm.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateProviderStep2 = () => {
    const newErrors: { [key: string]: string } = {}

    if (!avatarFile) newErrors.avatar = "La foto de perfil es obligatoria"
    if (!providerForm.firstName) newErrors.firstName = "El nombre es requerido"
    if (!providerForm.lastName) newErrors.lastName = "El apellido es requerido"
    if (providerForm.rubros.length === 0) newErrors.rubros = "Debes seleccionar al menos un rubro"
    if (!providerForm.provincia) newErrors.provincia = "La provincia es requerida"
    if (!providerForm.ciudad) newErrors.ciudad = "La ciudad es requerida"
    if (!providerForm.yearsExperience) {
      newErrors.yearsExperience = "Los años de experiencia son requeridos"
    } else if (
      Number.parseInt(providerForm.yearsExperience) < 0 ||
      Number.parseInt(providerForm.yearsExperience) > 80
    ) {
      newErrors.yearsExperience = "Los años de experiencia deben estar entre 0 y 80"
    }
    if (!providerForm.description || providerForm.description.trim().length === 0) {
      newErrors.description = "La descripción es obligatoria"
    }
    if (!providerForm.acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los términos y condiciones"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (currentStep === 1 && validateProviderStep1()) {
      setCurrentStep(2)
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
      setErrors({}) // Clear errors when going back
    }
  }

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateClientForm()) {
      toast.error('Por favor completa todos los campos correctamente')
      return
    }

    setIsLoading(true)
    setErrors({}) // Limpiar errores anteriores
    
    try {
      await register(clientForm.email, clientForm.password)
      
      // Actualizar el perfil de usuario con nombre y apellido
      try {
        await UserProfileService.updateProfile({
          first_name: clientForm.firstName,
          last_name: clientForm.lastName,
          phone_e164: clientForm.phone || undefined,
          public_profile: true,
        })
      } catch (profileError) {
        console.warn('Error updating user profile:', profileError)
        // No bloquear el registro si falla la actualización del perfil
      }
      
      toast.success('¡Cuenta creada exitosamente!')
      setIsSuccess(true)
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = error.message || 'Error al crear la cuenta. Intenta nuevamente.'
      setErrors({ 
        general: errorMessage
      })
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateProviderStep2()) {
      toast.error('Por favor completa todos los campos correctamente')
      return
    }

    setIsLoading(true)
    setErrors({}) // Limpiar errores anteriores
    
    try {
      const isConvertExisting = !!user && (searchParams.get('provider') === '1' || searchParams.get('provider') === 'true')
      // 1. Si es conversión de usuario existente, omitir registro
      if (!isConvertExisting) {
        await register(providerForm.email, providerForm.password)
      }

      // Actualizar perfil básico en user-service (nombre y apellido)
      try {
        await UserProfileService.updateProfile({
          first_name: providerForm.firstName,
          last_name: providerForm.lastName,
          public_profile: true,
        })
      } catch (profileError) {
        console.warn('Error updating user basic profile (provider):', profileError)
      }
      
      // 2. Crear el perfil de proveedor
      const categoryIds = providerForm.rubros.map(rubro => RUBRO_TO_CATEGORY_ID[rubro]).filter(Boolean)
      if (categoryIds.length === 0) {
        throw new Error('Debes seleccionar al menos un rubro válido')
      }

      const created = await ProvidersService.createProviderProfile({
        category_ids: categoryIds, // Enviar array de categorías
        first_name: providerForm.firstName,
        last_name: providerForm.lastName,
        contact_email: providerForm.email,
        phone_e164: providerForm.phone,
        whatsapp_e164: providerForm.phone, // Usar el mismo teléfono para WhatsApp
        description: providerForm.description,
        province: providerForm.provincia,
        city: providerForm.ciudad,
        years_experience: parseInt(providerForm.yearsExperience),
        emergency_available: providerForm.emergencyAvailable,
      })
      // 3. Subir avatar si fue elegido
      if (avatarFile) {
        try { await ProvidersService.uploadMyAvatar(avatarFile) } catch (err) { console.warn('avatar upload failed', err) }
      }
      toast.success('¡Perfil de proveedor creado exitosamente!')
      setIsSuccess(true)
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = error.message || 'Error al crear la cuenta. Intenta nuevamente.'
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
      className="min-h-screen flex items-center justify-center p-4" 
      style={{ backgroundColor: "#2F66F5" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <Card className="w-full max-w-[520px] shadow-2xl border-0">
          <CardHeader className="text-center pb-6 pt-8">
            <motion.div 
              className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <Building2 className="w-8 h-8 text-blue-600" />
            </motion.div>
            <motion.h1 
              className="text-2xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Únete a miservicio
            </motion.h1>
            <motion.p 
              className="text-gray-600 text-sm leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Crea tu cuenta y conecta con los mejores servicios profesionales
            </motion.p>
          </CardHeader>

        <CardContent className="px-8 pb-8">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="mx-auto mb-6 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Casi listo!</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Hemos enviado un correo a tu casilla. Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
                </p>
                <Link href="/">
                  <Button variant="outline" className="text-sm">
                    Volver al inicio
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <AnimatedTabSelector
                  value={activeTab}
                  onValueChange={setActiveTab}
                  options={[
                    { value: "cliente", label: "Cliente" },
                    { value: "proveedor", label: "Proveedor de servicios" }
                  ]}
                />
              </motion.div>

            <AnimatePresence mode="wait">
              <TabsContent value="cliente" key="cliente">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Crear Cuenta</h2>
                  </div>

                  <form onSubmit={handleClientSubmit} className="space-y-4">
                    <AnimatePresence>
                      {errors.general && (
                        <motion.div 
                          className="bg-red-50 border border-red-200 rounded-lg p-3"
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="text-red-600 text-sm">{errors.general}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      Nombre
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="firstName"
                        type="text"
                        value={clientForm.firstName}
                        onChange={(e) => setClientForm({ ...clientForm, firstName: e.target.value })}
                        className={`pl-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.firstName ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Apellido
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="lastName"
                        type="text"
                        value={clientForm.lastName}
                        onChange={(e) => setClientForm({ ...clientForm, lastName: e.target.value })}
                        className={`pl-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.lastName ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientEmail" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder="tu@email.com"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      className={`pl-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.email ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientPhone" className="text-sm font-medium text-gray-700">
                    Teléfono (opcional)
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="clientPhone"
                      type="tel"
                      placeholder="+54 11 1234-5678"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      className="pl-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientPassword" className="text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="clientPassword"
                      type={showPassword ? "text" : "password"}
                      value={clientForm.password}
                      onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })}
                      className={`pl-10 pr-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.password ? "border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientConfirmPassword" className="text-sm font-medium text-gray-700">
                    Confirmar Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="clientConfirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={clientForm.confirmPassword}
                      onChange={(e) => setClientForm({ ...clientForm, confirmPassword: e.target.value })}
                      className={`pl-10 pr-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.confirmPassword ? "border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="clientTerms"
                    checked={clientForm.acceptTerms}
                    onCheckedChange={(checked) => setClientForm({ ...clientForm, acceptTerms: !!checked })}
                    className="mt-1"
                  />
                  <Label htmlFor="clientTerms" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                    Acepto los{" "}
                    <Link href="/legal/terminos" className="text-blue-600 hover:text-blue-800">
                      términos y condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link href="/legal/privacidad" className="text-blue-600 hover:text-blue-800">
                      política de privacidad
                    </Link>
                  </Label>
                </div>
                {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms}</p>}

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full h-12 text-white font-medium mt-6"
                        style={{ backgroundColor: "#2563EB" }}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ repeat: Infinity, duration: 0.8, repeatType: "reverse" }}
                          >
                            Creando cuenta...
                          </motion.span>
                        ) : (
                          "Crear cuenta"
                        )}
                      </Button>
                    </motion.div>

                    <p className="text-center text-sm text-gray-600 mt-4">
                      ¿Ya tienes una cuenta?{" "}
                      <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
                        Inicia sesión
                      </Link>
                    </p>
                  </form>
                </motion.div>
              </TabsContent>

              <TabsContent value="proveedor" key="proveedor">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-semibold text-gray-900">Crear Cuenta (Proveedor)</h2>
                      <span className="text-sm text-gray-500">Paso {currentStep} de 2</span>
                    </div>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Progress value={currentStep === 1 ? 50 : 100} className="h-2" />
                    </motion.div>
                  </div>

                  <form onSubmit={handleProviderSubmit} className="space-y-4">
                    <AnimatePresence>
                      {errors.general && (
                        <motion.div 
                          className="bg-red-50 border border-red-200 rounded-lg p-3"
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="text-red-600 text-sm">{errors.general}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                      {currentStep === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 mb-4">Información de la cuenta</h3>

                    <div className="space-y-2">
                      <Label htmlFor="providerEmail" className="text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="providerEmail"
                          type="email"
                          placeholder="tu@email.com"
                          value={providerForm.email}
                          onChange={(e) => setProviderForm({ ...providerForm, email: e.target.value })}
                          className={`pl-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.email ? "border-red-500" : ""}`}
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="providerPassword" className="text-sm font-medium text-gray-700">
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="providerPassword"
                          type={showPassword ? "text" : "password"}
                          value={providerForm.password}
                          onChange={(e) => setProviderForm({ ...providerForm, password: e.target.value })}
                          className={`pl-10 pr-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.password ? "border-red-500" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="providerConfirmPassword" className="text-sm font-medium text-gray-700">
                        Confirmar Contraseña
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="providerConfirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={providerForm.confirmPassword}
                          onChange={(e) => setProviderForm({ ...providerForm, confirmPassword: e.target.value })}
                          className={`pl-10 pr-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.confirmPassword ? "border-red-500" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                    </div>

                          <div className="flex justify-end pt-6">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                type="button"
                                onClick={handleNextStep}
                                className="h-12 px-8 text-white font-medium"
                                style={{ backgroundColor: "#2563EB" }}
                              >
                                Siguiente
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </motion.div>
                          </div>
                          </div>
                        </motion.div>
                      )}

                      {currentStep === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="space-y-4">
                            <h3 className="font-medium text-gray-900 mb-4">Perfil profesional</h3>
                    <div className="space-y-2">
                      <Label htmlFor="avatar" className="text-sm font-medium text-gray-700">
                        Foto de perfil <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="avatar" 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setAvatarFile(file)
                          if (file && errors.avatar) {
                            setErrors({ ...errors, avatar: "" })
                          }
                        }}
                        className={`file:bg-white file:cursor-pointer file:border file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:bg-gray-50 file:text-sm file:font-medium file:text-gray-700 cursor-pointer ${errors.avatar ? "file:border-red-500 border-red-500" : "file:border-gray-300"}`}
                      />
                      <p className="text-xs text-gray-500">JPG/PNG/WEBP hasta 5MB</p>
                      {errors.avatar && <p className="text-red-500 text-sm">{errors.avatar}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="providerFirstName" className="text-sm font-medium text-gray-700">
                          Nombre
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            id="providerFirstName"
                            type="text"
                            value={providerForm.firstName}
                            onChange={(e) => setProviderForm({ ...providerForm, firstName: e.target.value })}
                            className={`pl-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.firstName ? "border-red-500" : ""}`}
                          />
                        </div>
                        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="providerLastName" className="text-sm font-medium text-gray-700">
                          Apellido
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            id="providerLastName"
                            type="text"
                            value={providerForm.lastName}
                            onChange={(e) => setProviderForm({ ...providerForm, lastName: e.target.value })}
                            className={`pl-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.lastName ? "border-red-500" : ""}`}
                          />
                        </div>
                        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Rubros (puedes seleccionar varios)
                      </Label>
                      <div className="grid grid-cols-1 gap-3">
                        {RUBROS.map((rubro) => (
                          <div key={rubro} className="flex items-center space-x-3">
                            <Checkbox
                              id={`rubro-${rubro}`}
                              checked={providerForm.rubros.includes(rubro)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setProviderForm({
                                    ...providerForm,
                                    rubros: [...providerForm.rubros, rubro]
                                  })
                                } else {
                                  setProviderForm({
                                    ...providerForm,
                                    rubros: providerForm.rubros.filter(r => r !== rubro)
                                  })
                                }
                              }}
                            />
                            <Label htmlFor={`rubro-${rubro}`} className="text-sm text-gray-700 cursor-pointer">
                              {rubro}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {errors.rubros && <p className="text-red-500 text-sm">{errors.rubros}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="provincia" className="text-sm font-medium text-gray-700">
                          Provincia
                        </Label>
                        <Input
                          id="provincia"
                          type="text"
                          value={providerForm.provincia}
                          onChange={(e) => setProviderForm({ ...providerForm, provincia: e.target.value })}
                          className={`h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.provincia ? "border-red-500" : ""}`}
                        />
                        {errors.provincia && <p className="text-red-500 text-sm">{errors.provincia}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ciudad" className="text-sm font-medium text-gray-700">
                          Ciudad
                        </Label>
                        <Input
                          id="ciudad"
                          type="text"
                          value={providerForm.ciudad}
                          onChange={(e) => setProviderForm({ ...providerForm, ciudad: e.target.value })}
                          className={`h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.ciudad ? "border-red-500" : ""}`}
                        />
                        {errors.ciudad && <p className="text-red-500 text-sm">{errors.ciudad}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="providerPhone" className="text-sm font-medium text-gray-700">
                        Teléfono/WhatsApp
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="providerPhone"
                          type="tel"
                          placeholder="+54 9 ..."
                          value={providerForm.phone}
                          onChange={(e) => setProviderForm({ ...providerForm, phone: e.target.value })}
                          className="pl-10 h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <Label htmlFor="emergency" className="text-sm font-medium text-gray-700">
                        ¿Atiende urgencias?
                      </Label>
                      <Switch
                        id="emergency"
                        checked={providerForm.emergencyAvailable}
                        onCheckedChange={(checked) => setProviderForm({ ...providerForm, emergencyAvailable: checked })}
                        className="cursor-pointer data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:border data-[state=unchecked]:border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                        Años de experiencia
                      </Label>
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        max="80"
                        value={providerForm.yearsExperience}
                        onChange={(e) => setProviderForm({ ...providerForm, yearsExperience: e.target.value })}
                        className={`h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.yearsExperience ? "border-red-500" : ""}`}
                      />
                      {errors.yearsExperience && <p className="text-red-500 text-sm">{errors.yearsExperience}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Descripción <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe tu experiencia y servicios (máx. 2000 caracteres)"
                        value={providerForm.description}
                        onChange={(e) => {
                          setProviderForm({ ...providerForm, description: e.target.value })
                          if (e.target.value.trim().length > 0 && errors.description) {
                            setErrors({ ...errors, description: "" })
                          }
                        }}
                        maxLength={2000}
                        className={`min-h-[100px] border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.description ? "border-red-500" : ""}`}
                      />
                      <p className="text-xs text-gray-500 text-right">{providerForm.description.length}/2000</p>
                      {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                    </div>

                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox
                        id="providerTerms"
                        checked={providerForm.acceptTerms}
                        onCheckedChange={(checked) => setProviderForm({ ...providerForm, acceptTerms: !!checked })}
                        className="mt-1"
                      />
                      <Label htmlFor="providerTerms" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                        Acepto los{" "}
                        <Link href="/legal/terminos" className="text-blue-600 hover:text-blue-800">
                          términos y condiciones
                        </Link>{" "}
                        y la{" "}
                        <Link href="/legal/privacidad" className="text-blue-600 hover:text-blue-800">
                          política de privacidad
                        </Link>
                      </Label>
                    </div>
                    {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms}</p>}

                          <div className="flex justify-between pt-6">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                type="button"
                                onClick={handlePrevStep}
                                variant="outline"
                                className="h-12 px-8 font-medium bg-transparent"
                              >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                type="submit"
                                className="h-12 px-8 text-white font-medium"
                                style={{ backgroundColor: "#2563EB" }}
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ repeat: Infinity, duration: 0.8, repeatType: "reverse" }}
                                  >
                                    Creando cuenta...
                                  </motion.span>
                                ) : (
                                  "Crear cuenta de proveedor"
                                )}
                              </Button>
                            </motion.div>
                          </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <p className="text-center text-sm text-gray-600 mt-4">
                      ¿Ya tienes una cuenta?{" "}
                      <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
                        Inicia sesión
                      </Link>
                    </p>
                  </form>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  )
}
