# Project Implementation Plan - Featured Event Showcase and Live Routing

## 1. Objectives & Scope
Satisfy the requirements of ORIGINAL_REQUEST.md:
- Update Supabase `events` table with `is_featured` and `is_live` columns.
- Refactor admin panel `app/admin/events/page.tsx` with toggles and single-featured constraint.
- Refactor `components/Navbar.tsx` for dynamic "En direct" gating.
- Refactor `components/HomePageClient.tsx` for featured event hero showcase.
- Ensure 100% success of the E2E tests.

## 2. Dual Track Strategy
We will execute two parallel tracks:
1. **E2E Testing Track**: Build a comprehensive E2E test suite covering Tiers 1-4.
2. **Implementation Track**: Progressively implement the required features across milestones, culminating in E2E validation and adversarial hardening.

## 3. Milestones
- **Milestone 1**: Database Schema Update (is_featured, is_live) & Client functions.
- **Milestone 2**: Admin Events Page Refactoring (toggles, single-featured constraint).
- **Milestone 3**: Dynamic Live Navigation Gating (Navbar.tsx).
- **Milestone 4**: Featured Event Hero Showcase (HomePageClient.tsx).
- **Milestone 5**: Full Integration & Acceptance Testing (Tier 1-4 tests pass, Tier 5 hardening).

## 4. Execution Schedule
- Step 1: Initialize Project metadata (PROJECT.md).
- Step 2: Spawn E2E Testing Orchestrator (`sub_orch_e2e`).
- Step 3: Spawn Implementation Orchestrator (`sub_orch_impl`) or spawn sub-orchestrators for milestones sequentially.
- Step 4: Monitor progress of both tracks.
- Step 5: Coordinate validation, review, audit, and finalize.
