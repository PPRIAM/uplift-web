---
name: designing-ui-ux
description: Designs user interfaces and experiences with custom styles, palettes, typography, and UX standards. Use when the user mentions UI, UX, design system, styling, layout, visual design, responsive web, spacing, or interface performance.
---

# Designing UI/UX

Provides searchable design intelligence database of 67 UI styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types across 16 stacks to create stunning, premium user interfaces.

## When to Use
- **New page/project:** Creating landing pages, dashboards, SaaS layouts, e-commerce, or mobile apps.
- **Components:** Drafting cards, modals, navigation bars, forms, tables, or charts.
- **Design Tokens:** Deciding color mood, font pairings, spacing scales, or shadows.
- **UI Quality Pass:** Reviewing UI code for usability, accessibility (WCAG), performance, or dark mode contrast.

## Workflow
1. **Analyze Requirements:** Determine product type (SaaS, portfolio, tool), target audience, and mood keywords.
2. **Generate Design System (REQUIRED):** Run the CLI design generator to set up rules and save a local MASTER.md.
3. **Deep-Dive Search:** Supplement with specific queries for styles, accessibility, or typography as needed.
4. **Implement & Refactor:** Write clean, premium components strictly following the design system tokens.
5. **Verify & Validate:** Run through the pre-delivery checklist to ensure maximum polish and visual delight.

## Instructions

### 1. Generate & Persist Design System
Always bootstrap a new page or feature by running the design system generator. Use the `--persist` flag to create a centralized source of truth (`design-system/MASTER.md`) and page-specific overrides:
```powershell
python .agent/skills/ui-ux/scripts/search.py "<product_type> <mood_keywords>" --design-system --persist -p "<Project_Name>" [--page "<page_name>"]
```
*Hierarchical retrieval rule:* When building a page, check `design-system/<project>/pages/<page>.md` first. If it exists, prioritize its rules over `design-system/<project>/MASTER.md`. Otherwise, use the Master file.

### 2. Search Database for Specific Needs
Run targeted domain searches to get optimized, domain-specific design elements:
```powershell
python .agent/skills/ui-ux/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```
- Available domains: `product` (patterns), `style` (aesthetic prompts/CSS), `color` (palettes), `typography` (font pairings), `google-fonts` (web fonts), `landing` (layouts), `chart` (data viz), `ux` (best practices), `icons` (recommended Phosphor/Heroicons keys).

### 3. Stack Guidelines
Retrieve tech-specific code patterns, do's/don'ts, and implementation examples:
```powershell
python .agent/skills/ui-ux/scripts/search.py "<query>" --stack <stack_name>
```
- Available stacks: `react`, `nextjs`, `vue`, `svelte`, `astro`, `swiftui`, `react-native`, `flutter`, `html-tailwind`, `shadcn`, `jetpack-compose`, `threejs`.

### 4. Professional UI Standards (Must-Follow)
- **Icons:** Use SVG-based icons from a single consistent family (Phosphor `@phosphor-icons/react` or Heroicons `@heroicons/react`). **NEVER use emojis as structural icons.**
- **Interaction:** Min touch target of 44×44pt. Smooth press transitions (150-300ms) with scale/opacity/elevation changes; no layout shifts.
- **A11y & Contrast:** Maintain minimum contrast of 4.5:1 for normal text (3:1 for large/UI glyphs) in both light and dark mode. Support keyboard navigation and Dynamic Type resizing.
- **Grid & Spacing:** Enforce a systematic 4pt/8dp spacing scale. Keep body line-height at 1.5-1.75.

## Validation
- [ ] Has the design system been generated and saved locally using `--persist`?
- [ ] Do all colors, margins, shadows, and fonts map to MASTER.md/page tokens (no raw values)?
- [ ] Are structural icons vector-only (SVG) and from Phosphor/Heroicons (no emojis)?
- [ ] Do interactive elements have clear visual/haptic feedback on tap and hover?
- [ ] Has a contrast and safe-area check been performed in both light and dark modes?
