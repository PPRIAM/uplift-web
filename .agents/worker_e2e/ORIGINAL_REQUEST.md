## 2026-06-07T11:25:01Z

You are the E2E Test Suite Developer. Your working directory is D:\UPLIFT20\uplift-web\.agents\worker_e2e.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your tasks:
1. Read the global PROJECT.md located at D:\UPLIFT20\uplift-web\.agents\orchestrator\PROJECT.md.
2. Read the draft test plan at D:\UPLIFT20\uplift-web\.agents\explorer_e2e\draft_TEST_INFRA.md.
3. Write D:\UPLIFT20\uplift-web\TEST_INFRA.md containing the final E2E test plan matching the draft exactly (including philosophy, feature inventory, test architecture, and all 60 test cases).
4. Inspect the local database to see if the "is_featured" and "is_live" columns exist on the "events" table. You can use node scripts to check connectivity and schema.
5. Implement the E2E test suite under D:\UPLIFT20\uplift-web\e2e-tests\. It must:
   - Load environment variables from .env.local.
   - Use Puppeteer for browser automation and @supabase/supabase-js with SUPABASE_SERVICE_ROLE_KEY (from .env.local) to query/manipulate the database.
   - Implement the test cases for Tier 1, Tier 2, Tier 3, and Tier 4. Each test case must be programmatically executable.
   - Write a master test runner e.g. e2e-tests/runner.mjs that can run the entire suite (or specific tiers) and log the pass/fail status of all 60 test cases.
   - Ensure that the database is reset or cleaned up after the test runs.
6. Verify your implementation by running the test runner. (Note: Since features might not be fully implemented yet, it is expected that some tests will fail. Document which ones pass and which ones fail).
7. Report your findings, the paths to the implemented test files, and the test run output in D:\UPLIFT20\uplift-web\.agents\worker_e2e\handoff.md.
