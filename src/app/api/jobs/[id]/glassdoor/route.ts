import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { fetchGlassdoorReviews } from '@/lib/apify/glassdoor'

const CACHE_TTL_DAYS = 30

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the job to find company name
  const { data: job } = await supabase
    .from('jobs')
    .select('organization')
    .eq('id', id)
    .single()

  if (!job?.organization) {
    return NextResponse.json({ error: 'No company name for this job' }, { status: 404 })
  }

  const cacheKey = job.organization.trim().toLowerCase()

  // Check cache
  const { data: cached } = await supabase
    .from('glassdoor_cache')
    .select('*')
    .eq('company_name', cacheKey)
    .single()

  if (cached) {
    const fetchedAt = new Date(cached.fetched_at)
    const ageMs = Date.now() - fetchedAt.getTime()
    const ageDays = ageMs / (1000 * 60 * 60 * 24)

    if (ageDays < CACHE_TTL_DAYS) {
      return NextResponse.json({
        reviews: cached.reviews,
        rating_overall: cached.rating_overall,
        review_count: cached.review_count,
        employer_logo_url: cached.employer_logo_url,
        cached: true,
        fetched_at: cached.fetched_at,
      })
    }
  }

  // Fetch fresh data
  try {
    const result = await fetchGlassdoorReviews(job.organization)

    // Store in cache using admin client (bypasses RLS)
    const adminClient = createAdminClient()
    await adminClient.from('glassdoor_cache').upsert(
      {
        company_name: cacheKey,
        reviews: result.reviews,
        rating_overall: result.rating_overall,
        review_count: result.review_count,
        employer_logo_url: result.employer_logo_url,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: 'company_name' }
    )

    return NextResponse.json({
      ...result,
      cached: false,
      fetched_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Glassdoor fetch error:', err)
    // If we have stale cache, return it rather than failing
    if (cached) {
      return NextResponse.json({
        reviews: cached.reviews,
        rating_overall: cached.rating_overall,
        review_count: cached.review_count,
        employer_logo_url: cached.employer_logo_url,
        cached: true,
        stale: true,
        fetched_at: cached.fetched_at,
      })
    }
    return NextResponse.json({ error: 'Failed to fetch Glassdoor reviews' }, { status: 500 })
  }
}
