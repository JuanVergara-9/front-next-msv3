"use client"

import { useCity } from '@/contexts/CityContext'
import { Header } from '@/components/Header'

export function LayoutHeader() {
    const { city } = useCity()
    return <Header city={city} />
}
