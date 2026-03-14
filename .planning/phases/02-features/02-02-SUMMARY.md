---
phase: 2
plan: 02
title: "Job List & Detail + Glassdoor - COMPLETE"
status: done
commits:
  - fbe0e14 feat(02-02): job API routes - list, detail, view, save
  - 2e584b5 feat(02-02): job list table with tabs and filters
  - a3cbacf feat(02-02): Glassdoor reviews integration with 30-day cache
---

# Summary: Plan 02-02 - Job List & Detail + Glassdoor

## What was built

### Task 1: Job API routes
- `GET /api/jobs` - paginated job list with tab (all/saved), search, status/source filters, sort/order, enriched with seen+saved per-user state
- `GET /api/jobs/[id]` - full job detail with seen/saved state
- `DELETE /api/jobs/[id]` - admin-only job deletion
- `POST /api/jobs/[id]/view` - upsert user_job_views (seen tracking)
- `POST /api/jobs/[id]/save` - toggle user_saved_jobs (save/unsave)

### Task 2: Job list table with tabs and filters
- `src/app/(app)/page.tsx` - delegates to JobsPage client component; includes `#search-form-placeholder` div for Agent A
- `src/components/jobs/jobs-page.tsx` - orchestrates state: tab, filters, pagination, drawer
- `src/components/jobs/job-tabs.tsx` - All Jobs / Saved tabs with live count badges
- `src/components/jobs/job-filters.tsx` - text search + status/source/sort dropdowns
- `src/components/jobs/job-table.tsx` - shadcn Table with columns: title+external link, company logo+name, location, relative posted date, source badge, seen checkmark, status dot, save star toggle; pagination prev/next

### Task 3: Job detail side drawer
- `src/components/jobs/job-detail-drawer.tsx` - Sheet from right, header with logo/title/badge, quick info row, action buttons (View Job, Save, Find People, Delete), About/Company/Glassdoor tabs; marks seen on open; delete confirm dialog
- `src/components/jobs/about-tab.tsx` - quick facts badges, salary, key skills, AI responsibilities/requirements, full HTML/text description
- `src/components/jobs/company-tab.tsx` - company website + LinkedIn links, LinkedIn org data (employees, industry, size, HQ), description

### Task 4: Glassdoor reviews integration
- `src/lib/apify/glassdoor.ts` - `fetchGlassdoorReviews(companyName)` via `getdataforme/glassdoor-reviews-scraper` actor with residential proxy
- `GET /api/jobs/[id]/glassdoor` - checks glassdoor_cache (30-day TTL), fetches fresh via Apify if stale, writes cache via admin client; falls back to stale cache on error
- `src/components/jobs/glassdoor-tab.tsx` - lazy-loads on tab activation, overall rating + star display, review cards with pros (green) / cons (red) / advice (blue), employment status badges

## Shadcn components installed
sheet, tabs, scroll-area, select, checkbox

## Utility added
`formatDistanceToNow(dateString)` in `src/lib/utils.ts`

## Verification
- `npx next build` - passes (all 16 routes including 6 new job API routes)
- `npx vitest run` - 54/54 tests pass
