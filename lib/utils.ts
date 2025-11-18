import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Capitaliza la primera letra de cada palabra en un texto
 * Ejemplo: "lucero nievas" -> "Lucero Nievas"
 */
export function capitalizeWords(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim()
}

/**
 * Normaliza un nombre completo capitalizando cada palabra
 * Maneja casos especiales como apellidos compuestos
 */
export function normalizeFullName(
  fullName: string | null | undefined,
  firstName?: string | null,
  lastName?: string | null
): string {
  if (fullName) {
    return capitalizeWords(fullName)
  }
  
  const parts = [firstName, lastName].filter(Boolean)
  if (parts.length === 0) return ''
  
  return parts.map(part => capitalizeWords(part)).join(' ')
}

/**
 * Normaliza el nombre de una ciudad capitalizando cada palabra
 * Ejemplo: "san Rafael" -> "San Rafael"
 */
export function normalizeCity(city: string | null | undefined): string {
  if (!city) return ''
  return capitalizeWords(city)
}