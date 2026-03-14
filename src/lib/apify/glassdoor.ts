import { ApifyClient } from 'apify-client'

export interface GlassdoorReview {
  review_id: number
  summary: string
  pros: string
  cons: string
  advice: string
  rating_overall: number
  rating_work_life_balance: number | null
  rating_career_opportunities: number | null
  rating_compensation_and_benefits: number | null
  rating_culture_and_values: number | null
  rating_senior_leadership: number | null
  rating_recommend_to_friend: string | null
  job_title: string
  location: string
  is_current_job: boolean
  length_of_employment: number | null
  review_date_time: string
  employer_short_name: string
  employer_logo_url: string | null
}

export interface GlassdoorResult {
  reviews: GlassdoorReview[]
  rating_overall: number | null
  review_count: number
  employer_logo_url: string | null
}

export async function fetchGlassdoorReviews(companyName: string): Promise<GlassdoorResult> {
  const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN })

  const run = await apify.actor('getdataforme/glassdoor-reviews-scraper').call({
    company_name: companyName,
    item_limit: 15,
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
  })

  const { items } = await apify.dataset(run.defaultDatasetId).listItems()

  if (!items.length) {
    return { reviews: [], rating_overall: null, review_count: 0, employer_logo_url: null }
  }

  const reviews = items as unknown as GlassdoorReview[]

  // Compute overall rating from all reviews
  const withRatings = reviews.filter((r) => typeof r.rating_overall === 'number')
  const rating_overall =
    withRatings.length > 0
      ? withRatings.reduce((sum, r) => sum + r.rating_overall, 0) / withRatings.length
      : null

  const employer_logo_url = reviews.find((r) => r.employer_logo_url)?.employer_logo_url ?? null

  return {
    reviews,
    rating_overall: rating_overall !== null ? Math.round(rating_overall * 10) / 10 : null,
    review_count: reviews.length,
    employer_logo_url,
  }
}
