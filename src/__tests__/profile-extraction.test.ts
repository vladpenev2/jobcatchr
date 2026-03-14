import { describe, it, expect, vi, beforeEach } from 'vitest'

// Module-level mock state
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

describe('extractLinkedInProfile', () => {
  beforeEach(() => {
    vi.resetModules()
    mockItems = []
  })

  it('maps raw profile fields to expected shape', async () => {
    mockItems = [
      {
        full_name: 'Jane Doe',
        headline: 'Software Engineer',
        city: 'Dubai',
        country: 'UAE',
        experiences: [
          {
            company: 'Acme Corp',
            title: 'Engineer',
            company_linkedin_url: 'https://linkedin.com/company/acme',
          },
        ],
        education: [
          {
            school: 'MIT',
            degree: 'BS',
            field_of_study: 'Computer Science',
          },
        ],
        skills: ['TypeScript', 'React'],
      },
    ]

    const { extractLinkedInProfile } = await import('@/lib/apify/profile')
    const result = await extractLinkedInProfile('https://linkedin.com/in/janedoe')

    expect(result.fullName).toBe('Jane Doe')
    expect(result.headline).toBe('Software Engineer')
    expect(result.city).toBe('Dubai')
    expect(result.country).toBe('UAE')
    expect(result.experiences).toHaveLength(1)
    expect(result.experiences[0].company).toBe('Acme Corp')
    expect(result.experiences[0].title).toBe('Engineer')
    expect(result.experiences[0].companyLinkedinUrl).toBe('https://linkedin.com/company/acme')
    expect(result.education).toHaveLength(1)
    expect(result.education[0].school).toBe('MIT')
    expect(result.education[0].degree).toBe('BS')
    expect(result.education[0].field).toBe('Computer Science')
    expect(result.skills).toEqual(['TypeScript', 'React'])
  })

  it('falls back to first_name + last_name when full_name is missing', async () => {
    mockItems = [
      {
        first_name: 'John',
        last_name: 'Smith',
        headline: '',
        city: '',
        country: '',
        experiences: [],
        education: [],
        skills: [],
      },
    ]

    const { extractLinkedInProfile } = await import('@/lib/apify/profile')
    const result = await extractLinkedInProfile('https://linkedin.com/in/johnsmith')

    expect(result.fullName).toBe('John Smith')
  })

  it('throws when Apify returns no items', async () => {
    mockItems = []

    const { extractLinkedInProfile } = await import('@/lib/apify/profile')
    await expect(
      extractLinkedInProfile('https://linkedin.com/in/nobody')
    ).rejects.toThrow('No profile data returned from Apify')
  })
})
