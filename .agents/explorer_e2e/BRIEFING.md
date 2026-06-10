# BRIEFING — 2026-06-07T11:22:32Z

## Mission
Design a comprehensive E2E test plan for the 5 event features (F1-F5) and document the test suite architecture in draft_TEST_INFRA.md.

## 🔒 My Identity
- Archetype: Test Suite Designer
- Roles: Test Suite Designer, QA Investigator
- Working directory: D:\UPLIFT20\uplift-web\.agents\explorer_e2e
- Original parent: 50e2f31d-3beb-4678-ad44-1ccfb4ee049e
- Milestone: Test Plan Design

## 🔒 Key Constraints
- Read-only investigation — do NOT implement.
- Must document all findings and recommendations in D:\UPLIFT20\uplift-web\.agents\explorer_e2e\handoff.md.

## Current Parent
- Conversation ID: 50e2f31d-3beb-4678-ad44-1ccfb4ee049e
- Updated: 2026-06-07T11:24:00Z

## Investigation State
- **Explored paths**:
  - `supabase_schema.sql` (Inspected event table structure, found `featured` legacy field)
  - `supabase_update_schema.sql` & `supabase_update_schema_v2.sql` (Inspected recent database changes)
  - `prisma/schema.prisma` (Inspected prisma model declarations)
  - `app/admin/events/page.tsx` (Analyzed admin dashboard UI logic and modal form fields)
  - `components/Navbar.tsx` (Analyzed navbar links structure)
  - `components/HomePageClient.tsx` (Analyzed hero and event list layout)
  - `app/page.tsx` (Analyzed server-side data fetching for home page)
- **Key findings**:
  - Found that columns `is_featured` and `is_live` are not yet defined outside the `.agents` folder.
  - Inspected existing Puppeteer-based test infrastructure `verify-layout.mjs` and `verify-speaker-app.mjs`.
- **Unexplored areas**:
  - Detailed interaction flow of ticketing/reservations with live/featured updates.

## Key Decisions Made
- Use Puppeteer as the recommended E2E testing framework because it is already a development dependency of the project (no need to introduce heavy new dependencies like Playwright/Cypress unless required).
- Enforce the single-featured constraint in both a database trigger (source of truth) and client application to prevent race conditions.

## Artifact Index
- D:\UPLIFT20\uplift-web\.agents\explorer_e2e\draft_TEST_INFRA.md — Draft of test infrastructure and 4-tier test cases
- D:\UPLIFT20\uplift-web\.agents\explorer_e2e\handoff.md — Findings, recommendations, and handoff report
