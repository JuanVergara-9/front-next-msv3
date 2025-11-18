"use client"

import { useState, useEffect, useRef } from "react"
import { ProvidersService } from '@/lib/services/providers.service'
import { UserProfileService } from '@/lib/services/user-profile.service'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '../components/Header'
import { ProviderCard } from '../components/ProviderCard'
import type { ProviderWithDetails } from '../types/api'
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from "react-hot-toast"

// Componente de efecto typewriter para oficios
const TypewriterText = ({ words, className = "" }: { words: string[]; className?: string }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(150)

  useEffect(() => {
    const currentWord = words[currentWordIndex]
    
    if (!isDeleting && currentText === currentWord) {
      // Pausa antes de empezar a borrar
      setTimeout(() => setIsDeleting(true), 2000)
      return
    }

    if (isDeleting && currentText === "") {
      // Cambiar a la siguiente palabra
      setIsDeleting(false)
      setCurrentWordIndex((prev) => (prev + 1) % words.length)
      setTypingSpeed(150)
      return
    }

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setCurrentText(currentWord.substring(0, currentText.length - 1))
        setTypingSpeed(75) // Más rápido al borrar
      } else {
        setCurrentText(currentWord.substring(0, currentText.length + 1))
        setTypingSpeed(150) // Velocidad normal al escribir
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed])

  return (
    <span className={className}>
      {currentText}
    </span>
  )
}

// Categories with icons for the UI
const CATEGORIES_WITH_ICONS = [
  { name: "Gasista", icon: "🔥" },
  { name: "Plomería", icon: "🔧" },
  { name: "Electricista", icon: "⚡" },
  { name: "Pintura", icon: "🎨" },
  { name: "Carpintería", icon: "🪚" },
  { name: "Reparación de Electrodomésticos", icon: "🔌" },
  { name: "Construcción", icon: "🏗️" },
  { name: "Limpieza", icon: "🧹" },
  { name: "Jardinería", icon: "🌱" },
  { name: "Informática", icon: "💻" },
]

// Subcomponents

