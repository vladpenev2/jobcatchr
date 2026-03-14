'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Copy, Search, Loader2, Users, SquareArrowOutUpRight } from 'lucide-react'
import { toast } from 'sonner'

interface Person {
  name: string
  title: string
  url: string
  image: string
  location: string
  highlights: string[]
}

interface SearchCompleteData {
  results: Person[]
  linkedInUrls?: { pastCompanyUrl: string | null; schoolUrl: string | null } | null
}

interface PeopleResultsProps {
  jobId: string
  initialQuery: string
  initialResults: Person[] | null
  organizationLogo: string | null
  onSearchComplete?: (data: SearchCompleteData) => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

function cleanTitle(title: string): string {
  let cleaned = title
  if (cleaned.includes('|')) cleaned = cleaned.split('|').slice(1).join('|').trim()
  if (cleaned.includes(' - ')) cleaned = cleaned.split(' - ').slice(1).join(' - ').trim()
  return cleaned
}

function PersonRow({
  person,
  organizationLogo,
}: {
  person: Person
  organizationLogo: string | null
}) {
  const name = person.name || 'Unknown'
  const title = cleanTitle(person.title)
  const initials = getInitials(name)

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-b-0">
      {/* Avatar with company badge */}
      <div className="relative w-10 h-10 flex-shrink-0">
        <Avatar className="h-10 w-10">
          {person.image && <AvatarImage src={person.image} alt={name} />}
          <AvatarFallback className="text-sm font-semibold bg-muted text-muted-foreground">
            {initials || '?'}
          </AvatarFallback>
        </Avatar>
        {organizationLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={organizationLogo}
            alt=""
            className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded object-contain bg-background border-[1.5px] border-background shadow-sm"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
      </div>

      {/* Name and title */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate mt-px">{title}</p>
      </div>

      {/* LinkedIn link */}
      {person.url && (
        <a
          href={person.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-black dark:text-white bg-primary/30 hover:bg-primary/40 px-2.5 py-1 rounded-md transition-colors"
        >
          LinkedIn
          <SquareArrowOutUpRight className="h-3 w-3" />
        </a>
      )}
    </div>
  )
}

export function PeopleResults({
  jobId,
  initialQuery,
  initialResults,
  organizationLogo,
  onSearchComplete,
}: PeopleResultsProps) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<Person[] | null>(initialResults)
  const [loading, setLoading] = useState(false)

  async function handleSearch() {
    if (!query.trim()) {
      toast.error('Search query cannot be empty')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/find-people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Search failed. Please try again.')
        return
      }

      const people = data.results ?? []
      setResults(people)
      onSearchComplete?.({ results: people, linkedInUrls: data.linkedInUrls })
      if (people.length === 0) {
        toast.info('No people found. Try a different query.')
      } else {
        toast.success(`Found ${people.length} people`)
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleCopyAll() {
    if (!results || results.length === 0) return

    const text = results
      .map((p) => {
        const title = cleanTitle(p.title)
        return `${p.name}, ${title}, ${p.url}`
      })
      .join('\n')

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Copied to clipboard')
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard')
      })
  }

  return (
    <div className="space-y-4">
      {/* Editable search query */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Natural language search (editable before running)
        </label>
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. recruiter at Acme Corp in Dubai"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSearch()}
            disabled={loading}
          />
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Searching...' : 'Find People'}
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm font-medium">
            Finding insider connections... this may take up to 30 seconds
          </p>
        </div>
      )}

      {/* Empty state - no results yet */}
      {results === null && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Users className="h-10 w-10 opacity-30" />
          <p className="text-sm">Edit the query above and click Find People to start.</p>
        </div>
      )}

      {/* Results */}
      {results !== null && !loading && results.length > 0 && (
        <div>
          {/* Results header */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">
              People Found <span className="text-muted-foreground font-normal">({results.length})</span>
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAll}
              className="h-6 text-[11px] px-2.5 rounded-full"
            >
              <Copy className="h-3 w-3 mr-1.5" />
              Copy All
            </Button>
          </div>

          {/* Person rows */}
          <div>
            {results.map((person, i) => (
              <PersonRow
                key={`${person.url}-${i}`}
                person={person}
                organizationLogo={organizationLogo}
              />
            ))}
          </div>
        </div>
      )}

      {/* No results found */}
      {results !== null && !loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <Users className="h-10 w-10 opacity-30" />
          <p className="text-sm">No people found. Try a different search query.</p>
        </div>
      )}
    </div>
  )
}
