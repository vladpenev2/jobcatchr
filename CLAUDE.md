# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JobCatchr is a multi-tenant ATS-lite (Applicant Tracking System) for UAE job seekers. Admin creates accounts; users search for jobs across LinkedIn and career sites via Apify actors, save jobs, find insider connections via Exa.ai, and view Glassdoor reviews.

**Current state**: Migrating from Express + SQLite + vanilla JS (v1) to Next.js + Supabase + shadcn/ui (v2). The v1 code (`server.js`, `db.js`, `public/`) is the existing deployed app. The v2 spec lives in `scope/`.

## Tech Stack (v2)

- **Framework**: Next.js (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **External APIs**: Apify (job search, profile extraction, Glassdoor), Exa.ai (people search)
- **Location data**: `country-state-city` npm package (client-side)
- **Search progress**: SSE (Server-Sent Events) via Route Handlers
- **Deployment**: Railway (Docker, auto-deploys from `main`)

## Commands

```bash
npm run dev          # Next.js dev server
npm run build        # Production build
npm run start        # Production server
```

## Architecture

### Job Source Adapter Pattern
Each Apify actor has an adapter in `src/lib/adapters/` that normalizes raw API output to a unified `Job` type. To add a new job source, create a new adapter implementing the base interface.

### Search Flow
User search -> SSE endpoint -> dispatches to adapters in parallel -> normalize + deduplicate by job `id` -> upsert to Supabase `jobs` table -> link to `search_jobs` junction -> stream progress to client.

### Key Patterns
- **Deduplication**: Job `id` is the source's stable identifier. Upsert on each search run (insert new, update existing).
- **Multi-user sharing**: `jobs` table stores each job once. User-specific state (saved, seen) lives in junction tables (`user_saved_jobs`, `user_job_views`).
- **Job expiration**: LinkedIn uses `date_validthrough`. Career site jobs expire when missing from 2+ consecutive search re-runs.
- **Caching**: Glassdoor reviews (30-day TTL), company data (30-day TTL), people search results (persist per user+job).

### Auth
- Email/password via Supabase Auth. No public registration.
- Admin creates accounts with auto-generated passwords.
- On account creation, LinkedIn profile is extracted via Apify and stored in `profiles.profile_data`.

## Key Files

- `scope/PRD.md` - Complete product requirements
- `scope/schema.sql` - Supabase database schema (enums, tables, indexes, RLS, functions)
- `scope/*.md` - Apify actor documentation (input/output schemas, pricing)
- `.claude/mcp.json` - Supabase MCP server config (direct DB access)

## Environment Variables

All secrets in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase client
- `SUPABASE_SECRET_KEY` - Supabase service role (server-side only)
- `APIFY_API_TOKEN` - Apify API access
- `EXA_API_KEY` - Exa.ai people search

## Database

Schema in `scope/schema.sql`. Key tables: `profiles`, `jobs`, `searches`, `search_jobs`, `user_saved_jobs`, `user_job_views`, `glassdoor_cache`, `company_cache`, `people_searches`. All tables have RLS enabled. The Supabase MCP server is configured for direct access.

## Apify Actors

| Actor | Purpose |
|-------|---------|
| `fantastic-jobs/career-site-job-listing-feed` | Jobs from 175K+ career sites |
| `fantastic-jobs/advanced-linkedin-job-search-api` | LinkedIn job search |
| `getdataforme/glassdoor-reviews-scraper` | Glassdoor reviews |
| `anchor/linkedin-profile-enrichment` | Extract LinkedIn profiles |
| `fantastic-jobs/exa-ai-people-search` | Find insider connections |
| `dev_fusion/linkedin-company-scraper` | Resolve company LinkedIn IDs |

Actor documentation (input schemas, output fields, pricing) is in `scope/*.md`.
