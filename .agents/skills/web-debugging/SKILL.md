---
name: debugging-web-applications
description: Systematically debug web application bugs, runtime errors, memory leaks, and performance regressions using proven root-cause analysis frameworks. Use when the user mentions a bug, error, crash, unexpected behavior, broken UI, console error, or wants to trace an issue in a web app.
---

# Web Application Debugging

## Workflow: Reproduce → Evidence → Hypothesis → Test → Fix Root Cause

### Phase 1 — Reproduce
- Can you reproduce it? (always / sometimes / random)
- Minimal reproduction steps documented
- Scope: all users/browsers/envs or specific?

### Phase 2 — Gather Evidence
- Full stack trace (DevTools Console / Sentry)
- Network tab: failed requests, status codes
- Environment: browser, OS, Node version, build hash
- Recent git changes / deployments

### Phase 3 — Hypothesize
- What changed recently? (`git log`, deploy history)
- What differs between working vs broken? (user/browser/env)
- Where could it fail? (validation → state → API → render → auth)

### Phase 4 — Test & Verify
1. Binary search — comment out half, narrow down
2. Targeted logging — trace execution flow
3. Isolate — mock dependencies, test components solo
4. `git bisect` — find regression commit

## Key Techniques
- `debugger;` statement for breakpoints
- `console.table()` / `console.time()` / `console.trace()`
- Chrome Memory → Heap Snapshots for leak detection
- React DevTools Components + Hooks panel
- Network tab filter by `preflight` for CORS

## API Error Quick Reference
| Code | Likely Cause |
|------|-------------|
| 401 | Token expired/missing |
| 403 | Insufficient permissions |
| 404 | Wrong URL / missing endpoint |
| 422 | Invalid request body |
| 500 | Server-side error — check logs |
| CORS | Missing Access-Control-Allow-Origin |

## Fix Validation
- [ ] Bug no longer reproducible
- [ ] Root cause fixed, not symptom
- [ ] Edge cases covered (null, empty, large)
- [ ] No new console warnings
- [ ] Debug logging removed from prod code
- [ ] Regression test added
