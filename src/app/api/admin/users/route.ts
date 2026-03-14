import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { extractLinkedInProfile } from '@/lib/apify/profile'

function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

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

export async function GET() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()

  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, name, email, location, role, linkedin_url, profile_synced_at, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('GET /api/admin/users error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: profiles })
}

export async function POST(request: NextRequest) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { name, email, linkedin_url, location } = body

  if (!name || !email || !linkedin_url || !location) {
    return NextResponse.json(
      { error: 'name, email, linkedin_url, and location are required' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()
  const password = generatePassword(12)

  // Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    console.error('Create auth user error:', authError?.message)
    return NextResponse.json(
      { error: authError?.message ?? 'Failed to create auth user' },
      { status: 500 }
    )
  }

  const userId = authData.user.id

  // Insert profile row
  const { error: profileError } = await admin.from('profiles').insert({
    id: userId,
    name,
    email,
    linkedin_url,
    location,
    role: 'user',
  })

  if (profileError) {
    console.error('Insert profile error:', profileError.message)
    // Clean up auth user if profile insert failed
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // Extract LinkedIn profile async (best-effort, don't fail the request)
  let profileSynced = false
  try {
    const profileData = await extractLinkedInProfile(linkedin_url)
    await admin.from('profiles').update({
      profile_data: profileData,
      profile_synced_at: new Date().toISOString(),
    }).eq('id', userId)
    profileSynced = true
  } catch (err) {
    console.error('LinkedIn profile extraction failed (non-fatal):', err instanceof Error ? err.message : err)
  }

  return NextResponse.json({
    user: { id: userId, name, email, linkedin_url, location, role: 'user' },
    password,
    profileSynced,
  }, { status: 201 })
}
