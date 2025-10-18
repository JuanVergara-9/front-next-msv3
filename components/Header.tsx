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
    <header className="sticky top-0 z-50 glass-effect border-b border-border/50 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/90">
      <div className="max-w-7xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="miservicio" className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="text-primary font-bold text-xl leading-none">miservicio</span>
          </div>
          {isAuthenticated && (
            <Button
              onClick={handleLogout}
              variant="outline"
              size="icon"
              className="sm:hidden"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1 truncate max-w-[60vw] sm:max-w-none">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="truncate">{city}</span>
          </div>

          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="truncate max-w-[240px]">{user?.email}</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-3 py-2 text-primary hover:text-primary/80 transition-all duration-200 font-semibold text-sm"
                aria-label="Iniciar sesión"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/register"
                className="hidden sm:inline-block px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 premium-shadow font-semibold text-sm"
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
