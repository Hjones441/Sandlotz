# Sandlotz — Polish Audit
_Generated during hardening pass. Severity: P0 = blocks launch · P1 = noticeable · P2 = nice-to-have._

---

## Bugs & Edge Cases

| # | File | Lines | Sev | Finding | Fix |
|---|------|-------|-----|---------|-----|
| 1 | `app/(auth)/signup/page.tsx` + `context/AuthContext.tsx` | 19,31 / 27,65 | **P0** | `signUp()` only accepts `(email, password, displayName)`. The sport picker on the signup form is rendered but its value is **never passed** to `createUserProfile`. Every user defaults to sport `'other'`. | Add `sport` param to `signUp()` signature and thread it through to `createUserProfile`. |
| 2 | `lib/firestore.ts` | 166 | **P0** | `createUserProfile` hardcodes `city: 'Columbus'` for every new user. Users outside Columbus will never appear on their city leaderboard. | Add `city` field to signup form (optional, free text) and pass it through. Fall back to empty string if omitted. |
| 3 | `app/(app)/dashboard/page.tsx` | AiCoachPanel | P1 | If `ANTHROPIC_API_KEY` is missing, API returns 503 but the UI silently shows "Connection issue" with no action path. | Show "AI Coach unavailable — check back soon" with a "Log Activity" fallback CTA. |
| 4 | `app/(app)/log-activity/page.tsx` | 583 | P1 | Activity preview images have `alt=""`. Screen readers announce these as decorative; they are content. | Use `alt="Activity photo preview"`. |
| 5 | `app/(app)/challenges/page.tsx` | handleJoin | P1 | After joining, the modal stays open showing "You're in!" but the card behind it still shows "Join Challenge" until the modal is closed and `joinStatus` map updates. | `setJoinStatus` is updated optimistically — verify the card re-renders on map change (it does, but the modal should auto-close after 1.5s). |

---

## Loading / Empty / Error States

| # | File | Sev | Finding | Fix |
|---|------|-----|---------|-----|
| 6 | All `app/(app)/` routes | P1 | No `loading.tsx` per route — Next.js shows blank during navigation. | Add minimal `loading.tsx` skeletons for `/dashboard` and `/leaderboard`. |
| 7 | `app/(app)/leaderboard/page.tsx` | P1 | Empty leaderboard state says "Log an activity to be the first!" but doesn't show which city is selected. Copy is confusing. | "No athletes in {city} yet. Be the first!" |
| 8 | `app/(app)/profile/page.tsx` | P2 | AI Digest "Insights loading…" fallback is shown when `!aiLoading && !aiInsight && acts.length > 0` — this state shouldn't be reachable after fetch completes. Shows stale UI. | Remove the dead "Insights loading…" branch; only show the fetch-error fallback. |

---

## Responsiveness & Mobile UX

| # | File | Lines | Sev | Finding | Fix |
|---|------|-------|-----|---------|-----|
| 9 | `app/layout.tsx` | 1 | **P0** | **No `<meta name="viewport">` in the root layout.** Without it, mobile Safari zooms out and the entire app looks broken. | Add `viewport` to the `metadata` export via Next.js `Viewport` export or manually in `<head>`. |
| 10 | `app/(app)/dashboard/page.tsx` | header buttons | P1 | Notification bell and avatar are `w-9 h-9` (36px) — below the 44px minimum tap target recommended by WCAG 2.5.5. | Increase to `w-11 h-11`. |
| 11 | `components/layout/AppHeader.tsx` | 19 | P1 | Back/left button is `w-8 h-8` (32px). | `w-11 h-11`. |
| 12 | `app/(app)/perks/page.tsx` | category filters | P2 | Filter chips are `px-4 py-2` — borderline on small phones. | Add `min-h-[44px]` or `py-2.5`. |

---

## Accessibility

| # | File | Sev | Finding | Fix |
|---|------|-----|---------|-----|
| 13 | `components/layout/AppNav.tsx` | **P0** | `<nav>` element has no `aria-label`. Screen readers announce "navigation" with no context. | `<nav aria-label="Main navigation">` |
| 14 | `app/(app)/dashboard/page.tsx` | P1 | Notification bell button has no `aria-label`. | `aria-label="Notifications"` |
| 15 | `app/(app)/profile/page.tsx` | P1 | Share button, Settings button, Logout button are icon-only with no `aria-label`. | Add `aria-label` to each. |
| 16 | `app/globals.css` | P1 | `btn-primary` and `btn-ghost` have no `:focus-visible` ring. Keyboard users can't see where focus is. | Add `focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-brand-purple-dark` to both classes. |
| 17 | `app/(app)/dashboard/page.tsx` | P1 | AI Coach toggle button has no `aria-expanded` attribute. | Add `aria-expanded={open}` and `aria-controls="ai-coach-panel"`. |
| 18 | All forms | P2 | Form inputs have placeholder text but many are missing explicit `<label>` elements. Placeholders disappear while typing. | Add visible or visually-hidden `<label>` for all form inputs. |
| 19 | All pages | P2 | No skip-to-main-content link for keyboard users. | Add `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>` in root layout. |