const HowItWorks = () => {
  const steps = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      title: "Buscá",
      description: "Describí qué necesitás o elegí una categoría",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      title: "Explorá",
      description: "Mirá perfiles verificados, calificaciones reales y ubicaciones",
      color: "from-primary to-secondary",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      title: "Contactá",
      description: "Hablá directamente y coordiná el trabajo",
      color: "from-green-500 to-green-600",
    },
  ]

  const mobileWrapperRef = useRef<HTMLDivElement | null>(null)
  const currentIndexRef = useRef<number>(0)
  const pausedUntilRef = useRef<number>(0)

  const scrollToIndex = (index: number) => {
    const container = mobileWrapperRef.current
    if (!container) return
    const width = container.clientWidth
    container.scrollTo({ left: index * width, behavior: 'smooth' })
    currentIndexRef.current = index
  }

  const handleNext = () => {
    const next = (currentIndexRef.current + 1) % steps.length
    scrollToIndex(next)
  }

  const handlePrev = () => {
    const prev = (currentIndexRef.current - 1 + steps.length) % steps.length
    scrollToIndex(prev)
  }

  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() >= pausedUntilRef.current) handleNext()
    }, 2500)
    // position at the first slide on mount
    scrollToIndex(0)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const el = mobileWrapperRef.current
    if (!el) return
    const onInteract = () => { pausedUntilRef.current = Date.now() + 4000 }
    const onScroll = () => {
      const width = el.clientWidth || 1
      currentIndexRef.current = Math.round(el.scrollLeft / width)
    }
    el.addEventListener('touchstart', onInteract, { passive: true } as any)
    el.addEventListener('mousedown', onInteract)
    el.addEventListener('wheel', onInteract, { passive: true } as any)
    el.addEventListener('scroll', onScroll, { passive: true } as any)
    return () => {
      el.removeEventListener('touchstart', onInteract)
      el.removeEventListener('mousedown', onInteract)
      el.removeEventListener('wheel', onInteract)
      el.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <motion.section 
      className="px-4 py-12 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-x-visible overflow-y-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"></div>
      <div className="max-w-7xl mx-auto text-center relative">
        <motion.div 
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6 premium-shadow"
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Tu punto de encuentro con servicios de calidad en tu zona
        </motion.div>

        <motion.h2 
          className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Conectamos personas con{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            profesionales locales
          </span>
        </motion.h2>
        <motion.p 
          className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto text-pretty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          La plataforma más confiable para encontrar servicios de calidad en tu zona
        </motion.p>

        <div className="md:hidden -mx-4 pb-8 relative overflow-x-auto overflow-y-visible scroll-smooth snap-x snap-mandatory" ref={mobileWrapperRef}>
          <div className="absolute inset-y-0 left-2 flex items-center z-10">
            <button
              onClick={handlePrev}
              aria-label="Anterior"
              className="w-9 h-9 rounded-full bg-white/90 text-foreground border border-border premium-shadow flex items-center justify-center active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div className="absolute inset-y-0 right-2 flex items-center z-10">
            <button
              onClick={handleNext}
              aria-label="Siguiente"
              className="w-9 h-9 rounded-full bg-white/90 text-foreground border border-border premium-shadow flex items-center justify-center active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="flex">
            {steps.map((step, index) => (
              <div key={step.title} className="min-w-full snap-start flex items-center justify-center" style={{ scrollSnapAlign: 'center' }}>
                <div className="group flex flex-col items-center text-center w-full px-4 max-w-sm mx-auto">
                  <div className="relative w-fit mx-auto pt-2">
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mb-6 mx-auto premium-shadow-lg group-hover:scale-110 transition-all duration-300 smooth-bounce overflow-visible`}
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <div className="text-white overflow-visible">{step.icon}</div>
                    </div>
                    <div className="absolute top-0 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-primary premium-shadow">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-pretty max-w-xs mx-auto">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:grid grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={step.title} 
              className="group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <div className="relative w-fit mx-auto pt-2">
                <motion.div
                  className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mb-6 mx-auto premium-shadow-lg overflow-visible`}
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                >
                  <div className="text-white overflow-visible">{step.icon}</div>
                </motion.div>
                <motion.div 
                  className="absolute top-0 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-primary premium-shadow"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.1, type: "spring" }}
                >
                  {index + 1}
                </motion.div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-pretty">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60">
        <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-visible">
          <svg className="w-5 h-5 text-primary overflow-visible" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          Profesionales verificados
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-visible">
          <svg className="w-5 h-5 text-primary overflow-visible" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Servicios seguros
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-visible">
          <svg className="w-5 h-5 text-primary overflow-visible" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Soporte 24/7
        </div>
      </div>
      </div>
    </motion.section>
  )
}

const SearchSection = ({
  query,
  onQueryChange,
  onSearch,
}: {
  query: string
  onQueryChange: (query: string) => void
  onSearch: () => void
}) => (
  <motion.section 
    className="px-4 py-8 bg-background"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
  >
    <div className="max-w-2xl mx-auto">
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <p className="text-lg md:text-xl text-muted-foreground">
          Encontrá{" "}
          <TypewriterText 
            words={["plomeros", "gasistas", "electricistas", "pintores", "carpinteros", "jardineros"]}
            className="text-primary font-semibold"
          />{" "}
          cerca de ti
        </p>
      </motion.div>
      <div className="relative">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-xl"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="relative bg-card rounded-3xl p-4 md:p-6 premium-shadow-lg border border-border/50"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="¿Qué necesitás hoy? (plomería, electricidad…)"
                className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-input text-foreground placeholder:text-muted-foreground text-base md:text-lg"
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                aria-label="Buscar servicios"
              />
            </div>
            <motion.button
              onClick={onSearch}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-2xl hover:bg-primary/90 hover:shadow-lg transition-all duration-200 font-semibold text-base md:text-lg premium-shadow cursor-pointer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Buscar
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  </motion.section>
)

