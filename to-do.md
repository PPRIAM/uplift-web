# to-do.md - Roadmap & Refactoring Plan

This roadmap tracks the implementation steps for showcasing a featured event on the homepage hero and dynamically linking live event streams.

---

## Roadmap Checklist

### 1. Supabase Database Updates (Schema & Policies)
- [x] **Task 1.1: Add `is_featured` column to `events`**
  - Type: `boolean`, default: `false`.
  - Purpose: Identifies the active event to feature on the homepage.
  - **SQL ready**: Run `supabase-migration-featured-live.sql` in the Supabase SQL Editor.
- [x] **Task 1.2: Add `is_live` column to `events`**
  - Type: `boolean`, default: `false`.
  - Purpose: Tracks if the event's live stream is currently active.
  - **SQL ready**: Included in same migration file.
- [x] **Task 1.3: Update RLS policies**
  - Ensure public read access is enabled for both columns.

### 2. Admin Panel Dashboard refactoring (`app/admin/events/page.tsx`)
- [x] **Task 2.1: Add checkboxes in creation/edit forms**
  - ✅ "Mettre en avant (Vedette)" and "Marquer en direct (Live)" controls added.
- [x] **Task 2.2: Add toggles in the admin event listings table**
  - ✅ Star icon for featured, Radio icon with pulsing dot for live. Single-featured constraint enforced.

### 3. Dynamic Navbar Live Link (`components/Navbar.tsx`)
- [x] **Task 3.1: Query Supabase dynamically for live events**
  - ✅ Polls every 30s for published events with `is_live === true`.
- [x] **Task 3.2: Render conditional Live Link**
  - ✅ "En direct" tab only appears when a live event is active. Tailwind color classes replaced with CSS variables.

### 4. Featured Event Hero Integration (`app/page.tsx` & `components/HomePageClient.tsx`)
- [x] **Task 4.1: Fetch featured event in page router**
  - ✅ Queries `is_featured = true` first, falls back to nearest upcoming event.
- [x] **Task 4.2: Redesign Homepage Hero Section**
  - ✅ Split layout with event details (left) and cover image card with glassmorphic reservation counter (right). Original hero preserved as fallback.

### 5. Verification & Testing
- [x] **Task 5.1: Build check**
  - ✅ `npm run build` passed — 41/41 pages generated, 0 errors.
- [x] **Task 5.2: Run SQL migration in Supabase**
  - ✅ Executed `supabase-migration-featured-live.sql` in the SQL Editor.
- [x] **Task 5.3: Test admin toggles end-to-end**
  - ✅ Mark an event as featured, verify homepage hero updates.
  - ✅ Mark an event as live, verify "En direct" link appears in navbar.

---

## Future Enhancements
- [ ] Live event ticket/code verification gating (require ticket code to access `/live`)
- [ ] Real-time Supabase subscriptions instead of 30s polling for live status
- [ ] Admin notification when an event goes live
- [ ] Featured event countdown timer on the hero
