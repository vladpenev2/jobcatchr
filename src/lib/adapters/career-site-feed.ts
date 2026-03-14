import { ApifyClient } from 'apify-client'
import { BaseAdapter } from './base-adapter'
import type { AdapterResult, SearchCriteria, UnifiedJob } from './types'

const TIME_RANGE_MAP: Record<string, string> = {
  '1h': '1 hours ago',
  '24h': '1 days ago',
  '7d': '7 days ago',
  '6m': '180 days ago',
}

export class CareerSiteFeedAdapter extends BaseAdapter {
  name = 'career-site-feed'
  source = 'career-site' as const
  actorId = 'fantastic-jobs/career-site-job-listing-feed'

  async search(criteria: SearchCriteria): Promise<AdapterResult> {
    const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN })

    const input: Record<string, unknown> = {
      limit: 1000,
      includeAi: true,
      includeLinkedIn: true,
      descriptionType: 'text',
    }

    if (criteria.titleSearch.length > 0) {
      input.titleSearch = criteria.titleSearch
    }
    if (criteria.titleExclusion.length > 0) {
      input.titleExclusionSearch = criteria.titleExclusion
    }
    if (criteria.keywords.length > 0) {
      input.descriptionSearch = criteria.keywords
    }
    if (criteria.locationSearch.length > 0) {
      input.locationSearch = criteria.locationSearch
    }

    const run = await client.actor(this.actorId).call(input)
    const dataset = await client.dataset(run.defaultDatasetId).listItems()
    const items = dataset.items as unknown[]

    const jobs = items.map((item) => this.normalize(item))
    return { jobs, count: jobs.length }
  }

  normalize(rawItem: unknown): UnifiedJob {
    const item = rawItem as Record<string, unknown>

    return {
      id: item.id as string,
      source: 'career-site',
      source_actor: this.actorId,
      source_name: (item.source as string) ?? null,
      title: item.title as string,
      organization: (item.organization as string) ?? null,
      organization_url: (item.organization_url as string) ?? null,
      organization_logo: (item.organization_logo as string) ?? null,
      organization_linkedin_slug: (item.linkedin_org_slug as string) ?? null,
      url: item.url as string,
      description_text: (item.description_text as string) ?? null,
      description_html: (item.description_html as string) ?? null,
      location_raw: (item.location as Record<string, unknown>) ?? null,
      locations_derived: (item.locations_derived as string[]) ?? null,
      cities_derived: (item.cities_derived as string[]) ?? null,
      regions_derived: (item.regions_derived as string[]) ?? null,
      countries_derived: (item.countries_derived as string[]) ?? null,
      remote_derived: (item.remote_derived as boolean) ?? null,
      employment_type: (item.employment_type as string[]) ?? null,
      salary_raw: (item.salary as Record<string, unknown>) ?? null,
      date_posted: (item.date_published as string) ?? null,
      date_validthrough: (item.date_validthrough as string) ?? null,
      source_domain: (item.domain as string) ?? null,
      // AI fields
      ai_experience_level: (item.ai_experience_level as string) ?? null,
      ai_work_arrangement: (item.ai_work_arrangement as string) ?? null,
      ai_key_skills: (item.ai_key_skills as string[]) ?? null,
      ai_employment_type: (item.ai_employment_type as string[]) ?? null,
      ai_core_responsibilities: (item.ai_core_responsibilities as string) ?? null,
      ai_requirements_summary: (item.ai_requirements_summary as string) ?? null,
      ai_salary_min: (item.ai_salary_minvalue as number) ?? null,
      ai_salary_max: (item.ai_salary_maxvalue as number) ?? null,
      ai_salary_currency: (item.ai_salary_currency as string) ?? null,
      ai_salary_unit: (item.ai_salary_unittext as string) ?? null,
      // LinkedIn org fields
      linkedin_org_employees: (item.linkedin_org_employees as number) ?? null,
      linkedin_org_industry: (item.linkedin_org_industry as string) ?? null,
      linkedin_org_size: (item.linkedin_org_size as string) ?? null,
      linkedin_org_headquarters: (item.linkedin_org_headquarters as string) ?? null,
      linkedin_org_description: (item.linkedin_org_description as string) ?? null,
      raw_data: item as Record<string, unknown>,
    }
  }
}
