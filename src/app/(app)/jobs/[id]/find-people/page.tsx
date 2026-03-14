import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, Building2 } from 'lucide-react'
import { PeopleResults } from '@/components/people/people-results'
import { LinkedInUrls } from '@/components/people/linkedin-urls'
import { buildLinkedInUrls } from '@/lib/apify/people'
import { resolveCompanyId, resolveCompanyByName } from '@/lib/apify/company'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function FindPeoplePage({ params }: PageProps) {
  const { id: jobId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminClient = createAdminClient()

  // Get job details
  const { data: job } = await adminClient
    .from('jobs')
    .select('id, title, organization, organization_logo, organization_linkedin_slug, organization_url')
    .eq('id', jobId)
    .single()

  if (!job) notFound()

  // Get user profile for auto-query generation
  const { data: profile } = await adminClient
    .from('profiles')
    .select('location, profile_data')
    .eq('id', user.id)
    .single()

  const userLocation = profile?.location ?? 'UAE'
  const profileData = profile?.profile_data as {
    experiences?: { company: string; title: string; companyLinkedinUrl: string }[]
    education?: { school: string; degree: string; field: string }[]
  } | null

  const hasProfileData =
    (profileData?.experiences?.length ?? 0) > 0 ||
    (profileData?.education?.length ?? 0) > 0

  // Check for cached search results
  const { data: cached } = await adminClient
    .from('people_searches')
    .select('id, query, results, linkedin_urls')
    .eq('user_id', user.id)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Auto-generate query
  const autoQuery = `${job.title} or hiring manager or recruiter at ${job.organization ?? ''} in ${userLocation}`

  const initialQuery = (cached?.query as string) ?? autoQuery
  const initialResults = cached ? (cached.results as {
    name: string
    title: string
    url: string
    image: string
    location: string
    highlights: string[]
  }[]) : null

  // Extract labels for LinkedIn URLs from profile data
  const targetCompanyName = job.organization?.toLowerCase() ?? ''
  const pastCompanyNames = (profileData?.experiences ?? [])
    .filter((e) => e.company && e.company.toLowerCase() !== targetCompanyName)
    .map((e) => e.company)
    .filter(Boolean)
    .slice(0, 5)
  const schoolNames = (profileData?.education ?? [])
    .map((e) => e.school)
    .filter(Boolean)
    .slice(0, 3)

  // Get or regenerate LinkedIn URLs
  let linkedInUrls = cached?.linkedin_urls as {
    pastCompanyUrl: string | null
    schoolUrl: string | null
  } | null

  // If cached URLs are missing pastCompanyUrl but we have profile data, regenerate
  if (cached && hasProfileData && (!linkedInUrls?.pastCompanyUrl) && pastCompanyNames.length > 0) {
    // Resolve target company (uses cache, no Apify credits)
    let targetId: string | null = null
    try {
      let result = null
      if (job.organization_linkedin_slug) {
        result = await resolveCompanyId(
          `https://www.linkedin.com/company/${job.organization_linkedin_slug}`
        )
      } else if (job.organization_url?.includes('linkedin.com/company')) {
        result = await resolveCompanyId(job.organization_url)
      } else if (job.organization) {
        result = await resolveCompanyByName(job.organization)
      }
      targetId = result?.numericId ?? null
    } catch { /* ignore */ }

    if (targetId) {
      // Resolve past companies in parallel (uses cache when available)
      const pastExperiences = (profileData?.experiences ?? [])
        .filter((e) => e.company && e.company.toLowerCase() !== targetCompanyName)
        .slice(0, 5)

      const pastCompanyIds: string[] = []
      if (pastExperiences.length > 0) {
        const results = await Promise.allSettled(
          pastExperiences.map((exp) => {
            if (exp.companyLinkedinUrl?.includes('linkedin.com')) {
              return resolveCompanyId(exp.companyLinkedinUrl)
            }
            return resolveCompanyByName(exp.company)
          })
        )
        for (const r of results) {
          if (r.status === 'fulfilled' && r.value?.numericId) {
            pastCompanyIds.push(r.value.numericId)
          }
        }
      }

      linkedInUrls = buildLinkedInUrls(targetId, pastCompanyIds, pastCompanyNames, schoolNames)

      // Update the cached row so this doesn't run again
      await adminClient
        .from('people_searches')
        .update({ linkedin_urls: linkedInUrls })
        .eq('id', cached.id)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link href="/">
          <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Jobs
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Building2 className="h-4 w-4" />
          <span>{job.organization ?? 'Unknown company'}</span>
        </div>
        <h1 className="text-2xl font-bold">Find People</h1>
        <p className="text-sm text-muted-foreground">
          Find insiders at {job.organization ?? 'this company'} who can help with your application
          for <span className="font-medium text-foreground">{job.title}</span>.
        </p>
      </div>

      <Separator />

      {/* People search */}
      <PeopleResults
        jobId={jobId}
        initialQuery={initialQuery}
        initialResults={initialResults}
        organizationLogo={job.organization_logo ?? null}
      />

      {/* LinkedIn shared connections URLs */}
      {hasProfileData && linkedInUrls && (
        <>
          <Separator />
          <LinkedInUrls
            pastCompanyUrl={linkedInUrls.pastCompanyUrl ?? null}
            schoolUrl={linkedInUrls.schoolUrl ?? null}
            pastCompanyNames={pastCompanyNames}
            schoolNames={schoolNames}
          />
        </>
      )}

      {hasProfileData && !linkedInUrls && (
        <>
          <Separator />
          <div className="text-xs text-muted-foreground text-center py-2">
            LinkedIn connection URLs will appear here after your first search.
          </div>
        </>
      )}

      {!hasProfileData && (
        <>
          <Separator />
          <div className="text-xs text-muted-foreground text-center py-2">
            LinkedIn shared connection URLs require a synced LinkedIn profile.{' '}
            <Link href="/settings" className="underline hover:text-foreground">
              Sync your profile
            </Link>{' '}
            to unlock this feature.
          </div>
        </>
      )}
    </div>
  )
}
