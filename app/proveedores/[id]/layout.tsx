import type { Metadata } from 'next'
import { ProvidersService } from '@/lib/services/providers.service'

const SITE_URL = 'https://miservicio.ar'

function truncate(text: string | undefined, length = 160): string | undefined {
  if (!text) return undefined
  return text.length > length ? `${text.slice(0, length - 1)}…` : text
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = Number(params.id)
  if (!Number.isFinite(id)) {
    return {
      title: 'Proveedor',
      robots: { index: false, follow: true },
      alternates: { canonical: `/proveedores/${params.id}` },
    }
  }

  try {
    const p: any = await ProvidersService.getProvider(id)
    const name = [p?.first_name, p?.last_name].filter(Boolean).join(' ').trim() || 'Proveedor'
    const categoryName = Array.isArray(p?.categories) && p.categories.length
      ? (p.categories[0]?.name || 'Servicios')
      : (p?.category?.name || 'Servicios')
    const city = p?.city
    const title = `${name} — ${categoryName}${city ? ` en ${city}` : ''}`
    const description = truncate(p?.description || `Encontrá ${categoryName}${city ? ` en ${city}` : ''}.`)
    const urlPath = `/proveedores/${id}`
    const image = p?.avatar_url || '/logo.png'

    return {
      title,
      description,
      alternates: { canonical: urlPath },
      openGraph: {
        type: 'profile',
        url: urlPath,
        title,
        description,
        images: [image],
      },
      twitter: { card: 'summary_large_image', title, description },
      robots: { index: true, follow: true },
    }
  } catch {
    return {
      title: 'Proveedor',
      alternates: { canonical: `/proveedores/${id}` },
      robots: { index: true, follow: true },
    }
  }
}

export default async function ProviderLayout(
  { children, params }: { children: React.ReactNode; params: { id: string } }
) {
  let jsonLd: any = null
  try {
    const id = Number(params.id)
    if (Number.isFinite(id)) {
      const p: any = await ProvidersService.getProvider(id)
      const name = [p?.first_name, p?.last_name].filter(Boolean).join(' ').trim() || 'Proveedor'
      const url = `${SITE_URL}/proveedores/${id}`
      const city = p?.city || ''
      const province = p?.province || 'Mendoza'
      const phone = p?.phone_e164 || p?.whatsapp_e164 || undefined
      const ratingValue = p?.rating
      const reviewCount = p?.review_count

      jsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name,
        url,
        image: p?.avatar_url || undefined,
        telephone: phone,
        address: {
          "@type": "PostalAddress",
          addressLocality: city || undefined,
          addressRegion: province || undefined,
          addressCountry: "AR",
        },
        aggregateRating: (ratingValue != null && reviewCount != null) ? {
          "@type": "AggregateRating",
          ratingValue,
          reviewCount,
        } : undefined,
      }
    }
  } catch {}

  return (
    <>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}
      {children}
    </>
  )
}


