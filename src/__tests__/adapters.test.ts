import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CareerSiteFeedAdapter } from '@/lib/adapters/career-site-feed'
import { LinkedInSearchAdapter } from '@/lib/adapters/linkedin-search'
import type { SearchCriteria } from '@/lib/adapters/types'

// Mock apify-client
vi.mock('apify-client', () => {
  class MockApifyClient {
    actor() {
      return {
        call: vi.fn().mockResolvedValue({ defaultDatasetId: 'mock-dataset-id' }),
      }
    }
    dataset() {
      return {
        listItems: vi.fn().mockResolvedValue({ items: [] }),
      }
    }
  }
  return { ApifyClient: MockApifyClient }
})

const mockCriteria: SearchCriteria = {
  titleSearch: ['Software Engineer'],
  titleExclusion: ['Senior'],
  keywords: ['React'],
  locationSearch: ['United Arab Emirates'],
  timeRange: '7d',
  sourcesEnabled: ['career-site', 'linkedin'],
}

describe('CareerSiteFeedAdapter', () => {
  let adapter: CareerSiteFeedAdapter

  beforeEach(() => {
    adapter = new CareerSiteFeedAdapter()
  })

  it('has correct name and source', () => {
    expect(adapter.name).toBe('career-site-feed')
    expect(adapter.source).toBe('career-site')
    expect(adapter.actorId).toBe('fantastic-jobs/career-site-job-listing-feed')
  })

  it('normalizes a raw career site job', () => {
    const rawItem = {
      id: 'cs-123',
      title: 'Software Engineer',
      organization: 'Acme Corp',
      organization_url: 'https://acme.com',
      organization_logo: 'https://acme.com/logo.png',
      url: 'https://acme.com/jobs/1',
      description_text: 'A great job',
      description_html: '<p>A great job</p>',
      location: { addressLocality: 'Dubai' },
      locations_derived: [{ city: 'Dubai', country: 'United Arab Emirates' }],
      cities_derived: ['Dubai'],
      regions_derived: [],
      countries_derived: ['United Arab Emirates'],
      remote_derived: false,
      employment_type: ['FULL_TIME'],
      salary: null,
      date_published: '2025-01-01T00:00:00Z',
      date_validthrough: null,
      domain: 'acme.com',
      ai_experience_level: '2-5',
      ai_work_arrangement: 'On-site',
      ai_key_skills: ['React', 'TypeScript'],
      ai_employment_type: ['FULL_TIME'],
      ai_core_responsibilities: 'Build things',
      ai_requirements_summary: 'Know stuff',
      ai_salary_minvalue: null,
      ai_salary_maxvalue: null,
      ai_salary_currency: null,
      ai_salary_unittext: null,
    }

    const job = adapter.normalize(rawItem)

    expect(job.id).toBe('cs-123')
    expect(job.source).toBe('career-site')
    expect(job.source_actor).toBe('fantastic-jobs/career-site-job-listing-feed')
    expect(job.title).toBe('Software Engineer')
    expect(job.organization).toBe('Acme Corp')
    expect(job.url).toBe('https://acme.com/jobs/1')
    expect(job.cities_derived).toEqual(['Dubai'])
    expect(job.ai_experience_level).toBe('2-5')
  })

  it('returns empty results when search returns no items', async () => {
    const result = await adapter.search(mockCriteria)
    expect(result.jobs).toEqual([])
    expect(result.count).toBe(0)
  })
})

describe('LinkedInSearchAdapter', () => {
  let adapter: LinkedInSearchAdapter

  beforeEach(() => {
    adapter = new LinkedInSearchAdapter()
  })

  it('has correct name and source', () => {
    expect(adapter.name).toBe('linkedin-search')
    expect(adapter.source).toBe('linkedin')
    expect(adapter.actorId).toBe('fantastic-jobs/advanced-linkedin-job-search-api')
  })

  it('normalizes a raw LinkedIn job', () => {
    const rawItem = {
      id: 'li-456',
      title: 'Frontend Developer',
      organization: 'Tech Co',
      organization_url: 'https://techco.com',
      organization_logo: 'https://techco.com/logo.png',
      url: 'https://linkedin.com/jobs/456',
      description_text: 'Frontend role',
      description_html: '<p>Frontend role</p>',
      locations_derived: [{ city: 'Abu Dhabi', country: 'United Arab Emirates' }],
      cities_derived: ['Abu Dhabi'],
      regions_derived: [],
      countries_derived: ['United Arab Emirates'],
      remote_derived: false,
      employment_type: ['FULL_TIME'],
      salary_raw: null,
      date_posted: '2025-01-02T00:00:00Z',
      date_validthrough: '2025-02-01T00:00:00Z',
      seniority: 'Mid-Senior level',
      recruiter_name: 'Jane Smith',
      recruiter_url: 'https://linkedin.com/in/jane-smith',
      directapply: false,
      external_apply_url: 'https://techco.com/apply',
      linkedin_org_url: 'https://linkedin.com/company/tech-co',
      linkedin_org_employees: 500,
      linkedin_org_industry: 'Technology',
      linkedin_org_size: '201-500',
      linkedin_org_headquarters: 'Abu Dhabi, UAE',
      linkedin_org_description: 'A tech company',
    }

    const job = adapter.normalize(rawItem)

    expect(job.id).toBe('li-456')
    expect(job.source).toBe('linkedin')
    expect(job.source_actor).toBe('fantastic-jobs/advanced-linkedin-job-search-api')
    expect(job.seniority).toBe('Mid-Senior level')
    expect(job.recruiter_name).toBe('Jane Smith')
    expect(job.directapply).toBe(false)
    expect(job.organization_linkedin_slug).toBe('tech-co')
    expect(job.linkedin_org_employees).toBe(500)
  })
})
