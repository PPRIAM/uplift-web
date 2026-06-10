# DESIGN.md

## Executive Summary

Uplift Web is a digital media platform for Haitian youth, creators, and event attendees. This document defines the **"Élan Violet"** style, a premium, modern visual system adapted from our reference design. It shifts the platform away from the previous high-density, flat editorial layout (Bricolage / Geoform, blue/cyan tones) in favor of a cohesive startup aesthetic defined by deep violet accents, rounded card structures, lavender section overlays, and clean geometric typography.

---

## Reference Design Analysis

### Visual Style
* **Aesthetic Classification**: Neo-Modern Startup / Bento Grid / Glassmorphism.
* **Base Philosophy**: Clean, high-tech, and approachable. Contrast is achieved by nesting dark containers within a light page structure, accented by a single high-chroma violet brand tone.
* **Visual Hierarchy**: Led by strong geometric headings, card containers with distinct background depths (deep charcoal vs. soft lavender), and glowing violet highlight elements.

### Layout System
* **Grid & Container Rules**: Rounded card modules (using larger `24px` to `32px` corners for main containers) are nested to organize layouts. 
* **Spacing & Rhythm**: Dynamic vertical breathing room (`96px` to `120px` margins) separates sections. Grouped information is organized in compact, staggered bento grids with `16px` to `24px` gaps.
* **Asymmetry**: Stats and pricing plans use varying heights and elevations to create visual interest. Prominent dark cards are placed side-by-side with crisp white cards.

### Typography
* **Primary / Display Typography**: Clean geometric sans-serif (**Outfit** or **Satoshi**). The display headings are bold, tracking-tight (`-0.03em`), and set in sentence-case or clean uppercase to project clarity.
* **Body / UI Typography**: Screen-optimized sans-serif (**Outfit** or **Geist**), styled with clean line heights (`1.5` to `1.6`) for reading comfort.
* **Typography Contrast**: Hierarchy is maintained using weight and scale (heavy headings paired with normal/medium subtext) rather than irregular font pairings.

### Color System
* **Brand Accents**: Vibrant Violet (`#6842FF` / `#7C3AED`) acts as the single primary interactive voice. Lavender-tinted white (`#F3F2FC` / `#F9F9FB`) is used as a section backdrop to divide content.
* **Neutrals**: Soft off-white page background (`#F8FAFC`), pure white container surfaces (`#FFFFFF`), and dark charcoal-black (`#0A0A0E` / `#0F0F15`) for high-contrast hero sheets and dark card options.
* **Contrast Compliance**: Muted colors are strictly slate-grays (`#334155`, `#64748B`) to guarantee WCAG AA contrast compliance on both light lavender and dark hero surfaces.

### Components
* **Hero Container**: A rounded dark container card (`#0A0A0E`) with an integrated translucent navigation bar, large bold headlines highlighted in violet, and concentric vector rings overlaying background graphics.
* **Buttons**: Rounded pill buttons (`9999px` radius) containing integrated arrow indicators. Hover triggers an accent background shift, scale, and subtle micro-shadow.
* **Bento Stats Grid**: Staggered white card containers floating within a larger lavender-tinted background wrapper, featuring large violet numbers.
* **Pricing / Feature Cards**: Alternating light and dark cards with `16px` rounded corners and subtle border strokes.

### UX Patterns
* **Interactive Live & Replay Feeds**: Media streams embedded inside high-contrast dark theater components to focus visual attention.
* **Structured Reservation Forms**: Minimalist form inputs with clear focus ring indicators.
* **Tiered pricing grids**: Contrast-based card hierarchy, prioritizing a "most popular" category in dark charcoal.

### Interaction Patterns
* **Hover physics**: Clean, snappy translation (`translateY(-4px)`) combined with box-shadow activation using ease-out transitions (`200ms` to `300ms`).
* **Background concentric elements**: Static or slowly spinning overlay lines that add mechanical depth behind key portraits and banners.

---

## Extracted Design Principles

1. **Integrated Container Wrappers**
   * *Purpose*: Establish containerized page layouts rather than infinite full-bleed sections.
   * *Application*: Wrap hero blocks and core sections in large, rounded cards (`24px` to `32px` radius) inset from the viewport edge.
2. **Dynamic Lavender Backdrops**
   * *Purpose*: Smoothly transition between dark and light sections.
   * *Application*: Use soft lavender surfaces (`#F3F2FC`) to house secondary content, stats, and partner rows.
3. **The Violet Focal Accent**
   * *Purpose*: Concentrate interactive action and highlights on a single brand signature.
   * *Application*: Limit primary buttons, highlights, and main numeric callouts to `#6842FF`.
