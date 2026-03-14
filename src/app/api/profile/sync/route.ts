import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the user's LinkedIn URL
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

  // Call Apify LinkedIn profile enrichment actor
  const apifyToken = process.env.APIFY_API_TOKEN
  if (!apifyToken) {
    return NextResponse.json(
      { error: 'Apify API token not configured' },
      { status: 500 }
    )
  }

  try {
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/anchor~linkedin-profile-enrichment/run-sync?token=${apifyToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileUrls: [{ url: profile.linkedin_url }],
        }),
      }
    )

    if (!runResponse.ok) {
      throw new Error(`Apify run failed: ${runResponse.statusText}`)
    }

    const runData = await runResponse.json()
    const items = runData?.data?.items ?? []
    const extracted = items[0]

    if (!extracted) {
      return NextResponse.json(
        { error: 'No profile data returned from LinkedIn extraction' },
        { status: 422 }
      )
    }

    const profileData = {
      fullName: extracted.fullName ?? null,
      headline: extracted.headline ?? null,
      city: extracted.city ?? null,
      country: extracted.country ?? null,
      experiences: extracted.experiences ?? [],
      education: extracted.education ?? [],
      skills: extracted.skills ?? [],
    }

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
