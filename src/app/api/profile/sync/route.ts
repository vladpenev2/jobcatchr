import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { extractLinkedInProfile } from '@/lib/apify/profile'

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('linkedin_url')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.linkedin_url) {
    return NextResponse.json(
      { error: 'No LinkedIn URL found for this profile' },
      { status: 400 }
    )
  }

  try {
    const profileData = await extractLinkedInProfile(profile.linkedin_url)

    const adminClient = createAdminClient()
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({
        profile_data: profileData,
        profile_synced_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }

    return NextResponse.json({ success: true, profileData })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
