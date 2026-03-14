'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Job } from './job-table'

interface JobDetailDrawerProps {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaveToggle: (jobId: string, currentlySaved: boolean) => Promise<void>
  onJobUpdate: (job: Job) => void
  onJobDelete: (jobId: string) => void
}

export function JobDetailDrawer({
  job,
  open,
  onOpenChange,
}: JobDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>{job.title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 text-sm text-muted-foreground">
          Job detail drawer — coming in Phase 3.
        </div>
      </SheetContent>
    </Sheet>
  )
}
