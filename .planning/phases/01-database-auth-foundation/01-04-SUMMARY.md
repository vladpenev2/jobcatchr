---
phase: 1
plan: 04
title: "Auth proxy (proxy.ts + updateSession helper)"
status: complete
---

# Plan 04 Summary: Auth Proxy

## Tasks Completed

### 01-04-01: updateSession helper (src/lib/supabase/proxy.ts)
- Created `src/lib/supabase/proxy.ts` exporting `updateSession`
- Uses `createServerClient` from `@supabase/ssr` with full cookie bridging
- Calls `supabase.auth.getUser()` (validates JWT server-side, NOT getSession/getClaims)
- Redirects unauthenticated users to `/login` (except `/login` and `/auth` paths)
- Redirects authenticated users away from `/login` to `/`

### 01-04-02: proxy.ts entry point (src/proxy.ts)
- Created `src/proxy.ts` exporting `proxy` function (NOT `middleware` - Next.js 16 rename)
- Delegates to `updateSession`
- Matcher excludes `_next/static`, `_next/image`, `favicon.ico`, and static asset extensions

### 01-04-03: Unit tests (src/__tests__/proxy.test.ts)
- 5 test cases all passing
- Mocks `@supabase/ssr` createServerClient and `next/server` NextResponse
- Test cases: unauth redirect from `/`, unauth passthrough on `/login`, unauth passthrough on `/auth/callback`, auth redirect away from `/login`, auth passthrough on `/`

## Files Created/Modified

- `src/lib/supabase/proxy.ts` - updateSession helper
- `src/proxy.ts` - Next.js 16 proxy entry point
- `src/__tests__/proxy.test.ts` - unit tests
- `vitest.config.mts` - vitest configuration (jsdom, vite-tsconfig-paths)

## Verification

```
Tests: 5 passed (5)
```

## Must-Haves Checklist

- [x] src/lib/supabase/proxy.ts exports updateSession using getUser() (NOT getClaims/getSession)
- [x] src/proxy.ts exports `proxy` function (NOT `middleware`) with route matcher config
- [x] Unauthenticated users are redirected to /login
- [x] Authenticated users are redirected away from /login to /
- [x] /auth and /login paths are excluded from auth redirect
- [x] Static assets excluded via matcher config
- [x] Unit tests pass for redirect logic
