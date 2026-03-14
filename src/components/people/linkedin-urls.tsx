'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface LinkedInUrlsProps {
  pastCompanyUrl: string | null
  schoolUrl: string | null
  pastCompanyNames: string[]
  schoolNames: string[]
}

function LinkBlock({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 border border-primary/15 text-foreground text-sm font-medium no-underline transition-all hover:bg-primary/10 hover:translate-x-0.5 mb-2 last:mb-0"
    >
      <ArrowRight className="h-4 w-4 opacity-60 flex-shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      <ExternalLink className="h-3.5 w-3.5 opacity-60 flex-shrink-0" />
    </a>
  )
}

export function LinkedInUrls({
  pastCompanyUrl,
  schoolUrl,
  pastCompanyNames,
  schoolNames,
}: LinkedInUrlsProps) {
  if (!pastCompanyUrl && !schoolUrl) {
    return null
  }

  function handleCopyUrls() {
    const urls: string[] = []
    if (pastCompanyUrl) urls.push(pastCompanyUrl)
    if (schoolUrl) urls.push(schoolUrl)

    navigator.clipboard
      .writeText(urls.join('\n'))
      .then(() => {
        toast.success('URLs copied to clipboard')
      })
      .catch(() => {
        toast.error('Failed to copy URLs')
      })
  }

  const pastLabel = pastCompanyNames.length > 0
    ? `People at this company who also worked at ${pastCompanyNames.slice(0, 3).join(', ')}`
    : 'People at this company who worked at your past companies'

  const schoolLabel = schoolNames.length > 0
    ? `People at this company who studied at ${schoolNames.join(', ')}`
    : 'People at this company who went to your schools'

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Shared Connections</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyUrls}
          className="h-6 text-[11px] px-2.5 rounded-full"
        >
          <Copy className="h-3 w-3 mr-1.5" />
          Copy URLs
        </Button>
      </div>

      {pastCompanyUrl && <LinkBlock label={pastLabel} url={pastCompanyUrl} />}
      {schoolUrl && <LinkBlock label={schoolLabel} url={schoolUrl} />}
    </div>
  )
}
