'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { SearchProgressDisplay } from './search-progress'
import { Search, Square } from 'lucide-react'
import type { SearchProgress } from '@/lib/adapters/types'

const QUICK_LOCATIONS = [
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Dubai',
  'Abu Dhabi',
  'Remote',
]

type TimeRange = '1h' | '24h' | '7d' | '6m'

interface SearchFormProps {
  onSearchComplete?: (searchId: string) => void
}

export function SearchForm({ onSearchComplete }: SearchFormProps) {
  const [titleSearch, setTitleSearch] = useState('')
  const [titleExclusion, setTitleExclusion] = useState('')
  const [keywords, setKeywords] = useState('')
  const [locations, setLocations] = useState('')
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')
  const [isRunning, setIsRunning] = useState(false)
  const [progressEvents, setProgressEvents] = useState<SearchProgress[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  const addQuickLocation = (loc: string) => {
    const current = parseList(locations)
    if (current.includes(loc)) return
    setLocations(current.length > 0 ? `${locations}, ${loc}` : loc)
  }

  const parseList = (value: string): string[] =>
    value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (isRunning) return

      setIsRunning(true)
      setProgressEvents([])

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      const criteria = {
        titleSearch: parseList(titleSearch),
        titleExclusion: parseList(titleExclusion),
        keywords: parseList(keywords),
        locationSearch: parseList(locations),
        timeRange,
        sourcesEnabled: ['career-site', 'linkedin'],
      }

      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(criteria),
          signal: abortController.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error(`Search failed: ${response.statusText}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value, { stream: true })
          const lines = text.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event: SearchProgress = JSON.parse(line.slice(6))
                setProgressEvents((prev) => [...prev, event])

                if (event.stage === 'complete' && event.searchId) {
                  onSearchComplete?.(event.searchId)
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        }
      } catch (error) {
        if (abortController.signal.aborted) {
          setProgressEvents((prev) => [...prev, { stage: 'cancelled', status: 'error', message: 'Search cancelled' }])
        } else {
          const message = error instanceof Error ? error.message : 'Search failed'
          setProgressEvents((prev) => [...prev, { stage: 'error', status: 'error', message }])
        }
      } finally {
        abortControllerRef.current = null
        setIsRunning(false)
      }
    },
    [isRunning, titleSearch, titleExclusion, keywords, locations, timeRange, onSearchComplete]
  )

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Job titles */}
          <div className="space-y-1.5">
            <Label htmlFor="title-search">Job Titles</Label>
            <Input
              id="title-search"
              placeholder="e.g. Product Manager, UX Designer"
              value={titleSearch}
              onChange={(e) => setTitleSearch(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Comma-separated</p>
          </div>

          {/* Exclude titles */}
          <div className="space-y-1.5">
            <Label htmlFor="title-exclusion">Exclude Titles</Label>
            <Input
              id="title-exclusion"
              placeholder="e.g. Senior, Lead, Director"
              value={titleExclusion}
              onChange={(e) => setTitleExclusion(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Comma-separated</p>
          </div>

          {/* Keywords */}
          <div className="space-y-1.5">
            <Label htmlFor="keywords">Keywords</Label>
            <Input
              id="keywords"
              placeholder="e.g. React, Python, remote"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Comma-separated, searches in description</p>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="locations">Location</Label>
            <Input
              id="locations"
              placeholder="e.g. Dubai, Bulgaria, London"
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
            />
            <div className="flex flex-wrap gap-1">
              {QUICK_LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => addQuickLocation(loc)}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                >
                  + {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Time range */}
        <div className="space-y-1.5">
          <Label>Time Range</Label>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => {
              if (value) setTimeRange(value as TimeRange)
            }}
            variant="outline"
          >
            <ToggleGroupItem value="1h">1h</ToggleGroupItem>
            <ToggleGroupItem value="24h">24h</ToggleGroupItem>
            <ToggleGroupItem value="7d">7d</ToggleGroupItem>
            <ToggleGroupItem value="6m">6m</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isRunning} className="w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" />
            {isRunning ? 'Searching...' : 'Start Search'}
          </Button>
          {isRunning && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => abortControllerRef.current?.abort()}
              className="w-full sm:w-auto"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
          )}
        </div>
      </form>

      <SearchProgressDisplay events={progressEvents} isRunning={isRunning} />
    </div>
  )
}
