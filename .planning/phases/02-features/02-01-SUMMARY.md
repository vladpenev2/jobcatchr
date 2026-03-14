---
phase: 2
plan: 01
title: "Search System - adapters, API, form, SSE, cron"
status: complete
---

# Plan 01: Search System - Summary

## What Was Built

### Task 1: Adapter Types and Base Interface
- `src/lib/adapters/types.ts` - `UnifiedJob`, `SearchCriteria`, `SearchProgress`, `AdapterResult` interfaces
- `src/lib/adapters/base-adapter.ts` - Abstract `BaseAdapter` class with `search()` and `normalize()` methods

### Task 2: Career Site Feed Adapter
- `src/lib/adapters/career-site-feed.ts`
- Actor: `fantastic-jobs/career-site-job-listing-feed`
- Maps SearchCriteria to actor input, normalizes output including AI fields and LinkedIn org data

### Task 3: LinkedIn Search Adapter
- `src/lib/adapters/linkedin-search.ts`
- Actor: `fantastic-jobs/advanced-linkedin-job-search-api`
- Extracts LinkedIn slug from org URL, maps LinkedIn-specific fields (seniority, recruiter, directapply)

### Task 4: Search Controller
- `src/lib/adapters/search-controller.ts`
- Creates search record, fans out to enabled adapters in parallel (Promise.allSettled)
- Deduplicates by job `id`, upserts to `jobs` table in batches of 100
- Links jobs to search via `search_jobs` junction table
- Streams progress via `onProgress` callback

### Task 5: SSE Search Endpoint
- `src/app/api/search/route.ts` (POST)
- Returns `text/event-stream` response
- Auth check via Supabase session, streams SearchProgress events to client

### Task 6: Search Form UI
- `src/components/search/search-form.tsx` - Client Component with:
  - Job titles (comma-separated), exclude titles, keywords inputs
  - Location combobox (Popover + Command) with 20 pre-populated countries
  - Time range toggle group (1h / 24h / 7d / 6m), default 7d
  - SSE-based search execution with live progress
- `src/components/search/search-progress.tsx` - Real-time progress display with per-source status indicators
- `src/app/(app)/page.tsx` updated to render SearchForm + SearchHistory
- shadcn components installed: `command`, `popover`, `toggle-group`, `toggle`

### Task 7: Search History and Saved Searches
- `src/app/api/searches/route.ts` (GET) - List user's searches ordered by date
- `src/app/api/searches/[id]/refresh/route.ts` (POST + PATCH)
  - POST: re-run a search with stored criteria
  - PATCH: update `is_scheduled` and `schedule_interval`
- `src/components/search/search-history.tsx` - Client Component with re-run button and daily/weekly schedule toggle

### Task 8: Cron Endpoints
- `src/app/api/cron/expire-jobs/route.ts` (POST)
  - Expires LinkedIn jobs where `date_validthrough < now`
  - Flags career-site jobs not updated in 30+ days as `likely_expired`
- `src/app/api/cron/refresh-searches/route.ts` (POST)
  - Fetches scheduled searches, checks if due (daily/weekly interval vs last_run_at)
  - Re-runs due searches, tracks `consecutive_runs_missing` on failure
  - Both secured via `CRON_SECRET` env var

## Test Results
- `src/__tests__/adapters.test.ts` - 5 tests passing
- `src/__tests__/search-controller.test.ts` - 2 tests passing
- All 24 tests across 7 test files passing

## Build
`npx next build` passes - all 13 routes registered including 4 new API routes and 2 cron routes.

## Key Decisions
- Used `Promise.allSettled` for adapter fan-out so one adapter failing doesn't break the other
- Upsert batched at 100 jobs to avoid Supabase row limits
- Location combobox uses static country list (not `country-state-city` at runtime) to avoid SSR issues and keep the bundle small
- `CRON_SECRET` env var for cron auth; if unset, allows all requests (dev-friendly)
- Admin client (service role) used for all writes; server client for auth reads only
