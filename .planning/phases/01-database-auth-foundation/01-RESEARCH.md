# Phase 1: Database & Auth Foundation - Research

## Supabase + Next.js Integration

### Packages to install

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Do NOT use `@supabase/auth-helpers-nextjs` - it is deprecated.

### Publishable key vs anon key

The project already has the new format in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx` (new format)
- `SUPABASE_SECRET_KEY=sb_secret_xxx` (new format for service role)

Both env vars are already present and correctly named in `.env.local`. No changes needed there.

### Three client files to create

All go in `src/lib/supabase/`:

**`src/lib/supabase/client.ts`** (browser, for Client Components):
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```
`createBrowserClient` is a singleton internally - no need to memoize.

**`src/lib/supabase/server.ts`** (for Server Components, Route Handlers, Server Actions):
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component - safe to ignore
            // Middleware handles session refresh
          }
        },
      },
    }
  )
}
```

**`src/lib/supabase/server-admin.ts`** (for API routes that need service role):
```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  )
}
```
Use this (not the SSR client) when API routes need to bypass RLS (writing jobs, caches).

### Session handling

- Proxy (middleware) is responsible for refreshing tokens via `supabase.auth.getUser()`
- Server Components call `getUser()` to validate the JWT and get the authenticated user
- `getUser()` makes a network call to Supabase Auth to validate the JWT - safe to trust server-side
- `getSession()` reads from local storage/cookies without validation - use only on client side
- For server-side auth checks, ALWAYS use `getUser()` not `getSession()`


## Auth Middleware Pattern

### Critical Next.js 16 change: middleware.ts -> proxy.ts

Next.js 16 renamed `middleware` to `proxy`. The file is now `src/proxy.ts` (or `proxy.ts` at root). The exported function is named `proxy` not `middleware`.

Migration: `npx @next/codemod@canary middleware-to-proxy .`

Since this is a new project, just create `src/proxy.ts` directly.

### Supabase proxy.ts pattern (official from supabase/supabase repo)

**`src/lib/supabase/proxy.ts`** (the updateSession helper):
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from /login
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

**`src/proxy.ts`** (the actual proxy file):
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Admin route guard

The `updateSession` function handles the base auth check. For `/admin` routes, add a check in `updateSession`:

```typescript
// After the user check above:
if (user && request.nextUrl.pathname.startsWith('/admin')) {
  // Check admin role - need to query profiles table
  // Option A: decode JWT claims if role is in JWT
  // Option B: add role to JWT custom claims
  // Option C: check in the route itself (simpler, no extra DB call in proxy)
}
```

**Recommendation**: Do NOT query the DB in the proxy for admin check. Keep proxy fast. Instead, protect admin routes at the page/layout level using a server component that calls `getUser()` and then checks the profiles table. The proxy just ensures the user is authenticated.

Create `src/app/(app)/admin/layout.tsx` that does:
```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')

const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .single()
if (profile?.role !== 'admin') redirect('/')
```


## Schema Migration Strategy

### Critical bug in schema.sql: wrong order

The schema creates trigram indexes at lines 175-176 BEFORE enabling the `pg_trgm` extension at line 198:

```sql
-- Line 175-176 (BEFORE extension is enabled - WILL FAIL)
create index idx_jobs_title_trgm on jobs using gin(title gin_trgm_ops);
create index idx_jobs_org_trgm on jobs using gin(organization gin_trgm_ops);

-- Line 198 (this needs to come FIRST)
create extension if not exists pg_trgm;
```

**Fix**: Move `create extension if not exists pg_trgm;` to the very top, before the ENUMS section.

### Migration approach

Run the entire schema.sql as a single statement in the Supabase SQL editor (via MCP or dashboard). Supabase's hosted Postgres already has `pg_trgm` available - just need `create extension if not exists`. The `create extension` statement is idempotent.

The schema is self-contained - no need to split it. Just fix the ordering bug above.

**Steps via Supabase MCP**:
1. Fix the pg_trgm ordering in schema.sql
2. Run the SQL via MCP `supabase_execute_sql` tool
3. Verify tables exist with `supabase_list_tables`
4. Create the first admin user via Supabase Dashboard (Auth > Add User), then insert their profile row

### Potential RLS chicken-and-egg issue

The `is_admin()` function used in RLS policies queries the `profiles` table. When inserting the first admin, the "Admins insert profiles" policy calls `is_admin()` which checks if the current user has role='admin' - but no profile exists yet for this user.

**Solution**: Use the service role key (bypasses RLS) to insert the first admin profile. This is documented at the bottom of schema.sql.

### Service role vs anon vs publishable key in API routes

- **Browser/Server components**: Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - respects RLS
- **API routes writing jobs/caches**: Use `SUPABASE_SECRET_KEY` (service role) - bypasses RLS
- The schema comment confirms: "Only server (service role) inserts/updates jobs via API routes"


## Vitest Setup

### Packages to install

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
```

### vitest.config.mts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

`vite-tsconfig-paths` handles the `@/*` path alias from tsconfig.json so tests resolve `@/lib/utils` etc. correctly.

### package.json test scripts

```json
"test": "vitest",
"test:run": "vitest run"
```

### Mocking patterns for Next.js modules

```typescript
// Mock next/navigation in tests
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  redirect: vi.fn(),
  usePathname: () => '/',
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}))

// Mock Supabase client in tests
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => ({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } })),
    },
    from: vi.fn(() => ({ select: vi.fn(), insert: vi.fn(), update: vi.fn() })),
  })),
}))
```

