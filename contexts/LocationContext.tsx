"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ProvidersService } from '@/lib/services/providers.service'

interface LocationContextType {
    city: string
    setCity: (city: string) => void
    location: { lat: number; lng: number } | null
    loading: boolean
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

const LOCATION_CACHE_KEY = 'miservicio_user_location'
const CITY_CACHE_KEY = 'miservicio_user_city'

export function LocationProvider({ children }: { children: ReactNode }) {
    const [city, setCity] = useState<string>('Argentina')
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadLocation = async () => {
            try {
                // 1) Check localStorage cache first
                const cachedLocation = localStorage.getItem(LOCATION_CACHE_KEY)
                const cachedCity = localStorage.getItem(CITY_CACHE_KEY)

                if (cachedLocation && cachedCity) {
                    setLocation(JSON.parse(cachedLocation))
                    setCity(cachedCity)
                    setLoading(false)
                    return
                }

                // 2) Get fresh location from IP
                const freshLocation = await ProvidersService.getCurrentLocation()
                setLocation(freshLocation)
                localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(freshLocation))

                // 3) Get city name
                const cityName = await ProvidersService.getCityFromCoords(
                    freshLocation.lat,
                    freshLocation.lng
                ).catch(() => 'Mi ubicación')

                setCity(cityName)
                localStorage.setItem(CITY_CACHE_KEY, cityName)
            } catch (error) {
                console.warn('Could not get location:', error)
                setCity('Argentina')
            } finally {
                setLoading(false)
            }
        }

        loadLocation()
    }, [])

    return (
        <LocationContext.Provider value={{ city, setCity, location, loading }}>
            {children}
        </LocationContext.Provider>
    )
}

export function useLocation() {
    const context = useContext(LocationContext)
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider')
    }
    return context
}
