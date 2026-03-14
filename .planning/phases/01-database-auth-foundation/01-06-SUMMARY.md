---
phase: 1
plan: 06
status: complete
commit: 03b10e4
---

# Plan 06 Summary: Admin Route Guard & Admin Shell

## What was done

### Task 01-06-01: Admin guard layout
Created `src/app/(app)/admin/layout.tsx` as a Server Component that:
- Creates a Supabase server client via `createClient()` from `@/lib/supabase/server`
- Calls `getUser()` (not `getSession()`) to validate auth
- Redirects unauthenticated users to `/login`
- Queries `profiles` table for `role` field matching the user's id
- Redirects non-admin users to `/`
- Renders children for admin users

### Task 01-06-02: Admin page placeholder
Created `src/app/(app)/admin/page.tsx` with a static placeholder page showing "Admin Panel" heading and note that user management ships in Phase 4.

### Task 01-06-03: Unit tests
Created `src/__tests__/admin-guard.test.ts` with 3 tests:
- Redirects to `/login` when no authenticated user
- Redirects to `/` when user has role !== 'admin'
- Passes through (no redirect) when user has role === 'admin'

All 3 tests pass.

## Files created
- `src/app/(app)/admin/layout.tsx`
- `src/app/(app)/admin/page.tsx`
- `src/__tests__/admin-guard.test.ts`

## Must-haves checklist
- [x] `src/app/(app)/admin/layout.tsx` checks user role via profiles table query
- [x] Non-admin users redirected to `/`
- [x] Unauthenticated users redirected to `/login`
- [x] Admin users can access `/admin` pages
- [x] Admin page placeholder renders at `/admin`
- [x] Uses `getUser()` not `getClaims()` for auth validation
- [x] Unit test validates redirect logic for admin/non-admin/unauthenticated cases
