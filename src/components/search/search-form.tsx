'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { SearchProgressDisplay } from './search-progress'
import { ChevronsUpDown, Check, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SearchProgress } from '@/lib/adapters/types'

// Country list - using static list for predictable SSR
const COUNTRIES = [
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Oman',
  'Egypt',
  'Jordan',
  'Lebanon',
  'United Kingdom',
  'United States',
  'Germany',
  'France',
  'Netherlands',
  'Switzerland',
  'Singapore',
  'Australia',
  'Canada',
  'India',
  'Pakistan',
]

type TimeRange = '1h' | '24h' | '7d' | '6m'

interface SearchFormProps {
  onSearchComplete?: (searchId: string) => void
}

export function SearchForm({ onSearchComplete }: SearchFormProps) {
  const [titleSearch, setTitleSearch] = useState('')
  const [titleExclusion, setTitleExclusion] = useState('')
  const [keywords, setKeywords] = useState('')
  const [location, setLocation] = useState('')
  const [locationOpen, setLocationOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')
  const [isRunning, setIsRunning] = useState(false)
  const [progressEvents, setProgressEvents] = useState<SearchProgress[]>([])

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

      const criteria = {
        titleSearch: parseList(titleSearch),
        titleExclusion: parseList(titleExclusion),
        keywords: parseList(keywords),
        locationSearch: location ? [location] : [],
        timeRange,
        sourcesEnabled: ['career-site', 'linkedin'],
      }

      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(criteria),
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
        const message = error instanceof Error ? error.message : 'Search failed'
        setProgressEvents((prev) => [...prev, { stage: 'error', status: 'error', message }])
      } finally {
        setIsRunning(false)
      }
    },
    [isRunning, titleSearch, titleExclusion, keywords, location, timeRange, onSearchComplete]
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
            <Label>Location</Label>
            <Popover open={locationOpen} onOpenChange={setLocationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={locationOpen}
                  className="w-full justify-between font-normal"
                >
                  {location || 'Select country...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value=""
                        onSelect={() => {
                          setLocation('')
                          setLocationOpen(false)
                        }}
                      >
                        <Check className={cn('mr-2 h-4 w-4', location === '' ? 'opacity-100' : 'opacity-0')} />
                        Any location
                      </CommandItem>
                      {COUNTRIES.map((country) => (
                        <CommandItem
                          key={country}
                          value={country}
                          onSelect={(value) => {
                            setLocation(value)
                            setLocationOpen(false)
                          }}
                        >
                          <Check
                            className={cn('mr-2 h-4 w-4', location === country ? 'opacity-100' : 'opacity-0')}
                          />
                          {country}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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

        <Button type="submit" disabled={isRunning} className="w-full sm:w-auto">
          <Search className="mr-2 h-4 w-4" />
          {isRunning ? 'Searching...' : 'Start Search'}
        </Button>
      </form>

      <SearchProgressDisplay events={progressEvents} isRunning={isRunning} />
    </div>
  )
}
