---
phase: 2
plan: 03
title: "Find People - Insider Connections"
status: complete
---

# Summary: Plan 03 - Find People

## What was built

All 4 tasks completed. Full insider connections feature at `/jobs/[id]/find-people`.

## Tasks

### 02-03-01: Company resolution helper
- `src/lib/apify/company.ts` - `resolveCompanyId` and `resolveCompanyByName`
- 30-day TTL cache check against `company_cache` table before calling Apify
- Uses `dev_fusion/linkedin-company-scraper` actor
- Admin client for cache writes
- 5 tests passing in `src/__tests__/company.test.ts`

### 02-03-02: People search helper
- `src/lib/apify/people.ts` - `searchPeople` and `buildLinkedInUrls`
- `searchPeople` calls `fantastic-jobs/exa-ai-people-search` with EXA_API_KEY
- `buildLinkedInUrls` generates LinkedIn people search URLs with currentCompany + pastCompany/schoolFilter
- 8 tests passing in `src/__tests__/people.test.ts`

### 02-03-03: Find People API route
- `src/app/api/jobs/[id]/find-people/route.ts`
- GET: returns cached results from `people_searches` table
- POST: full flow - auto-generates query, resolves company IDs in parallel, runs Exa.ai search, builds LinkedIn URLs, caches results
- Auto-query format: `[job title] or hiring manager or recruiter at [company] in [user location]`
- Accepts optional custom query override in request body
- Also created `src/components/jobs/job-detail-drawer.tsx` stub to fix pre-existing build error

### 02-03-04: Find People page and components
- `src/app/(app)/jobs/[id]/find-people/page.tsx` - Server component, fetches job + profile, passes cached results to client
- `src/components/people/people-results.tsx` - Editable query input, Find People button, loading state, person cards (avatar/initials, name, title, LinkedIn link, highlights), result count, Copy All CSV button
- `src/components/people/linkedin-urls.tsx` - LinkedIn search URLs for past companies and schools, copy + open buttons

## Verification

- `npx next build` passes - `/jobs/[id]/find-people` route shows in build output
- `npx vitest run` - 52 tests pass (13 new for this plan + 39 pre-existing)
- 3 failures in a different agent's worktree (`.claude/worktrees/agent-a962505c/`) are pre-existing and unrelated

## Must-haves checklist

- [x] Find People page at /jobs/[id]/find-people
- [x] Auto-generated search query from job + user profile
- [x] Editable query before search
- [x] People results as cards with avatar, name, title, LinkedIn link
- [x] LinkedIn search URLs for shared connections (past companies, schools)
- [x] Copy all results (CSV export)
- [x] Results cached in people_searches table
- [x] Company resolution via company_cache
- [x] Build passes
