# OneVillage Backend

Java 21 + Spring Boot 3.3 backend for the OneVillage community platform. Built to match the
already-shipped React frontend (`../frontend`) route-for-route and field-for-field — see
`../BACKEND_PLAN.md` for the full design rationale.

## Stack

- Java 21, Spring Boot 3.3, Maven
- PostgreSQL 16 + Flyway migrations
- Spring Security 6 with stateless JWT (access token + rotating refresh token in an httpOnly cookie)
- Stripe (Checkout + Webhooks) for the Community Leader / Organization subscriptions
- springdoc-openapi (Swagger UI)
- JUnit 5 + Mockito

## Running it

### Option A — Docker Compose (recommended)

```bash
cd backend
docker compose up --build
```

This starts Postgres, MailHog (catches outgoing emails at http://localhost:8025 — no real SMTP
needed locally), and the API on **http://localhost:8080**. Swagger UI is at
`http://localhost:8080/swagger-ui.html`.

### Option B — run the JAR locally against Docker's Postgres/MailHog only

```bash
cd backend
docker compose up -d postgres mailhog
mvn spring-boot:run
```

### First login

On first startup, `DataSeeder` seeds:
- The initial Terms of Use version (`1.0.0` by default — required before any account can be used, see below).
- One administrator account: `admin@onevillage.ca` / `ChangeMe123!` (override via `ADMIN_SEED_EMAIL` /
  `ADMIN_SEED_PASSWORD`). **Change this before deploying anywhere but your own machine.**

Everything else (communities, events, messages...) is created through the API as you use it — this
backend has no fake/demo content baked in, only the frontend prototype does.

## Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Postgres connection | `localhost:5432/onevillage` |
| `JWT_SECRET` | HMAC signing key for JWTs — **must** be changed and kept secret in any real deployment | dev placeholder |
| `JWT_ACCESS_TTL_MIN` / `JWT_REFRESH_TTL_DAYS` | Token lifetimes | 15 min / 30 days |
| `APP_CORS_ORIGINS` | Comma-separated list of allowed frontend origins | `http://localhost:5173` |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` | SMTP for verification/reset emails | MailHog (`localhost:1025`) |
| `FRONTEND_BASE_URL` | Used to build verification/reset links | `http://localhost:5173` |
| `UPLOADS_DIR`, `UPLOADS_BASE_URL` | Local disk avatar/cover-image storage (swap for S3 later) | `./uploads` |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe API access — subscriptions are disabled with a clear error until these are set | empty |
| `STRIPE_PRICE_LEADER`, `STRIPE_PRICE_ORGANIZATION` | Stripe Price IDs for the two paid plans ($10/mo, $20/mo) | empty |
| `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD` | First admin account, seeded once | see above |

## Architecture notes

- **Package-per-module** under `com.onevillage.backend`: `auth`, `user`, `terms`, `community`,
  `organization`, `event`, `messaging`, `notification`, `moderation`, `subscription`, `admin`,
  plus `security`/`config`/`common` for cross-cutting concerns.
- **No JPA object graphs between modules.** Entities reference each other by plain `UUID` foreign-key
  fields (e.g. `Event.communityId`), not `@ManyToOne`/`@OneToMany`. Services resolve related data via
  the other module's *repository* (never its service), which keeps every dependency one-directional
  and makes circular Spring bean wiring impossible by construction. DTOs are assembled in the service
  layer from multiple repository calls.
- **Terms-of-Use gate**: `TermsGateFilter` runs after JWT auth on every request and returns
  `409 TERMS_UPDATE_REQUIRED` for any authenticated user whose latest acceptance doesn't match the
  currently published `TermsVersion`. The frontend's existing `/re-consent` page is designed to catch
  exactly this. Acceptances are append-only (`user_terms_acceptances`) with a server-stamped
  timestamp — never trust a client-supplied date.
- **"Create Community" and "Leader Application"** are the same underlying workflow
  (`CommunityCreationRequest`): a member requests to lead a new community, an admin approves or
  rejects it, and approval atomically creates the `Community`, a `LEADER` membership row, and (if
  needed) upgrades the applicant's account role.
- **Messaging "compose to Leader/Org/Admin"** resolves server-side: `LEADER` → that community's
  `leaderId`, `ORG` → that organization's `ownerUserId`, `ADMIN` → any seeded `ADMIN` account. Blocking
  is checked in both directions before a conversation can be created or a message sent.
- **Stripe** is the source of truth for billing events, but the local `subscriptions` table is the
  source of truth the rest of the app reads for feature-gating — webhooks
  (`checkout.session.completed`, `invoice.paid`, `customer.subscription.updated/deleted`) keep it in
  sync. A user's role auto-upgrades to `COMMUNITY_LEADER`/`ORGANIZATION` on successful checkout and
  reverts to `MEMBER` if Stripe reports the subscription cancelled.

## Testing

```bash
mvn test
```

Includes a full `@SpringBootTest` context-load test (catches bean-wiring/circular-dependency issues
across all ~20 modules) plus focused Mockito unit tests for the terms-acceptance and registration
logic. Uses an in-memory H2 database (`test` profile) — Flyway is disabled for tests and Hibernate
generates the schema from the entities directly, so this is independent of the production Postgres
migration files.

## What's intentionally not here yet

Per the phased roadmap in `../BACKEND_PLAN.md`: real-time delivery (messaging/notifications are REST +
poll for now, WebSocket upgrade is a later phase), rate limiting on auth endpoints, and S3-backed file
storage (local disk works fine for one instance, but won't survive a redeploy on most PaaS hosts).
