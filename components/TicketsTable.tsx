'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  MessageSquare, 
  Globe, 
  Clock, 
  User, 
  MapPin, 
  Tag, 
  AlertCircle,
  Loader2,
  RefreshCcw
} from 'lucide-react';

interface Ticket {
  id: number;
  phone_number: string;
  category: string;
  description: string;
  zone: string;
  urgency: string;
  status: string;
  source: 'whatsapp' | 'web';
  created_at: string;
}

const TICKETS_API_URL = process.env.NEXT_PUBLIC_TICKETS_API_URL || 'https://notification-service2-production.up.railway.app/api/v1';

export const TicketsTable = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${TICKETS_API_URL}/tickets`);
      if (response.data.success) {
        setTickets(response.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      setError('No se pudieron cargar los tickets. Verificá la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider";
    switch (status.toUpperCase()) {
      case 'ABIERTO':
        return <span className={`${baseClasses} bg-emerald-100 text-emerald-700`}>Abierto</span>;
      case 'CANCELADO':
        return <span className={`${baseClasses} bg-slate-100 text-slate-500`}>Cancelado</span>;
      case 'COMPLETADO':
        return <span className={`${baseClasses} bg-blue-100 text-blue-700`}>Completado</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-600`}>{status}</span>;
    }
  };

  const getSourceIcon = (source: string) => {
    if (source === 'whatsapp') {
      return (
        <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs uppercase">WhatsApp</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-blue-600 font-bold">
        <Globe className="w-4 h-4" />
        <span className="text-xs uppercase">Web</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-500 font-medium">Cargando tickets omnicanal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <p className="text-red-700 font-bold">{error}</p>
        <button 
          onClick={fetchTickets}
          className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="text-xl font-black text-[#0e315d]">Tickets Recientes</h3>
          <p className="text-sm text-slate-500 font-medium">Últimos 100 movimientos omnicanal</p>
        </div>
        <button 
          onClick={fetchTickets}
          className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-primary border border-transparent hover:border-slate-100"
          title="Actualizar tickets"
          aria-label="Actualizar tickets"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white">
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">ID</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Fecha</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Origen</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Categoría</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Cliente</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Zona</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-400 font-medium">
                  No hay tickets registrados aún.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4 text-sm font-bold text-slate-400">#{ticket.id}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#0e315d]">
                        {format(new Date(ticket.created_at), 'dd/MM/yyyy', { locale: es })}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {format(new Date(ticket.created_at), 'HH:mm', { locale: es })} hs
                      </span>
                    </div>
                  </td>
                  <td className="p-4">{getSourceIcon(ticket.source)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Tag className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-[#0e315d]">{ticket.category}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{ticket.phone_number}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{ticket.zone}</span>
                    </div>
                  </td>
                  <td className="p-4">{getStatusBadge(ticket.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
