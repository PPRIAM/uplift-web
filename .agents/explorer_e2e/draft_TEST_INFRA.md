# E2E Test Infrastructure Specification & Test Plan (Draft)

This document outlines the test philosophy, feature inventory, test architecture, and comprehensive 4-tier test cases designed for validating the new Featured Event Showcase and Dynamic Live Routing features for the UPLIFT 2.0 web platform.

---

## 1. Test Philosophy

To guarantee the reliability, performance, and security of the UPLIFT 2.0 platform under real-world conditions, our testing approach combines database-level schema constraints with browser-based End-to-End (E2E) verification.

### Core Principles
1. **Source-of-Truth Validation**: Constraints (such as single-featured exclusivity) must be enforced at the database layer (via SQL triggers) and validated at the user interface level.
2. **Behavior-Driven Testing**: Tests simulate real user workflows using Puppeteer to interact with the DOM, ensuring that user-facing changes (dynamic gating, hero showcasing) render exactly as expected.
3. **Idempotency & Clean State**: Every test run must operate in an isolated environment or reset the state of the database prior to run, guaranteeing consistent, predictable test results.
4. **Resilience & Graceful Degradation**: The client application must handle failures (such as database connection dropouts or missing attributes) without crashing the layout or blocking core user pathways.

---

## 2. Feature Inventory

The test plan targets 5 core features:
* **F1: Supabase Event Schema Update**: Addition of non-nullable `is_featured` and `is_live` boolean columns (default `false`) to the `public.events` table.
* **F2: Admin Control Refactoring**: Integration of `is_featured` and `is_live` toggle elements into the event creation/modification form in `app/admin/events/page.tsx`.
* **F3: Single-Featured Constraint**: Database and application logic ensuring that only one event can be marked as `is_featured = true` at any given time. Setting an event as featured must automatically set all other events to `false`.
* **F4: Dynamic Live Navigation Gating**: Real-time display of the "En direct" tab in the `components/Navbar.tsx` if and only if there is at least one published event with `is_live === true`.
* **F5: Featured Event Hero Showcase**: Display of the featured event inside the homepage hero section (`components/HomePageClient.tsx`), falling back to the next upcoming published event if no featured event exists, and falling back to static default brand content if no events are available.

---

## 3. Test Architecture

