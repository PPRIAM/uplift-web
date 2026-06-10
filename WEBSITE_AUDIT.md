# UPLIFT 2.0 — Website Audit Report

**Auditor:** Antigravity Debugger Agent
**Date:** 2026-06-08
**Scope:** components/Navbar.tsx, components/Footer.tsx, components/HomePageClient.tsx, app/events/page.tsx, app/speakers/page.tsx, app/login/page.tsx, app/about/page.tsx, app/confirmation/page.tsx, app/my-reservations/page.tsx, app/globals.css

---

## Summary

| File | Issues Found | Status |
|------|-------------|--------|
| app/globals.css | 7x #6c47ff purple color | FIXED |
| app/about/page.tsx | 2x rgba(104,66,255,...) purple shadow | FIXED |
| components/HomePageClient.tsx | any[] prop types (5 occurrences) | FIXED |
| app/my-reservations/page.tsx | Missing aria-label on file input | FIXED |
| components/Navbar.tsx | No issues found | CLEAN |
| components/Footer.tsx | No issues found | CLEAN |
| app/events/page.tsx | No issues found | CLEAN |
| app/speakers/page.tsx | No issues found | CLEAN |
| app/login/page.tsx | No issues found (redirect-only page) | CLEAN |
| app/confirmation/page.tsx | No issues found | CLEAN |

---

## Critical Bug: Brand Primary Color (#6c47ff to #0e1ad4)

### app/globals.css — 7 occurrences fixed

The CSS design system had the wrong brand primary purple (#6c47ff) hard-coded in 7 utility class rules.
All replaced with the correct cobalt blue (#0e1ad4) as readable rgba() values.

| Selector | Was | Fixed To |
|----------|-----|---------|
| .btn-secondary:hover | #6c47ff1a | rgba(14, 26, 212, 0.1) |
| .badge-primary (bg) | #6c47ff26 | rgba(14, 26, 212, 0.15) |
| .badge-primary (border) | #6c47ff4d | rgba(14, 26, 212, 0.3) |
| ::selection | #6c47ff4d | rgba(14, 26, 212, 0.3) |
| .data-table tr:hover td | #6c47ff0d | rgba(14, 26, 212, 0.05) |
| .sidebar-item:hover | #6c47ff1a | rgba(14, 26, 212, 0.1) |
| .sidebar-item.active | #6c47ff26 | rgba(14, 26, 212, 0.15) |

### app/about/page.tsx — 2 occurrences fixed

Two CTA buttons used rgba(104,66,255,...) (the RGB form of #6c47ff) in Tailwind hover shadow classes.

| Location | Was | Fixed To |
|----------|-----|---------|
| Hero CTA button (line 37) | hover:shadow-[0_0_30px_rgba(104,66,255,0.3)] | hover:shadow-[0_0_30px_rgba(14,26,212,0.3)] |
| Bottom CTA button (line 147) | hover:shadow-[0_0_30px_rgba(104,66,255,0.2)] | hover:shadow-[0_0_30px_rgba(14,26,212,0.2)] |

---

## TypeScript Issues

### components/HomePageClient.tsx

Issue: All 5 props used any[] or any types.
Fix: Introduced three proper interfaces:
- UpcomingEvent (id, name, description?, type?, speaker_name?, speaker_role?, speaker_image?)
- FeaturedSpeaker (id, full_name, role?, profile_image?)
- FeaturedEvent (id?, organizer?, city?, date_time?, location_name?, booked_spots?, total_spots?, tagline?)

---

## Accessibility Issues

### app/my-reservations/page.tsx

Issue: Hidden file input (opacity:0) for payment proof had no accessible label.
Fix: Added aria-label="Importer une preuve de paiement" to the input element.

---

## Layout / Navbar Padding Audit

Root layout app/layout.tsx correctly includes pt-[72px] on the main wrapper:
  <main className="min-h-[100dvh] pt-[72px]">

All sub-layouts (about, events, speakers, events/[id]) return fragments and add no extra padding.
No page component adds its own redundant pt-[72px]. Layout is clean.

---

## Nested <main> Tag Audit

Full project-wide search confirmed ONLY ONE <main> tag in the entire codebase,
located correctly in app/layout.tsx line 129. No nested mains anywhere. CLEAN.

---

## Clean Files (No Issues Found)

### components/Navbar.tsx
- Correct 72px height for navbar
- aria-label="Menu" on hamburger button
- No hardcoded #6c47ff — active states use rgba(14, 26, 212, ...) correctly
- Mobile drawer uses pt-[72px] to clear fixed navbar
- alt="UPLIFT 2.0" on logo image

### components/Footer.tsx
- Uses CSS variables throughout (var(--text-muted), var(--bg-elevated), etc.)
- All social icon anchors have aria-label attributes
- All SVG decorative icons have aria-hidden="true"
- Newsletter form has proper required and type="email"

### app/events/page.tsx + EventsClient.tsx
- No nested <main> - uses <div> at root
- Event cover images have proper alt={event.name}
- Filter buttons use accessible color contrast via CSS variables
- No purple color occurrences

### app/speakers/page.tsx + SpeakersClient.tsx
- No nested <main> - uses <div> at root
- Speaker avatars have alt={speaker.name}
- Social links have target="_blank" rel="noopener noreferrer"

### app/login/page.tsx
- Server-side redirect-only page - no rendering concerns
- Properly preserves ?redirect= query param

### app/about/page.tsx
- Clean layout, no nested main
- Purple shadow bug fixed (see Critical section)

### app/confirmation/page.tsx
- Wrapped in Suspense - correct for useSearchParams()
- All three state branches render proper UI
- Uses CSS variables for colors throughout

### app/my-reservations/page.tsx
- Wrapped in Suspense - correct for useSearchParams()
- GuestCard has proper htmlFor/id associations for all form fields
- Remove guest button has aria-label
- File input accessibility fixed (see Accessibility section)

---

## Design System Consistency

| Token | Status | Notes |
|-------|--------|-------|
| var(--brand-primary) | CORRECT | Active states, links, CTAs |
| var(--text-muted) | CORRECT | Placeholder text, secondary content |
| var(--bg-elevated) | CORRECT | Input backgrounds, surface elevation |
| border-radius 8px/10px/16px/28px | CORRECT | Matches design system |
| Brand primary color #0e1ad4 | FIXED | Was #6c47ff purple, now cobalt everywhere |
