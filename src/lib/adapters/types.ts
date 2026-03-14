export interface UnifiedJob {
  id: string
  source: 'career-site' | 'linkedin'
  source_actor: string
  source_name?: string | null
  title: string
  organization?: string | null
  organization_url?: string | null
  organization_logo?: string | null
  organization_linkedin_slug?: string | null
  url: string
  description_text?: string | null
  description_html?: string | null
  location_raw?: Record<string, unknown> | null
  locations_derived?: string[] | null
  cities_derived?: string[] | null
  regions_derived?: string[] | null
  countries_derived?: string[] | null
  remote_derived?: boolean | null
  employment_type?: string[] | null
  salary_raw?: Record<string, unknown> | null
  date_posted?: string | null
  date_validthrough?: string | null
  status?: 'active' | 'likely_expired' | 'expired'
  // LinkedIn-specific
  seniority?: string | null
  recruiter_name?: string | null
  recruiter_title?: string | null
  recruiter_url?: string | null
  directapply?: boolean | null
  external_apply_url?: string | null
  source_domain?: string | null
  // AI enrichment
  ai_experience_level?: string | null
  ai_work_arrangement?: string | null
  ai_key_skills?: string[] | null
  ai_employment_type?: string[] | null
  ai_core_responsibilities?: string | null
  ai_requirements_summary?: string | null
  ai_salary_min?: number | null
  ai_salary_max?: number | null
  ai_salary_currency?: string | null
  ai_salary_unit?: string | null
  // LinkedIn org enrichment
  linkedin_org_employees?: number | null
  linkedin_org_industry?: string | null
  linkedin_org_size?: string | null
  linkedin_org_headquarters?: string | null
  linkedin_org_description?: string | null
  // Raw payload
  raw_data?: Record<string, unknown> | null
}

export interface SearchCriteria {
  titleSearch: string[]
  titleExclusion: string[]
  keywords: string[]
  locationSearch: string[]
  timeRange: '1h' | '24h' | '7d' | '6m'
  sourcesEnabled: string[]
}

export type SearchProgress = {
  stage: string
  status: 'running' | 'done' | 'error'
  count?: number
  message?: string
  totalNew?: number
  totalUpdated?: number
  searchId?: string
}

export type AdapterResult = {
  jobs: UnifiedJob[]
  count: number
}
