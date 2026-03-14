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

// Map common location strings to ISO codes for Exa API
const LOCATION_TO_ISO: Record<string, string> = {
  'united arab emirates': 'AE', 'uae': 'AE', 'dubai': 'AE', 'abu dhabi': 'AE',
  'saudi arabia': 'SA', 'qatar': 'QA', 'kuwait': 'KW', 'bahrain': 'BH', 'oman': 'OM',
  'united states': 'US', 'usa': 'US', 'united kingdom': 'GB', 'uk': 'GB',
  'germany': 'DE', 'france': 'FR', 'india': 'IN', 'canada': 'CA', 'australia': 'AU',
  'singapore': 'SG', 'netherlands': 'NL', 'switzerland': 'CH', 'japan': 'JP',
  'egypt': 'EG', 'jordan': 'JO', 'lebanon': 'LB', 'pakistan': 'PK',
}

function toIsoCode(location: string): string {
  const lower = location.toLowerCase().trim()
  // Check direct mapping
  if (LOCATION_TO_ISO[lower]) return LOCATION_TO_ISO[lower]
  // Already an ISO code (2 uppercase letters)
  if (/^[A-Z]{2}$/.test(location.trim())) return location.trim()
  // Default to US
  return 'US'
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
    userLocation: toIsoCode(location),
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
  pastCompanyNames: string[],
  schoolNames: string[]
): LinkedInUrls {
  const baseUrl = 'https://www.linkedin.com/search/results/people/'
  const companyFilter = encodeURIComponent(JSON.stringify([companyNumericId]))

  let pastCompanyUrl: string | null = null
  if (pastCompanyIds.length > 0) {
    // Use numeric IDs when available (exact match)
    const pastFilter = encodeURIComponent(JSON.stringify(pastCompanyIds))
    pastCompanyUrl = `${baseUrl}?currentCompany=${companyFilter}&pastCompany=${pastFilter}`
  } else if (pastCompanyNames.length > 0) {
    // Fallback: keyword search by company names
    const keywords = pastCompanyNames.slice(0, 3).join(' OR ')
    pastCompanyUrl = `${baseUrl}?currentCompany=${companyFilter}&keywords=${encodeURIComponent(keywords)}`
  }

  let schoolUrl: string | null = null
  if (schoolNames.length > 0) {
    // Schools use keyword search (no numeric IDs available)
    const keywords = schoolNames.join(' OR ')
    schoolUrl = `${baseUrl}?currentCompany=${companyFilter}&keywords=${encodeURIComponent(keywords)}`
  }

  return { pastCompanyUrl, schoolUrl }
}
