# OneVillage — Backend Analysis & Build Plan (Java Spring Boot)

## Part 1 — Analysis

### 1.1 What already exists
- **Frontend**: React + Vite + TS, fully built (`frontend/`), using Zustand + mock JSON data (`mockData.ts`, `mockNotifications.ts`) and localStorage persistence. No real API calls yet — this is the contract the backend must satisfy.
- **Requirements docs**: platform objective, roles, communities, messaging, events, subscriptions, moderation, notifications, security, admin dashboard (`NewVillage_Developer_Requirements_English_No_Title-4.pdf`) and a hard requirement around Terms-of-Use versioned acceptance (`NewVillage_Terms_Acceptance_Requirement-2.pdf`).
- **Additional spec detail** (from your ChatGPT screenshots): 4 roles — Regular Member, Community Leader, Organization, Administrator; registration fields (Full Name, Email, Password, Country, City, Language, Account Type); profile fields (Photo, Bio, City, Selected Community, Spoken Languages); pricing — Community Leader $10/month, Organization $20/month; Admin can view users, approve/reject leader applications, remove fake profiles, manage communities, manage subscription payments, review reports.

### 1.2 Key design decisions this plan makes (and why)
| Decision | Choice | Reason |
|---|---|---|
| Language/framework | Java 21 (LTS) + Spring Boot 3.3.x | Long-term support, modern Spring Security 6 + virtual threads available |
| Database | PostgreSQL 16 | Relational integrity for memberships/roles/reports; JSON columns available if needed; free-tier friendly on most hosts |
| Auth | Stateless JWT (short-lived access + rotating refresh token) | Matches an SPA frontend; scales horizontally; no server session state |
| Migrations | Flyway | Versioned, auditable schema changes — important given "regular backups" / data-integrity requirement |
| Real-time | Start with REST polling for MVP; add STOMP/WebSocket in a later phase | Requirements don't demand real-time chat on day 1; ship faster, upgrade later without breaking the contract |
| Payments | Stripe (Checkout + Billing + Webhooks) | Handles PCI compliance for you; supports CAD; well-documented Java SDK |
| Role model | Single `role` enum per account (MEMBER / COMMUNITY_LEADER / ORGANIZATION / ADMIN), promoted via approval workflows | Matches the frontend's registration UI (pick one role at signup) and the "Leader Applications" approval queue in the Admin mockup |
| Terms versioning | Dedicated `TermsVersion` + `UserTermsAcceptance` tables, server decides "current" version, never trusts client timestamp | This is an explicit, testable compliance requirement — must be provably correct |

### 1.3 Gaps between the frontend prototype and a real backend (things to resolve during build)
1. **Frontend's Subscription checkout is a fully custom card form.** Real Stripe integration typically uses Stripe Elements/Checkout redirect for PCI compliance — plan to swap the card fields for Stripe Elements when wiring this up (flag as a small frontend follow-up, not a backend blocker).
2. **"Leader Applications" vs "Create Community"** look like two separate flows in the mockups but are functionally the same event (a user requests to lead a new community). This plan unifies them into one `CommunityCreationRequest` entity so there's one approval pipeline, not two.
3. **Messaging "compose to Leader/Org/Admin"** needs a resolution rule server-side (e.g., "message the leader of my selected community", "message this specific org", "message platform support") — defined explicitly in section 2.4 below.
4. **Frontend has no auth token handling yet** — it stores a plain mock `User` object in Zustand. The API layer to be added to the frontend (separate follow-up) will need an HTTP client with token refresh interceptors.

---

## Part 2 — Domain Model

### 2.1 Core entities

