"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProviderProfilePage } from "@/components/ProviderProfilePage"
import { ProvidersService } from "@/lib/services/providers.service"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

export default function ProviderPublicPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const idNum = Number((params?.id || "").toString())
        if (!idNum) {
          setError("Proveedor no encontrado")
          return
        }
        const data = await ProvidersService.getProvider(idNum)
        setProfile(data as any)
      } catch (e: any) {
        setError("No se pudo cargar el proveedor")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [params?.id])

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-[#2F66F5] via-[#3b82f6] to-[#2563EB] flex items-center justify-center text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 mx-auto mb-4" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Cargando proveedor...
          </motion.p>
        </motion.div>
      </motion.div>
    )
  }

  if (error || !profile) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-[#2F66F5] via-[#3b82f6] to-[#2563EB] flex items-center justify-center text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className="text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {error || "Proveedor no encontrado"}
          </motion.p>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ProviderProfilePage providerProfile={profile} />
    </motion.div>
  )
}


