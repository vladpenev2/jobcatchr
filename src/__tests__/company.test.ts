import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock state
let mockItems: unknown[] = []
let mockCacheRow: unknown = null

vi.mock('apify-client', () => {
  class MockApifyClient {
    actor(_name: string) {
      return {
        call: vi.fn().mockResolvedValue({ defaultDatasetId: 'mock-dataset-id' }),
      }
    }
    dataset(_id: string) {
      return {
        listItems: () => Promise.resolve({ items: mockItems }),
      }
    }
  }
  return { ApifyClient: MockApifyClient }
})

vi.mock('@/lib/supabase/server-admin', () => ({
  createAdminClient: () => ({
    from: (_table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: mockCacheRow }),
        }),
      }),
      upsert: () => Promise.resolve({ error: null }),
    }),
  }),
}))

describe('resolveCompanyId', () => {
  beforeEach(() => {
    vi.resetModules()
    mockItems = []
    mockCacheRow = null
  })

  it('returns cached data when cache is fresh', async () => {
    const recentDate = new Date()
    recentDate.setDate(recentDate.getDate() - 1) // 1 day ago
    mockCacheRow = {
      numeric_id: '12345',
      name: 'Acme Corp',
      slug: 'acme-corp',
      logo_url: 'https://example.com/logo.png',
      fetched_at: recentDate.toISOString(),
    }

    const { resolveCompanyId } = await import('@/lib/apify/company')
    const result = await resolveCompanyId('https://www.linkedin.com/company/acme-corp')

    expect(result).not.toBeNull()
    expect(result!.numericId).toBe('12345')
    expect(result!.name).toBe('Acme Corp')
    expect(result!.slug).toBe('acme-corp')
  })

  it('calls Apify when cache miss', async () => {
    mockCacheRow = null
    mockItems = [
      {
        companyId: 67890,
        companyName: 'NewCo',
        universalName: 'newco',
        logoResolutionResult: 'https://example.com/newco-logo.png',
      },
    ]

    const { resolveCompanyId } = await import('@/lib/apify/company')
    const result = await resolveCompanyId('https://www.linkedin.com/company/newco')

    expect(result).not.toBeNull()
    expect(result!.numericId).toBe('67890')
    expect(result!.name).toBe('NewCo')
    expect(result!.slug).toBe('newco')
    expect(result!.logoUrl).toBe('https://example.com/newco-logo.png')
  })

  it('returns null when Apify returns no items', async () => {
    mockCacheRow = null
    mockItems = []

    const { resolveCompanyId } = await import('@/lib/apify/company')
    const result = await resolveCompanyId('https://www.linkedin.com/company/nonexistent')

    expect(result).toBeNull()
  })
})

describe('resolveCompanyByName', () => {
  beforeEach(() => {
    vi.resetModules()
    mockItems = []
    mockCacheRow = null
  })

  it('constructs LinkedIn URL from company name and resolves', async () => {
    mockCacheRow = null
    mockItems = [
      {
        companyId: 99999,
        companyName: 'My Company Inc',
        universalName: 'my-company-inc',
        logoResolutionResult: '',
      },
    ]

    const { resolveCompanyByName } = await import('@/lib/apify/company')
    const result = await resolveCompanyByName('My Company Inc')

    expect(result).not.toBeNull()
    expect(result!.numericId).toBe('99999')
  })

  it('slugifies company name correctly', async () => {
    mockCacheRow = null
    mockItems = [
      {
        companyId: 11111,
        companyName: 'Foo & Bar LLC',
        universalName: 'foo-bar-llc',
        logoResolutionResult: '',
      },
    ]

    const { resolveCompanyByName } = await import('@/lib/apify/company')
    const result = await resolveCompanyByName('Foo & Bar LLC')

    expect(result).not.toBeNull()
    expect(result!.numericId).toBe('11111')
  })
})
