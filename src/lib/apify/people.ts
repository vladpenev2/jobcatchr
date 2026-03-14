import { ApifyClient } from 'apify-client'

export interface Person {
  name: string
  title: string
  url: string
  image: string
  location: string
  highlights: string[]
}

export interface LinkedInUrls {
  pastCompanyUrl: string | null
  schoolUrl: string | null
}

export async function searchPeople(
  query: string,
  location: string,
  numResults: number,
  highlightsQuery: string
): Promise<Person[]> {
  const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN })

  const actorInput: Record<string, unknown> = {
    exaApiKey: process.env.EXA_API_KEY,
    query,
    userLocation: location || 'US',
    numResults: numResults || 10,
    includeText: false,
  }

  if (highlightsQuery) {
    actorInput.highlightsQuery = highlightsQuery
    actorInput.numSentences = 2
    actorInput.highlightsPerUrl = 1
  }

  const run = await apify.actor('fantastic-jobs/exa-ai-people-search').call(actorInput)

  const { items } = await apify.dataset(run.defaultDatasetId).listItems()

  return items.map((item) => {
    const raw = item as Record<string, unknown>
    const entities = Array.isArray(raw.entities) ? raw.entities : []
    const entity =
      entities.length > 0
        ? ((entities[0] as Record<string, unknown>).properties as Record<string, unknown>)
        : null

    const highlights = Array.isArray(raw.highlights) ? raw.highlights : []

    return {
      name:
        (raw.author as string) ||
        (entity && (entity.name as string)) ||
        (raw.title as string) ||
        '',
      title: (raw.title as string) || '',
      url: (raw.url as string) || '',
      image: (raw.image as string) || '',
      location: (entity && (entity.location as string)) || '',
      highlights: highlights.filter((h): h is string => typeof h === 'string'),
    }
  })
}

export function buildLinkedInUrls(
  companyNumericId: string,
  pastCompanyIds: string[],
  schoolIds: string[]
): LinkedInUrls {
  const baseUrl = 'https://www.linkedin.com/search/results/people/'
  const companyFilter = encodeURIComponent(JSON.stringify([companyNumericId]))

  let pastCompanyUrl: string | null = null
  if (pastCompanyIds.length > 0) {
    const pastFilter = encodeURIComponent(JSON.stringify(pastCompanyIds))
    pastCompanyUrl = `${baseUrl}?currentCompany=${companyFilter}&pastCompany=${pastFilter}`
  }

  let schoolUrl: string | null = null
  if (schoolIds.length > 0) {
    const schoolFilter = encodeURIComponent(JSON.stringify(schoolIds))
    schoolUrl = `${baseUrl}?currentCompany=${companyFilter}&schoolFilter=${schoolFilter}`
  }

  return { pastCompanyUrl, schoolUrl }
}
