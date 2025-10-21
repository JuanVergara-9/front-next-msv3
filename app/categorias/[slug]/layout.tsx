import type { Metadata } from 'next'
import { ProvidersService } from '@/lib/services/providers.service'

function humanize(text: string) {
  if (!text) return ''
  return text.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = (params?.slug || '').toString()
  try {
    const categories = await ProvidersService.getCategories()
    const cat = Array.isArray(categories) ? categories.find(c => c.slug === slug) : null
    const name = cat?.name || humanize(slug)
    const title = `${name} en tu zona`
    const description = `Encontrá ${name.toLowerCase()} cerca de vos. Compará profesionales, reseñas y contactá gratis.`
    const urlPath = `/categorias/${slug}`
    return {
      title,
      description,
      alternates: { canonical: urlPath },
      openGraph: { url: urlPath, title, description },
      twitter: { card: 'summary', title, description },
      robots: { index: true, follow: true },
    }
  } catch {
    const name = humanize(slug)
    return {
      title: `${name} — Profesionales`,
      alternates: { canonical: `/categorias/${slug}` },
      robots: { index: true, follow: true },
    }
  }
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
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


