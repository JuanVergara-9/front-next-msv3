"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProvidersService } from "@/lib/services/providers.service";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MapPin, AlertCircle, User } from "lucide-react";
import type { ProviderWithDetails } from "@/types/api";

const TICKETS_API_URL =
  process.env.NEXT_PUBLIC_TICKETS_API_URL ||
  "https://notification-service2-production.up.railway.app/api/v1";

interface Ticket {
  id: number;
  phone_number: string;
  category: string;
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

        // Parámetros alineados con el bot: city=zone, category=slug en minúsculas
        const categorySlug = ticketData.category
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

  const handleChoose = (provider: ProviderMatch) => {
    console.log("Profesional elegido:", provider.id);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
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
                    <CardFooter className="mt-auto pt-2 pb-6 px-6">
                      <Button
                        className="w-full"
                        onClick={() => handleChoose(provider)}
                      >
                        Elegir a {provider.first_name || name}
                      </Button>
                    </CardFooter>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
