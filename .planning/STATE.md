# STATE

## Current Phase
1

## Status
in_progress

## Decisions
- Using Career Site Feed ($0.80/1K) not Career Site API ($4/1K)
- Skipping Expired Jobs API ($20/month) - overkill for this scale
- Job expiration: LinkedIn uses date_validthrough, career site uses saved search re-runs
- Side drawer for job detail, full page for Find People
- Location data via country-state-city npm package (client-side)
- SSE for search progress streaming
- Adapter pattern for extensible job sources

## Blockers
(none)
