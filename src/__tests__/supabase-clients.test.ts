import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock env vars
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_test')

const mockCreateBrowserClient = vi.fn(() => ({ auth: {} }))
const mockCreateServerClient = vi.fn(() => ({ auth: {} }))
const mockCreateSupabaseClient = vi.fn(() => ({ auth: {} }))

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: mockCreateBrowserClient,
  createServerClient: mockCreateServerClient,
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateSupabaseClient,
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}))

describe('Supabase clients', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('browser client calls createBrowserClient with correct params', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    createClient()
    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'sb_publishable_test'
    )
  })

  it('admin client calls createClient with secret key and no session persistence', async () => {
    const { createAdminClient } = await import('@/lib/supabase/server-admin')
    createAdminClient()
    expect(mockCreateSupabaseClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'sb_secret_test',
      { auth: { persistSession: false } }
    )
  })

  it('server client is an async function', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    expect(typeof createClient).toBe('function')
    // The function is async (returns a promise)
    const result = createClient()
    expect(result).toBeInstanceOf(Promise)
  })
})
