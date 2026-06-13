# Ticket Currency & Auto Ticket Creation Implementation Plan

**Goal:** Allow administrators to configure ticket currencies (USD/HTG) and automatically create standard tickets when creating events.
**Architecture:** Reuse the existing `description` text column in the `tickets` table to store the currency code ('USD' or 'HTG') at the API layer. Insert default tickets inside the client-side event creator right after a successful event creation response is received.
**Tech Stack:** Next.js, React state/components, Supabase Client SDK, vanilla CSS custom layouts.

---

### Task 1: Add price formatting helper function
**Files:** Modify: `lib/ticketUtils.ts` | Test: `scratch/test-format-price.mjs`
- [ ] Step 1: Write test case in `scratch/test-format-price.mjs` verifying that `formatPrice(15, 'USD')` outputs `"$15"` and `formatPrice(1500, 'HTG')` outputs `"1 500 HTG"`.
- [ ] Step 2: Verify failure by running `node scratch/test-format-price.mjs` (it will fail since the helper is not defined).
- [ ] Step 3: Implement `formatPrice` function in `lib/ticketUtils.ts`.
- [ ] Step 4: Verify pass by running `node scratch/test-format-price.mjs`.

### Task 2: Implement Currency Option in Admin Tickets Page
**Files:** Modify: `app/admin/tickets/page.tsx` | Test: `npm run build`
- [ ] Step 1: Update form state to add `description: 'USD'` and update `openCreate`/`openEdit` to set the currency.
- [ ] Step 2: Add visual segmented button toggles for USD/HTG next to the Price input inside the JSX grid layout.
- [ ] Step 3: Update `handleSave` to pass `description: form.description` into ticket data, and `handleDelete` to show deletion error banners.
- [ ] Step 4: Update the table price columns to format price using `formatPrice` and list starting price (*À partir de...*).
- [ ] Step 5: Verify pass by running `npm run build`.

### Task 3: Render Dynamic Currency on Event Details Page
**Files:** Modify: `app/events/[id]/EventClient.tsx` | Test: `npm run build`
- [ ] Step 1: Import `formatPrice` from `lib/ticketUtils`.
- [ ] Step 2: Replace hardcoded `$` symbols with dynamic calls to `formatPrice(t.price, t.description)` for base tickets and pricing tiers.
- [ ] Step 3: Verify pass by running `npm run build`.

### Task 4: Auto-Create default ticket upon Event Creation
**Files:** Modify: `app/admin/events/page.tsx` | Test: `npm run build`
- [ ] Step 1: Inside `handleSave` method, check if `!editEvent` (creating a new event).
- [ ] Step 2: After the insert query succeeds, retrieve `savedEventId` and call `supabase.from('tickets').insert()` to create a default free Standard ticket with quantity equal to the event's capacity.
- [ ] Step 3: Verify pass by running `npm run build`.
