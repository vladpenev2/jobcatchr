import { ApifyClient } from 'apify-client'

export interface LinkedInProfile {
  fullName: string
  headline: string
  city: string
  country: string
  experiences: {
    company: string
    title: string
    companyLinkedinUrl: string
  }[]
  education: {
    school: string
    degree: string
    field: string
  }[]
  skills: string[]
}

export async function extractLinkedInProfile(linkedinUrl: string): Promise<LinkedInProfile> {
  const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN })

  const run = await apify.actor('anchor/linkedin-profile-enrichment').call({
    startUrls: [{ url: linkedinUrl, id: 'candidate' }],
  })

  const { items } = await apify.dataset(run.defaultDatasetId).listItems()

  if (!items.length) {
    throw new Error('No profile data returned from Apify')
  }

  const profile = items[0] as Record<string, unknown>

  const firstName = typeof profile.first_name === 'string' ? profile.first_name : ''
  const lastName = typeof profile.last_name === 'string' ? profile.last_name : ''
  const fullNameRaw = typeof profile.full_name === 'string' ? profile.full_name : ''

  const rawExperiences = Array.isArray(profile.experiences) ? profile.experiences : []
  const rawEducation = Array.isArray(profile.education) ? profile.education : []
  const rawSkills = Array.isArray(profile.skills) ? profile.skills : []

  return {
    fullName: fullNameRaw || `${firstName} ${lastName}`.trim(),
    headline: typeof profile.headline === 'string' ? profile.headline : '',
    city: typeof profile.city === 'string' ? profile.city : '',
    country: typeof profile.country === 'string' ? profile.country : '',
    experiences: rawExperiences.map((e: Record<string, unknown>) => ({
      company: (e.company as string) || (e.company_name as string) || '',
      title: (e.title as string) || '',
      companyLinkedinUrl: (e.company_linkedin_url as string) || (e.company_linkedin as string) || '',
    })),
    education: rawEducation.map((e: Record<string, unknown>) => ({
      school: (e.school as string) || (e.school_name as string) || '',
      degree: (e.degree as string) || '',
      field: (e.field_of_study as string) || (e.field as string) || '',
    })),
    skills: rawSkills.filter((s): s is string => typeof s === 'string'),
  }
}
