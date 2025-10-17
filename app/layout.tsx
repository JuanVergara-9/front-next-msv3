import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/AuthContext'
import { BottomNavBar } from '@/components/BottomNavBar'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'MiServicio - Conectamos personas con profesionales locales',
  description: 'La plataforma más confiable para encontrar servicios de calidad en tu zona. Conectamos clientes con los mejores profesionales locales.',
  keywords: 'servicios, profesionales, plomería, electricidad, gasistas, jardinería, mantenimiento, San Rafael, Mendoza, Argentina',
  generator: 'miservicio.ar',
  authors: [{ name: 'MiServicio' }],
  creator: 'MiServicio',
  publisher: 'MiServicio',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://miservicio.ar',
    title: 'MiServicio - Conectamos personas con profesionales locales',
    description: 'La plataforma más confiable para encontrar servicios de calidad en tu zona.',
    siteName: 'MiServicio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiServicio - Conectamos personas con profesionales locales',
    description: 'La plataforma más confiable para encontrar servicios de calidad en tu zona.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
            <BottomNavBar />
            {/* Footer with legal links */}
            <footer className="bg-muted/30 border-t border-border/50 py-6 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex flex-wrap gap-6">
                    <Link href="/legal/terminos" className="hover:text-foreground transition-colors">
                      Términos y Condiciones
                    </Link>
                    <Link href="/legal/privacidad" className="hover:text-foreground transition-colors">
                      Política de Privacidad
                    </Link>
                  </div>
                  <div className="text-center sm:text-right">
                    <p>© 2025 MiServicio. Todos los derechos reservados.</p>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
