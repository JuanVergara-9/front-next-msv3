import { apiFetch } from '../apiClient';
import type {
  Provider,
  ProviderWithDetails,
  SearchProvidersRequest,
  SearchProvidersResponse,
  Category,
  ContactIntent
} from '../../types/api';
import { ReviewsService } from './reviews.service';

export class ProvidersService {
  static async searchProviders(params: SearchProvidersRequest = {}): Promise<SearchProvidersResponse> {
    const usp = new URLSearchParams();
    if (params.query) usp.set('query', params.query);
    // Backend espera category (slug), no category_id
    if (params.category_slug) usp.set('category', params.category_slug);
    if (!params.category_slug && params.category_id) usp.set('category_id', params.category_id.toString());
    if (params.city) usp.set('city', params.city);
    if (params.lat) usp.set('lat', params.lat.toString());
    if (params.lng) usp.set('lng', params.lng.toString());
    if (params.radius_km) usp.set('radiusKm', params.radius_km.toString());
    if (params.limit) usp.set('limit', params.limit.toString());
    if (params.offset) usp.set('offset', params.offset.toString());
    if (params.licensed) usp.set('licensed', 'true');

    const url = `/api/v1/providers?${usp.toString()}`;
    // El backend responde { count, items }
    const res = await apiFetch<{ count: number; items: any[] }>(url);
    return { providers: res.items as any, total: res.count, page: 1, limit: params.limit || res.items?.length || 0 };
  }

