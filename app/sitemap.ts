import type { MetadataRoute } from 'next'
import { ProvidersService } from '@/lib/services/providers.service'

const SITE = 'https://miservicio.ar'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE}/pedidos/nuevo`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/sobre`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE}/legal/terminos`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE}/legal/privacidad`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  // Dynamic Categories
  try {
    const categories = await ProvidersService.getCategories()
    for (const c of categories) {
      if (c.slug) {
        urls.push({
          url: `${SITE}/categorias/${c.slug}`,
          changeFrequency: 'daily',
          priority: 0.7
        })
      }
    }
  } catch (error) {
    console.error('Sitemap: Error fetching categories', error)
  }

  // Dynamic Providers (Top 100)
  try {
    const res = await ProvidersService.searchProviders({ limit: 100, offset: 0 })
    const providers = Array.isArray(res?.providers) ? res.providers : []
    for (const p of providers) {
      if (p?.id) {
        urls.push({
          url: `${SITE}/proveedores/${p.id}`,
          changeFrequency: 'weekly',
          priority: 0.5
        })
      }
    }
  } catch (error) {
    console.error('Sitemap: Error fetching providers', error)
  }

  return urls
}



