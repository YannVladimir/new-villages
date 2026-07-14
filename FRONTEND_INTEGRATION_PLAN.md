# Connecting the OneVillage Frontend to the Real Backend — Analysis & Plan

## Part 1 — Analysis

### 1.1 Current frontend state
The frontend (`frontend/`) is a fully mocked prototype: Zustand (`useStore.ts`) holds a fake `currentUser` set directly by `Register.tsx`/`Login.tsx` with no network call, every page imports static arrays from `data/mockData.ts` / `data/mockNotifications.ts`, and there is **no route protection at all** — `/dashboard`, `/admin`, `/leader-dashboard` are all reachable without being "logged in." No HTTP client (axios/fetch wrapper) or server-state library (React Query/SWR) exists yet — `package.json` only has UI/animation deps (Zustand, React Router, Framer Motion, Recharts, react-hook-form, zod).

### 1.2 What the backend already provides
Everything documented in `BACKEND_PLAN.md` is implemented and verified live: JWT auth (access token + httpOnly refresh cookie), the terms-acceptance gate (409 `TERMS_UPDATE_REQUIRED`), communities/events/messaging/notifications/moderation/subscriptions/admin. CORS is already configured for `http://localhost:5173` (Vite's default), so no backend change is needed just to allow requests from the frontend dev server.

### 1.3 Concrete mismatches found (frontend mock shape vs. real backend DTO)
| Concept | Frontend mock field | Backend field | Fix |
|---|---|---|---|
| User name | `name` | `fullName` | Rename in frontend types |
| Avatar | `avatar` | `avatarUrl` | Rename |
| Community membership | `isJoined: boolean` | `membershipState: "NONE"\|"JOINED"\|"PENDING_REQUEST"` | Replace boolean checks; handle the pending-request state (private communities) in the Join button |
| Event date/time | `date: "Oct 28, 2026"`, `time: "6:00 PM"` (pre-formatted strings) | `startAt: <ISO Instant>` | Add a date-formatting util; derive both display strings from one field |
| Notification timestamp | `timestamp: "2 mins ago"` (pre-formatted) | `createdAt: <ISO Instant>` | Add a relative-time util (e.g. a small `formatRelative()` helper — no need for a new dependency) |
| Conversation shape | `{name, avatar, time, unread, role}` | `{otherUserName, otherUserAvatar, lastMessageAt, unreadCount, otherUserRole}` | Rename throughout `Messaging.tsx` |

### 1.4 Real gaps this exposed that need a small backend change too
1. **Admin subscriptions list has no user identity.** `AdminSubscriptionController` currently reuses the personal `SubscriptionResponse` DTO (`id, plan, status, currentPeriodEnd`) — fine for "my subscription," useless for an admin table that needs to show *whose* subscription it is. Needs a new `AdminSubscriptionResponse` with `userId/userName/email` + `createdAt`.
2. **No "change password while logged in" endpoint.** Only the forgot-password (email-token) flow exists. The Settings → Security tab needs `PATCH /api/users/me/password { currentPassword, newPassword }`.
3. **No backend concept of a community "activity feed."** Dashboard's mock "Recent Activity" section (posts like *"Just published details for our next meetup!"*) has no corresponding entity or endpoint — this was never in the MVP page list.

**Decisions made:**
- Build a real activity-feed feature: a new `community_posts` entity/module (`CommunityPost`: id, communityId, authorId, body, createdAt). This also backs `CommunityDetail.tsx`'s "Feed" tab, which was equally mocked — one feature serves both screens. Endpoints: `POST /api/communities/{id}/posts` (member-only), `GET /api/communities/{id}/posts` (single community), `GET /api/posts/feed` (aggregated across all communities the current user has joined — powers the Dashboard).
- Remove the dev Role Switcher entirely — real roles now come from the backend.
- Stripe keys aren't available yet — Phase 7 (Subscriptions) stays stubbed/last until you have them.

I'll make the backend changes (the two small DTO/endpoint fixes plus the new posts module) as part of Phase 0, since they block real pages rather than being a "someday" item.

---

## Part 2 — The Plan

### Phase 0 — Foundation (do this first, nothing else works without it)
1. **Add two dependencies**: `@tanstack/react-query` (server-state caching/loading/error handling — replaces every page's fake `setTimeout` loading state with a real one) and nothing else; stick with the native `fetch` API wrapped in one small typed client rather than adding axios.
2. **`frontend/.env` / `.env.example`**: `VITE_API_BASE_URL=http://localhost:8080`.
3. **`src/lib/apiClient.ts`** — a single fetch wrapper that:
   - Prefixes `VITE_API_BASE_URL`, sends `credentials: "include"` (so the httpOnly refresh cookie flows), attaches `Authorization: Bearer <accessToken>` from the auth store.
   - Parses the backend's `ApiErrorResponse` shape (`{code, message, fieldErrors}`) into a typed `ApiError` you can branch on (e.g. `code === "EMAIL_NOT_VERIFIED"`).
   - On a `401`, tries `POST /api/auth/refresh` once and retries the original request; if that also fails, clears the session and redirects to `/login`.
   - On a `409` with `code === "TERMS_UPDATE_REQUIRED"`, redirects to `/re-consent` from anywhere in the app — this is the frontend half of the `TermsGateFilter` design.
4. **Rewrite `useStore.ts`**: drop the mock `User` shape and the localStorage-persisted fake session. New shape holds `accessToken` (in-memory only, never persisted) + `user: UserResponse | null`, plus actions `login()`, `logout()`, `bootstrapSession()`. On app start, call `bootstrapSession()` which silently calls `/api/auth/refresh` (the cookie does the work) to restore a session across page reloads without ever storing the access token in localStorage.
5. **Route guards**: a `<RequireAuth>` wrapper (redirects to `/login` if no session) and `<RequireRole allow={['ADMIN']}>` for `/admin`, `<RequireRole allow={['COMMUNITY_LEADER']}>` for `/leader-dashboard`, etc. Wrap the relevant `<Route>` elements in `App.tsx`.
6. **Wire the Log Out button** in `Layout.tsx` (currently has no `onClick` at all) to call `logout()` (hits `POST /api/auth/logout`, clears store, navigates to `/login`).
7. **Backend-side additions**: the `AdminSubscriptionResponse` DTO fix, the `PATCH /api/users/me/password` endpoint, and the new `community_posts` module (entity, repository, service, controller, Flyway migration).
8. **Remove `RoleSwitcher`** (`components/dev/RoleSwitcher.tsx`) and its store field (`activeRolePreview`) entirely — every page that reads `activeRolePreview || currentUser?.role` goes back to just `currentUser?.role`.

### Phase 1 — Auth pages
`Register.tsx` → fetch `GET /api/terms/current` on mount instead of the hardcoded modal text, submit the real version string in `POST /api/auth/register`, navigate to `/verify-email` on success, surface `EMAIL_ALREADY_REGISTERED` inline on the email field.
`VerifyEmail.tsx` → if a `?token=` query param is present (from the emailed/console link), auto-call `GET /api/auth/verify-email`; otherwise show the "check your email" state with a working `POST /api/auth/resend-verification` button.
`Login.tsx` → real `POST /api/auth/login`; branch on `EMAIL_NOT_VERIFIED` (→ route to `/verify-email`) and `ACCOUNT_SUSPENDED` (→ inline error).
`ReConsent.tsx` → fetch current terms + `POST /api/terms/accept`; this page is now reached via the global 409 interceptor, not a manual link.

### Phase 2 — Read-heavy core pages (lower risk — mostly GETs)
`Dashboard.tsx` (`GET /api/communities/mine`, `GET /api/events?upcoming=true`, activity feed per your decision above), `CommunityDirectory.tsx` (3 tabs → 3 endpoints instead of client-side array filtering), `CommunityDetail.tsx`, `Events.tsx` / `EventDetail.tsx`, `NotificationsDrawer.tsx`.

### Phase 3 — Mutations
Join/leave a community, create-community request flow (`CreateCommunity.tsx`), RSVP, create event (`CreateEvent.tsx` needs a community/org picker limited to ones the user actually leads/owns), community invitations accept/decline. Use React Query mutations with cache invalidation (e.g., joining a community invalidates the `communities` and `communities/mine` queries).

### Phase 4 — Profile & Settings
`Profile.tsx`: real `PATCH /api/users/me`, real avatar upload (`POST /api/users/me/avatar`, multipart), "Selected Community" dropdown populated from the user's actual joined communities instead of 3 hardcoded options.
`Settings.tsx`: Security tab wired to the new change-password endpoint; Privacy tab's "Manage" button wired to `GET /api/users/me/blocked` + unblock; Danger Zone wired to `DELETE /api/users/me`. (2FA stays a "coming soon" no-op — genuinely out of scope.)

### Phase 5 — Messaging
Biggest UX change: the compose modal currently sends to fake hardcoded names ("Leader Sarah," "Maple Tech Admin"). Replace with a real picker — "Message the leader of [dropdown of my joined communities]" / "Message [dropdown of known organizations]" / "Message platform support" — calling `POST /api/conversations`. Since there's no WebSocket yet (per the backend's phased roadmap), poll `GET /api/conversations/{id}/messages` every ~5s while a thread is open, and poll `GET /api/conversations` every ~15s for the list/unread badge.

### Phase 6 — Leader Dashboard & Organization page
`LeaderDashboard.tsx`'s pending-requests array is currently hardcoded fake people — wire to `GET/POST /api/leader/communities/{id}/requests/...` and `GET .../analytics`. `OrganizationPage.tsx` needs a first-run "Create your organization page" flow for `ORGANIZATION`-role users who haven't called `POST /api/organizations` yet.

### Phase 7 — Subscriptions
Replace the custom card-entry form in `Subscription.tsx` with a real Stripe Checkout redirect: `POST /api/subscriptions/checkout-session` → `window.location.href = checkoutUrl`. On return, read the `?checkout=success` query param (matches `STRIPE_SUCCESS_URL` already configured in `application.yml`) and confirm via `GET /api/subscriptions/me`. **This phase needs real Stripe test-mode keys from you** (`STRIPE_SECRET_KEY`, `STRIPE_PRICE_LEADER`, `STRIPE_PRICE_ORGANIZATION`) — everything else can be tested without Stripe.

### Phase 8 — Admin Dashboard
The single largest page (7 mock arrays → 7 endpoint groups). Do this last since it's admin-only and least urgent for demoing the core product. Requires the `AdminSubscriptionResponse` fix from Phase 0.

### Phase 9 — Cleanup
Delete `data/mockData.ts` / `data/mockNotifications.ts` once nothing imports them, do a final pass removing any leftover `setTimeout`-based fake loading states, and a full manual walkthrough of every page in both light/dark and mobile/desktop (no frontend automated test suite exists yet — that's a reasonable follow-up but not a blocker here).

---

## Suggested execution order
Phases 0 → 1 are mandatory and sequential. Phases 2-8 are mostly independent of each other once 0-1 land. Phase 7 (Subscriptions) is deliberately last since it's blocked on Stripe keys you don't have yet — everything else does not depend on it.
