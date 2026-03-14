'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { ExternalLink, Users, Building2, MapPin, Briefcase } from 'lucide-react'
import { Job } from './job-table'

interface CompanyTabProps {
  job: Job
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | number | null | undefined
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  )
}

export function CompanyTab({ job }: CompanyTabProps) {
  const hasLinkedInData =
    job.linkedin_org_employees ||
    job.linkedin_org_industry ||
    job.linkedin_org_size ||
    job.linkedin_org_headquarters ||
    job.linkedin_org_description

  const linkedInProfileUrl = job.organization_linkedin_slug
    ? `https://www.linkedin.com/company/${job.organization_linkedin_slug}/`
    : null

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-6 pb-6">
        {/* Company links */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Links
          </h3>
          <div className="flex flex-col gap-2">
            {job.organization_url && (
              <a
                href={job.organization_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Company Website
              </a>
            )}
            {linkedInProfileUrl && (
              <a
                href={linkedInProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                LinkedIn Profile
              </a>
            )}
            {!job.organization_url && !linkedInProfileUrl && (
              <p className="text-sm text-muted-foreground">No links available</p>
            )}
          </div>
        </div>

        {/* LinkedIn org data */}
        {hasLinkedInData && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Company Info
            </h3>
            <div className="space-y-3">
              <InfoRow icon={Users} label="Employees" value={job.linkedin_org_employees?.toLocaleString()} />
              <InfoRow icon={Briefcase} label="Industry" value={job.linkedin_org_industry} />
              <InfoRow icon={Building2} label="Company Size" value={job.linkedin_org_size} />
              <InfoRow icon={MapPin} label="Headquarters" value={job.linkedin_org_headquarters} />
            </div>
          </div>
        )}

        {/* Company description */}
        {job.linkedin_org_description && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              About
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {job.linkedin_org_description}
            </p>
          </div>
        )}

        {!hasLinkedInData && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No company information available
          </p>
        )}
      </div>
    </ScrollArea>
  )
}
