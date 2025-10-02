import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Base del API: priorizar Gateway; fallback a NEXT_PUBLIC_API_BASE_URL y luego localhost:4000
const API_BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

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

// Interceptor para manejar respuestas y refresh de tokens
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Si el error es 401 y no es un retry, intentar refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Solo en el cliente
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
              refreshToken
            })

            const { accessToken, refreshToken: newRefreshToken } = response.data

            // Actualizar tokens en localStorage
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', newRefreshToken)

            // Reintentar la petición original con el nuevo token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return apiClient(originalRequest)
          }
        }
      } catch (refreshError) {
        // Si el refresh falla, limpiar tokens y redirigir a login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          // Opcional: redirigir a login
          // window.location.href = '/auth/login'
        }
      }
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
      if (!res.ok && res.status === 401 && typeof window !== 'undefined') {
        try {
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            const r = await fetch(`${baseNormalized}/api/v1/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            })
            if (r.ok) {
              const data = await r.json()
              const accessTokenNew = data.accessToken || data.access_token
              const refreshTokenNew = data.refreshToken || data.refresh_token
              if (accessTokenNew) localStorage.setItem('accessToken', accessTokenNew)
              if (refreshTokenNew) localStorage.setItem('refreshToken', refreshTokenNew)
              // Reintentar GET con nuevo token
              const retryHeaders: Record<string, string> = {
                ...headers,
                ...(accessTokenNew ? { Authorization: `Bearer ${accessTokenNew}` } : {}),
              }
              res = await fetch(url, {
                ...optsWithoutCache,
                headers: retryHeaders,
                cache: 'no-store',
              })
            }
          }
        } catch {
          // ignore y dejar que falle abajo
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

  const doFetch = async (retry: boolean): Promise<T> => {
    const response = await fetch(url, {
      ...optsWithoutCache,
      headers,
      cache: 'no-store',
    })
    if (response.ok) {
      return response.json() as Promise<T>
    }
    // Intentar refresh en 401 una sola vez
    if (response.status === 401 && typeof window !== 'undefined' && !retry) {
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const r = await fetch(`${baseNormalized}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          })
          if (r.ok) {
            const data = await r.json()
            const accessTokenNew = data.accessToken || data.access_token
            const refreshTokenNew = data.refreshToken || data.refresh_token
            if (accessTokenNew) localStorage.setItem('accessToken', accessTokenNew)
            if (refreshTokenNew) localStorage.setItem('refreshToken', refreshTokenNew)
            // Reintentar una sola vez con nuevo token
            const retryHeaders: Record<string, string> = {
              ...headers,
              ...(accessTokenNew ? { Authorization: `Bearer ${accessTokenNew}` } : {}),
            }
            const retryRes = await fetch(url, {
              ...optsWithoutCache,
              headers: retryHeaders,
              cache: 'no-store',
            })
            if (retryRes.ok) {
              return retryRes.json() as Promise<T>
            }
          }
        }
      } catch {
        // ignore y continuar al throw de abajo
      }
    }
    const text = await response.text().catch(() => '')
    throw new Error(text || `HTTP ${response.status}`)
  }

  return doFetch(false)
}