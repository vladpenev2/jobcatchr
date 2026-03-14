import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { name, location } = body

  if (!name && !location) {
    return NextResponse.json({ error: 'At least one field (name, location) is required' }, { status: 400 })
  }

  const updateData: Record<string, string> = {}
  if (name) updateData.name = name
  if (location) updateData.location = location

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select('id, name, email, location, role, profile_synced_at')
    .single()

  if (error) {
    console.error('PUT /api/admin/users/[id] error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ user: data })
}
