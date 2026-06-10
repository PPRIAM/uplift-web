## 2026-06-07T11:22:32Z

You are the Test Suite Designer. Your working directory is D:\UPLIFT20\uplift-web\.agents\explorer_e2e.
Your task is to:
1. Inspect the codebase (e.g. app/admin/events/page.tsx, components/Navbar.tsx, components/HomePageClient.tsx, and database schema scripts) to understand how the features are structured.
2. Design a comprehensive E2E test plan for the 5 features:
   - F1: Supabase Event Schema Update (is_featured and is_live)
   - F2: Admin Control Refactoring (is_featured/is_live form toggles)
   - F3: Single-Featured Constraint (saving featured event marks others false)
   - F4: Dynamic Live Navigation Gating (En direct visibility based on is_live)
   - F5: Featured Event Hero Showcase (homepage hero shows featured, falls back to upcoming)
3. Enumerate the 4-tier test cases matching the design methodology:
   - Tier 1: Feature Coverage (>=25 test cases: 5 per feature)
   - Tier 2: Boundary & Corner Cases (>=25 test cases: 5 per feature)
   - Tier 3: Cross-Feature Combinations (>=5 test cases, pairwise)
   - Tier 4: Real-World Application Scenarios (>=5 test cases)
4. Write a draft of TEST_INFRA.md documenting the test philosophy, feature inventory, test architecture, and all the test cases. Save it at D:\UPLIFT20\uplift-web\.agents\explorer_e2e\draft_TEST_INFRA.md.
5. Write your findings and recommendations in handoff.md under D:\UPLIFT20\uplift-web\.agents\explorer_e2e\.
6. Report back when done.
