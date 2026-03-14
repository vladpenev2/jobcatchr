'use client'

import { useEffect, useState } from 'react'
import { PeopleResults } from '@/components/people/people-results'
import { LinkedInUrls } from '@/components/people/linkedin-urls'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { buildPeopleSearchQuery } from '@/lib/utils'
import type { Job } from './job-table'

interface PeopleTabProps {
  job: Job
}

interface LinkedInUrlsData {
  pastCompanyUrl: string | null
  schoolUrl: string | null
}

interface Person {
  name: string
  title: string
  url: string
  image: string
  location: string
  highlights: string[]
}

export function PeopleTab({ job }: PeopleTabProps) {
  const [loading, setLoading] = useState(true)
  const [profileSynced, setProfileSynced] = useState<boolean | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [cachedQuery, setCachedQuery] = useState<string | null>(null)
  const [cachedResults, setCachedResults] = useState<Person[] | null>(null)
  const [linkedInUrls, setLinkedInUrls] = useState<LinkedInUrlsData | null>(null)
  const [searchTemplate, setSearchTemplate] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setCachedQuery(null)
    setCachedResults(null)
    setLinkedInUrls(null)

    Promise.all([
      fetch(`/api/jobs/${job.id}/find-people`).then((r) => r.json()).catch(() => ({})),
      fetch('/api/profile/sync').then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([peopleData, syncData]) => {
      if (peopleData?.peopleSearchTemplate !== undefined) {
        setSearchTemplate(peopleData.peopleSearchTemplate)
      }
      if (peopleData?.cached) {
        setCachedQuery(peopleData.query)
        setCachedResults(peopleData.results)
        if (peopleData.linkedInUrls) setLinkedInUrls(peopleData.linkedInUrls)
      }
      // syncData will be null if no GET handler exists, check profile_synced_at
      setProfileSynced(syncData?.synced ?? true)
    }).finally(() => setLoading(false))
  }, [job.id])

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/profile/sync', { method: 'POST' })
      if (res.ok) {
        toast.success('LinkedIn profile synced')
        setProfileSynced(true)
      } else {
        const data = await res.json().catch(() => null)
        toast.error(data?.error ?? 'Sync failed')
      }
    } catch {
      toast.error('Network error during sync')
    } finally {
      setSyncing(false)
    }
  }

  const autoQuery = buildPeopleSearchQuery(searchTemplate, job.title, job.organization ?? '')
  const hasUrls = linkedInUrls && (linkedInUrls.pastCompanyUrl || linkedInUrls.schoolUrl)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (profileSynced === false) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground opacity-50" />
        <div>
          <p className="text-sm font-medium">LinkedIn profile not synced</p>
          <p className="text-xs text-muted-foreground mt-1">
            Sync your LinkedIn profile to find insider connections and shared contacts at this company.
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing} size="sm">
          {syncing ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          )}
          {syncing ? 'Syncing...' : 'Sync LinkedIn Profile'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      {hasUrls && (
        <>
          <LinkedInUrls
            pastCompanyUrl={linkedInUrls!.pastCompanyUrl}
            schoolUrl={linkedInUrls!.schoolUrl}
            pastCompanyNames={[]}
            schoolNames={[]}
          />
          <Separator />
        </>
      )}

      <PeopleResults
        jobId={job.id}
        initialQuery={cachedQuery ?? autoQuery}
        initialResults={cachedResults}
        organizationLogo={job.organization_logo}
        onSearchComplete={(data) => {
          if (data.linkedInUrls) {
            setLinkedInUrls(data.linkedInUrls)
          }
        }}
      />
    </div>
  )
}
