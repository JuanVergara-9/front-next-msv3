import { CategoriesSection } from "@/components/CategoriesSection"
import { ProvidersService } from "@/lib/services/providers.service"

// Revalidate data every 600 seconds (10 minutes)
export const revalidate = 600

export default async function CategoriesPage() {
  // Fetch initial data on the server
  // We can't get user location on server easily without headers/cookies logic which we might not have yet
  // So we fetch generic data.
  const [categories, providersResponse] = await Promise.all([
    ProvidersService.getCategories().catch(() => []),
    ProvidersService.searchProviders({ limit: 20 }).catch(() => ({ providers: [] }))
  ])

  const initialProviders = Array.isArray((providersResponse as any)?.providers)
    ? (providersResponse as any).providers
    : []

  // Ensure providers are enriched if necessary, or just pass basic data and let client enrich?
  // Service.enrichWithReviewSummaries calls ReviewService which calls API. 
  // It should work on server too.
  let enrichedProviders = initialProviders
  try {
    enrichedProviders = await ProvidersService.enrichWithReviewSummaries(initialProviders)
  } catch (e) {
    console.error("Failed to enrich providers on server", e)
  }

  // Pre-calculate full_name and other simple props if needed to match what client expects
  // The client component does a map. To avoid hydration mismatch if we pass raw data and client maps it immediately,
  // we should ideally pass raw data and let the client component use it as initial state directly.
  // BUT the client component expects ProviderWithDetails[] and does mapping inside `loadProviders`.
  // It receives `initialProviders`. If we pass them, we should probably pass them "ready to use" 
  // OR update the client component to handle raw data in props.
  // Accessing `CategoriesSection` again, I see it takes `initialProviders` and sets them to `providers` state.
  // It ALSO has a transformation step: `const transformedProviders = enrichedProviders.map(...)`.
  // If I pass data that hasn't gone through that map, it might break or look different.
  // I should duplicate the transformation here or move the transformation to a shared utility?
  // For safety/speed, I will duplicate the transformation logic here.

  const transformedProviders = enrichedProviders.map((provider: any) => ({
    ...provider,
    full_name: `${provider.first_name ?? ''} ${provider.last_name ?? ''}`.trim(),
    rating: Number(provider.rating) || 0,
    review_count: Number(provider.review_count) || 0,
    // distance_km will be undefined on server
    categories: (() => {
      const cats: string[] = []
      if (provider.category?.name) cats.push(provider.category.name)
      if (Array.isArray(provider.categories)) {
        provider.categories.forEach((cat: any) => {
          const catName = typeof cat === 'string' ? cat : cat?.name
          if (catName && !cats.includes(catName)) cats.push(catName)
        })
      }
      return cats
    })(),
    avatar_url: provider.avatar_url,
  }))

  return (
    <div className="min-h-screen bg-background">
      <CategoriesSection
        initialCategories={categories}
        initialProviders={transformedProviders}
      />
    </div>
  )
}
