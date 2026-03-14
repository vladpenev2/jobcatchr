'use client'

import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ExternalLink,
  Star,
  Trash2,
  MapPin,
  Calendar,
  Briefcase,
  Globe,
  Building2,
  Linkedin,
} from 'lucide-react'
import Image from 'next/image'
import { Job } from './job-table'
import { AboutTab } from './about-tab'
import { CompanyTab } from './company-tab'
import { GlassdoorTab } from './glassdoor-tab'
import { PeopleTab } from './people-tab'
import { formatDate, formatDistanceToNow } from '@/lib/utils'
import { getSourceDisplayName, getSourceFaviconUrl } from '@/lib/source-meta'

interface JobDetailDrawerProps {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaveToggle: (jobId: string, currentlySaved: boolean) => Promise<void>
  onJobUpdate: (job: Job) => void
  onJobDelete: (jobId: string) => void
}

function CompanyLogoLarge({ src, name }: { src: string | null; name: string | null }) {
  const [imgError, setImgError] = useState(false)

  if (!src || imgError) {
    return (
      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Briefcase className="h-6 w-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted border">
      <Image
        src={src}
        alt={name ?? 'Company'}
        width={48}
        height={48}
        className="object-contain w-full h-full p-1"
        onError={() => setImgError(true)}
        unoptimized
      />
    </div>
  )
}

const statusConfig = {
  active: {
    label: 'Active',
    variant: 'outline' as const,
    className: 'bg-green-500/15 text-green-400 border-green-500/30',
  },
  likely_expired: {
    label: 'Likely Expired',
    variant: 'outline' as const,
    className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  },
  expired: {
    label: 'Expired',
    variant: 'outline' as const,
    className: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
}

function SourceBadgeDrawer({ job }: { job: Job }) {
  const label = getSourceDisplayName(job.source_name, job.source)
  const favicon = getSourceFaviconUrl(job.source_name, job.source)
  const [imgErr, setImgErr] = useState(false)

  return (
    <Badge variant="outline" className="text-xs h-5 gap-1.5">
      {favicon && !imgErr ? (
        <img src={favicon} alt="" className="h-3.5 w-3.5 rounded-sm" onError={() => setImgErr(true)} />
      ) : job.source === 'linkedin' ? (
        <Linkedin className="h-3 w-3" />
      ) : null}
      {label}
    </Badge>
  )
}

export function JobDetailDrawer({
  job,
  open,
  onOpenChange,
  onSaveToggle,
  onJobDelete,
}: JobDetailDrawerProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('about')

  // Mark as seen when drawer opens
  useEffect(() => {
    if (open && job.id) {
      fetch(`/api/jobs/${job.id}/view`, { method: 'POST' }).catch(console.error)
    }
  }, [open, job.id])

  // Reset tab when job changes
  useEffect(() => {
    setActiveTab('about')
  }, [job.id])

  async function handleSave() {
    setSaving(true)
    try {
      await onSaveToggle(job.id, job.saved)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' })
      if (res.ok) {
        onJobDelete(job.id)
        setDeleteDialogOpen(false)
      }
    } finally {
      setDeleting(false)
    }
  }

  const statusInfo = statusConfig[job.status]

  const location = [
    ...(job.cities_derived ?? []).slice(0, 1),
    ...(job.countries_derived ?? []).slice(0, 1),
  ]
    .filter(Boolean)
    .join(', ')

  const applyUrl = job.external_apply_url ?? job.url

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          className="w-full sm:w-[40vw] sm:min-w-[500px] sm:max-w-2xl flex flex-col p-0 overflow-hidden"
          side="right"
        >
          {/* Header */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b space-y-0">
            <div className="flex items-start gap-3">
              <CompanyLogoLarge src={job.organization_logo} name={job.organization} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground truncate">
                  {job.organization ?? 'Unknown Company'}
                </p>
                <SheetTitle className="text-base leading-tight">{job.title}</SheetTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {job.date_posted && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(job.date_posted)}
                    </span>
                  )}
                  <Badge
                    variant={statusInfo.variant}
                    className={`text-xs h-5 ${statusInfo.className}`}
                  >
                    {statusInfo.label}
                  </Badge>
                  <SourceBadgeDrawer job={job} />
                </div>
              </div>
            </div>

            {/* Quick info */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t">
              {location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {job.remote_derived
                    ? `Remote${location ? ` (${location})` : ''}`
                    : location}
                </div>
              )}
              {job.ai_work_arrangement && !job.remote_derived && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  {job.ai_work_arrangement}
                </div>
              )}
              {job.ai_experience_level && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Briefcase className="h-3 w-3" />
                  {job.ai_experience_level} yrs exp
                </div>
              )}
              {job.source_domain && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  {job.source_domain}
                </div>
              )}
              {job.date_posted && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(job.date_posted)}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <Button size="sm" asChild>
                <a href={applyUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  View Job
                </a>
              </Button>
              <Button
                size="sm"
                variant={job.saved ? 'default' : 'outline'}
                onClick={handleSave}
                disabled={saving}
                className={
                  job.saved
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500'
                    : ''
                }
              >
                <Star className={`h-3.5 w-3.5 mr-1.5 ${job.saved ? 'fill-white' : ''}`} />
                {job.saved ? 'Saved' : 'Save'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            </div>
          </SheetHeader>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList variant="line" className="mx-6 mt-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="glassdoor">Glassdoor</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-6 pt-4">
              <TabsContent value="about">
                <AboutTab job={job} />
              </TabsContent>
              <TabsContent value="company">
                <CompanyTab job={job} />
              </TabsContent>
              <TabsContent value="people">
                <PeopleTab job={job} />
              </TabsContent>
              <TabsContent value="glassdoor">
                <GlassdoorTab
                  jobId={job.id}
                  companyName={job.organization}
                />
              </TabsContent>
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete job?</DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{job.title}&rdquo; from the database. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
