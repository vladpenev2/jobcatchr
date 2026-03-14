# Plan 07 Summary: Admin Panel - User Management

## Status: COMPLETE

## Tasks Completed

### 01-07-01: Install shadcn components
- Added: `dialog`, `table`, `badge`, `sonner` components to `src/components/ui/`
- Installed: `apify-client`, `next-themes`, `sonner` npm packages
- Added `<Toaster />` to root layout for app-wide toast notifications

### 01-07-02: LinkedIn profile extraction helper
- Created `src/lib/apify/profile.ts` with `extractLinkedInProfile(url)` function
- Calls `anchor/linkedin-profile-enrichment` Apify actor (mirrors v1/server.js logic)
- Returns typed `LinkedInProfile` with fullName, headline, city, country, experiences, education, skills
- 3 vitest tests pass: field mapping, first/last name fallback, empty response error

### 01-07-03: Admin API routes
- `GET /api/admin/users` - list all profiles (id, name, email, location, role, linkedin_url, profile_synced_at, created_at)
- `POST /api/admin/users` - create user: generates 12-char password, creates auth user via `supabase.auth.admin.createUser()`, inserts profile row, extracts LinkedIn profile (non-fatal on failure), returns generated password once
- `PUT /api/admin/users/[id]` - update name and/or location
- `POST /api/admin/users/[id]/sync-profile` - re-extract LinkedIn profile and update profile_data + profile_synced_at
- All routes check `profiles.role === 'admin'` via caller's session before proceeding (403 otherwise)

### 01-07-04: Admin page UI
- `src/app/(app)/admin/page.tsx` - client component, fetches user list on mount
- `src/components/admin/user-table.tsx` - table with name, email, location, sync status badge (synced date / pending), join date, edit + re-sync action buttons
- `src/components/admin/create-user-dialog.tsx` - modal form for name/email/linkedin_url/location, shows generated password with copy button after success

## Verification
- `npx next build` passes clean with 0 TypeScript errors
- `npx vitest run src/__tests__/profile-extraction.test.ts` - 3/3 tests pass
- All 3 API routes appear in build output as dynamic routes

## Files Created/Modified
- `src/components/ui/dialog.tsx` (new)
- `src/components/ui/table.tsx` (new)
- `src/components/ui/badge.tsx` (new)
- `src/components/ui/sonner.tsx` (new)
- `src/app/layout.tsx` (modified - Toaster added)
- `src/lib/apify/profile.ts` (new)
- `src/__tests__/profile-extraction.test.ts` (new)
- `src/app/api/admin/users/route.ts` (new)
- `src/app/api/admin/users/[id]/route.ts` (new)
- `src/app/api/admin/users/[id]/sync-profile/route.ts` (new)
- `src/app/(app)/admin/page.tsx` (replaced placeholder)
- `src/components/admin/user-table.tsx` (new)
- `src/components/admin/create-user-dialog.tsx` (new)

## Commits
- `d28bfc3` feat(01-07): install shadcn dialog/table/badge/sonner + apify-client
- `087d421` feat(01-07): LinkedIn profile extraction helper via Apify
- `b270403` feat(01-07): admin API routes for user management
- `52d4e7e` feat(01-07): admin panel UI - user table, create dialog, edit + sync actions
