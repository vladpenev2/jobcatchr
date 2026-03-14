'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ExternalLink,
  Star,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Linkedin,
} from 'lucide-react'
import { formatDistanceToNow } from '@/lib/utils'
import { getSourceDisplayName, getSourceFaviconUrl } from '@/lib/source-meta'
import Image from 'next/image'
import { useState } from 'react'

export interface Job {
  id: string
  title: string
  organization: string | null
  organization_logo: string | null
  organization_url: string | null
  url: string
  locations_derived: string[] | null
  cities_derived: string[] | null
  countries_derived: string[] | null
  remote_derived: boolean | null
  date_posted: string | null
  status: 'active' | 'likely_expired' | 'expired'
  source: 'linkedin' | 'career-site'
  source_name: string | null
  source_domain: string | null
  employment_type: string[] | null
  seniority: string | null
  recruiter_name: string | null
  recruiter_title: string | null
  recruiter_url: string | null
  directapply: boolean | null
  ai_experience_level: string | null
  ai_work_arrangement: string | null
  ai_key_skills: string[] | null
  ai_employment_type: string[] | null
  ai_core_responsibilities: string | null
  ai_requirements_summary: string | null
  ai_salary_min: number | null
  ai_salary_max: number | null
  ai_salary_currency: string | null
  ai_salary_unit: string | null
  linkedin_org_employees: number | null
  linkedin_org_industry: string | null
  linkedin_org_size: string | null
  linkedin_org_headquarters: string | null
  linkedin_org_description: string | null
  description_text: string | null
  description_html: string | null
  organization_linkedin_slug: string | null
  external_apply_url: string | null
  seen: boolean
  saved: boolean
}

interface JobTableProps {
  jobs: Job[]
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  onJobClick: (job: Job) => void
  onSaveToggle: (jobId: string, currentlySaved: boolean) => Promise<void>
  loading?: boolean
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-500' },
  likely_expired: { label: 'Likely Expired', color: 'bg-yellow-500' },
  expired: { label: 'Expired', color: 'bg-red-500' },
}

function SourceBadge({ job }: { job: Job }) {
  const label = getSourceDisplayName(job.source_name, job.source)
  const favicon = getSourceFaviconUrl(job.source_name, job.source)
  const [imgErr, setImgErr] = useState(false)

  return (
    <Badge variant="outline" className="text-xs gap-1 px-2 max-w-[140px] truncate whitespace-nowrap">
      {favicon && !imgErr ? (
        <img src={favicon} alt="" className="h-3.5 w-3.5 rounded-sm shrink-0" onError={() => setImgErr(true)} />
      ) : job.source === 'linkedin' ? (
        <Linkedin className="h-3 w-3 shrink-0" />
      ) : null}
      {label}
    </Badge>
  )
}

function CompanyLogo({ src, name }: { src: string | null; name: string | null }) {
  const [imgError, setImgError] = useState(false)

  if (!src || imgError) {
    return (
      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
        <Briefcase className="h-4 w-4 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0 bg-muted">
      <Image
        src={src}
        alt={name ?? 'Company'}
        width={32}
        height={32}
        className="object-contain w-full h-full"
        onError={() => setImgError(true)}
        unoptimized
      />
    </div>
  )
}

function formatLocation(job: Job): string {
  if (job.remote_derived) {
    const base = job.cities_derived?.[0] ?? job.countries_derived?.[0]
    return base ? `Remote (${base})` : 'Remote'
  }
  const parts = [job.cities_derived?.[0], job.countries_derived?.[0]].filter(Boolean)
  return parts.join(', ') || job.locations_derived?.[0] || ''
}

export function JobTable({
  jobs,
  total,
  page,
  limit,
  onPageChange,
  onJobClick,
  onSaveToggle,
  loading,
}: JobTableProps) {
  const totalPages = Math.ceil(total / limit)
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())

  async function handleSave(e: React.MouseEvent, job: Job) {
    e.stopPropagation()
    setSavingIds((prev) => new Set(prev).add(job.id))
    try {
      await onSaveToggle(job.id, job.saved)
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev)
        next.delete(job.id)
        return next
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Loading jobs...
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <Briefcase className="h-10 w-10 opacity-30" />
        <p className="text-sm">No jobs found. Run a search to get started.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="w-8 text-center">
                <CheckCheck className="h-4 w-4 mx-auto text-muted-foreground" />
              </TableHead>
              <TableHead className="w-8 text-center">Status</TableHead>
              <TableHead className="w-10 text-center">
                <Star className="h-4 w-4 mx-auto text-muted-foreground" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => {
              const statusDot = statusConfig[job.status]
              const location = formatLocation(job)

              return (
                <TableRow
                  key={job.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onJobClick(job)}
                >
                  <TableCell>
                    <div className="flex items-start gap-1.5">
                      <span className={`font-medium text-sm leading-tight ${job.seen ? 'text-muted-foreground' : ''}`}>
                        {job.title}
                      </span>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-0.5 text-muted-foreground hover:text-foreground flex-shrink-0"
                        title="Open job posting"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CompanyLogo src={job.organization_logo} name={job.organization} />
                      <span className="text-sm text-muted-foreground truncate max-w-[140px]">
                        {job.organization ?? '—'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{location || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {job.date_posted ? formatDistanceToNow(job.date_posted) : '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <SourceBadge job={job} />
                  </TableCell>
                  <TableCell className="text-center">
                    {job.seen && <CheckCheck className="h-4 w-4 mx-auto text-muted-foreground" />}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${statusDot.color}`}
                      title={statusDot.label}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={(e) => handleSave(e, job)}
                      disabled={savingIds.has(job.id)}
                      className="text-muted-foreground hover:text-yellow-500 transition-colors disabled:opacity-50"
                      title={job.saved ? 'Unsave job' : 'Save job'}
                    >
                      <Star
                        className={`h-4 w-4 ${job.saved ? 'fill-yellow-400 text-yellow-400' : ''}`}
                      />
                    </button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} jobs
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
