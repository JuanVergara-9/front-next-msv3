"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProvidersService } from "@/lib/services/providers.service";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, MapPin, AlertCircle, User, Zap, CheckCircle, Star, BadgeCheck } from "lucide-react";
import type { ProviderWithDetails } from "@/types/api";
import { ReviewsService, type ReviewItem } from "@/lib/services/reviews.service";

const TICKETS_API_URL =
  process.env.NEXT_PUBLIC_TICKETS_API_URL ||
  "https://notification-service2-production.up.railway.app/api/v1";

interface Ticket {
  id: number;
  phone_number: string;
  category: string;
  category_slug?: string | null;
  description: string;
  zone: string;
  urgency: string;
  status: string;
  source?: string;
  created_at: string;
}

type ProviderMatch = ProviderWithDetails & { is_pro?: boolean };

export default function MatchPage() {
  const params = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [providers, setProviders] = useState<ProviderMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileModalProvider, setProfileModalProvider] = useState<ProviderMatch | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [assignedProvider, setAssignedProvider] = useState<ProviderMatch | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const id = params?.id;
      if (!id || typeof id !== "string") {
        setError("Enlace inválido");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const ticketRes = await fetch(`${TICKETS_API_URL}/tickets/${id}`);
        if (!ticketRes.ok) {
          if (ticketRes.status === 404) {
            setError("Pedido no encontrado");
            return;
          }
          throw new Error("Error al cargar el pedido");
        }
        const ticketJson = await ticketRes.json();
        const ticketData = ticketJson.data as Ticket;
        if (!ticketData || cancelled) return;
        setTicket(ticketData);

        // Búsqueda usa el slug oficial del matchmaking (category_slug). Título sigue con category para que suene natural.
        const categorySlug =
          ticketData.category_slug != null && String(ticketData.category_slug).trim() !== ''
            ? String(ticketData.category_slug).trim()
            : ticketData.category
              ? String(ticketData.category)
                  .toLowerCase()
                  .trim()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/\s+/g, '-')
              : undefined;
        const searchResult = await ProvidersService.searchProviders({
          category_slug: categorySlug,
          city: ticketData.zone,
          limit: 20,
        });
        console.log('Datos del provider-service:', searchResult);
        const list = Array.isArray(searchResult?.providers) ? searchResult.providers : [];
        if (!cancelled) setProviders(list as ProviderMatch[]);
      } catch (e) {
        if (!cancelled) {
          setError("No pudimos cargar los datos. Revisa el enlace o intenta más tarde.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params?.id]);

  // Cargar reseñas cuando se abre el modal de perfil
  useEffect(() => {
    if (!profileModalProvider?.id) {
      setReviews([]);
      return;
    }
    let cancelled = false;
    setLoadingReviews(true);
    setReviews([]);
    ReviewsService.listByProvider(profileModalProvider.id, { limit: 20 })
      .then((res) => {
        if (!cancelled && res?.items) setReviews(res.items);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingReviews(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profileModalProvider?.id]);

  const ticketId = params?.id;

  const handleAssign = async (provider: ProviderMatch) => {
    if (!ticketId || typeof ticketId !== "string") return;
    const providerName = [provider.first_name, provider.last_name].filter(Boolean).join(" ") || "el profesional";
    const providerPhone = provider.whatsapp_e164 ?? provider.phone_e164 ?? undefined;
    setIsAssigning(true);
    setAssignError(null);
    try {
      const res = await fetch(`${TICKETS_API_URL}/tickets/${ticketId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider.id,
          providerName,
          providerPhone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Error al asignar");
      }
      if (res.status === 200 || res.status === 201) {
        setAssignedProvider(provider);
        setIsSuccess(true);
      }
      setProviders([]);
      setProfileModalProvider(null);
    } catch (e) {
      console.error("Error al asignar:", e);
      setAssignError(e instanceof Error ? e.message : "No se pudo completar la asignación. Intentá de nuevo.");
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Cargando...</p>
          <p className="text-sm text-slate-500 mt-1">Buscando profesionales para tu pedido</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-amber-800">
              <AlertCircle className="h-10 w-10 shrink-0" />
              <div>
                <h2 className="font-semibold text-lg">No se pudo cargar el pedido</h2>
                <p className="text-sm mt-1">{error || "Pedido no encontrado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryLabel = ticket.category || "servicio";
  const zoneLabel = ticket.zone || "tu zona";

  const assignedName = assignedProvider
    ? [assignedProvider.first_name, assignedProvider.last_name].filter(Boolean).join(" ") || "el profesional"
    : "";

  const whatsappBotNumber = (process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER || "5492604800958").replace(/\D/g, "");
  const whatsappBotUrl = `https://wa.me/${whatsappBotNumber}`;

  function PantallaDeExito() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-emerald-200 bg-emerald-50/50 shadow-lg">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
              <CheckCircle className="h-10 w-10 text-emerald-600" aria-hidden />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              ¡Perfecto! Elegiste a {assignedName}
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed mb-6">
              Ya le enviamos tu pedido y tu número. En los próximos minutos se pondrá en contacto con vos por WhatsApp para coordinar los detalles y el presupuesto.
            </p>
            <a
              href={whatsappBotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 transition-colors"
            >
              Volver a mi WhatsApp
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {!isSuccess ? (
        <div className="max-w-3xl mx-auto px-4 py-8">
          {assignError && (
          <Card className="mb-6 border-amber-200 bg-amber-50/50">
            <CardContent className="pt-4 pb-4 flex items-center gap-3 text-amber-800">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{assignError}</p>
            </CardContent>
          </Card>
        )}
        <header className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Encontramos estos profesionales para tu pedido de{" "}
            <span className="text-primary">{categoryLabel}</span> en{" "}
            <span className="text-primary">{zoneLabel}</span>
          </h1>
          {ticket.urgency && (
            <p className="mt-2 text-slate-600 flex items-center justify-center gap-1">
              <MapPin className="h-4 w-4" />
              Urgencia: {ticket.urgency}
            </p>
          )}
        </header>

        {providers.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="py-12 text-center text-slate-600">
              <User className="h-12 w-12 mx-auto mb-3 text-slate-400" />
              <p className="font-medium">Aún no hay profesionales disponibles para este pedido</p>
              <p className="text-sm mt-1">Prueba más tarde o ajusta categoría/zona.</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {providers.map((provider) => {
              const name = [provider.first_name, provider.last_name].filter(Boolean).join(" ") || "Profesional";
              const initials = name
                .split(" ")
                .map((s) => s[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <li key={provider.id}>
                  <Card className="h-full flex flex-col overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="pt-6 pb-2 flex flex-col items-center text-center">
                      <Avatar className="h-20 w-20 border-2 border-primary/20">
                        <AvatarImage src={provider.avatar_url} alt={name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg text-slate-800 mt-3">{name}</h3>
                      <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                        {typeof provider.years_experience === "number" && (
                          <span className="text-sm text-slate-600">
                            {provider.years_experience} años de experiencia
                          </span>
                        )}
                        {(provider as ProviderMatch).is_pro && (
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-white shrink-0">
                            Pro
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="mt-auto pt-2 pb-6 px-6 flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setProfileModalProvider(provider)}
                      >
                        Ver Perfil
                      </Button>
                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => handleAssign(provider)}
                        disabled={isAssigning}
                      >
                        {isAssigning ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Asignando...
                          </>
                        ) : (
                          "Elegir"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
        </div>
      ) : (
        <PantallaDeExito />
      )}

      {/* Modal de perfil del profesional (solo cuando no hay éxito) */}
      {!isSuccess && (
      <Dialog open={!!profileModalProvider} onOpenChange={(open) => !open && setProfileModalProvider(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {profileModalProvider && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 border-2 border-primary/20 shrink-0">
                    <AvatarImage src={profileModalProvider.avatar_url} alt="" />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                      {[profileModalProvider.first_name, profileModalProvider.last_name]
                        .filter(Boolean)
                        .join(" ")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-left text-lg flex items-center gap-2">
                      {[profileModalProvider.first_name, profileModalProvider.last_name].filter(Boolean).join(" ") || "Profesional"}
                      {(profileModalProvider.identity_status === "verified" || (profileModalProvider as { isVerified?: boolean }).isVerified) && (
                        <span title="Trabajador Verificado" className="inline-flex" aria-label="Trabajador Verificado">
                          <BadgeCheck className="w-5 h-5 text-blue-500 shrink-0" aria-hidden />
                        </span>
                      )}
                    </DialogTitle>
                    {/* Calificación real del backend */}
                    <div className="flex items-center gap-2 mt-2">
                      {(() => {
                        const avg = Number(profileModalProvider.average_rating ?? profileModalProvider.rating ?? 0);
                        const total = Number(profileModalProvider.total_reviews ?? profileModalProvider.review_count ?? 0);
                        const displayAvg = avg > 0 ? avg.toFixed(1) : "0.0";
                        return (
                          <>
                            <div className="flex gap-0.5" aria-label={`Valoración ${displayAvg} de 5`}>
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i <= Math.round(avg) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                                  strokeWidth={1.5}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-slate-600">
                              {displayAvg} ({total} {total === 1 ? "reseña" : "reseñas"})
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {/* Badges de confianza */}
              <div className="flex flex-wrap gap-2">
                {(profileModalProvider as any).is_certified && (
                  <Badge className="gap-1.5 bg-violet-700 hover:bg-violet-800 text-white border-0">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Profesional Verificado
                  </Badge>
                )}
                {profileModalProvider.identity_status === "verified" && (
                  <Badge className="gap-1.5 bg-sky-600 hover:bg-sky-700 text-white border-0">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Identidad verificada
                  </Badge>
                )}
                {profileModalProvider.emergency_available && (
                  <Badge className="gap-1.5 bg-orange-500 hover:bg-orange-600 text-white border-0">
                    <Zap className="h-3.5 w-3.5" />
                    Atiende Emergencias 24h
                  </Badge>
                )}
              </div>

              {/* Descripción y experiencia con tipografía legible */}
              <div className="space-y-4">
                {profileModalProvider.description && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Sobre el profesional</h4>
                    <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap">
                      {profileModalProvider.description}
                    </p>
                  </div>
                )}
                {typeof profileModalProvider.years_experience === "number" && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Experiencia</h4>
                    <p className="text-slate-700 font-medium">
                      {profileModalProvider.years_experience} años de experiencia
                    </p>
                  </div>
                )}
              </div>

              {/* Últimas reseñas (reales desde el backend) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Últimas reseñas</h4>
                {loadingReviews ? (
                  <div className="flex items-center gap-2 py-4 text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Cargando reseñas...</span>
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-slate-500 py-2">
                    Este profesional aún no tiene reseñas, ¡sé el primero en calificarlo!
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {reviews.map((review) => {
                      const source = (review as ReviewItem & { source?: string }).source;
                      const createdAt = review.created_at
                        ? new Date(review.created_at).toLocaleDateString("es-AR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "";
                      return (
                        <li key={review.id} className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${i <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                                  strokeWidth={1.5}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-500">{createdAt}</span>
                            {source === "whatsapp" && (
                              <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                ✅ Trabajo verificado por miservicio
                              </span>
                            )}
                          </div>
                          {review.comment && (
                            <p className="text-sm text-slate-600 leading-relaxed">
                              &quot;{review.comment}&quot;
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setProfileModalProvider(null)}
                >
                  Cerrar
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => handleAssign(profileModalProvider)}
                  disabled={isAssigning}
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Asignando...
                    </>
                  ) : (
                    "Elegir"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
}
