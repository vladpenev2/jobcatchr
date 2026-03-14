---
phase: 1
plan: 05
status: complete
---

# Summary: Plan 05 - Base Layout, Dark Theme, Nav Bar, Login Page

## Tasks Completed

### 01-05-01: Install shadcn components
Installed 7 components via `npx shadcn@latest add`: button, input, label, card, dropdown-menu, avatar, separator. All written to `src/components/ui/`.

### 01-05-02: Update root layout for dark theme
- Removed Geist and Geist_Mono font imports (unused)
- Added `dark` class to `<html>` to force dark mode globally
- Updated metadata title to "Job Catchr" and description
- Cleaned up body className to just `antialiased`

### 01-05-03: Create login page
- `src/app/login/actions.ts`: Server Action using `useActionState`-compatible signature `(prevState, formData)`, calls `supabase.auth.signInWithPassword`, redirects to `/` on success
- `src/app/login/page.tsx`: Client Component using `useActionState` (React 19), centered Card layout, email + password inputs, error display, no registration link

### 01-05-04: Create top nav bar
- `src/components/nav/top-nav.tsx`: Server Component, sticky top nav with "Job Catchr" brand left, "Jobs" link, UserMenu right

### 01-05-05: Create user menu
- `src/components/nav/user-menu.tsx`: Client Component, Avatar with initials, DropdownMenu with Settings, conditional Admin link, Sign Out (calls `supabase.auth.signOut()` + `router.push('/login')`)

### 01-05-06: Create (app) route group layout
- `src/app/(app)/layout.tsx`: Server Component, calls `getUser()`, queries `profiles` table for name/email/role, renders TopNav + main content area

### 01-05-07: Create home page, delete root page
- `src/app/(app)/page.tsx`: Placeholder "Jobs" page
- Deleted `src/app/page.tsx` to resolve route conflict at `/`

### 01-05-08: Build verification
`npm run build` passed with no TypeScript errors. Routes: `/` (dynamic), `/login` (static), `/admin` (dynamic).

## Must Haves Status

- [x] Dark theme active (html has "dark" class)
- [x] Root layout metadata shows "Job Catchr"
- [x] Login page at /login with email + password form, centered card, dark theme
- [x] Login server action calls supabase.auth.signInWithPassword
- [x] Top nav bar with "Job Catchr" logo, nav links, user menu
- [x] User menu with Settings, Admin (conditional), Sign Out
- [x] (app) route group layout fetches user via getUser() and renders nav
- [x] Home page placeholder renders at /
- [x] `npm run build` passes with no errors

## Files Modified/Created

- `src/app/layout.tsx` - updated
- `src/app/page.tsx` - deleted
- `src/app/login/page.tsx` - created
- `src/app/login/actions.ts` - created
- `src/app/(app)/layout.tsx` - created
- `src/app/(app)/page.tsx` - created
- `src/components/nav/top-nav.tsx` - created
- `src/components/nav/user-menu.tsx` - created
- `src/components/ui/button.tsx` - created (shadcn)
- `src/components/ui/input.tsx` - created (shadcn)
- `src/components/ui/label.tsx` - created (shadcn)
- `src/components/ui/card.tsx` - created (shadcn)
- `src/components/ui/dropdown-menu.tsx` - created (shadcn)
- `src/components/ui/avatar.tsx` - created (shadcn)
- `src/components/ui/separator.tsx` - created (shadcn)

## Commits

- `c0c692c` feat(01-05-01): install shadcn components
- `c59ac9f` feat(01-05-02): force dark theme, update metadata, remove Geist fonts
- `6d68a7f` feat(01-05-03): create login page with useActionState and server action
- `00443f4` feat(01-05-04-05): create top nav bar and user avatar dropdown menu
- `3486b74` feat(01-05-06): create (app) route group layout with auth check and nav shell
- `8b86c3c` feat(01-05-07): add (app)/page.tsx home placeholder, delete conflicting root page.tsx
