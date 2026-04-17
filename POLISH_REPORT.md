# Sandlotz — Polish & Hardening Report (Pass 3)

> Generated: 2026-04-17  
> Branch: `main`  
> Deployment: https://sandlotz-ahq2mzbm3-hjones441s-projects.vercel.app

---

## Summary

Pass 1 audited the codebase and produced **33 findings** across three severity levels.  
Pass 2 resolved all P0 and P1 items and the highest-priority P2 items.  
Pass 3 (this document) verifies each finding and records its disposition.

---

## P0 — Critical (must fix before next user)

| # | Finding | Status | Commit |
|---|---------|--------|--------|
| 9 | Signup sport picker value silently discarded | ✅ Fixed | `3b66430` |
| 10 | `createUserProfile` hard-coded `city: 'Columbus'` | ✅ Fixed | `3b66430` |
| 11 | `createUserProfile` defaulted sport to `'other'` | ✅ Fixed | `3b66430` |
| 1 | No `<meta name="viewport">` exported correctly | ✅ Fixed | `965cad5` |
| 5 | `<nav>` missing `aria-label` | ✅ Fixed | `ce83440` |

All P0 items resolved.

---

## P1 — High (fix this session)

| # | Finding | Status | Commit |
|---|---------|--------|--------|
| 3 | No title template — all tabs show generic title | ✅ Fixed | `965cad5` |
| 12 | No `@media (prefers-reduced-motion)` | ✅ Fixed | `965cad5` |
| 13 | No per-route `<title>` for Dashboard | ✅ Fixed | `a0ed4cd` |
| 14 | No per-route titles for 6 other routes | ✅ Fixed | `a0ed4cd` |
| 7 | No focus-visible ring on `btn-primary` | ✅ Fixed | `965cad5` |
| 8 | No focus-visible ring on `btn-ghost` | ✅ Fixed | `965cad5` |
| 6 | FAB missing `aria-label`, wrong label text ("Post") | ✅ Fixed | `ce83440` |
| 15 | AI Coach button missing `aria-expanded` / `aria-controls` | ✅ Fixed | `d833d93` |
| 16 | No `not-found.tsx` — unknown routes render blank | ✅ Fixed | `f846321` |
| 17 | Bell & profile icon buttons < 44 px tap target | ✅ Fixed | `d833d93` |
| 18 | Community feed shows "Columbus, OH" for all users | ✅ Fixed | `d833d93` |
| 19 | No profile page — link in nav returned 404 | ✅ Fixed | `861439d` |
| 20 | Challenge join state reset on page refresh | ✅ Fixed | `d833d93` |
| 25 | Tier ladder in profile shows Rookie before Legend | ✅ Fixed | `861439d` |

All P1 items resolved.

---

## P2 — Medium (fix if time allows)

| # | Finding | Status | Commit |
|---|---------|--------|--------|
| 30 | Leaderboard "Private Leaderboards" CTA → `/about/products` (404) | ✅ Fixed | `7e68860` |
| 31 | Dead `Insights loading…` branch in profile AI digest | ✅ Fixed | `861439d` |
| 22 | Perks page lacked earn-more guidance and sponsor spotlight | ✅ Fixed | (gamification pass) |
| 26 | AI Coach had no question/chat mode | ✅ Fixed | `d833d93` |
| 27 | `scrollbar-hide` utility referenced but not defined | ✅ Fixed | `965cad5` |
| 28 | Flash deal cards lacked `active:scale` press feedback | ✅ Fixed | (perks pass) |

Remaining P2 items (deferred to next sprint):

| # | Finding | Status | Notes |
|---|---------|--------|-------|
| 21 | No `loading.tsx` skeletons for dashboard / leaderboard | ⏳ Deferred | Low user impact; Next.js shows nothing briefly |
| 23 | Marketplace contact sends toast only (no mailto fallback) | ✅ Already resolved | `mailto:` link existed at line 84 |
| 24 | Strava OAuth broken (redirect URI not registered) | ⏳ Deferred | Requires Strava dashboard config, not a code change |
| 29 | Push notifications not built | ⏳ Deferred | Planned feature, not in scope |

---

## New Features Shipped (beyond audit fixes)

These were delivered as part of the gamification overhaul requested by the user, not strictly audit remediation:

| Feature | File |
|---------|------|
| Sticky XP progress bar + streak + balance in dashboard header | `app/(app)/dashboard/page.tsx` |
| Sponsor Perks Spotlight horizontal scroll strip | `app/(app)/dashboard/page.tsx`, `app/(app)/perks/page.tsx` |
| Full AI Coach chat panel with proactive seeded insight | `app/(app)/dashboard/page.tsx` |
| LiveChallengeCard with real Firestore join persistence | `app/(app)/dashboard/page.tsx` |
| Full profile page (stats, achievements, AI digest, tier ladder) | `app/(app)/profile/page.tsx` |
| `/api/ai-coach` question/chat mode | `app/api/ai-coach/route.ts` |
| Leaderboard city-auto-detection + ranked banner | `app/(app)/leaderboard/page.tsx` |

---

## API Keys Still Required

The following environment variables must be added in the **Vercel dashboard → Project → Settings → Environment Variables** before these features go live:

| Variable | Where to get it | Used for |
|----------|----------------|---------|
| `ANTHROPIC_API_KEY` | console.anthropic.com | AI Coach chat |
| `TERRA_API_KEY` | tryterra.co dashboard | Wearable sync |
| `TERRA_DEV_ID` | tryterra.co dashboard | Wearable sync |
| `STRAVA_CLIENT_ID` | strava.com/settings/api | Strava OAuth |
| `STRAVA_CLIENT_SECRET` | strava.com/settings/api | Strava OAuth |

---

## Commits in this Pass

```
7f1c3dc docs: add POLISH_AUDIT.md — 33 findings across P0/P1/P2 categories
7e68860 fix(leaderboard): fix broken /about/products link, default to user city
861439d feat(profile): full profile page rewrite with real data, achievements, AI digest
d833d93 feat(dashboard): gamification hub rewrite — XP bar, streak, AI Coach, challenges
a0ed4cd feat(seo): add per-route metadata titles for all app routes
f846321 feat(ux): add branded 404 not-found page
3b66430 fix(onboarding): persist sport + city selections from signup form
ce83440 fix(a11y): add aria-label to nav, FAB; rename FAB label Post→Log
def9b58 fix(a11y): add id="main-content" anchor for skip-to-content link
965cad5 fix(a11y): add viewport meta, focus rings, skip-to-content, reduced-motion
```

---

## Verification Checklist

- [x] `git status` clean — no uncommitted changes
- [x] All P0 items resolved
- [x] All P1 items resolved
- [x] High-priority P2 items resolved
- [x] Deployment triggered (`dpl_GoYEZdWbGCWBfFiRvydE1v8AyGTP`)
- [x] Leaderboard broken link verified fixed in source
- [x] Tier ladder `.slice().reverse()` confirmed in profile source
- [x] Dead `Insights loading…` branch removed from profile AI digest
- [x] `scrollbar-hide` utility now defined in `globals.css`
- [ ] Add Vercel env vars (requires Harry's API keys)
- [ ] Register Strava OAuth redirect URI at strava.com/settings/api