| Entity | Key fields | Notes |
|---|---|---|
| `User` | id (UUID), fullName, email (unique), passwordHash, role (enum), country, city, preferredLanguage, bio, avatarUrl, accountStatus (ACTIVE/SUSPENDED/DEACTIVATED), emailVerified, selectedCommunityId (nullable FK), createdAt, updatedAt | |
| `UserLanguage` | userId, language | Simple join table for "Spoken Languages" (multi-select in Profile.tsx) |
| `TermsVersion` | id, version (e.g. "1.0.0"), bodyUrlOrText, publishedAt, isCurrent | Only one row `isCurrent=true` at a time |
| `UserTermsAcceptance` | id, userId, termsVersionId, acceptedAt (server-set), ipAddress | Append-only audit trail — never update, only insert |
| `Community` | id, name, description, category, visibility (PUBLIC/PRIVATE), coverImageUrl, iconName, color, status (PENDING/ACTIVE/REJECTED/ARCHIVED), leaderId (FK User), createdAt | `memberCount` derived via count query or a cached counter column |
| `CommunityCreationRequest` | id, applicantId, proposedName, description, category, city, status (PENDING/APPROVED/REJECTED), reviewedBy, reviewedAt, createdAt | This is the "Leader Application" queue in Admin |
| `CommunityMembership` | id, communityId, userId, roleInCommunity (LEADER/MEMBER), status (JOINED/PENDING_REQUEST), joinedAt | Join/leave/pending-approval logic lives here |
| `CommunityInvitation` | id, communityId, invitedEmailOrUserId, invitedBy, status (PENDING/ACCEPTED/DECLINED), createdAt | Powers the "Invitations" tab |
| `Organization` | id, ownerUserId, name, description, servicesJson/text, logoUrl, contactEmail, status | One org profile per organization-role user |
| `Event` | id, communityId (nullable), organizationId (nullable), title, description, type (DINNER/MEETING/WORKSHOP/SOCIAL/SUPPORT_NETWORKING), startAt, isOnline, location/onlineLink, coverImageUrl, createdBy, createdAt | |
| `EventRsvp` | id, eventId, userId, status (GOING/INTERESTED/DECLINED), respondedAt | |
| `Conversation` | id, createdAt | Direct 1:1 for MVP |
| `ConversationParticipant` | conversationId, userId | |
| `Message` | id, conversationId, senderId, body, sentAt, readAt | |
| `BlockedUser` | id, blockerId, blockedId, createdAt | Enforced at message-send time |
| `Notification` | id, recipientId, type (MESSAGE/INVITATION/EVENT/ANNOUNCEMENT/SYSTEM), title, description, relatedEntityId, isRead, createdAt | |
| `Report` | id, reporterId, targetType (USER/COMMUNITY/MESSAGE), targetId, reason, details, status (OPEN/REVIEWING/RESOLVED), resolvedBy, resolvedAt, createdAt | |
| `Subscription` | id, userId, plan (FREE/COMMUNITY_LEADER/ORGANIZATION), status (ACTIVE/PAST_DUE/CANCELLED), stripeCustomerId, stripeSubscriptionId, currentPeriodEnd, createdAt | Source of truth for feature-gating |
| `Payment` | id, subscriptionId, amount, currency, status, stripeInvoiceId, paidAt | |
| `ActivityLog` | id, actorId (admin), action, targetType, targetId, description, createdAt | Feeds the Admin "Activity Logs" screen |

### 2.2 Role → capability matrix (mirrors requirements doc + mockups)

| Capability | Member | Community Leader | Organization | Admin |
|---|---|---|---|---|
| Join/leave/search communities | ✅ | ✅ | ✅ | — |
| Create community (request) | ✅ (becomes leader if approved) | ✅ | — | — |
| Manage own community (invite, approve join requests, post announcements/events) | — | ✅ | — | — |
| Create org page, publish announcements, contact communities | — | — | ✅ | — |
| Message leader/org/admin, block, report | ✅ | ✅ | ✅ | — |
| View all users, suspend/reinstate, remove profiles | — | — | — | ✅ |
| Approve/reject leader applications | — | — | — | ✅ |
| Manage communities (remove/feature) | — | — | — | ✅ |
| Manage subscriptions/payments | — | — | — | ✅ |
| Review reports, moderation actions, activity log | — | — | — | ✅ |

