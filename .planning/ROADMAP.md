# ROADMAP — v1.0

## Phase 1: Foundation (sequential)

**Goal:** Database, auth, layout, login, admin panel, Vitest - everything the parallel agents need
**Why first:** All features depend on schema, auth, and app shell

- Run schema.sql migration (fix pg_trgm ordering)
- Supabase clients (browser, server, server-admin)
- Auth proxy (proxy.ts, route protection)
- Base layout: dark theme, nav bar, user menu
- Login page
- Admin panel: user CRUD, LinkedIn profile extraction on create, re-sync
- Admin route guard
- Settings page: view/edit profile, re-sync LinkedIn, change password
- Vitest setup

---

## Phase 2: Features (3 parallel agents in worktrees)

### Agent A: Search System
**Goal:** Apify adapters + search API + search form + SSE progress + cron jobs
**Owns:** `src/lib/adapters/`, `src/app/api/search/`, `src/app/api/cron/`, `src/components/search/`
- Base adapter interface + types
- Career Site Feed adapter
- LinkedIn Search adapter
- Search controller (parallel dispatch, dedup, upsert)
- SSE search endpoint with progress streaming
- Search criteria form (titles, exclusions, keywords, location combobox, time range)
- Location combobox with country-state-city package
- Search history, save & schedule, re-run
- Cron: expire-jobs, refresh-searches

### Agent B: Job List & Detail
**Goal:** Main job browsing UI + Glassdoor reviews tab
**Owns:** `src/components/jobs/`, `src/app/api/jobs/`, main page job list
- Job list data table (All Jobs + Saved tabs)
- Table columns: title, company+logo, location, posted, source, seen, status, save
- Search/filter bar, sort, pagination
- Job detail side drawer (About tab, Company tab, Glassdoor tab)
- Glassdoor reviews: on-demand fetch via Apify, 30-day cache, rating + review cards
- Job API routes (list, detail, delete, view, save, glassdoor)
- Mark as viewed on open

### Agent C: Find People
**Goal:** Insider connections search per job
**Owns:** `src/app/(app)/jobs/[id]/find-people/`, `src/app/api/jobs/[id]/find-people/`, `src/lib/apify/people.ts`
- Find People full page at /jobs/[id]/find-people
- Auto-generate search query from job + user profile
- Editable query, run Exa.ai search via Apify
- Results as cards (avatar, name, title, LinkedIn link)
- LinkedIn search URLs (past companies, schools)
- Copy all results
- Company resolution (numeric IDs) via company_cache
- Cache results in people_searches table

---

## Phase 3: Integration & Deploy (sequential)

**Goal:** Merge worktrees, wire everything together, deploy
**Dependencies:** All Phase 2 agents complete

- Merge all worktree branches, resolve any conflicts
- Connect search form results to job list (refresh after search)
- Connect job detail "Find People" button to /jobs/[id]/find-people
- Error boundaries and loading states
- Integration tests across features
- Dockerfile for Next.js on Railway
- Final build verification
- Deploy to Railway
