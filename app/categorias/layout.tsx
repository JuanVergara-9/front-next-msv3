import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Categorías de servicios — miservicio',
  description: 'Explorá las categorías de servicios disponibles en miservicio y encontrá profesionales verificados cerca tuyo.',
  alternates: { canonical: '/categorias' },
  openGraph: { url: '/categorias' },
  robots: { index: true, follow: true },
}

export default function CategoriasLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: 'Inicio', item: '/' },
      { "@type": "ListItem", position: 2, name: 'Categorías', item: '/categorias' },
    ],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {children}
    </>
  )
}


