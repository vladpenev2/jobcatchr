/**
 * Environment variable validation.
 * Called at startup from the root layout (server-side).
 * Required vars throw; optional vars log a warning.
 */

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SECRET_KEY',
  'APIFY_API_TOKEN',
  'EXA_API_KEY',
] as const

const OPTIONAL_ENV_VARS = ['CRON_SECRET'] as const

export function validateEnv(): void {
  const missing: string[] = []

  for (const key of REQUIRED_ENV_VARS) {
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
