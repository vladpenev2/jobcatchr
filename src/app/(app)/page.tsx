'use client'

import { useState } from 'react'
import { SearchForm } from '@/components/search/search-form'
import { JobsPage } from '@/components/jobs/jobs-page'

export default function HomePage() {
  const [searchVersion, setSearchVersion] = useState(0)

  function handleSearchComplete(_searchId: string) {
    setSearchVersion((v) => v + 1)
  }

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Search Jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search across LinkedIn and 175K+ career sites.
          </p>
        </div>

        <SearchForm onSearchComplete={handleSearchComplete} />
      </div>

      <JobsPage refreshKey={searchVersion} />
    </div>
  )
}
