---
phase: 1
slug: database-auth-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.mts (Wave 0 installs) |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 0 | Vitest setup | infra | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | Schema migration | manual | Supabase MCP verify | N/A | ⬜ pending |
| 01-03-01 | 03 | 1 | Supabase clients | unit | `npx vitest run src/__tests__/supabase-clients.test.ts` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 1 | Proxy auth redirect | unit | `npx vitest run src/__tests__/proxy.test.ts` | ❌ W0 | ⬜ pending |
| 01-05-01 | 05 | 2 | Layout + nav | manual | Build + visual check | N/A | ⬜ pending |
| 01-05-02 | 05 | 2 | Login page | manual | Build + visual check | N/A | ⬜ pending |
| 01-06-01 | 06 | 2 | Admin guard | unit | `npx vitest run src/__tests__/admin-guard.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.mts` — vitest configuration with react plugin and path aliases
- [ ] `src/__tests__/utils.test.ts` — smoke test for cn utility
- [ ] Vitest dev dependencies installed

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Schema tables exist | DB setup | Requires live Supabase | Run `SELECT tablename FROM pg_tables WHERE schemaname='public'` via MCP |
| Auth redirect flow | Proxy works | Requires running app | Visit `/` unauthenticated, verify redirect to `/login` |
| Dark theme renders | UI correct | Visual check | Run `npm run dev`, verify dark background and correct colors |
| Login form works | Auth flow | Requires live Supabase | Enter email/password, verify login and redirect |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
