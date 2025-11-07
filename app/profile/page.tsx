"use client"

import { useAuth } from "@/contexts/AuthContext"
import { UserProfilePage } from "@/components/UserProfilePage"
import { ProviderProfilePage } from "@/components/ProviderProfilePage"
import { motion, AnimatePresence } from "framer-motion"

export default function ProfilePage() {
  const { user, isLoading, isProvider, providerProfile } = useAuth()

  if (isLoading) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-[#2F66F5] via-[#3b82f6] to-[#2563EB] flex items-center justify-center"
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
          <div className="mx-auto mb-4 w-12 h-12 relative">
            <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
          </div>
          <motion.p 
            className="text-white text-lg font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Cargando perfil...
          </motion.p>
        </motion.div>
      </motion.div>
    )
  }

  if (!user) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-[#2F66F5] via-[#3b82f6] to-[#2563EB] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <motion.h1 
            className="text-2xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            No estás autenticado
          </motion.h1>
          <motion.p 
            className="text-white/80 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            Inicia sesión para ver tu perfil
          </motion.p>
          <motion.a 
            href="/auth/login" 
            className="bg-white text-[#2563EB] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Iniciar sesión
          </motion.a>
        </motion.div>
      </motion.div>
    )
  }

  // Renderizar el perfil según el tipo de usuario
  return (
    <AnimatePresence mode="wait">
      {isProvider ? (
        <motion.div
          key="provider-profile"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <ProviderProfilePage providerProfile={providerProfile || undefined} />
        </motion.div>
      ) : (
        <motion.div
          key="user-profile"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <UserProfilePage />
        </motion.div>
      )}
    </AnimatePresence>
  )
}