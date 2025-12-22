import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const host = 'https://miservicio.ar'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/profile/',
        '/chat/',
        '/mensajes/',
        '/api/',
      ],
    },
    sitemap: `${host}/sitemap.xml`,
    host,
  }
}



