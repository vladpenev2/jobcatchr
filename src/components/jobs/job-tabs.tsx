'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface JobTabsProps {
  activeTab: 'all' | 'saved'
  allCount: number
  savedCount: number
  onTabChange: (tab: 'all' | 'saved') => void
}

export function JobTabs({ activeTab, allCount, savedCount, onTabChange }: JobTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as 'all' | 'saved')}>
      <TabsList>
        <TabsTrigger value="all" className="gap-2">
          All Jobs
          {allCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {allCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="saved" className="gap-2">
          Saved
          {savedCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {savedCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
