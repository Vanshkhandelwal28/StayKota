# Phase 1 baseline audit

Audit only. No application code was changed. The Scala walkthrough video was not attached with this brief, so visual notes below come from the written brief, not a frame-by-frame review of the video.

## Stack

Vite 6, React 19, React Router 7, Tailwind 4, TypeScript. No backend. Data is demo fixtures in `src/data/mockData.ts`, held in React state and `localStorage` by `src/context/AppContext.tsx`.

`src/services/mockApi.ts` describes a future Go client but is not imported by any page. The live path is `AppContext`.

## Routes

| Path | Component | Notes |
|---|---|---|
| `/` | `HomePage` | Public landing and search into `/explore` |
| `/explore` | `ExplorePage` | Filters locality, budget, sharing, category |
| `/hostel/:id` | `HostelDetailPage` | Public. Visit request from this page |
| `/login` | `LoginPage` | Role via query (`student` / `owner`). Matches mock users by email + role |
| `/dashboard` | `StudentDashboard` | Student only |
| `/favourites` | `FavouritesPage` | Student only |
| `/visits` | `VisitsPage` | Student visits |
| `/owner` | `OwnerDashboard` | Owner |
| `/owner/listing/new` and `/owner/listing/:id/edit` | `ListingWizardPage` | Owner listing form |
| `/admin` | `AdminPage` | Admin |
| `/how-it-works` | `HowItWorksPage` | Static help |
| `*` | `NotFoundPage` | |

Shared chrome: `Layout`, `Navbar`, `Footer`. UI primitives: `Button`, `Card`, `Input`, `Select`, `Badge`, `HostelCard`.

## What is real vs mocked

- Listings, users, room prices, and amenities are demo data in `mockData.ts`.
- Login is a client lookup of those demo users. There is no server session.
- Favourites and visits persist only in `localStorage`.
- A visit is date-based (`visitDate`). Status is `confirmed` or `cancelled` immediately in the client. That is not backend persistence.
- Hostel detail is public today. Signed-out users are not redirected to login before opening a hostel.
- No app-store section was found on the landing page.

## Baseline checks (main, before this note)

Recorded on the current `main` checkout:

- `npm run build` — pass (Vite production build).
- `npm run typecheck` — fail, pre-existing: `tsconfig.node.json` sets `erasableSyntaxOnly`, which TypeScript 5.7.3 does not accept (`TS5023`). Not introduced by this audit.
- No test script in `package.json`. Lint script is `oxlint`; not run in this pass.

## Open pull requests already on the repo

- [#1](https://github.com/Vanshkhandelwal28/StayKota/pull/1) closed, merged frontend.
- [#2](https://github.com/Vanshkhandelwal28/StayKota/pull/2) open, rules and room pricing. Not merged into `main`.
- [#3](https://github.com/Vanshkhandelwal28/StayKota/pull/3) open, landing hero and Three.js scene on `feature/landing-hero-3d`. Not merged into `main`.

This audit branch is based on `main`, so it does not include #2 or #3.

## Proposed files for later phases

| Phase | Likely files | Stay out of |
|---|---|---|
| 2 Tokens | `src/index.css` | Page markup |
| 3 Header and hero | `Navbar.tsx`, `HomePage.tsx` hero only | Explore, detail, auth |
| 4 Strip and how-it-works | `HomePage.tsx`, maybe `HowItWorksPage.tsx` only if the landing section needs shared copy | Dashboards |
| 5 Cards | `HostelCard.tsx`, locality chips on `HomePage.tsx` / `ExplorePage.tsx` | Detail logic |
| 6 Detail visuals | `HostelDetailPage.tsx` | Visit rules, routes |
| 7 Auth return and visit prefill | `LoginPage.tsx`, `HostelDetailPage.tsx`, `AppContext.tsx` | New backend |
| 8 Footer and CTA | `Footer.tsx`, lower part of `HomePage.tsx` | Invented testimonials |
| 9 Responsive pass | Only files touched above | Deploy config |
| 10 Audit | No new product code unless a regression is proven | Fake API contracts |

## Risks

- #2 and #3 both target `main` and will conflict with a landing redesign if merged in either order.
- `AppContext` and unused `mockApi.ts` are two data styles. Later phases should keep using `AppContext` unless a phase explicitly switches the call sites.
- Visit confirmation is client-only. The brief says not to present that as real persistence.
- The reference video was not available here, so Phase 3 cannot be matched frame-for-frame until it is provided.
