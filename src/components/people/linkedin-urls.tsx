'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, ExternalLink, Briefcase, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'

interface LinkedInUrlsProps {
  pastCompanyUrl: string | null
  schoolUrl: string | null
}

function UrlRow({
  label,
  url,
  icon,
}: {
  label: string
  url: string
  icon: React.ReactNode
}) {
  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('URL copied to clipboard')
    }).catch(() => {
      toast.error('Failed to copy URL')
    })
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{url}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm" className="h-8 px-2" title="Open in LinkedIn">
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </a>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={handleCopy}
          title="Copy URL"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function LinkedInUrls({ pastCompanyUrl, schoolUrl }: LinkedInUrlsProps) {
  if (!pastCompanyUrl && !schoolUrl) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          LinkedIn Shared Connections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Find people who work at this company and share your background. Open these links while
          logged into LinkedIn.
        </p>

        {pastCompanyUrl && (
          <UrlRow
            label="Worked at same companies"
            url={pastCompanyUrl}
            icon={<Briefcase className="h-4 w-4" />}
          />
        )}

        {schoolUrl && (
          <UrlRow
            label="Went to same schools"
            url={schoolUrl}
            icon={<GraduationCap className="h-4 w-4" />}
          />
        )}
      </CardContent>
    </Card>
  )
}