const SkeletonCard = () => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-pulse flex flex-col h-full">
    <div className="flex gap-4 mb-4 flex-1">
      <div className="w-16 h-16 bg-gray-200 rounded-2xl flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3 mt-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
      </div>
    </div>
    <div className="mb-4 flex gap-2">
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
    </div>
    <div className="flex gap-3 mt-auto">
      <div className="flex-1 h-12 bg-gray-200 rounded-2xl"></div>
      <div className="flex-1 h-12 bg-gray-200 rounded-2xl"></div>
    </div>
  </div>
)


const EmptyState = ({ onSearchCityWide, onViewCategories }: { onSearchCityWide: () => void; onViewCategories: () => void }) => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 premium-shadow">
      <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-foreground mb-3">¡Aún no hay proveedores en tu zona!</h3>
    <p className="text-muted-foreground mb-6 max-w-md mx-auto text-pretty">
      Estamos trabajando para traer los mejores profesionales a tu área. 
      Mientras tanto, probá con otros términos de búsqueda.
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button onClick={onSearchCityWide} className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium cursor-pointer">
        Buscar en toda la ciudad
      </button>
      <button onClick={onViewCategories} className="px-6 py-3 border border-primary text-primary rounded-xl hover:bg-primary/10 transition-colors font-medium cursor-pointer">
        Ver categorías
      </button>
    </div>
  </div>
)

// Categories section removed from Home per product decision

