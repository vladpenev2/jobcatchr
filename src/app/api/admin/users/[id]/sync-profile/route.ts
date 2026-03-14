import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { extractLinkedInProfile } from '@/lib/apify/profile'

async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const admin = createAdminClient()

  // Get the user's linkedin_url
  const { data: profile, error: fetchError } = await admin
    .from('profiles')
    .select('linkedin_url')
    .eq('id', id)
    .single()

  if (fetchError || !profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (!profile.linkedin_url) {
    return NextResponse.json({ error: 'User has no LinkedIn URL' }, { status: 400 })
  }

  try {
    const profileData = await extractLinkedInProfile(profile.linkedin_url)

    const { error: updateError } = await admin
      .from('profiles')
      .update({
        profile_data: profileData,
        profile_synced_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profileData })
  } catch (err) {
    console.error('Sync profile error:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Profile extraction failed' },
      { status: 500 }
    )
  }
}
