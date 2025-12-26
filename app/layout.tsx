import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/AuthContext'
import { CityProvider } from '@/contexts/CityContext'
import { UnreadCountProvider } from '@/contexts/UnreadCountContext'
import { BottomNavBar } from '@/components/BottomNavBar'
import { LayoutHeader } from '@/components/LayoutHeader'
import { Toaster } from '@/components/Toaster'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://miservicio.ar'),
  title: { default: 'Profesionales y Oficios de Confianza en Argentina | miservicio.ar', template: '%s | miservicio.ar' },
  description: 'Publicá tu pedido gratis y recibí presupuestos de profesionales verificados en tu zona en minutos. Plomeros, electricistas, fletes y más. Resolvé hoy con miservicio.ar.',
  keywords: 'servicios, profesionales, plomería, electricidad, gasistas, jardinería, mantenimiento, San Rafael, Mendoza, Argentina, presupuestos gratis',
  generator: 'miservicio.ar',
  authors: [{ name: 'miservicio.ar' }],
  creator: 'miservicio.ar',
  publisher: 'miservicio.ar',
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  icons: {
    icon: [{ url: '/logo-transparente-wuachin.png' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }]
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/',
    title: 'Profesionales y Oficios de Confianza en Argentina | miservicio.ar',
    description: 'Publicá tu pedido gratis y recibí presupuestos de profesionales verificados en tu zona en minutos. Plomeros, electricistas, fletes y más.',
    siteName: 'miservicio.ar',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'miservicio.ar - Profesionales y Oficios de Confianza en Argentina',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Profesionales y Oficios de Confianza en Argentina | miservicio.ar',
    description: 'Publicá tu pedido gratis y recibí presupuestos de profesionales verificados en tu zona en minutos.',
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
        {(() => {
          const orgLd = {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "miservicio.ar",
            url: "https://miservicio.ar",
            logo: "https://miservicio.ar/logo.png",
            description: "Plataforma para conectar personas con profesionales de oficios verificados en Argentina.",
            areaServed: {
              "@type": "Country",
              name: "Argentina",
            },
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer support",
              url: "https://miservicio.ar",
              availableLanguage: "Spanish",
            },
          }
          const websiteLd = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "miservicio",
            url: "https://miservicio.ar",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://miservicio.ar/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }
          return (
            <>
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
            </>
          )
        })()}
        <AuthProvider>
          <CityProvider>
            <UnreadCountProvider>
              <div className="min-h-screen flex flex-col overflow-x-hidden">
                <LayoutHeader />
                <main className="flex-1">
                  {children}
                </main>
                <BottomNavBar />
              </div>
            </UnreadCountProvider>
          </CityProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
