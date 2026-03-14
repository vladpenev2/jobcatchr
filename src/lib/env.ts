/**
 * Environment variable validation.
 * Server-side uses SUPABASE_URL + SUPABASE_ANON_KEY (runtime).
 * Client-side uses NEXT_PUBLIC_* (build-time inlined).
 */

const REQUIRED_SERVER_VARS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SECRET_KEY',
  'APIFY_API_TOKEN',
  'EXA_API_KEY',
] as const

const OPTIONAL_ENV_VARS = ['CRON_SECRET'] as const

export function validateEnv(): void {
  const missing: string[] = []

  for (const key of REQUIRED_SERVER_VARS) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Check your .env.local file or Railway environment settings.'
    )
  }

  for (const key of OPTIONAL_ENV_VARS) {
    if (!process.env[key]) {
      console.warn(`[env] Optional environment variable not set: ${key}`)
    }
  }
}
