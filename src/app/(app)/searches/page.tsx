'use client'

import { SearchHistory } from '@/components/search/search-history'

export default function SearchesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View past searches, re-run them, or set up schedules.
        </p>
      </div>

      <SearchHistory />
    </div>
  )
}
