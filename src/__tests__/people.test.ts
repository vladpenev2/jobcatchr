import { describe, it, expect, vi, beforeEach } from 'vitest'

let mockItems: unknown[] = []

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

describe('searchPeople', () => {
  beforeEach(() => {
    vi.resetModules()
    mockItems = []
  })

  it('maps Apify items to Person shape', async () => {
    mockItems = [
      {
        author: 'Jane Smith',
        title: 'Head of Talent at TechCorp',
        url: 'https://linkedin.com/in/janesmith',
        image: 'https://example.com/jane.jpg',
        highlights: ['She leads hiring at TechCorp'],
        entities: [
          {
            properties: {
              name: 'Jane Smith',
              location: 'Dubai, UAE',
            },
          },
        ],
      },
    ]

    const { searchPeople } = await import('@/lib/apify/people')
    const results = await searchPeople('recruiter at TechCorp', 'UAE', 10, 'hiring manager')

    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Jane Smith')
    expect(results[0].title).toBe('Head of Talent at TechCorp')
    expect(results[0].url).toBe('https://linkedin.com/in/janesmith')
    expect(results[0].image).toBe('https://example.com/jane.jpg')
    expect(results[0].location).toBe('Dubai, UAE')
    expect(results[0].highlights).toEqual(['She leads hiring at TechCorp'])
  })

  it('falls back to title when author is missing', async () => {
    mockItems = [
      {
        title: 'Recruiter at Startup',
        url: 'https://linkedin.com/in/recruiter',
        image: '',
        highlights: [],
        entities: [],
      },
    ]

    const { searchPeople } = await import('@/lib/apify/people')
    const results = await searchPeople('recruiter', 'US', 5, '')

    expect(results[0].name).toBe('Recruiter at Startup')
    expect(results[0].location).toBe('')
  })

  it('returns empty array when Apify returns no items', async () => {
    mockItems = []

    const { searchPeople } = await import('@/lib/apify/people')
    const results = await searchPeople('recruiter at nobody', 'US', 10, '')

    expect(results).toHaveLength(0)
  })
})

describe('buildLinkedInUrls', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('builds past company URL with numeric IDs when available', async () => {
    const { buildLinkedInUrls } = await import('@/lib/apify/people')
    const result = buildLinkedInUrls('11111', ['22222', '33333'], ['Acme', 'BigCo'], [])

    expect(result.pastCompanyUrl).not.toBeNull()
    expect(result.pastCompanyUrl).toContain('currentCompany')
    expect(result.pastCompanyUrl).toContain('pastCompany')
    expect(result.schoolUrl).toBeNull()
  })

  it('falls back to keywords when no numeric IDs but has company names', async () => {
    const { buildLinkedInUrls } = await import('@/lib/apify/people')
    const result = buildLinkedInUrls('11111', [], ['Acme Corp', 'BigCo'], [])

    expect(result.pastCompanyUrl).not.toBeNull()
    expect(result.pastCompanyUrl).toContain('currentCompany')
    expect(result.pastCompanyUrl).toContain('keywords')
    expect(result.pastCompanyUrl).toContain(encodeURIComponent('Acme Corp OR BigCo'))
  })

  it('builds school URL with keyword search', async () => {
    const { buildLinkedInUrls } = await import('@/lib/apify/people')
    const result = buildLinkedInUrls('11111', [], [], ['MIT', 'Stanford'])

    expect(result.pastCompanyUrl).toBeNull()
    expect(result.schoolUrl).not.toBeNull()
    expect(result.schoolUrl).toContain('currentCompany')
    expect(result.schoolUrl).toContain('keywords')
    expect(result.schoolUrl).toContain(encodeURIComponent('MIT OR Stanford'))
  })

  it('builds both URLs when both provided', async () => {
    const { buildLinkedInUrls } = await import('@/lib/apify/people')
    const result = buildLinkedInUrls('11111', ['22222'], ['Acme'], ['MIT'])

    expect(result.pastCompanyUrl).not.toBeNull()
    expect(result.schoolUrl).not.toBeNull()
  })

  it('returns null for both when no past companies or schools', async () => {
    const { buildLinkedInUrls } = await import('@/lib/apify/people')
    const result = buildLinkedInUrls('11111', [], [], [])

    expect(result.pastCompanyUrl).toBeNull()
    expect(result.schoolUrl).toBeNull()
  })

  it('encodes company ID correctly in current company filter', async () => {
    const { buildLinkedInUrls } = await import('@/lib/apify/people')
    const result = buildLinkedInUrls('99999', ['12345'], ['Acme'], [])

    expect(result.pastCompanyUrl).toContain(encodeURIComponent(JSON.stringify(['99999'])))
    expect(result.pastCompanyUrl).toContain(encodeURIComponent(JSON.stringify(['12345'])))
  })
})
