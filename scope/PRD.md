# JobCatchr v2 - Product Requirements Document

## Overview

JobCatchr is a multi-tenant ATS-lite (Applicant Tracking System) that lets job seekers search for jobs across multiple sources, save them, track their status, find insider connections at target companies, and view Glassdoor reviews. It replaces the current Glide + n8n stack with a Next.js + Supabase application.

**Target users**: Job seekers (candidates), managed by an admin (the client).
**First phase**: 10-20 users. Registrations closed. Admin creates accounts.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| UI | shadcn/ui + Tailwind CSS |
| Database | Supabase (Postgres + Auth + RLS) |
| Job Sources | Apify actors (Career Site Feed, LinkedIn Job Search) |
| People Search | Exa.ai (via Apify actor) |
| Profile Extraction | Apify (LinkedIn Profile Enrichment) |
| Glassdoor | Apify (Glassdoor Reviews Scraper) |
| Location Data | `country-state-city` npm package (250 countries, 5K states, 150K cities, client-side, no API key) |
| Search Progress | SSE (Server-Sent Events) via Next.js Route Handlers |
| Deployment | Railway (existing GitHub + Railway setup) |

---

## Apify Actors

| Actor | ID | Purpose | Pricing |
|-------|----|---------|---------|
| Career Site Job Listing Feed | `fantastic-jobs/career-site-job-listing-feed` | Jobs from 175K+ career sites, 54 ATS platforms | $0.80/1K jobs |
| Advanced LinkedIn Job Search API | `fantastic-jobs/advanced-linkedin-job-search-api` | Jobs from LinkedIn (10M+ new/month) | $1.50/1K jobs |
| Glassdoor Reviews Scraper | `getdataforme/glassdoor-reviews-scraper` | Employee reviews by company name | $9/1K reviews |
| LinkedIn Profile Enrichment | `anchor/linkedin-profile-enrichment` | Extract candidate profile data | Existing usage |
| Exa.ai People Search | `fantastic-jobs/exa-ai-people-search` | Neural search for insider connections | Existing usage |
| LinkedIn Company Scraper | `dev_fusion/linkedin-company-scraper` | Resolve company LinkedIn URLs to numeric IDs | Existing usage |

**Not using**: Expired Jobs API ($20/month, returns 300-500K IDs/day, overkill for this scale). Career Site Job Listing API (5x more expensive than Feed, same data).

---

## Architecture

### Job Source Adapter Pattern

Each Apify actor gets an adapter that normalizes its output into a unified `Job` schema. Adding a new job source = writing one adapter file.

```
src/lib/adapters/
  types.ts              # Unified Job interface
  career-site-feed.ts   # Career Site Feed -> Job
  linkedin-search.ts    # LinkedIn Search -> Job
  base-adapter.ts       # Shared interface
```

### Search Controller

The search controller dispatches search requests to enabled adapters, merges results, and handles deduplication before writing to the database.

```
User clicks "Start Search"
  -> API route receives search criteria
  -> Search controller fans out to adapters (Career Site Feed + LinkedIn in parallel)
  -> Each adapter calls its Apify actor and normalizes results
  -> Controller merges, deduplicates by job `id`
  -> Upsert into `jobs` table (insert new, update existing)
  -> Link jobs to search via `search_jobs` junction
  -> Return results to frontend
```

---

## Data Model

### Core Tables

#### `users` (extends Supabase auth.users)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | FK to auth.users |
| name | text | Full name |
| email | text | Login email |
| linkedin_url | text | Candidate's LinkedIn profile |
| location | text | Candidate's location |
| role | enum | 'admin' or 'user' |
| profile_data | jsonb | Extracted LinkedIn profile (experiences, education, skills) |
| profile_synced_at | timestamptz | Last profile extraction time |
| created_at | timestamptz | |

