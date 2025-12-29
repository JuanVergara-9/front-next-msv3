import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
    getSeoCategory,
    getValidatedCity,
    getProvince,
    SEO_TEMPLATES,
    getAllLocalizedUrls,
} from '@/lib/seo-config';

interface PageProps {
    params: Promise<{
        categoria: string;
        provincia: string;
        ciudad: string;
    }>;
}

// Generate static params for all validated city + category combinations
export async function generateStaticParams() {
    return getAllLocalizedUrls();
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { categoria, provincia, ciudad } = await params;

    const category = getSeoCategory(categoria);
    const province = getProvince(provincia);
    const city = getValidatedCity(provincia, ciudad);

    if (!category || !province || !city) {
        return {
            title: 'Servicio no encontrado | miservicio.ar',
        };
    }

    const title = SEO_TEMPLATES.localizedService.title(
        category.pluralName,
        city.name,
        province.name
    );
    const description = SEO_TEMPLATES.localizedService.description(
        category.pluralName,
        city.name,
        province.name
    );

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `/servicios/${categoria}/${provincia}/${ciudad}`,
            siteName: 'miservicio.ar',
            locale: 'es_AR',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
        alternates: {
            canonical: `/servicios/${categoria}/${provincia}/${ciudad}`,
        },
    };
}

export default async function LocalizedServicePage({ params }: PageProps) {
    const { categoria, provincia, ciudad } = await params;

    const category = getSeoCategory(categoria);
    const province = getProvince(provincia);
    const city = getValidatedCity(provincia, ciudad);

    // If any param is invalid, show 404
    if (!category || !province || !city) {
        notFound();
    }

    const h1 = SEO_TEMPLATES.localizedService.h1(
        category.pluralName,
        city.name,
        province.name
    );

    return (
        <>
            {/* JSON-LD Service Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Service',
                        name: category.name,
                        description: SEO_TEMPLATES.localizedService.description(
                            category.pluralName,
                            city.name,
                            province.name
                        ),
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
                    }),
                }}
            />

            {/* Render the client component for the actual content */}
            <LocalizedServiceContent
                category={category}
                province={province}
                city={city}
                h1={h1}
            />
        </>
    );
}

// Import and use client component for interactive content
import { LocalizedServiceContent } from './LocalizedServiceContent';
