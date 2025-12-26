/**
 * SEO Configuration for miservicio.ar
 * Centralized configuration for localized SEO with scalable architecture
 */

// ============================================
// VALIDATED CITIES (expand as we grow)
// ============================================
export interface ValidatedCity {
    name: string;
    slug: string;
    province: string;
    provinceSlug: string;
}

export const VALIDATED_CITIES: ValidatedCity[] = [
    { name: 'San Rafael', slug: 'san-rafael', province: 'Mendoza', provinceSlug: 'mendoza' },
    // Add more cities as the platform expands:
    // { name: 'Mendoza Capital', slug: 'mendoza-capital', province: 'Mendoza', provinceSlug: 'mendoza' },
    // { name: 'General Alvear', slug: 'general-alvear', province: 'Mendoza', provinceSlug: 'mendoza' },
];

// ============================================
// PROVINCES OF ARGENTINA
// ============================================
export interface Province {
    name: string;
    slug: string;
}

export const PROVINCES: Province[] = [
    { name: 'Buenos Aires', slug: 'buenos-aires' },
    { name: 'Catamarca', slug: 'catamarca' },
    { name: 'Chaco', slug: 'chaco' },
    { name: 'Chubut', slug: 'chubut' },
    { name: 'Ciudad Autónoma de Buenos Aires', slug: 'caba' },
    { name: 'Córdoba', slug: 'cordoba' },
    { name: 'Corrientes', slug: 'corrientes' },
    { name: 'Entre Ríos', slug: 'entre-rios' },
    { name: 'Formosa', slug: 'formosa' },
    { name: 'Jujuy', slug: 'jujuy' },
    { name: 'La Pampa', slug: 'la-pampa' },
    { name: 'La Rioja', slug: 'la-rioja' },
    { name: 'Mendoza', slug: 'mendoza' },
    { name: 'Misiones', slug: 'misiones' },
    { name: 'Neuquén', slug: 'neuquen' },
    { name: 'Río Negro', slug: 'rio-negro' },
    { name: 'Salta', slug: 'salta' },
    { name: 'San Juan', slug: 'san-juan' },
    { name: 'San Luis', slug: 'san-luis' },
    { name: 'Santa Cruz', slug: 'santa-cruz' },
    { name: 'Santa Fe', slug: 'santa-fe' },
    { name: 'Santiago del Estero', slug: 'santiago-del-estero' },
    { name: 'Tierra del Fuego', slug: 'tierra-del-fuego' },
    { name: 'Tucumán', slug: 'tucuman' },
];

// ============================================
// SERVICE CATEGORIES FOR SEO
// ============================================
export interface SeoCategory {
    name: string;
    slug: string;
    pluralName: string; // For titles like "Los mejores Plomeros..."
}

export const SEO_CATEGORIES: SeoCategory[] = [
    { name: 'Plomería', slug: 'plomeria', pluralName: 'Plomeros' },
    { name: 'Gasistas', slug: 'gasistas', pluralName: 'Gasistas' },
    { name: 'Electricidad', slug: 'electricidad', pluralName: 'Electricistas' },
    { name: 'Jardinería', slug: 'jardineria', pluralName: 'Jardineros' },
    { name: 'Mantenimiento de Piletas', slug: 'mantenimiento-limpieza-piletas', pluralName: 'Especialistas en Piletas' },
    { name: 'Reparación de Electrodomésticos', slug: 'reparacion-electrodomesticos', pluralName: 'Técnicos en Electrodomésticos' },
    { name: 'Carpintería', slug: 'carpinteria', pluralName: 'Carpinteros' },
    { name: 'Pintura', slug: 'pintura', pluralName: 'Pintores' },
    { name: 'Albañilería', slug: 'albanileria', pluralName: 'Albañiles' },
    { name: 'Herrería', slug: 'herreria', pluralName: 'Herreros' },
    { name: 'Fletes y Mudanzas', slug: 'fletes-mudanzas', pluralName: 'Fleteros' },
    { name: 'Limpieza', slug: 'limpieza', pluralName: 'Profesionales de Limpieza' },
    { name: 'Aire Acondicionado', slug: 'aire-acondicionado', pluralName: 'Técnicos en Aire Acondicionado' },
    { name: 'Cerrajería', slug: 'cerrajeria', pluralName: 'Cerrajeros' },
    { name: 'Vidriería', slug: 'vidrieria', pluralName: 'Vidrieros' },
];

// ============================================
// SEO TEMPLATES
// ============================================
export const SEO_TEMPLATES = {
    // For /servicios/[categoria]/[provincia]/[ciudad]
    localizedService: {
        title: (category: string, city: string, province: string) =>
            `Los mejores ${category} en ${city}, ${province} | miservicio.ar`,
        description: (category: string, city: string, province: string) =>
            `Encontrá ${category.toLowerCase()} verificados en ${city}, ${province}. Publicá tu pedido gratis y recibí presupuestos en minutos. ¡Resolvé hoy con miservicio.ar!`,
        h1: (category: string, city: string, province: string) =>
            `Los mejores ${category} en ${city}, ${province}`,
    },

    // For home page
    home: {
        title: 'Profesionales y Oficios de Confianza en Argentina | miservicio.ar',
        description: 'Publicá tu pedido gratis y recibí presupuestos de profesionales verificados en tu zona en minutos. Plomeros, electricistas, fletes y más. Resolvé hoy con miservicio.ar.',
        h1Dynamic: (city: string) => `Resolvé cualquier problema en tu hogar en ${city} hoy.`,
        h1Fallback: 'Resolvé cualquier problema en tu hogar hoy.',
    },

    // For category pages /categorias/[slug]
    category: {
        title: (category: string) => `${category} cerca de vos | miservicio.ar`,
        description: (category: string) =>
            `Encontrá los mejores ${category.toLowerCase()} en tu zona. Compará precios, leé reseñas y contactá profesionales verificados. ¡Publicá tu pedido gratis!`,
    },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get validated city by slugs
 */
export function getValidatedCity(
    provinceSlug: string,
    citySlug: string
): ValidatedCity | null {
    return VALIDATED_CITIES.find(
        c => c.provinceSlug === provinceSlug && c.slug === citySlug
    ) || null;
}

/**
 * Get SEO category by slug
 */
export function getSeoCategory(slug: string): SeoCategory | null {
    return SEO_CATEGORIES.find(c => c.slug === slug) || null;
}

/**
 * Get province by slug
 */
export function getProvince(slug: string): Province | null {
    return PROVINCES.find(p => p.slug === slug) || null;
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str: string): string {
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Generate optimized alt text for images
 */
export function getOptimizedAlt(
    service: string,
    city?: string,
    context?: string
): string {
    if (city && context) {
        return `${context} de ${service} en ${city}`;
    }
    if (city) {
        return `${service} en ${city}`;
    }
    return service;
}

/**
 * Get all valid URL combinations for sitemap
 */
export function getAllLocalizedUrls(): Array<{
    categoria: string;
    provincia: string;
    ciudad: string;
}> {
    const urls: Array<{ categoria: string; provincia: string; ciudad: string }> = [];

    for (const city of VALIDATED_CITIES) {
        for (const category of SEO_CATEGORIES) {
            urls.push({
                categoria: category.slug,
                provincia: city.provinceSlug,
                ciudad: city.slug,
            });
        }
    }

    return urls;
}
