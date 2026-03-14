import { createClient } from '@/lib/supabase/server'
import { executeSearch } from '@/lib/adapters/search-controller'
import type { SearchCriteria, SearchProgress } from '@/lib/adapters/types'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let criteria: SearchCriteria
  try {
    criteria = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SearchProgress) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      try {
        const result = await executeSearch(criteria, user.id, send)
        send({
          stage: 'complete',
          status: 'done',
          totalNew: result.totalNew,
          totalUpdated: result.totalUpdated,
          searchId: result.searchId,
          message: `Done! ${result.totalNew} new jobs, ${result.totalUpdated} updated`,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        send({ stage: 'error', status: 'error', message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
