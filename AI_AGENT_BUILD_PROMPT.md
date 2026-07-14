# Build Prompt: OneVillage — React Frontend Prototype

Copy everything below into your AI coding agent (Claude Code, Cursor, etc.).

---

## 1. Project Overview

Build a **modern, polished, fully responsive React frontend prototype** for **OneVillage**, a community platform where people create, join, and manage communities (support groups, cultural groups, professional networks, etc.).

Tagline: *"Connect. Collaborate. Grow Together."*
This is a **Canadian** platform — subtly reflect that in imagery/copy (e.g. a Toronto skyline hero image, a small maple leaf accent near the logo) without being kitschy or overdone.

**Scope**: This is a **frontend-only, UI/UX prototype**. There is no real backend. Use:
- Realistic **mock data** (JSON fixtures / a `data/` folder) for users, communities, events, messages, reports, subscriptions.
- **React Context or Zustand** for local app state (current logged-in mock user, role, notifications, etc.) — no real auth, but simulate the full flow (register → verify email screen → login → onboarding → dashboard).
- A **"Switch Role" dev control** (small floating control, hidden in a corner or accessible via a settings menu) that lets me instantly preview the app as: **Member**, **Community Leader**, **Organization**, or **Administrator** — since each role sees a different dashboard/navigation. This is critical for me to review all role-based views without building real auth.
- Persist mock state in `localStorage` so refresh doesn't lose demo data.

