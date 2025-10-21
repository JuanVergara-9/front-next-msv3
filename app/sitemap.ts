import type { MetadataRoute } from 'next'
import { ProvidersService } from '@/lib/services/providers.service'

const SITE = 'https://miservicio.ar'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/categorias`, changeFrequency: 'weekly', priority: 0.6 },
  ]

  try {
    const categories = await ProvidersService.getCategories()
    for (const c of categories) {
      urls.push({ url: `${SITE}/categorias/${c.slug}`, changeFrequency: 'daily', priority: 0.7 })
    }
  } catch {}

  // Para no sobrecargar, incluir últimos N proveedores (ids no sensibles)
  try {
    const res = await ProvidersService.searchProviders({ limit: 50, offset: 0 })
    const providers = Array.isArray((res as any)?.providers) ? (res as any).providers : []
    for (const p of providers) {
      if (p?.id) urls.push({ url: `${SITE}/proveedores/${p.id}`, changeFrequency: 'weekly', priority: 0.5 })
    }
  } catch {}

  return urls
}


