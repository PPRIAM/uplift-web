---
name: tracking-frustration-states
description: Tracks the numerical frustration gauge (0-100) based on UX frictions, network exceptions, console logs, and page load speed. Use when the user requests tracking user frustration, counting API errors, or evaluating UX friction scores.
---

# Tracking Frustration States Skill

## When to use this skill
- When monitoring user frustration levels step-by-step.
- When collecting console/network logs to evaluate page health.
- When determining if a user test should be aborted due to excessive friction.

## Workflow
1. At the start of the session, initialize frustration = 0.
2. After each action, fetch console errors using `list_console_messages` and network requests using `list_network_requests`.
3. Check if the page state or URL has changed. If the action was a click but nothing changed visually/DOM-wise, record friction.
4. Calculate frustration increments using standard weights:
   - Form validation error: +15 to +25
   - No visual change after click: +20
   - Load time > 2s: +10 per second
   - Console JS error: +30
   - Network failure (5xx): +40
   - Modals/popups blocking views: +15
   - Success / positive feedback: -15
5. Apply the persona `patience` multiplier: `increment = base_increment * (1.0 / patience)`.
6. Update the frustration gauge. If the gauge >= 100, set status to `ABANDONED`.

## Instructions
- Ensure all logs are collected asynchronously and aggregated per-step.
- Keep the frustration score bounded between 0 and 100.
