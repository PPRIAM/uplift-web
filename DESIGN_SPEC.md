# DESIGN_SPEC.md — Ayibuzz Media Redesign Specification

## 1. Design Direction & Core Philosophy

Ayibuzz Media is reimagined as an interactive cultural beacon—a digital town square where Haitian heritage meets cutting-edge streaming media. The design balances the depth of a dark theater mode (for live broadcasts and videos) with high-contrast, editorial dawn sheets (for ticketing and speaker applications), reflecting the transition from night-life gatherings to morning community building. By combining a sunlit amber energy with rich dark obsidian surfaces, the UI avoids dry corporate conventions, delivering an inspiring, high-agency portal engineered specifically for the vibrant energy of Haitian youth, both locally and in the diaspora.

---

## 2. Design Tokens & Visual Hierarchy

### Color Palette
* **Obsidian Night (Base Dark)**: `#08090E` — The primary canvas for theater, video streams, and premium header zones. Establishes deep depth.
* **Lavender Dawn (Base Light)**: `#F5F6FA` — The high-contrast, editorial sheet background for ticket sales, schedules, and application forms.
* **Sunlit Amber (Brand Primary)**: `#FFAC00` — High-chroma energy representing the "Briye ansanm" (Shine together) spirit. Used for primary interactive triggers and key highlights.
* **Electric Indigo (Brand Secondary)**: `#5A45FF` — Digital accent color connecting the platform to modern web and technology paradigms.
* **Crimson Flare (Accent/Alert)**: `#E11D48` — High-contrast alert state and cultural nod to the patriotic Haitian flag, refined for modern UI.

### Typography
* **Display Font**: `Satoshi` (or `Outfit` fallback) — Tracked tight at `-0.03em`, heavy weights (`700`, `900`) for large, confident headers. Case: Sentence-case or selective tracking-tight uppercase.
* **Body Font**: `Geist` (or `Outfit` fallback) — Highly readable screen-optimized sans-serif with a spacious line-height of `1.6` and letter-spacing of `-0.01em` to maximize legibility across mobile displays.

### Spacing Scale
* `4px` (xxs) — Micro-gaps, badge padding.
* `8px` (xs) — Input-to-label spacing, tight button padding.
* `12px` (sm) — Nested elements inside card components.
* `16px` (md) — Card internal padding, grid column gaps.
* `24px` (lg) — Standard desktop container margins, section sub-gaps.
* `48px` (xl) — Major grid gaps, margins between component blocks.
* `96px` (xxl) — Breathing room between key sections on desktop (collapses to `48px` on mobile).

### Border Radius
* `8px` (`rounded-lg`) — Active interactive nodes: inputs, small action buttons, tag badges.
* `16px` (`rounded-2xl`) — Individual content units: speaker cards, live stream players, ticket options.
* `28px` (`rounded-[28px]`) — Outer structural frames: hero wrapper, main page content containers, multi-card outer wrappers.

---

## 3. Justified Aesthetic Risk: "L'Axe du Soleil" (The Solar Spine)

**The Risk**: Breaking standard symmetrical grid alignment by introducing a prominent, asymmetrical vertical column on desktop—a literal "spine" that pins to the screen. 

**Justification**: Most event and media platforms use standard centered layouts or basic left/right splits that feel formulaic. The Solar Spine functions as a visual anchor that connects the sticky navigation directly to the viewport scroll. As the user scrolls, a glowing amber line tracks their progress, turning into a live status indicator (e.g., green pulse if a stream is live, amber if tickets are selling fast). This reinforces the concept of "Leve ansanm, Briye ansanm" (Rising and shining together) through a physical, vertical structural element.

---

## 4. The Signature Element: The Dynamic Status Spine

The redesign will be instantly recognized by this interactive visual spine. It acts as both a progress indicator and a live feed hub. When an event is broadcasting, the spine shifts colors, pulsating with active wave patterns. When reservations are open, it morphs into an absolute-positioned vertical timeline displaying real-time booking counters.

---

## 5. Layout Wireframes (ASCII)

### 5.1 Navigation & Sticky Header (Obsidian Dark Theme)
```text
+--------------------------------------------------------------------------------------------------+
|  [AYIBUZZ]                    [Live Feed]    [Speakers]    [Tickets]               ( RESERVER )  |
|  Logo: Amber/White            Link           Link          Link                    Pill Button   |
+--------------------------------------------------------------------------------------------------+
```

### 5.2 Hero Section (Dark Theater View)
```text
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   LEVE ANSANM, BRIYE ANSANM.                                                                     |
|   [ The Digital Center Stage for Haitian Creators & Speakers ]                                   |
|                                                                                                  |
|   +-------------------------------------------------------------+   +------------------------+   |
|   |                                                             |   | UPCOMING EVENT         |   |
|   |                        [VIDEO STREAM]                       |   | Gonaïves Tech Summit   |   |
|   |                       Active Stream Or                      |   | June 15, 2026          |   |
|   |                       Keynote Teaser                        |   |                        |   |
|   |                                                             |   | [ GET TICKET (AMBER) ] |   |
|   +-------------------------------------------------------------+   +------------------------+   |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

### 5.3 Content Section: Speakers & Events Bento (Dawn Theme)
```text
+--------------------------------------------------------------------------------------------------+
|  SPEAKERS & INFLUENCERS                                                 [ Submit Application + ] |
|                                                                                                  |
|  +-----------------------------+  +-----------------------------------------------------------+  |
|  | SPEAKER PROFILE             |  | SELECTED KEYNOTE DETAILS                                  |  |
|  | [Image: Portrait Grid]      |  | "Building Haitian Tech Ecosystems from the Ground Up"     |  |
|  |                             |  |                                                           |  |
|  | Jean-Baptiste Pierre        |  | A detailed session exploring localized software           |  |
|  | Founder, TechHaiti          |  | infrastructure and edge data storage.                     |  |
|  +-----------------------------+  +-----------------------------------------------------------+  |
|                                                                                                  |
|  +-----------------------------------------------------------+  +-----------------------------+  |
|  | EVENT SCHEDULE                                            |  | TICKET SALES                |  |
|  | 09:00 AM — Opening Keynote                                |  | Standard Pass: $10 USD      |  |
|  | 11:30 AM — Local Creators Panel                           |  | VIP Supporter: $50 USD      |  |
|  +-----------------------------------------------------------+  +-----------------------------+  |
+--------------------------------------------------------------------------------------------------+
```

### 5.4 Footer (Obsidian Theme)
```text
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   AYIBUZZ MEDIA                                       "Leve ansanm, Briye ansanm."               |
|                                                                                                  |
|   Platform            Community           Legal                                                  |
|   - Live Streams      - Speakers          - Privacy Policy                                       |
|   - Tickets           - Gonaïves Hub      - Terms of Service                                     |
|                                                                                                  |
|   © 2026 Ayibuzz Media. All rights reserved.                                                     |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```
