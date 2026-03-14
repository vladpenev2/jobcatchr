import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const tab = searchParams.get('tab') ?? 'all'
  const search = searchParams.get('search') ?? ''
  const status = searchParams.get('status') ?? ''
  const source = searchParams.get('source') ?? ''
  const sort = searchParams.get('sort') ?? 'posted'
  const order = searchParams.get('order') ?? 'desc'
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '25', 10)
  const offset = (page - 1) * limit

  // Map sort param to column
  const sortColumn =
    sort === 'title' ? 'title' : sort === 'company' ? 'organization' : 'date_posted'

  let jobIds: string[] | null = null

  if (tab === 'saved') {
    // Get saved job IDs for this user
    const { data: saved } = await supabase
      .from('user_saved_jobs')
      .select('job_id')
      .eq('user_id', user.id)

    jobIds = (saved ?? []).map((s) => s.job_id)
    if (jobIds.length === 0) {
      return NextResponse.json({ jobs: [], total: 0, page, limit })
    }
  } else {
    // Get job IDs from user's searches
    const { data: userSearches } = await supabase
      .from('searches')
      .select('id')
      .eq('user_id', user.id)

    const searchIds = (userSearches ?? []).map((s) => s.id)
    if (searchIds.length === 0) {
      return NextResponse.json({ jobs: [], total: 0, page, limit })
    }

    const { data: searchJobs } = await supabase
      .from('search_jobs')
      .select('job_id')
      .in('search_id', searchIds)

    jobIds = [...new Set((searchJobs ?? []).map((sj) => sj.job_id))]
    if (jobIds.length === 0) {
      return NextResponse.json({ jobs: [], total: 0, page, limit })
    }
  }

  // Build jobs query
  let query = supabase
    .from('jobs')
    .select(
      `
      id, title, organization, organization_logo, organization_url, organization_linkedin_slug,
      url, locations_derived, cities_derived, countries_derived, remote_derived,
      employment_type, date_posted, date_validthrough, status, source, source_name, source_domain,
      seniority, directapply, external_apply_url,
      ai_experience_level, ai_work_arrangement, ai_key_skills, ai_employment_type,
      ai_core_responsibilities, ai_requirements_summary, ai_salary_min, ai_salary_max,
      ai_salary_currency, ai_salary_unit,
      linkedin_org_employees, linkedin_org_industry, linkedin_org_size,
      linkedin_org_headquarters, linkedin_org_description,
      description_text, description_html,
      created_at, updated_at
    `,
      { count: 'exact' }
    )
    .in('id', jobIds)

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,organization.ilike.%${search}%,locations_derived.cs.{${search}}`
    )
  }

  if (status) {
    query = query.eq('status', status)
  }

  if (source) {
    // Support filtering by source category (linkedin, career-site) or specific source name
    if (source === 'linkedin' || source === 'career-site') {
      query = query.eq('source', source)
    } else {
      query = query.eq('source_name', source)
    }
  }

  query = query
    .order(sortColumn, { ascending: order === 'asc', nullsFirst: false })
    .range(offset, offset + limit - 1)

  const { data: jobs, count, error } = await query

  if (error) {
    console.error('Jobs query error:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }

  // Get seen/saved status for this user
  const fetchedJobIds = (jobs ?? []).map((j) => j.id)

  const [viewsRes, savedRes] = await Promise.all([
    fetchedJobIds.length > 0
      ? supabase
          .from('user_job_views')
          .select('job_id')
          .eq('user_id', user.id)
          .in('job_id', fetchedJobIds)
      : { data: [] },
    fetchedJobIds.length > 0
      ? supabase
          .from('user_saved_jobs')
          .select('job_id')
          .eq('user_id', user.id)
          .in('job_id', fetchedJobIds)
      : { data: [] },
  ])

  const seenSet = new Set((viewsRes.data ?? []).map((v) => v.job_id))
  const savedSet = new Set((savedRes.data ?? []).map((s) => s.job_id))

  const enriched = (jobs ?? []).map((job) => ({
    ...job,
    seen: seenSet.has(job.id),
    saved: savedSet.has(job.id),
  }))

  return NextResponse.json({ jobs: enriched, total: count ?? 0, page, limit })
}