### 3.1. Infrastructure Components
* **Test Runner**: Node.js script using Puppeteer (already present in the project's devDependencies) to automate the Chromium browser.
* **Database Client**: Direct Supabase client connections to seed, verify, and clean up test data.
* **Local Web Server**: Next.js development server running on `http://localhost:3000`.

### 3.2. Lifecycle hooks
1. **Pre-test (Setup)**: 
   - Ensure the database has the schema migrations applied.
   - Run seed script to establish a baseline set of events (past, upcoming, drafts).
2. **Execution**:
   - Programmatically login to the admin dashboard.
   - Execute the test cases in sequence.
   - Perform database assertions (via direct Supabase queries) and UI assertions (via Puppeteer DOM querying).
3. **Post-test (Teardown)**:
   - Clean up added/updated test events to return the database to the baseline state.
   - Close the browser and terminate connections.

---

## 4. 4-Tier Test Cases

### Tier 1: Feature Coverage (25 Test Cases - 5 per Feature)

#### F1: Supabase Event Schema Update
* **TC-F1-01: Columns Existence**
  - *Preconditions*: Database migrations are applied.
  - *Steps*: Query the database schema information for table `public.events`.
  - *Expected Result*: Columns `is_featured` and `is_live` exist in the table.
  - *Automation Vector*: Supabase RPC or direct SQL query mapping columns.
* **TC-F1-02: Columns Type Check**
  - *Preconditions*: Database migrations are applied.
  - *Steps*: Inspect columns data type for `is_featured` and `is_live` in `public.events`.
  - *Expected Result*: Both columns are of type `boolean` (or `bool`).
  - *Automation Vector*: SQL query in test client.
* **TC-F1-03: Nullability Check**
  - *Preconditions*: Database migrations are applied.
  - *Steps*: Check the nullability constraint of the columns.
  - *Expected Result*: Both columns are set to `NOT NULL` (is_nullable = 'NO').
  - *Automation Vector*: SQL schema inspector.
* **TC-F1-04: Default Values Verification**
  - *Preconditions*: None.
  - *Steps*: Insert a new event record specifying only the required fields (name, description, date_time, location_name) and omitting `is_featured` and `is_live`.
  - *Expected Result*: The record is saved successfully and both `is_featured` and `is_live` are set to `false`.
  - *Automation Vector*: Supabase DB client insert.
* **TC-F1-05: Client Query Verification**
  - *Preconditions*: At least one event exists.
  - *Steps*: Execute a `select('*')` query on the `events` table using the Supabase client.
  - *Expected Result*: The returned objects contain the properties `is_featured` and `is_live` as booleans.
  - *Automation Vector*: Supabase Client query check.

#### F2: Admin Control Refactoring
* **TC-F2-01: Form Input Controls Presence**
  - *Preconditions*: Admin is logged in and on the admin events page (`/admin/events`).
  - *Steps*: Click on the "Créer un événement" button to open the modal.
  - *Expected Result*: The modal contains two distinct checkable controls (checkboxes/switches) labeled for "Featured" and "Live" status.
  - *Automation Vector*: Puppeteer DOM selector assertion.
* **TC-F2-02: Form Creation Defaults**
  - *Preconditions*: Admin is logged in and on `/admin/events`.
  - *Steps*: Open the create event modal.
  - *Expected Result*: The toggles for `is_featured` and `is_live` are in their unchecked (false) state.
  - *Automation Vector*: Puppeteer input checked property assertion.
* **TC-F2-03: Form Load on Edit**
  - *Preconditions*: A test event exists with `is_featured = true` and `is_live = false`. Admin is logged in.
  - *Steps*: Click the "Modifier" (Edit) button for that event.
  - *Expected Result*: The modal displays the "Featured" toggle as checked and the "Live" toggle as unchecked.
  - *Automation Vector*: Puppeteer DOM inspection of checked states.
* **TC-F2-04: Save New Event with Attributes**
  - *Preconditions*: Admin is logged in.
  - *Steps*: Open create modal, enter all details, check "Featured" and "Live", click "Créer".
  - *Expected Result*: Form closes, event appears in list, and database record has both `is_featured` and `is_live` set to `true`.
  - *Automation Vector*: Puppeteer form fills + Supabase client query.
* **TC-F2-05: Update Toggles on Existing Event**
  - *Preconditions*: A test event exists with `is_featured = true` and `is_live = true`. Admin is logged in.
  - *Steps*: Open edit modal for the event, uncheck both toggles, click "Enregistrer".
  - *Expected Result*: Event saves, database record shows `is_featured = false` and `is_live = false`.
  - *Automation Vector*: Puppeteer clicks + Supabase client query.

#### F3: Single-Featured Constraint
* **TC-F3-01: Single-Featured on New Event Insertion**
  - *Preconditions*: Event A has `is_featured = true`. Admin is logged in.
  - *Steps*: Create a new Event B with `is_featured = true` checked. Save it.
  - *Expected Result*: Event B is successfully saved with `is_featured = true`, and Event A is updated to `is_featured = false` in the database.
  - *Automation Vector*: Puppeteer creation flow + Supabase client verification.
* **TC-F3-02: Single-Featured on Existing Event Update**
  - *Preconditions*: Event A has `is_featured = true`. Event B has `is_featured = false`. Admin is logged in.
  - *Steps*: Edit Event B, check the "Featured" toggle, click "Enregistrer".
  - *Expected Result*: Event B becomes featured, Event A is updated to `is_featured = false`.
  - *Automation Vector*: Puppeteer update flow + database verification.
* **TC-F3-03: Database Trigger Level Enforcement**
  - *Preconditions*: Event A is `is_featured = true`.
  - *Steps*: Execute a direct SQL update query to set Event B to `is_featured = true`.
  - *Expected Result*: The query succeeds, and Event A is automatically updated to `is_featured = false` by the DB trigger.
  - *Automation Vector*: Direct SQL query + verify database state.
* **TC-F3-04: Toggling Featured Off Leaves Zero Featured**
  - *Preconditions*: Event A is `is_featured = true`. Admin is logged in.
  - *Steps*: Edit Event A, uncheck "Featured", click "Enregistrer".
  - *Expected Result*: Event A is saved with `is_featured = false`. All events in the database now have `is_featured = false`.
  - *Automation Vector*: Puppeteer edit + database query.
* **TC-F3-05: Admin UI Table Row Updates**
  - *Preconditions*: Event A is `is_featured = true`. Event B is `is_featured = false`. Admin is logged in.
  - *Steps*: Edit Event B to be featured. Click "Enregistrer". Inspect the table row statuses on the admin page.
  - *Expected Result*: Only Event B's row indicates it is featured; Event A's row updates to show it is no longer featured.
  - *Automation Vector*: Puppeteer table content evaluation.

#### F4: Dynamic Live Navigation Gating
* **TC-F4-01: Navbar Displays Live Tab When Active Event is Live**
  - *Preconditions*: A published event exists with `is_live = true`.
  - *Steps*: Navigate to the homepage (`/`) as a public user.
  - *Expected Result*: The navigation bar contains the "En direct" (Live) link.
  - *Automation Vector*: Puppeteer selector search for `a[href="/live"]`.
* **TC-F4-02: Navbar Hides Live Tab When No Events are Live**
  - *Preconditions*: All published events have `is_live = false`.
  - *Steps*: Navigate to the homepage (`/`) as a public user.
  - *Expected Result*: The navigation bar does NOT contain the "En direct" link.
  - *Automation Vector*: Puppeteer element absence assertion.
* **TC-F4-03: Mobile Navbar Gating**
  - *Preconditions*: A published event exists with `is_live = true`. Viewport is set to mobile (375x812).
  - *Steps*: Load the homepage, click the hamburger menu button.
  - *Expected Result*: The mobile menu opens and contains the "En direct" link.
  - *Automation Vector*: Puppeteer click + menu visibility check.
* **TC-F4-04: Mobile Navbar Gating When Hidden**
  - *Preconditions*: No published events have `is_live = true`. Viewport is mobile.
  - *Steps*: Load the homepage, click the hamburger menu button.
  - *Expected Result*: The mobile menu opens and does NOT contain the "En direct" link.
  - *Automation Vector*: Puppeteer menu check.
* **TC-F4-05: Unpublished Live Event Gating**
  - *Preconditions*: An event has `is_live = true` but `published = false`. No other events are live.
  - *Steps*: Navigate to the homepage.
  - *Expected Result*: The "En direct" tab is hidden in the navbar because the event is not published.
  - *Automation Vector*: Puppeteer check.

#### F5: Featured Event Hero Showcase
* **TC-F5-01: Hero Displays Featured Event**
  - *Preconditions*: Event A is published and `is_featured = true`.
  - *Steps*: Navigate to the homepage (`/`).
  - *Expected Result*: The hero section displays Event A's title, tagline, and cover image.
  - *Automation Vector*: Puppeteer DOM text extraction and comparison.
* **TC-F5-02: Hero Fallback to Next Upcoming Event**
  - *Preconditions*: No event has `is_featured = true`. Event B is the earliest upcoming published event.
  - *Steps*: Navigate to the homepage (`/`).
  - *Expected Result*: The hero section displays Event B's details.
  - *Automation Vector*: Puppeteer DOM verification.
* **TC-F5-03: Hero Default Brand Fallback**
  - *Preconditions*: No events exist in the database (or zero published events exist).
  - *Steps*: Navigate to the homepage (`/`).
  - *Expected Result*: The hero displays the default, static brand content ("La voix de la nouvelle génération") without throwing any console or rendering errors.
  - *Automation Vector*: Puppeteer page text + error log inspection.
* **TC-F5-04: Hero Reservation CTA Link**
  - *Preconditions*: Event A is featured.
  - *Steps*: Navigate to the homepage, click the main CTA in the hero section ("Réserver ma place" or "S'inscrire").
  - *Expected Result*: Page navigates to `/events/[Event-A-ID]`.
  - *Automation Vector*: Puppeteer click + URL location assertion.
* **TC-F5-05: Ignored Unpublished Featured Event**
  - *Preconditions*: Event A has `is_featured = true` but `published = false`. Event B is an upcoming published event.
  - *Steps*: Navigate to the homepage (`/`).
  - *Expected Result*: The hero displays Event B's details instead of Event A.
  - *Automation Vector*: Puppeteer DOM verification.

---

### Tier 2: Boundary & Corner Cases (25 Test Cases - 5 per Feature)

#### F1: Supabase Event Schema Update
* **TC-F1-06: Schema Migration Idempotency**
  - *Preconditions*: The schema modifications have already been applied.
  - *Steps*: Execute the schema migration SQL script again.
  - *Expected Result*: The script finishes successfully without errors (e.g., "column already exists").
  - *Automation Vector*: Command execution of SQL script + exit code assertion.
* **TC-F1-07: Legacy Data Backfilling**
  - *Preconditions*: Pre-existing events exist in the database before columns are added.
  - *Steps*: Add `is_featured` and `is_live` columns to the database. Query the legacy records.
  - *Expected Result*: Pre-existing records are successfully read with both attributes populated as `false` (no null values).
  - *Automation Vector*: SQL migration test.
* **TC-F1-08: NULL Insertion Rejection**
  - *Preconditions*: Database connection is established.
  - *Steps*: Attempt to insert an event with explicit `is_featured = NULL` or `is_live = NULL`.
  - *Expected Result*: The database rejects the insert operation with a "null value in column violates not-null constraint" error.
  - *Automation Vector*: Direct Supabase client insertion try/catch validation.
* **TC-F1-09: Schema Backup and Restore Integrity**
  - *Preconditions*: Backup tools are configured.
  - *Steps*: Take a schema backup of `public.events`, delete the table, and restore it.
  - *Expected Result*: Restore completes successfully with `is_featured` and `is_live` attributes and constraints fully intact.
  - *Automation Vector*: Scripted pg_dump + pg_restore.
* **TC-F1-10: RLS R/W Constraints on Columns**
  - *Preconditions*: An unauthenticated public user client is initialized.
  - *Steps*: Attempt to update the `is_featured` column of an event using public credentials.
  - *Expected Result*: The operation fails with an RLS access policy violation.
  - *Automation Vector*: Supabase public client update request.

#### F2: Admin Control Refactoring
* **TC-F2-06: Form Edit Cancel Operation**
  - *Preconditions*: Event A is `is_featured = false` and `is_live = false`. Admin is logged in.
  - *Steps*: Open edit modal for Event A, toggle both to `true`, and click "Annuler" (Cancel).
  - *Expected Result*: The modal closes, the event in the admin list remains unchanged, and a database query confirms the values are still `false`.
  - *Automation Vector*: Puppeteer click cancel + Supabase client query.
* **TC-F2-07: Rapid Toggle Interactivity**
  - *Preconditions*: Admin is logged in and edit modal is open.
  - *Steps*: Rapidly check and uncheck the `is_featured` and `is_live` checkboxes 20 times in 2 seconds.
  - *Expected Result*: UI does not lag or freeze, and the final state on form submission matches the final state of the toggles.
  - *Automation Vector*: Puppeteer rapid click script.
* **TC-F2-08: Save Save Fail Handling**
  - *Preconditions*: Admin is logged in. Database is intentionally disconnected/slowed down.
  - *Steps*: Edit toggles, click "Enregistrer".
  - *Expected Result*: An error alert is shown to the user, and the modal remains open with the modified toggle states preserved.
  - *Automation Vector*: Mock network intercept + alert dialog monitoring.
* **TC-F2-09: Form Validation Integration**
  - *Preconditions*: Admin is logged in.
  - *Steps*: Open edit modal, clear the required "Titre" (Name) input, toggle `is_live` to `true`, and click "Enregistrer".
  - *Expected Result*: The page blocks submission, highlights the Title validation error, and does not update the database.
  - *Automation Vector*: Puppeteer text entry clearing + error state detection.
* **TC-F2-10: Expired Session on Save**
  - *Preconditions*: Admin is logged in.
  - *Steps*: Open edit modal, delete the auth cookie/session token (simulate expiration), toggle a field, click "Enregistrer".
  - *Expected Result*: Request fails, user is redirected to `/login`, and the DB changes are not applied.
  - *Automation Vector*: Puppeteer cookie deletion + page redirect verification.

#### F3: Single-Featured Constraint
* **TC-F3-06: Featured Re-save Idempotency**
  - *Preconditions*: Event A is `is_featured = true`.
  - *Steps*: Open the edit modal for Event A, make no changes, click "Enregistrer".
  - *Expected Result*: Event A remains `is_featured = true`, and no trigger loops are created.
  - *Automation Vector*: Puppeteer save + check event state.
* **TC-F3-07: Featured Event Deletion Handling**
  - *Preconditions*: Event A is `is_featured = true`.
  - *Steps*: Delete Event A from the database or via the Admin interface.
  - *Expected Result*: Event A is successfully deleted, and a database check confirms that all remaining events have `is_featured = false` (no cascading errors).
  - *Automation Vector*: Puppeteer delete click + database check.
* **TC-F3-08: Concurrent Featured Saves (Race Conditions)**
  - *Preconditions*: Two admin clients are connected. Event A and Event B are unfeatured.
  - *Steps*: Both clients send updates concurrently to mark their respective event as featured (`is_featured = true`).
  - *Expected Result*: The database serializes the transactions so that only one event remains `is_featured = true` at the end of both operations.
  - *Automation Vector*: Parallel Promise updates using Supabase client.
* **TC-F3-09: Saving Non-Featured Event**
  - *Preconditions*: Event A is `is_featured = true`. Event B is `is_featured = false`.
  - *Steps*: Edit Event B's tagline, leaving `is_featured` as `false`, and click "Enregistrer".
  - *Expected Result*: Event B tagline is updated, Event B is `is_featured = false`, and Event A remains `is_featured = true`.
  - *Automation Vector*: Puppeteer save + database query.
* **TC-F3-10: Exclusivity Trigger Side-Effects Check**
  - *Preconditions*: Event A is `is_featured = true`. Event B is `is_featured = false`.
  - *Steps*: Edit Event B to be featured.
  - *Expected Result*: Event B's trigger updates Event A's `is_featured` to `false` without modifying any other properties of Event A (e.g., date, name, capacity remain untouched).
  - *Automation Vector*: Database field comparison before/after trigger.

#### F4: Dynamic Live Navigation Gating
* **TC-F4-06: Live Event Deletion**
  - *Preconditions*: Event A is the only live event in the database (`is_live = true`).
  - *Steps*: Delete Event A. Navigate to homepage.
  - *Expected Result*: The "En direct" link is immediately removed from the navigation bar.
  - *Automation Vector*: Database deletion + page reload check.
* **TC-F4-07: Direct Access Gating / Route Guard**
  - *Preconditions*: No events are currently live.
  - *Steps*: Programmatically navigate directly to `/live`.
  - *Expected Result*: The user is redirected back to the home page `/` or is shown a fallback screen indicating that no live stream is active.
  - *Automation Vector*: Puppeteer navigation + URL tracking.
* **TC-F4-08: Next.js Cache Revalidation Gating**
  - *Preconditions*: No events are live. User loads homepage.
  - *Steps*: Update Event A to `is_live = true` in the DB. User clicks another link (like `/about`) and then back to `/`.
  - *Expected Result*: The navbar immediately updates to show the "En direct" tab (indicating router cache does not block real-time visibility).
  - *Automation Vector*: Puppeteer transition test.
* **TC-F4-09: DB Timeout Fallback**
  - *Preconditions*: Database connection is simulated as timed out.
  - *Steps*: Navigate to homepage.
  - *Expected Result*: The navigation bar renders correctly without the "En direct" tab, rather than failing to load the whole header.
  - *Automation Vector*: Intercepting Supabase API call and returning timeout error.
* **TC-F4-10: Past Live Events Gating**
  - *Preconditions*: Event A is in the past and marked `is_live = true`, but is unpublished (`published = false`).
  - *Steps*: Load the homepage.
  - *Expected Result*: The "En direct" link is hidden.
  - *Automation Vector*: Puppeteer check.

#### F5: Featured Event Hero Showcase
* **TC-F5-06: Featured Event is in the Past**
  - *Preconditions*: Event A is in the past (date_time < current time) and is marked `is_featured = true`.
  - *Steps*: Navigate to the homepage (`/`).
  - *Expected Result*: The hero section showcases Event A (since the admin explicitly marked it as featured, overriding the date check).
  - *Automation Vector*: Puppeteer DOM checks.
* **TC-F5-07: Empty Cover Image Fallback**
  - *Preconditions*: Event A is featured, but its `cover_image` field is empty.
  - *Steps*: Navigate to the homepage (`/`).
  - *Expected Result*: The hero section displays Event A's details, using a default background image/fallback styling, without breaking CSS layouts.
  - *Automation Vector*: CSS styling check.
* **TC-F5-08: Revalidation Synchronization**
  - *Preconditions*: Event A is featured.
  - *Steps*: Update the featured status to Event B. Trigger Next.js revalidation (via webhook or API revalidation endpoint).
  - *Expected Result*: The homepage hero immediately displays Event B instead of Event A.
  - *Automation Vector*: Web request to revalidation endpoint + reload check.
* **TC-F5-09: Hero Text Overflow Handling**
  - *Preconditions*: Event A is featured and has a name containing 250 characters and a tagline containing 500 characters.
  - *Steps*: Load the homepage.
  - *Expected Result*: The text wraps cleanly, does not overflow the hero boundaries, and doesn't overlap CTA buttons.
  - *Automation Vector*: Element height and collision checking.
* **TC-F5-10: Fallback Event Empty Cover Image**
  - *Preconditions*: No event is featured. The next upcoming event has an empty `cover_image`.
  - *Steps*: Navigate to the homepage.
  - *Expected Result*: The hero displays the upcoming event using a high-quality default fallback background pattern or image.
  - *Automation Vector*: Puppeteer image load checks.

---

### Tier 3: Cross-Feature Combinations (5 Test Cases)

* **TC-COMB-01: Featured Transition Hero Update (F3 + F5)**
  - *Preconditions*: Event A is published and `is_featured = true`. Event B is published and `is_featured = false`.
  - *Steps*: Open admin events page, edit Event B to be featured. Save. Navigate to homepage.
  - *Expected Result*: The homepage hero section updates to showcase Event B. Event A is no longer displayed.
  - *Automation Vector*: Puppeteer admin form toggle -> homepage verification.
* **TC-COMB-02: Live Toggle Dynamic Navbar (F2 + F4)**
  - *Preconditions*: No events are live. Navbar does not show "En direct".
  - *Steps*: Admin edits Event A, sets `is_live = true`, saves. Public user navigates to `/`. Admin edits Event A, sets `is_live = false`, saves. Public user refreshes homepage.
  - *Expected Result*: "En direct" tab appears after the first save, and disappears after the second save.
  - *Automation Vector*: Multi-tab Puppeteer simulation (Admin + Public).
* **TC-COMB-03: Separation of Live and Featured States (F3 + F4 + F5)**
  - *Preconditions*: Event A is `is_featured = true` and `is_live = true`. Event B is `is_featured = false` and `is_live = false`.
  - *Steps*: Admin edits Event B to be featured (`is_featured = true`). Save.
  - *Expected Result*: Event B is now showcased in the homepage hero. The "En direct" tab remains visible in the navbar because Event A, although no longer featured, remains `is_live = true` in the database.
  - *Automation Vector*: DB status query + homepage elements checks.
* **TC-COMB-04: Cascade Deletion of Live/Featured Event (F1 + F4 + F5)**
  - *Preconditions*: Event A is published, featured, and live.
  - *Steps*: Admin deletes Event A. Public user reloads homepage.
  - *Expected Result*: The hero falls back to showing the next upcoming event. The "En direct" tab disappears from the navbar.
  - *Automation Vector*: Puppeteer delete + homepage reload checks.
* **TC-COMB-05: Past Event Showcase Transition (F3 + F5)**
  - *Preconditions*: Event A (upcoming) is featured. Event B (upcoming) is not featured.
  - *Steps*: Wait until current time passes Event A's time. Admin edits Event A to disable featured status.
  - *Expected Result*: The homepage hero falls back to showcasing Event B (the next upcoming event).
  - *Automation Vector*: Time simulation/seeding + Puppeteer check.

---

### Tier 4: Real-World Application Scenarios (5 Test Cases)

* **TC-SCEN-01: End-to-End Live Stream Event Lifecycle**
  - *Preconditions*: An event starts as a draft.
  - *Steps*:
    1. Admin publishes the event.
    2. Admin checks "Live" toggle on the start of the event.
    3. Public users see "En direct" tab in the navbar, click it, and are directed to the live streaming player interface (`/live`).
    4. Event ends; Admin toggles "Live" off.
    5. Public users refresh and see the "En direct" tab is gone. Clicking direct URL redirects them away.
  - *Expected Result*: The full lifecycle completes smoothly, streaming indicator is shown/hidden dynamically, navigation gates open and close securely.
  - *Automation Vector*: Sequential Puppeteer actions simulating both Admin and user roles.
* **TC-SCEN-02: Pre-Event Hero Showcase to Live Transition**
  - *Preconditions*: Event A is featured and upcoming.
  - *Steps*:
    1. Public user visits homepage, views Event A in the hero section, and clicks the registration button to reserve a ticket.
    2. The day of the event arrives. Admin toggles "Live" to `true`.
    3. User visits homepage. The hero still showcases Event A, but also displays a pulsing "Live Now" badge. The navbar now includes "En direct".
  - *Expected Result*: Promotional flow upgrades into a live-broadcast dashboard experience seamlessly.
  - *Automation Vector*: State transitions + DOM content checks.
* **TC-SCEN-03: Recovery from Accidental Event Deletion**
  - *Preconditions*: Event A is the featured live event.
  - *Steps*:
    1. Admin accidentally deletes Event A.
    2. User refreshes homepage.
  - *Expected Result*: Homepage does not crash. Hero displays next upcoming event. "En direct" tab disappears. No active connections to deleted events fail silently.
  - *Automation Vector*: Puppeteer check.
* **TC-SCEN-04: Concurrent Multi-Admin Feature Overwrites**
  - *Preconditions*: Admin A and Admin B both open the event editor at the same time.
  - *Steps*:
    1. Admin A edits Event 1 and checks "Featured".
    2. Admin B edits Event 2 and checks "Featured".
    3. Both click save at nearly the same time.
  - *Expected Result*: Database transaction integrity is preserved. Only one event is saved as featured, and the homepage hero updates to reflect that single featured event without throwing server errors.
  - *Automation Vector*: Scripted concurrent HTTP form saves.
* **TC-SCEN-05: Off-Season Maintenance Mode (Event Drought)**
  - *Preconditions*: All events in the database are in the past.
  - *Steps*:
    1. Admin unfeatures all past events (or they expire).
    2. Public user visits homepage.
  - *Expected Result*: No event is featured or upcoming. The hero defaults to UPLIFT's standard corporate brand text, no event cards are rendered in "Evenements a venir" (displays "Aucun événement trouvé"), and the navbar does not show the "En direct" tab.
  - *Automation Vector*: Seeding database with only past events + UI checks.
