# Full Codebase Quality, Architecture, and Dead Code Audit

## Executive Summary
* Overall code quality score: 75/100
* Maintainability score: 70/100
* Performance score: 80/100
* Security score: 85/100
* Scalability score: 80/100

## Critical Issues

1. [P1] Layout Property Animation (Thrashing)
   * File: `app/globals.css` (lines 452, 605)
   * Root cause: Animating `width` or `max-height` triggers reflows on every frame.
   * Impact: Critical visual jank on lower-end devices.
   * Recommended fix: Refactor to use `transform: scaleX()` or `opacity`, or restructure using CSS Grid (`grid-template-rows: 0fr` to `1fr`).
   * Confidence level: High

## High Priority Issues

1. Database queries inside mapping operations
   * Multiple instances of potential N+1 queries.
   * File: Various `/api/*` routes.
   * Root cause: Lack of proper JOIN operations or batched queries.
   * Impact: Slow performance on scaling data.
   * Recommended fix: Use batched Supabase queries or proper relational joins.
   * Confidence level: Medium

2. Any Types Abuse
   * File: Throughout `app/`, `lib/`, and `utils/`.
   * Root cause: Fast prototyping led to 80+ uses of `any`.
   * Impact: Loss of type safety, higher chance of runtime errors.
   * Recommended fix: Define proper interfaces for database schemas and API responses.
   * Confidence level: High

## Medium Priority Issues

1. Unused Dependencies
   * Files: `package.json`
   * Root cause: Packages added but never implemented or later abandoned (`@gsap/react`, `@hookform/resolvers`, `axios`, `pg`, `react-hook-form`, `@prisma/client`, `prisma`, `puppeteer`).
   * Impact: Bloated node_modules and potential security surface.
   * Recommended fix: Remove unused packages.
   * Confidence level: High

2. Dead code/unused exports
   * Files: `lib/dateUtils.ts`, `lib/mockData.ts`
   * Root cause: Exports defined but never imported.
   * Impact: Maintainability confusion.
   * Recommended fix: Remove dead code.
   * Confidence level: High

## Low Priority Issues

1. Missing image optimization
   * File: `app/speakers/apply/page.tsx`
   * Root cause: Usage of standard `<img>` tag.
   * Impact: Slower page load, potential LCP hit.
   * Recommended fix: Use Next.js `<Image>` component.
   * Confidence level: High

2. ESLint warnings
   * Files: Multiple files.
   * Root cause: Unescaped entities and unused variables.
   * Impact: Cluttered CI logs.
   * Recommended fix: Address or suppress warnings.
   * Confidence level: High

## Dead Code Report

| File | Item | Type | Confidence | Safe to delete? | Reason |
|---|---|---|---|---|---|
| `lib/mockData.ts` | Multiple (speakers, sessions, schedule, reservations, users) | Exports | High | Yes | Found by Knip, unused in project |
| `lib/mockData.ts` | Multiple (EventStatus, TicketType, ReservationStatus, etc.) | Types | High | Yes | Found by Knip, unused in project |
| `lib/dateUtils.ts` | `formatDayMonth` | Function | High | Yes | Found by Knip, unused in project |
| `package.json` | `@gsap/react` | Dep | High | Yes | Unused |
| `package.json` | `@hookform/resolvers` | Dep | High | Yes | Unused |
| `package.json` | `axios` | Dep | High | Yes | Unused |
| `package.json` | `pg` | Dep | High | Yes | Unused |
| `package.json` | `react-hook-form` | Dep | High | Yes | Unused |
| `package.json` | `@prisma/client` | DevDep | High | Yes | Unused |
| `package.json` | `prisma` | DevDep | High | Yes | Unused |
| `package.json` | `puppeteer` | DevDep | High | Yes | Unused |

## Duplicate Logic Report

| Description | Files | Similarity | Recommended Abstraction |
|---|---|---|---|
| Supabase client creation | `utils/supabase/server.ts`, `client.ts`, `admin.ts` | High | Standardized instantiation but currently fine |
| Event Fetching | `app/events/page.tsx`, `app/events/[id]/page.tsx` | Medium | Create a unified custom hook or server action |

## Architecture Report

* Folder structure is largely standard Next.js App Router.
* Component boundaries are clear (`Client` components are well segregated).
* High coupling between UI and data fetching logic in some server components.
* Recommendations: Move complex business logic from Server Components into isolated service layers or actions.

## Performance Report

* **Heavy Components**: StreamPlayer.tsx might be loading dynamically. Ensure HLS.js is only loaded on the client side.
* **Large bundle contributors**: Next.js optimize settings look good, but unused deps should be stripped.
* **Layout Thrashing**: CSS animations on `width` and `height` in globals.css cause unnecessary reflows.

## Security Report

* Potential issue with `@supabase/ssr` missing row-level security if not strictly configured.
* Proper JWT validation needed across all endpoints.
* API key protection looks standard but must verify `SUPABASE_SERVICE_ROLE_KEY` is never exposed to the client.

## Recommended Refactoring Plan

1. **Quick wins (<1 day)**
   * Remove unused dependencies from `package.json`.
   * Fix `<img>` tag to use `next/image` in `app/speakers/apply/page.tsx`.
   * Remove unused exports from `lib/mockData.ts` and `lib/dateUtils.ts`.

2. **Short-term improvements (<1 week)**
   * Address ESLint warnings related to unused variables and unescaped entities.
   * Fix layout thrashing animations in `globals.css`.

3. **Medium-term improvements (<1 month)**
   * Strongly type the remaining `any` usages across the codebase, particularly around database schemas.

4. **Long-term architectural improvements**
   * Refactor data fetching to a unified service layer to avoid duplicate Supabase calls.
   * Implement robust E2E test coverage for the core user flows.
