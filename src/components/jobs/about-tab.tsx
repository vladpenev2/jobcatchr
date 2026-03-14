'use client'

import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Job } from './job-table'

interface AboutTabProps {
  job: Job
}

export function AboutTab({ job }: AboutTabProps) {
  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-6 pb-6">
        {/* AI-extracted fields */}
        {(job.ai_key_skills?.length || job.ai_experience_level || job.ai_work_arrangement) && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Quick Facts
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.ai_experience_level && (
                <Badge variant="secondary">{job.ai_experience_level} yrs exp</Badge>
              )}
              {job.ai_work_arrangement && (
                <Badge variant="secondary">{job.ai_work_arrangement}</Badge>
              )}
              {(job.ai_employment_type ?? job.employment_type)?.map((et) => (
                <Badge key={et} variant="outline" className="capitalize">
                  {et.replace(/_/g, ' ').toLowerCase()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Salary */}
        {(job.ai_salary_min || job.ai_salary_max) && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Salary
            </h3>
            <p className="text-sm">
              {job.ai_salary_currency ?? 'USD'}{' '}
              {job.ai_salary_min && job.ai_salary_max
                ? `${job.ai_salary_min.toLocaleString()} – ${job.ai_salary_max.toLocaleString()}`
                : job.ai_salary_min?.toLocaleString() ?? job.ai_salary_max?.toLocaleString()}
              {job.ai_salary_unit && ` / ${job.ai_salary_unit.toLowerCase()}`}
            </p>
          </div>
        )}

        {/* Key Skills */}
        {job.ai_key_skills && job.ai_key_skills.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Key Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.ai_key_skills.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Responsibilities */}
        {job.ai_core_responsibilities && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Responsibilities
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {job.ai_core_responsibilities}
            </p>
          </div>
        )}

        {/* Requirements */}
        {job.ai_requirements_summary && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Requirements
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {job.ai_requirements_summary}
            </p>
          </div>
        )}

        {/* Full description */}
        {(job.description_html || job.description_text) && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Full Description
            </h3>
            {job.description_html ? (
              <div
                className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: job.description_html }}
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {job.description_text}
              </p>
            )}
          </div>
        )}

        {!job.description_html &&
          !job.description_text &&
          !job.ai_core_responsibilities &&
          !job.ai_requirements_summary && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No description available
            </p>
          )}
      </div>
    </ScrollArea>
  )
}
