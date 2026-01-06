import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Autenticación - miservicio",
  description: "Inicia sesión o regístrate en miservicio para acceder a los mejores servicios profesionales",
  robots: { index: false, follow: true },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4 py-8 md:py-12">
        {children}
      </main>
    </div>
  )
}

