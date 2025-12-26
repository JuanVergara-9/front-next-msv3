/**
 * JSON-LD Schema Components for SEO
 * Reusable components for generating structured data
 */

import type { SeoCategory, Province, ValidatedCity } from '@/lib/seo-config';

interface ServiceSchemaProps {
    category: SeoCategory;
    province: Province;
    city: ValidatedCity;
    description: string;
}

/**
 * Generate Service JSON-LD schema for localized service pages
 */
export function ServiceSchema({ category, province, city, description }: ServiceSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: category.name,
        description,
        provider: {
            '@type': 'Organization',
            name: 'miservicio.ar',
            url: 'https://miservicio.ar',
        },
        areaServed: {
            '@type': 'City',
            name: city.name,
            containedInPlace: {
                '@type': 'AdministrativeArea',
                name: province.name,
            },
        },
        serviceType: category.name,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface LocalBusinessSchemaProps {
    name: string;
    description: string;
    city: string;
    province: string;
    category?: string;
    rating?: number;
    reviewCount?: number;
    imageUrl?: string;
}

/**
 * Generate LocalBusiness JSON-LD schema for provider profiles
 */
export function LocalBusinessSchema({
    name,
    description,
    city,
    province,
    category,
    rating,
    reviewCount,
    imageUrl,
}: LocalBusinessSchemaProps) {
    const schema: Record<string, any> = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name,
        description,
        address: {
            '@type': 'PostalAddress',
            addressLocality: city,
            addressRegion: province,
            addressCountry: 'AR',
        },
    };

    if (category) {
        schema.category = category;
    }

    if (rating && reviewCount) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: rating.toFixed(1),
            reviewCount,
            bestRating: '5',
            worstRating: '1',
        };
    }

    if (imageUrl) {
        schema.image = imageUrl;
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface BreadcrumbSchemaProps {
    items: Array<{
        name: string;
        url: string;
    }>;
}

/**
 * Generate BreadcrumbList JSON-LD schema
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
