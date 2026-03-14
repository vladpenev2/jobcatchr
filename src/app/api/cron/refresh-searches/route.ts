import { createAdminClient } from '@/lib/supabase/server-admin'
import { executeSearch } from '@/lib/adapters/search-controller'
import type { SearchCriteria } from '@/lib/adapters/types'
import { NextResponse } from 'next/server'

function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // No secret configured = allow (dev)

  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

function isDue(search: { last_run_at: string | null; schedule_interval: string | null }): boolean {
  if (!search.last_run_at) return true // Never run = always due

  const lastRun = new Date(search.last_run_at)
  const now = new Date()

  if (search.schedule_interval === 'daily') {
    const oneDayMs = 24 * 60 * 60 * 1000
    return now.getTime() - lastRun.getTime() >= oneDayMs
  }

  if (search.schedule_interval === 'weekly') {
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000
    return now.getTime() - lastRun.getTime() >= oneWeekMs
  }

  return false
}

export async function POST(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch all scheduled searches
  const { data: scheduledSearches, error } = await supabase
    .from('searches')
    .select('*')
    .eq('is_scheduled', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!scheduledSearches || scheduledSearches.length === 0) {
    return NextResponse.json({ processed: 0, skipped: 0 })
  }

  const dueSearches = scheduledSearches.filter(isDue)

  let processed = 0
  let failed = 0

  for (const search of dueSearches) {
    const criteria: SearchCriteria = {
      titleSearch: search.title_search ?? [],
      titleExclusion: search.title_exclusion ?? [],
      keywords: search.keywords ?? [],
      locationSearch: search.location_search ?? [],
      timeRange: search.time_range as SearchCriteria['timeRange'],
      sourcesEnabled: search.sources_enabled ?? ['career-site', 'linkedin'],
    }

    try {
      await executeSearch(criteria, search.user_id, () => {})
      processed++
    } catch (err) {
      console.error(`Failed to refresh search ${search.id}:`, err)
      failed++

      // Track consecutive missing runs for career site expiration
      await supabase
        .from('searches')
        .update({
          consecutive_runs_missing: (search.consecutive_runs_missing ?? 0) + 1,
        })
        .eq('id', search.id)
    }
  }

  return NextResponse.json({
    total: scheduledSearches.length,
    due: dueSearches.length,
    processed,
    failed,
    skipped: scheduledSearches.length - dueSearches.length,
  })
}
