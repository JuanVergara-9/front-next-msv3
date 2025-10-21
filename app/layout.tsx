import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/AuthContext'
import { BottomNavBar } from '@/components/BottomNavBar'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://miservicio.ar'),
  title: { default: 'miservicio', template: '%s | miservicio' },
  description: 'La plataforma más confiable para encontrar servicios de calidad en tu zona. Conectamos clientes con los mejores profesionales locales.',
  keywords: 'servicios, profesionales, plomería, electricidad, gasistas, jardinería, mantenimiento, San Rafael, Mendoza, Argentina',
  generator: 'miservicio.ar',
  authors: [{ name: 'miservicio' }],
  creator: 'miservicio',
  publisher: 'miservicio',
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  icons: {
    icon: [ { url: '/logo-transparente-wuachin.png' } ],
    apple: [ { url: '/apple-touch-icon.png', sizes: '180x180' } ]
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/',
    title: 'miservicio - Conectamos personas con profesionales locales',
    description: 'La plataforma más confiable para encontrar servicios de calidad en tu zona.',
    siteName: 'miservicio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'miservicio - Conectamos personas con profesionales locales',
    description: 'La plataforma más confiable para encontrar servicios de calidad en tu zona.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
            <BottomNavBar />
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
