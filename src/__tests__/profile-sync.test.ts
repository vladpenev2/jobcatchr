import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock state
let mockUser: { id: string } | null = null
let mockProfile: { linkedin_url: string | null } | null = null
let mockProfileError: Error | null = null
let mockUpdateError: Error | null = null
let mockExtractResult: unknown = null
let mockExtractError: Error | null = null

const mockEq = vi.fn().mockImplementation(() =>
  Promise.resolve({ error: mockUpdateError })
)
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: mockUser } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: mockProfile,
              error: mockProfileError,
            }),
        }),
      }),
    }),
  })),
}))

vi.mock('@/lib/supabase/server-admin', () => ({
  createAdminClient: vi.fn().mockImplementation(() => ({
    from: () => ({
      update: mockUpdate,
    }),
  })),
}))

vi.mock('@/lib/apify/profile', () => ({
  extractLinkedInProfile: vi.fn().mockImplementation(async () => {
    if (mockExtractError) throw mockExtractError
    return mockExtractResult
  }),
}))

const validProfile = {
  fullName: 'Jane Doe',
  headline: 'Engineer',
  city: 'Dubai',
  country: 'UAE',
  experiences: [],
  education: [],
  skills: [],
}

describe('POST /api/profile/sync', () => {
  beforeEach(() => {
    mockUser = { id: 'user-1' }
    mockProfile = { linkedin_url: 'https://linkedin.com/in/jane' }
    mockProfileError = null
    mockUpdateError = null
    mockExtractResult = validProfile
    mockExtractError = null
  })

  async function callRoute() {
    const { POST } = await import('@/app/api/profile/sync/route')
    const response = await POST()
    const body = await response.json()
    return { status: response.status, body }
  }

  it('returns 401 when user is not authenticated', async () => {
    mockUser = null
    const { status, body } = await callRoute()
    expect(status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 400 when no LinkedIn URL is set', async () => {
    mockProfile = { linkedin_url: null }
    const { status, body } = await callRoute()
    expect(status).toBe(400)
    expect(body.error).toContain('No LinkedIn URL')
  })

  it('returns 500 when Apify extraction fails', async () => {
    mockExtractError = new Error('No profile data returned from Apify')
    const { status, body } = await callRoute()
    expect(status).toBe(500)
    expect(body.error).toContain('No profile data returned')
  })

  it('returns 500 when DB update fails', async () => {
    mockUpdateError = new Error('DB write failed') as unknown as Error
    // Need to make mockEq return an error
    mockEq.mockImplementationOnce(() =>
      Promise.resolve({ error: { message: 'DB write failed' } })
    )
    const { status, body } = await callRoute()
    expect(status).toBe(500)
    expect(body.error).toContain('Failed to update profile')
  })

  it('returns success with profile data on valid sync', async () => {
    const { status, body } = await callRoute()
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.profileData.fullName).toBe('Jane Doe')
    expect(body.profileData.city).toBe('Dubai')
  })
})
