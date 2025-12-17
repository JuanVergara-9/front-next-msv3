"use client"

import { Header } from "@/components/Header"
import { useLocation } from "@/contexts/LocationContext"

export function LayoutHeader() {
    const { city } = useLocation()
    return <Header city={city} />
}