---

## Performance

| # | File | Sev | Finding | Fix |
|---|------|-----|---------|-----|
| 20 | All `app/(app)/` routes | P1 | No per-route `export const metadata` — all pages share the root title "Sandlotz App". Browser tab is uninformative; bad for SEO. | Add `export const metadata = { title: 'Dashboard · Sandlotz' }` etc. to each route. |
| 21 | `app/layout.tsx` | P1 | No `<meta name="description">` override per route. | Use `generateMetadata()` per route for key pages. |
| 22 | `app/(app)/challenges/page.tsx` | P2 | `getChallengeParticipant` is called for every challenge in a `Promise.all` loop — N+1 pattern. With many challenges, this issues many Firestore reads. | Batch with a single `where('uid', '==', uid)` query across all participations, then map. |
| 23 | `app/(app)/dashboard/page.tsx` | P2 | All three data fetches (`getUserActivities`, `getPerks`, `getChallenges`) run in one `Promise.all` — good. But perks and challenges are re-fetched on every mount, even if data is fresh. | Add a short TTL cache (30s in memory or `useSWR` pattern) for perks and challenges. |

---

## Visual Polish & Design Consistency

| # | File | Sev | Finding | Fix |
|---|------|-----|---------|-----|
| 24 | `app/(app)/dashboard/page.tsx` | P1 | Community feed is labeled "Community Activity" but is entirely mock data. New users may think these are real athletes and be confused when their own posts don't appear. | Add "(Preview — invite friends to build the feed)" sub-label, or clearly badge cards as "Sample". |
| 25 | `app/(app)/profile/page.tsx` | P1 | The tier ladder in "My Ranking" section shows tiers in array order. "Rookie" appears before "Legend" which looks like a demotion scale. | Reverse the order so Legend is at top, Rookie at bottom. |
| 26 | `app/(app)/perks/page.tsx` | P2 | Flash deal cards in the spotlight have a hover state but no active/press state. Feels unresponsive on mobile. | Add `active:scale-[0.98]` to the clickable divs. |
| 27 | All `app/(app)/` routes | P2 | The sticky header uses `bg-[#0e0825]/95` (hardcoded hex) while the layout uses `bg-[#0e0825]`. Should use a CSS variable or Tailwind token. | Migrate to `bg-brand-purple-dark/95`. |

---

## Copy & Microcopy

| # | File | Sev | Finding | Fix |
|---|------|-----|---------|-----|
| 28 | `components/layout/AppNav.tsx` | P1 | FAB sub-label says "Post" — but the action is to log an activity, not post content. Misleading. | Change to "Log" or "Add". |
| 29 | `app/(app)/dashboard/page.tsx` | P1 | Empty challenges state says "No active challenges" with no action. | Add "Check back weekly — new challenges drop every Monday" + "Browse Perks" CTA. |
| 30 | `app/(app)/leaderboard/page.tsx` | P2 | "Private Leaderboards" CTA links to `/about/products` which doesn't exist. | Link to `/perks` (Sandlotz Pro perk) or `mailto:partnerships@sandlotz.com`. |
| 31 | `app/(app)/profile/page.tsx` | P2 | "AI Performance Digest" disclaimer says "Not medical advice" — fine, but the wording is very clinical. | Soften: "For training inspiration only — always listen to your body." |

---

## Animations & Micro-interactions

| # | Sev | Finding | Fix |
|---|-----|---------|-----|
| 32 | P2 | No `prefers-reduced-motion` check. Framer Motion has `useReducedMotion()` hook. Users with vestibular disorders or motion sensitivity will see all animations. | Wrap `<motion.div>` transitions with conditional based on `useReducedMotion()`. |
| 33 | P2 | Perks Store grid items have `initial={{ opacity:0, y:8 }}` enter animation but no exit. When filtering, old items vanish abruptly. | Wrap grid in `AnimatePresence` with `mode="wait"`. |

---

## Out of scope — follow-ups
- Push notifications (requires FCM or web push setup)
- Perk fulfillment email (requires SMTP keys — Resend or Nodemailer with real creds)
- Strava OAuth connect flow (requires `STRAVA_CLIENT_ID` + `STRAVA_CLIENT_SECRET`)
- Terra fitness API integration (requires `TERRA_API_KEY` + `DEV_ID`)
- Real community feed (requires activity social graph / following system)
- Private leaderboards feature
- Challenge progress auto-tracking when activities are logged
- Marketplace sold/unsold management by seller
