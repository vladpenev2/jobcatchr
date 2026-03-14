---
phase: 1
plan: 02
title: "Database schema migration"
status: complete
completed_at: 2026-03-14
---

# Plan 02: Database Schema Migration - Summary

## Tasks Completed

### 01-02-01: Fix pg_trgm extension ordering
- Moved `create extension if not exists pg_trgm;` to the top of `scope/schema.sql`, immediately after the header comment and before the ENUMS section
- Removed the original TRIGRAM EXTENSION section (lines 194-198) that placed the extension creation after trigram indexes
- Committed: `feat(01-02): fix pg_trgm extension ordering in schema.sql`

### 01-02-02: Run schema migration via Supabase
- Executed `scope/schema.sql` against Supabase project `bhynmvikdjaorevprdkg` via the Supabase Management API (`POST /v1/projects/{ref}/database/query`)
- Migration ran successfully (empty array response = no errors)

### 01-02-03: Verify RLS and extensions
All verification queries passed:

**9 tables created** (all with `rowsecurity = true`):
- company_cache
- glassdoor_cache
- jobs
- people_searches
- profiles
- search_jobs
- searches
- user_job_views
- user_saved_jobs

**pg_trgm extension**: active

**is_admin() function**: exists in public schema

**Triggers**:
- `profiles_updated_at` on `profiles`
- `jobs_updated_at` on `jobs`

## Must-Haves Checklist

- [x] pg_trgm extension creation moved to top of schema.sql (before indexes)
- [x] All 9 tables created in Supabase
- [x] RLS enabled on all 9 tables
- [x] pg_trgm extension active
- [x] is_admin() function exists
- [x] update_updated_at triggers on profiles and jobs