#### `jobs`
| Column | Type | Notes |
|--------|------|-------|
| id | text | PK - source job ID (stable across runs) |
| source | text | 'career-site' or 'linkedin' |
| source_actor | text | Apify actor ID that produced this job |
| title | text | Job title |
| organization | text | Company name |
| organization_url | text | Company page URL |
| organization_logo | text | Company logo URL |
| organization_linkedin_slug | text | LinkedIn company slug |
| url | text | Job application/posting URL |
| description_text | text | Plain text description |
| description_html | text | HTML description |
| location_raw | jsonb | Raw location data from source |
| locations_derived | text[] | Normalized locations |
| cities_derived | text[] | |
| regions_derived | text[] | |
| countries_derived | text[] | |
| remote_derived | boolean | |
| employment_type | text[] | FULL_TIME, PART_TIME, CONTRACT, etc. |
| salary_raw | jsonb | Raw salary from source |
| date_posted | timestamptz | When the job was posted |
| date_validthrough | timestamptz | Expiry date (LinkedIn provides this) |
| status | text | 'active', 'likely_expired', 'expired' |
| status_updated_at | timestamptz | Last status check time |
| seniority | text | LinkedIn only |
| recruiter_name | text | LinkedIn only |
| recruiter_url | text | LinkedIn only |
| directapply | boolean | LinkedIn Easy Apply |
| external_apply_url | text | |
| source_domain | text | e.g. 'greenhouse.io', 'linkedin.com' |
| ai_experience_level | text | 0-2, 2-5, 5-10, 10+ |
| ai_work_arrangement | text | Remote/Hybrid/On-site |
| ai_key_skills | text[] | |
| ai_employment_type | text[] | |
| ai_core_responsibilities | text | 2-sentence summary |
| ai_requirements_summary | text | 2-sentence summary |
| ai_salary_min | numeric | |
| ai_salary_max | numeric | |
| ai_salary_currency | text | |
| ai_salary_unit | text | HOUR/MONTH/YEAR |
| linkedin_org_employees | integer | |
| linkedin_org_industry | text | |
| linkedin_org_size | text | |
| linkedin_org_headquarters | text | |
| linkedin_org_description | text | |
| raw_data | jsonb | Full original payload for reference |
| created_at | timestamptz | First seen in our system |
| updated_at | timestamptz | Last data update |

#### `searches`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK to users |
| title_search | text[] | Job titles to include |
| title_exclusion | text[] | Job titles to exclude |
| keywords | text[] | Keyword filters |
| location_search | text[] | Location filters |
| time_range | text | '1h', '24h', '7d', '6m' |
| sources_enabled | text[] | Which adapters to use |
| job_count | integer | Results count from last run |
| last_run_at | timestamptz | |
| is_scheduled | boolean | Whether to auto-refresh |
| schedule_interval | text | 'daily', 'weekly' |
| created_at | timestamptz | |

#### `search_jobs` (junction)
| Column | Type | Notes |
|--------|------|-------|
| search_id | uuid | FK to searches |
| job_id | text | FK to jobs |
| created_at | timestamptz | When this job appeared in this search |

#### `user_saved_jobs`
| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | FK to users |
| job_id | text | FK to jobs |
| saved_at | timestamptz | |

**Unique constraint**: (user_id, job_id)

#### `user_job_views`
| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | FK to users |
| job_id | text | FK to jobs |
| first_viewed_at | timestamptz | |
| last_viewed_at | timestamptz | |

**Unique constraint**: (user_id, job_id)

#### `glassdoor_cache`
| Column | Type | Notes |
|--------|------|-------|
| company_name | text | PK (lowercased) |
| reviews | jsonb | Array of review objects |
| rating_overall | numeric | Average rating |
| review_count | integer | |
| fetched_at | timestamptz | Cache TTL: 30 days |

#### `company_cache`
| Column | Type | Notes |
|--------|------|-------|
| linkedin_url | text | PK (normalized) |
| numeric_id | text | LinkedIn numeric ID |
| name | text | |
| slug | text | |
| logo_url | text | |
| data | jsonb | Full company data |
| fetched_at | timestamptz | Cache TTL: 30 days |

