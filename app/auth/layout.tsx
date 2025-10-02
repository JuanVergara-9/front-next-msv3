import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Autenticación - MiServicio",
  description: "Inicia sesión o regístrate en MiServicio para acceder a los mejores servicios profesionales",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      {children}
    </div>
  )
}

