import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { supabaseUrl } from './config'

export function createAdminClient() {
  return createSupabaseClient(
    supabaseUrl,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  )
}
