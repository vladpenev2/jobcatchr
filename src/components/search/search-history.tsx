'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Clock, Calendar, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/utils'

interface Search {
  id: string
  title_search: string[] | null
  title_exclusion: string[] | null
  keywords: string[] | null
  location_search: string[] | null
  time_range: string
  sources_enabled: string[]
  job_count: number
  last_run_at: string | null
  is_scheduled: boolean
  schedule_interval: 'daily' | 'weekly' | null
  created_at: string
}

interface SearchHistoryProps {
  onRerunComplete?: (searchId: string) => void
}

function formatCriteriaSummary(search: Search): string {
  const parts: string[] = []

  if (search.title_search?.length) {
    parts.push(search.title_search.join(', '))
  }
  if (search.location_search?.length) {
    parts.push(`in ${search.location_search.join(', ')}`)
  }
  if (search.keywords?.length) {
    parts.push(`with "${search.keywords.slice(0, 2).join(', ')}"`)
  }

  return parts.join(' ') || 'All jobs'
}

function formatLastRun(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  return formatDateTime(dateStr)
}

export function SearchHistory({ onRerunComplete }: SearchHistoryProps) {
  const [searches, setSearches] = useState<Search[]>([])
  const [loading, setLoading] = useState(true)
  const [rerunningId, setRerunningId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchSearches = useCallback(async () => {
    try {
      const res = await fetch('/api/searches')
      const data = await res.json()
      if (data.searches) setSearches(data.searches)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSearches()
  }, [fetchSearches])

  const handleRerun = async (searchId: string) => {
    setRerunningId(searchId)
    try {
      const res = await fetch(`/api/searches/${searchId}/refresh`, { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        toast.success(`Search complete: ${data.totalNew} new, ${data.totalUpdated} updated`)
        onRerunComplete?.(data.searchId)
        await fetchSearches()
      } else {
        toast.error(data.error ?? 'Failed to re-run search')
      }
    } catch {
      toast.error('Failed to re-run search')
    } finally {
      setRerunningId(null)
    }
  }

  const handleScheduleToggle = async (search: Search) => {
    setUpdatingId(search.id)
    const newScheduled = !search.is_scheduled
    const newInterval = newScheduled ? (search.schedule_interval ?? 'daily') : null

    try {
      const res = await fetch(`/api/searches/${search.id}/refresh`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_scheduled: newScheduled,
          schedule_interval: newInterval,
        }),
      })

      if (res.ok) {
        setSearches((prev) =>
          prev.map((s) =>
            s.id === search.id
              ? { ...s, is_scheduled: newScheduled, schedule_interval: newInterval }
              : s
          )
        )
        toast.success(newScheduled ? 'Search scheduled' : 'Schedule removed')
      } else {
        toast.error('Failed to update schedule')
      }
    } catch {
      toast.error('Failed to update schedule')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleIntervalChange = async (search: Search, interval: 'daily' | 'weekly') => {
    setUpdatingId(search.id)
    try {
      const res = await fetch(`/api/searches/${search.id}/refresh`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule_interval: interval }),
      })

      if (res.ok) {
        setSearches((prev) =>
          prev.map((s) => (s.id === search.id ? { ...s, schedule_interval: interval } : s))
        )
      }
    } catch {
      // silent
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (searches.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No searches yet. Run your first search above.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {searches.map((search) => (
        <div
          key={search.id}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{formatCriteriaSummary(search)}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {search.time_range}
                </span>
                <span>{search.job_count ?? 0} jobs</span>
                {search.last_run_at && (
                  <span>Last run {formatLastRun(search.last_run_at)}</span>
                )}
                {search.is_scheduled && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                    <Calendar className="mr-1 h-2.5 w-2.5" />
                    {search.schedule_interval}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRerun(search.id)}
                disabled={rerunningId === search.id}
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${rerunningId === search.id ? 'animate-spin' : ''}`}
                />
                <span className="ml-1.5">Re-run</span>
              </Button>
            </div>
          </div>

          {/* Schedule section */}
          <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
            <button
              onClick={() => handleScheduleToggle(search)}
              disabled={updatingId === search.id}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <CheckCircle2
                className={`h-3.5 w-3.5 ${search.is_scheduled ? 'text-green-500' : ''}`}
              />
              {search.is_scheduled ? 'Scheduled' : 'Save & Schedule'}
            </button>

            {search.is_scheduled && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleIntervalChange(search, 'daily')}
                  disabled={updatingId === search.id}
                  className={`rounded px-2 py-0.5 text-xs transition-colors ${
                    search.schedule_interval === 'daily'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => handleIntervalChange(search, 'weekly')}
                  disabled={updatingId === search.id}
                  className={`rounded px-2 py-0.5 text-xs transition-colors ${
                    search.schedule_interval === 'weekly'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Weekly
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
