import { ApifyClient } from 'apify-client'
import { createAdminClient } from '@/lib/supabase/server-admin'

export interface CompanyData {
  numericId: string
  name: string
  slug: string
  logoUrl: string
}

const CACHE_TTL_DAYS = 30

function normalizeLinkedInUrl(url: string): string {
  return url.toLowerCase().replace(/\/$/, '')
}

export async function resolveCompanyId(linkedinUrl: string): Promise<CompanyData | null> {
  const normalizedUrl = normalizeLinkedInUrl(linkedinUrl)
  const adminClient = createAdminClient()

  // Check cache first
  const { data: cached } = await adminClient
    .from('company_cache')
    .select('numeric_id, name, slug, logo_url, fetched_at')
    .eq('linkedin_url', normalizedUrl)
    .single()

  if (cached) {
    const fetchedAt = new Date(cached.fetched_at)
    const ageMs = Date.now() - fetchedAt.getTime()
    const ageDays = ageMs / (1000 * 60 * 60 * 24)
    if (ageDays < CACHE_TTL_DAYS) {
      return {
        numericId: cached.numeric_id ?? '',
        name: cached.name ?? '',
        slug: cached.slug ?? '',
        logoUrl: cached.logo_url ?? '',
      }
    }
  }

  // Cache miss or stale - call Apify
  const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN })

  try {
    const run = await apify.actor('dev_fusion/linkedin-company-scraper').call({
      profileUrls: [linkedinUrl],
    })

    const { items } = await apify.dataset(run.defaultDatasetId).listItems()

    if (!items.length) {
      return null
    }

    const company = items[0] as Record<string, unknown>
    const result: CompanyData = {
      numericId: String(company.companyId ?? ''),
      name: String(company.companyName ?? ''),
      slug: String(company.universalName ?? ''),
      logoUrl: String(company.logoResolutionResult ?? ''),
    }

    // Cache the result if we got a valid numeric ID
    if (result.numericId) {
      await adminClient.from('company_cache').upsert({
        linkedin_url: normalizedUrl,
        numeric_id: result.numericId,
        name: result.name,
        slug: result.slug,
        logo_url: result.logoUrl,
        data: company,
        fetched_at: new Date().toISOString(),
      })
    }

    return result
  } catch (err) {
    console.error('Company resolve error:', err)
    return null
  }
}

export async function resolveCompanyByName(companyName: string): Promise<CompanyData | null> {
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const linkedinUrl = `https://www.linkedin.com/company/${slug}`
  return resolveCompanyId(linkedinUrl)
}
