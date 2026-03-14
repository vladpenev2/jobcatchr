import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock env vars
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')

const mockGetUser = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

// Mock NextResponse
const mockRedirect = vi.fn((url) => ({ type: 'redirect', url }))
const mockNext = vi.fn((..._args) => ({
  type: 'next',
  cookies: { set: vi.fn() },
}))

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: (...args: unknown[]) => mockRedirect(...args),
    next: (...args: unknown[]) => mockNext(...args),
  },
}))

function makeRequest(pathname: string) {
  const url = new URL(`http://localhost:3000${pathname}`)
  return {
    nextUrl: {
      pathname,
      clone: () => ({
        pathname,
        href: url.href,
      }),
    },
    cookies: {
      getAll: vi.fn(() => []),
      set: vi.fn(),
    },
  }
}

describe('updateSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects unauthenticated user from / to /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { updateSession } = await import('@/lib/supabase/proxy')
    const req = makeRequest('/')
    await updateSession(req as never)
    expect(mockRedirect).toHaveBeenCalled()
  })

  it('allows unauthenticated user on /login (no redirect)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { updateSession } = await import('@/lib/supabase/proxy')
    const req = makeRequest('/login')
    await updateSession(req as never)
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('redirects authenticated user from /login to /', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { updateSession } = await import('@/lib/supabase/proxy')
    const req = makeRequest('/login')
    await updateSession(req as never)
    expect(mockRedirect).toHaveBeenCalled()
  })

  it('allows authenticated user on / (no redirect)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const { updateSession } = await import('@/lib/supabase/proxy')
    const req = makeRequest('/')
    await updateSession(req as never)
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('allows unauthenticated user on /auth/callback (no redirect)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { updateSession } = await import('@/lib/supabase/proxy')
    const req = makeRequest('/auth/callback')
    await updateSession(req as never)
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
