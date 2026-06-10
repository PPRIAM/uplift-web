# Investigation Report: Layout and Styling Inconsistencies on `/events/[id]`

## Executive Summary
This report details the root causes of the severe layout and styling inconsistencies observed on the `/events/[id]` pages. The primary issue stems from a migration to Tailwind CSS v4 without correctly mapping the custom design tokens for spacing (`md`, `lg`, `xl`, etc.) in the global stylesheet. Additionally, there is a fundamental architectural divergence between the documented design system (`DESIGN.md`) and the currently implemented global styles.

## 1. Identified Causes of Layout/Style Inconsistencies

### Cause 1: Missing Spacing Tokens in Tailwind v4 `@theme` (Primary Cause)
* **Description:** The project uses custom classes like `p-md`, `gap-md`, `mb-xl`, `py-xl`, and `px-md` across its React components (e.g., `app/events/[id]/page.tsx` and `EventClient.tsx`). Under Tailwind CSS v4, custom spacing tokens must be explicitly declared as CSS variables prefixed with `--spacing-` within the `@theme` block in the main CSS file. Because these variables are completely missing from `app/globals.css`, Tailwind fails to generate the corresponding utility classes.
* **Impact:** This causes the UI components to lose all padding, margin, and gaps. Grids collapse, elements bunch together (as seen with the "Intervenants" cards), and spacing hierarchy is destroyed.
* **Level of Confidence:** High (100%). Inspecting the generated CSS and `app/globals.css` confirms that `gap-md`, `mb-xl`, etc., are not being outputted by Tailwind v4.

### Cause 2: Design System Divergence (Color & Typography)
* **Description:** There is a significant inconsistency between the expected design system documented in `DESIGN.md` ("Élan Violet") and the actual implementation in `app/globals.css` ("Cobalt Blue").
  * `DESIGN.md` specifies a premium violet aesthetic (`--brand-primary: #6842FF`), soft lavender backdrops, and geometric fonts (`Outfit`, `Satoshi`).
  * `app/globals.css` currently implements a cobalt blue aesthetic (`--brand-accent: #0E1AD4;`), harsh borders (`--border-color: #0F172A;`), and uses older fonts (`theBoldFont`, `GeoForm`).
* **Impact:** This creates a fragmented visual experience where the styling rules applied do not match the intended high-level architectural design.
* **Level of Confidence:** High. Confirmed by cross-referencing `DESIGN.md` and `app/globals.css`.

### Cause 3: Deprecated/Custom Classes Mixing with Tailwind Utilities
* **Description:** The codebase relies on complex, handcrafted CSS components (e.g., `.card`, `.btn-primary`) mixed with Tailwind utility classes. Inconsistencies arise when these handcrafted CSS classes define rigid padding (`padding: 32px`) while the layout wrappers use non-existent Tailwind utility classes (`p-md`).
* **Impact:** Unpredictable component behavior and responsive breakdowns, particularly when breakpoints change.
* **Level of Confidence:** Medium-High.

## 2. Affected Files and Components
* `app/globals.css` (Missing `@theme` variables)
* `app/events/[id]/page.tsx` (Relies heavily on `gap-md`, `mb-2xl`, `p-md`, `px-lg`)
* `app/events/[id]/EventClient.tsx` (Relies on `mb-md`, `gap-sm`, `p-lg`)
* `app/events/EventsClient.tsx` (Relies on `gap-md`, `mb-lg`)
* `components/home/SpeakersSection.tsx` and `app/speakers/SpeakersClient.tsx`

## 3. Recommended Fixes

### Immediate Fix (Code-Level)
To immediately resolve the broken layout without refactoring the entire site, we must inject the missing spacing tokens into the `@theme` block in `app/globals.css`.

```css
/* In app/globals.css inside the @theme block */
@theme {
  /* Existing definitions */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 80px;
}
```
* **Explanation:** Tailwind v4 uses the `--spacing-*` pattern to dynamically generate utilities like `m-*`, `p-*`, `gap-*`, etc. By defining `--spacing-md: 16px;`, the utility `gap-md` will automatically be generated as `gap: 16px;`, restoring the structural integrity of the pages.

### Long-Term Architectural Fix
Align `app/globals.css` with `DESIGN.md` by fully implementing the "Élan Violet" color tokens, migrating to `Outfit`/`Satoshi` fonts, and removing hardcoded border/shadow values in favor of Tailwind standard shadow utilities.

## 4. Potential Regressions
* **Padding Cascades:** Adding the spacing variables will globally enable utilities like `p-md` and `gap-md`. If developers previously relied on these classes silently failing (rendering with 0px spacing), elements might suddenly gain unexpected whitespace.
* **Component Specificity:** Custom components like `.card` that have hardcoded paddings (e.g., `padding: 32px`) might clash with newly working Tailwind utility classes applied to the same elements. Visual QA will be necessary across all major views (`/events`, `/speakers`, `/live`) after applying the fix.
