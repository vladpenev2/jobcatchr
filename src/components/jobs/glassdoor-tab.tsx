'use client'

import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, ThumbsUp, ThumbsDown, Lightbulb, Search } from 'lucide-react'
import { GlassdoorReview } from '@/lib/apify/glassdoor'
import { formatDate, formatDateTime } from '@/lib/utils'

interface GlassdoorTabProps {
  jobId: string
  companyName: string | null
}

interface GlassdoorData {
  reviews: GlassdoorReview[]
  rating_overall: number | null
  review_count: number
  employer_logo_url: string | null
  cached: boolean
  stale?: boolean
  fetched_at: string
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < Math.round(value) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: GlassdoorReview }) {
  const date = review.review_date_time
    ? formatDate(review.review_date_time)
    : null

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight">{review.summary || 'Review'}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {review.rating_overall && <StarRating value={review.rating_overall} />}
            <span className="text-xs text-muted-foreground">{review.job_title}</span>
            {review.location && (
              <span className="text-xs text-muted-foreground">&middot; {review.location}</span>
            )}
          </div>
        </div>
        {date && <span className="text-xs text-muted-foreground shrink-0">{date}</span>}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {review.is_current_job !== undefined && (
          <Badge variant="outline" className="text-xs h-5">
            {review.is_current_job ? 'Current' : 'Former'} Employee
          </Badge>
        )}
        {review.length_of_employment !== null && review.length_of_employment !== undefined && (
          <Badge variant="outline" className="text-xs h-5">
            {review.length_of_employment}{' '}
            {review.length_of_employment === 1 ? 'year' : 'years'}
          </Badge>
        )}
      </div>

      {review.pros && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <ThumbsUp className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">Pros</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pl-5">{review.pros}</p>
        </div>
      )}

      {review.cons && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <ThumbsDown className="h-3.5 w-3.5 text-red-500 shrink-0" />
            <span className="text-xs font-medium text-red-700 dark:text-red-400">Cons</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pl-5">{review.cons}</p>
        </div>
      )}

      {review.advice && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Advice</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pl-5">{review.advice}</p>
        </div>
      )}
    </div>
  )
}

export function GlassdoorTab({ jobId, companyName }: GlassdoorTabProps) {
  const [data, setData] = useState<GlassdoorData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function fetchReviews() {
    setLoading(true)
    setError(null)

    fetch(`/api/jobs/${jobId}/glassdoor`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? 'Failed to load reviews')
        }
        return res.json()
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  if (!companyName) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        No company name to look up
      </div>
    )
  }

  if (!data && !loading && !error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
        <p className="text-sm">Look up Glassdoor reviews for {companyName}</p>
        <p className="text-xs">This uses API credits</p>
        <Button size="sm" onClick={fetchReviews}>
          <Search className="h-3.5 w-3.5 mr-1.5" />
          Fetch Reviews
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm">Fetching Glassdoor reviews for {companyName}&hellip;</p>
        <p className="text-xs">This may take a moment</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
        <p className="text-sm font-medium text-destructive">Failed to load reviews</p>
        <p className="text-xs">{error}</p>
        <Button size="sm" variant="outline" onClick={fetchReviews} className="mt-2">
          Retry
        </Button>
      </div>
    )
  }

  if (!data || data.reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
        <p className="text-sm">No reviews found for {companyName}</p>
        {data && (
          <p className="text-xs">
            Last checked: {formatDateTime(data.fetched_at)}
          </p>
        )}
      </div>
    )
  }

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-4 pb-6">
        {/* Overall rating summary */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
          {data.rating_overall !== null && (
            <div className="text-center">
              <p className="text-3xl font-bold">{data.rating_overall.toFixed(1)}</p>
              <StarRating value={data.rating_overall} />
              <p className="text-xs text-muted-foreground mt-1">Overall</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium">{companyName}</p>
            <p className="text-xs text-muted-foreground">
              Based on {data.review_count} review{data.review_count !== 1 ? 's' : ''}
            </p>
            {data.stale && (
              <Badge variant="outline" className="text-xs mt-1">
                Cached data
              </Badge>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-3">
          {data.reviews.map((review, i) => (
            <ReviewCard key={review.review_id ?? i} review={review} />
          ))}
        </div>

        {/* Attribution */}
        <p className="text-xs text-center text-muted-foreground pt-2">
          Reviews sourced from Glassdoor
          {data.fetched_at && ` · ${formatDateTime(data.fetched_at)}`}
        </p>
      </div>
    </ScrollArea>
  )
}
