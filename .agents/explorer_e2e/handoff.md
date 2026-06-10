# Handoff Report - E2E Test Suite Design

## 1. Observation

Direct observations made from codebase investigation:
1. **Legacy Schema vs. Target Schema**: In `supabase_schema.sql` (line 17), the event table only defines a legacy field named `featured`:
   ```sql
   featured BOOLEAN NOT NULL DEFAULT false,
   ```
   Columns `is_featured` and `is_live` are absent from `supabase_schema.sql` and `prisma/schema.prisma` (lines 10-24).
2. **Admin Page Form Inputs**: In `app/admin/events/page.tsx` (lines 43-53), the local state `form` does not contain fields for `is_featured` or `is_live`:
   ```tsx
   const [form, setForm] = useState({
     name: '',
     tagline: '',
     location_name: '',
     city: '',
     date_time: '',
     end_date_time: '',
     description: '',
     capacity: 500,
     cover_image: '' as string,
   });
   ```
   No checkbox or switch for featured/live status is rendered in the modal overlay (lines 348-476).
3. **Static Navigation Tab**: In `components/Navbar.tsx` (lines 25-31), the "En direct" tab is hardcoded:
   ```tsx
   const navLinks = [
     { href: '/', label: 'Accueil' },
     { href: '/events', label: 'Événements' },
     { href: '/speakers', label: 'Voix' },
     { href: '/about', label: 'À propos' },
     { href: '/live', label: 'En direct', isLive: true },
   ];
   ```
   No database query or dynamic condition governs the visibility of the tab.
4. **Hero Data Querying**: In `app/page.tsx` (lines 9-16), the upcoming events query only sorts by date without considering a featured flag:
   ```tsx
   const { data: upcomingEvents } = await supabase
     .from('events')
     .select('id, name, tagline, description, date_time, location_name, city, registered_count, capacity, cover_image')
     .eq('published', true)
     .gt('date_time', new Date().toISOString())
     .order('date_time', { ascending: true })
     .limit(3);
   ```
5. **Existing Test Framework**: In `package.json` (line 40), `puppeteer` is listed in `devDependencies`:
   ```json
   "puppeteer": "^22.0.0"
   ```
   A custom E2E integration test script is available in `verify-layout.mjs` (lines 1-100) running Puppeteer against local port 3000.

---

## 2. Logic Chain

1. **F1 (Database Columns)**: Because `is_featured` and `is_live` do not exist in `supabase_schema.sql` or `prisma/schema.prisma` (Observation 1), the first implementation step must be running a database migration to add these columns.
2. **F2 (Admin Toggles)**: Because the admin page local form state and modal inputs do not handle `is_featured` and `is_live` (Observation 2), the admin panel must be updated to add form toggles and include these boolean flags in the Supabase write payload.
3. **F3 (Single-Featured Exclusivity)**: Because no database-level triggers or application checks exist for single-featured exclusivity, a custom SQL trigger must be registered to set all other events to `is_featured = false` when one event is saved with `is_featured = true`.
4. **F4 (Navbar Gating)**: Because `components/Navbar.tsx` statically includes the live link (Observation 3), a client hook or service must query Supabase for active live events (`is_live = true` and `published = true`) and conditionalize navbar rendering based on the result.
5. **F5 (Hero Showcase & Fallback)**: Because `app/page.tsx` currently pulls the top 3 upcoming events strictly by date (Observation 4), it must be modified to query the featured event first, and fall back to the first upcoming event if no featured event exists.
6. **E2E Infrastructure Selection**: Because `puppeteer` is already present as a devDependency and has a functioning layout script template `verify-layout.mjs` (Observation 5), we should use Puppeteer as our E2E framework. This avoids introducing extra testing dependencies (like Playwright or Cypress) to keep the project light.

---

## 3. Caveats

- **Past Event Showcase**: We assumed that if an admin explicitly marks a past event as `is_featured`, it takes priority and displays in the Hero showcase. However, the business logic might require that past events are never shown in the Hero. We designed tests to cover both interpretations.
- **Client Cache Revalidation**: Next.js App Router utilizes client-side cache and router cache. Dynamic updates to the navigation bar ("En direct" toggle) or homepage Hero showcase might require route revalidation (`router.refresh()` or `revalidatePath`) to reflect immediately without full page reloads.

---

## 4. Conclusion

We have designed a comprehensive 4-tier test plan consisting of 60 detailed test cases:
* **Tier 1 (Feature Coverage)**: 25 test cases (5 per feature F1-F5) validating standard success paths.
* **Tier 2 (Boundary & Corner Cases)**: 25 test cases (5 per feature F1-F5) validating schema constraints, RLS policies, concurrent edits, cancellations, and fallback mechanisms.
* **Tier 3 (Cross-Feature Combinations)**: 5 pairwise test cases verifying that combinations of states (e.g. changing featured while live remains, or cascade deletes) resolve cleanly.
* **Tier 4 (Real-World Application Scenarios)**: 5 sequential end-to-end user stories validating live event lifecycles, promotions, disaster recovery, concurrency, and drought/off-season mode.

The entire test suite is drafted in `draft_TEST_INFRA.md` under our folder.

### Recommendations for the Implementer:
1. **DB Trigger**: Implement F3 (Single-Featured Constraint) via a PostgreSQL trigger (`BEFORE INSERT OR UPDATE`) to ensure database consistency even outside the Next.js UI.
2. **Next.js Revalidation**: Use on-demand revalidation (`res.revalidate`) when saving an event to instantly push Hero or navbar updates to public users.

---

## 5. Verification Method

To independently verify the test plan structure and files:
1. Confirm the existence and contents of the drafted specifications:
   - Check `D:\UPLIFT20\uplift-web\.agents\explorer_e2e\draft_TEST_INFRA.md` to ensure all 60 test cases are present.
   - Check `D:\UPLIFT20\uplift-web\.agents\explorer_e2e\handoff.md` to verify the findings.
2. Verify that `package.json` contains `puppeteer` to justify our framework recommendation:
   - Run `npm run lint` or inspect package dependencies.
