# UI/UX Design Brief - User Bro Diagnostic Dashboard

This document details the visual identity, colors, typography, and interactive components for the User Bro test report dashboard, conforming to the **Adoma's CHECKPOINT** brand guidelines.

---

## 1. Design Tokens & Palette

To match the Checkpoint brand, the dashboard UI elements will use the following hex colors and styles:

* **Primary Color (Red)**: `#C40001` (Used for header accents, warnings, and highlighting high frustration/failure metrics).
* **Secondary Color (Gold)**: `#FEB518` (Used for active states, warnings, and warnings/attention highlights).
* **Background Color**: `#E9EAE4` (Cream-gray backdrop for container panels and page layouts).
* **Foreground Color (Navy)**: `#020C2F` (Deep dark blue used for text and primary headings).
* **Destructive Color**: `#EF4444` (For displaying errors, failures, and JS exceptions).
* **Success Color**: `#10B981` (For displaying successful test runs and low frustration actions).

---

## 2. Typography & Copywriting

### 2.1 Fonts
- **Headings (H1, H2)**: `Pacifico`, cursive (Vibrant, approachable feel).
- **Body & Technical Info**: `Outfit`, sans-serif (Clean, readable layout).

### 2.2 Terminology & Tone
- Ensure the terminology aligns with the Checkpoint brand persona (e.g. use "Command" instead of "Order", "Checkpoint" instead of "Restaurant", "Guests" instead of "Customers").
- The reporting tone should be vibrant and direct, describing the walkthrough as a "Guest Journey" trying to complete a "Command".

---

## 3. Dashboard Component Layout

The Hybrid Dashboard report is designed as a clean, responsive Grid containing three key sections:

### 3.1 Executive Summary Card
- **Background**: White or light gray (`#FFFFFF` with `#E9EAE4` borders).
- **Border Radius**: `0.5rem` (shadcn-standard).
- **Metrics**:
  - Status Badge: Solid `#10B981` badge for `SUCCESS` or solid `#C40001` badge for `ABANDONED`.
  - Frustration peak value.
  - Duration and step counts.
  - Large button to play session video: Primary solid button (`bg-[#C40001] text-white hover:bg-[#9a0000]`) with micro-interaction transition (`transition-transform active:scale-95 duration-150`).

### 3.2 "Autopsie de la Frustration" Panel
- Visible only if frustration hits `100`.
- Styled with a light red border (`border-[#EF4444]`) and a light red background tint.
- Highlights the critical friction points where the guest journey broke down.

### 3.3 Step-by-Step Storyboard Cards
- Each step is displayed inside an Outfit-themed card with:
  - **Header**: Step number + Target action in bold Navy (`#020C2F`).
  - **Internal Monologue**: Displayed in an italic, conversational callout box.
  - **Screenshot Frame**: Bounded box with `0.5rem` border radius, showcasing the web page with a bright red (`#C40001`) annotation circle around the clicked area.
  - **Frustration Indicator**: A custom progress bar mapping current frustration:
    - `0% - 39%`: Green (`#10B981`)
    - `40% - 69%`: Gold (`#FEB518`)
    - `70% - 100%`: Red (`#C40001`)
  - **Logs Accordion**: Collapsible shadcn-like container detailing console logs (`#EF4444` if errors) and slow network requests.