  static async enrichWithReviewSummaries<T extends { id?: number | null; rating?: number; review_count?: number }>(providers: T[]): Promise<T[]> {
    if (!Array.isArray(providers) || providers.length === 0) return providers;

    const uniqueIds = Array.from(new Set(
      providers
        .map((p) => (typeof p?.id === 'number' ? p.id : null))
        .filter((id): id is number => id != null)
    ));

    if (uniqueIds.length === 0) return providers;

    const summaries = await Promise.allSettled(
      uniqueIds.map(async (id) => {
        const summary = await ReviewsService.getSummary(id);
        return {
          id,
          rating: Number(summary?.summary?.avgRating || 0) || 0,
          review_count: Number(summary?.summary?.count || 0) || 0,
        };
      })
    );

    const summaryMap = new Map<number, { rating: number; review_count: number }>();
    summaries.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const payload = result.value;
        summaryMap.set(payload.id, { rating: payload.rating, review_count: payload.review_count });
      }
    });

    if (summaryMap.size === 0) return providers;

    return providers.map((provider) => {
      if (!provider || typeof provider.id !== 'number') return provider;
      const summary = summaryMap.get(provider.id);
      if (!summary) return {
        ...provider,
        rating: provider.rating ?? 0,
        review_count: provider.review_count ?? 0,
      };
      return {
        ...provider,
        rating: summary.rating ?? provider.rating ?? 0,
        review_count: summary.review_count ?? provider.review_count ?? 0,
      };
    });
  }

  static async getProvider(id: number): Promise<ProviderWithDetails> {
    const response = await apiFetch<{ provider: ProviderWithDetails }>(`/api/v1/providers/${id}`, { cacheTtlMs: 0 })
    return response.provider
  }

  static async updateMyProviderProfile(updateData: {
    // mantener compatibilidad con backend
    first_name?: string;
    last_name?: string;
    contact_email?: string;
    phone_e164?: string;
    whatsapp_e164?: string;
    description?: string;
    province?: string;
    city?: string;
    address?: string;
    lat?: number;
    lng?: number;
    years_experience?: number;
    price_hint?: number;
    emergency_available?: boolean;
    is_licensed?: boolean;
    business_hours?: any;
    category_id?: number;
    category_ids?: number[];
  }): Promise<Provider> {
    const res = await apiFetch<{ provider: Provider }>(`/api/v1/providers/mine`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })
    return res.provider
  }

  static async getCategories(): Promise<Category[]> {
    const response = await apiFetch<{ items: Category[] }>('/api/v1/categories');
    return response.items;
  }

  static async createContactIntent(intent: Omit<ContactIntent, 'id' | 'created_at' | 'updated_at'>): Promise<ContactIntent> {
    return apiFetch<ContactIntent>('/api/v1/contact-intents', {
      method: 'POST',
      body: JSON.stringify(intent),
    });
  }

  // Helper para calcular distancia (Haversine formula)
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Helper para obtener ubicación del usuario por IP (no requiere permiso)
  static async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    try {
      const response = await fetch('https://ipapi.co/json/', {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000) // 5s timeout
      });

      if (response.ok) {
        const data = await response.json();
        if (data.latitude && data.longitude) {
          console.log('Location from IP:', data.city, data.region);
          return {
            lat: data.latitude,
            lng: data.longitude,
          };
        }
      }
      throw new Error('Invalid response from IP geolocation');
    } catch (error) {
      console.warn('IP geolocation failed:', error);
      throw new Error('Could not determine location');
    }
  }

  // Helper para obtener ciudad desde coordenadas (usando geolocation service)
  static async getCityFromCoords(lat: number, lng: number): Promise<string> {
    try {
      const response = await apiFetch<{ city: string; province: string }>(`/api/v1/geo/reverse?lat=${lat}&lng=${lng}`);
      return `${response.city}, ${response.province}`;
    } catch (error) {
      console.warn('Error getting city from coordinates:', error);
      return 'Ubicación no disponible';
    }
  }

  // Crear perfil de proveedor
  static async createProviderProfile(profileData: {
    category_id?: number; // Legacy support
    category_ids?: number[]; // New multiple categories
    first_name: string;
    last_name: string;
    contact_email?: string;
    phone_e164?: string;
    whatsapp_e164?: string;
    description?: string;
    province?: string;
    city?: string;
    address?: string;
    lat?: number;
    lng?: number;
    years_experience?: number;
    price_hint?: number;
    emergency_available?: boolean;
    is_licensed?: boolean;
    business_hours?: any;
  }): Promise<Provider> {
    return apiFetch<{ provider: Provider }>('/api/v1/providers/mine', {
      method: 'POST',
      body: JSON.stringify(profileData),
    }).then(response => response.provider);
  }

  // Obtener mi perfil de proveedor
  static async getMyProviderProfile(): Promise<Provider | null> {
    try {
      console.log('Fetching provider profile from /api/v1/providers/mine')
      const response = await apiFetch<{ provider: Provider }>('/api/v1/providers/mine');
      console.log('Provider profile response:', response)
      return response.provider;
    } catch (error) {
      console.error('Error fetching provider profile:', error)
      // Si no existe el perfil o hay un error, retornar null
      return null;
    }
  }

  // Subir avatar propio (multipart/form-data, field 'file')
  static async uploadMyAvatar(file: File): Promise<Provider> {
    const base = (process.env.NEXT_PUBLIC_GATEWAY_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000').replace(/\/+$/, '')
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${base}/api/v1/providers/mine/avatar`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      } as any,
      body: form,
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    return data.provider as Provider
  }

  static async deleteMyAvatar(): Promise<Provider> {
    const base = (process.env.NEXT_PUBLIC_GATEWAY_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000').replace(/\/+$/, '')
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const res = await fetch(`${base}/api/v1/providers/mine/avatar`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    return data.provider as Provider
  }

  // ---- Availability ----
  static async getProviderAvailability(id: number): Promise<{ businessHours: any; emergencyAvailable: boolean }> {
    const res = await apiFetch<{ availability: { businessHours: any; emergencyAvailable: boolean } }>(`/api/v1/providers/${id}/availability`, { cacheTtlMs: 0 });
    return res.availability;
  }

  static async getMyAvailability(): Promise<{ businessHours: any; emergencyAvailable: boolean }> {
    const res = await apiFetch<{ availability: { businessHours: any; emergencyAvailable: boolean } }>(`/api/v1/providers/mine/availability`, { cacheTtlMs: 0 });
    return res.availability;
  }

  static async updateMyAvailability(payload: { businessHours?: any; emergencyAvailable?: boolean }): Promise<{ businessHours: any; emergencyAvailable: boolean }> {
    const res = await apiFetch<{ availability: { businessHours: any; emergencyAvailable: boolean } }>(`/api/v1/providers/mine/availability`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return res.availability;
  }

  // Subir documentos de identidad
  static async uploadIdentityDocs(files: { dniFront: File; dniBack: File; selfie: File }): Promise<void> {
    const base = (process.env.NEXT_PUBLIC_GATEWAY_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000').replace(/\/+$/, '')
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

    const formData = new FormData()
    formData.append('dni_front', files.dniFront)
    formData.append('dni_back', files.dniBack)
    formData.append('selfie', files.selfie)

    const res = await fetch(`${base}/api/v1/providers/mine/identity`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      } as any,
      body: formData,
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Error al subir documentos')
    }

    return res.json()
  }

  // Admin: Obtener proveedores pendientes de verificación
  static async getPendingVerifications(): Promise<Provider[]> {
    const res = await apiFetch<{ count: number; items: Provider[] }>('/api/v1/providers/admin/list?identityStatus=pending&limit=100')
    return res.items || []
  }

  // Admin: Revisar identidad (aprobar/rechazar)
  static async reviewIdentity(providerId: number, status: 'verified' | 'rejected', reason?: string): Promise<void> {
    await apiFetch(`/api/v1/providers/${providerId}/identity-review`, {
      method: 'PUT',
      body: JSON.stringify({ status, rejection_reason: reason }),
    })
  }
}