### 2.3 Terms-acceptance flow (compliance-critical — implement exactly)
1. `GET /api/terms/current` returns the current `TermsVersion` (version + content).
2. On register, client must have already fetched the current version and shows it in-modal (matches `Register.tsx`'s "Terms opened" / "Privacy opened" tracked state).
3. `POST /api/auth/register` requires `acceptedTermsVersion` in the payload; server **rejects** if it doesn't match the currently-published version (prevents stale/spoofed acceptance).
4. Server stamps `acceptedAt` itself (never trusts a client-supplied timestamp) and stores `UserTermsAcceptance` as an **append-only** record — this is the audit trail regulators/lawyers would ask for.
5. A `TermsGateFilter` (Spring `OncePerRequestFilter`) runs on every authenticated request except a small whitelist (`/api/terms/**`, `/api/auth/**`, `/api/terms/accept`). If the user's latest accepted version ≠ current version, respond `409 Conflict` with error code `TERMS_UPDATE_REQUIRED`. Frontend already has a matching `/re-consent` page to route to on that exact error code.
6. `POST /api/terms/accept` lets a logged-in user accept a newly-published version (used by the re-consent screen).
7. Publishing a new Terms version is an admin-only action (`POST /api/admin/terms`) that flips `isCurrent` and immediately makes every user's next request trigger the gate.

### 2.4 Messaging resolution rules
- **Message a Community Leader**: client sends `{ type: "LEADER", communityId }` → server resolves to that community's `leaderId`, creates/reuses a `Conversation` between the two users.
- **Message an Organization**: client sends `{ type: "ORG", organizationId }` → resolves to `Organization.ownerUserId`.
- **Message Admin/Support**: client sends `{ type: "ADMIN" }` → resolves to a fixed "platform support" queue — for MVP, route to any ADMIN user or a dedicated `SUPPORT` system inbox table (simplest: a well-known support user account seeded at startup).
- Before creating a conversation or sending a message, check `BlockedUser` in both directions and reject with `403` if blocked.

---

## Part 3 — API Surface (grouped, mapped to existing frontend pages)

### Auth & Account (`Register.tsx`, `Login.tsx`, `VerifyEmail.tsx`, `ReConsent.tsx`)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/verify-email?token=...
POST   /api/auth/resend-verification
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/terms/current
POST   /api/terms/accept
```

### Users / Profile (`Profile.tsx`, `Settings.tsx`)
```
GET    /api/users/me
PATCH  /api/users/me
POST   /api/users/me/avatar
GET    /api/users/{id}
POST   /api/users/{id}/block
DELETE /api/users/{id}/block
GET    /api/users/me/blocked
DELETE /api/users/me            (deactivate account)
```

### Communities (`CommunityDirectory.tsx`, `CommunityDetail.tsx`, `CreateCommunity.tsx`)
```
GET    /api/communities?query=&category=&page=
GET    /api/communities/mine
GET    /api/communities/invitations
GET    /api/communities/{id}
POST   /api/communities                (creates a CommunityCreationRequest, status PENDING)
POST   /api/communities/{id}/join
POST   /api/communities/{id}/leave
GET    /api/communities/{id}/members
POST   /api/communities/{id}/invite
POST   /api/invitations/{id}/accept
POST   /api/invitations/{id}/decline
```

### Community Leader Dashboard (`LeaderDashboard.tsx`)
```
GET    /api/leader/communities/{id}/requests
POST   /api/leader/communities/{id}/requests/{userId}/approve
POST   /api/leader/communities/{id}/requests/{userId}/reject
GET    /api/leader/communities/{id}/analytics
```

### Organizations (`OrganizationPage.tsx`)
```
GET    /api/organizations/{id}
POST   /api/organizations
PATCH  /api/organizations/{id}
```

### Events (`Events.tsx`, `CreateEvent.tsx`)
```
GET    /api/events?communityId=&upcoming=true&page=
GET    /api/events/{id}
POST   /api/events
PATCH  /api/events/{id}
DELETE /api/events/{id}
POST   /api/events/{id}/rsvp
```

### Messaging (`Messaging.tsx`)
```
GET    /api/conversations
POST   /api/conversations                 ({ type, communityId|organizationId, initialMessage })
GET    /api/conversations/{id}/messages?page=
POST   /api/conversations/{id}/messages
```
*(Phase 5: add `/ws` STOMP endpoint for live delivery + typing/read receipts.)*

### Notifications (`NotificationsDrawer.tsx`)
```
GET    /api/notifications
PATCH  /api/notifications/{id}/read
PATCH  /api/notifications/read-all
```

### Reports (`GlobalReportModal.tsx`)
```
POST   /api/reports          ({ targetType, targetId, reason, details })
```

### Subscriptions (`Subscription.tsx`)
```
GET    /api/subscriptions/plans
POST   /api/subscriptions/checkout-session
POST   /api/subscriptions/webhook          (Stripe signature-verified, unauthenticated)
GET    /api/subscriptions/me
POST   /api/subscriptions/cancel
```

### Admin (`AdminDashboard.tsx` — all routes require `ROLE_ADMIN`)
```
GET    /api/admin/stats/overview
GET    /api/admin/users?search=&page=
PATCH  /api/admin/users/{id}/suspend
PATCH  /api/admin/users/{id}/reinstate
GET    /api/admin/leader-applications
POST   /api/admin/leader-applications/{id}/approve
POST   /api/admin/leader-applications/{id}/reject
GET    /api/admin/communities
DELETE /api/admin/communities/{id}
GET    /api/admin/reports
POST   /api/admin/reports/{id}/resolve     ({ action: REMOVE_CONTENT|SUSPEND_USER|DISMISS })
GET    /api/admin/subscriptions
GET    /api/admin/logs
POST   /api/admin/terms                    (publish a new Terms version)
```

---

## Part 4 — Security Design

- **Password storage**: BCrypt (strength 12).
- **Auth tokens**: JWT access token (~15 min expiry) + rotating refresh token stored as an httpOnly, Secure, SameSite=strict cookie (~30 days). Stateless `SecurityFilterChain`, no server-side session.
- **Authorization**: method-level `@PreAuthorize("hasRole('ADMIN')")` etc. on every controller method; never rely on the frontend to hide a button.
- **CORS**: explicit allow-list of the frontend origin(s), credentials enabled for the refresh cookie.
- **Rate limiting**: bucket4j (or a simple in-memory limiter) on `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password` to blunt brute-force/credential-stuffing.
- **Input validation**: Bean Validation (`@NotBlank`, `@Email`, `@Size`, custom `@ValidPassword`) on every request DTO, centralized `@ControllerAdvice` → consistent JSON error shape `{ code, message, fieldErrors }`.
- **Common attack protections**: parameterized queries via JPA (no string-concatenated SQL), Jackson strict deserialization, file-upload validation (mime-type + size limits) for avatar/cover images, CSRF disabled only because auth is header/cookie-JWT-based (documented decision, not an oversight).
- **HTTPS**: terminated at the reverse proxy/load balancer in every environment; local dev can run plain HTTP behind a documented flag.
- **Backups**: managed Postgres automated daily backups + weekly `pg_dump` export to object storage as a second copy — infra-level, not application code, but must be set up before go-live per the requirements doc.
- **Audit trail**: every admin moderation action (suspend, remove, resolve report, approve/reject) writes an `ActivityLog` row inside the same transaction as the action.

---

## Part 5 — Payments (Stripe)

1. Create two Stripe **Products/Prices**: `Community Leader – $10/month CAD`, `Organization – $20/month CAD`.
2. `POST /api/subscriptions/checkout-session` creates a Stripe Checkout Session for the selected price and returns the redirect URL (replaces the current mock card form in `Subscription.tsx` with a Stripe-hosted page, or Stripe Elements embedded — pick one; Checkout redirect is the faster integration).
3. Stripe webhook (`checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`) updates the local `Subscription`/`Payment` tables — **local DB is the source of truth for feature-gating**, never call Stripe synchronously on every request.
4. Successful subscription flips the user's `role` to `COMMUNITY_LEADER` or keeps `ORGANIZATION` capabilities unlocked (design decision: role upgrade is subscription-gated for Leader/Org tiers, matching the requirements doc's "future Premium" language).
5. Cancellation: `POST /api/subscriptions/cancel` calls Stripe to cancel at period end, webhook confirms and downgrades role at `currentPeriodEnd`.

---

## Part 6 — Suggested Package Structure

```
com.onevillage.backend
├── config/            SecurityConfig, CorsConfig, OpenApiConfig, WebSocketConfig (later), StripeConfig
├── auth/               AuthController, JwtService, TokenRefreshService, TermsGateFilter
├── user/               UserController, UserService, User entity, UserRepository, DTOs
├── terms/              TermsController, TermsVersion, UserTermsAcceptance
├── community/          CommunityController, CommunityService, Community, CommunityMembership, CommunityCreationRequest
├── organization/        OrganizationController, Organization
├── event/               EventController, Event, EventRsvp
├── messaging/           ConversationController, Conversation, Message, BlockedUser
├── notification/        NotificationController, Notification, NotificationDispatcher
├── moderation/          ReportController, Report, ActivityLog
├── subscription/        SubscriptionController, Subscription, Payment, StripeWebhookController
├── admin/               AdminUserController, AdminCommunityController, AdminReportController, AdminStatsController
├── common/              GlobalExceptionHandler, ApiError, PagedResponse, AuditListener
└── OneVillageApplication.java
```

---

## Part 7 — Non-Functional / Engineering Practices

- **API docs**: springdoc-openapi → Swagger UI at `/swagger-ui.html`, kept in sync automatically from annotated controllers.
- **Pagination**: Spring Data `Pageable` on every list endpoint (users, communities, reports, messages, logs).
- **Testing**: JUnit 5 + Mockito for services; `@DataJpaTest` for repositories; Testcontainers (real Postgres in Docker) for integration tests of critical flows (register→terms-gate, join-community, report→resolve, Stripe webhook handling with a mocked Stripe client).
- **Logging**: SLF4J + structured JSON logs in prod (easier ingestion by any log aggregator later); no PII (passwords, tokens) ever logged.
- **CI**: GitHub Actions — `mvn verify` (build + tests) on every PR; separate job builds & pushes a Docker image on merge to main.
- **Local dev**: `docker-compose.yml` with `app + postgres + mailhog` (mailhog to preview verification emails without a real SMTP provider).
- **Migrations**: Flyway scripts under `src/main/resources/db/migration`, one file per change, never edit a shipped migration.

---

## Part 8 — Phased Roadmap

| Phase | Goal | Key deliverables |
|---|---|---|
| **0. Bootstrap** | Project skeleton runs | Spring Boot init, Postgres + Flyway wired, Docker Compose, CI pipeline green, Swagger UI live |
| **1. Auth, Users, Terms** | Registration → login → terms-gate works end-to-end | `User`, `TermsVersion`, `UserTermsAcceptance`, JWT auth, email verification, `TermsGateFilter`, profile CRUD |
| **2. Communities** | Directory, join/leave, creation requests | `Community`, `CommunityMembership`, `CommunityCreationRequest`, invitations, search/filter |
| **3. Leader & Org tools + Events** | Role-specific dashboards functional | Leader approve/reject requests, announcements, `Organization` CRUD, `Event` + RSVP |
| **4. Messaging, Notifications, Moderation** | Users can talk, get notified, block/report | `Conversation`/`Message` (REST polling), `Notification`, `BlockedUser`, `Report` + resolution workflow, `ActivityLog` |
| **5. Admin Dashboard + Subscriptions** | Full admin control plane, real billing | Admin stats/users/communities/reports/logs endpoints, Stripe products/checkout/webhooks, role upgrades on payment |
| **6. Hardening & Real-time upgrade** | Production-ready | Rate limiting, security review, load testing, optional WebSocket upgrade for live chat/notifications, backup strategy verified, deploy to chosen host |

Each phase should end with: integration tests green, Swagger docs updated, and a short manual smoke test against the already-built frontend (swap its mock store calls for real fetches page-by-page, starting with Auth).

---

## Part 9 — Open Questions to Confirm Before Coding
1. **Hosting target** — Railway/Render/Fly.io (fast, cheap) vs AWS/Azure (more control, more setup)? This affects the CI/CD deploy step in Phase 0/6.
2. **Email provider** — SendGrid, AWS SES, or Postmark for verification/notification emails?
3. **File storage for avatars/cover images** — S3-compatible bucket (AWS S3, Cloudflare R2, Supabase Storage) recommended over storing binaries in Postgres.
4. **Do you want real-time chat for the MVP demo, or is REST polling acceptable until Phase 6?** (Affects timeline — WebSocket infra adds real complexity.)
5. **Single global role per user, or should a user be able to hold multiple roles (e.g., be a Leader of one community and a Member of another simultaneously)?** Current plan uses a single account-level role + per-community `roleInCommunity`, which already supports that case — confirm this matches your intent.
