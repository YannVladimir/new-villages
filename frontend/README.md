# NewVillages Frontend

A React + TypeScript single-page app for the **NewVillages** community platform — *Building
Communities. Connecting People.* It talks to the real backend API in [`../backend`](../backend)
(JWT auth with silent refresh, communities, events, messaging, subscriptions, admin) — there is no
mock data in the running app.

## Tech Stack

- **React 19 + TypeScript**, built with **Vite**
- **React Router v7** — client-side routing, with `RequireAuth` / `RequireRole` route guards
- **TanStack Query** — server state (data fetching, caching, invalidation)
- **Zustand** — small client state (current session, theme, toasts)
- **Tailwind CSS v3** — utility-first styling
- **Framer Motion** — route transitions and animated UI
- **Recharts** — admin analytics charts
- **lucide-react** — icon library
- **Vitest + React Testing Library** — unit/component tests
- **oxlint** — linting

## Getting Started

```bash
cd frontend
npm install
cp .env.example .env   # defaults to http://localhost:8080, change if your backend runs elsewhere
npm run dev
```

The app starts at [http://localhost:5173](http://localhost:5173). It expects the backend (see
[`../backend/README.md`](../backend/README.md)) to be running for anything beyond the public
marketing pages to work.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) then build for production into `dist/` |
| `npm run lint` | Lint with oxlint |
| `npm test` | Run the Vitest test suite once |
| `npm run preview` | Preview a production build locally |

## Folder Structure

```
frontend/src/
├── components/
│   ├── auth/           # Route guards (RequireAuth, RequireRole) + session bridge
│   └── ui/             # Reusable UI primitives (Button, Card, Input, Modal, ...)
├── hooks/              # One file per domain — TanStack Query hooks wrapping the API
├── lib/
│   ├── apiClient.ts    # fetch wrapper: auth header, silent 401 refresh-and-retry, error shape
│   ├── format.ts       # Date/time formatting helpers
│   └── utils.ts        # cn() class-name helper
├── layouts/
│   └── Layout.tsx       # Main app shell (sidebar + topbar + mobile nav)
├── pages/
│   ├── public/          # Landing, Terms, Privacy, NotFound
│   ├── auth/            # Register, Login, VerifyEmail, ForgotPassword, ResetPassword, Onboarding
│   ├── app/              # Core app pages (Dashboard, Communities, Events, Messaging, Profile, Settings, Subscription)
│   └── admin/            # Admin Dashboard
├── store/                # Zustand stores (session, theme, toasts)
├── types/                # Shared TypeScript types mirroring the backend's API responses
└── App.tsx               # Route definitions
```

## Route Map

| Path | Page | Access |
|---|---|---|
| `/` | Landing Page | Public |
| `/terms`, `/privacy` | Terms of Use / Privacy Policy | Public |
| `/register`, `/login` | Registration / Login | Public |
| `/verify-email`, `/forgot-password`, `/reset-password` | Auth flows | Public |
| `/onboarding` | Onboarding carousel | Public |
| `/dashboard` | Member home dashboard | Authenticated |
| `/communities`, `/communities/:id` | Community directory / detail | Authenticated |
| `/create-community` | Create Community form | Authenticated |
| `/events`, `/events/:id` | Events listing / detail | Authenticated |
| `/create-event` | Publish an event | Authenticated + `COMMUNITY_LEADER` or `ORGANIZATION` |
| `/messages` | Messaging | Authenticated |
| `/profile`, `/settings`, `/pricing` | Profile / Settings / Subscription | Authenticated |
| `/leader-dashboard` | Community leader tools | Authenticated + `COMMUNITY_LEADER` |
| `/admin` | Admin dashboard | Authenticated + `ADMIN` |

## Testing

```bash
npm test
```

Uses Vitest with `jsdom` and React Testing Library. Covered so far: pure formatting/utility logic
(`format.ts`, `utils.ts`, `communityVisuals.ts`), the `apiClient` request/error/silent-refresh
pipeline (mocked `fetch`), and the `RequireAuth` / `RequireRole` route guards. Add new tests next to
the file they cover (`*.test.ts` / `*.test.tsx`).
