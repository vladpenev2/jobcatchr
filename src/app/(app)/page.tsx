import { SearchForm } from '@/components/search/search-form'
import { SearchHistory } from '@/components/search/search-history'
import { JobsPage } from '@/components/jobs/jobs-page'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Search Jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search across LinkedIn and 175K+ career sites.
          </p>
        </div>

        <SearchForm />

        <div>
          <h2 className="mb-3 text-lg font-semibold">Search History</h2>
          <SearchHistory />
        </div>
      </div>

      <JobsPage />
    </div>
  )
}
