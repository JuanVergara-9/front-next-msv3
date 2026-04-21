import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Base del API: priorizar Gateway; fallback a NEXT_PUBLIC_API_BASE_URL y luego localhost:4000
const API_BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

// URL del Socket: priorizar NEXT_PUBLIC_SOCKET_URL; derivar de API_BASE_URL si no existe
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || (
  API_BASE_URL.includes('localhost') 
    ? 'http://localhost:4003' 
    : API_BASE_URL // En producción usamos el Gateway para todo (Sockets incluidos por proxy)
)

// Caché simple en memoria para GET (TTL configurable)
type CacheEntry<T> = { expiresAt: number; data: T }
const requestCache = new Map<string, CacheEntry<any>>()
const inflightRequests = new Map<string, Promise<any>>()
const DEFAULT_CACHE_TTL_MS = Number(process.env.NEXT_PUBLIC_API_CACHE_TTL_MS || 30000)

function buildCacheKey(base: string, path: string, headers: Record<string, string | undefined>): string {
  const auth = headers['Authorization'] || headers['authorization'] || ''
  return `${base}${path}::${auth}`
}

// Crear instancia de axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
})

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    // Solo en el cliente (browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/** Logout silencioso: borra tokens y redirige a /login sin lanzar errores en la UI */
export function silentLogoutAndRedirect(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  // Notificar al AuthContext para que sincronice el estado de React
  window.dispatchEvent(new Event('auth:logout'))
  if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/auth')) {
    window.location.href = '/login'
  }
}

// Cola de refresh: garantiza que solo UN refresh corra a la vez; las demás
// peticiones 401 esperan al mismo promise en vez de competir entre sí.
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) throw new Error('No refresh token')

    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, { refreshToken })
    const { accessToken, refreshToken: newRefreshToken } = response.data

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', newRefreshToken)
    return accessToken as string
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

// Interceptor para manejar respuestas y refresh de tokens
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    // 403 Forbidden (AUTH.FORBIDDEN): sesión inválida sin posibilidad de refresh → logout inmediato
    if (status === 403) {
      silentLogoutAndRedirect()
      return Promise.reject(error)
    }

    // 401 Unauthorized: intentar refresh token una sola vez
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        if (typeof window !== 'undefined') {
          const newAccessToken = await refreshAccessToken()
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return apiClient(originalRequest)
        }
      } catch {
        // Refresh falló (token expirado o revocado) → logout silencioso
      }

      silentLogoutAndRedirect()
    }

    return Promise.reject(error)
  }
)

export { apiClient }

// Función de conveniencia para mantener compatibilidad
export type ApiRequestInit = RequestInit & { cacheTtlMs?: number }

export async function apiFetch<T>(
  path: string,
  opts: ApiRequestInit = {}
): Promise<T> {
  const base = API_BASE_URL
  const baseNormalized = base.replace(/\/+$/, '')
  const method = (opts.method || 'GET').toUpperCase()
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers as Record<string, string> | undefined),
  }

  // TTL personalizado opcional: (opts as any).cacheTtlMs
  const { cacheTtlMs, ...optsWithoutCache } = opts
  const ttlMs: number = cacheTtlMs ?? DEFAULT_CACHE_TTL_MS
  const useCache = method === 'GET' && ttlMs > 0
  const pathNormalized = path.startsWith('/') ? path : `/${path}`
  const url = `${baseNormalized}${pathNormalized}`

  if (useCache) {
    const key = buildCacheKey(base, path, headers)
    const cached = requestCache.get(key)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T
    }
    const inflight = inflightRequests.get(key)
    if (inflight) {
      return inflight as Promise<T>
    }

    const p = (async () => {
      let res = await fetch(url, {
        ...optsWithoutCache,
        headers,
        cache: 'no-store',
      })

      if (!res.ok && res.status === 403) {
        silentLogoutAndRedirect()
        throw new Error('AUTH.FORBIDDEN')
      }

      if (!res.ok && res.status === 401 && typeof window !== 'undefined') {
        try {
          const newToken = await refreshAccessToken()
          const retryHeaders: Record<string, string> = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          }
          res = await fetch(url, {
            ...optsWithoutCache,
            headers: retryHeaders,
            cache: 'no-store',
          })
        } catch {
          silentLogoutAndRedirect()
          throw new Error('AUTH.FORBIDDEN')
        }
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `HTTP ${res.status}`)
      }
      const data = (await res.json()) as T
      requestCache.set(key, { expiresAt: Date.now() + ttlMs, data })
      inflightRequests.delete(key)
      return data
    })()

    inflightRequests.set(key, p)
    try {
      return await p
    } finally {
      inflightRequests.delete(key)
    }
  }

  const doFetch = async (retried: boolean): Promise<T> => {
    const response = await fetch(url, {
      ...optsWithoutCache,
      headers,
      cache: 'no-store',
    })
    if (response.ok) {
      return response.json() as Promise<T>
    }

    if (response.status === 403) {
      silentLogoutAndRedirect()
      throw new Error('AUTH.FORBIDDEN')
    }

    if (response.status === 401 && typeof window !== 'undefined' && !retried) {
      try {
        const newToken = await refreshAccessToken()
        const retryHeaders: Record<string, string> = {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        }
        const retryRes = await fetch(url, {
          ...optsWithoutCache,
          headers: retryHeaders,
          cache: 'no-store',
        })
        if (retryRes.ok) {
          return retryRes.json() as Promise<T>
        }
      } catch {
        // ignore
      }
      silentLogoutAndRedirect()
      throw new Error('AUTH.FORBIDDEN')
    }

    const text = await response.text().catch(() => '')
    throw new Error(text || `HTTP ${response.status}`)
  }

  return doFetch(false)
}