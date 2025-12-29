/**
 * Optimized Image Alt Component
 * Generates SEO-friendly alt text for images based on context
 */

import Image, { ImageProps } from 'next/image';
import { getOptimizedAlt } from '@/lib/seo-config';

interface OptimizedImageProps extends Omit<ImageProps, 'alt'> {
    service?: string;
    city?: string;
    context?: string;
    alt?: string; // Optional override
}

/**
 * Image component with optimized alt text for SEO
 * Automatically generates descriptive alt text based on context
 */
export function OptimizedImage({
    service,
    city,
    context,
    alt,
    ...props
}: OptimizedImageProps) {
    const optimizedAlt = alt || getOptimizedAlt(service || 'Servicio', city, context);

    return <Image alt={optimizedAlt} {...props} />;
}

interface ImageWithAltProps {
    src: string;
    service?: string;
    city?: string;
    context?: string;
    alt?: string;
    className?: string;
    width?: number;
    height?: number;
    loading?: 'lazy' | 'eager';
}

/**
 * Simple img tag with optimized alt text (for when Next/Image isn't suitable)
 */
export function ImageWithAlt({
    src,
    service,
    city,
    context,
    alt,
    className,
    width,
    height,
    loading = 'lazy',
}: ImageWithAltProps) {
    const optimizedAlt = alt || getOptimizedAlt(service || 'Servicio', city, context);

    return (
        <img
            src={src}
            alt={optimizedAlt}
            className={className}
            width={width}
            height={height}
            loading={loading}
        />
    );
}
