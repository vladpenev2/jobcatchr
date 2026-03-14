# PROJECT

## Name
JobCatchr

## Description
Multi-tenant ATS-lite for UAE job seekers. Admin creates accounts; users search for jobs across LinkedIn and career sites via Apify actors, save/track jobs, find insider connections via Exa.ai, and view Glassdoor reviews.

## Tech Stack
- Next.js 16 (App Router, Turbopack)
- shadcn/ui + Tailwind CSS v4
- Supabase (PostgreSQL + Auth + RLS)
- Apify (job search, profile extraction, Glassdoor)
- Exa.ai (people search)
- Railway (deployment)

## Architecture
- Job Source Adapter Pattern: each Apify actor gets an adapter normalizing output to unified Job schema
- Search Controller: fans out to adapters in parallel, deduplicates, upserts to Supabase
- SSE for real-time search progress
- RLS on all tables; service role for API routes that write jobs/cache

## Key Docs
- `scope/PRD.md` - Full product requirements
- `scope/schema.sql` - Database schema with RLS
- `scope/*.md` - Apify actor documentation
- `v1/` - Previous Express+SQLite implementation for reference

## Constraints
- 10-20 users initially, admin-managed accounts only
- No public registration
- Deploy to Railway (supports long-lived SSE connections)
- Cost-conscious: cache aggressively, deduplicate jobs
