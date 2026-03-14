/**
 * Environment variable validation.
 * Called at startup from the root layout (server-side).
 * Required vars throw; optional vars log a warning.
 */

// Each entry: [primary, fallback] - at least one must be set
const REQUIRED_ENV_PAIRS: [string, string | null][] = [
  ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'],
  ['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_ANON_KEY'],
  ['SUPABASE_SECRET_KEY', null],
  ['APIFY_API_TOKEN', null],
  ['EXA_API_KEY', null],
]

const OPTIONAL_ENV_VARS = ['CRON_SECRET'] as const

export function validateEnv(): void {
  const missing: string[] = []

  for (const [primary, fallback] of REQUIRED_ENV_PAIRS) {
    if (!process.env[primary] && !(fallback && process.env[fallback])) {
      missing.push(fallback ? `${primary} or ${fallback}` : primary)
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
