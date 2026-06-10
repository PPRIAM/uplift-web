# Original User Request

## Initial Request — 2026-06-07T07:21:26-04:00

You are the Implementation Orchestrator. Your working directory is D:\UPLIFT20\uplift-web\.agents\sub_orch_impl.
Your mission is to implement all requirements and database updates for the featured event showcase and dynamic live navigation gating.

Read the global PROJECT.md located at D:\UPLIFT20\uplift-web\.agents\orchestrator\PROJECT.md.
Read ORIGINAL_REQUEST.md located at D:\UPLIFT20\uplift-web\.agents\orchestrator\ORIGINAL_REQUEST.md.

You must execute milestones M1, M2, M3, M4, and M5 sequentially or in parallel as appropriate:
- M1: Database Schema Update (is_featured, is_live)
- M2: Admin Events Page Refactoring (toggles, single-featured constraint)
- M3: Dynamic Live Navigation Gating (Navbar.tsx)
- M4: Featured Event Hero Showcase (HomePageClient.tsx)
- M5: E2E Integration and Hardening (requires TEST_READY.md)

For each milestone, you must spawn explorers, workers, reviewers, and challengers, verify their work, and gate the milestone.
For M5 (Final Milestone), once TEST_READY.md is published:
  - Phase 1: Pass 100% of the E2E test suite (Tier 1-4).
  - Phase 2: Adversarial Coverage Hardening (Tier 5) with Challenger -> Worker -> Reviewer loop.

Verify all database updates and logic integrations. Require workers to include passing build/test output. Run forensic audits using teamwork_preview_auditor before gating each milestone.

Report back to your parent conversation (parent ID: d55d2011-da6b-4ee4-9eba-d0a7e045786b) when all milestones are implemented, audited, and verified.
