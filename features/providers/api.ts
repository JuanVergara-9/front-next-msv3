import { apiFetch } from "../../lib/apiClient";
import type { Provider } from "../../types/provider";

export async function getProviders(params: { q?: string; category?: string; city?: string }) {
  const usp = new URLSearchParams();
  if (params.q) usp.set("q", params.q);
  if (params.category) usp.set("category", params.category);
  if (params.city) usp.set("city", params.city);
  return apiFetch<Provider[]>(`/providers?${usp.toString()}`);
}
