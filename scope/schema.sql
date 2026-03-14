-- JobCatchr v2 - Supabase Database Schema
-- Run this as a migration in Supabase SQL Editor

create extension if not exists pg_trgm;

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('admin', 'user');
create type job_status as enum ('active', 'likely_expired', 'expired');
create type job_source as enum ('career-site', 'linkedin');
create type time_range as enum ('1h', '24h', '7d', '6m');
create type schedule_interval as enum ('daily', 'weekly');

-- ============================================================
-- TABLES
-- ============================================================

-- Extends Supabase auth.users with app-specific profile data
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  linkedin_url text,
  location text,
  role user_role not null default 'user',
  profile_data jsonb,                -- Extracted LinkedIn profile: { experiences, education, skills }
  profile_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Jobs table: each job exists once, identified by source ID
create table jobs (
  id text primary key,               -- Source job ID (stable across Apify runs)
  source job_source not null,
  source_actor text not null,         -- Apify actor ID that produced this job
  title text not null,
  organization text,
  organization_url text,
  organization_logo text,
  organization_linkedin_slug text,
  url text not null,                  -- Job posting/application URL
  description_text text,
  description_html text,
  location_raw jsonb,                 -- Raw location data from source
  locations_derived text[],
  cities_derived text[],
  regions_derived text[],
  countries_derived text[],
  remote_derived boolean default false,
  employment_type text[],             -- FULL_TIME, PART_TIME, CONTRACT, etc.
  salary_raw jsonb,
  date_posted timestamptz,
  date_validthrough timestamptz,      -- LinkedIn provides explicit expiry
  status job_status not null default 'active',
  status_updated_at timestamptz,
  -- LinkedIn-specific fields
  seniority text,
  recruiter_name text,
  recruiter_url text,
  directapply boolean,                -- LinkedIn Easy Apply
  external_apply_url text,
  source_domain text,                 -- e.g. 'greenhouse.io', 'linkedin.com'
  -- AI enrichment fields
  ai_experience_level text,           -- '0-2', '2-5', '5-10', '10+'
  ai_work_arrangement text,           -- 'Remote Solely', 'Remote OK', 'Hybrid', 'On-site'
  ai_key_skills text[],
  ai_employment_type text[],
  ai_core_responsibilities text,
  ai_requirements_summary text,
  ai_salary_min numeric,
  ai_salary_max numeric,
  ai_salary_currency text,
  ai_salary_unit text,                -- HOUR, MONTH, YEAR
  -- LinkedIn org enrichment
  linkedin_org_employees integer,
  linkedin_org_industry text,
  linkedin_org_size text,
  linkedin_org_headquarters text,
  linkedin_org_description text,
  -- Raw payload
  raw_data jsonb,                     -- Full original Apify response for reference
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User searches: stores search criteria and scheduling
create table searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title_search text[],                -- Job titles to include
  title_exclusion text[],             -- Job titles to exclude
  keywords text[],
  location_search text[],
  time_range time_range not null default '7d',
  sources_enabled text[] not null default array['career-site', 'linkedin'],
  job_count integer default 0,
  last_run_at timestamptz,
  is_scheduled boolean not null default false,
  schedule_interval schedule_interval,
  consecutive_runs_missing integer not null default 0, -- Track runs for expiration logic
  created_at timestamptz not null default now()
);

-- Junction: which jobs came from which search
create table search_jobs (
  search_id uuid not null references searches(id) on delete cascade,
  job_id text not null references jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (search_id, job_id)
);

