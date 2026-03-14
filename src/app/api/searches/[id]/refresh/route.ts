import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { executeSearch } from '@/lib/adapters/search-controller'
import type { SearchCriteria } from '@/lib/adapters/types'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch the search record
  const { data: search, error } = await supabase
    .from('searches')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !search) {
    return NextResponse.json({ error: 'Search not found' }, { status: 404 })
  }

  const criteria: SearchCriteria = {
    titleSearch: search.title_search ?? [],
    titleExclusion: search.title_exclusion ?? [],
    keywords: search.keywords ?? [],
    locationSearch: search.location_search ?? [],
    timeRange: search.time_range as SearchCriteria['timeRange'],
    sourcesEnabled: search.sources_enabled ?? ['career-site', 'linkedin'],
  }

  // Re-run the search - stream is not needed here, just execute
  const events: unknown[] = []
  const result = await executeSearch(criteria, user.id, (event) => {
    events.push(event)
  })

  return NextResponse.json({
    searchId: result.searchId,
    totalNew: result.totalNew,
    totalUpdated: result.totalUpdated,
  })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: search } = await supabase
    .from('searches')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!search) {
    return NextResponse.json({ error: 'Search not found' }, { status: 404 })
  }

  const body = await request.json()
  const updates: Record<string, unknown> = {}

  if (typeof body.is_scheduled === 'boolean') {
    updates.is_scheduled = body.is_scheduled
  }
  if (body.schedule_interval !== undefined) {
    updates.schedule_interval = body.schedule_interval
  }

  const { error: updateError } = await adminSupabase
    .from('searches')
    .update(updates)
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
