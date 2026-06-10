# Scope: Implementation of Featured Event Showcase & Live Routing

## Architecture
- **Framework**: Next.js (App Router), React, TS, Supabase PostgreSQL, Tailwind CSS.
- **Components**:
  - `components/Navbar.tsx` (Live gating tab)
  - `components/HomePageClient.tsx` (Featured Hero showcase)
  - `app/admin/events/page.tsx` (Admin panel for toggling attributes and enforcing single-featured event logic)
- **Database**:
  - Supabase `events` table with boolean columns `is_featured` and `is_live` (default false).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Database Schema Update | Add `is_featured` and `is_live` to the `events` table. Verify database read/write queries. | None | PLANNED |
| M2 | Admin Event Panel Refactoring | Refactor `app/admin/events/page.tsx` with toggles for both fields, ensuring single-featured logic. | M1 | PLANNED |
| M3 | Dynamic Live Navigation Gating | Display "En direct" in `components/Navbar.tsx` only when at least one event has `is_live === true`. | M1 | PLANNED |
| M4 | Featured Event Hero Showcase | Render the active featured event details in `components/HomePageClient.tsx` (falling back to next upcoming). | M1 | PLANNED |
| M5 | E2E Integration and Hardening | Pass 100% of E2E test suite (Tiers 1-4) and perform Tier 5 adversarial hardening. | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### Supabase `events` Table Schema
- `is_featured`: boolean, default `false`, non-nullable
- `is_live`: boolean, default `false`, non-nullable

### Single-Featured Constraint Logic
- When a user toggles/saves an event as `is_featured = true`, all other events must have `is_featured` updated/set to `false`.
