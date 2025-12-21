"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useUnreadCount } from "@/hooks/use-unread-count"
import { isAdmin } from "@/lib/utils/admin"

interface BottomNavBarProps {
  activeCategory?: string | null
  onSelectCategory?: (category: string | null) => void
  onHomeClick?: () => void
  onCategoriesClick?: () => void
  onProfileClick?: () => void
}

export const BottomNavBar = React.memo(function BottomNavBar({
  activeCategory,
  onSelectCategory,
  onHomeClick,
  onCategoriesClick,
  onProfileClick
}: BottomNavBarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { unreadCount } = useUnreadCount()
  const admin = isAdmin(user)
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] glass-effect border-t border-border/50 px-4 py-3 bg-white md:hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-around">
          {[
            {
              name: "Inicio",
              href: "/",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              ),
              active: pathname === '/',
              onClick: onHomeClick,
            },
            {
              name: "Pedidos",
              href: "/pedidos",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              ),
              active: pathname === '/pedidos',
              onClick: onCategoriesClick,
            },
            {
              name: "Mensajes",
              href: "/mensajes",
              icon: (
                <div className="relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
              ),
              active: pathname?.startsWith('/mensajes'),
            },
            {
              name: "Perfil",
              href: "/profile",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              ),
              active: pathname === '/profile',
              onClick: onProfileClick,
            },
            // Admin: métricas
            ...(admin ? [{
              name: "Métricas",
              href: "/admin/metrics",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 19h16M4 19V5M8 19V13M12 19V9M16 19V7"
                  />
                </svg>
              ),
              active: pathname?.startsWith('/admin/metrics'),
            }] : []),
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              prefetch
              onClick={item.onClick}
              className={`flex flex-col items-center gap-1 py-3 px-6 rounded-2xl transition-all duration-200 ${item.active
                ? "text-white bg-primary premium-shadow"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              aria-current={item.active ? 'page' : undefined}
            >
              {item.icon}
              <span className="text-xs font-semibold">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
})
