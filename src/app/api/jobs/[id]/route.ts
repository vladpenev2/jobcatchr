import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // Get seen/saved status
  const [viewRes, savedRes] = await Promise.all([
    supabase
      .from('user_job_views')
      .select('job_id')
      .eq('user_id', user.id)
      .eq('job_id', id)
      .maybeSingle(),
    supabase
      .from('user_saved_jobs')
      .select('job_id')
      .eq('user_id', user.id)
      .eq('job_id', id)
      .maybeSingle(),
  ])

  return NextResponse.json({
    ...job,
    seen: !!viewRes.data,
    saved: !!savedRes.data,
  })
}

export async function DELETE(
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

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase.from('jobs').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
