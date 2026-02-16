import { apiFetch } from '../apiClient';

/**
 * Valida el token del Magic Link y devuelve requestId y workerId para el flujo Shadow Ledger.
 */
export async function validateGuestToken(
  token: string
): Promise<{ requestId: number; workerId: number } | null> {
  try {
    const base = (process.env.NEXT_PUBLIC_GATEWAY_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000').replace(/\/+$/, '');
    const res = await fetch(`${base}/api/v1/guest/validate?token=${encodeURIComponent(token)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data?.requestId !== 'number' || typeof data?.workerId !== 'number') return null;
    return { requestId: data.requestId, workerId: data.workerId };
  } catch {
    return null;
  }
}
