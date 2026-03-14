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

  const now = new Date().toISOString()

  const { error } = await supabase.from('user_job_views').upsert(
    {
      user_id: user.id,
      job_id: id,
      last_viewed_at: now,
    },
    {
      onConflict: 'user_id,job_id',
      ignoreDuplicates: false,
    }
  )

  if (error) {
    console.error('View upsert error:', error)
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
