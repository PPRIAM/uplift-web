# UI/UX Design Brief - Ticket Currency & Automatic Ticket Creation

## 1. Visual Token Alignment
The design must strictly adhere to the neo-brutalist styling system used throughout the dashboard:
- **Borders**: `2px solid var(--border-default)` or standard input field outlines.
- **Shadows**: Strong black drop shadows (`box-shadow: 4px 4px 0px 0px #000;`) for highlighted interactive controls.
- **Typography**: Display fonts (Inter/Outfit) with extra bold weights (800/900) for headers.
- **Color Accents**:
  - Selected state: Light purple/blue tint (`rgba(108,71,255,0.1)`) or standard brand primary background.
  - Error state: High-contrast red (`var(--brand-danger)` / `rgb(239, 68, 68)`).

## 2. Currency Selector UI Element
Instead of a generic select dropdown, we will implement a side-by-side **Neo-brutalist Segmented Toggle** for the currency choice:

```
+------------------------------------+
| Devise                             |
| +----------------+---------------+ |
| |     USD ($)    |  HTG (Gourdes)| |
| +----------------+---------------+ |
+------------------------------------+
```

### Visual Specifications
- **Container**: Flexbox layout, split 50/50.
- **Normal state**: Transparent background, `1px solid var(--border-subtle)` border, dark text.
- **Selected state**: Brand background (or `rgba(108,71,255,0.12)`), `2px solid var(--brand-primary)` border, bold text.
- **Hover state**: Subtle scaling or background tint animation.

## 3. Form Grid Layout (Ticket Modal)
We will adjust the middle section of the modal to a clean **Three-Column Grid** on desktop/tablet to align inputs horizontally:
1. **Prix (Price)**: Input type `number`, left column.
2. **Devise (Currency)**: Custom segmented toggle button group, middle column.
3. **Quantité (Quantity)**: Input type `number`, right column.

```
+-------------------+-------------------+-------------------+
| Prix              | Devise            | Quantité          |
| [ 1500          ] | [ USD ] [  HTG *] | [ 100           ] |
+-------------------+-------------------+-------------------+
```

## 4. Public Pricing Labels Formatting
- **Standard Tickets**:
  - E.g., `Gratuit` (green, bold).
  - E.g., `$15` or `1 500 HTG` (with non-breaking spaces before currency suffix).
- **Variations (Pricing Tiers)**:
  - If standard ticket price is 0 but pricing tiers exist, show `À partir de $X` or `À partir de X HTG` where X is the lowest tier price.
