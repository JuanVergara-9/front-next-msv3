'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BadgeCheck, MapPin, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProviderCard } from '@/components/ProviderCard';
import { ProvidersService } from '@/lib/services/providers.service';
import type { ProviderWithDetails } from '@/types/api';
import type { SeoCategory, Province, ValidatedCity } from '@/lib/seo-config';

interface LocalizedServiceContentProps {
    category: SeoCategory;
    province: Province;
    city: ValidatedCity;
    h1: string;
}

export function LocalizedServiceContent({
    category,
    province,
    city,
    h1,
}: LocalizedServiceContentProps) {
    const router = useRouter();
    const [providers, setProviders] = useState<ProviderWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [onlyLicensed, setOnlyLicensed] = useState(false);

    useEffect(() => {
        async function fetchProviders() {
            try {
                setLoading(true);
                const res = await ProvidersService.searchProviders({
                    category_slug: category.slug,
                    city: city.name,
                    limit: 24,
                    offset: 0,
                    licensed: onlyLicensed,
                });

                const raw = Array.isArray((res as any)?.providers) ? (res as any).providers : [];

                // Normalize provider data
                let normalized = raw.map((p: any) => {
                    const categoryNames = Array.isArray(p?.categories)
                        ? p.categories.map((c: any) => typeof c === 'string' ? c : (c?.name || '')).filter(Boolean)
                        : (p?.category && p.category.name ? [p.category.name] : []);
                    return {
                        ...p,
                        full_name: p.full_name || [p.first_name, p.last_name].filter(Boolean).join(' '),
                        categories: categoryNames,
                        rating: p.rating || 0,
                        review_count: p.review_count || 0,
                    };
                });

                normalized = await ProvidersService.enrichWithReviewSummaries(normalized);
                setProviders(normalized);
            } catch (error) {
                console.error('Error fetching providers:', error);
                setProviders([]);
            } finally {
                setLoading(false);
            }
        }

        fetchProviders();
    }, [category.slug, city.name, onlyLicensed]);

    const handleContact = (provider: ProviderWithDetails) => {
        if (provider.whatsapp_e164) {
            const message = encodeURIComponent(
                `Hola! Te contacto desde miservicio.ar. Vi tu perfil de ${category.name} en ${city.name} y me interesa tu servicio.`
            );
            window.open(`https://wa.me/${provider.whatsapp_e164}?text=${message}`, '_blank');
        } else if (provider.phone_e164) {
            window.open(`tel:${provider.phone_e164}`, '_blank');
        } else {
            router.push(`/proveedores/${provider.id}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Sticky Header */}
            <motion.div
                className="glass-effect border-b border-white/20 sticky top-0 z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 shrink-0"
                                onClick={() => router.back()}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Volver</span>
                            </Button>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl sm:text-2xl font-bold break-words leading-tight text-[#0e315d]">
                                    {h1}
                                </h1>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{city.name}, {province.name}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                className={`gap-2 bg-transparent text-xs sm:text-sm ${onlyLicensed ? 'border-primary text-primary' : ''}`}
                                onClick={() => setOnlyLicensed(v => !v)}
                            >
                                <BadgeCheck className="h-4 w-4 shrink-0" />
                                <span className="hidden sm:inline">
                                    {onlyLicensed ? 'Solo matriculados: ON' : 'Solo matriculados'}
                                </span>
                                <span className="inline sm:hidden">Matriculados</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Bar */}
                <motion.div
                    className="flex items-center justify-between mb-6 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <div className="flex items-center gap-2 text-[#0e315d]">
                        <Users className="h-5 w-5" />
                        <span className="font-semibold">
                            {loading ? '...' : `${providers.length} profesionales disponibles`}
                        </span>
                    </div>
                    <Link
                        href="/pedidos/nuevo"
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        ¿No encontrás lo que buscás? Publicá tu pedido gratis →
                    </Link>
                </motion.div>

                {/* Provider Grid */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div
                                    key={i}
                                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-pulse"
                                >
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-5 bg-gray-200 rounded w-3/4" />
                                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                    <div className="h-12 bg-gray-200 rounded-xl" />
                                </div>
                            ))}
                        </motion.div>
                    ) : providers.length === 0 ? (
                        <motion.div
                            key="empty"
                            className="text-center py-16"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0e315d] mb-3">
                                Aún no hay {category.pluralName.toLowerCase()} en {city.name}
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Estamos trabajando para traer los mejores profesionales a tu zona.
                                Mientras tanto, ¡publicá tu pedido y los profesionales vendrán a vos!
                            </p>
                            <Link href="/pedidos/nuevo">
                                <Button className="bg-[#ff7b00] hover:bg-[#e66e00] text-white font-bold px-8 py-3 rounded-xl">
                                    Publicar Pedido Gratis
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="providers"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {providers.map((provider, index) => (
                                <motion.div
                                    key={provider.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                >
                                    <ProviderCard provider={provider} onContact={handleContact} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* CTA Footer */}
                <motion.div
                    className="mt-12 text-center p-8 bg-gradient-to-r from-[#0e315d] to-[#1a4a80] rounded-3xl text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h2 className="text-2xl font-bold mb-3">
                        ¿Necesitás {category.name.toLowerCase()} en {city.name}?
                    </h2>
                    <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                        Publicá tu pedido gratis y recibí presupuestos de profesionales verificados en minutos.
                        ¡Es 100% gratis y sin compromiso!
                    </p>
                    <Link href="/pedidos/nuevo">
                        <Button className="bg-[#ff7b00] hover:bg-[#e66e00] text-white font-bold px-10 py-4 rounded-xl text-lg">
                            Publicar Mi Pedido Gratis
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
