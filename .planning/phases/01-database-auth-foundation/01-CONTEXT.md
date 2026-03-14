# Phase 1: Database & Auth Foundation - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning
**Source:** PRD Express Path (scope/PRD.md + scope/schema.sql)

<domain>
## Phase Boundary

This phase delivers the complete database schema in Supabase, authentication flow, middleware for route protection, the base app layout with shadcn/ui, and Vitest test setup. It is the foundation that all subsequent phases depend on.

</domain>

<decisions>
## Implementation Decisions

### Database
- Full schema from scope/schema.sql: enums, 9 tables, indexes, RLS policies, triggers, functions
- pg_trgm extension for text search on job title/organization
- Jobs table uses text PK (source job ID from Apify)
- Profiles table extends auth.users via FK on id
- All tables have RLS enabled with policies per scope/schema.sql
- Service role key used in API routes for writing jobs/cache tables
- Run migration via Supabase MCP or SQL editor

### Auth
- Email/password only via Supabase Auth
- No public registration page
- Admin creates accounts via admin panel (Phase 4)
- Session management via Supabase Auth (cookies)
- Two roles: 'admin' and 'user' (user_role enum)
- is_admin() helper function (security definer) for RLS policies

### Middleware
- Protected routes: all except /login
- Admin route guard for /admin
- Redirect unauthenticated users to /login
- Redirect authenticated users away from /login to /

### Layout
- Top nav bar: logo ("Job Catchr"), navigation links, user avatar/menu
- Dark theme (matching current Glide app aesthetic)
- Responsive layout
- shadcn/ui components: navigation, avatar, dropdown menu
- App shell wraps all authenticated routes

### Testing
- Vitest for unit and integration tests
- Test setup with proper Next.js mocking

### Claude's Discretion
- Supabase client initialization pattern (createBrowserClient vs createServerClient)
- Middleware implementation details (Next.js middleware.ts)
- Cookie handling strategy for Supabase Auth
- Specific shadcn/ui components for the shell layout
- Vitest configuration details

</decisions>

<specifics>
## Specific Ideas

- Use @supabase/ssr package for Next.js integration (NOT the deprecated @supabase/auth-helpers-nextjs)
- Login page: simple email + password form, centered, dark theme
- Nav bar should include: logo on left, main nav items center-ish, user avatar dropdown on right
- User dropdown: Settings link, Admin link (if admin), Sign Out
- The schema.sql in scope/ is the source of truth for the database

</specifics>

<deferred>
## Deferred Ideas

- User creation flow (Phase 4: Admin Panel)
- Job search functionality (Phase 2: Adapters & Search)
- Job list and detail UI (Phase 3)
- All Apify integrations (Phases 2, 4, 5, 6)

</deferred>

---

*Phase: 01-database-auth-foundation*
*Context gathered: 2026-03-14 via PRD Express Path*
