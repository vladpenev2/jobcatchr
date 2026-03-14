import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock env
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockRedirect = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error('NEXT_REDIRECT') // redirect throws in Next.js
  },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}))

describe('Admin guard logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /login when no user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { default: AdminLayout } = await import('@/app/(app)/admin/layout')

    try {
      await AdminLayout({ children: null })
    } catch (e: unknown) {
      if (e instanceof Error && e.message !== 'NEXT_REDIRECT') throw e
    }

    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('redirects to / when user is not admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { role: 'user' } }),
        }),
      }),
    })

    const { default: AdminLayout } = await import('@/app/(app)/admin/layout')

    try {
      await AdminLayout({ children: null })
    } catch (e: unknown) {
      if (e instanceof Error && e.message !== 'NEXT_REDIRECT') throw e
    }

    expect(mockRedirect).toHaveBeenCalledWith('/')
  })

  it('renders children when user is admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { role: 'admin' } }),
        }),
      }),
    })

    const { default: AdminLayout } = await import('@/app/(app)/admin/layout')
    await AdminLayout({ children: 'test content' as unknown as React.ReactNode })

    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
