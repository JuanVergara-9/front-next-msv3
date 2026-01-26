"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, Mail, Lock, Building2, User, Phone, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { UserProfileService } from "@/lib/services/user-profile.service"
import { ProvidersService } from "@/lib/services/providers.service"
import toast from "react-hot-toast"

const RUBROS = ["Plomería", "Gasistas", "Electricidad", "Carpintería", "Pintura", "Reparación de electrodomésticos"]

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
  const { register } = useAuth()
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
    rubro: "",
    provincia: "",
    ciudad: "",
    phone: "",
    emergencyAvailable: false,
    yearsExperience: "",
    description: "",
    acceptTerms: false,
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateClientForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!clientForm.firstName) newErrors.firstName = "El nombre es requerido"
    if (!clientForm.lastName) newErrors.lastName = "El apellido es requerido"
    if (!clientForm.email) {
      newErrors.email = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(clientForm.email)) {
      newErrors.email = "Ingresa un correo electrónico válido"
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

    if (!providerForm.firstName) newErrors.firstName = "El nombre es requerido"
    if (!providerForm.lastName) newErrors.lastName = "El apellido es requerido"
    if (!providerForm.rubro) newErrors.rubro = "Debes seleccionar un rubro"
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
    if (!validateClientForm()) return

    setIsLoading(true)
    
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
      }
      
      toast.success('¡Cuenta creada exitosamente!')
      router.push('/')
    } catch (error: any) {
      console.error('Registration error:', error)
      setErrors({ general: error.message || 'Error al crear la cuenta. Intenta nuevamente.' })
      toast.error(error.message || 'Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateProviderStep2()) return

    setIsLoading(true)
    
    try {
      await register(providerForm.email, providerForm.password)

      // Actualizar perfil básico en user-service
      try {
        await UserProfileService.updateProfile({
          first_name: providerForm.firstName,
          last_name: providerForm.lastName,
          public_profile: true,
        })
      } catch (profileError) {
        console.warn('Error updating basic profile:', profileError)
      }
      
      // Crear el perfil de proveedor
      const categoryId = RUBRO_TO_CATEGORY_ID[providerForm.rubro]
      if (!categoryId) throw new Error('Rubro inválido')

      await ProvidersService.createProviderProfile({
        category_id: categoryId,
        first_name: providerForm.firstName,
        last_name: providerForm.lastName,
        contact_email: providerForm.email,
        phone_e164: providerForm.phone,
        whatsapp_e164: providerForm.phone,
        description: providerForm.description,
        province: providerForm.provincia,
        city: providerForm.ciudad,
        years_experience: parseInt(providerForm.yearsExperience),
        emergency_available: providerForm.emergencyAvailable,
      })
      
      toast.success('¡Perfil de proveedor creado exitosamente!')
      router.push('/')
    } catch (error: any) {
      console.error('Registration error:', error)
      setErrors({ general: error.message || 'Error al crear la cuenta. Intenta nuevamente.' })
      toast.error(error.message || 'Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#2F66F5" }}>
      <Card className="w-full max-w-[520px] shadow-2xl border-0">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Únete a miservicio</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Crea tu cuenta y conecta con los mejores servicios profesionales
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="cliente" className="text-sm">
                Cliente
              </TabsTrigger>
              <TabsTrigger value="proveedor" className="text-sm">
                Proveedor de servicios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cliente">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Crear Cuenta</h2>
              </div>

              <form onSubmit={handleClientSubmit} className="space-y-4">
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{errors.general}</p>
                  </div>
                )}

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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  <Label htmlFor="clientTerms" className="text-sm text-gray-600 leading-relaxed">
                    Acepto los{" "}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                      términos y condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                      política de privacidad
                    </Link>
                  </Label>
                </div>
                {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms}</p>}

                <Button
                  type="submit"
                  className="w-full h-12 text-white font-medium mt-6"
                  style={{ backgroundColor: "#2563EB" }}
                  disabled={isLoading}
                >
                  {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>

                <p className="text-center text-sm text-gray-600 mt-4">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                    Inicia sesión
                  </Link>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="proveedor">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Crear Cuenta (Proveedor)</h2>
                  <span className="text-sm text-gray-500">Paso {currentStep} de 2</span>
                </div>
                <Progress value={currentStep === 1 ? 50 : 100} className="h-2" />
              </div>

              <form onSubmit={handleProviderSubmit} className="space-y-4">
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{errors.general}</p>
                  </div>
                )}

                {currentStep === 1 && (
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
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                    </div>

                    <div className="flex justify-end pt-6">
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="h-12 px-8 text-white font-medium"
                        style={{ backgroundColor: "#2563EB" }}
                      >
                        Siguiente
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 mb-4">Perfil profesional</h3>

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
                      <Label htmlFor="rubro" className="text-sm font-medium text-gray-700">
                        Rubro
                      </Label>
                      <Select
                        value={providerForm.rubro}
                        onValueChange={(value) => setProviderForm({ ...providerForm, rubro: value })}
                      >
                        <SelectTrigger
                          className={`h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 ${errors.rubro ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="Selecciona tu rubro" />
                        </SelectTrigger>
                        <SelectContent>
                          {RUBROS.map((rubro) => (
                            <SelectItem key={rubro} value={rubro}>
                              {rubro}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.rubro && <p className="text-red-500 text-sm">{errors.rubro}</p>}
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
                        Descripción
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe tu experiencia y servicios (máx. 2000 caracteres)"
                        value={providerForm.description}
                        onChange={(e) => setProviderForm({ ...providerForm, description: e.target.value })}
                        maxLength={2000}
                        className="min-h-[100px] border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                      />
                      <p className="text-xs text-gray-500 text-right">{providerForm.description.length}/2000</p>
                    </div>

                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox
                        id="providerTerms"
                        checked={providerForm.acceptTerms}
                        onCheckedChange={(checked) => setProviderForm({ ...providerForm, acceptTerms: !!checked })}
                        className="mt-1"
                      />
                      <Label htmlFor="providerTerms" className="text-sm text-gray-600 leading-relaxed">
                        Acepto los{" "}
                        <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                          términos y condiciones
                        </Link>{" "}
                        y la{" "}
                        <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                          política de privacidad
                        </Link>
                      </Label>
                    </div>
                    {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms}</p>}

                    <div className="flex justify-between pt-6">
                      <Button
                        type="button"
                        onClick={handlePrevStep}
                        variant="outline"
                        className="h-12 px-8 font-medium bg-transparent"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                      </Button>
                      <Button
                        type="submit"
                        className="h-12 px-8 text-white font-medium"
                        style={{ backgroundColor: "#2563EB" }}
                        disabled={isLoading}
                      >
                        {isLoading ? "Creando cuenta..." : "Crear cuenta de proveedor"}
                      </Button>
                    </div>
                  </div>
                )}

                <p className="text-center text-sm text-gray-600 mt-4">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                    Inicia sesión
                  </Link>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

