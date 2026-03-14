import { createAdminClient } from '@/lib/supabase/server-admin'
import { NextResponse } from 'next/server'

function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // No secret configured = allow (dev)

  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

export async function POST(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  // 1. Expire LinkedIn jobs where date_validthrough has passed
  const { data: linkedinExpired, error: linkedinError } = await supabase
    .from('jobs')
    .update({
      status: 'expired',
      status_updated_at: now,
    })
    .eq('source', 'linkedin')
    .eq('status', 'active')
    .lt('date_validthrough', now)
    .not('date_validthrough', 'is', null)
    .select('id')

  if (linkedinError) {
    console.error('LinkedIn expiry error:', linkedinError)
  }

  // 2. Flag career-site jobs not seen in 30+ days as likely_expired
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: careerSiteExpired, error: careerSiteError } = await supabase
    .from('jobs')
    .update({
      status: 'likely_expired',
      status_updated_at: now,
    })
    .eq('source', 'career-site')
    .eq('status', 'active')
    .lt('updated_at', thirtyDaysAgo)
    .select('id')

  if (careerSiteError) {
    console.error('Career site expiry error:', careerSiteError)
  }

  return NextResponse.json({
    linkedinExpired: linkedinExpired?.length ?? 0,
    careerSiteExpired: careerSiteExpired?.length ?? 0,
  })
}
