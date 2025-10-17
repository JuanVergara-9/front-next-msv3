"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
  return (
    <nav className="sticky bottom-0 glass-effect border-t border-border/50 px-4 py-3 bg-white">
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
              name: "Categorías",
              href: "/categorias",
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              ),
              active: pathname === '/categorias',
              onClick: onCategoriesClick,
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
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              prefetch
              onClick={item.onClick}
              className={`flex flex-col items-center gap-1 py-3 px-6 rounded-2xl transition-all duration-200 ${
                item.active
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
