---
name: using-better-ui-components
description: Queries and integrates 3,800+ offline, premium, pre-styled UI components (buttons, loaders, cards, inputs, toggle switches, forms, tooltips, checkboxes) from Uiverse Galaxy. Use when the user requests modern styling, hover effects, glassmorphic/neon aesthetics, custom forms, animated loaders, or premium components.
---

# Using Better UI Components

## When to Use
- **Visual Enhancements**: Creating premium interfaces that wow users (dark modes, vibrant neon glows, smooth gradients, HSL color palettes).
- **Interactive Elements**: Adding buttons, inputs, check boxes, or toggle switches with rich hover, focus, or click micro-animations.
- **Component Styling**: Implementing pre-styled cards, forms, tooltips, notifications, custom SVG loaders, or background patterns.
- **Speed & Control**: Rapidly styling components offline without designing custom CSS keyframes or animations from scratch.

## Search and Select Workflow
1. **Search CLI**: Execute the local search script to find matching components.
   ```powershell
   py d:\SkillsLib\.agent\skills\better-ui\scripts\search_galaxy.py -q "<query>" [-c <category>] [-t css|tailwind]
   ```
2. **Review Options**: Select a matching component from the list based on technology (Vanilla CSS vs Tailwind CSS) and size.
3. **Load Code**: Use `view_file` to read the selected `.html` file.
4. **Extract Content**: Extract the HTML template and style elements (e.g., separating the `<style>` block from structural markup).

## Integration Guide

### Integrating Vanilla CSS Components
- **HTML structure**: Paste the component's HTML structure directly into the target markup.
- **CSS classes**: Ensure any unique custom classes match the elements in the stylesheet.
- **Style sheet**: Place the rules from the `<style>` block into your project's stylesheet (e.g. `index.css` or component-specific CSS file). Remove any document-level wrappers like `margin: auto` or container center styling.

### Integrating Tailwind CSS Components
- **Direct integration**: Since Tailwind classes are inline, paste the HTML structure directly.
- **Dependencies**: Ensure the project is using Tailwind CSS. If arbitrary values (e.g. `bg-blue-500/30`, `[transform:skew(-13deg)]`) are used, verify Tailwind version supports them.

### Framework Integration (React / Next.js)
- **Class attributes**: Convert `class=` attributes to React's `className=`.
- **Self-closing tags**: Convert empty HTML tags (e.g. `<input>`, `<br>`, `<img>`) to self-closing versions.
- **SVG Attributes**: Convert inline SVG attributes to camelCase (e.g., `viewBox`, `strokeWidth`, `strokeLinecap`, `strokeLinejoin`).

## Verification Checklist
- [ ] Tabular search yields matching elements.
- [ ] Selected element matches the target styling language (Vanilla CSS vs Tailwind CSS).
- [ ] Combined HTML and CSS renders correctly in the target application.
- [ ] Component handles responsive styling (e.g. adjusts sizes on mobile viewports).
- [ ] Micro-animations and hover transitions execute smoothly.
