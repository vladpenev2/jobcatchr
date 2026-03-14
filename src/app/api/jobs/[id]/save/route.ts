import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
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

  // Check current save state
  const { data: existing } = await supabase
    .from('user_saved_jobs')
    .select('job_id')
    .eq('user_id', user.id)
    .eq('job_id', id)
    .maybeSingle()

  if (existing) {
    // Currently saved - unsave it
    const { error } = await supabase
      .from('user_saved_jobs')
      .delete()
      .eq('user_id', user.id)
      .eq('job_id', id)

    if (error) {
      return NextResponse.json({ error: 'Failed to unsave job' }, { status: 500 })
    }

    return NextResponse.json({ saved: false })
  } else {
    // Not saved - save it
    const { error } = await supabase.from('user_saved_jobs').insert({
      user_id: user.id,
      job_id: id,
    })

    if (error) {
      return NextResponse.json({ error: 'Failed to save job' }, { status: 500 })
    }

    return NextResponse.json({ saved: true })
  }
}
