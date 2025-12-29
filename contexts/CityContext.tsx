"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ProvidersService } from '@/lib/services/providers.service'

interface CityContextType {
    city: string
    setCity: (city: string) => void
    isLoading: boolean
}

const CityContext = createContext<CityContextType | undefined>(undefined)

export function CityProvider({ children }: { children: ReactNode }) {
    const [city, setCity] = useState<string>("San Rafael, Mendoza")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchCity() {
            try {
                const location = await ProvidersService.getCurrentLocation()
                const cityName = await ProvidersService.getCityFromCoords(location.lat, location.lng)
                setCity(cityName || "San Rafael, Mendoza")
            } catch (error) {
                console.warn('Could not get city from location:', error)
                // Keep default city
            } finally {
                setIsLoading(false)
            }
        }
        fetchCity()
    }, [])

    return (
        <CityContext.Provider value={{ city, setCity, isLoading }}>
            {children}
        </CityContext.Provider>
    )
}

export function useCity() {
    const context = useContext(CityContext)
    if (context === undefined) {
        throw new Error('useCity must be used within a CityProvider')
    }
    return context
}
