import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SearchCriteria, SearchProgress } from '@/lib/adapters/types'

// Mock supabase admin client
vi.mock('@/lib/supabase/server-admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'searches') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'test-search-id' },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      if (table === 'jobs') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
          upsert: vi.fn().mockResolvedValue({ error: null }),
        }
      }
      if (table === 'search_jobs') {
        return {
          upsert: vi.fn().mockResolvedValue({ error: null }),
        }
      }
      return {}
    }),
  })),
}))

// Mock adapters
vi.mock('@/lib/adapters/career-site-feed', () => {
  class CareerSiteFeedAdapter {
    name = 'career-site-feed'
    source = 'career-site'
    actorId = 'fantastic-jobs/career-site-job-listing-feed'
    async search() {
      return {
        jobs: [
          {
            id: 'cs-job-1',
            source: 'career-site',
            source_actor: 'fantastic-jobs/career-site-job-listing-feed',
            title: 'Software Engineer',
            url: 'https://example.com/jobs/1',
          },
        ],
        count: 1,
      }
    }
    normalize() { return {} }
  }
  return { CareerSiteFeedAdapter }
})

vi.mock('@/lib/adapters/linkedin-search', () => {
  class LinkedInSearchAdapter {
    name = 'linkedin-search'
    source = 'linkedin'
    actorId = 'fantastic-jobs/advanced-linkedin-job-search-api'
    async search() {
      return {
        jobs: [
          {
            id: 'li-job-1',
            source: 'linkedin',
            source_actor: 'fantastic-jobs/advanced-linkedin-job-search-api',
            title: 'Frontend Developer',
            url: 'https://linkedin.com/jobs/1',
          },
        ],
        count: 1,
      }
    }
    normalize() { return {} }
  }
  return { LinkedInSearchAdapter }
})

const mockCriteria: SearchCriteria = {
  titleSearch: ['Software Engineer'],
  titleExclusion: [],
  keywords: [],
  locationSearch: ['United Arab Emirates'],
  timeRange: '7d',
  sourcesEnabled: ['career-site', 'linkedin'],
}

describe('executeSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns searchId and counts', async () => {
    const { executeSearch } = await import('@/lib/adapters/search-controller')
    const events: SearchProgress[] = []

    const result = await executeSearch(mockCriteria, 'user-123', (event) => {
      events.push(event)
    })

    expect(result.searchId).toBe('test-search-id')
    expect(typeof result.totalNew).toBe('number')
    expect(typeof result.totalUpdated).toBe('number')
  })

  it('emits progress events for each adapter', async () => {
    const { executeSearch } = await import('@/lib/adapters/search-controller')
    const events: SearchProgress[] = []

    await executeSearch(mockCriteria, 'user-123', (event) => {
      events.push(event)
    })

    const runningEvents = events.filter((e) => e.status === 'running')
    expect(runningEvents.length).toBeGreaterThan(0)
  })
})
