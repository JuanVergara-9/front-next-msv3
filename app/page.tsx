import { ProvidersService } from '@/lib/services/providers.service'
import { HomeClient } from '@/components/HomeClient'

// Revalidate data every 600 seconds (10 minutes)
export const revalidate = 600

export default async function HomePage() {
  // Fetch initial providers on the server (generic, no location filter)
  let initialProviders: any[] = []

  try {
    const response = await ProvidersService.searchProviders({ limit: 6 })
    const providers = response.providers || []

    // Enrich with review summaries
    const enriched = await ProvidersService.enrichWithReviewSummaries(providers)

    // Transform to match expected format
    initialProviders = enriched.map((provider: any) => ({
      ...provider,
      full_name: `${provider.first_name ?? ''} ${provider.last_name ?? ''}`.trim(),
      rating: Number(provider.rating) || 0,
      review_count: Number(provider.review_count) || 0,
      distance_km: undefined, // No distance on server
      categories: provider.category ? [provider.category.name] : [],
      avatar_url: provider.avatar_url,
    }))
  } catch (error) {
    console.error('Error fetching initial providers:', error)
    // Fallback to empty, client will fetch
  }

  return <HomeClient initialProviders={initialProviders} />
}
