import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for IP-based location detection
 * Detects user's city from IP and sets cookies/headers for personalization
 */
export async function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Skip if already has geo cookie (to avoid repeated API calls)
    const existingGeo = request.cookies.get('geo_city')?.value;
    if (existingGeo) {
        return response;
    }

    // Get user's IP from headers (works in production with reverse proxies)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0].trim() || realIp || null;

    // Skip for localhost/private IPs in development
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        // Set default city for development
        response.cookies.set('geo_city', 'San Rafael', {
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
            sameSite: 'lax',
        });
        response.cookies.set('geo_province', 'Mendoza', {
            maxAge: 60 * 60 * 24,
            path: '/',
            sameSite: 'lax',
        });
        return response;
    }

    try {
        // Use free IP geolocation API (ip-api.com - 45 requests/minute free)
        // Note: In production, consider using a more reliable service or caching
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName`, {
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (geoResponse.ok) {
            const geoData = await geoResponse.json();

            if (geoData.status === 'success' && geoData.city) {
                response.cookies.set('geo_city', geoData.city, {
                    maxAge: 60 * 60 * 24, // 24 hours
                    path: '/',
                    sameSite: 'lax',
                });

                if (geoData.regionName) {
                    response.cookies.set('geo_province', geoData.regionName, {
                        maxAge: 60 * 60 * 24,
                        path: '/',
                        sameSite: 'lax',
                    });
                }
            }
        }
    } catch (error) {
        // Silently fail - geo detection is optional enhancement
        console.warn('[Middleware] Geo detection failed:', error);
    }

    return response;
}

// Only run middleware on specific paths (home page and service pages)
export const config = {
    matcher: [
        // Match home page
        '/',
        // Match service pages
        '/servicios/:path*',
        // Skip API routes, static files, etc.
    ],
};
