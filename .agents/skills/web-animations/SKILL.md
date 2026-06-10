---
name: adding-web-animations
description: Implement performant CSS and JS animations including transitions, keyframes, scroll-driven effects, Framer Motion, and GSAP. Use when the user mentions animation, transition, hover effect, scroll animation, loading spinner, micro-interaction, or motion design.
---

# Web Animations

## When to use
- Adding hover/click micro-interactions
- Page transitions and route animations
- Scroll-triggered reveal animations
- Loading states, skeletons, spinners
- Animating charts, counters, or data viz
- Parallax and scroll-driven effects
- Implementing Framer Motion or GSAP

## Performance Rules
1. **Only animate `transform` and `opacity`** — these skip layout/paint
2. Use `will-change` sparingly on elements about to animate
3. Prefer CSS animations over JS when possible
4. Use `requestAnimationFrame` for JS animations, never `setInterval`
5. Test on low-end devices — throttle CPU in DevTools
6. Use `prefers-reduced-motion` media query for accessibility

## CSS Techniques

**Transitions** — simple state changes:
```css
.btn { transition: transform 200ms ease, box-shadow 200ms ease; }
.btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
```

**Keyframes** — multi-step animations:
```css
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.card { animation: fadeSlideUp 0.4s ease-out both; }
```

**Staggered children:**
```css
.list > * { animation: fadeSlideUp 0.3s ease-out both; }
.list > *:nth-child(1) { animation-delay: 0ms; }
.list > *:nth-child(2) { animation-delay: 80ms; }
.list > *:nth-child(3) { animation-delay: 160ms; }
```

**Scroll-driven (CSS-native):**
```css
@keyframes reveal { from { opacity: 0; } to { opacity: 1; } }
.section { animation: reveal linear both; animation-timeline: view(); animation-range: entry 0% entry 30%; }
```

## Framer Motion (React)

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Fade-in component
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
  Content
</motion.div>

// Page transition wrapper
<AnimatePresence mode="wait">
  <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    {children}
  </motion.div>
</AnimatePresence>

// Staggered list
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(i => <motion.li key={i.id} variants={item}>{i.name}</motion.li>)}
</motion.ul>
```

## GSAP (Complex timelines)

```javascript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// Scroll-triggered reveal
gsap.from('.section', {
  scrollTrigger: { trigger: '.section', start: 'top 80%' },
  opacity: 0, y: 60, duration: 0.8, stagger: 0.15
});
```

## Accessibility
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Checklist
- [ ] Only `transform`/`opacity` animated (no `width`/`height`/`top`/`left`)
- [ ] `prefers-reduced-motion` respected
- [ ] No animation on page load blocking LCP
- [ ] Duration ≤ 400ms for micro-interactions, ≤ 800ms for reveals
- [ ] Easing uses `ease-out` for entrances, `ease-in` for exits
- [ ] Tested at 4x CPU throttle in DevTools
