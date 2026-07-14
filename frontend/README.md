# NewVillages Frontend Prototype

A fully responsive React + TypeScript frontend prototype for the **NewVillages** community platform — *Building Communities. Connecting People.*

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

The app will start at [http://localhost:5173](http://localhost:5173)

---

## Folder Structure

```
frontend/src/
├── components/
│   ├── dev/           # Dev tools (RoleSwitcher)
│   └── ui/            # Reusable UI primitives (Button, Card, Input, Modal)
├── data/
│   └── mockData.ts    # Seeded mock data (users, communities, events, messages)
├── layouts/
│   └── Layout.tsx     # Main app shell (sidebar + topbar + mobile nav)
├── lib/
│   └── utils.ts       # Utility helpers (cn/classnames)
├── pages/
│   ├── public/        # Landing, Terms, Privacy, NotFound
│   ├── auth/          # Register, Login, VerifyEmail, Onboarding
│   ├── app/           # Core app pages (Dashboard, Communities, Events, Messaging, Profile, Settings, Subscription)
│   └── admin/         # Admin Dashboard
├── store/
│   └── useStore.ts    # Zustand global state (current user, role preview)
└── App.tsx            # Route definitions
```

---

## Route Map

| Path | Page |
|---|---|
| `/` | Landing Page |
| `/register` | Registration |
| `/login` | Login |
| `/verify-email` | Email Verification (mock) |
| `/onboarding` | Onboarding Carousel |
| `/dashboard` | Member Home Dashboard |
| `/communities` | Community Directory |
| `/communities/:id` | Community Detail |
| `/create-community` | Create Community Form |
| `/events` | Events Listing |
| `/events/:id` | Event Detail |
| `/messages` | Messaging |
| `/profile` | User Profile |
| `/settings` | Settings |
| `/pricing` | Subscription Plans |
| `/admin` | Admin Dashboard |
| `/terms` | Terms of Use |
| `/privacy` | Privacy Policy |

---

## Dev Role Switcher

A floating action button (⚙️ Shield icon) sits in the **bottom-right corner** of every page. Click it to switch between:

- **Guest** — unauthenticated view
- **Member** — standard member view
- **Leader** — shows community leader controls
- **Organization** — org-specific view
- **Admin** — reveals the Admin Panel link in the sidebar

The active role is persisted in `localStorage` between page refreshes.

---

## Tech Stack

- **React 18 + TypeScript** via Vite
- **React Router v6** — full client-side routing
- **Tailwind CSS v3** — utility-first styling with custom brand theme
- **Framer Motion** — route transitions, animated carousels, modals
- **Zustand** — global state with `localStorage` persistence
- **Recharts** — admin analytics charts
- **lucide-react** — icon library
