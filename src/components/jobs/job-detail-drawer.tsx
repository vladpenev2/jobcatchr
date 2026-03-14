'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Users,
  MapPin,
  Calendar,
  Briefcase,
  Globe,
  Building2,
} from 'lucide-react'
import Image from 'next/image'
import { Job } from './job-table'
import { AboutTab } from './about-tab'
import { CompanyTab } from './company-tab'
import { GlassdoorTab } from './glassdoor-tab'
import { formatDistanceToNow } from '@/lib/utils'

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
    variant: 'default' as const,
    className: 'bg-green-500 hover:bg-green-600 border-green-500',
  },
  likely_expired: {
    label: 'Likely Expired',
    variant: 'secondary' as const,
    className: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500',
  },
  expired: {
    label: 'Expired',
    variant: 'destructive' as const,
    className: '',
  },
}

export function JobDetailDrawer({
  job,
  open,
  onOpenChange,
  onSaveToggle,
  onJobDelete,
}: JobDetailDrawerProps) {
  const router = useRouter()
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
          className="w-full sm:max-w-xl flex flex-col p-0 overflow-hidden"
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
                  {new Date(job.date_posted).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t flex-wrap">
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
                onClick={() => {
                  onOpenChange(false)
                  router.push(`/jobs/${job.id}/find-people`)
                }}
              >
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Find People
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="mx-6 mt-3 w-auto justify-start rounded-none border-b bg-transparent p-0 h-auto shrink-0">
              {['about', 'company', 'glassdoor'].map((t) => (
                <TabsTrigger
                  key={t}
                  value={t}
                  className="rounded-none border-b-2 border-transparent px-4 pb-2 pt-1 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none capitalize"
                >
                  {t === 'glassdoor' ? 'Glassdoor' : t.charAt(0).toUpperCase() + t.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-hidden px-6 pt-4">
              <TabsContent
                value="about"
                className="h-full mt-0 data-[state=active]:flex data-[state=active]:flex-col"
              >
                <AboutTab job={job} />
              </TabsContent>
              <TabsContent
                value="company"
                className="h-full mt-0 data-[state=active]:flex data-[state=active]:flex-col"
              >
                <CompanyTab job={job} />
              </TabsContent>
              <TabsContent
                value="glassdoor"
                className="h-full mt-0 data-[state=active]:flex data-[state=active]:flex-col"
              >
                <GlassdoorTab
                  jobId={job.id}
                  companyName={job.organization}
                  active={activeTab === 'glassdoor'}
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
