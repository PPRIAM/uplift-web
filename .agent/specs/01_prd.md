# 01_prd.md - Design System Redesign PRD

## 1. Objectives & Scoping
The objective of this design system overhaul is to transition the `uplift-web` application to **"Lumière d'Haïti"** (Light of Haiti)—a premium, light-themed, high-density, neo-modernist digital editorial aesthetic featuring glassmorphism and ambient elements. The goal is to enforce visual excellence, clean component structure, accessibility compliance, and strict consistency across the entire website.

### Must-Haves
- **Strict Light Mode**: All pages must adopt slate-tinted off-white page backgrounds (`#F4F6FA`) and pure white card surfaces (`#FFFFFF`). No pure dark mode pages or layout slots (except the video streaming theater viewport).
- **Glassmorphic Surface Design**: Frosted glass card structures (`rgba(255, 255, 255, 0.65)`, `backdrop-filter: blur(20px)`) with subtle borders (`rgba(15, 23, 42, 0.08)`).
- **Ambient Radial Orbs**: Soft, colored glass glowing backdrops using CSS variables to separate large hero layouts without visual clutter.
- **Consistent Tokens**: Eliminate all hardcoded HEX/RGB/HSL colors in components. Map all styles to CSS custom property tokens declared in `app/globals.css`.
- **Anti-Overrounding Enforcement**: No corner radius on cards, images, modals, or inputs may exceed `16px`. Exceptions are made only for circular avatars, pill buttons (`9999px`), and badges.
- **Solid Color Integrity**: Text gradients are forbidden. Headings and labels must use solid colors.
- **Side Stripe Elimination**: Remove all side-border decorations (e.g., thick `border-left` or `border-right` stripes greater than 1px) from highlights and sidebar states.

### Should-Haves
- **Micro-interactions**: Subtle hover state transitions on all links, buttons, and card elements. Cards should translate `translateY(-3px)` and activate soft shadows.
- **Heading Hierarchy**: Clear display typography using Hanken Grotesk / Satoshi, and body copy using Outfit / Geist.

### Nice-to-Haves
- **Fluid Layout Spacing**: Clean CSS Grid and responsive flex containers that adapt to mobile screens seamlessly.

---

## 2. User Stories
- **As an Attendee**, I want a highly readable, clean, and accessible light interface so that I can easily browse events, view speakers, and register for tickets.
- **As a Speaker**, I want a professional, editorial-style presentation of my profile and details so that I feel represented in a premium visual light.
- **As a Developer/AI Coding Agent**, I want a clear, documented design system with zero hardcoded styling violations so that I can maintain visual consistency.