const ProvidersList = ({
  providers,
  loading,
  onContact,
  onSearchCityWide,
  onViewCategories,
}: {
  providers: ProviderWithDetails[]
  loading: boolean
  onContact: (provider: ProviderWithDetails) => void
  onSearchCityWide: () => void
  onViewCategories: () => void
}) => (
  <motion.section 
    className="px-4 py-4 flex-1"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.6 }}
  >
    <div className="max-w-7xl mx-auto">
      <motion.h2 
        className="text-lg font-semibold text-foreground mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        Cerca de mí
      </motion.h2>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="md:hidden -mx-4 px-4 overflow-x-auto">
              <div className="flex snap-x snap-mandatory snap-always space-x-4 pr-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="min-w-[85%] snap-center"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                  >
                    <SkeletonCard />
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <SkeletonCard />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : providers.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EmptyState onSearchCityWide={onSearchCityWide} onViewCategories={onViewCategories} />
          </motion.div>
        ) : (
          <motion.div
            key="providers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="md:hidden -mx-4 px-4 overflow-x-auto pb-4">
              <div className="flex snap-x snap-mandatory snap-always space-x-4 pr-4 pb-2 items-stretch">
                {providers.map((provider, index) => (
                  <motion.div 
                    key={provider.id} 
                    className="min-w-[85%] snap-center h-full"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <ProviderCard provider={provider} onContact={onContact} />
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
              {providers.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  className="h-full"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1, type: "spring", stiffness: 100 }}
                >
                  <ProviderCard provider={provider} onContact={onContact} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.section>
)


// Componente de botón de feedback reutilizable
const FeedbackButton = () => {
  const { user } = useAuth()
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'bug' as 'bug' | 'feature_request' | 'complaint' | 'other',
    subject: '',
    message: '',
  })

  // Si no hay usuario, no mostrar el botón
  if (!user) return null

  return (
    <>
      <button
        onClick={() => setIsFeedbackModalOpen(true)}
        className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
      >
        Reportar problema
      </button>

      {/* Modal para reportar problema */}
      <Dialog 
        open={isFeedbackModalOpen} 
        onOpenChange={(open) => {
          setIsFeedbackModalOpen(open)
          if (!open) {
            setFeedbackForm({
              type: 'bug',
              subject: '',
              message: '',
            })
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reportar problema</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-type">Tipo de reporte</Label>
              <Select
                value={feedbackForm.type}
                onValueChange={(value: 'bug' | 'feature_request' | 'complaint' | 'other') => 
                  setFeedbackForm({ ...feedbackForm, type: value })
                }
              >
                <SelectTrigger id="feedback-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Error o bug</SelectItem>
                  <SelectItem value="feature_request">Solicitud de funcionalidad</SelectItem>
                  <SelectItem value="complaint">Queja o problema</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-subject">Asunto</Label>
              <Input
                id="feedback-subject"
                value={feedbackForm.subject}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, subject: e.target.value })}
                placeholder="Describe brevemente el problema"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-message">Mensaje</Label>
              <Textarea
                id="feedback-message"
                value={feedbackForm.message}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                placeholder="Describe el problema o sugerencia en detalle"
                rows={6}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsFeedbackModalOpen(false)}
                disabled={isSubmittingFeedback}
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  if (!feedbackForm.subject.trim() || !feedbackForm.message.trim()) {
                    toast.error('Por favor completa todos los campos')
                    return
                  }

                  try {
                    setIsSubmittingFeedback(true)
                    await UserProfileService.submitFeedback(feedbackForm)
                    toast.success('Reporte enviado correctamente. Gracias por tu feedback.')
                    setIsFeedbackModalOpen(false)
                    setFeedbackForm({
                      type: 'bug',
                      subject: '',
                      message: '',
                    })
                  } catch (error: any) {
                    console.error('Error submitting feedback:', error)
                    toast.error(error?.message || 'Error al enviar el reporte. Intenta nuevamente.')
                  } finally {
                    setIsSubmittingFeedback(false)
                  }
                }}
                disabled={isSubmittingFeedback || !feedbackForm.subject.trim() || !feedbackForm.message.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmittingFeedback ? 'Enviando...' : 'Enviar reporte'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Main component
export default function MiservicioHome() {
  const { user } = useAuth()
  const router = useRouter()
  const [city, setCity] = useState<string>("")
  const [query, setQuery] = useState<string>("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [providers, setProviders] = useState<ProviderWithDetails[]>([])
  const [filtered, setFiltered] = useState<ProviderWithDetails[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const handleSearchCityWide = async () => {
    try {
      setLoading(true)
      const searchParams: any = { limit: 24 }
      // Buscar por ciudad actual si la tenemos resuelta
      if (city && city.includes(',')) {
        searchParams.city = city.split(',')[0].trim()
      }
      const response = await ProvidersService.searchProviders(searchParams)
      let transformedProviders = response.providers.map(provider => ({
        ...provider,
        full_name: `${provider.first_name} ${provider.last_name}`,
        rating: provider.rating || 0,
        review_count: provider.review_count || 0,
        distance_km: undefined,
        categories: provider.category ? [provider.category.name] : [],
        avatar_url: (provider as any).avatar_url,
      }))

      transformedProviders = await ProvidersService.enrichWithReviewSummaries(transformedProviders)
      setProviders(transformedProviders)
      setFiltered(transformedProviders)
    } catch (e) {
      console.warn('City-wide search failed:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleViewCategories = () => {
    window.location.href = '/categorias'
  }

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // 1) Intentar obtener ubicación del usuario
        let location: { lat: number; lng: number } | null = null
        try {
          location = await ProvidersService.getCurrentLocation()
          setUserLocation(location)
        } catch (locationError) {
          console.warn('Could not get location:', locationError)
        }

        // 2) Preparar parámetros de búsqueda (usar la variable local para no depender del setState)
        const searchParams: any = { limit: 6 }
        if (location) {
          searchParams.lat = location.lat
          searchParams.lng = location.lng
          searchParams.radius_km = 50 // 50km radius
        }

        // 3) Resolver en paralelo: reverse geocoding (si hay coords) y providers
        const [cityName, response] = await Promise.all([
          location
            ? ProvidersService.getCityFromCoords(location.lat, location.lng).catch(() => 'Mi ubicación')
            : Promise.resolve('San Rafael, Mendoza'),
          ProvidersService.searchProviders(searchParams),
        ])

        setCity(cityName || 'San Rafael, Mendoza')

        // 4) Transform backend data to UI format (usar location local para distancia)
        let transformedProviders = response.providers.map(provider => ({
          ...provider,
          full_name: `${provider.first_name} ${provider.last_name}`,
          rating: provider.rating || 0,
          review_count: provider.review_count || 0,
          distance_km: location
            ? ProvidersService.calculateDistance(
                location.lat,
                location.lng,
                provider.lat || 0,
                provider.lng || 0
              )
            : undefined,
          categories: provider.category ? [provider.category.name] : [],
          avatar_url: (provider as any).avatar_url,
        }))

        transformedProviders = await ProvidersService.enrichWithReviewSummaries(transformedProviders)

        // 4b) Fallback: si no hay resultados cerca, probar por ciudad detectada
        if (transformedProviders.length === 0 && (cityName || '').includes(',')) {
          try {
            const onlyCity = (cityName || '').split(',')[0].trim()
            if (onlyCity) {
              const r2 = await ProvidersService.searchProviders({ city: onlyCity, limit: 6 })
              transformedProviders = r2.providers.map(provider => ({
                ...provider,
                full_name: `${provider.first_name} ${provider.last_name}`,
                rating: provider.rating || 0,
                review_count: provider.review_count || 0,
                distance_km: undefined,
                categories: provider.category ? [provider.category.name] : [],
                avatar_url: (provider as any).avatar_url,
              }))

              transformedProviders = await ProvidersService.enrichWithReviewSummaries(transformedProviders)
            }
          } catch (e) {
            console.warn('City fallback failed', e)
          }
        }

        setProviders(transformedProviders)
        setFiltered(transformedProviders)
      } catch (err) {
        console.warn('Error loading data from backend:', err)
        // No usar datos mock; dejar lista vacía para validación
        setProviders([])
        setFiltered([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter providers based on query and category
  useEffect(() => {
    let result = providers

    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      result = result.filter(
        (provider) =>
          provider.full_name.toLowerCase().includes(searchTerm) ||
          (provider.description && provider.description.toLowerCase().includes(searchTerm)) ||
          provider.categories.some((cat) => cat.toLowerCase().includes(searchTerm)),
      )
    }

    if (activeCategory) {
      result = result.filter((provider) => provider.categories.includes(activeCategory))
    }

    setFiltered(result)
  }, [query, activeCategory, providers])

  const handleSearch = async () => {
    if (!query.trim()) return
    
    // Si ya hay proveedores filtrados localmente, simplemente hacer scroll a los resultados
    // El filtro en tiempo real ya está funcionando
    if (filtered.length > 0) {
      // Hacer scroll suave a la sección de proveedores
      // Buscar el h2 que contiene "Cerca de mí" y hacer scroll a su sección padre
      const headings = Array.from(document.querySelectorAll('h2'))
      const cercaHeading = headings.find(h2 => h2.textContent?.includes('Cerca de mí'))
      if (cercaHeading) {
        const section = cercaHeading.closest('section')
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
      return
    }
    
    // Si no hay proveedores filtrados, hacer búsqueda en el backend
    try {
      setLoading(true)
      const searchParams: any = {
        query: query.trim()
      }
      
      if (userLocation) {
        searchParams.lat = userLocation.lat
        searchParams.lng = userLocation.lng
        searchParams.radius_km = 50
      }
      
      const response = await ProvidersService.searchProviders(searchParams)
      
      let transformedProviders = response.providers.map(provider => ({
        ...provider,
        full_name: `${provider.first_name} ${provider.last_name}`,
        rating: provider.rating || 0,
        review_count: provider.review_count || 0,
        distance_km: userLocation ? 
          ProvidersService.calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            provider.lat || 0, 
            provider.lng || 0
          ) : undefined,
        categories: provider.category ? [provider.category.name] : [],
        avatar_url: (provider as any).avatar_url
      }))

      transformedProviders = await ProvidersService.enrichWithReviewSummaries(transformedProviders)
      
      setProviders(transformedProviders)
      setFiltered(transformedProviders)
    } catch (err) {
      console.warn('Error searching, using current providers:', err)
      // En caso de error en búsqueda, mantener los proveedores actuales
      // No mostrar error, solo log en consola
    } finally {
      setLoading(false)
    }
  }

  const handleContact = (provider: ProviderWithDetails) => {
    if (!user) {
      const next = `/proveedores/${provider.id}`
      router.push(`/auth/login?next=${encodeURIComponent(next)}`)
      return
    }
    if (provider.whatsapp_e164) {
      const message = encodeURIComponent("Hola 👋, te contacto desde miservicio. Vi tu perfil y me interesa tu servicio, quería hacerte una consulta rápida.")
      window.open(`https://wa.me/${provider.whatsapp_e164}?text=${message}`, "_blank")
    } else if (provider.phone_e164) {
      window.open(`tel:${provider.phone_e164}`, "_blank")
    } else if (provider.contact_email) {
      window.open(`mailto:${provider.contact_email}`, "_blank")
    } else {
      // Si no hay datos de contacto, redirigir al perfil donde pueden ver más información
      router.push(`/proveedores/${provider.id}`)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Algo salió mal</h2>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }



  const isFilteredView = query.trim().length > 0 || !!activeCategory

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header city={city} />
      <HowItWorks />
      <SearchSection query={query} onQueryChange={setQuery} onSearch={handleSearch} />
      <ProvidersList providers={isFilteredView ? filtered : filtered.slice(0, 6)} loading={loading} onContact={handleContact} onSearchCityWide={handleSearchCityWide} onViewCategories={handleViewCategories} />
      
      {/* Secciones combinadas - Mejor layout en desktop */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Card de Proveedores */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-card to-muted/50 rounded-3xl p-8 md:p-10 text-center premium-shadow-lg border border-border/50 h-full flex flex-col">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto mb-6 premium-shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">¿Ofrecés servicios profesionales?</h3>
                <p className="text-base text-muted-foreground mb-6 flex-grow">
                  Únete a miles de profesionales que ya confían en miservicio. Crea tu perfil gratis y empieza a recibir clientes hoy mismo.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Registro gratuito
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Sin comisiones ocultas
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Soporte dedicado
                  </div>
                </div>
                <Link href="/auth/register?provider=1" className="inline-block">
                  <motion.div 
                    className="group/crear relative px-8 py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-2xl font-bold text-lg premium-shadow-lg cursor-pointer hover:shadow-2xl hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-200 ease-out overflow-hidden"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">Crear perfil profesional</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover/crear:opacity-100 transition-opacity duration-200"></div>
                  </motion.div>
                </Link>
              </div>
            </div>

            {/* Card de Sobre */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-card to-muted/50 rounded-3xl p-8 md:p-10 text-center premium-shadow-lg border border-border/50 h-full flex flex-col">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto mb-6 premium-shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">¿Querés saber más sobre miservicio?</h3>
                <p className="text-base text-muted-foreground mb-6 flex-grow">
                  Conocé nuestra historia, misión y cómo estamos digitalizando los oficios locales en San Rafael, Mendoza.
                </p>
                <Link href="/sobre" className="inline-block">
                  <motion.div 
                    className="group/sobre relative px-8 py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-2xl font-bold text-lg premium-shadow-lg cursor-pointer hover:shadow-2xl hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-200 ease-out overflow-hidden"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Más sobre miservicio
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover/sobre:opacity-100 transition-opacity duration-200"></div>
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Botón "Reportar problema" - Sutil al final */}
      <div className="text-center py-6 pb-8">
        <FeedbackButton />
      </div>
    </div>
  )
}
