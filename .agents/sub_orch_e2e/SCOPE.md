# Scope: E2E Testing Suite

## Architecture
- **Test Runner**: Node.js script using Puppeteer for browser automation and `@supabase/supabase-js` for database manipulation.
- **System Under Test**: Next.js app running at `http://localhost:3000`.
- **Database**: Supabase PostgreSQL.
- **Features Tested**:
  1. Featured Event Hero Showcase on Homepage.
  2. Dynamic Live Navigation Gating in Navbar.
  3. Single-Featured Constraint and form toggles in Admin Events Panel.
  4. Supabase Event Schema read/write capabilities.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Test Infrastructure Design | Create TEST_INFRA.md at the project root with the test philosophy, feature inventory, architecture, and application scenarios. | None | PLANNED |
| M2 | Tier 1: Feature Coverage | Write and configure E2E tests for basic functional coverage of features (at least 5 tests per feature). | M1 | PLANNED |
| M3 | Tier 2: Boundary & Edge Cases | Write and configure E2E tests for boundary & edge conditions (at least 5 tests per feature). | M2 | PLANNED |
| M4 | Tier 3: Cross-Feature Combinations | Write and configure E2E tests verifying interaction between features. | M3 | PLANNED |
| M5 | Tier 4: Real-World Scenarios | Write and configure E2E tests for complex user workflows. | M4 | PLANNED |
| M6 | Verification & Final Report | Execute all tests (Tiers 1-4) in desktop/mobile viewports, ensure 100% pass, generate browser test reports, and publish TEST_READY.md. | M5 | PLANNED |

## Interface Contracts
- **Test Scripts API**: Run via npm script or node command (e.g. `node verify-e2e.mjs` or `npm run test:e2e`).
- **Database Connection**: Test scripts must read env vars from `.env.local` to connect to Supabase.
- **Clean State**: Test scripts must clean up any test-generated database entries or reset fields to their original state upon completion.