### Limitation: async Server Components

Vitest does NOT support testing async Server Components directly. Options:
- Unit test pure logic functions (adapters, validators, utils)
- Unit test synchronous Client Components with RTL
- Integration test async Server Components via E2E (Phase 8)

For Phase 1, focus Vitest on: utility functions, auth helpers, form validation logic.


## Dark Theme / shadcn Configuration

### What's already set up

The project already has a complete dark theme configured. From `globals.css`:
- Both `:root` (light) and `.dark` (dark) CSS variable sets are defined
- Color palette is blue-toned (oklch values in the 220-225 hue range)
- `tw-animate-css` is imported for animations
- `@import "shadcn/tailwind.css"` is present (new Tailwind v4 + shadcn pattern)
- `@custom-variant dark (&:is(.dark *))` is set for dark variant

### Tailwind v4 + shadcn

The project uses Tailwind v4 (`tailwindcss: ^4`). In Tailwind v4, there is no `tailwind.config.js` - configuration is done in CSS via `@theme inline` and CSS custom properties. This is already set up correctly.

`components.json` shows style `"radix-nova"` - this is the shadcn preset that was applied. Dark mode variables are fully defined.

### Enabling dark mode by default

The `layout.tsx` currently renders `<html lang="en" className={...}>` without a `dark` class. To force dark mode, add `dark` to the html className:

```tsx
<html lang="en" className={cn("dark font-sans", inter.variable)}>
```

This makes the app always dark. The CSS custom variant `(&:is(.dark *))` will apply dark variables from the `.dark` selector.

### shadcn components needed for Phase 1

Install these via `npx shadcn@latest add`:
- `button` - login form, nav actions
- `input` - login form fields
- `label` - form labels
- `card` - login page card
- `dropdown-menu` - user avatar menu
- `avatar` - user avatar in nav
- `separator` - nav dividers
- `form` (includes react-hook-form) - login form validation

All components will be added to `src/components/ui/`.


## File Structure Plan

Complete file tree for Phase 1:

```
src/
├── app/
│   ├── globals.css                    # EXISTS - add dark class to html
│   ├── layout.tsx                     # EXISTS - update: dark class, metadata
│   ├── page.tsx                       # MODIFY - redirect to app or login (temp)
│   ├── login/
│   │   └── page.tsx                   # NEW - login form page
│   └── (app)/                         # NEW - route group for auth'd routes
│       ├── layout.tsx                 # NEW - app shell (nav + content)
│       └── admin/
│           └── layout.tsx             # NEW - admin guard layout
├── components/
│   ├── ui/                            # NEW - shadcn components (button, input, etc.)
│   └── nav/
│       ├── top-nav.tsx                # NEW - top navigation bar
│       └── user-menu.tsx             # NEW - user avatar dropdown
├── lib/
│   ├── utils.ts                       # EXISTS
│   └── supabase/
│       ├── client.ts                  # NEW - createBrowserClient
│       ├── server.ts                  # NEW - createServerClient
│       ├── server-admin.ts            # NEW - service role client
│       └── proxy.ts                   # NEW - updateSession helper
├── types/
│   └── database.ts                    # NEW - Supabase generated types (optional, can use any)
└── proxy.ts                           # NEW - Next.js 16 proxy (was middleware.ts)

Root:
├── vitest.config.mts                  # NEW
├── src/__tests__/                     # NEW - test directory
│   └── example.test.ts               # NEW - smoke test
```

### Route group strategy

`(app)` route group wraps all authenticated routes. Its `layout.tsx` renders the nav shell. The proxy handles the redirect - the layout can assume the user is authenticated.

### Current layout.tsx issues to fix

The existing `layout.tsx` imports `Geist` and `Geist_Mono` but only uses `Inter`. Clean this up. Also update metadata title to "Job Catchr".


## Validation Architecture

### How to verify this phase works

**1. Schema migration verification**
- After running schema.sql, use Supabase MCP `supabase_list_tables` to confirm all 9 tables exist
- Check RLS is enabled: `supabase_execute_sql` with `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`
- Verify `pg_trgm` extension: `SELECT * FROM pg_extension WHERE extname = 'pg_trgm'`
- Insert test admin profile and verify RLS policies work

**2. Auth flow manual checks**
- Navigate to `/` unauthenticated -> should redirect to `/login`
- Login with valid credentials -> should redirect to `/`
- Navigate to `/login` while authenticated -> should redirect to `/`
- Navigate to `/admin` as non-admin -> should redirect to `/`
- Navigate to `/admin` as admin -> should render admin page

**3. Supabase client verification**
- Server Component: call `createClient()` from `@/lib/supabase/server`, call `getUser()`, assert user object returned
- Browser Component: call `createClient()` from `@/lib/supabase/client`, confirm singleton works

**4. Vitest smoke test**
```typescript
// src/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
})
```

**5. Build verification**
```bash
npm run build
```
Should pass with no TypeScript errors before moving to Phase 2.

### Known risks

- **RLS policy recursion**: `is_admin()` queries `profiles` which has RLS enabled. This is fine because `is_admin()` is `SECURITY DEFINER` - it runs as the function owner (postgres), not the calling user.
- **Cookie size**: Supabase JWT tokens can be large. Monitor if approaching 4KB cookie limit.
- **proxy.ts vs middleware.ts**: The Supabase docs and examples still show `middleware.ts`. Since this project uses Next.js 16.1.6, use `proxy.ts` with `export function proxy()`. The matcher config syntax is identical.

---

## RESEARCH COMPLETE