#### `people_searches`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK to users |
| job_id | text | FK to jobs |
| query | text | The search query used |
| results | jsonb | Array of people found |
| linkedin_urls | jsonb | Generated LinkedIn search URLs |
| created_at | timestamptz | |

### RLS (Row Level Security)

- Users can only see/modify their own saved jobs, views, searches, and people searches
- Jobs table is readable by all authenticated users (jobs are shared resources)
- Admin role can read/write all user data
- Glassdoor and company caches are readable by all authenticated users

---

## Deduplication Strategy

**Primary dedup key**: `jobs.id` (the source's unique job identifier, stable across runs)

On each search run:
1. Fetch results from Apify actors
2. For each job in results:
   - `id` exists in `jobs` table -> UPDATE changed fields, set `status = 'active'`, update `updated_at`
   - `id` not in `jobs` table -> INSERT new row
3. Link all result job IDs to the search via `search_jobs`

**Multi-user handling**: The `jobs` table stores each job once. User-specific state (saved, seen) lives in junction tables. Multiple users can independently save/view the same job without duplication.

---

## Job Expiration Strategy

### LinkedIn Jobs
- Use `date_validthrough` field (LinkedIn provides explicit expiry dates)
- Daily cron: query `jobs` where `source = 'linkedin' AND date_validthrough < NOW() AND status = 'active'`
- Set `status = 'expired'`

### Career Site Jobs
- No `date_validthrough` available
- **Scheduled search re-runs**: Saved searches can be set to auto-refresh (daily/weekly)
- When a search re-runs, jobs that appeared in previous runs of the same search but no longer appear are flagged `likely_expired` after missing from 2 consecutive runs
- Jobs not refreshed for 30+ days: auto-flag as `likely_expired`

### UI Indicators
- Active: green dot
- Likely Expired (30+ days old or missing from re-runs): yellow dot
- Expired (LinkedIn `date_validthrough` passed): red dot / strikethrough
- Freshness badge: "2 days ago", "2 weeks ago", etc.

---

## Features

### F1: Authentication

- Email/password login only
- No registration page (registrations closed)
- Admin creates accounts via admin panel
- Session management via Supabase Auth

### F2: Admin Panel

**Route**: `/admin`
**Access**: Admin role only

- **User management**: List all users, create new users
- **Create user form**:
  - Name (required)
  - Email (required, becomes login)
  - LinkedIn profile URL (required)
  - Location (required)
  - Password auto-generated (random, displayed once for admin to share with candidate)
- On user creation:
  - Create Supabase auth user
  - Extract LinkedIn profile via Apify (`anchor/linkedin-profile-enrichment`)
  - Store extracted profile data (experiences, education, skills) in `users.profile_data`
  - Set `profile_synced_at`
- **User list**: Name, email, location, last login, profile sync status
- **Edit user**: Update name, location. Re-sync LinkedIn profile.

### F3: Search

**Route**: `/` (main page, after login)

**Search criteria form**:
- Job titles (optional): text input, comma-separated
- Exclude job titles (optional): text input, comma-separated
- Keywords (optional): text input, comma-separated
- Location (optional): combobox with search (all countries + major cities, filterable)
- Time range: toggle group (1h, 24h, 7d, 6m)
- Start Search button

**Search execution (SSE-powered)**:
- Client opens SSE connection to `/api/search`
- Server streams real-time progress events:
  - `{ stage: "career-site", status: "running" }` - "Searching career sites..."
  - `{ stage: "linkedin", status: "running" }` - "Searching LinkedIn..."
  - `{ stage: "career-site", status: "done", count: 423 }` - "Found 423 jobs from career sites"
  - `{ stage: "linkedin", status: "done", count: 312 }` - "Found 312 jobs from LinkedIn"
  - `{ stage: "processing", status: "running" }` - "Deduplicating and saving..."
  - `{ stage: "complete", totalNew: 589, totalUpdated: 146 }` - "Done! 589 new jobs, 146 updated"
- Both Apify actors run in parallel
- Normalize via adapters, deduplicate, upsert to DB
- Save search criteria to `searches` table
- Display results in job list
- Railway has no serverless timeout issues, so long-lived SSE connections work fine

**Search history**: Users can see and re-run their previous searches.

### F4: Job List

**Tabs**:
- **All Jobs** (with count): All jobs from user's searches
- **Saved** (with count): Jobs the user has saved

**Table columns**:
- Title (with external link icon to open job URL)
- Company (with logo if available)
- Location
- Posted (relative time: "2 days ago")
- Source (LinkedIn / career site name)
- Seen (checkmark if user has viewed details)
- Status (Active / Likely Expired / Expired)
- Save (star icon, toggle)

**Table features**:
- Search (text filter across title, company, location)
- Filter by: Status (Active, Likely Expired, Expired), Source (LinkedIn, Career Site)
- Sort by: Posted date (default: newest first), title, company
- Pagination or infinite scroll

### F5: Job Detail

**Triggered by**: Clicking a job row in the list

**Layout**: Side drawer (Sheet component) for quick browsing

**Header section**:
- Company logo + name
- Job title
- "Posted X days ago"
- **View Job** button (primary CTA, opens job URL in new tab)
- **Save Job** toggle
- **Delete Job** button (with confirmation dialog)
- **Find People** button (navigates to full-page `/jobs/[id]/find-people`)

**Info section**:
- Company name
- Location
- Employment type
- Work arrangement (Remote/Hybrid/On-site)
- Experience level
- Salary (if available)
- Company website (domain_derived)
- Company LinkedIn profile
- Source
- Date posted
- Last updated in our system

**Tabs within drawer**:
- **About**: Job description (rendered HTML or text)
- **Company**: LinkedIn org data (employees, industry, HQ, description, specialties)
- **Glassdoor Reviews**: On-demand fetch, cached for 30 days (see F7)

**Side effects**:
- Opening detail marks job as "seen" (`user_job_views` upsert)

### F6: Find People (Insider Connections)

**Route**: `/jobs/[id]/find-people` (full-page, not inside the drawer)

**Prerequisites**: User's LinkedIn profile has been extracted and stored in `users.profile_data`

**Flow**:
1. Auto-generate a natural language search query from:
   - Job title/role
   - Company name (+ LinkedIn slug if available)
   - User's location
   - Format: "[Role] or hiring manager or recruiter at [Company] in [Location]"
2. Query is editable before running
3. "Find People" button triggers Exa.ai search
4. Results displayed as cards:
   - Avatar (photo or initials)
   - Name
   - Title
   - LinkedIn profile link
5. Below results: Generated LinkedIn search URLs
   - "Worked at same companies" URL (using company numeric IDs from user's past experience)
   - "Went to same schools" URL (using school names from user's education)
6. "Copy All" button (exports people as CSV: name, title, URL)
7. Results cached per user+job in `people_searches` table

**Background processes on first run**:
- Resolve target company to LinkedIn numeric ID (if not cached)
- Resolve user's past companies to numeric IDs (if not cached)
- All cached in `company_cache` table

### F7: Glassdoor Reviews

**Location**: Tab within Job Detail drawer

**Flow**:
1. Check `glassdoor_cache` for company name
2. If cached and < 30 days old: display from cache
3. If not cached: call Glassdoor Reviews Scraper with `company_name` and `item_limit: 15`
4. Store results in cache
5. Display:
   - Overall rating (X / 5 stars, N reviews)
   - List of reviews, each showing:
     - Summary title
     - Rating stars
     - Job title + location
     - Employment status (current/former) + tenure
     - Pros (highlighted green)
     - Cons (highlighted red)
     - Advice (if present)
     - Date

### F8: User Profile / Settings

**Route**: `/settings`

- View/edit name, location
- View LinkedIn URL (not editable, set by admin)
- "Re-sync LinkedIn Profile" button: re-extracts profile data from LinkedIn
- Shows last sync date
- Change password

### F9: Saved Search Scheduling

**Location**: Search history section or search results page

- After running a search, user can "Save & Schedule" it
- Options: daily refresh, weekly refresh, or manual only
- Scheduled searches run via cron (Supabase Edge Function or Railway cron)
- On refresh: re-run search, upsert jobs, update expiration status

---

## Pages / Routes

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login form | Public |
| `/` | Search + Job List (main app) | Authenticated |
| `/jobs/[id]/find-people` | Full-page insider connections for a job | Authenticated |
| `/settings` | User profile & settings | Authenticated |
| `/admin` | Admin panel (user management) | Admin only |

---

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/search` | Execute a new job search |
| GET | `/api/searches` | Get user's search history |
| POST | `/api/searches/[id]/refresh` | Re-run a saved search |
| GET | `/api/jobs` | Get jobs (with filters, pagination) |
| GET | `/api/jobs/[id]` | Get single job detail |
| DELETE | `/api/jobs/[id]` | Delete a job (admin or owner) |
| POST | `/api/jobs/[id]/view` | Mark job as viewed |
| POST | `/api/jobs/[id]/save` | Toggle save on a job |
| GET | `/api/jobs/[id]/glassdoor` | Get/fetch Glassdoor reviews |
| POST | `/api/jobs/[id]/find-people` | Run insider connections search |
| GET | `/api/admin/users` | List users (admin) |
| POST | `/api/admin/users` | Create user (admin) |
| PUT | `/api/admin/users/[id]` | Update user (admin) |
| POST | `/api/admin/users/[id]/sync-profile` | Re-extract LinkedIn profile |
| POST | `/api/cron/expire-jobs` | Cron: expire LinkedIn jobs past date_validthrough |
| POST | `/api/cron/refresh-searches` | Cron: re-run scheduled searches |

---

## UI Components (shadcn/ui)

### Layout
- Top nav bar: Logo, navigation, user avatar/menu
- Main content area with responsive layout

### Search Form
- Input fields for titles, exclusions, keywords
- Combobox for location (searchable dropdown)
- Toggle group for time range
- Button for Start Search

### Job List
- Tabs component (All Jobs, Saved)
- Data table with sorting, filtering
- Badge components for status, source
- Star toggle for save

### Job Detail
- Sheet (side drawer) or Dialog
- Tabs (About, Company, Glassdoor, Find People)
- Button group (View Job, Save, Delete)
- Card components for people results
- Star rating display for Glassdoor

### Admin
- Data table for users
- Form dialog for creating users
- Badge for profile sync status

---

## Non-functional Requirements

- **Performance**: Search results should display within the Apify actor run time (typically 10-60 seconds). Show real-time progress.
- **Cost control**: Cache aggressively (Glassdoor 30 days, company data 30 days, people searches persist). Deduplicate to avoid re-fetching known jobs.
- **Security**: RLS on all tables. Admin endpoints protected. No exposure of API keys to client.
- **Extensibility**: New job sources can be added by creating a new adapter file. No changes to the search controller or database schema needed (raw_data jsonb captures source-specific fields).

---

## Out of Scope (v1)

- Board/Kanban view
- Applied / Interviewing / Offer / Rejected pipeline stages
- Email notifications
- Resume upload/parsing
- Job application tracking
- AI-powered job matching/recommendations
- Public registration
- Multiple workspaces per user
- Billing / credit system

---

## Resolved Decisions

1. **Job detail layout**: Side drawer for browsing (About, Company, Glassdoor tabs). Find People gets its own full page at `/jobs/[id]/find-people`.
2. **Location data**: `country-state-city` npm package (250 countries, 5K states, 150K cities). Client-side, no API key needed. Powers the searchable combobox.
3. **Search progress**: SSE (Server-Sent Events) via Next.js Route Handlers. Streams real-time progress from parallel Apify actor runs. Railway supports long-lived connections.
