"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProviderProfilePage } from "@/components/ProviderProfilePage"
import { ProvidersService } from "@/lib/services/providers.service"

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
      <div className="min-h-screen bg-gradient-to-br from-[#2F66F5] via-[#3b82f6] to-[#2563EB] flex items-center justify-center text-white">
        Cargando proveedor...
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2F66F5] via-[#3b82f6] to-[#2563EB] flex items-center justify-center text-white">
        {error || "Proveedor no encontrado"}
      </div>
    )
  }

  return <ProviderProfilePage providerProfile={profile} />
}


