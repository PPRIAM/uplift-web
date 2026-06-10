# UPLIFT 2.0 E2E Test Suite Status

The E2E test suite has been successfully implemented and is ready to verify the Featured Event Showcase & Live Routing features.

## Runner Instructions

To run the entire test suite, ensure the Next.js development server is running locally on `http://localhost:3000`, then execute the following command:

```bash
node e2e-tests/runner.mjs
```

### Running Specific Tiers

You can filter and run specific tiers using the `--tier` flag:

- **Tier 1 (Feature Coverage)**:
  ```bash
  node e2e-tests/runner.mjs --tier=1
  ```
- **Tier 2 (Boundary & Corner Cases)**:
  ```bash
  node e2e-tests/runner.mjs --tier=2
  ```
- **Tier 3 (Cross-Feature Combinations)**:
  ```bash
  node e2e-tests/runner.mjs --tier=3
  ```
- **Tier 4 (Real-World Scenarios)**:
  ```bash
  node e2e-tests/runner.mjs --tier=4
  ```

---

## Test Cases Summary

| Tier | Category | Target count | Implemented | Status |
| --- | --- | --- | --- | --- |
| **Tier 1** | Feature Coverage | 25 | 25 | READY |
| **Tier 2** | Boundary & Corner Cases | 25 | 25 | READY |
| **Tier 3** | Cross-Feature Combinations | 5 | 5 | READY |
| **Tier 4** | Real-World Scenarios | 5 | 5 | READY |
| **Total** | | **60** | **60** | **READY** |

---

## Feature Checklist

### F1: Supabase Event Schema Update
- [x] **TC-F1-01**: Columns Existence (Verify `is_featured` and `is_live` columns are added to the schema)
- [x] **TC-F1-02**: Columns Type Check (Verify columns are typed as boolean)
- [x] **TC-F1-03**: Nullability Check (Verify columns are `NOT NULL`)
- [x] **TC-F1-04**: Default Values Verification (Verify default is `false` when omitted on insert)
- [x] **TC-F1-05**: Client Query Verification (Verify client query parses columns as booleans)
- [x] **TC-F1-06**: Schema Migration Idempotency (Verify re-running migrations does not fail)
- [x] **TC-F1-07**: Legacy Data Backfilling (Verify no NULL values exist for existing records)
- [x] **TC-F1-08**: NULL Insertion Rejection (Verify explicit NULL values are rejected)
- [x] **TC-F1-09**: Schema Backup & Restore Integrity (Verify schema statements exist in base file)
- [x] **TC-F1-10**: RLS R/W Constraints on Columns (Verify anonymous writes are rejected)

### F2: Admin Control Refactoring
- [x] **TC-F2-01**: Form Input Controls Presence (Verify checkboxes exist in modal)
- [x] **TC-F2-02**: Form Creation Defaults (Verify creation toggles are false/unchecked by default)
- [x] **TC-F2-03**: Form Load on Edit (Verify form loads correct checked/unchecked values for existing events)
- [x] **TC-F2-04**: Save New Event with Attributes (Verify creating an event saves toggles correctly to DB)
- [x] **TC-F2-05**: Update Toggles on Existing Event (Verify editing toggles updates the database correctly)
- [x] **TC-F2-06**: Form Edit Cancel Operation (Verify cancelling does not save changes to DB)
- [x] **TC-F2-07**: Rapid Toggle Interactivity (Verify rapid toggling does not freeze UI)
- [x] **TC-F2-08**: Save Fail Handling (Verify standard save-fail error notification exists in page code)
- [x] **TC-F2-09**: Form Validation Integration (Verify empty required Titre blocks saving)
- [x] **TC-F2-10**: Expired Session on Save (Verify session expiration redirects to login on save)

### F3: Single-Featured Constraint
- [x] **TC-F3-01**: Single-Featured on New Event Insertion (Verify setting new event featured toggles old ones off)
- [x] **TC-F3-02**: Single-Featured on Existing Event Update (Verify updating event featured toggles old ones off)
- [x] **TC-F3-03**: Database Trigger Level Enforcement (Verify DB trigger toggles others off on direct SQL insert/update)
- [x] **TC-F3-04**: Toggling Featured Off Leaves Zero Featured (Verify turning off featured works correctly)
- [x] **TC-F3-05**: Admin UI Table Row Updates (Verify only the newly featured event shows as featured in admin list)
- [x] **TC-F3-06**: Featured Re-save Idempotency (Verify re-saving featured event does not affect its status or loop)
- [x] **TC-F3-07**: Featured Event Deletion Handling (Verify deleting featured event leaves others unfeatured)
- [x] **TC-F3-08**: Concurrent Featured Saves (Verify DB serialization handles concurrent featured saves)
- [x] **TC-F3-09**: Saving Non-Featured Event (Verify updating unfeatured event tagline does not clear the featured event)
- [x] **TC-F3-10**: Exclusivity Trigger Side-Effects (Verify trigger updates featured status without altering other columns)

