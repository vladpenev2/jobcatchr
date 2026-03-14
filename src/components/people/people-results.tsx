'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ExternalLink, Copy, Search, Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'

interface Person {
  name: string
  title: string
  url: string
  image: string
  location: string
  highlights: string[]
}

interface PeopleResultsProps {
  jobId: string
  initialQuery: string
  initialResults: Person[] | null
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

function PersonCard({ person }: { person: Person }) {
  return (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            {person.image && <AvatarImage src={person.image} alt={person.name} />}
            <AvatarFallback className="text-sm font-medium">
              {person.name ? getInitials(person.name) : '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{person.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground truncate">{person.title}</p>
                {person.location && (
                  <p className="text-xs text-muted-foreground mt-0.5">{person.location}</p>
                )}
              </div>
              {person.url && (
                <a
                  href={person.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5"
                  title="View LinkedIn profile"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            {person.highlights && person.highlights.length > 0 && (
              <div className="mt-2 space-y-1">
                {person.highlights.map((highlight, i) => (
                  <p key={i} className="text-xs text-muted-foreground italic leading-relaxed">
                    &ldquo;{highlight}&rdquo;
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PeopleResults({ jobId, initialQuery, initialResults }: PeopleResultsProps) {
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

      setResults(data.results ?? [])
      if (data.results?.length === 0) {
        toast.info('No people found. Try a different query.')
      } else {
        toast.success(`Found ${data.results.length} people`)
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleCopyAll() {
    if (!results || results.length === 0) return

    const csv = [
      'Name,Title,LinkedIn URL',
      ...results.map(
        (p) =>
          `"${(p.name ?? '').replace(/"/g, '""')}","${(p.title ?? '').replace(/"/g, '""')}","${p.url ?? ''}"`
      ),
    ].join('\n')

    navigator.clipboard.writeText(csv).then(() => {
      toast.success('Copied to clipboard as CSV')
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
  }

  return (
    <div className="space-y-4">
      {/* Search query input */}
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

      {/* Results */}
      {results === null && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Users className="h-10 w-10 opacity-30" />
          <p className="text-sm">Edit the query above and click Find People to start.</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Loader2 className="h-8 w-8 animate-spin opacity-50" />
          <p className="text-sm">Searching for people via Exa.ai... this takes about 30 seconds.</p>
        </div>
      )}

      {results !== null && !loading && results.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? 'person' : 'people'} found
            </p>
            <Button variant="outline" size="sm" onClick={handleCopyAll}>
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy All (CSV)
            </Button>
          </div>

          <div className="grid gap-3">
            {results.map((person, i) => (
              <PersonCard key={`${person.url}-${i}`} person={person} />
            ))}
          </div>
        </>
      )}

      {results !== null && !loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <Users className="h-10 w-10 opacity-30" />
          <p className="text-sm">No people found. Try a different search query.</p>
        </div>
      )}
    </div>
  )
}
