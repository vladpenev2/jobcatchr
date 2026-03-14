import type { AdapterResult, SearchCriteria, UnifiedJob } from './types'

export abstract class BaseAdapter {
  abstract name: string
  abstract source: 'career-site' | 'linkedin'
  abstract actorId: string

  abstract search(criteria: SearchCriteria): Promise<AdapterResult>
  abstract normalize(rawItem: unknown): UnifiedJob
}
