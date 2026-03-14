import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { resolveCompanyId, resolveCompanyByName } from '@/lib/apify/company'
import { searchPeople, buildLinkedInUrls } from '@/lib/apify/people'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: jobId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = createAdminClient()

  const { data: cached } = await adminClient
    .from('people_searches')
    .select('id, query, results, linkedin_urls, created_at')
    .eq('user_id', user.id)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (cached) {
    return NextResponse.json({
      cached: true,
      query: cached.query,
      results: cached.results,
      linkedInUrls: cached.linkedin_urls,
      createdAt: cached.created_at,
    })
  }

  return NextResponse.json({ cached: false, results: null })
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: jobId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = createAdminClient()

  // Get job details
  const { data: job, error: jobError } = await adminClient
    .from('jobs')
    .select('id, title, organization, organization_url, organization_linkedin_slug')
    .eq('id', jobId)
    .single()

  if (jobError || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // Get user profile for location and past experiences
  const { data: profile } = await adminClient
    .from('profiles')
    .select('location, profile_data')
    .eq('id', user.id)
    .single()

  const userLocation = profile?.location ?? 'UAE'
  const profileData = profile?.profile_data as {
    experiences?: { company: string; title: string; companyLinkedinUrl: string }[]
    education?: { school: string; degree: string; field: string }[]
  } | null

  // Parse optional custom query from request body
  let customQuery: string | null = null
  try {
    const body = await request.json()
    customQuery = body?.query ?? null
  } catch {
    // No body or invalid JSON - use auto-generated query
  }

  // Auto-generate query
  const autoQuery = `${job.title} or hiring manager or recruiter at ${job.organization} in ${userLocation}`
  const query = customQuery || autoQuery
  const highlightsQuery = job.title

  // Resolve target company numeric ID
  let targetCompanyNumericId: string | null = null
  try {
    let companyResult = null
    if (job.organization_linkedin_slug) {
      companyResult = await resolveCompanyId(
        `https://www.linkedin.com/company/${job.organization_linkedin_slug}`
      )
    } else if (job.organization_url && job.organization_url.includes('linkedin.com/company')) {
      companyResult = await resolveCompanyId(job.organization_url)
    } else if (job.organization) {
      companyResult = await resolveCompanyByName(job.organization)
    }
    targetCompanyNumericId = companyResult?.numericId ?? null
  } catch (err) {
    console.error('Target company resolution error:', err)
  }

  // Resolve user's past company numeric IDs in parallel
  const pastCompanyIds: string[] = []
  const targetCompanyName = job.organization?.toLowerCase() ?? ''
  const pastExperiences = (profileData?.experiences ?? [])
    .filter((exp) => exp.company)
    .filter((exp) => exp.company.toLowerCase() !== targetCompanyName)
    .slice(0, 5)

  if (pastExperiences.length > 0) {
    const pastCompanyResults = await Promise.allSettled(
      pastExperiences.map((exp) => {
        // Use LinkedIn URL if available, otherwise resolve by name
        if (exp.companyLinkedinUrl && exp.companyLinkedinUrl.includes('linkedin.com')) {
          return resolveCompanyId(exp.companyLinkedinUrl)
        }
        return resolveCompanyByName(exp.company)
      })
    )

    for (const result of pastCompanyResults) {
      if (result.status === 'fulfilled' && result.value?.numericId) {
        pastCompanyIds.push(result.value.numericId)
      }
    }
  }

  // Build LinkedIn search URLs
  const pastCompanyNames = pastExperiences.map((e) => e.company).filter(Boolean)
  const schoolNames = (profileData?.education ?? [])
    .map((edu) => edu.school)
    .filter(Boolean)
    .slice(0, 3)

  let linkedInUrls = { pastCompanyUrl: null as string | null, schoolUrl: null as string | null }
  if (targetCompanyNumericId) {
    linkedInUrls = buildLinkedInUrls(
      targetCompanyNumericId,
      pastCompanyIds,
      pastCompanyNames,
      schoolNames
    )
  }

  // Run Exa.ai people search
  let people = []
  try {
    people = await searchPeople(query, userLocation, 10, highlightsQuery)
  } catch (err) {
    console.error('People search error:', err)
    return NextResponse.json(
      { error: 'Failed to search for people. Please try again.' },
      { status: 500 }
    )
  }

  // Cache results
  const { data: saved, error: saveError } = await adminClient
    .from('people_searches')
    .insert({
      user_id: user.id,
      job_id: jobId,
      query,
      results: people,
      linkedin_urls: linkedInUrls,
    })
    .select('id, created_at')
    .single()

  if (saveError) {
    console.error('Failed to cache people search:', saveError)
  }

  return NextResponse.json({
    cached: false,
    query,
    results: people,
    linkedInUrls,
    createdAt: saved?.created_at ?? new Date().toISOString(),
  })
}
