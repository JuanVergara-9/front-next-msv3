"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { LogOut, User, MessageSquare, LayoutDashboard, Home, Zap, PlusCircle, ChevronDown, MapPin, Settings, HelpCircle, Shield } from "lucide-react"
import { usePathname } from "next/navigation"
import { useUnreadCount } from "@/contexts/UnreadCountContext"
import { isAdmin } from "@/lib/utils/admin"
import { motion } from "framer-motion"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  city: string
}

export const Header = ({ city }: HeaderProps) => {
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const pathname = usePathname()
  const { unreadCount } = useUnreadCount()
  const admin = isAdmin(user)

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

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center bg-slate-50/50 p-1 rounded-2xl border border-slate-200/50 backdrop-blur-sm relative">
          <Link
            href="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${pathname === "/"
              ? "text-primary"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
          >
            <Home className="w-4 h-4" /> Inicio
            {pathname === "/" && (
              <motion.div
                layoutId="active-nav"
                className="absolute -bottom-[2px] left-4 right-4 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,123,255,0.4)]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>

          <Link
            href="/pedidos"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${pathname === "/pedidos"
              ? "text-primary"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Pedidos
            {pathname === "/pedidos" && (
              <motion.div
                layoutId="active-nav"
                className="absolute -bottom-[2px] left-4 right-4 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,123,255,0.4)]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>

          <Link
            href="/mensajes"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${pathname === "/mensajes"
              ? "text-primary"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
          >
            <div className="relative">
              <MessageSquare className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white border-2 border-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            Mensajes
            {pathname === "/mensajes" && (
              <motion.div
                layoutId="active-nav"
                className="absolute -bottom-[2px] left-4 right-4 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,123,255,0.4)]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>

          {admin && (
            <Link
              href="/admin/metrics"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${pathname === "/admin/metrics"
                ? "text-primary"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                }`}
            >
              <Zap className="w-4 h-4" /> Métricas
              {pathname === "/admin/metrics" && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute -bottom-[2px] left-4 right-4 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,123,255,0.4)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          )}
        </nav>

        {/* Ciudad - Oculta en desktop si está en el dropdown */}
        <div className="hidden lg:flex md:flex-none">
          <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50/50 border border-slate-200/50">
            <MapPin className="w-3.5 h-3.5 text-primary/70" />
            <span className="truncate max-w-[140px] sm:max-w-none text-center">{city}</span>
          </div>
        </div>

        {/* Acciones de usuario */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {isLoading ? (
            // Skeleton loader for auth state
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse hidden sm:block"></div>
              <div className="h-9 w-9 bg-slate-100 rounded-full animate-pulse border-2 border-slate-50"></div>
            </div>
          ) : isAuthenticated ? (
            <>
              {/* Publicar Pedido CTA */}
              <Link
                href="/pedidos/nuevo"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 premium-shadow text-sm font-bold"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden xl:inline">Publicar Pedido</span>
              </Link>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="relative h-10 w-10 rounded-full p-0 hover:bg-primary/5 focus:outline-none flex items-center justify-center transition-all">
                  <Avatar className="h-9 w-9 border-2 border-primary/10 transition-all hover:border-primary/30">
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{user?.email?.split('@')[0] || "Usuario"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      <span>Mi Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="lg:hidden flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">Ubicación: {city}</span>
                  </DropdownMenuItem>
                  {admin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/metrics" className="flex items-center gap-2 cursor-pointer">
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span>Panel Admin</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 text-slate-600 hover:text-primary transition-all duration-200 font-bold text-sm"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/register"
                className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-sm shadow-primary/20 font-bold text-sm"
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
