# Project: Featured Event Showcase & Live Routing

## Architecture
- **Framework**: Next.js (App Router), React, TypeScript, Tailwind CSS.
- **Database**: Supabase PostgreSQL.
- **Components**:
  - `components/Navbar.tsx`: Renders navigation links, including conditional "En direct" link based on whether any event is currently live.
  - `components/HomePageClient.tsx`: Renders the homepage hero banner showing either the currently active featured event or falling back to the next upcoming event.
  - `app/admin/events/page.tsx`: Admin interface for creating/editing events, including toggles for `is_featured` and `is_live`.
- **Database/API Interactions**: Uses Supabase client client-side or server-side (to be explored by Explorer) to interact with `events` table.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Database Schema Update | Add `is_featured` and `is_live` columns to the `events` table (defaulting both to false). Verify database reads and writes. | None | PLANNED |
| M2 | Admin Event Panel Refactoring | Upgrade `app/admin/events/page.tsx` to support toggling `is_featured` and `is_live`. Ensure single-featured constraint (marking one event as featured toggles others off). | M1 | PLANNED |
| M3 | Dynamic Live Navigation Gating | Configure `components/Navbar.tsx` to display the "En direct" tab only when at least one published event has `is_live === true`. | M1 | PLANNED |
| M4 | Featured Event Hero Showcase | Redesign `components/HomePageClient.tsx` to display the active featured event, falling back to the next upcoming event. | M1 | PLANNED |
| M5 | E2E Testing Suite | Create and execute Tier 1-4 tests, followed by Tier 5 adversarial coverage hardening. | M1, M2, M3, M4 | PLANNED |

## Code Layout
- `app/admin/events/page.tsx`: Admin panel for events.
- `components/Navbar.tsx`: Main navigation component.
- `components/HomePageClient.tsx`: Home page client component.
- `utils/supabase/`: Supabase client utilities.
- `lib/`: Shared utility libraries.

## Interface Contracts
### Supabase `events` Table Schema
- `is_featured`: boolean, default `false`, nullable/non-nullable (TBD by Explorer)
- `is_live`: boolean, default `false`, nullable/non-nullable (TBD by Explorer)

### Single-Featured Constraint Logic
- When `is_featured` is enabled for an event, all other events must have `is_featured` set to `false`.
