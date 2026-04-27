/**
 * Comercios aliados — insumos en San Rafael.
 *
 * Cómo agregar un logo:
 * 1. Guardá el archivo en: public/partners/insumos-san-rafael/  (ej. mi-logo.webp o .png)
 * 2. Agregá una entrada abajo con name, logoSrc (ruta pública) y opcionalmente href (web o Maps).
 *
 * Formatos recomendados: PNG/WebP con fondo transparente o blanco, ancho ~400–800px.
 */
export type InsumoPartnerSanRafael = {
  name: string
  /** Ruta desde la raíz del sitio, ej. /partners/insumos-san-rafael/nombre.webp */
  logoSrc: string
  /** Sitio web o enlace a Google Maps del local */
  href?: string
}

export const INSUMOS_SAN_RAFAEL_PARTNERS: InsumoPartnerSanRafael[] = [
  // Ejemplo (descomentá cuando tengas el archivo en public):
  // {
  //   name: 'Nombre del comercio',
  //   logoSrc: '/partners/insumos-san-rafael/ejemplo.webp',
  //   href: 'https://maps.google.com/...',
  // },
]
