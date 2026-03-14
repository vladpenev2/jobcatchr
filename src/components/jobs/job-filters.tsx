'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import { useCallback, useTransition } from 'react'

export interface FilterState {
  search: string
  status: string
  source: string
  sort: string
  order: string
}

interface JobFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export function JobFilters({ filters, onFiltersChange }: JobFiltersProps) {
  const [, startTransition] = useTransition()

  const update = useCallback(
    (key: keyof FilterState, value: string) => {
      startTransition(() => {
        onFiltersChange({ ...filters, [key]: value })
      })
    },
    [filters, onFiltersChange]
  )

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={filters.status || 'all'} onValueChange={(v) => update('status', v === 'all' ? '' : v)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="likely_expired">Likely Expired</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.source || 'all'} onValueChange={(v) => update('source', v === 'all' ? '' : v)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="linkedin">LinkedIn</SelectItem>
          <SelectItem value="career-site">Career Site</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={`${filters.sort}-${filters.order}`}
        onValueChange={(v) => {
          const [sort, order] = v.split('-')
          onFiltersChange({ ...filters, sort, order })
        }}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="posted-desc">Newest First</SelectItem>
          <SelectItem value="posted-asc">Oldest First</SelectItem>
          <SelectItem value="title-asc">Title A-Z</SelectItem>
          <SelectItem value="title-desc">Title Z-A</SelectItem>
          <SelectItem value="company-asc">Company A-Z</SelectItem>
          <SelectItem value="company-desc">Company Z-A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
