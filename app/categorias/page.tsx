"use client"

import { CategoriesSection } from "@/components/CategoriesSection"
import { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import { ProvidersService } from "@/lib/services/providers.service"

export default function CategoriesPage() {
  const [city, setCity] = useState<string>("")

  useEffect(() => {
    const loadCity = async () => {
      try {
        const location = await ProvidersService.getCurrentLocation()
        const cityName = await ProvidersService.getCityFromCoords(location.lat, location.lng)
        setCity(cityName)
      } catch (err) {
        setCity("San Rafael, Mendoza")
      }
    }
    loadCity()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header city={city} />
      <CategoriesSection />
    </div>
  )
}
