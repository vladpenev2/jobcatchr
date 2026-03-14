'use client'

import type { SearchProgress } from '@/lib/adapters/types'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'

interface SearchProgressProps {
  events: SearchProgress[]
  isRunning: boolean
}

export function SearchProgressDisplay({ events, isRunning }: SearchProgressProps) {
  if (events.length === 0 && !isRunning) return null

  const completeEvent = events.find((e) => e.stage === 'complete' && e.status === 'done')
  const errorEvent = events.find((e) => e.status === 'error')

  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-4 space-y-2">
      <p className="text-sm font-medium text-card-foreground">Search Progress</p>

      <div className="space-y-1">
        {events
          .filter((e) => e.stage !== 'complete' && e.stage !== 'error')
          .map((event, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {event.status === 'running' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              ) : event.status === 'done' ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-destructive" />
              )}
              <span className={event.status === 'error' ? 'text-destructive' : 'text-muted-foreground'}>
                {event.message ?? event.stage}
                {event.count != null && event.status === 'done' && (
                  <span className="ml-1 font-medium text-foreground">({event.count})</span>
                )}
              </span>
            </div>
          ))}
      </div>

      {isRunning && !completeEvent && !errorEvent && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Processing results...</span>
        </div>
      )}

      {completeEvent && (
        <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          <span>{completeEvent.message}</span>
        </div>
      )}

      {errorEvent && (
        <div className="flex items-center gap-2 text-sm font-medium text-destructive">
          <XCircle className="h-4 w-4" />
          <span>Error: {errorEvent.message}</span>
        </div>
      )}
    </div>
  )
}
