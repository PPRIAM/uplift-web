# Original User Request

## 2026-06-07T11:19:50Z

Implement a featured event showcase on the homepage hero and conditional live nav routing for uplift-web based on active Supabase states.

Working directory: D:\UPLIFT20\uplift-web
Integrity mode: demo

## Requirements

### R1. Supabase Event Schema Update
Add boolean columns `is_featured` and `is_live` to the Supabase `events` table (defaulting both to false). Attempt direct migration using database client credentials.

### R2. Admin Control Refactoring
Upgrade the admin panel event management dashboard (`app/admin/events/page.tsx`) to support toggling `is_featured` and `is_live` states. Ensure a single-featured constraint (marking one event as featured should toggle others off).

### R3. Dynamic Live Navigation Gating
Configure the website navigation header (`components/Navbar.tsx`) to dynamically check for active live events. Only display the "En direct" live link if there is at least one published event with `is_live === true`.

### R4. Featured Event Hero Showcase
Redesign the homepage hero section (`components/HomePageClient.tsx`) to dynamically render details of the active featured event, falling back gracefully to the next upcoming event. Show title, cover image, dates, and a ticket booking CTA.

## Acceptance Criteria

### Schema and Database
- [ ] Columns `is_featured` and `is_live` are added to the `events` table.
- [ ] Database client functions read and write to these new attributes correctly.

### Admin Panels
- [ ] Admin event edit/creation form includes active toggle elements for both properties.
- [ ] Saving an event with `is_featured` enabled toggles the featured status off for other events in the DB.

### Client Layout
- [ ] Navigation header hides the "En direct" tab when all events have `is_live === false`.
- [ ] Navigation header displays the "En direct" tab when at least one event has `is_live === true`.
- [ ] The Homepage Hero shows the title, description, and cover image of the featured event.

### Performance & Quality
- [ ] Production build succeeds without errors.
- [ ] E2E layout checks pass on desktop and mobile viewports.