-- Per-user saved jobs
create table user_saved_jobs (
  user_id uuid not null references profiles(id) on delete cascade,
  job_id text not null references jobs(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

-- Per-user job view tracking ("seen" indicator)
create table user_job_views (
  user_id uuid not null references profiles(id) on delete cascade,
  job_id text not null references jobs(id) on delete cascade,
  first_viewed_at timestamptz not null default now(),
  last_viewed_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

-- Glassdoor reviews cache (per company, 30-day TTL)
create table glassdoor_cache (
  company_name text primary key,      -- Lowercased, trimmed
  reviews jsonb not null default '[]',
  rating_overall numeric,
  review_count integer default 0,
  employer_logo_url text,
  fetched_at timestamptz not null default now()
);

-- LinkedIn company resolution cache (30-day TTL)
create table company_cache (
  linkedin_url text primary key,      -- Normalized (lowercase, no trailing slash)
  numeric_id text,
  name text,
  slug text,
  logo_url text,
  data jsonb,
  fetched_at timestamptz not null default now()
);

-- Find People search results (per user + job)
create table people_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  job_id text not null references jobs(id) on delete cascade,
  query text not null,                -- The Exa search query used
  results jsonb not null default '[]', -- Array of { name, title, url, image, location, highlights }
  linkedin_urls jsonb,                -- Generated LinkedIn search URLs
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Jobs: frequent query patterns
create index idx_jobs_source on jobs(source);
create index idx_jobs_status on jobs(status);
create index idx_jobs_date_posted on jobs(date_posted desc);
create index idx_jobs_date_validthrough on jobs(date_validthrough)
  where date_validthrough is not null;
create index idx_jobs_organization on jobs(organization);
create index idx_jobs_countries on jobs using gin(countries_derived);
create index idx_jobs_cities on jobs using gin(cities_derived);
create index idx_jobs_title_trgm on jobs using gin(title gin_trgm_ops);
create index idx_jobs_org_trgm on jobs using gin(organization gin_trgm_ops);

-- Searches: by user
create index idx_searches_user on searches(user_id);
create index idx_searches_scheduled on searches(is_scheduled)
  where is_scheduled = true;

-- User relationships: by user for fast lookups
create index idx_saved_jobs_user on user_saved_jobs(user_id);
create index idx_job_views_user on user_job_views(user_id);

-- People searches: by user + job
create index idx_people_searches_user_job on people_searches(user_id, job_id);

-- Cache TTL queries
create index idx_glassdoor_cache_fetched on glassdoor_cache(fetched_at);
create index idx_company_cache_fetched on company_cache(fetched_at);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at on profiles
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger jobs_updated_at
  before update on jobs
  for each row execute function update_updated_at();

-- Helper: check if current user is admin
create or replace function is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table jobs enable row level security;
alter table searches enable row level security;
alter table search_jobs enable row level security;
alter table user_saved_jobs enable row level security;
alter table user_job_views enable row level security;
alter table glassdoor_cache enable row level security;
alter table company_cache enable row level security;
alter table people_searches enable row level security;

-- PROFILES
-- Users can read their own profile; admins can read all
create policy "Users read own profile"
  on profiles for select
  using (id = auth.uid() or is_admin());

-- Users can update their own profile (name, location only - not role)
create policy "Users update own profile"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));

-- Only admins can insert profiles (account creation)
create policy "Admins insert profiles"
  on profiles for insert
  with check (is_admin());

-- Admins can update any profile
create policy "Admins update any profile"
  on profiles for update
  using (is_admin());

-- JOBS
-- All authenticated users can read jobs
create policy "Authenticated users read jobs"
  on jobs for select
  using (auth.uid() is not null);

-- Only server (service role) inserts/updates jobs via API routes
-- No direct client insert/update policies needed
-- Jobs are created by the search API using the service role key

create policy "Service role manages jobs"
  on jobs for all
  using (auth.uid() is not null and is_admin());

-- SEARCHES
-- Users see only their own searches
create policy "Users manage own searches"
  on searches for all
  using (user_id = auth.uid());

-- Admins can see all searches
create policy "Admins read all searches"
  on searches for select
  using (is_admin());

-- SEARCH_JOBS
-- Users can see search_jobs for their own searches
create policy "Users read own search_jobs"
  on search_jobs for select
  using (
    exists (
      select 1 from searches
      where searches.id = search_jobs.search_id
      and searches.user_id = auth.uid()
    )
  );

-- USER_SAVED_JOBS
-- Users manage only their own saved jobs
create policy "Users manage own saved jobs"
  on user_saved_jobs for all
  using (user_id = auth.uid());

-- USER_JOB_VIEWS
-- Users manage only their own views
create policy "Users manage own views"
  on user_job_views for all
  using (user_id = auth.uid());

-- GLASSDOOR_CACHE
-- All authenticated users can read cache
create policy "Authenticated read glassdoor cache"
  on glassdoor_cache for select
  using (auth.uid() is not null);

-- Service role writes cache (via API routes)
create policy "Service role manages glassdoor cache"
  on glassdoor_cache for all
  using (is_admin());

-- COMPANY_CACHE
-- All authenticated users can read cache
create policy "Authenticated read company cache"
  on company_cache for select
  using (auth.uid() is not null);

-- Service role writes cache (via API routes)
create policy "Service role manages company cache"
  on company_cache for all
  using (is_admin());

-- PEOPLE_SEARCHES
-- Users manage only their own people searches
create policy "Users manage own people searches"
  on people_searches for all
  using (user_id = auth.uid());

-- ============================================================
-- SEED: Create first admin user
-- ============================================================
-- After running this migration:
-- 1. Create a user via Supabase Auth (Dashboard > Authentication > Add User)
-- 2. Then insert their profile:
--
-- insert into profiles (id, name, email, role)
-- values ('<auth-user-uuid>', 'Admin Name', 'admin@example.com', 'admin');