4. **Typographic Neutrality**
   * *Purpose*: Shift away from heavy display fonts.
   * *Application*: Use clean, geometric Outfit and Satoshi for display headings.
5. **Dark/Light Bento Placements**
   * *Purpose*: Highlight selected choices through stark contrast.
   * *Application*: Arrange grids with a single black bento cell among white panels, or a dark pricing column among light ones.

---

## Adaptation Strategy

* **Visual Shift**: Drop the Bricolage display font and royal blue/cyan tones. Adopt a modern geometric typography scale (Outfit/Satoshi) and a Violet/Lavender/Charcoal color scheme.
* **Layout Structure**: Introduce the rounded dark card layout for the Homepage Hero. Convert the partners and statistics section into a lavender bento grid.
* **No-Emoji Rule**: Retain strict zero-emoji styling inside copy and content.

---

## Target Project Design System

### Design Tokens

```yaml
colors:
  brand-primary:      "#6842FF" # Vibrant Violet
  brand-primary-dark: "#4F2BE0" # Deep Purple
  brand-secondary:    "#A855F7" # Lavender Highlight
  brand-accent:       "#6842FF"
  brand-danger:       "#DC2626"
  brand-success:      "#15803D"
  brand-warning:      "#B45309"
  bg-base:            "#F8FAFC" # Off-white page body
  bg-surface:         "#FFFFFF"
  bg-card:            "#FFFFFF"
  bg-lavender:        "#F3F2FC" # Lavender backdrop
  bg-dark-hero:       "#0A0A0E" # Dark card background
  bg-elevated:        "#F1F5F9"
  text-primary:       "#09090E"
  text-secondary:     "#334155"
  text-muted:         "#64748B"
  text-inverse:       "#FFFFFF"
  border-subtle:      "rgba(15, 23, 42, 0.04)"
  border-default:     "rgba(15, 23, 42, 0.08)"
  border-strong:      "rgba(15, 23, 42, 0.15)"

spacing:
  xs:  "4px"
  sm:  "8px"
  md:  "16px"
  lg:  "24px"
  xl:  "32px"
  2xl: "48px"
  3xl: "80px"

radius:
  sm:        "6px"
  md:        "12px"
  card:      "16px"
  container: "24px" # Large outer containers
  pill:      "9999px"

shadows:
  shadow-sm:   "0 2px 8px rgba(15, 23, 42, 0.04)"
  shadow-md:   "0 8px 24px rgba(104, 66, 255, 0.08)"
  shadow-lg:   "0 16px 40px rgba(15, 23, 42, 0.12)"
  shadow-glow: "0 0 30px rgba(104, 66, 255, 0.15)"

typography:
  font-display: "'Outfit', 'Satoshi', sans-serif"
  font-body:    "'Outfit', 'Geist', sans-serif"
  line-height:
    tight:   "1.1"
    heading: "1.25"
    body:    "1.6"
  letter-spacing:
    display: "-0.03em"
    heading: "-0.02em"
    badge:   "0.08em"
```

---

### Components

#### 1. Header & Navigation (Navbar)
* Sticky header layout inside the hero card, using a transparent background overlay.
* Logo mark with clean geometric violet accents.

#### 2. Hero Card
* Deep charcoal card background (`#0A0A0E`), radius `24px` on desktop (collapsing to `16px` on mobile).
* Decorative concentric circle lines overlaid in the background.

#### 3. Pill Buttons
* Primary button: Background `var(--brand-primary)`, text `#FFFFFF`, fully rounded (`9999px`). Hover transitions to `var(--brand-primary-dark)`.
* Secondary button: Transparent background, border `1.5px solid var(--border-default)`, text `var(--text-primary)`.

#### 4. Bento Stats Grid
* Nested stats blocks: White cards (`16px` rounded corners) floating inside a larger lavender container (`24px` rounded corners).

---

### AI Agent Instructions

1. **Card Corner Radii**: Card elements use a border-radius of `16px` (`rounded-2xl`). Main section container cards use `24px` (`rounded-[24px]` or `rounded-3xl` on desktop).
2. **Violet Accents**: Highlight tags, numbers, and CTAs using `--brand-primary` (`#6842FF`). Do not use blue or cyan gradients.
3. **No Emojis**: Emojis are strictly banned from all headings, copy, and visual labels.
4. **Contrast**: Ensure readability by using high-contrast text (`#09090E` or white) over active surfaces.

---

### Developer Handoff Notes
* **Style Entrypoint**: Token configurations are mapped in [app/globals.css](file:///D:/UPLIFT20/uplift-web/app/globals.css).
* **Layout Check**: Run `node verify-layout.mjs` to execute E2E visual tests and generate output screenshots under `public/`.
