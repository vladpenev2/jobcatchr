// Supabase connection config.
// NEXT_PUBLIC_* vars are inlined at build time for client bundles,
// but may not be available via process.env at runtime in standalone Docker builds.
// We fall back to SUPABASE_URL / SUPABASE_ANON_KEY for server-side runtime.

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  ''

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  ''