### F4: Dynamic Live Navigation Gating
- [x] **TC-F4-01**: Navbar Displays Live Tab When Active Event is Live (Verify "En direct" appears when an event is live)
- [x] **TC-F4-02**: Navbar Hides Live Tab When No Events are Live (Verify "En direct" is hidden when no events are live)
- [x] **TC-F4-03**: Mobile Navbar Gating (Verify "En direct" shows in mobile menu when live)
- [x] **TC-F4-04**: Mobile Navbar Gating When Hidden (Verify "En direct" is hidden in mobile menu when not live)
- [x] **TC-F4-05**: Unpublished Live Event Gating (Verify live event must be published to show tab)
- [x] **TC-F4-06**: Live Event Deletion (Verify "En direct" disappears immediately when the only live event is deleted)
- [x] **TC-F4-07**: Direct Access Gating / Route Guard (Verify direct access to /live handles active status correctly)
- [x] **TC-F4-08**: Next.js Cache Revalidation Gating (Verify navbar updates dynamically on navigation)
- [x] **TC-F4-09**: DB Timeout Fallback (Verify navbar doesn't crash on DB timeout, just hides live tab)
- [x] **TC-F4-10**: Past Live Events Gating (Verify past unpublished events do not trigger navbar tab)

### F5: Featured Event Hero Showcase
- [x] **TC-F5-01**: Hero Displays Featured Event (Verify featured event title/tagline show in home hero)
- [x] **TC-F5-02**: Hero Fallback to Next Upcoming Event (Verify upcoming fallback when no event is featured)
- [x] **TC-F5-03**: Hero Default Brand Fallback (Verify default branding displays when zero published events exist)
- [x] **TC-F5-04**: Hero Reservation CTA Link (Verify CTA routes to the correct event page)
- [x] **TC-F5-05**: Ignored Unpublished Featured Event (Verify unpublished featured event is ignored for fallback upcoming)
- [x] **TC-F5-06**: Featured Event is in the Past (Verify past event explicitly set as featured is still showcased)
- [x] **TC-F5-07**: Empty Cover Image Fallback (Verify null cover_image doesn't crash hero, uses default style)
- [x] **TC-F5-08**: Revalidation Synchronization (Verify hero refreshes correctly on status change)
- [x] **TC-F5-09**: Hero Text Overflow Handling (Verify long title/tagline text doesn't overflow hero boundaries)
- [x] **TC-F5-10**: Fallback Event Empty Cover Image (Verify fallback event uses pattern when cover_image is null)

### Cross-Feature Combinations (Tier 3)
- [x] **TC-COMB-01**: Featured Transition Hero Update (F3 + F5) (Verify hero updates to B after admin marks B featured)
- [x] **TC-COMB-02**: Live Toggle Dynamic Navbar (F2 + F4) (Verify navbar live tab reflects changes in admin panel toggles)
- [x] **TC-COMB-03**: Separation of Live and Featured States (F3 + F4 + F5) (Verify B becomes featured but live tab stays for A)
- [x] **TC-COMB-04**: Cascade Deletion of Live/Featured Event (F1 + F4 + F5) (Verify deleting live/featured event triggers fallbacks correctly)
- [x] **TC-COMB-05**: Past Event Showcase Transition (F3 + F5) (Verify unfeaturing past event falls back to next upcoming)

### Real-World Application Scenarios (Tier 4)
- [x] **TC-SCEN-01**: End-to-End Live Stream Event Lifecycle (Draft -> Publish -> Live -> End -> Unlive flow)
- [x] **TC-SCEN-02**: Pre-Event Hero Showcase to Live Transition (Promo hero gets a pulsing live badge and navbar tab when live goes true)
- [x] **TC-SCEN-03**: Recovery from Accidental Event Deletion (Deleting active featured live event doesn't crash app, triggers fallback)
- [x] **TC-SCEN-04**: Concurrent Multi-Admin Feature Overwrites (Concurrency check: serialization prevents multiple featured events)
- [x] **TC-SCEN-05**: Off-Season Maintenance Mode (Event Drought fallback checks for hero, upcoming grid, and navbar)
