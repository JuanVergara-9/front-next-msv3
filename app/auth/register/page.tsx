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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="w-full max-w-[540px] py-4"
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
            Unite a miservicio
          </motion.h1>
          <motion.p 
            className="text-slate-500 font-medium leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Conectá con las mejores soluciones para tu hogar
          </motion.p>
        </CardHeader>

        <CardContent className="px-8 md:px-10 pb-10 pt-6">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="mx-auto mb-6 w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center">
                  <Mail className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-[#0e315d] mb-4">¡Casi listo!</h2>
                <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                  Enviamos un correo de activación a tu casilla. Revisá tu bandeja de entrada para continuar.
                </p>
                <Link href="/">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 rounded-xl">
                    Ir al Inicio
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
                    className="mb-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <AnimatedTabSelector
                      value={activeTab}
                      onValueChange={setActiveTab}
                      options={[
                        { value: "cliente", label: "Soy Cliente" },
                        { value: "proveedor", label: "Soy Profesional" }
                      ]}
                    />
                  </motion.div>

                  <AnimatePresence mode="wait">
                    <TabsContent value="cliente" key="cliente" className="mt-0 outline-none">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-5"
                      >
                        <form onSubmit={handleClientSubmit} className="space-y-5">
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

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName" className="text-sm font-bold text-[#0e315d] ml-1">Nombre</Label>
                              <div className="relative group">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary" />
                                <Input
                                  id="firstName"
                                  placeholder="ej: Juan"
                                  value={clientForm.firstName}
                                  onChange={(e) => setClientForm({ ...clientForm, firstName: e.target.value })}
                                  className={`pl-12 h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:border-primary transition-all font-medium ${errors.firstName ? "border-red-300 bg-red-50/30" : ""}`}
                                />
                              </div>
                              {errors.firstName && <p className="text-red-500 text-xs font-bold ml-1">{errors.firstName}</p>}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="lastName" className="text-sm font-bold text-[#0e315d] ml-1">Apellido</Label>
                              <div className="relative group">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary" />
                                <Input
                                  id="lastName"
                                  placeholder="ej: Pérez"
                                  value={clientForm.lastName}
                                  onChange={(e) => setClientForm({ ...clientForm, lastName: e.target.value })}
                                  className={`pl-12 h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:border-primary transition-all font-medium ${errors.lastName ? "border-red-300 bg-red-50/30" : ""}`}
                                />
                              </div>
                              {errors.lastName && <p className="text-red-500 text-xs font-bold ml-1">{errors.lastName}</p>}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="clientEmail" className="text-sm font-bold text-[#0e315d] ml-1">Email</Label>
                            <div className="relative group">
                              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary" />
                              <Input
                                id="clientEmail"
                                type="email"
                                placeholder="ej: juan@gmail.com"
                                value={clientForm.email}
                                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                                className={`pl-12 h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:border-primary transition-all font-medium ${errors.email ? "border-red-300 bg-red-50/30" : ""}`}
                              />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs font-bold ml-1">{errors.email}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="clientPhone" className="text-sm font-bold text-[#0e315d] ml-1">Teléfono (opcional)</Label>
                            <div className="relative group">
                              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary" />
                              <Input
                                id="clientPhone"
                                type="tel"
                                placeholder="ej: 2604123456"
                                value={clientForm.phone}
                                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                                className="pl-12 h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:border-primary transition-all font-medium"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="clientPassword" className="text-sm font-bold text-[#0e315d] ml-1">Contraseña</Label>
                            <div className="relative group">
                              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary" />
                              <Input
                                id="clientPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Mínimo 8 caracteres"
                                value={clientForm.password}
                                onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })}
                                className={`pl-12 pr-12 h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:border-primary transition-all font-medium ${errors.password ? "border-red-300 bg-red-50/30" : ""}`}
                              />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs font-bold ml-1">{errors.password}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="clientConfirmPassword" className="text-sm font-bold text-[#0e315d] ml-1">Confirmar Contraseña</Label>
                            <div className="relative group">
                              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary" />
                              <Input
                                id="clientConfirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Repetir contraseña"
                                value={clientForm.confirmPassword}
                                onChange={(e) => setClientForm({ ...clientForm, confirmPassword: e.target.value })}
                                className={`pl-12 pr-12 h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:border-primary transition-all font-medium ${errors.confirmPassword ? "border-red-300 bg-red-50/30" : ""}`}
                              />
                              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs font-bold ml-1">{errors.confirmPassword}</p>}
                          </div>

                          <div className="flex items-start space-x-3 pt-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <Checkbox
                              id="clientTerms"
                              checked={clientForm.acceptTerms}
                              onCheckedChange={(checked) => setClientForm({ ...clientForm, acceptTerms: !!checked })}
                              className="mt-1 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label htmlFor="clientTerms" className="text-xs text-slate-500 leading-relaxed cursor-pointer font-medium">
                              Acepto los{" "}
                              <Link href="/legal/terminos" target="_blank" className="text-primary font-bold hover:underline">términos y condiciones</Link>
                              {" "}y la{" "}
                              <Link href="/legal/privacidad" target="_blank" className="text-primary font-bold hover:underline">política de privacidad</Link>
                            </Label>
                          </div>
                          {errors.acceptTerms && <p className="text-red-500 text-xs font-bold ml-1">{errors.acceptTerms}</p>}

                          <Button
                            type="submit"
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70"
                            disabled={isLoading}
                          >
                            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                          </Button>
                        </form>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="proveedor" key="proveedor" className="mt-0 outline-none">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="flex justify-between items-center bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                          <div className="space-y-1">
                            <h3 className="text-sm font-black text-[#0e315d]">Paso {currentStep} de 2</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {currentStep === 1 ? "Información básica" : "Perfil Profesional"}
                            </p>
                          </div>
                          <div className="w-32">
                            <Progress value={currentStep === 1 ? 50 : 100} className="h-2 bg-slate-200" />
                          </div>
                        </div>

                        <form onSubmit={handleProviderSubmit} className="space-y-5">
                          <AnimatePresence mode="wait">
                            {currentStep === 1 ? (
                              <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-5"
                              >
                                <div className="space-y-2">
                                  <Label htmlFor="providerEmail" className="text-sm font-bold text-[#0e315d] ml-1">Email</Label>
                                  <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary" />
                                    <Input
                                      id="providerEmail"
                                      type="email"
                                      placeholder="ej: profesional@gmail.com"
                                      value={providerForm.email}
                                      onChange={(e) => setProviderForm({ ...providerForm, email: e.target.value })}
                                      className={`pl-12 h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:border-primary transition-all font-medium ${errors.email ? "border-red-300 bg-red-50/30" : ""}`}
                                    />
                                  </div>
                                  {errors.email && <p className="text-red-500 text-xs font-bold ml-1">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="providerPassword" className="text-sm font-bold text-[#0e315d] ml-1">Contraseña</Label>
                                  <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary" />
                                    <Input
                                      id="providerPassword"
                                      type={showPassword ? "text" : "password"}
                                      placeholder="Mínimo 8 caracteres"
                                      value={providerForm.password}
                                      onChange={(e) => setProviderForm({ ...providerForm, password: e.target.value })}
                                      className={`pl-12 pr-12 h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:border-primary transition-all font-medium ${errors.password ? "border-red-300 bg-red-50/30" : ""}`}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                  </div>
                                  {errors.password && <p className="text-red-500 text-xs font-bold ml-1">{errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="providerConfirmPassword" className="text-sm font-bold text-[#0e315d] ml-1">Confirmar Contraseña</Label>
                                  <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary" />
                                    <Input
                                      id="providerConfirmPassword"
                                      type={showConfirmPassword ? "text" : "password"}
                                      placeholder="Repetir contraseña"
                                      value={providerForm.confirmPassword}
                                      onChange={(e) => setProviderForm({ ...providerForm, confirmPassword: e.target.value })}
                                      className={`pl-12 pr-12 h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white focus:border-primary transition-all font-medium ${errors.confirmPassword ? "border-red-300 bg-red-50/30" : ""}`}
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                  </div>
                                  {errors.confirmPassword && <p className="text-red-500 text-xs font-bold ml-1">{errors.confirmPassword}</p>}
                                </div>

                                <div className="flex justify-end pt-4">
                                  <Button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="h-14 px-10 bg-[#0e315d] hover:bg-[#0e315d]/90 text-white font-black text-lg rounded-2xl shadow-lg transition-all active:scale-95 group"
                                  >
                                    Siguiente
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                  </Button>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                              >
                                <div className="space-y-2">
                                  <Label htmlFor="avatar" className="text-sm font-bold text-[#0e315d] ml-1">
                                    Foto de perfil <span className="text-red-500">*</span>
                                  </Label>
                                  <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200">
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm text-slate-300">
                                      {avatarFile ? (
                                        <img src={URL.createObjectURL(avatarFile)} className="w-full h-full object-cover" alt="Preview" />
                                      ) : (
                                        <User size={32} />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <Input 
                                        id="avatar" 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => {
                                          const file = e.target.files?.[0] || null
                                          setAvatarFile(file)
                                          if (file && errors.avatar) setErrors({ ...errors, avatar: "" })
                                        }}
                                        className="h-auto py-1.5 px-3 bg-white text-xs border-slate-200 rounded-xl cursor-pointer"
                                      />
                                      <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">JPG/PNG/WEBP hasta 5MB</p>
                                    </div>
                                  </div>
                                  {errors.avatar && <p className="text-red-500 text-xs font-bold ml-1">{errors.avatar}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="providerFirstName" className="text-sm font-bold text-[#0e315d] ml-1">Nombre</Label>
                                    <Input
                                      id="providerFirstName"
                                      placeholder="ej: Roberto"
                                      value={providerForm.firstName}
                                      onChange={(e) => setProviderForm({ ...providerForm, firstName: e.target.value })}
                                      className={`h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white transition-all font-medium ${errors.firstName ? "border-red-300" : ""}`}
                                    />
                                    {errors.firstName && <p className="text-red-500 text-xs font-bold ml-1">{errors.firstName}</p>}
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="providerLastName" className="text-sm font-bold text-[#0e315d] ml-1">Apellido</Label>
                                    <Input
                                      id="providerLastName"
                                      placeholder="ej: Gómez"
                                      value={providerForm.lastName}
                                      onChange={(e) => setProviderForm({ ...providerForm, lastName: e.target.value })}
                                      className={`h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white transition-all font-medium ${errors.lastName ? "border-red-300" : ""}`}
                                    />
                                    {errors.lastName && <p className="text-red-500 text-xs font-bold ml-1">{errors.lastName}</p>}
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <Label className="text-sm font-black text-[#0e315d] ml-1 block mb-2 uppercase tracking-widest">
                                    ¿Cuál es tu rubro?
                                  </Label>
                                  <div className="flex flex-wrap gap-2">
                                    {RUBROS.map((rubro) => (
                                      <button
                                        key={rubro}
                                        type="button"
                                        onClick={() => {
                                          if (providerForm.rubros.includes(rubro)) {
                                            setProviderForm({ ...providerForm, rubros: providerForm.rubros.filter(r => r !== rubro) })
                                          } else {
                                            setProviderForm({ ...providerForm, rubros: [...providerForm.rubros, rubro] })
                                          }
                                        }}
                                        className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border shadow-sm active:scale-95 ${
                                          providerForm.rubros.includes(rubro)
                                            ? "bg-primary text-white border-primary shadow-primary/20"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-primary/30 hover:bg-slate-50"
                                        }`}
                                      >
                                        {rubro}
                                      </button>
                                    ))}
                                  </div>
                                  {errors.rubros && <p className="text-red-500 text-xs font-bold ml-1">{errors.rubros}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="provincia" className="text-sm font-bold text-[#0e315d] ml-1">Provincia</Label>
                                    <Input id="provincia" value={providerForm.provincia} onChange={(e) => setProviderForm({ ...providerForm, provincia: e.target.value })} className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white font-medium" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="ciudad" className="text-sm font-bold text-[#0e315d] ml-1">Ciudad</Label>
                                    <Input id="ciudad" value={providerForm.ciudad} onChange={(e) => setProviderForm({ ...providerForm, ciudad: e.target.value })} className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white font-medium" />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="providerPhone" className="text-sm font-bold text-[#0e315d] ml-1">WhatsApp</Label>
                                  <Input id="providerPhone" type="tel" placeholder="ej: 2604..." value={providerForm.phone} onChange={(e) => setProviderForm({ ...providerForm, phone: e.target.value })} className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white font-medium" />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                  <div className="space-y-0.5">
                                    <Label htmlFor="emergency" className="text-sm font-bold text-[#0e315d]">¿Atendés urgencias?</Label>
                                    <p className="text-[10px] text-slate-400 font-medium">Figurarás disponible para trabajos inmediatos</p>
                                  </div>
                                  <Switch id="emergency" checked={providerForm.emergencyAvailable} onCheckedChange={(checked) => setProviderForm({ ...providerForm, emergencyAvailable: checked })} className="data-[state=checked]:bg-primary" />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="description" className="text-sm font-bold text-[#0e315d] ml-1">Descripción de servicios <span className="text-red-500">*</span></Label>
                                  <Textarea
                                    id="description"
                                    placeholder="Contanos un poco sobre tu experiencia y cómo trabajás..."
                                    value={providerForm.description}
                                    onChange={(e) => setProviderForm({ ...providerForm, description: e.target.value })}
                                    className={`min-h-[120px] bg-slate-50/50 border-slate-200 rounded-2xl focus:bg-white font-medium resize-none ${errors.description ? "border-red-300" : ""}`}
                                  />
                                  <p className="text-[10px] text-slate-400 text-right font-bold tracking-widest uppercase">{providerForm.description.length}/2000</p>
                                </div>

                                <div className="flex items-start space-x-3 pt-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                  <Checkbox
                                    id="providerTerms"
                                    checked={providerForm.acceptTerms}
                                    onCheckedChange={(checked) => setProviderForm({ ...providerForm, acceptTerms: !!checked })}
                                    className="mt-1 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                  />
                                  <Label htmlFor="providerTerms" className="text-xs text-slate-500 leading-relaxed cursor-pointer font-medium">
                                    Acepto los <Link href="/legal/terminos" target="_blank" className="text-primary font-bold hover:underline">términos y condiciones</Link> y la <Link href="/legal/privacidad" target="_blank" className="text-primary font-bold hover:underline">política de privacidad</Link>
                                  </Label>
                                </div>

                                <div className="flex gap-4 pt-4">
                                  <Button type="button" onClick={handlePrevStep} variant="outline" className="h-14 flex-1 border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                                  </Button>
                                  <Button type="submit" disabled={isLoading} className="h-14 flex-[2] bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-lg shadow-primary/20">
                                    {isLoading ? "Creando..." : "Crear Perfil"}
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </form>
                      </motion.div>
                    </TabsContent>
                  </AnimatePresence>
                </Tabs>

                <p className="text-center text-sm font-medium text-slate-500 mt-10 border-t border-slate-100 pt-8">
                  ¿Ya tenés una cuenta?{" "}
                  <Link href="/auth/login" className="text-primary font-black hover:underline">
                    Iniciá sesión
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
