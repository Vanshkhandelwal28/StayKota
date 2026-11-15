# Testing and pull-request checks

StayKota uses Vitest for fast unit/component regression tests and Playwright for browser-level user journeys. GitHub Actions runs both suites, plus typechecking, linting, and a production build, for pull requests and pushes to `main`.

## Run checks locally

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Run the browser suite as well before opening a pull request that changes routes, page behavior, responsive layouts, maps, authentication flows, or other user-visible behavior:

```sh
npx playwright install chromium
npm run test:e2e
```

The Playwright tests use a local development server. Map tests use controlled fixtures and should not require live map tiles or API credentials. If the browser is missing, install it with the command above; a launch failure is an environment setup problem, not a passing test run.

## Regression-test inventory

| Area | Automated coverage | Important guarantees |
| --- | --- | --- |
| Discovery and cost | `tests/discovery.test.ts` | A match must come from one available room; mandatory monthly charges count, optional charges and deposits do not; budget bounds are inclusive; distances are not invented when coordinates are absent. |
| App state and role rules | `tests/app-context.test.tsx` | Only students can request visits or save favourites; requests require consent, a valid date, and an available room in a published hostel; a repeated request for the same room/date is idempotent; a request starts as `requested`; only an admin can moderate a listing. |
| Maps and coordinates | `tests/maps.test.ts` | Map configuration is keyless; invalid/missing coordinates do not become pins or routes; location and service-area limits behave as documented; provider credit text is not inserted as HTML. |
| Owner helpers | `tests/owner.test.ts` | Owner coordinate pairs are validated, swapped values are rejected, and sample imagery is distinguished from uploaded property photos. |
| Marker transition and navigation | `tests/marker-transition.test.tsx` | Map previews transition to the correct hostel route, preserve return context, handle missing imagery, and clean up transition UI. |
| UI regressions | `tests/ui-polish.test.tsx` | Key pages, controls, accessibility behavior, and selected comparison/detail layouts remain present. |
| End-to-end journeys | `tests/frontend.spec.ts` | Browser flows cover discovery, comparison, visits, mobile layouts, maps, owner listings, gallery behavior, and the guest-to-login return flow. |

These tests exercise the current **browser-only prototype**. Client-side role tests are regression checks for the demo, not proof of production authorization. When a backend is added, add server/API tests for every authorization and validation rule; do not rely on these frontend checks to protect data.

## Expectations for a pull request

1. Add or update an automated test for each behavior change or bug fix. Prefer a focused unit/component test; add a Playwright test when the behavior depends on navigation, browser APIs, layout, or multiple user actions.
2. Keep tests deterministic: mock time, geolocation, and external services where needed. Never require real map-provider access, personal data, or API secrets in CI.
3. Run the local checks above. Run Playwright for UI/user-flow changes and report any environment limitation rather than describing an unrun suite as passing.
4. Open the pull request and wait for both CI jobs to pass. Include a short manual-test note for behavior that cannot be automated.
5. Do not merge with failing or skipped checks unless maintainers document and approve a specific exception.

The workflow provides CI status checks, but maintainers must enable branch protection / a ruleset in GitHub and mark both CI jobs as required if merges should be technically blocked when checks fail. Workflow files cannot turn on repository-level branch protection by themselves.
