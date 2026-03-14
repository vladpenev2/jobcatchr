import { createAdminClient } from '@/lib/supabase/server-admin'
import { CareerSiteFeedAdapter } from './career-site-feed'
import { LinkedInSearchAdapter } from './linkedin-search'
import type { SearchCriteria, SearchProgress, UnifiedJob } from './types'

const ADAPTERS = {
  'career-site': new CareerSiteFeedAdapter(),
  linkedin: new LinkedInSearchAdapter(),
}

export async function executeSearch(
  criteria: SearchCriteria,
  userId: string,
  onProgress: (event: SearchProgress) => void
): Promise<{ totalNew: number; totalUpdated: number; searchId: string }> {
  const supabase = createAdminClient()

  // 1. Create search record
  const { data: search, error: searchError } = await supabase
    .from('searches')
    .insert({
      user_id: userId,
      title_search: criteria.titleSearch,
      title_exclusion: criteria.titleExclusion,
      keywords: criteria.keywords,
      location_search: criteria.locationSearch,
      time_range: criteria.timeRange,
      sources_enabled: criteria.sourcesEnabled,
    })
    .select('id')
    .single()

  if (searchError || !search) {
    throw new Error(`Failed to create search record: ${searchError?.message}`)
  }

  const searchId = search.id

  // 2. Fan out to enabled adapters in parallel
  const enabledAdapters = criteria.sourcesEnabled
    .filter((source) => source in ADAPTERS)
    .map((source) => ADAPTERS[source as keyof typeof ADAPTERS])

  const allJobs: UnifiedJob[] = []

  const results = await Promise.allSettled(
    enabledAdapters.map(async (adapter) => {
      onProgress({
        stage: adapter.name,
        status: 'running',
        message: `Searching ${adapter.name === 'career-site-feed' ? 'career sites' : 'LinkedIn'}...`,
      })

      const result = await adapter.search(criteria)

      onProgress({
        stage: adapter.name,
        status: 'done',
        count: result.count,
        message: `Found ${result.count} jobs from ${adapter.name === 'career-site-feed' ? 'career sites' : 'LinkedIn'}`,
      })

      return result
    })
  )

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allJobs.push(...result.value.jobs)
    } else {
      onProgress({
        stage: 'error',
        status: 'error',
        message: `Adapter error: ${result.reason?.message ?? 'Unknown error'}`,
      })
    }
  }

  // 3. Deduplicate by job id
  const seen = new Set<string>()
  const dedupedJobs = allJobs.filter((job) => {
    if (seen.has(job.id)) return false
    seen.add(job.id)
    return true
  })

  onProgress({
    stage: 'dedup',
    status: 'running',
    count: dedupedJobs.length,
    message: `Processing ${dedupedJobs.length} unique jobs...`,
  })

  // 4. Upsert jobs in batches
  const BATCH_SIZE = 100
  let totalNew = 0
  let totalUpdated = 0

  for (let i = 0; i < dedupedJobs.length; i += BATCH_SIZE) {
    const batch = dedupedJobs.slice(i, i + BATCH_SIZE)

    // Get existing job IDs to distinguish new vs updated
    const batchIds = batch.map((j) => j.id)
    const { data: existing } = await supabase
      .from('jobs')
      .select('id')
      .in('id', batchIds)

    const existingIds = new Set((existing ?? []).map((r: { id: string }) => r.id))

    const newCount = batch.filter((j) => !existingIds.has(j.id)).length
    const updatedCount = batch.filter((j) => existingIds.has(j.id)).length
    totalNew += newCount
    totalUpdated += updatedCount

    // Upsert: insert new, update existing
    const { error: upsertError } = await supabase.from('jobs').upsert(
      batch.map((job) => ({
        id: job.id,
        source: job.source,
        source_actor: job.source_actor,
        title: job.title,
        organization: job.organization,
        organization_url: job.organization_url,
        organization_logo: job.organization_logo,
        organization_linkedin_slug: job.organization_linkedin_slug,
        url: job.url,
        description_text: job.description_text,
        description_html: job.description_html,
        location_raw: job.location_raw,
        locations_derived: job.locations_derived,
        cities_derived: job.cities_derived,
        regions_derived: job.regions_derived,
        countries_derived: job.countries_derived,
        remote_derived: job.remote_derived,
        employment_type: job.employment_type,
        salary_raw: job.salary_raw,
        date_posted: job.date_posted,
        date_validthrough: job.date_validthrough,
        status: 'active',
        seniority: job.seniority,
        recruiter_name: job.recruiter_name,
        recruiter_url: job.recruiter_url,
        directapply: job.directapply,
        external_apply_url: job.external_apply_url,
        source_domain: job.source_domain,
        ai_experience_level: job.ai_experience_level,
        ai_work_arrangement: job.ai_work_arrangement,
        ai_key_skills: job.ai_key_skills,
        ai_employment_type: job.ai_employment_type,
        ai_core_responsibilities: job.ai_core_responsibilities,
        ai_requirements_summary: job.ai_requirements_summary,
        ai_salary_min: job.ai_salary_min,
        ai_salary_max: job.ai_salary_max,
        ai_salary_currency: job.ai_salary_currency,
        ai_salary_unit: job.ai_salary_unit,
        linkedin_org_employees: job.linkedin_org_employees,
        linkedin_org_industry: job.linkedin_org_industry,
        linkedin_org_size: job.linkedin_org_size,
        linkedin_org_headquarters: job.linkedin_org_headquarters,
        linkedin_org_description: job.linkedin_org_description,
        raw_data: job.raw_data,
      })),
      { onConflict: 'id', ignoreDuplicates: false }
    )

    if (upsertError) {
      console.error('Upsert error:', upsertError)
    }
  }

  // 5. Link jobs to search via search_jobs junction
  if (dedupedJobs.length > 0) {
    const searchJobLinks = dedupedJobs.map((job) => ({
      search_id: searchId,
      job_id: job.id,
    }))

    // Insert in batches to avoid hitting limits
    for (let i = 0; i < searchJobLinks.length; i += BATCH_SIZE) {
      const batch = searchJobLinks.slice(i, i + BATCH_SIZE)
      await supabase.from('search_jobs').upsert(batch, { onConflict: 'search_id,job_id', ignoreDuplicates: true })
    }
  }

  // 6. Update search record
  await supabase
    .from('searches')
    .update({
      job_count: dedupedJobs.length,
      last_run_at: new Date().toISOString(),
    })
    .eq('id', searchId)

  return { totalNew, totalUpdated, searchId }
}
