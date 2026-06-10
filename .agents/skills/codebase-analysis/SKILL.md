---
name: analyzing-codebase-quality
description: Analyze codebase structure, complexity, architecture patterns, error handling, and code health across a web project. Use when the user asks to analyze code quality, review error handling, assess tech debt, understand codebase structure, analyze patterns, or wants a comprehensive health assessment of their application.
---

# Codebase Quality Analysis

## 5 Dimensions
| Dimension | Key Question |
|-----------|-------------|
| Correctness | Edge cases handled? Tests passing? |
| Maintainability | Easy to change? Clear abstractions? |
| Resilience | Fails gracefully? Errors surfaced? |
| Scalability | Handles load? Patterns extensible? |
| Observability | Can you debug prod issues? |

## Phase 1 — Structure
- Feature-based folders preferred for large apps
- `npx madge --circular src/` to detect circular deps
- Red flags: business logic in UI, copy-pasted utils, no barrel exports

## Phase 2 — Error Handling
- [ ] All async functions have try/catch or error boundary
- [ ] Errors typed (not `catch(e: any)`)
- [ ] User-friendly messages at UI layer, raw errors only in logs
- [ ] Stack traces never leak to clients (500s say "Internal error")
- [ ] Unhandled promise rejections caught globally
- [ ] Validation errors return 400, not 500

**Preferred pattern:** Result type `{ success, data } | { success, error }` over throw/catch.

## Phase 3 — Complexity
```bash
npx ts-complexity src/**/*.ts --max-complexity 10
```
| Metric | OK | Refactor |
|--------|----|----------|
| Function lines | < 30 | > 50 |
| Cyclomatic complexity | < 5 | > 10 |
| Nesting depth | < 3 | > 4 |
| Parameters | < 4 | > 5 |

## Phase 4 — API Consistency
- Nouns for resources, correct HTTP methods
- Consistent envelopes: `{ data }` / `{ error: { message, code } }`
- Pagination, versioning, input validation on all endpoints

## Phase 5 — Testing
```bash
npx jest --coverage --coverageReporters=text-summary
```
| Layer | Target |
|-------|--------|
| Utils | 90%+ |
| Services | 80%+ |
| API handlers | 70%+ |
| UI Components | 60%+ |

## Phase 6 — Observability
- [ ] Structured JSON logs (Pino/Winston)
- [ ] Log levels correct (debug/info/warn/error)
- [ ] No PII in logs
- [ ] Request IDs for tracing
- [ ] Error monitoring connected (Sentry/Datadog)

## Report Format
```
# Health Score — [Project]
| Dimension | Score /10 | Notes |
## Critical Issues (file, problem, fix)
## Tech Debt Backlog (impact/effort prioritized)
## Recommended Next Steps
```

## Checklist
- [ ] All 5 dimensions assessed
- [ ] Complexity metrics measured
- [ ] Test coverage analyzed
- [ ] Tech debt backlog prioritized
- [ ] Report delivered with scores