Do not build a real backend, real database, or real payment integration — mock/stub these convincingly (e.g., a subscription "checkout" that's a styled form ending in a fake success screen).

---

## 2. Tech Stack

- **React 18 + Vite** (TypeScript preferred)
- **React Router v6** for routing
- **Tailwind CSS** with a custom theme (see Design System below)
- **Framer Motion** for animation/transitions
- **Recharts** (or similar) for admin dashboard infographics/charts
- **lucide-react** for icons
- **React Hook Form + Zod** for form validation
- **Zustand** (or Context API) for global state
- Component structure should be clean and modular (`/components`, `/pages`, `/layouts`, `/data`, `/store`, `/hooks`) so a real backend can be wired in later without a rewrite.

---

## 3. Design System (derived from approved mockups — match this closely)

**Brand identity**
- Logo: circular purple badge with a simple 3-person "community" glyph, paired with wordmark "OneVillage" in bold purple, tagline underneath in small gray text.
- Small red maple leaf + "Made in Canada" microcopy near the logo on marketing/splash contexts.

**Color palette**
- Primary: deep indigo/purple (`#3F2A78` – `#4B2E9E` range) — use for primary buttons, active nav states, headings accents, links.
- Primary hover/darker shade for pressed states.
- Backgrounds: white and very light lavender-gray (`#F6F5FB`) for section backgrounds/app shell.
- Cards: white, `rounded-2xl`, soft subtle shadow (`shadow-sm`/`shadow-md` on hover), light `1px` border in very pale gray/purple.
- Category/community avatars: colorful filled circles (red, green, navy, pink/magenta, orange, teal) each with a simple white icon glyph (maple leaf, briefcase, handshake, heart, grad cap, family) — use this as the pattern for all community icons.
- Status colors: green (success/online), amber (pending/warning), red (destructive/report/suspend), all as accents only — the UI must stay predominantly purple/white/neutral, not rainbow.
- Support both a clean **light theme** (default) and a **dark theme** toggle — the dark theme should invert backgrounds to near-black/charcoal while keeping the same purple accent as the highlight color.

**Typography**
- Headings: bold, geometric sans-serif (Poppins, or similar) — large, confident sizes on landing/marketing pages.
- Body: Inter (or similar) regular/medium for readability.
- Clear type scale (e.g., display/h1/h2/h3/body/small/micro) applied consistently.

**Components**
- Buttons: pill-shaped (`rounded-full`), solid purple primary, outline-purple secondary, ghost/text tertiary. Include hover, active, focus-visible, disabled, and loading (spinner) states.
- Inputs: rounded, subtle border, clear focus ring in primary color, inline validation messages, icon-left inputs for search fields (magnifying glass, filter funnel icon on the right).
- Tabs: underline-style active indicator that slides between tabs (animate with Framer Motion `layoutId`).
- Badges: small pill/counter badges (e.g., red numeric badge on notification bell, on "Invitations" tab).
- Avatars: circular, with fallback initials on colored background when no photo.
- Cards: consistent card component used for community list items, event list items, activity feed items, admin stat tiles.
- Empty states: friendly illustration/icon + short copy + CTA button for every list that could be empty (no communities joined yet, no messages, no events, etc.).
- Toasts/snackbars for confirmations (joined a community, message sent, report submitted, etc.).
- Skeleton loaders for every data list/card while "loading" (simulate a short artificial delay so skeletons are visible in the demo).

**Navigation**
- **Mobile / narrow viewport**: fixed bottom tab bar — Home, Communities, a raised circular center "+" quick-create action button, Messages, Profile. Active tab shows purple icon + label; inactive shows gray icon only.
- **Desktop / wide viewport**: convert to a persistent left sidebar with the same nav items (logo top, nav links, user menu bottom), plus a top bar with search, notification bell, and profile avatar dropdown. Content area becomes a responsive multi-column layout (e.g., communities grid instead of a single-column list).
- Use a real responsive breakpoint strategy — do not just scale the mobile layout down/up; genuinely re-lay-out content for tablet and desktop.

**Motion & Micro-interactions** (use tastefully, respect `prefers-reduced-motion`)
- Route transitions: soft fade/slide between pages.
- Buttons: slight scale/opacity feedback on press.
- Cards: subtle lift + shadow increase on hover (desktop).
- Tabs/segmented controls: animated sliding indicator.
- Notification bell: subtle shake/pulse when a new mock notification arrives.
- Landing page: scroll-reveal animations for sections, animated count-up numbers for stats (e.g., "12,000+ members", "300+ communities").
- Admin dashboard: animated chart entrance (bars/lines drawing in), animated progress bars.
- Onboarding/walkthrough screens: swipeable/animated step carousel with progress dots (mirrors the "Screen X of 5" pattern from the approved mockups).
- Modals/drawers: fade + scale-in with backdrop blur.

---

## 4. Full Page List to Build (React Routes)

### A. Public / Marketing
1. **Landing Page** — hero section (headline, subheadline, CTA buttons "Get Started" / "Log In", hero image with skyline+flag styling), value-proposition sections (why OneVillage, how it works in 3 steps), featured community categories, testimonials/stats band (animated counters), footer with links to Terms of Use, Privacy Policy, Contact.
2. **Terms of Use** page (full scrollable legal-style page, with a visible "Version X" and "Last updated" date).
3. **Privacy Policy** page (same style).
4. **404 / Not Found** page.

### B. Auth & Onboarding
5. **Register** page:
   - Fields: Full Name, Email, Password (+confirm), Country, City, Preferred Language, Account Type selector (Member / Community Leader / Organization — styled as selectable cards, not a plain dropdown).
   - **Mandatory Terms acceptance checkbox**, unchecked by default, label: *"I agree to the Terms of Use and Privacy Policy."* Both terms are **clickable links that open the full document** (in a modal or new tab) before the user can check the box — disable/gray the checkbox or require the modal to be opened at least once. The Register/Submit button stays disabled until the checkbox is checked.
   - On mock submit, record (and later display somewhere in Profile/Settings, e.g. "Legal") the accepted **date, time, and Terms version** in the mock user record.
6. **Email Verification** screen (mock "check your inbox" screen with a "Resend" action and a "Simulate verification" dev button since there's no real email).
7. **Login** page (email + password, "forgot password" link → simple mock flow, social-login buttons can be shown as disabled/"coming soon").
8. **Re-consent screen** — simulate the "Terms were updated" flow: if a mock flag `termsVersionCurrent !== user.acceptedTermsVersion`, intercept navigation after login and force the user to review + re-accept before continuing.
9. **Onboarding carousel** (3–5 steps) post-registration — mirrors the approved "Screen X of 5" walkthrough style, introducing Communities, Events, Messaging, Profile.

### C. Core App (authenticated, role-aware)
10. **Home Dashboard** (Member view — closely follow the approved mockup):
    - Personalized greeting header with hero banner image.
    - Notification bell with badge → opens a notifications panel/drawer.
    - "My Communities" horizontal scroll of circular community avatars + member counts + "View all".
    - "Upcoming Events" card list (thumbnail, title, date/time, location or "Online", calendar icon) + "View all".
    - "Recent Activity" feed (avatar, name, community, post excerpt, relative timestamp) + "View all".
    - "Announcements" highlighted banner card.
11. **Community Directory** (closely follow the approved mockup):
    - Tabs: Discover / My Communities / Invitations (with count badge).
    - Search bar + filter (by category/location).
    - Community list/grid: icon, name, member count, short description, Join button (or "Requested"/"Joined" state).
    - "+ Create a Community" CTA.
12. **Community Detail page** — banner, description, member count, leader info, tabs for Feed / Members / Events / About, Join/Leave button, "Report community" option.
13. **Community Creation / Request flow** — multi-step form: name, description/category, public vs. private, cover image upload (mock), review & submit → "pending admin approval" confirmation state.
14. **Community Leader Dashboard** — member management (list, invite via link/email, remove member), pending join requests (approve/reject), publish announcement/event composer, simple analytics (member growth chart, engagement).
15. **Organization Page** — org profile (logo, description, services list, contact-community button), org admin edit mode (Organizations manage their own page), announcements feed.
16. **Events**:
    - Events listing/calendar view (filter by community, upcoming/past).
    - Event detail page (title, description, date/time, location or video-call link, host, RSVP/Attend button, attendee avatars).
    - Event creation form (for Leaders/Orgs): type (dinner, meeting, workshop, social, support/networking), date/time, location or online link, description, cover image.
17. **Messaging**:
    - Conversation list (avatar, name/community, last message preview, unread badge, timestamp).
    - Chat thread view (bubbles, timestamps, read receipts styling).
    - Ability to start a new message to a Community Leader, an Organization, or Platform Admin (per requirements).
    - **Block** and **Report** actions on a conversation/user (confirmation modals with reason selection for reports).
18. **Notifications panel** — new messages, invitations, community events, announcements; mark-as-read states.
19. **Profile page**:
    - View mode: photo, name/nickname, short bio, city, selected community, spoken languages, role badge.
    - Edit mode: same fields editable, photo upload (mock), plus a "Legal" section showing Terms version/date accepted.
20. **Settings** — account security (change password mock), notification preferences (toggles), blocked users list, privacy settings, delete/deactivate account (with confirmation modal), subscription/billing (see below).
21. **Subscription / Premium** page:
    - Plan comparison cards: Free (Member), Community Leader ($10/month), Organization ($20/month) — feature checklists per tier, "Most popular" highlight, monthly billing toggle placeholder for future annual pricing.
    - Mock checkout flow (styled card-details form → success screen with confetti/animated checkmark) — clearly stub, no real payment processor.
22. **Report/Moderation entry points** — a reusable "Report" modal usable from a profile, a message, or a community, with a reason selector and free-text field, ending in a confirmation toast.

### D. Administrator
23. **Admin Dashboard** (overview): animated stat tiles (total users, total communities, active subscriptions, pending reports) + charts (user growth over time, community growth, subscription revenue trend) using Recharts.
24. **Admin: Users** — searchable/sortable table, view profile, suspend/reinstate account, remove fake/inappropriate profile (with confirm modal).
25. **Admin: Community Leader Applications** — approve/reject queue with applicant details.
26. **Admin: Communities** — manage/search all communities, remove/feature a community.
27. **Admin: Reports** — queue of user-submitted reports (content/user), with status (open/reviewing/resolved), action buttons (remove content, suspend user, dismiss), and an activity log per report.
28. **Admin: Subscriptions & Payments** — table of active subscriptions, plan, status, mock revenue figures.
29. **Admin: Activity Logs** — chronological log of moderation actions taken (for accountability/audit).

---

## 5. Functional Details to Respect (from the requirements docs)

- **Roles**: Platform Administrator, Community Leader, Community Member, and Organization (4 total — the design should visibly differentiate what each role can access/do).
- **Registration** must capture: Full Name, Email, Password, Country, City, Language, Account Type (Member/Community Leader/Organization).
- **Profile** must support: Profile Photo, Short Bio, City, Selected Community, Spoken Languages.
- **Terms acceptance** is a hard requirement (see Register page spec above) — do not skip the "must open and read before accepting" interaction, the unchecked-by-default checkbox, or the stored version/timestamp. Build the re-consent flow for future Terms updates too.
- **Communities**: create, search, join, leave, view members, change communities.
- **Community Leaders** can: invite members, publish announcements/events/meetings, organize activities, report inappropriate behavior.
- **Organizations** can: create an org page, present services, publish announcements, contact communities.
- **Events** cover: community dinners, Zoom/online meetings, social activities, workshops, support & networking events.
- **Messaging**: private messages to Community Leader / Organization / Platform Admin, plus block and report features.
- **Moderation**: reporting, content removal, account suspension, activity logs — all reflected in the Admin section.
- **Notifications**: new messages, invitations, community events/announcements.
- **Subscriptions**: Community Leader $10/month, Organization $20/month — designed so a "Premium" tier can be added later without restructuring.
- **Admin Dashboard**: manage users, communities, reports, subscriptions, and platform statistics — with genuine infographics, not just tables.
- Platform must *feel* secure/trustworthy in its design (clear privacy affordances, visible security badges/copy where appropriate) even though real HTTPS/encryption is a backend concern outside this prototype's scope.

---

## 6. Responsiveness Requirements

- Fully responsive from **360px mobile** up through **1440px+ desktop**, with meaningful breakpoints at mobile / tablet / desktop (not just fluid scaling).
- Bottom tab bar on mobile ↔ sidebar + topbar on desktop, as described above.
- Test and polish at minimum these viewport widths: 375px, 768px, 1024px, 1440px.
- Touch targets ≥44px on mobile; hover states only apply on pointer-capable (desktop) devices.
- Images must use responsive `srcset`/`object-fit: cover` patterns so hero banners and avatars don't distort.

---

## 7. Accessibility

- Semantic HTML, proper heading hierarchy, ARIA labels on icon-only buttons.
- Keyboard-navigable menus, modals (focus trap + `Esc` to close), and tab components.
- Color contrast meeting WCAG AA against the purple/white palette.
- Respect `prefers-reduced-motion` by disabling/softening non-essential animations.

---

## 8. Deliverable Expectations

- A runnable Vite React app (`npm install && npm run dev`) with clean routing covering every page listed in Section 4.
- Organized, readable component structure with reusable primitives (Button, Card, Modal, Tabs, Avatar, Badge, Input, etc.) rather than one-off styling per page.
- Realistic seeded mock data (at least ~8–10 communities, ~10 users across all 4 roles, ~6 events, a handful of conversations/messages, a few pending admin reports/applications) so every screen looks populated and real during a demo, not empty.
- A short `README.md` explaining the folder structure, how to run it, and how the role-switcher works.
- Prioritize visual polish and interaction quality — this prototype's main purpose is to be **demoed to stakeholders**, so it should look and feel like a real, modern, premium product, not a wireframe.

---

## 9. Non-Goals (explicitly out of scope for this prototype)

- No real backend, database, authentication, or payment processing.
- No real email sending.
- No real file storage — use local object URLs or placeholder images for uploads.
- No i18n implementation required beyond a "Language" field in the UI (English content only for now).
