// Types que coinciden con el backend de MiServicio

export interface User {
  id: number;
  email: string;
  role: 'user' | 'provider';
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: number;
  user_id: number;
  category_id: number;
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
  status: 'active' | 'inactive' | 'pending';
  years_experience?: number;
  price_hint?: number;
  emergency_available: boolean;
  is_licensed?: boolean;
  business_hours?: Record<string, any>;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  // Nuevos campos para identidad
  identity_status?: 'not_submitted' | 'pending' | 'verified' | 'rejected' | string;
  identity_rejection_reason?: string | null;
  identity_dni_front_url?: string;
  identity_dni_back_url?: string;
  identity_selfie_url?: string;
  // Relaciones
  category?: Category;
  user?: User;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  provider_id: number;
  client_id: number;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  provider?: Provider;
  client?: User;
}

export interface ContactIntent {
  id: number;
  provider_id: number;
  client_name: string;
  client_phone: string;
  client_email?: string;
  message?: string;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  // Relaciones
  provider?: Provider;
}

// Types para la UI (combinan datos del backend)
export interface ProviderWithDetails extends Provider {
  // Datos calculados para la UI
  full_name: string;
  rating: number;
  review_count: number;
  distance_km?: number;
  categories: string[];
  avatar_url?: string;
}

// Types para requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'user' | 'provider';
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface SearchProvidersRequest {
  query?: string;
  category_id?: number;
  category_slug?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  limit?: number;
  offset?: number;
  licensed?: boolean;
}

export interface SearchProvidersResponse {
  providers: ProviderWithDetails[];
  total: number;
  page: number;
  limit: number;
}

// Types para geolocalización
export interface LocationData {
  city: string;
  province: string;
  lat: number;
  lng: number;
}

// Types para errores de API
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
