---
name: extracting-ui-ux-from-images
description: Extracts visual design tokens, layout architecture, typography, color palettes, and interactive components from mockups, wireframes, screenshots, or hand-drawn sketches. Use when analyzing design inputs, migrating screenshots to code, or matching a specific UI reference.
---

# Extracting UI/UX from Images

Enables systematic deconstruction of visual designs (mockups, screenshots, wireframes, hand-drawn sketches) into high-fidelity code (HTML/CSS/Tailwind) and robust design systems.

## When to Use
- **Image-to-Code Migrations:** Recreating a premium website, landing page, or dashboard from a screenshot.
- **Design Reference Alignment:** Extracting color systems, font pairings, or layout structures from reference images.
- **Sketch/Wireframe Bootstrapping:** Converting a rough wireframe or napkin sketch into a functional web page.
- **Competitor Design Audit:** Deconstructing competitive UI components to analyze layout and spacing.

## Workflow
1. **Layout Decomposition:** Identify the visual layout structure, responsive grids, and container alignments.
2. **Design Tokens Extraction:** Isolate core brand hex colors, typographic hierarchies, shadows, and spacing scales.
3. **Component Identification:** Catalog every visual element, button, form input, modal, and stateful indicator.
4. **Synthesize Specifications:** Generate a standardized Markdown extraction report and map it to reusable code.
5. **Quality Review:** Validate the output code against the source image for exact structural and aesthetic match.

## Instructions

### 1. Structural Layout Decomposition
Examine the image from outer containers to inner nodes. Identify:
- **Core Grid/Flex model:** (e.g. Bento grid, 12-column grid, sidebar layout, center-card modal).
- **Alignment & Constraints:** Note absolute positions, responsive wrappers, vertical/horizontal alignment, and spacing proportions.

### 2. Design Token Harvesting
Actively extract CSS/Tailwind design tokens from the visual representation:
- **Colors (HEX):** Extract exact codes using a digital color picker or relative analysis:
  - Backgrounds: Body (`--color-background`), Cards, Panels, Modals.
  - Brand & Semantics: Primary (`--color-primary`), Secondary, Accent/CTA (`--color-accent`), Destructive.
  - Text & Borders: Foreground (`--color-foreground`), Muted text, Border (`--color-border`), Ring.
- **Typography:** Map font pairing style (serif/sans-serif), type scale sizes, line-heights, letter spacing, and weights (bold, medium, light).
- **Effects:** Identify shadow levels (subtle/pronounced), blur, border-radii (rounded/sharp), and glassmorphism.

### 3. Component & Interaction Inventory
Create a structured directory of all visual components:
- **Buttons & Inputs:** Map custom styles for primary, secondary, and tertiary items. Note states (hover, focus, disabled).
- **Icons & Graphics:** Identify icon categories (Lucide, Heroicons, Phosphor) and image mockups. **NEVER use emojis as structural icons.**
- **Affordances:** Detail subtle visual cues indicating interactivity (dropdown indicators, hover-trigger states).

### 4. Report & Code Synthesis
Synthesize the extracted specs into a premium, clean layout.
- Report output must contain:
  1. **Visual Style Description:** Aesthetic mood, complexity, grid model.
  2. **Tailwind / CSS Design Tokens:** Ready-to-copy stylesheet variables.
  3. **Page/Component Blueprint:** Detailed HTML structure and CSS bindings.
  4. **Avoid List:** Anti-patterns seen in the screenshot that degrade quality.
- Write modern, semantic markup with exact styling matching the reference.

## Validation
- [ ] Has the layout grid (Bento, 12-column, flex container) been mapped correctly?
- [ ] Are all color codes extracted as valid Hex colors?
- [ ] Is the typographic pairing and CSS type scale explicitly specified?
- [ ] Are all interactive components and their states cataloged?
- [ ] Does the synthesized code avoid generic defaults and use premium styling matching the image?
- [ ] Are all icons vector-based (SVG) rather than static emojis?
