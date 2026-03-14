# ROADMAP — v1.0

## Wave 1: Foundation (sequential - must go first)

### Phase 1: Database & Auth Foundation
**Goal:** Supabase schema, auth config, middleware, and base layout with shadcn
**Why first:** Everything else depends on the database schema and auth
- Run schema.sql migration via Supabase MCP
- Set up Supabase client (server + browser)
- Auth middleware (protected routes, admin check)
- Base app layout: nav bar, user menu, login page
- Admin route guard
- Vitest + testing setup

---

## Wave 2: Core Features (parallel - 3 agents in worktrees)

### Phase 2: Job Source Adapters & Search API
**Goal:** Apify integration layer + search endpoint with SSE progress
**Dependencies:** Phase 1 (database + auth)
**Owns:** `src/lib/adapters/`, `src/app/api/search/`, `src/app/api/cron/`
- Base adapter interface + types
- Career Site Feed adapter (normalize Apify output -> Job schema)
- LinkedIn Search adapter (normalize Apify output -> Job schema)
- Search controller (parallel dispatch, dedup, upsert)
- SSE search endpoint with progress streaming
- Cron endpoints: expire-jobs, refresh-searches
- Vitest for all adapters and search logic

### Phase 3: Job List & Detail UI
**Goal:** Main job browsing experience with table, filters, side drawer
**Dependencies:** Phase 1 (database + auth + layout)
**Owns:** `src/app/(app)/page.tsx`, `src/components/jobs/`, `src/app/api/jobs/`
- Job list page with data table (shadcn)
- Tabs: All Jobs, Saved
- Table columns: title, company+logo, location, posted, source, seen, status, save
- Search/filter bar (text search, status filter, source filter)
- Sort by posted date, title, company
- Pagination
- Job detail side drawer (Sheet)
- Drawer tabs: About (description), Company (LinkedIn org data)
- View job, save job, delete job actions
- Mark as viewed on open
- Job API routes (GET list, GET detail, DELETE, POST view, POST save)
- Vitest for API routes

### Phase 4: Admin Panel
**Goal:** User management for admin
**Dependencies:** Phase 1 (database + auth)
**Owns:** `src/app/(app)/admin/`, `src/app/api/admin/`, `src/lib/apify/profile.ts`
- Admin page with user data table
- Create user form: name, email, LinkedIn URL, location, auto-generated password
- On create: Supabase auth user + extract LinkedIn profile via Apify
- User list: name, email, location, last login, sync status
- Edit user, re-sync LinkedIn profile
- Admin API routes
- Vitest for admin logic

---

## Wave 3: Enrichment Features (parallel - 2 agents in worktrees)

### Phase 5: Find People (Insider Connections)
**Goal:** Full-page insider connections search per job
**Dependencies:** Phase 3 (job detail for navigation), Phase 1 (profiles with extracted data)
**Owns:** `src/app/(app)/jobs/[id]/find-people/`, `src/app/api/jobs/[id]/find-people/`, `src/lib/apify/people.ts`
- Find People page at /jobs/[id]/find-people
- Auto-generate search query from job + user profile
- Editable query before search
- Exa.ai search via Apify actor
- Results as cards (avatar, name, title, LinkedIn link)
- LinkedIn search URLs (past companies, schools)
- Copy all results
- Cache results in people_searches table
- Company resolution (LinkedIn numeric IDs) via company_cache
- Vitest for people search logic

### Phase 6: Glassdoor Reviews & Settings
**Goal:** Glassdoor tab in job detail + user settings page
**Dependencies:** Phase 3 (job detail drawer for Glassdoor tab)
**Owns:** `src/app/(app)/settings/`, `src/app/api/jobs/[id]/glassdoor/`, `src/components/jobs/glassdoor-tab.tsx`
- Glassdoor Reviews tab in job detail drawer
- On-demand fetch via Apify actor, 30-day cache
- Display: overall rating, review cards (pros/cons/advice)
- Settings page: view/edit name/location, LinkedIn URL (read-only)
- Re-sync LinkedIn profile button
- Change password
- Vitest for Glassdoor and settings logic

---

## Wave 4: Integration & Polish (sequential)

### Phase 7: Search UX & Saved Searches
**Goal:** Connect search form to API, search history, scheduling
**Dependencies:** Phase 2 (search API), Phase 3 (job list)
**Owns:** `src/components/search/`, search form on main page
- Search criteria form (titles, exclusions, keywords, location combobox, time range)
- Location combobox with country-state-city package
- Connect to SSE search endpoint with real-time progress UI
- Search history display
- Save & Schedule option (daily/weekly)
- Re-run saved searches
- Vitest for search form logic

### Phase 8: Integration Testing & Deploy
**Goal:** End-to-end verification, Dockerfile, Railway deploy
**Dependencies:** All previous phases
- Integration tests across all features
- Dockerfile for Next.js on Railway
- Environment variable validation
- Error boundaries and loading states
- Final build verification
- Deploy to Railway
