# 04_design_brief.md - UI/UX Design Brief

This design brief specifies the visual system, style guide, tokens, and component guidelines for the **Lumière d'Haïti** theme.

---

## 1. Design Tokens

### Color Palette
- **Interactive Primary**: `--brand-primary: #2d5bff` (Royal Blue)
- **Interactive Primary Dark**: `--brand-primary-dark: #1a40d4`
- **Vitality Accent**: `--brand-secondary: #0e7490` (Teal-Cyan)
- **Soft Glow Blue**: `--brand-accent: #3b82f6`
- **Danger Red**: `--brand-danger: #dc2626`
- **Success Green**: `--brand-success: #15803d`
- **Warning Gold**: `--brand-warning: #b45309`

### Neutral Backgrounds & Surfaces
- **Base Canvas**: `--bg-base: #f4f6fa` (Slate-tinted Off-White)
- **Container Surfaces**: `--bg-surface: #ffffff` (Pure White)
- **Elevated Canvas**: `--bg-elevated: #eef2f6` (Light slate gray-blue)
- **Muted Grays**: `--bg-muted: #cbd5e1`

### Text & Contrast Hierarchy
- **Primary Body/Headers**: `--text-primary: #0f172a` (Deep Slate - WCAG contrast ratio 19:1 against white)
- **Secondary Details**: `--text-secondary: #334155` (Slate Gray)
- **Muted/Metadata Text**: `--text-muted: #64748b` (Muted Slate)
- **Inverted Labels**: `--text-inverse: #ffffff` (Pure White)

### Borders & Shadows
- **Subtle border**: `--border-subtle: rgba(15, 23, 42, 0.04)` (for layout containers and cards at rest)
- **Default border**: `--border-default: rgba(15, 23, 42, 0.08)` (for form inputs and dividers)
- **Strong border**: `--border-strong: rgba(15, 23, 42, 0.15)`
- **Glass Card border**: `rgba(15, 23, 42, 0.08)`
- **Elevation Shadows (Hover)**:
  - `--shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.04)`
  - `--shadow-md: 0 4px 12px rgba(15, 23, 42, 0.08)`
  - `--shadow-lg: 0 12px 40px rgba(15, 23, 42, 0.12)`
  - `--shadow-glow: 0 0 30px rgba(45, 91, 255, 0.15)`

### Spacing & Grid System
- **Scale**: Multiples of 4px/8px:
  - `xs`: 4px
  - `sm`: 8px
  - `md`: 16px
  - `lg`: 24px
  - `xl`: 32px
  - `2xl`: 48px
  - `3xl`: 80px
- **Layout Capping**: Max-width is `1280px` (`max-w-7xl`), nested cards are prohibited.

### Typography
- **Display Headings**: Satoshi / Hanken Grotesk / Outfit (`font-display`). Letter-spacing `-0.03em`. Solid slate-tinted colors only.
- **Body & Controls**: Outfit / Geist (`font-body`). Line-height `1.6`. Regular (`400`) and semibold (`600`) weights.
- **Badges / Tracked Text**: Letter-spacing `0.08em` (`uppercase`).

---

## 2. Component Design Rules

### A. Glassmorphic Cards
- **Normal State**:
  - `background: rgba(255, 255, 255, 0.65)`
  - `backdrop-filter: blur(20px)`
  - `border: 1px solid rgba(15, 23, 42, 0.08)`
  - `border-radius: 16px` (Strict maximum cap, never exceed `rounded-2xl` / 16px)
  - `box-shadow: none` (Zero shadow at rest)
- **Hover State**:
  - `transform: translateY(-3px) scale(1.005)`
  - `box-shadow: var(--shadow-md)` (Activated only on hover)
  - `border-color: rgba(45, 91, 255, 0.15)`

### B. Form Inputs
- **Normal State**:
  - `background: rgba(15, 23, 42, 0.02)`
  - `border: 1.5px solid var(--border-default)`
  - `border-radius: 12px` (Capped at 12px)
- **Focus State**:
  - `border-color: var(--brand-primary)`
  - `background: rgba(45, 91, 255, 0.04)`
  - `box-shadow: 0 0 0 3px rgba(45, 91, 255, 0.12)`

### C. Buttons (Primary & Secondary)
- **Primary**: Pill shape (`9999px`), background `var(--brand-primary)`, white text, inset SVG arrow. Hover translates it up `2px` with a soft glow shadow.
- **Secondary**: Pill shape (`9999px`), transparent background, border `2px solid var(--border-default)`. Hover translates it up `2px` and shifts border to `var(--brand-secondary)`.

---

## 3. Motion & Transition System
- **Durations**: `150ms` (for micro-interactions like badges or input borders) to `300ms` (for card movements, modals, and list collapses).
- **Physics**: Transitions must use `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo) for responsive performance.
- **Accessibility**: Include standard media query overrides to disable all animations under `prefers-reduced-motion: reduce`.
