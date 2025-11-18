"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

interface HeaderProps {
  city: string
}

export const Header = ({ city }: HeaderProps) => {
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-border/50 px-3 sm:px-4 py-3 sm:py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/90">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
          <img src="/logo.png" alt="miservicio" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-sm" />
          <span className="text-primary font-bold text-lg sm:text-xl leading-none hidden min-[360px]:inline">miservicio</span>
        </Link>

        {/* Ciudad - Centrada en móvil, a la derecha en desktop */}
        <div className="flex-1 flex justify-center sm:justify-end">
          <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 sm:bg-transparent">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="truncate max-w-[140px] sm:max-w-none text-center">{city}</span>
          </div>
        </div>

        {/* Acciones de usuario */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="truncate max-w-[180px] lg:max-w-[240px]">{user?.email}</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="icon"
                className="sm:hidden h-8 w-8"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Cerrar sesión</span>
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-primary hover:text-primary/80 transition-all duration-200 font-semibold text-xs sm:text-sm whitespace-nowrap"
                aria-label="Iniciar sesión"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/register"
                className="hidden sm:inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-lg sm:rounded-xl hover:bg-primary/90 transition-all duration-200 premium-shadow font-semibold text-xs sm:text-sm whitespace-nowrap"
                aria-label="Registrarse"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
